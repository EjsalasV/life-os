# Telegram Health API

API server-side para que una integración Telegram/n8n consulte y registre datos de Salud en Life OS. Esta fase no agrega UI, workflow de n8n ni funciones médicas o de IA.

## Autenticación

Cada request requiere el header `Authorization: Bearer <LIFE_OS_TELEGRAM_INTEGRATION_KEY>` o `x-life-os-integration-key: <LIFE_OS_TELEGRAM_INTEGRATION_KEY>`. La variable debe existir únicamente en el entorno del servidor/Vercel; nunca se envía al cliente.

Las operaciones usan `telegramUserId` para resolver internamente la vinculación activa en `integrations/telegram/users/{telegramUserId}`. Nunca se acepta `firebaseUid` desde el request.

La zona horaria por defecto es `America/Guayaquil`, igual que la experiencia local. Puede cambiarse con `LIFE_OS_TIME_ZONE` si el despliegue de la cuenta requiere otra zona.

## Endpoints

Base: `/api/integrations/telegram/health`

| Método y ruta | Uso |
| --- | --- |
| `GET /context?telegramUserId=123456` | Perfil resumido, peso actual y estado del día |
| `GET /summary?telegramUserId=123456` | Resumen compacto del día |
| `POST /water` | Agrega, retira o establece vasos de agua |
| `POST /check-in` | Actualiza sueño, calidad de sueño, ánimo y estrés |
| `POST /activity` | Registra actividad y minutos |
| `GET /habits?telegramUserId=123456` | Lista hábitos activos y su periodo |
| `POST /habits/check` | Marca un hábito del usuario vinculado |
| `POST /weight` | Registra peso para cuentas PRO |

Los POST reciben JSON con `telegramUserId` y los campos de la operación. Ejemplos:

```http
POST /api/integrations/telegram/health/water
Authorization: Bearer <integration-key>
Content-Type: application/json

{"telegramUserId":"123456","action":"ADD","amount":2,"idempotencyKey":"water-2026-10-07-1"}
```

```json
{"ok":true,"date":"2026-10-07","water":2}
```

```http
POST /api/integrations/telegram/health/check-in
Authorization: Bearer <integration-key>
Content-Type: application/json

{"telegramUserId":"123456","sleepHours":7,"mood":"genial","idempotencyKey":"check-2026-10-07-1"}
```

```json
{"ok":true,"date":"2026-10-07","checkIn":{"sleepHours":7,"sleepQuality":"buena","mood":"genial","stress":0}}
```

Actividad usa `type` de las actividades oficiales de Life OS y `minutes`. Check-in acepta `sleepHours` (0-24), `sleepQuality` (`mala`, `regular`, `buena`, `excelente`), `mood` (`mal`, `normal`, `genial`) y `stress` (0-100). Agua mantiene el rango 0-20 vasos. Peso es positivo, hasta 500 kg, y está limitado al plan PRO.

## Vinculación, idempotencia y errores

La vinculación Telegram existente controla la identidad. El endpoint Salud solo procesa usuarios con una vinculación activa y no expone el UID interno. Las operaciones mutantes aceptan `idempotencyKey` opcional; al repetir la misma clave con el mismo payload devuelven el resultado original y no duplican el registro. Reutilizarla con otros datos devuelve `409`.

Errores esperados:

- `400`: body, identificador o campo inválido.
- `401`: integration key ausente o incorrecta.
- `403`: operación no disponible para el plan, como registrar peso sin PRO.
- `404`: Telegram no vinculado o hábito inexistente.
- `409`: límite de agua, hábito archivado, estado inconsistente o clave de idempotencia reutilizada con otros datos.

## Persistencia y seguridad

Se reutilizan las colecciones existentes:

- `users/{firebaseUid}/salud_diaria/{YYYY-MM-DD}`
- `users/{firebaseUid}/habitos/{habitId}`
- `users/{firebaseUid}/peso/{weightId}`
- `users/{firebaseUid}/perfilFisico/config`
- `integrations/telegram/users/{telegramUserId}`
- `integrations/telegram/idempotency/{hash}` para deduplicación

Las rutas usan Firebase Admin en runtime Node.js y no el SDK cliente. Las escrituras que actualizan el estado diario y su deduplicación ocurren en una transacción. Las respuestas son DTOs mínimos: no devuelven documentos Firestore completos, UIDs, correos ni secretos.

## Fase 2

Queda pendiente el workflow final de n8n, sus mensajes conversacionales y cualquier automatización adicional. Esta entrega solo deja disponible la API segura de Salud para integración posterior.
