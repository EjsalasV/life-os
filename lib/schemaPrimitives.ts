import { z } from "zod";
import { moneyCents } from "@/lib/money";

export const numericText = z.union([z.string(), z.number().finite()]).transform(String);
export function validMoney(value: string, positive = true): boolean {
  try { return positive ? moneyCents(value) > 0 : moneyCents(value) >= 0; } catch { return false; }
}
