import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
});
