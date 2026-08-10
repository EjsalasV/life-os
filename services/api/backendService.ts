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
  const data = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(data.error || "No se pudo completar la operación.");
  return data;
}

export function createSaleSecurely(payload: CheckoutRequest): Promise<CheckoutResponse> {
  return authenticatedPost<CheckoutResponse>("/api/checkout", payload);
}

export async function requestAccountDeletion(): Promise<void> {
  await authenticatedPost<{ status: string }>("/api/account/delete", {}, true);
}
