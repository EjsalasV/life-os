import { saveHabito, savePeso } from "./healthSaveActions";
import type { HealthSaveAction } from "@/modules/health/types/healthActionTypes";

export const healthSaveActions: Record<string, HealthSaveAction> = {
  peso: savePeso,
  habitos: saveHabito
};
