import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp, type DocumentData, type Firestore } from "firebase-admin/firestore";
import { ApiError } from "@/services/api/serverAuth";
import { adjustedBalance, balanceCents, moneyCents } from "@/lib/money";
import { FINANCE_CATEGORY_METADATA, isFinanceCategoryId, type FinanceCategoryId } from "@/app/constants/finance-categories";
import { z } from "zod";

export const telegramUserIdSchema = z.string().trim().regex(/^\d{1,32}$/, "telegramUserId debe contener solo dígitos.");
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

const transferSchema = z.object({
  telegramUserId: telegramUserIdSchema,
  amount: z.union([z.number().finite(), z.string()]).transform(String),
  fromAccountId: z.string().trim().min(1).max(150),
  toAccountId: z.string().trim().min(1).max(150),
  concept: z.string().trim().max(200).optional(),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).superRefine((value, ctx) => {
  try { if (moneyCents(value.amount) <= 0) ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto debe ser mayor que cero." }); }
  catch { ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto no es válido." }); }
  if (value.fromAccountId === value.toAccountId) ctx.addIssue({ code: "custom", path: ["toAccountId"], message: "La cuenta de origen y destino deben ser distintas." });
});

const cardPurchaseSchema = z.object({
  telegramUserId: telegramUserIdSchema,
  amount: z.union([z.number().finite(), z.string()]).transform(String),
  concept: z.string().trim().min(1).max(200),
  categoryId: z.string().trim().max(50),
  cardId: z.string().trim().min(1).max(150),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).superRefine((value, ctx) => {
  try { if (moneyCents(value.amount) <= 0) ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto debe ser mayor que cero." }); }
  catch { ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto no es válido." }); }
  if (!isFinanceCategoryId(value.categoryId)) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "La categoría no es válida." });
});

const cardPaymentSchema = z.object({
  telegramUserId: telegramUserIdSchema,
  amount: z.union([z.number().finite(), z.string()]).transform(String),
  accountId: z.string().trim().min(1).max(150),
  cardId: z.string().trim().min(1).max(150),
  concept: z.string().trim().max(200).optional(),
  idempotencyKey: z.string().trim().min(1).max(200).optional()
}).superRefine((value, ctx) => {
  try { if (moneyCents(value.amount) <= 0) ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto debe ser mayor que cero." }); }
  catch { ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto no es válido." }); }
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

function serializeAccount(id: string, data: DocumentData) {
  return { id, name: String(data.nombre || "Cuenta"), balance: Number(data.monto || 0) };
}

function serializeCard(id: string, data: DocumentData) {
  const limit = balanceCents(data.limite) / 100;
  const debt = balanceCents(data.saldo) / 100;
  return { id, name: String(data.nombre || "Tarjeta"), bank: String(data.banco || ""), limit, debt, available: Math.max(0, limit - debt) };
}

function parseSchema<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new ApiError(result.error.issues[0]?.message || "Datos inválidos.", 400);
  return result.data;
}

function idempotencyRef(db: Firestore, telegramUserId: string, key?: string) {
  return key ? db.doc(`integrations/telegram/idempotency/${hashToken(`${telegramUserId}:${key}`)}`) : null;
}

function requireAmount(value: string): number {
  const cents = moneyCents(value);
  if (cents <= 0) throw new ApiError("El monto debe ser mayor que cero.", 400);
  return cents;
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

export async function resolveTelegramUid(db: Firestore, telegramUserIdInput: unknown): Promise<{ telegramUserId: string; firebaseUid: string }> {
  const telegramUserId = safeTelegramUserId(telegramUserIdInput);
  const snapshot = await mappingRef(db, telegramUserId).get();
  const data = snapshot.data();
  if (!snapshot.exists || data?.status !== "active" || typeof data.firebaseUid !== "string") throw new ApiError("El usuario de Telegram no está vinculado.", 403);
  return { telegramUserId, firebaseUid: data.firebaseUid };
}

const resolveUid = resolveTelegramUid;

export async function getTelegramContext(db: Firestore, telegramUserIdInput: unknown) {
  const { firebaseUid } = await resolveUid(db, telegramUserIdInput);
  const accountsSnapshot = await db.collection(`users/${firebaseUid}/cuentas`).get();
  return {
    accounts: accountsSnapshot.docs.map((item) => serializeAccount(item.id, item.data())),
    categories: FINANCE_CATEGORY_METADATA,
    cards: (await db.collection(`users/${firebaseUid}/tarjetas`).get()).docs.map((item) => serializeCard(item.id, item.data()))
  };
}

export async function createTelegramMovement(db: Firestore, input: unknown) {
  const parsed = parseTelegramMovement(input);
  const { telegramUserId, firebaseUid } = await resolveUid(db, parsed.telegramUserId);
  const cents = moneyCents(parsed.amount);
  const accountRef = db.doc(`users/${firebaseUid}/cuentas/${parsed.accountId}`);
  const movementRef = db.collection(`users/${firebaseUid}/movimientos`).doc();
  const idempotencyRef = idempotencyRefFor(db, telegramUserId, parsed.idempotencyKey);
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

function idempotencyRefFor(db: Firestore, telegramUserId: string, key?: string) {
  return idempotencyRef(db, telegramUserId, key);
}

export async function createTelegramTransfer(db: Firestore, input: unknown) {
  const parsed = parseSchema(transferSchema, input);
  const { telegramUserId, firebaseUid } = await resolveUid(db, parsed.telegramUserId);
  const amountCents = requireAmount(parsed.amount);
  const sourceRef = db.doc(`users/${firebaseUid}/cuentas/${parsed.fromAccountId}`);
  const destinationRef = db.doc(`users/${firebaseUid}/cuentas/${parsed.toAccountId}`);
  const movementRef = db.collection(`users/${firebaseUid}/movimientos`).doc();
  const idemRef = idempotencyRef(db, telegramUserId, parsed.idempotencyKey);
  const fingerprint = hashToken(JSON.stringify({ operation: "transfer", telegramUserId, amountCents, fromAccountId: parsed.fromAccountId, toAccountId: parsed.toAccountId, concept: parsed.concept || "" }));

  return db.runTransaction(async (tx) => {
    const [sourceSnapshot, destinationSnapshot, idemSnapshot] = await Promise.all([tx.get(sourceRef), tx.get(destinationRef), idemRef ? tx.get(idemRef) : Promise.resolve(null)]);
    if (idemSnapshot?.exists) {
      const previous = idemSnapshot.data()!;
      if (previous.fingerprint !== fingerprint) throw new ApiError("La idempotencyKey ya fue usada con otros datos.", 409);
      return previous.result;
    }
    if (!sourceSnapshot.exists || !destinationSnapshot.exists) throw new ApiError("Una de las cuentas no existe o no pertenece al usuario.", 404);
    if (balanceCents(sourceSnapshot.data()!.monto) < amountCents) throw new ApiError("Fondos insuficientes en la cuenta de origen.", 409);
    const sourceName = String(sourceSnapshot.data()!.nombre || "Cuenta origen");
    const destinationName = String(destinationSnapshot.data()!.nombre || "Cuenta destino");
    const concept = parsed.concept || `Transferencia: ${sourceName} → ${destinationName}`;
    const sourceBalance = adjustedBalance(sourceSnapshot.data()!.monto, -amountCents / 100);
    const destinationBalance = adjustedBalance(destinationSnapshot.data()!.monto, amountCents / 100);
    const movement = { nombre: concept, monto: amountCents / 100, tipo: "TRANSFERENCIA", cuentaId: parsed.fromAccountId, cuentaDestinoId: parsed.toAccountId, cuentaNombre: sourceName, timestamp: Timestamp.now() };
    const result = { ok: true, movement: { id: movementRef.id, type: movement.tipo, amount: movement.monto, concept }, fromAccount: { id: parsed.fromAccountId, name: sourceName, balance: sourceBalance }, toAccount: { id: parsed.toAccountId, name: destinationName, balance: destinationBalance } };
    tx.update(sourceRef, { monto: sourceBalance });
    tx.update(destinationRef, { monto: destinationBalance });
    tx.set(movementRef, movement);
    if (idemRef) tx.create(idemRef, { fingerprint, result, createdAt: FieldValue.serverTimestamp() });
    return result;
  });
}

export async function createTelegramCardPurchase(db: Firestore, input: unknown) {
  const parsed = parseSchema(cardPurchaseSchema, input);
  const { telegramUserId, firebaseUid } = await resolveUid(db, parsed.telegramUserId);
  const amountCents = requireAmount(parsed.amount);
  const cardRef = db.doc(`users/${firebaseUid}/tarjetas/${parsed.cardId}`);
  const movementRef = db.collection(`users/${firebaseUid}/movimientos`).doc();
  const idemRef = idempotencyRef(db, telegramUserId, parsed.idempotencyKey);
  const fingerprint = hashToken(JSON.stringify({ operation: "card-purchase", telegramUserId, amountCents, concept: parsed.concept, categoryId: parsed.categoryId, cardId: parsed.cardId }));

  return db.runTransaction(async (tx) => {
    const [cardSnapshot, idemSnapshot] = await Promise.all([tx.get(cardRef), idemRef ? tx.get(idemRef) : Promise.resolve(null)]);
    if (idemSnapshot?.exists) {
      const previous = idemSnapshot.data()!;
      if (previous.fingerprint !== fingerprint) throw new ApiError("La idempotencyKey ya fue usada con otros datos.", 409);
      return previous.result;
    }
    if (!cardSnapshot.exists) throw new ApiError("La tarjeta no existe o no pertenece al usuario.", 404);
    const card = serializeCard(cardSnapshot.id, cardSnapshot.data()!);
    const newDebtCents = balanceCents(card.debt) + amountCents;
    if (newDebtCents > balanceCents(card.limit)) throw new ApiError("La compra supera el crédito disponible.", 409);
    const newDebt = newDebtCents / 100;
    const movement = { nombre: parsed.concept, monto: amountCents / 100, tipo: "GASTO", categoria: parsed.categoryId, tarjetaId: parsed.cardId, tarjetaNombre: card.name, medioPago: "TARJETA_CREDITO", timestamp: Timestamp.now() };
    const updatedCard = { ...card, debt: newDebt, available: Math.max(0, card.limit - newDebt) };
    const result = { ok: true, movement: { id: movementRef.id, type: movement.tipo, amount: movement.monto, concept: movement.nombre, categoryId: parsed.categoryId, paymentMethod: "CREDIT_CARD", cardId: parsed.cardId }, card: updatedCard };
    tx.update(cardRef, { saldo: newDebt });
    tx.set(movementRef, movement);
    if (idemRef) tx.create(idemRef, { fingerprint, result, createdAt: FieldValue.serverTimestamp() });
    return result;
  });
}

export async function createTelegramCardPayment(db: Firestore, input: unknown) {
  const parsed = parseSchema(cardPaymentSchema, input);
  const { telegramUserId, firebaseUid } = await resolveUid(db, parsed.telegramUserId);
  const amountCents = requireAmount(parsed.amount);
  const accountRef = db.doc(`users/${firebaseUid}/cuentas/${parsed.accountId}`);
  const cardRef = db.doc(`users/${firebaseUid}/tarjetas/${parsed.cardId}`);
  const movementRef = db.collection(`users/${firebaseUid}/movimientos`).doc();
  const idemRef = idempotencyRef(db, telegramUserId, parsed.idempotencyKey);
  const fingerprint = hashToken(JSON.stringify({ operation: "card-payment", telegramUserId, amountCents, accountId: parsed.accountId, cardId: parsed.cardId, concept: parsed.concept || "" }));

  return db.runTransaction(async (tx) => {
    const [accountSnapshot, cardSnapshot, idemSnapshot] = await Promise.all([tx.get(accountRef), tx.get(cardRef), idemRef ? tx.get(idemRef) : Promise.resolve(null)]);
    if (idemSnapshot?.exists) {
      const previous = idemSnapshot.data()!;
      if (previous.fingerprint !== fingerprint) throw new ApiError("La idempotencyKey ya fue usada con otros datos.", 409);
      return previous.result;
    }
    if (!accountSnapshot.exists || !cardSnapshot.exists) throw new ApiError("La cuenta o tarjeta no existe o no pertenece al usuario.", 404);
    if (balanceCents(accountSnapshot.data()!.monto) < amountCents) throw new ApiError("Fondos insuficientes en la cuenta.", 409);
    const card = serializeCard(cardSnapshot.id, cardSnapshot.data()!);
    if (balanceCents(card.debt) < amountCents) throw new ApiError("El pago supera la deuda de la tarjeta.", 409);
    const accountName = String(accountSnapshot.data()!.nombre || "Cuenta");
    const cardDebt = (balanceCents(card.debt) - amountCents) / 100;
    const concept = parsed.concept || `Pago tarjeta ${card.name}`;
    const accountBalance = adjustedBalance(accountSnapshot.data()!.monto, -amountCents / 100);
    const movement = { nombre: concept, monto: amountCents / 100, tipo: "PAGO_TARJETA", cuentaId: parsed.accountId, cuentaNombre: accountName, tarjetaId: parsed.cardId, tarjetaNombre: card.name, timestamp: Timestamp.now() };
    const updatedCard = { ...card, debt: cardDebt, available: Math.max(0, card.limit - cardDebt) };
    const result = { ok: true, movement: { id: movementRef.id, type: movement.tipo, amount: movement.monto, concept }, account: { id: parsed.accountId, name: accountName, balance: accountBalance }, card: updatedCard };
    tx.update(accountRef, { monto: accountBalance });
    tx.update(cardRef, { saldo: cardDebt });
    tx.set(movementRef, movement);
    if (idemRef) tx.create(idemRef, { fingerprint, result, createdAt: FieldValue.serverTimestamp() });
    return result;
  });
}

export async function getTelegramSummary(db: Firestore, telegramUserIdInput: unknown) {
  const { firebaseUid } = await resolveUid(db, telegramUserIdInput);
  const [accountsSnapshot, movementsSnapshot, budgetsSnapshot, cardsSnapshot] = await Promise.all([
    db.collection(`users/${firebaseUid}/cuentas`).get(),
    db.collection(`users/${firebaseUid}/movimientos`).get(),
    db.collection(`users/${firebaseUid}/presupuestos`).get(),
    db.collection(`users/${firebaseUid}/tarjetas`).get()
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
  const cards = cardsSnapshot.docs.map((item) => serializeCard(item.id, item.data()));
  const creditCards = {
    totalLimit: cards.reduce((sum, card) => sum + card.limit, 0),
    totalDebt: cards.reduce((sum, card) => sum + card.debt, 0),
    totalAvailable: cards.reduce((sum, card) => sum + card.available, 0)
  };
  return { availableBalance: accounts.reduce((sum, account) => sum + account.balance, 0), accounts, month: { income, expenses, balance: income - expenses }, budgets, cards, creditCards };
}
