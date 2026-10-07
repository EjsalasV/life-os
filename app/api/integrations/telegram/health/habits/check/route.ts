import { apiErrorResponse } from "@/services/api/serverAuth";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { checkHealthHabit } from "@/modules/health/server/healthIntegrationService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    requireTelegramIntegrationKey(request);
    return Response.json(await checkHealthHabit(getAdminFirestore(), await request.json()));
  } catch (error) { return apiErrorResponse(error); }
}
