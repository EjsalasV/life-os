import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore as AdminFirestore } from "firebase-admin/firestore";
import { createTelegramCardPayment, createTelegramCardPurchase, createTelegramTransfer, getTelegramContext, getTelegramSummary } from "./telegramIntegrationService";
import { deleteMovementWithAdjustments } from "@/modules/finance/services/financeTransactionService";

let environment: RulesTestEnvironment;
let clientDb: Firestore;
const adminApp = initializeApp({ projectId: "demo-life-os-telegram-phase2" }, "telegram-phase2-tests");
const adminDb: AdminFirestore = getFirestore(adminApp);

vi.mock("@/services/firebase/client", () => ({ get db() { return clientDb; } }));

const seed = async (data: Record<string, Record<string, unknown>>) => environment.withSecurityRulesDisabled(async (context) => {
  await Promise.all(Object.entries(data).map(([path, value]) => setDoc(doc(context.firestore(), path), value)));
});

const read = async (path: string) => (await adminDb.doc(path).get()).data();

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-life-os-telegram-phase2",
    firestore: { host: "127.0.0.1", port: 8080, rules: readFileSync("firestore.rules", "utf8") }
  });
  clientDb = environment.authenticatedContext("alice").firestore() as unknown as Firestore;
});

beforeEach(async () => {
  await environment.clearFirestore();
  await seed({
    "integrations/telegram/users/123456": { telegramUserId: "123456", firebaseUid: "alice", status: "active" },
    "users/alice/cuentas/debit": { nombre: "Débito", monto: 500 },
    "users/alice/cuentas/destination": { nombre: "Ahorros", monto: 50 },
    "users/alice/tarjetas/card": { nombre: "Visa", banco: "Banco", limite: 1000, saldo: 200 },
    "users/alice/presupuestos/comida": { categoria: "comida", limite: 300 }
  });
});

afterAll(async () => {
  await environment.cleanup();
  await deleteApp(adminApp);
});

describe("Telegram finance phase 2 with Firestore emulator", () => {
  it("returns cards and isolates the linked user's context", async () => {
    const context = await getTelegramContext(adminDb, "123456");
    expect(context.accounts).toEqual(expect.arrayContaining([expect.objectContaining({ id: "debit", balance: 500 })]));
    expect(context.cards).toEqual([expect.objectContaining({ id: "card", debt: 200, available: 800 })]);
    await expect(getTelegramContext(adminDb, "999999")).rejects.toThrow("no está vinculado");
  });

  it("transfers atomically and is idempotent", async () => {
    const input = { telegramUserId: "123456", amount: 100, fromAccountId: "debit", toAccountId: "destination", idempotencyKey: "transfer-1" };
    const first = await createTelegramTransfer(adminDb, input);
    const second = await createTelegramTransfer(adminDb, input);
    expect(second).toEqual(first);
    expect((await read("users/alice/cuentas/debit"))?.monto).toBe(400);
    expect((await read("users/alice/cuentas/destination"))?.monto).toBe(150);
    expect((await read(`users/alice/movimientos/${first.movement.id}`))?.tipo).toBe("TRANSFERENCIA");
    await expect(createTelegramTransfer(adminDb, { ...input, amount: 101 })).rejects.toMatchObject({ status: 409 });
  });

  it("creates a card purchase without touching debit accounts and counts it in summary", async () => {
    const result = await createTelegramCardPurchase(adminDb, { telegramUserId: "123456", amount: 20, concept: "Supermercado", categoryId: "comida", cardId: "card", idempotencyKey: "purchase-1" });
    expect((await read("users/alice/tarjetas/card"))?.saldo).toBe(220);
    expect((await read("users/alice/cuentas/debit"))?.monto).toBe(500);
    expect((await read(`users/alice/movimientos/${result.movement.id}`))?.medioPago).toBe("TARJETA_CREDITO");
    const summary = await getTelegramSummary(adminDb, "123456");
    expect(summary.month.expenses).toBe(20);
    expect(summary.creditCards).toMatchObject({ totalLimit: 1000, totalDebt: 220, totalAvailable: 780 });
  });

  it("rejects a purchase over the card limit", async () => {
    await expect(createTelegramCardPurchase(adminDb, { telegramUserId: "123456", amount: 801, concept: "Exceso", categoryId: "comida", cardId: "card" })).rejects.toMatchObject({ status: 409 });
  });

  it("pays a card without counting the payment as an expense", async () => {
    const result = await createTelegramCardPayment(adminDb, { telegramUserId: "123456", amount: 100, accountId: "debit", cardId: "card", idempotencyKey: "payment-1" });
    expect((await read("users/alice/cuentas/debit"))?.monto).toBe(400);
    expect((await read("users/alice/tarjetas/card"))?.saldo).toBe(100);
    expect((await read(`users/alice/movimientos/${result.movement.id}`))?.tipo).toBe("PAGO_TARJETA");
    const summary = await getTelegramSummary(adminDb, "123456");
    expect(summary.month.expenses).toBe(0);
    expect(summary.budgets[0].spent).toBe(0);
  });

  it("reverses a card purchase and a transfer atomically on physical deletion", async () => {
    const purchase = await createTelegramCardPurchase(adminDb, { telegramUserId: "123456", amount: 20, concept: "Compra", categoryId: "comida", cardId: "card" });
    await deleteMovementWithAdjustments("alice", purchase.movement.id);
    expect((await read("users/alice/tarjetas/card"))?.saldo).toBe(200);
    expect(await read(`users/alice/movimientos/${purchase.movement.id}`)).toBeUndefined();

    const transfer = await createTelegramTransfer(adminDb, { telegramUserId: "123456", amount: 50, fromAccountId: "debit", toAccountId: "destination" });
    await deleteMovementWithAdjustments("alice", transfer.movement.id);
    expect((await read("users/alice/cuentas/debit"))?.monto).toBe(500);
    expect((await read("users/alice/cuentas/destination"))?.monto).toBe(50);

    const payment = await createTelegramCardPayment(adminDb, { telegramUserId: "123456", amount: 75, accountId: "debit", cardId: "card" });
    await deleteMovementWithAdjustments("alice", payment.movement.id);
    expect((await read("users/alice/cuentas/debit"))?.monto).toBe(500);
    expect((await read("users/alice/tarjetas/card"))?.saldo).toBe(200);
    expect(await read(`users/alice/movimientos/${payment.movement.id}`)).toBeUndefined();
  });
});

describe("Telegram privileged movement rules", () => {
  it("does not allow the client to create a card payment or card purchase metadata", async () => {
    const context = environment.authenticatedContext("alice");
    await expect(setDoc(doc(context.firestore(), "users/alice/movimientos/fake-payment"), {
      nombre: "Pago", monto: 10, tipo: "PAGO_TARJETA", cuentaId: "debit", tarjetaId: "card", tarjetaNombre: "Visa", timestamp: new Date()
    })).rejects.toThrow();
    await expect(setDoc(doc(context.firestore(), "users/alice/movimientos/fake-purchase"), {
      nombre: "Compra", monto: 10, tipo: "GASTO", categoria: "comida", tarjetaId: "card", medioPago: "TARJETA_CREDITO", timestamp: new Date()
    })).rejects.toThrow();
  });
});
