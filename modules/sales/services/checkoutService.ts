import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminFirestore } from "@/services/firebase/admin";
import { ApiError } from "@/services/api/serverAuth";
import { adjustedBalance, moneyCents } from "@/lib/money";

const id = z.string().min(1).max(128).regex(/^[^/]+$/);
const schema = z.object({
  requestId: z.string().uuid(),
  items: z.array(z.object({ id, cantidad: z.number().int().positive().max(1_000_000) })).min(1).max(100),
  cuentaId: id,
  cliente: z.string().trim().max(100).default("Consumidor Final"),
  lastReceiptNumber: z.number().int().nonnegative().max(1_000_000_000).optional()
});

export async function processCheckout(uid: string, input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new ApiError("Revisa los productos, las cantidades y la cuenta de la venta.", 400);
  const body = parsed.data;
  const quantities = new Map<string, number>();
  body.items.forEach((item) => quantities.set(item.id, (quantities.get(item.id) || 0) + item.cantidad));
  const fingerprint = createHash("sha256").update(JSON.stringify({
    items: [...quantities].sort(([a], [b]) => a.localeCompare(b)), cuentaId: body.cuentaId, cliente: body.cliente
  })).digest("hex");
  const db = getAdminFirestore();
  const user = db.doc(`users/${uid}`);
  const proofRef = user.collection("checkoutRequests").doc(body.requestId);
  const counterRef = user.collection("counters").doc("sales");
  const saleRef = user.collection("ventas").doc();
  const movementRef = user.collection("movimientos").doc();
  const accountRef = user.collection("cuentas").doc(body.cuentaId);
  const productRefs = [...quantities.keys()].map((key) => user.collection("productos").doc(key));
  const outcome = await db.runTransaction(async (tx): Promise<{ result?: { reciboId: string; totalFinal: number }; rejection?: { message: string; status: number } }> => {
    const [proof, deletion] = await Promise.all([tx.get(proofRef), tx.get(db.doc(`deletionRequests/${uid}`))]);
    if (deletion.exists) throw new ApiError("La cuenta está en proceso de eliminación.", 409);
    if (proof.exists) {
      const saved = proof.data()!;
      if (saved.fingerprint !== fingerprint) throw new ApiError("Hay un cobro pendiente con datos diferentes. Recupera la venta pendiente antes de continuar.", 409);
      return saved.rejection ? { rejection: saved.rejection } : { result: saved.result };
    }
    const [counter, account, ...products] = await Promise.all([
      tx.get(counterRef), tx.get(accountRef), ...productRefs.map((r) => tx.get(r))
    ]);
    try {
    if (!account.exists) throw new ApiError("La cuenta ya no existe.", 409);
    let total = 0;
    let cost = 0;
    const items = products.map((snapshot) => {
      if (!snapshot.exists) throw new ApiError("Un producto ya no existe.", 409);
      const product = snapshot.data()!;
      const quantity = quantities.get(snapshot.id)!;
      if (!Number.isSafeInteger(product.stock) || product.stock < quantity) throw new ApiError("Stock insuficiente o inválido. Revisa el inventario.", 409);
      let price: number; let itemCost: number;
      try { price = moneyCents(product.precioVenta); itemCost = moneyCents(product.costo); }
      catch { throw new ApiError("Un producto tiene un precio o costo inválido.", 409); }
      if (price <= 0 || itemCost < 0) throw new ApiError("Un producto tiene un precio o costo inválido.", 409);
      total += price * quantity;
      cost += itemCost * quantity;

      return { id: snapshot.id, nombre: String(product.nombre || "Producto"), cantidad: quantity, precioUnitario: price / 100, subtotal: price * quantity / 100 };
    });
    if (!Number.isSafeInteger(total) || !Number.isSafeInteger(cost)) throw new ApiError("El importe de la venta es demasiado grande.", 400);
    const currentCounter = counter.data()?.lastReceipt || 0;
    const nextReceipt = Math.max(currentCounter, body.lastReceiptNumber || 0) + 1;
    if (!Number.isSafeInteger(nextReceipt)) throw new ApiError("El contador de recibos no es válido.", 409);
    const result = { reciboId: String(nextReceipt).padStart(4, "0"), totalFinal: total / 100 };
    const nextBalance = adjustedBalance(account.data()!.monto, total / 100);
    const timestamp = FieldValue.serverTimestamp();
    products.forEach((snapshot) => tx.update(snapshot.ref, { stock: snapshot.data()!.stock - quantities.get(snapshot.id)! }));
    tx.set(counterRef, { lastReceipt: nextReceipt, updatedAt: timestamp }, { merge: true });
    tx.set(saleRef, {
      reciboId: result.reciboId, total: total / 100, costoTotal: cost / 100, ganancia: (total - cost) / 100,
      cliente: body.cliente || "Consumidor Final", items, cuentaId: body.cuentaId, timestamp
    });
    tx.update(accountRef, { monto: nextBalance });
    tx.set(movementRef, {
      nombre: `Venta Ticket #${result.reciboId}`, monto: total / 100, tipo: "INGRESO", categoria: "ventas",
      cuentaId: body.cuentaId, cuentaNombre: String(account.data()!.nombre || "Caja"), ventaRefId: saleRef.id, timestamp
    });
    tx.set(proofRef, { fingerprint, result, saleId: saleRef.id, timestamp });
    return { result };
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      // A terminal rejection is durable too: a delayed attempt cannot charge later.
      const rejection = { message: error.message, status: error.status };
      tx.set(proofRef, { fingerprint, rejection, timestamp: FieldValue.serverTimestamp() });
      return { rejection };
    }
  });
  if (outcome.rejection) throw new ApiError(outcome.rejection.message, outcome.rejection.status, true);
  return outcome.result!;
}
