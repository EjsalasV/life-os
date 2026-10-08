export const LEGACY_USER_SCHEMA_VERSION = 0;
export const CURRENT_USER_SCHEMA_VERSION = 1;

export function readUserSchemaVersion(value: unknown): number {
  if (value === undefined || value === null) return LEGACY_USER_SCHEMA_VERSION;
  if (typeof value !== "number" || !Number.isInteger(value) || value < LEGACY_USER_SCHEMA_VERSION || value > CURRENT_USER_SCHEMA_VERSION) {
    throw new Error(`schemaVersion desconocida: ${String(value)}.`);
  }
  return value;
}

export function assertForwardVersion(versionFrom: number, versionTo: number): void {
  if (!Number.isInteger(versionFrom) || !Number.isInteger(versionTo) || versionFrom < 0 || versionTo <= versionFrom) {
    throw new Error(`Transición de versión inválida: ${versionFrom} → ${versionTo}.`);
  }
  if (versionTo > CURRENT_USER_SCHEMA_VERSION) {
    throw new Error(`La versión ${versionTo} aún no está soportada.`);
  }
}
