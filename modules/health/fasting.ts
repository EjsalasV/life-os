export function toggleFastingValue(current: number | null | undefined, now: number = Date.now()): number | null {
  return current ? null : now;
}

export function parseLegacyFastingTimestamp(value: string | null): number | null {
  if (!value) return null;
  const numeric = Number(value);
  const timestamp = Number.isFinite(numeric) ? numeric : Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > 0 && timestamp <= Date.now() ? timestamp : null;
}
