/** Stored amounts remain dollars; arithmetic is performed in integer cents. */
export function moneyCents(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") throw new Error("Importe inválido");
  const text = String(value).trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) throw new Error("Usa un importe con máximo dos decimales");
  const negative = text.startsWith("-");
  const [whole, fraction = ""] = text.replace(/^-/, "").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) throw new Error("Importe fuera de rango");
  return negative ? -cents : cents;
}
export function balanceCents(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("El saldo guardado no es válido");
  const cents = Math.round(value * 100);
  if (!Number.isSafeInteger(cents)) throw new Error("Saldo fuera de rango");
  return cents;
}
export function adjustedBalance(value: unknown, delta: number): number {
  const cents = balanceCents(value) + moneyCents(delta);
  if (!Number.isSafeInteger(cents)) throw new Error("Saldo fuera de rango");
  return cents / 100;
}

