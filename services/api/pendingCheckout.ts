import { z } from "zod";

const pendingSchema = z.object({
  requestId: z.string().uuid(),
  items: z.array(z.object({ id: z.string().min(1), cantidad: z.number().int().positive() })).min(1),
  cuentaId: z.string().min(1), cliente: z.string(), lastReceiptNumber: z.number().int().nonnegative()
});
export type PendingCheckout = z.infer<typeof pendingSchema>;
const key = (uid: string) => `lifeos-pending-checkout-${uid}`;
export function readPendingCheckout(uid: string): PendingCheckout | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key(uid));
  if (!raw) return null;
  try { return pendingSchema.parse(JSON.parse(raw)); }
  catch { throw new Error("No se pudo leer el cobro pendiente. Conserva los datos del navegador y revisa el historial antes de cobrar otra vez."); }
}
export function storePendingCheckout(uid: string, payload: PendingCheckout) {
  try { localStorage.setItem(key(uid), JSON.stringify(payload)); }
  catch { throw new Error("Activa el almacenamiento del navegador para poder recuperar el cobro si falla la conexión."); }
}
export function clearPendingCheckout(uid: string) { localStorage.removeItem(key(uid)); }
