export function safeHealthNumber(value: number | string | null | undefined): number {
  if (!value) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
