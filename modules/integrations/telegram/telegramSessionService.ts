import { FieldValue, Timestamp, type DocumentData, type Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { isFinanceCategoryId } from "@/app/constants/finance-categories";
import { moneyCents } from "@/lib/money";
import { ApiError } from "@/services/api/serverAuth";
import { resolveTelegramUid, telegramUserIdSchema } from "./telegramIntegrationService";

const SESSION_TTL_MS = 30 * 60 * 1000;
const sessionOperations = ["GASTO", "INGRESO", "TRANSFERENCIA", "COMPRA_TARJETA", "PAGO_TARJETA"] as const;

const boundedId = z.string().trim().min(1).max(150);
const sessionDataSchema = z.object({
  amount: z.union([z.number().finite(), z.string().trim()]).optional(),
  concept: z.string().trim().max(200).optional(),
  categoryId: z.string().trim().max(50).optional(),
  accountId: boundedId.optional(),
  destinationAccountId: boundedId.optional(),
  cardId: boundedId.optional(),
  metadata: z.record(z.string(), z.union([z.string().max(500), z.number().finite(), z.boolean(), z.null()])).optional()
}).strict();

const putSchema = z.object({
  telegramUserId: telegramUserIdSchema,
  operation: z.enum(sessionOperations),
  step: z.string().trim().min(1).max(80),
  data: sessionDataSchema.default({})
}).strict();

const patchSchema = z.object({
  telegramUserId: telegramUserIdSchema,
  step: z.string().trim().min(1).max(80).optional(),
  data: sessionDataSchema.default({})
}).strict().refine((value) => value.step !== undefined || Object.keys(value.data).length > 0, {
  message: "La actualización debe incluir step o data."
});

type SessionData = z.infer<typeof sessionDataSchema>;
type SessionOperation = (typeof sessionOperations)[number];
type StoredSession = {
  telegramUserId: string;
  firebaseUid: string;
  operation: SessionOperation;
  step: string;
  amount?: number;
  concept?: string;
  categoryId?: string;
  accountId?: string;
  destinationAccountId?: string;
  cardId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
};

const sessionRef = (db: Firestore, telegramUserId: string) => db.doc(`integrations/telegram/sessions/${telegramUserId}`);

function parseBody<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ApiError(result.error.issues[0]?.message || "Datos inválidos.", 400);
  return result.data;
}

function normalizeData(data: SessionData): Omit<SessionData, "amount" | "categoryId" | "metadata"> & Pick<SessionData, "categoryId" | "metadata"> & { amount?: number } {
  const normalized: Record<string, unknown> = { ...data };
  if (data.amount !== undefined) {
    let cents: number;
    try { cents = moneyCents(data.amount); } catch { throw new ApiError("El monto no es válido.", 400); }
    if (cents <= 0) throw new ApiError("El monto debe ser mayor que cero.", 400);
    normalized.amount = cents / 100;
  }
  if (data.categoryId !== undefined && !isFinanceCategoryId(data.categoryId)) throw new ApiError("La categoría no es válida.", 400);
  if (data.metadata !== undefined && Object.keys(data.metadata).length > 10) throw new ApiError("metadata excede el límite permitido.", 400);
  if (data.metadata !== undefined && JSON.stringify(data.metadata).length > 2000) throw new ApiError("metadata excede el límite permitido.", 400);
  return normalized as ReturnType<typeof normalizeData>;
}

function dateValue(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate();
  return null;
}

function publicSession(data: DocumentData | undefined) {
  if (!data) return { active: false };
  const expiresAt = dateValue(data.expiresAt);
  if (!expiresAt || expiresAt.getTime() <= Date.now()) return { active: false };
  const result: Record<string, unknown> = { active: true, telegramUserId: data.telegramUserId, operation: data.operation, step: data.step };
  for (const key of ["amount", "concept", "categoryId", "accountId", "destinationAccountId", "cardId", "metadata"]) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  result.createdAt = dateValue(data.createdAt)?.toISOString();
  result.updatedAt = dateValue(data.updatedAt)?.toISOString();
  result.expiresAt = expiresAt.toISOString();
  return result;
}

function assertSessionCurrent(data: DocumentData | undefined, firebaseUid: string): asserts data is StoredSession & DocumentData {
  const expiresAt = dateValue(data?.expiresAt);
  if (!data || data.firebaseUid !== firebaseUid || !expiresAt || expiresAt.getTime() <= Date.now()) throw new ApiError("La sesión no existe o expiró.", 404);
}

export async function putTelegramSession(db: Firestore, input: unknown) {
  const parsed = parseBody(putSchema, input);
  const { telegramUserId, firebaseUid } = await resolveTelegramUid(db, parsed.telegramUserId);
  const normalized = normalizeData(parsed.data);
  const now = Timestamp.now();
  const session: StoredSession = {
    telegramUserId, firebaseUid, operation: parsed.operation, step: parsed.step,
    ...normalized, createdAt: now, updatedAt: now, expiresAt: Timestamp.fromMillis(now.toMillis() + SESSION_TTL_MS)
  };
  await sessionRef(db, telegramUserId).set(session);
  return publicSession(session);
}

export async function getTelegramSession(db: Firestore, telegramUserIdInput: unknown) {
  const { telegramUserId, firebaseUid } = await resolveTelegramUid(db, telegramUserIdInput);
  const ref = sessionRef(db, telegramUserId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { active: false };
  const data = snapshot.data();
  const expiresAt = dateValue(data?.expiresAt);
  if (data?.firebaseUid !== firebaseUid || !expiresAt || expiresAt.getTime() <= Date.now()) {
    await ref.delete();
    return { active: false };
  }
  return publicSession(data);
}

export async function patchTelegramSession(db: Firestore, input: unknown) {
  const parsed = parseBody(patchSchema, input);
  const { telegramUserId, firebaseUid } = await resolveTelegramUid(db, parsed.telegramUserId);
  const ref = sessionRef(db, telegramUserId);
  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const current = snapshot.data();
    try { assertSessionCurrent(current, firebaseUid); } catch (error) {
      if (snapshot.exists && (!current || current.firebaseUid !== firebaseUid || !dateValue(current.expiresAt) || dateValue(current.expiresAt)!.getTime() <= Date.now())) tx.delete(ref);
      throw error;
    }
    const normalized = normalizeData(parsed.data);
    const updated = { ...current, ...normalized, ...(parsed.step === undefined ? {} : { step: parsed.step }), updatedAt: FieldValue.serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + SESSION_TTL_MS) };
    tx.set(ref, updated);
    return publicSession({ ...current, ...normalized, ...(parsed.step === undefined ? {} : { step: parsed.step }), updatedAt: Timestamp.now(), expiresAt: updated.expiresAt });
  });
}

export async function deleteTelegramSession(db: Firestore, telegramUserIdInput: unknown) {
  const { telegramUserId } = await resolveTelegramUid(db, telegramUserIdInput);
  await sessionRef(db, telegramUserId).delete();
  return { ok: true };
}
