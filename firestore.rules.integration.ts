import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createInitialPet } from "@/app/lib/petStateEngine";

let environment: RulesTestEnvironment;

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: "life-os-rules-test",
    firestore: { rules: readFileSync(resolve("firestore.rules"), "utf8") }
  });
});

beforeEach(() => environment.clearFirestore());
afterAll(() => environment.cleanup());

describe("Firestore security rules", () => {
  it("isolates each user's data", async () => {
    const alice = environment.authenticatedContext("alice", { email: "alice@example.com" }).firestore();
    const bob = environment.authenticatedContext("bob", { email: "bob@example.com" }).firestore();
    await assertSucceeds(setDoc(doc(alice, "users/alice"), {
      name: "Alice", email: "alice@example.com", plan: "pro", isNew: false
    }));
    await assertFails(getDoc(doc(bob, "users/alice")));
  });

  it("validates fixed expenses", async () => {
    const db = environment.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(db, "users/alice/fijos/rent"), {
      nombre: "Renta", monto: 500, periodicidad: "Mensual", diaCobro: "1"
    }));
    await assertFails(setDoc(doc(db, "users/alice/fijos/bad"), { monto: 500 }));
  });

  it("only lets the backend create sales", async () => {
    const db = environment.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "users/alice/ventas/v1"), {
      cliente: "Cliente", total: 10, items: [], cuentaId: "c1"
    }));
  });

  it("allows ticket labels but protects totals", async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users/alice/ventas/v1"), {
        cliente: "Original", total: 10, items: [], cuentaId: "c1"
      });
    });
    const db = environment.authenticatedContext("alice").firestore();
    await assertSucceeds(updateDoc(doc(db, "users/alice/ventas/v1"), { cliente: "Nuevo" }));
    await assertFails(updateDoc(doc(db, "users/alice/ventas/v1"), { total: 999 }));
  });

  it("rejects negative stock", async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users/alice/productos/p1"), {
        nombre: "Café", precioVenta: 5, costo: 2, stock: 1
      });
    });
    const db = environment.authenticatedContext("alice").firestore();
    await assertFails(updateDoc(doc(db, "users/alice/productos/p1"), { stock: -1 }));
  });

  it("keeps the legacy health collection owned and schema-constrained", async () => {
    const alice = environment.authenticatedContext("alice").firestore();
    const bob = environment.authenticatedContext("bob").firestore();
    const valid = {
      fecha: "2026-10-08",
      bateria: 60,
      agua: 2,
      animo: "normal",
      ejercicioMinutos: 30,
      comidas: {},
      habitosChecks: [],
      alimentos: [],
      caloriasTotales: 0,
      proteinaTotal: 0,
      carbohidratosTotal: 0,
      grasasTotal: 0,
      vitaminasConsumo: {},
      mineralesConsumo: {},
      indiceInflamatorioPromedio: 0
    };

    await assertSucceeds(setDoc(doc(alice, "users/alice/salud/legacy-day"), valid));
    await assertFails(setDoc(doc(alice, "users/alice/salud/with-extra"), { ...valid, arbitrary: true }));
    await assertFails(setDoc(doc(alice, "users/alice/salud/with-wrong-type"), { ...valid, agua: "2" }));
    await assertFails(getDoc(doc(bob, "users/alice/salud/legacy-day")));
    await assertFails(updateDoc(doc(bob, "users/alice/salud/legacy-day"), { agua: 3 }));
    await assertFails(deleteDoc(doc(alice, "users/alice/salud/legacy-day")));
  });

  it("preserves current pet writes while rejecting foreign and malformed writes", async () => {
    const alice = environment.authenticatedContext("alice").firestore();
    const bob = environment.authenticatedContext("bob").firestore();
    const pet = createInitialPet("2026-10-08T12:00:00.000Z");
    const ref = doc(alice, "users/alice/pet/main");

    await assertSucceeds(setDoc(ref, pet));
    await assertSucceeds(updateDoc(ref, { nombre: "Michi" }));
    await assertFails(updateDoc(ref, { arbitrary: true }));
    await assertFails(updateDoc(ref, { salud: "alta" }));
    await assertFails(updateDoc(doc(bob, "users/alice/pet/main"), { nombre: "Intruso" }));
    await assertFails(deleteDoc(ref));
  });

  it("validates goal lifecycle and preserves its zero-savings delete policy", async () => {
    const alice = environment.authenticatedContext("alice").firestore();
    const bob = environment.authenticatedContext("bob").firestore();
    const ref = doc(alice, "users/alice/metas/goal-1");
    const valid = { nombre: "Viaje", montoObjetivo: 1000, montoActual: 0, timestamp: new Date() };

    await assertSucceeds(setDoc(ref, valid));
    await assertSucceeds(updateDoc(ref, { nombre: "Viaje largo" }));
    await assertSucceeds(updateDoc(ref, { montoActual: 25 }));
    await assertFails(updateDoc(ref, { arbitrary: true }));
    await assertFails(updateDoc(doc(bob, "users/alice/metas/goal-1"), { nombre: "Intruso" }));
    await assertFails(deleteDoc(ref));
    await assertSucceeds(updateDoc(ref, { montoActual: 0 }));
    await assertSucceeds(deleteDoc(ref));
  });
});
