import { FieldValue } from "firebase-admin/firestore";
import { ApiError, apiErrorResponse, requireFirebaseUser } from "@/services/api/serverAuth";
import { getAdminFirestore } from "@/services/firebase/admin";

export const runtime = "nodejs";

interface CheckoutBody {
  items?: Array<{ id?: unknown; cantidad?: unknown }>;
  cuentaId?: unknown;
  cliente?: unknown;
  lastReceiptNumber?: unknown;
}

function positiveInteger(value: unknown, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(`${label} debe ser un entero positivo.`, 400);
  }
  return parsed;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { uid } = await requireFirebaseUser(request);
    const body = await request.json() as CheckoutBody;
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      throw new ApiError("Venta inválida.", 400);
    }
    if (typeof body.cuentaId !== "string" || !body.cuentaId.trim()) {
      throw new ApiError("Debes seleccionar una cuenta.", 400);
    }

    const quantities = new Map<string, number>();
    for (const item of body.items) {
      if (typeof item?.id !== "string" || !item.id) throw new ApiError("Producto inválido.", 400);
      quantities.set(item.id, (quantities.get(item.id) || 0) + positiveInteger(item.cantidad, "cantidad"));
    }

    const db = getAdminFirestore();
    const userRef = db.doc(`users/${uid}`);
    const counterRef = userRef.collection("counters").doc("sales");
    const saleRef = userRef.collection("ventas").doc();
    const movementRef = userRef.collection("movimientos").doc();
    const accountRef = userRef.collection("cuentas").doc(body.cuentaId);
    const productRefs = [...quantities.keys()].map((id) => userRef.collection("productos").doc(id));

    const result = await db.runTransaction(async (transaction) => {
      const [counterSnapshot, accountSnapshot, ...productSnapshots] = await Promise.all([
        transaction.get(counterRef),
        transaction.get(accountRef),
        ...productRefs.map((reference) => transaction.get(reference))
      ]);
      if (!accountSnapshot.exists) throw new ApiError("La cuenta ya no existe.", 409);

      let totalCents = 0;
      let costCents = 0;
      const normalizedItems = productSnapshots.map((snapshot) => {
        if (!snapshot.exists) throw new ApiError("Un producto ya no existe.", 409);
        const product = snapshot.data()!;
        const quantity = quantities.get(snapshot.id)!;
        const stock = Number(product.stock || 0);
        if (stock < quantity) throw new ApiError(`Stock insuficiente de ${product.nombre || snapshot.id}.`, 409);

        const priceCents = Math.round(Number(product.precioVenta || 0) * 100);
        const itemCostCents = Math.round(Number(product.costo || 0) * 100);
        totalCents += priceCents * quantity;
        costCents += itemCostCents * quantity;
        transaction.update(snapshot.ref, { stock: stock - quantity });
        return {
          id: snapshot.id,
          nombre: String(product.nombre || "Producto"),
          cantidad: quantity,
          precioUnitario: priceCents / 100,
          subtotal: (priceCents * quantity) / 100
        };
      });

      const currentCounter = Number(counterSnapshot.data()?.lastReceipt || 0);
      const clientCounter = Math.max(0, Number(body.lastReceiptNumber) || 0);
      const nextReceipt = Math.max(currentCounter, clientCounter) + 1;
      const reciboId = String(nextReceipt).padStart(4, "0");
      const totalFinal = totalCents / 100;
      const costFinal = costCents / 100;
      const timestamp = FieldValue.serverTimestamp();

      transaction.set(counterRef, { lastReceipt: nextReceipt, updatedAt: timestamp }, { merge: true });
      transaction.set(saleRef, {
        reciboId,
        cliente: String(body.cliente || "Consumidor Final").slice(0, 100),
        items: normalizedItems,
        total: totalFinal,
        costoTotal: costFinal,
        ganancia: totalFinal - costFinal,
        cuentaId: body.cuentaId,
        timestamp
      });
      transaction.update(accountRef, { monto: FieldValue.increment(totalFinal) });
      transaction.set(movementRef, {
        nombre: `Venta Ticket #${reciboId}`,
        monto: totalFinal,
        tipo: "INGRESO",
        categoria: "ventas",
        cuentaId: body.cuentaId,
        cuentaNombre: String(accountSnapshot.data()!.nombre || "Caja"),
        ventaRefId: saleRef.id,
        timestamp
      });
      return { reciboId, totalFinal };
    });

    return Response.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
