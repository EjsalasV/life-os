import { ApiError } from "@/services/api/serverAuth";
import { privateIntegrationErrorResponse, privateIntegrationJson } from "@/services/api/privateIntegrationResponse";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { createTelegramCardPurchase } from "@/modules/integrations/telegram/telegramIntegrationService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    requireTelegramIntegrationKey(request);
    let body: unknown;
    try { body = await request.json(); } catch { throw new ApiError("Solicitud inválida.", 400); }
    return privateIntegrationJson(await createTelegramCardPurchase(getAdminFirestore(), body));
  } catch (error) { return privateIntegrationErrorResponse(error); }
}
