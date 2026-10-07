import { ApiError, apiErrorResponse } from "@/services/api/serverAuth";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { getHealthContext } from "@/modules/health/server/healthIntegrationService";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  try {
    requireTelegramIntegrationKey(request);
    const telegramUserId = new URL(request.url).searchParams.get("telegramUserId");
    if (!telegramUserId) throw new ApiError("Falta telegramUserId.", 400);
    return Response.json(await getHealthContext(getAdminFirestore(), telegramUserId));
  } catch (error) { return apiErrorResponse(error); }
}
