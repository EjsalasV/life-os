# Integración Telegram/n8n — Fases 1 y 2

## Arquitectura

Telegram y n8n actúan como interfaz/orquestador. Life OS sigue siendo la única fuente de verdad:

`Telegram → n8n → Route Handler de Life OS → Firebase Admin → Firestore`

Las rutas viven bajo `/api/integrations/telegram` y usan el Admin SDK únicamente en el servidor. No se exponen credenciales de Firebase al cliente.

## Variable de entorno

Configura `LIFE_OS_TELEGRAM_INTEGRATION_KEY` en `.env.local` y en Vercel para los entornos correspondientes. Debe ser un secreto largo y aleatorio. n8n lo envía como:

```http
Authorization: Bearer <LIFE_OS_TELEGRAM_INTEGRATION_KEY>
```

También se acepta `x-life-os-integration-key` para clientes que no puedan usar Bearer.

## Vinculación

1. n8n llama `POST /api/integrations/telegram/link/start` con `{ "telegramUserId": "123456789" }`.
2. Life OS devuelve un token de un solo uso, válido durante 10 minutos, y una URL `/connect/telegram?token=...`.
3. El usuario abre la URL, inicia sesión o crea su cuenta, y confirma la vinculación.
4. Life OS guarda el vínculo en `integrations/telegram/users/{telegramUserId}`.

La identidad principal de Telegram es `telegramUserId`, no `chatId`. El token se almacena únicamente como hash SHA-256.

## Endpoints

### Contexto

`GET /api/integrations/telegram/finance/context?telegramUserId=123456789`

Devuelve las cuentas normales, tarjetas y categorías financieras del usuario vinculado.

Respuesta:

```json
{
  "accounts": [{ "id": "cash-1", "name": "Débito Pichincha", "balance": 120.5 }],
  "categories": [{ "id": "comida", "label": "Alimentación", "emoji": "🍽️" }],
  "cards": [{ "id": "card-1", "name": "Visa", "bank": "Banco", "limit": 1000, "debt": 220, "available": 780 }]
}
```

### Movimientos

`POST /api/integrations/telegram/finance/movements`

```json
{
  "telegramUserId": "123456789",
  "type": "GASTO",
  "amount": 4,
  "concept": "Uber",
  "categoryId": "transporte",
  "accountId": "id-de-cuenta",
  "idempotencyKey": "telegram-update-123456"
}
```

Solo se aceptan `GASTO` e `INGRESO`. La cuenta debe pertenecer al usuario vinculado. La actualización del saldo y la creación del movimiento ocurren en una sola transacción Firestore.

`idempotencyKey` es opcional. Si se repite con los mismos datos, se devuelve el resultado original sin crear otro movimiento. Si se reutiliza con datos distintos, se rechaza.

Respuesta:

```json
{
  "ok": true,
  "movement": {
    "id": "movement-1",
    "type": "GASTO",
    "amount": 4,
    "concept": "Uber",
    "categoryId": "transporte"
  },
  "account": { "id": "cash-1", "name": "Débito Pichincha", "balance": 116.5 }
}
```

### Resumen

`GET /api/integrations/telegram/finance/summary?telegramUserId=123456789`

Devuelve saldo disponible, cuentas, ingresos/gastos del mes calendario actual y presupuestos con gasto del mes.

Respuesta:

```json
{
  "availableBalance": 500,
  "accounts": [],
  "month": { "income": 900, "expenses": 350, "balance": 550 },
  "budgets": [],
  "cards": [],
  "creditCards": { "totalLimit": 1000, "totalDebt": 220, "totalAvailable": 780 }
}
```

### Transferencia

`POST /api/integrations/telegram/finance/transfers`

```json
{
  "telegramUserId": "123456789",
  "amount": 100,
  "fromAccountId": "cash-1",
  "toAccountId": "savings-1",
  "concept": "Ahorro",
  "idempotencyKey": "telegram-transfer-1"
}
```

Transfiere saldo entre dos cuentas en una transacción y crea un único movimiento `TRANSFERENCIA`. No afecta ingresos ni gastos mensuales.

### Compra con tarjeta

`POST /api/integrations/telegram/finance/card-purchases`

```json
{
  "telegramUserId": "123456789",
  "amount": 20,
  "concept": "Supermercado",
  "categoryId": "comida",
  "cardId": "card-1",
  "idempotencyKey": "telegram-purchase-1"
}
```

Aumenta `tarjetas.saldo` y crea un `GASTO` con `medioPago: "TARJETA_CREDITO"`. No modifica cuentas débito, pero sí afecta gastos y presupuestos.

### Pago de tarjeta

`POST /api/integrations/telegram/finance/card-payments`

```json
{
  "telegramUserId": "123456789",
  "amount": 100,
  "accountId": "cash-1",
  "cardId": "card-1",
  "concept": "Pago tarjeta",
  "idempotencyKey": "telegram-payment-1"
}
```

Disminuye una cuenta débito y la deuda de la tarjeta, creando un movimiento `PAGO_TARJETA`. No cuenta como gasto ni afecta presupuestos.

## Errores esperados

- `400`: cuerpo, monto, categoría, identificador o token inválido.
- `401`: falta la integration key, es incorrecta o la sesión Firebase no es válida.
- `403`: el usuario de Telegram aún no está vinculado.
- `404`: la cuenta indicada no existe dentro del usuario vinculado.
- `409`: conflicto de vinculación o reutilización de `idempotencyKey` con otros datos.
- `503`: falta configurar `LIFE_OS_TELEGRAM_INTEGRATION_KEY` en el servidor.

Las respuestas de error tienen la forma `{ "error": "..." }` y no exponen stack traces, credenciales ni datos de otros usuarios.

## Estructura Firestore nueva

- `integrations/telegram/users/{telegramUserId}`: `firebaseUid`, `status`, timestamps.
- `integrations/telegram/linkTokens/{sha256(token)}`: token pendiente/usado, usuario de Telegram y expiración.
- `integrations/telegram/idempotency/{sha256(telegramUserId:idempotencyKey)}`: huella y respuesta original.
- `integrations/telegram/sessions/{telegramUserId}`: una sesión conversacional activa por usuario, con campos normalizados y expiración lógica de 30 minutos.

Los datos financieros existentes no cambian: se siguen usando `users/{firebaseUid}/cuentas`, `movimientos` y `presupuestos`.

Las tarjetas siguen usando `users/{firebaseUid}/tarjetas/{tarjetaId}` con los campos existentes `nombre`, `banco`, `limite` y `saldo`.

## Reversión y edición

Las operaciones especiales no se editan como movimientos manuales. Para corregirlas se eliminan físicamente y se registran nuevamente.

- Compra con tarjeta: resta el monto de `tarjetas.saldo` y elimina el movimiento.
- `PAGO_TARJETA`: devuelve el monto a la cuenta, aumenta la deuda y elimina el movimiento.
- `TRANSFERENCIA`: devuelve el monto a la cuenta origen, lo resta de la cuenta destino y elimina el movimiento.

Cada reversión lee el movimiento original desde Firestore y revierte sus referencias dentro de la misma transacción atómica. No se crea un estado `revertido` ni historial adicional en esta fase.

## Seguridad y pendientes

- No se acepta `firebaseUid` desde n8n; Life OS lo resuelve internamente.
- Se valida autorización, cuerpo, categoría, monto, longitud de textos y pertenencia de cuenta.
- Los errores públicos no contienen stack traces.
- No existe rate limiting distribuido en la arquitectura actual; queda pendiente para una fase de endurecimiento antes de exponer el endpoint ampliamente.

## Fase 2.5 — Sesiones conversacionales

La API de sesiones permite que un orquestador conserve el estado temporal de una conversación sin ejecutar operaciones financieras. Todas las rutas requieren el mismo header de integración que el resto de esta API:

```http
Authorization: Bearer <LIFE_OS_TELEGRAM_INTEGRATION_KEY>
```

### Consultar sesión

`GET /api/integrations/telegram/session?telegramUserId=123456789`

Respuesta activa:

```json
{
  "active": true,
  "telegramUserId": "123456789",
  "operation": "GASTO",
  "step": "awaiting_amount",
  "concept": "Café",
  "expiresAt": "2026-10-06T20:30:00.000Z"
}
```

Si no existe, expiró o pertenece a otro vínculo actual, devuelve `{ "active": false }`. Las sesiones expiradas se consideran inactivas aunque no exista un proceso de limpieza de Firestore.

### Crear o reemplazar sesión

`PUT /api/integrations/telegram/session`

```json
{
  "telegramUserId": "123456789",
  "operation": "GASTO",
  "step": "awaiting_amount",
  "data": {
    "concept": "Café",
    "categoryId": "comida",
    "metadata": { "source": "telegram" }
  }
}
```

`operation` puede ser `GASTO`, `INGRESO`, `TRANSFERENCIA`, `COMPRA_TARJETA` o `PAGO_TARJETA`. `data` se normaliza y se persiste en el nivel superior del documento: `amount`, `concept`, `categoryId`, `accountId`, `destinationAccountId`, `cardId` y `metadata`. El monto se guarda como número en dólares, la categoría se valida contra las categorías oficiales y los metadatos tienen límites de tamaño. Cada `PUT` reemplaza la sesión completa y reinicia sus 30 minutos de vigencia.

### Actualizar sesión

`PATCH /api/integrations/telegram/session`

```json
{
  "telegramUserId": "123456789",
  "step": "awaiting_category",
  "data": { "amount": "4.50", "concept": "Café" }
}
```

Solo puede actualizarse una sesión activa del vínculo actual. `PATCH` conserva la operación, identidad y fecha de creación, modifica únicamente `step` y los campos permitidos de `data`, y refresca la expiración. La operación se realiza en una transacción. No se aceptan `firebaseUid`, `telegramUserId`, timestamps ni campos desconocidos.

### Cancelar sesión

`DELETE /api/integrations/telegram/session?telegramUserId=123456789`

Devuelve `{ "ok": true }` aunque la sesión ya no exista. El borrado no crea movimientos ni modifica saldos.

La API resuelve internamente `firebaseUid` desde `integrations/telegram/users/{telegramUserId}`; nunca confía en un UID enviado por n8n. Las sesiones están fuera del acceso del cliente por las reglas Firestore. La API no ejecuta gastos, ingresos, transferencias, compras ni pagos: el flujo conceptual futuro es Telegram → n8n/IA → estas sesiones → confirmación explícita → endpoints financieros ya implementados.

## Fase 2 — implementada

- Consulta de tarjetas, deuda y crédito disponible.
- Transferencias entre cuentas.
- Compras con tarjeta de crédito.
- Pagos de tarjeta de crédito.
- Idempotencia para las tres operaciones.
- Reversión atómica de compras, pagos y transferencias.
- Bloqueo de creación cliente de movimientos privilegiados de tarjeta.

## Pendientes posteriores

- Categorías personalizadas por usuario.
- Integración real con n8n y Telegram Bot API.
- Interpretación mediante IA/DeepSeek.
- Workflow final de n8n y confirmación conversacional completa.
- Rate limiting distribuido para exposición amplia del endpoint.
