import { ApiError } from "@/services/api/serverAuth";
import { privateIntegrationErrorResponse, privateIntegrationJson } from "@/services/api/privateIntegrationResponse";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { getTelegramContext } from "@/modules/integrations/telegram/telegramIntegrationService";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  try {
    requireTelegramIntegrationKey(request);
    const telegramUserId = new URL(request.url).searchParams.get("telegramUserId");
    if (!telegramUserId) throw new ApiError("Falta telegramUserId.", 400);
    return privateIntegrationJson(await getTelegramContext(getAdminFirestore(), telegramUserId));
  } catch (error) { return privateIntegrationErrorResponse(error); }
}
