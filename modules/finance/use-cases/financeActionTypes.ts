import type { Cuenta, FinanceForm } from '@/app/types';

export interface FinanceActionContext {
  uid: string;
  isPro: boolean;
  cuentas: Cuenta[];
  financeForm: FinanceForm;
  updateStreakExternal: () => Promise<boolean>;
}

export type FinanceSaveAction = (ctx: FinanceActionContext) => Promise<void>;
