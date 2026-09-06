import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { readFileSync } from 'node:fs';

loadEnvConfig(process.cwd());
const env = process.env;
const expected = JSON.parse(readFileSync('.firebaserc', 'utf8')).projects.default;
const failures = [];
for (const name of ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID', 'FIREBASE_ADMIN_PROJECT_ID', 'FIREBASE_ADMIN_CLIENT_EMAIL', 'FIREBASE_ADMIN_PRIVATE_KEY']) {
  if (!env[name]?.trim()) failures.push(`Falta ${name}`);
}
if (env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== expected) failures.push('El proyecto cliente no coincide con .firebaserc');
if (env.FIREBASE_ADMIN_PROJECT_ID && env.FIREBASE_ADMIN_PROJECT_ID !== expected) failures.push('El proyecto Admin no coincide con .firebaserc');
if (env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' || env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST) failures.push('Hay emuladores activados en el entorno de despliegue');
if (env.FIREBASE_ADMIN_PRIVATE_KEY && !env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n').includes('-----BEGIN PRIVATE KEY-----')) failures.push('La clave Admin no tiene el formato PEM esperado');
console.log(`Destino Firebase: ${expected}`);
if (failures.length) {
  failures.forEach(failure => console.error(`BLOQUEO: ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Configuración coherente. Este control no valida permisos remotos ni despliega.');
}

