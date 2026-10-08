import { describe, expect, it, vi } from "vitest";
import { runMigration, type Migration } from "@/modules/migrations/migrationFramework";
import { createUserSchemaVersionMigration, type UserVersionRecord } from "@/modules/migrations/userSchemaMigration";
import { readUserSchemaVersion } from "@/modules/migrations/versioning";

function repository(initial: UserVersionRecord[]) {
  const users = structuredClone(initial);
  return {
    listUsers: async () => users,
    setSchemaVersion: async (id: string, version: number) => {
      const user = users.find((item) => item.id === id);
      if (!user) throw new Error("usuario inexistente");
      user.schemaVersion = version;
    },
    users
  };
}

const context = (mode: "dry-run" | "apply") => ({ projectId: "demo-life-os", environment: "test", mode, continueOnError: false, log: vi.fn() });

describe("migration framework", () => {
  it("does not write during dry-run", async () => {
    const repo = repository([{ id: "legacy" }]);
    const result = await runMigration(createUserSchemaVersionMigration(repo), context("dry-run"));
    expect(result).toMatchObject({ mode: "dry-run", scanned: 1, changed: 1, skipped: 0, errors: 0 });
    expect(repo.users[0]).toEqual({ id: "legacy" });
  });

  it("applies the callback and is idempotent", async () => {
    const repo = repository([{ id: "legacy" }, { id: "current", schemaVersion: 1 }]);
    const migration = createUserSchemaVersionMigration(repo);
    const first = await runMigration(migration, context("apply"));
    const second = await runMigration(migration, context("apply"));
    expect(first).toMatchObject({ changed: 1, skipped: 1, errors: 0 });
    expect(second).toMatchObject({ changed: 0, skipped: 2, errors: 0 });
    expect(repo.users.every((user) => readUserSchemaVersion(user.schemaVersion) === 1)).toBe(true);
  });

  it("rejects unknown and retrograde versions", async () => {
    const unknown = repository([{ id: "future", schemaVersion: 99 }]);
    await expect(runMigration(createUserSchemaVersionMigration(unknown), context("dry-run"))).rejects.toThrow("schemaVersion desconocida");
    const retrograde: Migration = { id: "bad", versionFrom: 1, versionTo: 1, description: "bad", inspect: async () => ({ scanned: 0, changed: 0, skipped: 0, errors: 0, summary: "" }), migrate: async () => ({ scanned: 0, changed: 0, skipped: 0, errors: 0 }) };
    await expect(runMigration(retrograde, context("dry-run"))).rejects.toThrow("Transición de versión inválida");
  });

  it("aborts when post-validation fails", async () => {
    const migration: Migration = {
      id: "invalid", versionFrom: 0, versionTo: 1, description: "invalid",
      inspect: async () => ({ scanned: 1, changed: 1, skipped: 0, errors: 0, summary: "" }),
      migrate: async () => ({ scanned: 1, changed: 1, skipped: 0, errors: 0 }),
      validateAfter: async () => { throw new Error("validación posterior falló"); }
    };
    await expect(runMigration(migration, context("apply"))).rejects.toThrow("validación posterior falló");
  });
});
