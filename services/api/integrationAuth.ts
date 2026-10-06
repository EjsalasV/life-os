import { timingSafeEqual } from "node:crypto";
import { ApiError } from "@/services/api/serverAuth";

const INTEGRATION_KEY = "LIFE_OS_TELEGRAM_INTEGRATION_KEY";

export function requireTelegramIntegrationKey(request: Request): void {
  const expected = process.env[INTEGRATION_KEY];
  if (!expected) throw new ApiError("La integración no está configurada.", 503);

  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const supplied = match?.[1] || request.headers.get("x-life-os-integration-key") || "";
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  const valid = expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
  if (!valid) throw new ApiError("No autorizado.", 401);
}
