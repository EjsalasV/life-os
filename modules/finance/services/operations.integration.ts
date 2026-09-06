import { readFileSync } from "node:fs";
import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, getDocs, collection, type Firestore } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { deleteMovementWithAdjustments, editMovementWithBalance, cancelSalePersistence } from "./financeTransactionService";
import { saveBalancedMovement } from "./balanceService";
import { persistSaleEdit } from "@/modules/sales/services/salesService";
import { processCheckout } from "@/modules/sales/services/checkoutService";
import { deleteEmptyAccount, deleteEmptyGoal, updateProduct } from "./entityIntegrityService";
import { syncBudgetHistory } from "./budgetHistoryService";
import { changeDailyHealth } from "@/services/firebase/healthService";

let testDb: Firestore;
let environment: RulesTestEnvironment;
const adminApp = initializeApp({ projectId: "demo-life-os-operations" }, "operations-tests");
vi.mock("@/services/firebase/client", () => ({ get db() { return testDb; } }));
vi.mock("@/services/firebase/admin", () => ({ getAdminFirestore: () => getFirestore(adminApp), getAdminAuth: vi.fn() }));
const ref = (col: string, id: string) => doc(testDb, "users", "alice", col, id);
const read = async (col: string, id: string) => (await getDoc(ref(col, id))).data();
const seed = async (data: Record<string, Record<string, unknown>>) => environment.withSecurityRulesDisabled(async (context) => {
  await Promise.all(Object.entries(data).map(([path, value]) => setDoc(doc(context.firestore(), "users/alice/" + path), value)));
});
beforeAll(async () => {
  environment = await initializeTestEnvironment({ projectId: "demo-life-os-operations", firestore: { host: "127.0.0.1", port: 8080, rules: readFileSync("firestore.rules", "utf8") } });
  testDb = environment.authenticatedContext("alice", { email: "alice@example.com" }).firestore() as unknown as Firestore;
});
beforeEach(() => environment.clearFirestore());
afterAll(async () => { await environment.cleanup(); await deleteApp(adminApp); });

describe("Real transactions with deployed rule source", () => {
  it("edits a manual expense and its date/category with one balance adjustment", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 90 }, "movimientos/m": { nombre: "Antes", monto: 10, tipo: "GASTO", cuentaId: "a", categoria: "otros", timestamp: new Date() } });
    await editMovementWithBalance({ uid: "alice", movementId: "m", nombre: "Después", monto: 15.25, tipo: "GASTO", cuentaId: "a", cuentaNombre: "Caja", categoria: "salud", timestamp: new Date(2026, 0, 2, 12) });
    expect((await read("cuentas", "a"))?.monto).toBe(84.75);
    expect((await read("movimientos", "m"))?.monto).toBe(15.25);
  });
  it("reverses a movement exactly once across two sessions", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 90 }, "movimientos/m": { nombre: "Gasto", monto: 10, tipo: "GASTO", cuentaId: "a" } });
    await Promise.all([deleteMovementWithAdjustments("alice", "m"), deleteMovementWithAdjustments("alice", "m")]);
    expect((await read("cuentas", "a"))?.monto).toBe(100);
    expect(await read("movimientos", "m")).toBeUndefined();
  });
  it("refuses to delete a sale's movement independently", async () => {
    await seed({ "movimientos/m": { ventaRefId: "v", monto: 10, tipo: "INGRESO", cuentaId: "a" } });
    await expect(deleteMovementWithAdjustments("alice", "m")).rejects.toThrow("Anula el ticket");
    expect(await read("movimientos", "m")).toBeDefined();
  });
  it("cancels an old sale once and finds its hidden movement", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 10 }, "productos/p": { nombre: "Café", stock: 1, precioVenta: 10, costo: 2 }, "ventas/v": { cuentaId: "a", total: 10, items: [{ id: "p", cantidad: 1 }] }, "movimientos/m": { ventaRefId: "v", monto: 10, tipo: "INGRESO", cuentaId: "a" } });
    await Promise.all([cancelSalePersistence("alice", { id: "v" }), cancelSalePersistence("alice", { id: "v" })]);
    expect((await read("cuentas", "a"))?.monto).toBe(0);
    expect((await read("productos", "p"))?.stock).toBe(2);
    expect(await read("movimientos", "m")).toBeUndefined();
  });
  it("moves a ticket between accounts without trusting a stale previous account", async () => {
    await seed({ "cuentas/a": { nombre: "A", monto: 10 }, "cuentas/b": { nombre: "B", monto: 0 }, "ventas/v": { cliente: "X", cuentaId: "a", total: 10 }, "movimientos/m": { nombre: "Venta", ventaRefId: "v", monto: 10, tipo: "INGRESO", cuentaId: "a" } });
    const input = { uid: "alice", saleId: "v", cliente: "Nuevo", newAccountId: "b", oldAccountId: "a", total: 999, accountName: "B" };
    await Promise.all([persistSaleEdit(input), persistSaleEdit(input)]);
    expect((await read("cuentas", "a"))?.monto).toBe(0);
    expect((await read("cuentas", "b"))?.monto).toBe(10);
    expect((await read("movimientos", "m"))?.cuentaId).toBe("b");
  });
  it("rechecks funds under concurrent transfers", async () => {
    await seed({ "cuentas/a": { nombre: "A", monto: 10 }, "cuentas/b": { nombre: "B", monto: 0 } });
    const save = () => saveBalancedMovement("alice", { nombre: "Transferencia", tipo: "TRANSFERENCIA", monto: 8, cuentaId: "a", cuentaDestinoId: "b", timestamp: new Date() }, [{ col: "cuentas", id: "a", field: "monto", delta: -8 }, { col: "cuentas", id: "b", field: "monto", delta: 8 }], true);
    const result = await Promise.allSettled([save(), save()]);
    expect(result.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await read("cuentas", "a"))?.monto).toBe(2);
    expect((await read("cuentas", "b"))?.monto).toBe(8);
  });
  it("does not lose simultaneous water records or overwrite other daily fields", async () => {
    await Promise.all([1, 2].map(() => changeDailyHealth("alice", "2026-09-05", (current) => ({ agua: current.agua + 1 }))));
    expect((await read("salud_diaria", "2026-09-05"))?.agua).toBe(2);
  });
  it("replays the same checkout once, even after cancellation", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 0 }, "productos/p": { nombre: "Café", precioVenta: 0.1, costo: 0.05, stock: 4 } });
    const request = { requestId: crypto.randomUUID(), items: [{ id: "p", cantidad: 3 }], cuentaId: "a", cliente: "X" };
    const [first, second] = await Promise.all([processCheckout("alice", request), processCheckout("alice", request)]);
    expect(first).toEqual(second);
    expect(first.totalFinal).toBe(0.3);
    expect((await read("cuentas", "a"))?.monto).toBe(0.3);
    const sales = await getDocs(collection(testDb, "users/alice/ventas"));
    expect(sales.size).toBe(1);
    await cancelSalePersistence("alice", { id: sales.docs[0].id });
    expect(await processCheckout("alice", request)).toEqual(first);
    expect((await read("cuentas", "a"))?.monto).toBe(0);
    expect((await read("productos", "p"))?.stock).toBe(4);
  });
  it("rolls back all products when one item lacks stock", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 0 }, "productos/p": { nombre: "Café", precioVenta: 10, costo: 2, stock: 4 }, "productos/q": { nombre: "Té", precioVenta: 5, costo: 1, stock: 0 } });
    await expect(processCheckout("alice", { requestId: crypto.randomUUID(), items: [{ id: "p", cantidad: 1 }, { id: "q", cantidad: 1 }], cuentaId: "a" })).rejects.toThrow("Stock insuficiente");
    expect((await read("productos", "p"))?.stock).toBe(4);
    expect((await read("cuentas", "a"))?.monto).toBe(0);
  });
  it("rejects manipulated document paths and fractional quantities", async () => {
    await expect(processCheckout("alice", { requestId: crypto.randomUUID(), items: [{ id: "p/other/doc", cantidad: 1 }], cuentaId: "a" })).rejects.toMatchObject({ status: 400 });
    await expect(processCheckout("alice", { requestId: crypto.randomUUID(), items: [{ id: "p", cantidad: 1.5 }], cuentaId: "a" })).rejects.toMatchObject({ status: 400 });
  });
  it("persists a rejection so a delayed retry cannot charge after restocking", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 0 }, "productos/p": { nombre: "Café", precioVenta: 10, costo: 2, stock: 0 } });
    const request = { requestId: crypto.randomUUID(), items: [{ id: "p", cantidad: 1 }], cuentaId: "a" };
    await expect(processCheckout("alice", request)).rejects.toMatchObject({ operationResolved: true });
    await seed({ "productos/p": { nombre: "Café", precioVenta: 10, costo: 2, stock: 3 } });
    await expect(processCheckout("alice", request)).rejects.toMatchObject({ operationResolved: true });
    expect((await read("productos", "p"))?.stock).toBe(3);
    expect((await read("cuentas", "a"))?.monto).toBe(0);
    expect((await getDocs(collection(testDb, "users/alice/ventas"))).size).toBe(0);
  });
  it("rejects reuse of a checkout key with a different cart", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 0 }, "productos/p": { nombre: "Café", precioVenta: 10, costo: 2, stock: 3 } });
    const request = { requestId: crypto.randomUUID(), items: [{ id: "p", cantidad: 1 }], cuentaId: "a" };
    await processCheckout("alice", request);
    await expect(processCheckout("alice", { ...request, items: [{ id: "p", cantidad: 2 }] })).rejects.toMatchObject({ status: 409 });
    expect((await read("cuentas", "a"))?.monto).toBe(10);
  });
  it("preserves stock when an old product form attempts to overwrite a sale", async () => {
    await seed({ "productos/p": { nombre: "Café", precioVenta: 10, costo: 2, stock: 3 } });
    await expect(updateProduct("alice", "p", { stock: 4 }, 4)).rejects.toThrow("stock cambió");
    expect((await read("productos", "p"))?.stock).toBe(3);
  });
  it("protects savings and accounts with historical references from deletion", async () => {
    await seed({ "cuentas/a": { nombre: "Caja", monto: 0 }, "metas/g": { nombre: "Viaje", montoActual: 25 }, "movimientos/m": { nombre: "Antes", cuentaId: "a", monto: 1, tipo: "GASTO", timestamp: new Date(2020, 0, 1) } });
    await expect(deleteEmptyAccount("alice", "a")).rejects.toThrow("asociados");
    await expect(deleteEmptyGoal("alice", "g")).rejects.toThrow("ahorros");
    expect(await read("metas", "g")).toBeDefined();
  });
  it("closes budget history with the actual previous month, without discarding old entries", async () => {
    await seed({ "presupuestos/b": { categoria: "salud", limite: 100, historial: [{ mes: 7, año: 2026, limite: 20, gastado: 0 }, { mes: 6, año: 2026, limite: 20, gastado: 5 }] }, "movimientos/aug": { nombre: "Agosto", monto: 25, tipo: "GASTO", categoria: "salud", timestamp: new Date(2026, 7, 15) }, "movimientos/sep": { nombre: "Septiembre", monto: 99, tipo: "GASTO", categoria: "salud", timestamp: new Date(2026, 8, 2) } });
    await Promise.all([syncBudgetHistory("alice", "b", new Date(2026, 8, 5)), syncBudgetHistory("alice", "b", new Date(2026, 8, 5))]);
    const history = (await read("presupuestos", "b"))?.historial;
    expect(history).toHaveLength(3);
    expect(history[1]).toMatchObject({ gastado: 25, superado: true });
    expect(history[2].gastado).toBe(5);
  });
  it("denies client access to private receipts and blocks writes during deletion", async () => {
    await expect(getDoc(ref("checkoutRequests", "private"))).rejects.toMatchObject({ code: "permission-denied" });
    await getFirestore(adminApp).doc("deletionRequests/alice").set({ status: "processing" });
    await expect(setDoc(ref("cuentas", "a"), { nombre: "Caja", monto: 0 })).rejects.toMatchObject({ code: "permission-denied" });
    await expect(processCheckout("alice", { requestId: crypto.randomUUID(), items: [{ id: "p", cantidad: 1 }], cuentaId: "a" })).rejects.toThrow("eliminación");
  });

});
