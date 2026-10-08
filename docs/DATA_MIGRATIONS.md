# Data migrations

Life OS usa `users/{uid}.schemaVersion` como metadato de versión del documento raíz del usuario.

- `CURRENT_USER_SCHEMA_VERSION` está definido en `modules/migrations/versioning.ts` y actualmente vale `1`.
- Un usuario sin `schemaVersion` se interpreta como la versión legacy conocida `0`.
- Las versiones deben ser enteros y nunca retroceden. Una versión desconocida detiene la ejecución.
- Leer datos legacy sigue siendo compatible; esta fase no escribe versiones automáticamente.

## Mapa de auditoría

| Dominio | Colección/documento | Estado actual | Compatibilidad legacy | Riesgo | Versión sugerida |
| --- | --- | --- | --- | --- | --- |
| Usuario | `users/{uid}` | Activo; no tenía versión formal | Se asume versión `0` si falta el campo | Medio | `1` |
| Perfil físico | `users/{uid}/perfilFisico/config` | Activo | Salud combina este documento con `physicalProfile` del usuario | Medio | Heredada de `users/{uid}` |
| Salud diaria | `users/{uid}/salud_diaria/*` | Activo | Se aplican defaults para campos ausentes | Medio | Heredada de `users/{uid}` |
| Peso | `users/{uid}/peso/*` | Activo | Se usa el último peso y luego el peso del perfil como fallback | Medio | Heredada de `users/{uid}` |
| Hábitos | `users/{uid}/habitos/*` | Activo | `activo` y frecuencia se toleran/validan según el documento existente | Medio | Heredada de `users/{uid}` |
| Finanzas | `cuentas`, `movimientos`, `presupuestos`, `metas`, `tarjetas` | Activo | Campos opcionales se conservan para documentos históricos | Alto | Heredada de `users/{uid}` |
| Telegram mapping | `integrations/telegram/users/*` | Activo y canónico | Estados históricos se validan como `active` antes de resolver | Alto | Independiente |
| Telegram idempotencia | `integrations/telegram/idempotency/*` | Activo y transaccional | Path y hashes existentes preservados | Alto | Independiente |

No se detectó un `schemaVersion` previo ni una migración ejecutada. Los fallbacks identificados se mantienen deliberadamente fuera de esta fase.

El runner está en `scripts/run-migrations.ts` y la migración de ejemplo en `modules/migrations/userSchemaMigration.ts`. Por defecto opera en `dry-run` y no escribe. El modo de escritura requiere `--apply`, proyecto y entorno explícitos, además de credenciales Admin del entorno objetivo. Producción requiere una guarda adicional.

Ejemplo de inspección:

```text
npm run migrate:users -- --project demo-life-os --environment test
```

No ejecutar `--apply` primero en producción. Antes de una migración destructiva se debe hacer backup/export, validar en emulator/staging y definir una estrategia de rollback. La migración de ejemplo solo establece `schemaVersion`; no cambia datos funcionales y no se ha ejecutado.
