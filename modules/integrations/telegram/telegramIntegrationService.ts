import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import { ApiError } from "@/services/api/serverAuth";
import { adjustedBalance, balanceCents, moneyCents } from "@/lib/money";
import { FINANCE_CATEGORY_METADATA, isFinanceCategoryId, type FinanceCategoryId } from "@/app/constants/finance-categories";
import { z } from "zod";

const telegramUserIdSchema = z.string().trim().regex(/^\d{1,32}$/, "telegramUserId debe contener solo dígitos.");
const movementSchema = z.object({
  telegramUserId: telegramUserIdSchema,
  type: z.enum(["GASTO", "INGRESO"]),
  amount: z.union([z.number().finite(), z.string()]).transform(String),
  concept: z.string().trim().min(1).max(200),
  categoryId: z.string().trim().max(50),
  accountId: z.string().trim().min(1).max(150),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).superRefine((value, ctx) => {
  try {
    if (moneyCents(value.amount) <= 0) ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto debe ser mayor que cero." });
  } catch {
    ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto no es válido." });
  }
  if (!isFinanceCategoryId(value.categoryId)) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "La categoría no es válida." });
});

export type TelegramMovementInput = z.infer<typeof movementSchema>;

const mappingRef = (db: Firestore, telegramUserId: string) => db.doc(`integrations/telegram/users/${telegramUserId}`);
const tokenRef = (db: Firestore, tokenHash: string) => db.doc(`integrations/telegram/linkTokens/${tokenHash}`);
type StoredMovement = { id: string; timestamp?: unknown; tipo?: string; monto?: unknown; categoria?: string };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function safeTelegramUserId(value: unknown): string {
  const parsed = telegramUserIdSchema.safeParse(value);
  if (!parsed.success) throw new ApiError("telegramUserId no es válido.", 400);
  return parsed.data;
}

function dateFromTimestamp(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate();
  return null;
}

function serializeAccount(id: string, data: FirebaseFirestore.DocumentData) {
  return { id, name: String(data.nombre || "Cuenta"), balance: Number(data.monto || 0) };
}

export function parseTelegramMovement(input: unknown): TelegramMovementInput {
  const result = movementSchema.safeParse(input);
  if (!result.success) throw new ApiError(result.error.issues[0]?.message || "Datos inválidos.", 400);
  return result.data;
}

export async function startTelegramLink(db: Firestore, telegramUserIdInput: unknown, origin: string) {
  const telegramUserId = safeTelegramUserId(telegramUserIdInput);
  const token = randomBytes(32).toString("base64url");
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);
  await tokenRef(db, hashToken(token)).set({
    telegramUserId,
    status: "pending",
    createdAt: now,
    expiresAt
  });
  return { token, expiresAt: expiresAt.toDate().toISOString(), url: `${origin}/connect/telegram?token=${encodeURIComponent(token)}` };
}

export async function confirmTelegramLink(db: Firestore, token: string, firebaseUid: string) {
  if (!token || token.length > 200) throw new ApiError("El token de vinculación no es válido.", 400);
  const ref = tokenRef(db, hashToken(token));
  const result = await db.runTransaction(async (tx) => {
    const tokenSnapshot = await tx.get(ref);
    if (!tokenSnapshot.exists) throw new ApiError("El token no existe o ya fue utilizado.", 400);
    const tokenData = tokenSnapshot.data()!;
    const expiresAt = dateFromTimestamp(tokenData.expiresAt);
    if (tokenData.status !== "pending" || !expiresAt || expiresAt.getTime() <= Date.now()) throw new ApiError("El token expiró o ya fue utilizado.", 400);

    const telegramUserId = safeTelegramUserId(tokenData.telegramUserId);
    const userMappingRef = mappingRef(db, telegramUserId);
    const mappingSnapshot = await tx.get(userMappingRef);
    if (mappingSnapshot.exists && mappingSnapshot.data()?.status === "active" && mappingSnapshot.data()?.firebaseUid !== firebaseUid) {
      throw new ApiError("Ese usuario de Telegram ya está vinculado a otra cuenta.", 409);
    }

    tx.set(userMappingRef, {
      telegramUserId,
      firebaseUid,
      status: "active",
      createdAt: mappingSnapshot.exists ? mappingSnapshot.data()?.createdAt || FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    tx.update(ref, { status: "used", usedAt: FieldValue.serverTimestamp() });
    return { telegramUserId };
  });
  return result;
}

async function resolveUid(db: Firestore, telegramUserIdInput: unknown): Promise<{ telegramUserId: string; firebaseUid: string }> {
  const telegramUserId = safeTelegramUserId(telegramUserIdInput);
  const snapshot = await mappingRef(db, telegramUserId).get();
  const data = snapshot.data();
  if (!snapshot.exists || data?.status !== "active" || typeof data.firebaseUid !== "string") throw new ApiError("El usuario de Telegram no está vinculado.", 403);
  return { telegramUserId, firebaseUid: data.firebaseUid };
}

export async function getTelegramContext(db: Firestore, telegramUserIdInput: unknown) {
  const { firebaseUid } = await resolveUid(db, telegramUserIdInput);
  const accountsSnapshot = await db.collection(`users/${firebaseUid}/cuentas`).get();
  return {
    accounts: accountsSnapshot.docs.map((item) => serializeAccount(item.id, item.data())),
    categories: FINANCE_CATEGORY_METADATA
  };
}

export async function createTelegramMovement(db: Firestore, input: unknown) {
  const parsed = parseTelegramMovement(input);
  const { telegramUserId, firebaseUid } = await resolveUid(db, parsed.telegramUserId);
  const cents = moneyCents(parsed.amount);
  const accountRef = db.doc(`users/${firebaseUid}/cuentas/${parsed.accountId}`);
  const movementRef = db.collection(`users/${firebaseUid}/movimientos`).doc();
  const idempotencyRef = parsed.idempotencyKey
    ? db.doc(`integrations/telegram/idempotency/${hashToken(`${telegramUserId}:${parsed.idempotencyKey}`)}`)
    : null;
  const fingerprint = hashToken(JSON.stringify({ telegramUserId, type: parsed.type, amount: cents, concept: parsed.concept, categoryId: parsed.categoryId, accountId: parsed.accountId }));

  const result = await db.runTransaction(async (tx) => {
    const [accountSnapshot, idempotencySnapshot] = await Promise.all([
      tx.get(accountRef),
      idempotencyRef ? tx.get(idempotencyRef) : Promise.resolve(null)
    ]);
    if (idempotencySnapshot?.exists) {
      const previous = idempotencySnapshot.data()!;
      if (previous.fingerprint !== fingerprint) throw new ApiError("La idempotencyKey ya fue usada con otros datos.", 409);
      return previous.result;
    }
    if (!accountSnapshot.exists) throw new ApiError("La cuenta no existe o no pertenece al usuario vinculado.", 404);

    const accountData = accountSnapshot.data()!;
    const delta = parsed.type === "GASTO" ? -cents / 100 : cents / 100;
    const balance = adjustedBalance(accountData.monto, delta);
    const movement = {
      nombre: parsed.concept,
      monto: cents / 100,
      tipo: parsed.type,
      categoria: parsed.categoryId,
      cuentaId: parsed.accountId,
      cuentaNombre: String(accountData.nombre || "Cuenta"),
      timestamp: Timestamp.now()
    };
    const response = {
      ok: true,
      movement: { id: movementRef.id, type: parsed.type, amount: movement.monto, concept: movement.nombre, categoryId: parsed.categoryId },
      account: { id: parsed.accountId, name: movement.cuentaNombre, balance }
    };
    tx.update(accountRef, { monto: balance });
    tx.set(movementRef, movement);
    if (idempotencyRef) tx.create(idempotencyRef, { fingerprint, result: response, createdAt: FieldValue.serverTimestamp() });
    return response;
  });
  return result;
}

export async function getTelegramSummary(db: Firestore, telegramUserIdInput: unknown) {
  const { firebaseUid } = await resolveUid(db, telegramUserIdInput);
  const [accountsSnapshot, movementsSnapshot, budgetsSnapshot] = await Promise.all([
    db.collection(`users/${firebaseUid}/cuentas`).get(),
    db.collection(`users/${firebaseUid}/movimientos`).get(),
    db.collection(`users/${firebaseUid}/presupuestos`).get()
  ]);
  const now = new Date();
  const monthMovements: StoredMovement[] = movementsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as StoredMovement).filter((movement) => {
    const date = dateFromTimestamp(movement.timestamp);
    return date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const income = monthMovements.filter((item) => item.tipo === "INGRESO").reduce((sum, item) => sum + Number(item.monto || 0), 0);
  const expenses = monthMovements.filter((item) => item.tipo === "GASTO").reduce((sum, item) => sum + Number(item.monto || 0), 0);
  const accounts = accountsSnapshot.docs.map((item) => serializeAccount(item.id, item.data()));
  const budgets = budgetsSnapshot.docs.map((item) => {
    const data = item.data();
    const categoryId = String(data.categoria || "otros") as FinanceCategoryId;
    const spent = monthMovements.filter((movement) => movement.tipo === "GASTO" && movement.categoria === categoryId).reduce((sum, movement) => sum + Number(movement.monto || 0), 0);
    const category = FINANCE_CATEGORY_METADATA.find((candidate) => candidate.id === categoryId);
    const limit = Number(data.limite || 0);
    return { categoryId, label: category?.label || categoryId, limit, spent, remaining: limit - spent };
  });
  return { availableBalance: accounts.reduce((sum, account) => sum + account.balance, 0), accounts, month: { income, expenses, balance: income - expenses }, budgets };
}
