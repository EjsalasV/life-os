import type { Cuenta, FinanceForm, HealthForm, ProductForm } from '@/app/types';

export interface FinanceActionContext {
  uid: string;
  isPro: boolean;
  cuentas: Cuenta[];
  productosCount: number;
  financeForm: FinanceForm;
  productForm: ProductForm;
  healthForm: HealthForm;
  updateStreakExternal: () => Promise<boolean>;
}

export type FinanceSaveAction = (ctx: FinanceActionContext) => Promise<void>;
