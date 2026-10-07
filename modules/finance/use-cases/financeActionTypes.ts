import type { Cuenta, FinanceForm, ProductForm } from '@/app/types';

export interface FinanceActionContext {
  uid: string;
  isPro: boolean;
  cuentas: Cuenta[];
  productosCount: number;
  financeForm: FinanceForm;
  productForm: ProductForm;
  updateStreakExternal: () => Promise<boolean>;
}

export type FinanceSaveAction = (ctx: FinanceActionContext) => Promise<void>;
