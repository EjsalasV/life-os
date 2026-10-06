import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { deleteTelegramSession, getTelegramSession, patchTelegramSession, putTelegramSession } from "./telegramSessionService";

let environment: RulesTestEnvironment;
const adminApp = initializeApp({ projectId: "demo-life-os-telegram-sessions" }, "telegram-session-tests");
const adminDb: Firestore = getFirestore(adminApp);

async function seed(data: Record<string, Record<string, unknown>>) {
  await environment.withSecurityRulesDisabled(async (context) => {
    await Promise.all(Object.entries(data).map(([path, value]) => context.firestore().doc(path).set(value)));
  });
}

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-life-os-telegram-sessions",
    firestore: { host: "127.0.0.1", port: 8080, rules: readFileSync("firestore.rules", "utf8") }
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await seed({ "integrations/telegram/users/123456": { telegramUserId: "123456", firebaseUid: "alice", status: "active" } });
});

afterAll(async () => {
  await environment.cleanup();
  await deleteApp(adminApp);
});

describe("Telegram conversation sessions with Firestore emulator", () => {
  it("creates an active normalized session without exposing firebaseUid and replaces it on PUT", async () => {
    const created = await putTelegramSession(adminDb, {
      telegramUserId: "123456", operation: "GASTO", step: "awaiting_amount",
      data: { amount: "12.50", concept: "Café", categoryId: "comida", metadata: { source: "telegram" } }
    });
    expect(created).toMatchObject({ active: true, operation: "GASTO", step: "awaiting_amount", amount: 12.5 });
    expect(created).not.toHaveProperty("firebaseUid");
    expect((await adminDb.doc("integrations/telegram/sessions/123456").get()).data()).toMatchObject({ firebaseUid: "alice", amount: 12.5 });

    const replaced = await putTelegramSession(adminDb, { telegramUserId: "123456", operation: "TRANSFERENCIA", step: "awaiting_destination", data: { accountId: "checking" } });
    expect(replaced).toMatchObject({ active: true, operation: "TRANSFERENCIA", step: "awaiting_destination", accountId: "checking" });
    expect(replaced).not.toHaveProperty("concept");
  });

  it("gets active sessions, refreshes them with an atomic PATCH, and rejects protected fields", async () => {
    const created = await putTelegramSession(adminDb, { telegramUserId: "123456", operation: "INGRESO", step: "amount", data: {} });
    const patched = await patchTelegramSession(adminDb, { telegramUserId: "123456", step: "concept", data: { amount: 25, concept: "Venta" } });
    expect(await getTelegramSession(adminDb, "123456")).toMatchObject({ active: true, step: "concept", amount: 25, concept: "Venta" });
    expect(new Date(String(patched.expiresAt)).getTime()).toBeGreaterThan(new Date(String(created.expiresAt)).getTime() - 1000);
    await expect(patchTelegramSession(adminDb, { telegramUserId: "123456", data: { firebaseUid: "mallory" } })).rejects.toMatchObject({ status: 400 });
  });

  it("treats expired sessions as inactive and removes them", async () => {
    await seed({
      "integrations/telegram/sessions/123456": {
        telegramUserId: "123456", firebaseUid: "alice", operation: "GASTO", step: "amount",
        createdAt: new Date(Date.now() - 31 * 60 * 1000), updatedAt: new Date(Date.now() - 31 * 60 * 1000), expiresAt: new Date(Date.now() - 1000)
      }
    });
    expect(await getTelegramSession(adminDb, "123456")).toEqual({ active: false });
    expect((await adminDb.doc("integrations/telegram/sessions/123456").get()).exists).toBe(false);
    await expect(patchTelegramSession(adminDb, { telegramUserId: "123456", data: { concept: "No" } })).rejects.toMatchObject({ status: 404 });
  });

  it("isolates users and makes DELETE idempotent", async () => {
    await putTelegramSession(adminDb, { telegramUserId: "123456", operation: "PAGO_TARJETA", step: "card", data: { cardId: "card" } });
    await expect(getTelegramSession(adminDb, "999999")).rejects.toMatchObject({ status: 403 });
    await expect(putTelegramSession(adminDb, { telegramUserId: "999999", operation: "GASTO", step: "amount", data: {} })).rejects.toMatchObject({ status: 403 });
    expect(await deleteTelegramSession(adminDb, "123456")).toEqual({ ok: true });
    expect(await deleteTelegramSession(adminDb, "123456")).toEqual({ ok: true });
    expect(await getTelegramSession(adminDb, "123456")).toEqual({ active: false });
  });

  it("keeps sessions inaccessible to the client and serializes concurrent PATCH operations", async () => {
    await putTelegramSession(adminDb, { telegramUserId: "123456", operation: "GASTO", step: "amount", data: {} });
    const client = environment.authenticatedContext("alice").firestore();
    await expect(client.doc("integrations/telegram/sessions/123456").get()).rejects.toThrow();
    await expect(client.doc("integrations/telegram/sessions/123456").set({ firebaseUid: "alice" })).rejects.toThrow();

    await Promise.all([
      patchTelegramSession(adminDb, { telegramUserId: "123456", step: "concept", data: { concept: "A" } }),
      patchTelegramSession(adminDb, { telegramUserId: "123456", step: "category", data: { categoryId: "comida" } })
    ]);
    expect(await getTelegramSession(adminDb, "123456")).toMatchObject({ active: true });
  });

  it("validates official categories and positive amounts", async () => {
    await expect(putTelegramSession(adminDb, { telegramUserId: "123456", operation: "GASTO", step: "amount", data: { amount: 0 } })).rejects.toMatchObject({ status: 400 });
    await expect(putTelegramSession(adminDb, { telegramUserId: "123456", operation: "GASTO", step: "category", data: { categoryId: "inventada" } })).rejects.toMatchObject({ status: 400 });
  });
});
