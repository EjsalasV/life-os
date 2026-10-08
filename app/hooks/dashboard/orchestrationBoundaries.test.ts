import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("application orchestration boundaries", () => {
  it("keeps finance free of health, profile and sales dispatch imports", () => {
    const source = read("app/hooks/useFinanzas.ts");
    expect(source).not.toMatch(/modules\/health|HealthForm|profileService|cancelSale/);
  });

  it("keeps modal domain payload construction outside the composition root", () => {
    const source = read("app/hooks/useDashboardApp.js");
    expect(source).not.toMatch(/foodName|registrarAlimento|addWater/);
  });

  it("documents unique ownership for the public action names", () => {
    const groups = [
      ["updateStreak", "handleFinishOnboarding", "handleNoSpendToday"],
      ["isCheckingOut", "isSavingProducts", "retryPendingCheckout", "addToCart", "handleCheckout", "handleProductSave", "cancelSaleItem", "deleteProduct"],
      ["isSaving", "handleSave", "deleteItem"],
      ["saludHoy", "historialSalud", "registrarAlimento", "removeAlimento", "addWater", "removeWater", "toggleComida", "toggleHabitCheck", "toggleFasting", "restoreFasting", "resetDailyHealth"],
      ["handleTogglePlan", "handleUpdateName", "handleUpdateFocus", "handleUploadProfilePhoto", "handleRemoveProfilePhoto"]
    ];
    const names = groups.flat();
    expect(new Set(names).size).toBe(names.length);
  });
});
