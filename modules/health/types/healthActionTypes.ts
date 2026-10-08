import type { HealthForm } from "@/modules/health/types/healthTypes";

export interface HealthActionContext {
  uid: string;
  isPro: boolean;
  healthForm: HealthForm;
}

export type HealthSaveAction = (ctx: HealthActionContext) => Promise<void>;
