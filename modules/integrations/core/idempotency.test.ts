import { describe, expect, it } from "vitest";
import { createIdempotencyFingerprint, readIdempotentResult, sha256 } from "@/modules/integrations/core/idempotency";

describe("shared integration idempotency", () => {
  it("preserves the SHA-256 algorithm used by Telegram and Health", () => {
    const serialized = JSON.stringify({ operation: "health-water", telegramUserId: "123", payload: { amount: 2 } });
    expect(createIdempotencyFingerprint(serialized)).toBe(sha256(serialized));
    expect(sha256("123:key")).toBe("a4931c6542af20425f032d8d7abeeb22854a9511b5e3398faf651b3433e30515");
  });

  it("replays the same fingerprint and rejects a reused key with different data", () => {
    const snapshot = { exists: true, data: () => ({ fingerprint: "same", result: { ok: true } }) };
    expect(readIdempotentResult(snapshot, "same")).toEqual({ ok: true });
    expect(() => readIdempotentResult(snapshot, "different")).toThrow("idempotencyKey");
  });
});
