import { ApiError, apiErrorResponse } from "@/services/api/serverAuth";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { startTelegramLink } from "@/modules/integrations/telegram/telegramIntegrationService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    requireTelegramIntegrationKey(request);
    let body: unknown;
    try { body = await request.json(); } catch { throw new ApiError("Solicitud inválida.", 400); }
    const telegramUserId = body && typeof body === "object" ? (body as { telegramUserId?: unknown }).telegramUserId : undefined;
    return Response.json(await startTelegramLink(getAdminFirestore(), telegramUserId, new URL(request.url).origin));
  } catch (error) { return apiErrorResponse(error); }
}
