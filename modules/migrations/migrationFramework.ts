import { assertForwardVersion } from "./versioning";

export type MigrationMode = "dry-run" | "apply";

export type MigrationCounts = {
  scanned: number;
  changed: number;
  skipped: number;
  errors: number;
};

export type MigrationInspection = MigrationCounts & { summary: string };

export type MigrationContext = {
  projectId: string;
  environment: string;
  mode: MigrationMode;
  continueOnError: boolean;
  log: (message: string) => void;
};

export type Migration = {
  id: string;
  versionFrom: number;
  versionTo: number;
  description: string;
  inspect: (context: MigrationContext) => Promise<MigrationInspection>;
  validateBefore?: (context: MigrationContext) => Promise<void>;
  migrate: (context: MigrationContext) => Promise<MigrationCounts>;
  validateAfter?: (context: MigrationContext) => Promise<void>;
};

export type MigrationResult = MigrationCounts & {
  id: string;
  mode: MigrationMode;
  versionFrom: number;
  versionTo: number;
  summary: string;
};

const emptyCounts = (): MigrationCounts => ({ scanned: 0, changed: 0, skipped: 0, errors: 0 });

export async function runMigration(migration: Migration, context: MigrationContext): Promise<MigrationResult> {
  assertForwardVersion(migration.versionFrom, migration.versionTo);
  const inspection = await migration.inspect(context);
  await migration.validateBefore?.(context);

  if (context.mode === "dry-run") {
    return {
      id: migration.id,
      mode: context.mode,
      versionFrom: migration.versionFrom,
      versionTo: migration.versionTo,
      ...inspection,
      summary: `dry-run: ${inspection.summary}`
    };
  }

  const counts = await migration.migrate(context);
  await migration.validateAfter?.(context);
  return {
    id: migration.id,
    mode: context.mode,
    versionFrom: migration.versionFrom,
    versionTo: migration.versionTo,
    ...emptyCounts(),
    ...counts,
    summary: `apply: ${migration.description}`
  };
}
