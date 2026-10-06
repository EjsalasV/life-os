import { ApiError, apiErrorResponse } from "@/services/api/serverAuth";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { createTelegramCardPayment } from "@/modules/integrations/telegram/telegramIntegrationService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    requireTelegramIntegrationKey(request);
    let body: unknown;
    try { body = await request.json(); } catch { throw new ApiError("Solicitud inválida.", 400); }
    return Response.json(await createTelegramCardPayment(getAdminFirestore(), body));
  } catch (error) { return apiErrorResponse(error); }
}
