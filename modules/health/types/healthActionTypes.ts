import type { HealthForm } from "@/app/types";

export interface HealthActionContext {
  uid: string;
  isPro: boolean;
  healthForm: HealthForm;
}

export type HealthSaveAction = (ctx: HealthActionContext) => Promise<void>;
