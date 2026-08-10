import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/services/firebase/admin";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function requireFirebaseUser(request: Request): Promise<DecodedIdToken> {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new ApiError("Debes iniciar sesión.", 401);

  try {
    return await getAdminAuth().verifyIdToken(match[1], true);
  } catch {
    throw new ApiError("La sesión no es válida o expiró.", 401);
  }
}

export function apiErrorResponse(error: unknown): Response {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof ApiError ? error.message : "Error interno del servidor.";
  if (status === 500) console.error(error);
  return Response.json({ error: message }, { status });
}
