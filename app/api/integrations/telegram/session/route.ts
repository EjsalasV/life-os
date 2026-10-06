import { ApiError, apiErrorResponse } from "@/services/api/serverAuth";
import { requireTelegramIntegrationKey } from "@/services/api/integrationAuth";
import { getAdminFirestore } from "@/services/firebase/admin";
import { deleteTelegramSession, getTelegramSession, patchTelegramSession, putTelegramSession } from "@/modules/integrations/telegram/telegramSessionService";

export const runtime = "nodejs";

function queryTelegramUserId(request: Request) {
  const value = new URL(request.url).searchParams.get("telegramUserId");
  if (!value) throw new ApiError("Falta telegramUserId.", 400);
  return value;
}

async function jsonBody(request: Request) {
  try { return await request.json(); } catch { throw new ApiError("Solicitud inválida.", 400); }
}

export async function GET(request: Request): Promise<Response> {
  try { requireTelegramIntegrationKey(request); return Response.json(await getTelegramSession(getAdminFirestore(), queryTelegramUserId(request))); }
  catch (error) { return apiErrorResponse(error); }
}

export async function PUT(request: Request): Promise<Response> {
  try { requireTelegramIntegrationKey(request); return Response.json(await putTelegramSession(getAdminFirestore(), await jsonBody(request))); }
  catch (error) { return apiErrorResponse(error); }
}

export async function PATCH(request: Request): Promise<Response> {
  try { requireTelegramIntegrationKey(request); return Response.json(await patchTelegramSession(getAdminFirestore(), await jsonBody(request))); }
  catch (error) { return apiErrorResponse(error); }
}

export async function DELETE(request: Request): Promise<Response> {
  try { requireTelegramIntegrationKey(request); return Response.json(await deleteTelegramSession(getAdminFirestore(), queryTelegramUserId(request))); }
  catch (error) { return apiErrorResponse(error); }
}
