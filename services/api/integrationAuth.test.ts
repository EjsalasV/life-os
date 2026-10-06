import { afterEach, describe, expect, it, vi } from "vitest";
import { requireTelegramIntegrationKey } from "./integrationAuth";

afterEach(() => vi.unstubAllEnvs());

describe("Telegram integration authorization", () => {
  it("rejects a missing key", () => {
    vi.stubEnv("LIFE_OS_TELEGRAM_INTEGRATION_KEY", "expected-secret");
    expect(() => requireTelegramIntegrationKey(new Request("http://localhost"))).toThrow("No autorizado");
  });

  it("accepts the configured bearer key", () => {
    vi.stubEnv("LIFE_OS_TELEGRAM_INTEGRATION_KEY", "expected-secret");
    expect(() => requireTelegramIntegrationKey(new Request("http://localhost", {
      headers: { Authorization: "Bearer expected-secret" }
    }))).not.toThrow();
  });

  it("rejects an unconfigured integration", () => {
    vi.stubEnv("LIFE_OS_TELEGRAM_INTEGRATION_KEY", "");
    expect(() => requireTelegramIntegrationKey(new Request("http://localhost"))).toThrow("no está configurada");
  });
});
