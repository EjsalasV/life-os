import { getAdminFirestore } from "../services/firebase/admin.ts";
import { runMigration } from "../modules/migrations/migrationFramework.ts";
import { createUserSchemaVersionMigration } from "../modules/migrations/userSchemaMigration.ts";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const apply = process.argv.includes("--apply");
const migrationId = argument("--migration") || "users-schema-version-1";
const projectId = argument("--project") || process.env.GCLOUD_PROJECT;
const environment = argument("--environment") || process.env.LIFE_OS_ENVIRONMENT;
const allowProduction = process.argv.includes("--allow-production");

if (!projectId || !environment) throw new Error("Debes indicar --project y --environment explícitamente.");
if (apply && environment === "production" && !allowProduction) throw new Error("Apply contra producción requiere --allow-production explícito.");
if (apply && environment !== "test" && !process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error("Apply requiere credenciales Firebase Admin del entorno objetivo.");
}
if (migrationId !== "users-schema-version-1") throw new Error(`Migración desconocida: ${migrationId}.`);

const db = getAdminFirestore();
const migration = createUserSchemaVersionMigration({
  async listUsers() {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, schemaVersion: doc.data().schemaVersion }));
  },
  async setSchemaVersion(userId, version) {
    await db.doc(`users/${userId}`).update({ schemaVersion: version });
  }
});
const result = await runMigration(migration, {
  projectId,
  environment,
  mode: apply ? "apply" : "dry-run",
  continueOnError: process.argv.includes("--continue-on-error"),
  log: (message) => console.log(message)
});
console.log(JSON.stringify({ projectId, environment, ...result }, null, 2));
