import { readPendingCheckout, storePendingCheckout, clearPendingCheckout } from "./pendingCheckout";
import type { ItemCarrito } from "@/app/types";
import { auth } from "@/services/firebase/client";

interface CheckoutRequest {
  items: Array<Pick<ItemCarrito, "id" | "cantidad">>;
  cuentaId: string;
  cliente: string;
  lastReceiptNumber: number;
}

interface CheckoutResponse {
  reciboId: string;
  totalFinal: number;
}

async function authenticatedPost<T>(path: string, payload: unknown, forceRefresh = false): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Debes iniciar sesión.");
  const token = await user.getIdToken(forceRefresh);
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({})) as { error?: string; operationResolved?: boolean } & T;
  if (!response.ok) throw Object.assign(new Error(data.error || "No se pudo completar la operación."), { status: response.status, operationResolved: data.operationResolved === true });
  return data;
}

export async function createSaleSecurely(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Debes iniciar sesión.");
  const previous = readPendingCheckout(uid);
  const pending = previous || { ...payload, requestId: crypto.randomUUID() };
  storePendingCheckout(uid, pending);
  try {
    const result = await authenticatedPost<CheckoutResponse>("/api/checkout", pending);
    clearPendingCheckout(uid);
    return result;
  } catch (error) {
    // Durable rejection receipts also resolve retries after a lost network response.
    const status = (error as { status?: number }).status;
    if ((error as { operationResolved?: boolean }).operationResolved || (!previous && status && status >= 400 && status < 500)) clearPendingCheckout(uid);
    throw error;
  }
}

export async function requestAccountDeletion(): Promise<void> {
  await authenticatedPost<{ status: string }>("/api/account/delete", {}, true);
}

export async function hasPendingAccountDeletion(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  const response = await fetch("/api/account/delete", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
  if (!response.ok) throw new Error("No se pudo consultar la eliminación pendiente.");
  return (await response.json()).pending === true;
}
