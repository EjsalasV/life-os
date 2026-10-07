import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore as AdminFirestore } from "firebase-admin/firestore";
import {
  addHealthActivity,
  addHealthWeight,
  checkHealthHabit,
  getHealthContext,
  getHealthSummary,
  listHealthHabits,
  updateHealthCheckIn,
  updateHealthWater
} from "./server/healthIntegrationService";

let environment: RulesTestEnvironment;
const adminApp = initializeApp({ projectId: "demo-life-os-health-phase-d" }, "health-phase-d-tests");
const adminDb: AdminFirestore = getFirestore(adminApp);

const seed = async (data: Record<string, Record<string, unknown>>) => environment.withSecurityRulesDisabled(async (context) => {
  await Promise.all(Object.entries(data).map(([path, value]) => setDoc(doc(context.firestore(), path), value)));
});

const read = async (path: string) => (await adminDb.doc(path).get()).data();

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-life-os-health-phase-d",
    firestore: { host: "127.0.0.1", port: 8080, rules: readFileSync("firestore.rules", "utf8") }
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await seed({
    "integrations/telegram/users/123456": { telegramUserId: "123456", firebaseUid: "alice", status: "active" },
    "users/alice": { plan: "pro", physicalProfile: { peso: 80, pesoObjetivo: 75, altura: 175, edad: 30, sexo: "hombre" } },
    "users/alice/perfilFisico/config": { peso: 80, pesoObjetivo: 75 },
    "users/alice/habitos/water": { nombre: "Agua", frecuencia: "Diario", activo: true },
    "users/alice/habitos/archived": { nombre: "Archivado", frecuencia: "Diario", activo: false }
  });
});

afterAll(async () => {
  await environment.cleanup();
  await deleteApp(adminApp);
});

describe("Telegram health integration with Firestore emulator", () => {
  it("returns only the linked user's health context and active habits", async () => {
    const context = await getHealthContext(adminDb, "123456");
    expect(context.profile.currentWeight).toBe(80);
    expect(context.today.habits).toEqual([expect.objectContaining({ id: "water", completed: false })]);
    await expect(getHealthContext(adminDb, "999999")).rejects.toMatchObject({ status: 403 });
  });

  it("updates water and check-in atomically with idempotent retries", async () => {
    const waterInput = { telegramUserId: "123456", action: "ADD" as const, amount: 2, idempotencyKey: "water-1" };
    const firstWater = await updateHealthWater(adminDb, waterInput);
    expect(await updateHealthWater(adminDb, waterInput)).toEqual(firstWater);
    await updateHealthCheckIn(adminDb, { telegramUserId: "123456", sleepHours: 7, mood: "genial", idempotencyKey: "check-1" });
    const summary = await getHealthSummary(adminDb, "123456");
    expect(summary.water).toBe(2);
    expect(summary.sleepHours).toBe(7);
    expect(summary.mood).toBe("genial");
    expect((await read(`users/alice/salud_diaria/${summary.date}`))?.agua).toBe(2);
  });

  it("rejects invalid health input without writing data", async () => {
    await expect(updateHealthCheckIn(adminDb, { telegramUserId: "123456", sleepHours: 30 })).rejects.toMatchObject({ status: 400 });
    await expect(addHealthActivity(adminDb, { telegramUserId: "123456", type: "unknown", minutes: 20 })).rejects.toMatchObject({ status: 400 });
    await expect(updateHealthWater(adminDb, { telegramUserId: "123456", action: "ADD", amount: 21 })).rejects.toMatchObject({ status: 400 });
  });

  it("records activities once and calculates exercise totals", async () => {
    const input = { telegramUserId: "123456", type: "caminata-ligera", minutes: 30, idempotencyKey: "activity-1" };
    const first = await addHealthActivity(adminDb, input);
    expect(await addHealthActivity(adminDb, input)).toEqual(first);
    const daily = await read(`users/alice/salud_diaria/${first.date}`);
    expect(daily?.ejercicioMinutos).toBe(30);
    expect(daily?.deficitCalorico?.actividades).toHaveLength(1);
  });

  it("checks an owned habit once and protects the PRO weight endpoint", async () => {
    const habitInput = { telegramUserId: "123456", habitId: "water", idempotencyKey: "habit-1" };
    const first = await checkHealthHabit(adminDb, habitInput);
    expect(await checkHealthHabit(adminDb, habitInput)).toEqual(first);
    expect((await listHealthHabits(adminDb, "123456")).habits[0]?.completed).toBe(true);
    const weight = await addHealthWeight(adminDb, { telegramUserId: "123456", weight: 79, idempotencyKey: "weight-1" });
    expect(await addHealthWeight(adminDb, { telegramUserId: "123456", weight: 79, idempotencyKey: "weight-1" })).toEqual(weight);
    await seed({ "users/alice": { plan: "free" } });
    await expect(addHealthWeight(adminDb, { telegramUserId: "123456", weight: 78 })).rejects.toMatchObject({ status: 403 });
    await expect(checkHealthHabit(adminDb, { telegramUserId: "123456", habitId: "other" })).rejects.toMatchObject({ status: 404 });
  });
});
