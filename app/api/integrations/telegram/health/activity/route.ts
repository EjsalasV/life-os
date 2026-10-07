import { privateIntegrationErrorResponse, privateIntegrationJson } from "@/services/api/privateIntegrationResponse";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { addHealthActivity } from "@/modules/health/server/healthIntegrationService";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    requireTelegramIntegrationKey(request);
    return privateIntegrationJson(await addHealthActivity(getAdminFirestore(), await request.json()));
  } catch (error) { return privateIntegrationErrorResponse(error); }
}
