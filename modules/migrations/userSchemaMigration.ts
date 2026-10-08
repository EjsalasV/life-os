import { CURRENT_USER_SCHEMA_VERSION, LEGACY_USER_SCHEMA_VERSION, readUserSchemaVersion } from "./versioning";
import type { Migration, MigrationContext, MigrationCounts } from "./migrationFramework";

export type UserVersionRecord = { id: string; schemaVersion?: unknown };

export type UserSchemaVersionRepository = {
  listUsers: () => Promise<UserVersionRecord[]>;
  setSchemaVersion: (userId: string, version: number) => Promise<void>;
};

function inspectUsers(users: UserVersionRecord[]): MigrationCounts {
  let skipped = 0;
  let changed = 0;
  for (const user of users) {
    const version = readUserSchemaVersion(user.schemaVersion);
    if (version === LEGACY_USER_SCHEMA_VERSION) changed += 1;
    else skipped += 1;
  }
  return { scanned: users.length, changed, skipped, errors: 0 };
}

export function createUserSchemaVersionMigration(repository: UserSchemaVersionRepository): Migration {
  const list = () => repository.listUsers();
  return {
    id: "users-schema-version-1",
    versionFrom: LEGACY_USER_SCHEMA_VERSION,
    versionTo: CURRENT_USER_SCHEMA_VERSION,
    description: "Detecta usuarios legacy y permite establecer schemaVersion=1 sin tocar datos funcionales.",
    async inspect() {
      const counts = inspectUsers(await list());
      return { ...counts, summary: `${counts.changed} usuario(s) legacy detectado(s); no se escribirá nada.` };
    },
    async validateBefore() {
      for (const user of await list()) readUserSchemaVersion(user.schemaVersion);
    },
    async migrate(context: MigrationContext) {
      const users = await list();
      const counts = inspectUsers(users);
      for (const user of users) {
        if (readUserSchemaVersion(user.schemaVersion) !== LEGACY_USER_SCHEMA_VERSION) continue;
        try {
          await repository.setSchemaVersion(user.id, CURRENT_USER_SCHEMA_VERSION);
          context.log(`schemaVersion actualizado para usuario ${user.id}.`);
        } catch (error) {
          counts.errors += 1;
          if (!context.continueOnError) throw error;
        }
      }
      return { ...counts, changed: counts.changed - counts.errors };
    },
    async validateAfter() {
      for (const user of await list()) {
        if (readUserSchemaVersion(user.schemaVersion) !== CURRENT_USER_SCHEMA_VERSION) {
          throw new Error(`El usuario ${user.id} no alcanzó schemaVersion=${CURRENT_USER_SCHEMA_VERSION}.`);
        }
      }
    }
  };
}
