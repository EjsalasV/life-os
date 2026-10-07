import { ApiError, requireFirebaseUser } from "@/services/api/serverAuth";
import { privateIntegrationErrorResponse, privateIntegrationJson } from "@/services/api/privateIntegrationResponse";
import { getAdminFirestore } from "@/services/firebase/admin";
import { confirmTelegramLink } from "@/modules/integrations/telegram/telegramIntegrationService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    const { uid } = await requireFirebaseUser(request);
    let body: unknown;
    try { body = await request.json(); } catch { throw new ApiError("Solicitud inválida.", 400); }
    const token = body && typeof body === "object" ? (body as { token?: unknown }).token : undefined;
    if (typeof token !== "string") throw new ApiError("Falta el token de vinculación.", 400);
    return privateIntegrationJson(await confirmTelegramLink(getAdminFirestore(), token, uid));
  } catch (error) { return privateIntegrationErrorResponse(error); }
}
