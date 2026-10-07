import { describe, expect, it } from "vitest";
import { ApiError } from "@/services/api/serverAuth";
import { privateIntegrationErrorResponse, privateIntegrationJson } from "@/services/api/privateIntegrationResponse";

describe("private integration responses", () => {
  it("marks successful responses as private and non-cacheable", async () => {
    const response = privateIntegrationJson({ ok: true });
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ ok: true });
  });

  it("marks error responses as private and non-cacheable", async () => {
    const response = privateIntegrationErrorResponse(new ApiError("No autorizado.", 401));
    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({ error: "No autorizado." });
  });
});
