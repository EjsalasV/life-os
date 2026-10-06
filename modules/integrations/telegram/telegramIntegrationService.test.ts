import { describe, expect, it } from "vitest";
import { parseTelegramMovement } from "./telegramIntegrationService";

describe("Telegram finance input", () => {
  const valid = {
    telegramUserId: "123456789",
    type: "GASTO",
    amount: 4,
    concept: "Uber",
    categoryId: "transporte",
    accountId: "account-1"
  };

  it("accepts a valid expense", () => {
    expect(parseTelegramMovement(valid)).toMatchObject({ ...valid, amount: "4" });
  });

  it("rejects zero or negative amounts", () => {
    expect(() => parseTelegramMovement({ ...valid, amount: 0 })).toThrow("mayor que cero");
    expect(() => parseTelegramMovement({ ...valid, amount: -1 })).toThrow("mayor que cero");
  });

  it("rejects an invalid category", () => {
    expect(() => parseTelegramMovement({ ...valid, categoryId: "secret-category" })).toThrow("categoría no es válida");
  });

  it("only accepts income and expense", () => {
    expect(() => parseTelegramMovement({ ...valid, type: "TRANSFERENCIA" })).toThrow();
  });
});
