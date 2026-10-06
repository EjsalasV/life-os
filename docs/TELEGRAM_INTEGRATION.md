# Integración Telegram/n8n — Fase 1

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

Devuelve las cuentas normales del usuario vinculado y las categorías financieras disponibles.

Respuesta:

```json
{
  "accounts": [{ "id": "cash-1", "name": "Débito Pichincha", "balance": 120.5 }],
  "categories": [{ "id": "comida", "label": "Alimentación", "emoji": "🍽️" }]
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
  "budgets": []
}
```

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

Los datos financieros existentes no cambian: se siguen usando `users/{firebaseUid}/cuentas`, `movimientos` y `presupuestos`.

## Seguridad y pendientes

- No se acepta `firebaseUid` desde n8n; Life OS lo resuelve internamente.
- Se valida autorización, cuerpo, categoría, monto, longitud de textos y pertenencia de cuenta.
- Los errores públicos no contienen stack traces.
- No existe rate limiting distribuido en la arquitectura actual; queda pendiente para una fase de endurecimiento antes de exponer el endpoint ampliamente.

## Fase 2 — no implementada

- Compras con tarjeta de crédito y pago de tarjeta.
- Saldo, deuda y límite disponible de tarjetas.
- Categorías personalizadas por usuario.
- Integración real con n8n y Telegram Bot API.
- Interpretación mediante IA/DeepSeek.
