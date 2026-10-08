import { randomUUID } from "node:crypto";
import { FieldValue, Timestamp, type DocumentSnapshot, type Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { ApiError } from "@/services/api/serverAuth";
import { resolveTelegramUid, telegramUserIdSchema } from "@/modules/integrations/telegram/telegramIntegrationService";
import { createIdempotencyFingerprint, createIdempotencyRef, readIdempotentResult, writeIdempotencyResult } from "@/modules/integrations/core/idempotency";
import { calculateBattery, createInitialSaludData } from "@/modules/health/domain/healthCalculations";
import { ActividadesQuemadas, calcularCaloriasQuemadas } from "@/modules/health/domain/deficitCalorico";
import { getHabitPeriodStatus, type HabitFrequency } from "@/modules/health/habitPeriod";
import {
  activityListSchema,
  healthActivityIntegrationSchema,
  healthCheckInIntegrationSchema,
  healthHabitCheckIntegrationSchema,
  healthWaterIntegrationSchema,
  healthWeightIntegrationSchema
} from "@/modules/health/schemas/healthSchemas";

const dayRef = (db: Firestore, uid: string, day: string) => db.doc(`users/${uid}/salud_diaria/${day}`);
const userRef = (db: Firestore, uid: string) => db.doc(`users/${uid}`);
const profileRef = (db: Firestore, uid: string) => db.doc(`users/${uid}/perfilFisico/config`);
const habitsCollection = (db: Firestore, uid: string) => db.collection(`users/${uid}/habitos`);
const weightsCollection = (db: Firestore, uid: string) => db.collection(`users/${uid}/peso`);

type DailyHealth = ReturnType<typeof createInitialSaludData> & Record<string, any>;
type HealthActivity = { id: string | number; tipo: keyof typeof ActividadesQuemadas; minutos: number; calorias: number };
type HealthDay = { fecha?: string; habitosChecks?: string[] };

function parseDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate();
  return null;
}

export function getHealthLocalDay(date: Date = new Date(), timeZone = process.env.LIFE_OS_TIME_ZONE || "America/Guayaquil"): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateForDay(day: string): Date {
  return new Date(`${day}T12:00:00.000Z`);
}

function parsePayload<T>(schema: z.ZodType<T>, input: unknown): { telegramUserId: string; payload: T } {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ApiError("Datos inválidos.", 400);
  const record = input as Record<string, unknown>;
  const telegramResult = telegramUserIdSchema.safeParse(record.telegramUserId);
  if (!telegramResult.success) throw new ApiError("telegramUserId no es válido.", 400);
  const payloadRecord = { ...record };
  delete payloadRecord.telegramUserId;
  const parsed = schema.safeParse(payloadRecord);
  if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Datos inválidos.", 400);
  return { telegramUserId: telegramResult.data, payload: parsed.data as T };
}

function serializeDaily(data: DailyHealth, habits: Array<{ id: string; name: string; frequency: HabitFrequency; completed: boolean; periodLabel: string }>) {
  const activities = Array.isArray(data.deficitCalorico?.actividades) ? data.deficitCalorico.actividades : [];
  const exerciseMinutes = activities.length
    ? activities.reduce((sum: number, activity: { minutos?: number }) => sum + (Number(activity.minutos) || 0), 0)
    : Number(data.ejercicioMinutos) || 0;
  return {
    date: data.fecha,
    water: Number(data.agua) || 0,
    exerciseMinutes,
    sleepHours: Number(data.suenoHoras) || 0,
    sleepQuality: data.calidadSueno || null,
    mood: data.animo || null,
    stress: Number.isFinite(data.estres) ? data.estres : null,
    battery: Number.isFinite(data.bateria) ? data.bateria : null,
    habits,
    habitsCompleted: habits.filter((habit) => habit.completed).length,
    habitsPending: habits.filter((habit) => !habit.completed).length
  };
}

async function readProfile(db: Firestore, uid: string) {
  const [userSnapshot, profileSnapshot] = await Promise.all([userRef(db, uid).get(), profileRef(db, uid).get()]);
  const userData = userSnapshot.data() || {};
  return {
    plan: userData.plan,
    profile: { ...(userData.physicalProfile || {}), ...(profileSnapshot.data() || {}) } as Record<string, unknown>
  };
}

async function readLatestWeight(db: Firestore, uid: string, profile: Record<string, unknown>) {
  const snapshot = await weightsCollection(db, uid).get();
  const entries = snapshot.docs.map((item) => ({
    id: item.id,
    weight: Number(item.data().peso),
    date: parseDate(item.data().timestamp)
  })).filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0 && entry.date).sort((a, b) => b.date!.getTime() - a.date!.getTime());
  const latest = entries[0];
  return {
    currentWeight: latest?.weight ?? (Number.isFinite(profile.peso) ? Number(profile.peso) : null),
    lastWeightDate: latest?.date?.toISOString() || null,
    entries
  };
}

async function readActiveHabits(db: Firestore, uid: string, history: HealthDay[], day: string) {
  const habitsSnapshot = await habitsCollection(db, uid).get();
  return habitsSnapshot.docs.filter((item) => item.data().activo !== false).map((item) => {
    const data = item.data();
    const frequency = data.frecuencia as HabitFrequency;
    if (!["Diario", "Semanal", "Mensual"].includes(frequency)) throw new ApiError("Un hábito tiene una frecuencia inválida.", 409);
    const status = getHabitPeriodStatus(item.id, frequency, history, dateForDay(day));
    return {
      id: item.id,
      name: String(data.nombre || "Hábito"),
      frequency,
      completed: status.completed,
      periodLabel: frequency === "Semanal" ? "Esta semana" : frequency === "Mensual" ? "Este mes" : "Hoy"
    };
  });
}

export async function getHealthContext(db: Firestore, telegramUserIdInput: unknown) {
  const { firebaseUid } = await resolveTelegramUid(db, telegramUserIdInput);
  const day = getHealthLocalDay();
  const [dailySnapshot, historySnapshot, profileData] = await Promise.all([
    dayRef(db, firebaseUid, day).get(),
    db.collection(`users/${firebaseUid}/salud_diaria`).get(),
    readProfile(db, firebaseUid)
  ]);
  const daily = { ...createInitialSaludData(), ...(dailySnapshot.data() || {}), fecha: day } as DailyHealth;
  const history = historySnapshot.docs.map((item) => item.data() as HealthDay);
  const habits = await readActiveHabits(db, firebaseUid, history, day);
  const weight = await readLatestWeight(db, firebaseUid, profileData.profile);
  return {
    today: serializeDaily(daily, habits),
    profile: { currentWeight: weight.currentWeight, targetWeight: Number.isFinite(profileData.profile.pesoObjetivo) ? Number(profileData.profile.pesoObjetivo) : null, lastWeightDate: weight.lastWeightDate }
  };
}

export async function getHealthSummary(db: Firestore, telegramUserIdInput: unknown) {
  const context = await getHealthContext(db, telegramUserIdInput);
  return {
    date: context.today.date,
    water: context.today.water,
    exerciseMinutes: context.today.exerciseMinutes,
    sleepHours: context.today.sleepHours,
    sleepQuality: context.today.sleepQuality,
    mood: context.today.mood,
    stress: context.today.stress,
    battery: context.today.battery,
    habits: { completed: context.today.habitsCompleted, pending: context.today.habitsPending, total: context.today.habits.length },
    weight: context.profile.currentWeight,
    lastWeightDate: context.profile.lastWeightDate
  };
}

function fingerprint(operation: string, telegramUserId: string, payload: unknown): string {
  return createIdempotencyFingerprint(JSON.stringify({ operation, telegramUserId, payload }));
}

function currentDaily(snapshot: DocumentSnapshot): DailyHealth {
  return { ...createInitialSaludData(), ...(snapshot.data() || {}) } as DailyHealth;
}

export async function updateHealthWater(db: Firestore, input: unknown) {
  const { telegramUserId, payload } = parsePayload(healthWaterIntegrationSchema, input);
  const { firebaseUid } = await resolveTelegramUid(db, telegramUserId);
  const day = getHealthLocalDay();
  const ref = dayRef(db, firebaseUid, day);
  const idemRef = createIdempotencyRef(db, telegramUserId, payload.idempotencyKey);
  const operationFingerprint = fingerprint("health-water", telegramUserId, payload);
  return db.runTransaction(async (tx) => {
    const dailySnapshot = await tx.get(ref);
    const idemSnapshot = idemRef ? await tx.get(idemRef) : null;
    const replay = readIdempotentResult<typeof result>(idemSnapshot, operationFingerprint);
    if (replay) return replay;
    const current = currentDaily(dailySnapshot);
    const amount = payload.amount ?? 1;
    if (payload.action !== "SET" && amount < 1) throw new ApiError("amount debe ser mayor que cero.", 400);
    const water = payload.action === "SET" ? amount : payload.action === "ADD" ? current.agua + amount : current.agua - amount;
    if (water < 0 || water > 20) throw new ApiError("El agua debe mantenerse entre 0 y 20 vasos.", 409);
    const result = { ok: true, date: day, water };
    tx.set(ref, { fecha: day, agua: water, bateria: calculateBattery({ ...current, agua: water }), lastUpdate: FieldValue.serverTimestamp() }, { merge: true });
    writeIdempotencyResult(tx, idemRef, operationFingerprint, result, FieldValue.serverTimestamp());
    return result;
  });
}

export async function updateHealthCheckIn(db: Firestore, input: unknown) {
  const { telegramUserId, payload } = parsePayload(healthCheckInIntegrationSchema, input);
  const { firebaseUid } = await resolveTelegramUid(db, telegramUserId);
  const day = getHealthLocalDay();
  const ref = dayRef(db, firebaseUid, day);
  const idemRef = createIdempotencyRef(db, telegramUserId, payload.idempotencyKey);
  const operationFingerprint = fingerprint("health-check-in", telegramUserId, payload);
  return db.runTransaction(async (tx) => {
    const dailySnapshot = await tx.get(ref);
    const idemSnapshot = idemRef ? await tx.get(idemRef) : null;
    const replay = readIdempotentResult<typeof result>(idemSnapshot, operationFingerprint);
    if (replay) return replay;
    const current = currentDaily(dailySnapshot);
    const updates = {
      ...(payload.sleepHours === undefined ? {} : { suenoHoras: payload.sleepHours }),
      ...(payload.sleepQuality === undefined ? {} : { calidadSueno: payload.sleepQuality }),
      ...(payload.mood === undefined ? {} : { animo: payload.mood }),
      ...(payload.stress === undefined ? {} : { estres: payload.stress })
    };
    const result = { ok: true, date: day, checkIn: { sleepHours: payload.sleepHours ?? current.suenoHoras, sleepQuality: payload.sleepQuality ?? current.calidadSueno, mood: payload.mood ?? current.animo, stress: payload.stress ?? current.estres } };
    tx.set(ref, { fecha: day, ...updates, bateria: calculateBattery({ ...current, ...updates }), lastUpdate: FieldValue.serverTimestamp() }, { merge: true });
    writeIdempotencyResult(tx, idemRef, operationFingerprint, result, FieldValue.serverTimestamp());
    return result;
  });
}

export async function addHealthActivity(db: Firestore, input: unknown) {
  const { telegramUserId, payload } = parsePayload(healthActivityIntegrationSchema, input);
  const { firebaseUid } = await resolveTelegramUid(db, telegramUserId);
  const profileData = await readProfile(db, firebaseUid);
  const weight = await readLatestWeight(db, firebaseUid, profileData.profile);
  const activity = { id: randomUUID(), tipo: payload.type as keyof typeof ActividadesQuemadas, minutos: payload.minutes, calorias: calcularCaloriasQuemadas(payload.type as keyof typeof ActividadesQuemadas, payload.minutes, Number(weight.currentWeight) || 0) };
  const day = getHealthLocalDay();
  const ref = dayRef(db, firebaseUid, day);
  const idemRef = createIdempotencyRef(db, telegramUserId, payload.idempotencyKey);
  const operationFingerprint = fingerprint("health-activity", telegramUserId, payload);
  return db.runTransaction(async (tx) => {
    const dailySnapshot = await tx.get(ref);
    const idemSnapshot = idemRef ? await tx.get(idemRef) : null;
    const replay = readIdempotentResult<typeof result>(idemSnapshot, operationFingerprint);
    if (replay) return replay;
    const current = currentDaily(dailySnapshot);
    const existing = activityListSchema.safeParse(current.deficitCalorico?.actividades || []);
    if (!existing.success) throw new ApiError("El registro de actividades necesita revisión.", 409);
    const activities = [...existing.data, activity] as HealthActivity[];
    const calories = activities.reduce((sum, item) => sum + item.calorias, 0);
    const result = { ok: true, date: day, activity, exerciseMinutes: activities.reduce((sum, item) => sum + item.minutos, 0), estimatedCalories: calories };
    const nextDeficit = { ...(current.deficitCalorico || {}), actividades: activities, caloriasQuemadas: calories, balance: (Number(current.caloriasTotales) || 0) - calories };
    tx.set(ref, { fecha: day, deficitCalorico: nextDeficit, ejercicioMinutos: result.exerciseMinutes, bateria: calculateBattery({ ...current, deficitCalorico: nextDeficit }), lastUpdate: FieldValue.serverTimestamp() }, { merge: true });
    writeIdempotencyResult(tx, idemRef, operationFingerprint, result, FieldValue.serverTimestamp());
    return result;
  });
}

export async function listHealthHabits(db: Firestore, telegramUserIdInput: unknown) {
  const { firebaseUid } = await resolveTelegramUid(db, telegramUserIdInput);
  const day = getHealthLocalDay();
  const historySnapshot = await db.collection(`users/${firebaseUid}/salud_diaria`).get();
  return { date: day, habits: await readActiveHabits(db, firebaseUid, historySnapshot.docs.map((item) => item.data() as HealthDay), day) };
}

export async function checkHealthHabit(db: Firestore, input: unknown) {
  const { telegramUserId, payload } = parsePayload(healthHabitCheckIntegrationSchema, input);
  const { firebaseUid } = await resolveTelegramUid(db, telegramUserId);
  const day = getHealthLocalDay();
  const dailyRef = dayRef(db, firebaseUid, day);
  const habitRef = habitsCollection(db, firebaseUid).doc(payload.habitId);
  const idemRef = createIdempotencyRef(db, telegramUserId, payload.idempotencyKey);
  const operationFingerprint = fingerprint("health-habit-check", telegramUserId, payload);
  return db.runTransaction(async (tx) => {
    const [habitSnapshot, dailySnapshot, historySnapshot, idemSnapshot] = await Promise.all([tx.get(habitRef), tx.get(dailyRef), tx.get(db.collection(`users/${firebaseUid}/salud_diaria`)), idemRef ? tx.get(idemRef) : Promise.resolve(null)]);
    const replay = readIdempotentResult<typeof result>(idemSnapshot, operationFingerprint);
    if (replay) return replay;
    if (!habitSnapshot.exists) throw new ApiError("El hábito no existe o no pertenece al usuario.", 404);
    const habit = habitSnapshot.data()!;
    if (habit.activo === false) throw new ApiError("El hábito está archivado.", 409);
    const frequency = habit.frecuencia as HabitFrequency;
    if (!["Diario", "Semanal", "Mensual"].includes(frequency)) throw new ApiError("La frecuencia del hábito no es válida.", 409);
    const history = historySnapshot.docs.map((item) => item.data() as HealthDay);
    const status = getHabitPeriodStatus(payload.habitId, frequency, history, dateForDay(day));
    const current = currentDaily(dailySnapshot);
    const checks = Array.isArray(current.habitosChecks) ? current.habitosChecks : [];
    const alreadyToday = checks.includes(payload.habitId);
    const changed = !status.completed;
    const result = { ok: true, date: day, habit: { id: payload.habitId, name: String(habit.nombre || "Hábito"), frequency, completed: true, periodLabel: frequency === "Semanal" ? "Esta semana" : frequency === "Mensual" ? "Este mes" : "Hoy" }, changed };
    if (changed && !alreadyToday) {
      const nextChecks = [...checks, payload.habitId];
      tx.set(dailyRef, { fecha: day, habitosChecks: nextChecks, bateria: calculateBattery({ ...current, habitosChecks: nextChecks }), lastUpdate: FieldValue.serverTimestamp() }, { merge: true });
    }
    writeIdempotencyResult(tx, idemRef, operationFingerprint, result, FieldValue.serverTimestamp());
    return result;
  });
}

export async function addHealthWeight(db: Firestore, input: unknown) {
  const { telegramUserId, payload } = parsePayload(healthWeightIntegrationSchema, input);
  const { firebaseUid } = await resolveTelegramUid(db, telegramUserId);
  const day = getHealthLocalDay();
  const idemRef = createIdempotencyRef(db, telegramUserId, payload.idempotencyKey);
  const weightRef = weightsCollection(db, firebaseUid).doc();
  const operationFingerprint = fingerprint("health-weight", telegramUserId, payload);
  return db.runTransaction(async (tx) => {
    const userSnapshot = await tx.get(userRef(db, firebaseUid));
    const idemSnapshot = idemRef ? await tx.get(idemRef) : null;
    const replay = readIdempotentResult<typeof result>(idemSnapshot, operationFingerprint);
    if (replay) return replay;
    if (userSnapshot.data()?.plan !== "pro") throw new ApiError("Registrar peso es una función PRO.", 403);
    const result = { ok: true, weight: { id: weightRef.id, value: payload.weight, recordedAt: new Date().toISOString() }, date: day };
    tx.create(weightRef, { peso: payload.weight, timestamp: FieldValue.serverTimestamp() });
    writeIdempotencyResult(tx, idemRef, operationFingerprint, result, FieldValue.serverTimestamp());
    return result;
  });
}
