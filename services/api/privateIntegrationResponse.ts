import { apiErrorResponse } from "@/services/api/serverAuth";

const privateCacheControl = "private, no-store";

export function privateIntegrationJson<T>(body: T, init?: ResponseInit): Response {
  const response = Response.json(body, init);
  response.headers.set("Cache-Control", privateCacheControl);
  return response;
}

export function privateIntegrationErrorResponse(error: unknown): Response {
  const response = apiErrorResponse(error);
  response.headers.set("Cache-Control", privateCacheControl);
  return response;
}
