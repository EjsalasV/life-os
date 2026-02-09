# 🎯 Flujos Visuales - Notificaciones en Life OS

## 1️⃣ FLUJO DE INICIALIZACIÓN (Primera vez que abre el usuario)

```
┌─────────────────────────────────────────────────────┐
│  Usuario abre http://localhost:3000                 │
│  (Primera vez o después de borrar cookies)          │
└─────────────────────────────────────────┬───────────┘
                                          │
                                          v
                     ┌────────────────────────────────┐
                     │ App carga (app/page.js)        │
                     │ ✓ Conecta a Firebase          │
                     │ ✓ Detecta usuario             │
                     └────────────┬───────────────────┘
                                  │
                                  v
                  ┌───────────────────────────────────┐
                  │ useEffect FCM se ejecuta:        │
                  │ 1. Registra Service Worker       │
                  │ 2. Solicita permiso              │
                  │ 3. Obtiene token FCM             │
                  │ 4. Guarda token en Firestore     │
                  └───────────────────┬───────────────┘
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                        v                           v
          ┌──────────────────────────┐  ┌─────────────────────┐
          │ SERVICE WORKER ACTIVO ✅  │  │ TOKEN GUARDADO ✅   │
          │ /firebase-messaging-sw.js│  │ firestore/users     │
          │                          │  │ {uid}.fcmToken      │
          └──────────────────────────┘  └─────────────────────┘
                        │                           │
                        └─────────────┬─────────────┘
                                      │
                                      v
                        ┌──────────────────────────┐
                        │ ¡LISTO PARA NOTIFICACIONES!
                        │ Cloud Function ahora puede│
                        │ enviar notificaciones      │
                        └──────────────────────────┘
```

---

## 2️⃣ FLUJO DIARIO DE NOTIFICACIONES (A las 12:00 PM UTC)

```
┌────────────────────────────────────────────────────────────┐
│  Cloud Scheduler dispara "sendDailyReminders"             │
│  (Automáticamente todos los días a las 12:00 PM)         │
└────────────────────────────┬───────────────────────────────┘
                             │
                             v
            ┌──────────────────────────────────┐
            │ Cloud Function se ejecuta       │
            │ Lee TODOS los usuarios          │
            └────────────┬─────────────────────┘
                         │
                         v
          ┌──────────────────────────────────┐
          │ Para cada usuario, verifica:     │
          │                                  │
          │ 1. ¿Racha iniciada?               │
          │    lastActivity = existe?         │
          │    → NO → Envía notificación 🔥  │
          │                                  │
          │ 2. ¿Salud registrada?            │
          │    bateria = 50 (inicial)?       │
          │    → YES → Envía notificación 💪 │
          │                                  │
          │ 3. ¿Stock bajo?                   │
          │    productos qty <= 5?           │
          │    → YES → Envía notificación 📦 │
          └────────┬─────────────────────────┘
                   │
                   v
      ┌────────────────────────────────────┐
      │ Obtiene token FCM del usuario      │
      │ firestore/users/{uid}.fcmToken     │
      └────────┬───────────────────────────┘
               │
               v
      ┌────────────────────────────────────┐
      │ Envía vía Firebase Cloud Messaging│
      │ (FCM)                              │
      └────────┬───────────────────────────┘
               │
               ├─────────────┬─────────────┬─────────────┐
               │             │             │             │
               v             v             v             v
          ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
          │Chrome  │    │Edge    │    │Firefox │    │Safari  │
          │Usuario │    │Usuario │    │Usuario │    │Usuario │
          │1       │    │2       │    │3       │    │4       │
          └────┬───┘    └────┬───┘    └────┬───┘    └────┬───┘
               │             │             │             │
               v             v             v             v
        ┌───────────────────────────────────────────────────┐
        │ ¿La app está abierta? → NO                       │
        │ Entra en Firebase-messaging-sw.js (Service Worker)│
        │                                                   │
        │ onBackgroundMessage() se ejecuta:                │
        │ - Muestra notificación en el sistema             │
        │ - Usuario ve: 🔥 "¿Dónde está tu racha?" ...    │
        │                                                   │
        │ Cuando usuario hace CLIC:                        │
        │ - notificationclick event se dispara            │
        │ - Abre/enfoca la ventana de la app              │
        │ - La app se sincroniza automáticamente          │
        └───────────────────────────────────────────────────┘
```

---

## 3️⃣ FLUJO DE CHECKOUT (Notificaciones locales de stock)

```
┌──────────────────────────────────┐
│ Usuario hace CHECKOUT            │
│ (Compra un producto)             │
└────────────┬─────────────────────┘
             │
             v
  ┌──────────────────────────────┐
  │ handleCheckout() en useVentas│
  │ 1. Crea Batch transaction    │
  │ 2. Resta stock de productos  │
  │ 3. Commit a Firestore        │
  └────────┬─────────────────────┘
           │
           v
  ┌────────────────────────────────┐
  │ ⏳ Espera 500ms (sincronizar)  │
  └────────┬─────────────────────────┘
           │
           v
  ┌────────────────────────────────┐
  │ Verifica cada producto:        │
  │                                │
  │ ¿Stock = 0?                    │
  │ → notifyStockEmpty() 🚨       │
  │    Muestra toast rojo          │
  │                                │
  │ ¿Stock <= 5?                   │
  │ → notifyStockLow() ⚠️          │
  │    Muestra toast amarillo      │
  └────────┬─────────────────────────┘
           │
           v
  ┌────────────────────────────────┐
  │ Usuario ve notificación en UI  │
  │ (mientras app está abierta)    │
  │                                │
  │ Si app cierra, la sincronización│
  │ continúa automáticamente       │
  └────────────────────────────────┘
```

---

## 4️⃣ FLUJO OFFLINE → ONLINE (Sincronización automática)

```
┌─────────────────────────────────────┐
│ FASE OFFLINE                        │
│ Usuario desconectado del WiFi       │
└─────────────┬───────────────────────┘
              │
              v
  ┌──────────────────────────────────┐
  │ ✓ Datos disponibles en caché     │
  │   (IndexedDB)                    │
  │                                  │
  │ ✓ Cambios guardados en cache     │
  │   (offline persistence)          │
  │                                  │
  │ ✓ Badge "Offline" aparece        │
  │   en la cabecera                 │
  └──────────┬───────────────────────┘
             │
        (usuario vuelve online)
             │
             v
  ┌──────────────────────────────────┐
  │ FASE SINCRONIZACIÓN              │
  │ Firestore detecta conexión       │
  │                                  │
  │ 1. Lee cambios locales en cache  │
  │ 2. Sincroniza con servidor       │
  │ 3. Obtiene datos del servidor    │
  │ 4. Actualiza IndexedDB           │
  │ 5. Dispara onSnapshot listeners  │
  │ 6. UI se actualiza automáticamente│
  └──────────┬───────────────────────┘
             │
             v
  ┌──────────────────────────────────┐
  │ FASE ONLINE                      │
  │ ✓ Todo sincronizado              │
  │ ✓ Badge "Offline" desaparece     │
  │ ✓ Datos frescos del servidor     │
  │ ✓ Cambios retransmitidos         │
  └──────────────────────────────────┘
```

---

## 5️⃣ COMPONENTES CLAVE Y SUS RESPONSABILIDADES

```
USER → page.js (Orquestador) → Múltiples hooks
      ↓
      ├─→ useVentas
      │   ├─ addToCart()
      │   ├─ handleCheckout() 
      │   └─ notifyStockEmpty/Low()
      │
      ├─→ useSalud
      │   ├─ toggleFasting()
      │   ├─ updateHealthStat()
      │   └─ calculateBattery()
      │
      ├─→ useFinanzas
      │   ├─ handleSave()
      │   └─ saveBudget()
      │
      └─→ useOnline
          └─ isOnline (boolean)

page.js también:
├─ Registra Service Worker
├─ Solicita permiso notificaciones
├─ Obtiene token FCM
└─ Muestra badge "Offline"
```

---

## 6️⃣ RUTAS DE DATOS EN FIRESTORE

```
firebaseLocalStorageDb/
│
└─ fcmTokens/
   └─ {userId}
      └─ {
         "token": "abc123...",
         "timestamp": 1704067200000
         }

users/
│
└─ {userId} (el UID del usuario con sesión)
   │
   ├─ fcmToken: "abc123..."              ← Token actual
   ├─ fcmTokenUpdated: timestamp         ← Última actualización
   │
   ├─ salud/
   │  └─ bateria: 50  (0-100, indica energía del día)
   │
   ├─ productos/
   │  ├─ producto1: { nombre: "...", qty: 10 }
   │  ├─ producto2: { nombre: "...", qty: 0  } ← Stock vacío
   │  └─ producto3: { nombre: "...", qty: 3  } ← Stock bajo
   │
   └─ lastActivity: 1704067200000  ← Última acción (racha)
```

---

## 7️⃣ ESTADOS DE LAS NOTIFICACIONES

```
┌──────────────────────────────────────────┐
│ NOTIFICACIÓN: "¿Dónde está tu racha?"   │
│ Tipo: 🔥 RACHA / STREAK                 │
└──────────────────────────────────────────┘
     Condición:  lastActivity no existe
     Enviada:    12:00 PM UTC diarios
     Plataforma: FCM (push)
     Cuando:     Si no ha abierto la app ese día

┌──────────────────────────────────────────┐
│ NOTIFICACIÓN: "Registra tu salud"       │
│ Tipo: 💪 SALUD / HEALTH                 │
└──────────────────────────────────────────┘
     Condición:  bateria = 50 (sin registrar)
     Enviada:    12:00 PM UTC diarios
     Plataforma: FCM (push)
     Cuando:     Si no registró salud ese día

┌──────────────────────────────────────────┐
│ NOTIFICACIÓN: "Stock bajo en [PRODUCTO]"│
│ Tipo: 📦 STOCK / INVENTORY              │
└──────────────────────────────────────────┘
     Condición:  qty <= 5
     Enviada:    12:00 PM UTC diarios
     Plataforma: FCM (push)
     Cuando:     Si tiene productos con stock bajo

┌──────────────────────────────────────────┐
│ NOTIFICACIÓN: "Stock agotado[PRODUCTO]" │
│ Tipo: 🚨 STOCK VACÍO / OUT OF STOCK    │
└──────────────────────────────────────────┘
     Condición:  qty = 0
     Enviada:    Inmediata después de checkout
     Plataforma: Toast (local)
     Cuando:     Al hacer compra que agota stock

┌──────────────────────────────────────────┐
│ NOTIFICACIÓN: "Stock bajo..."            │
│ Tipo: ⚠️ STOCK BAJO / LOW INVENTORY     │
└──────────────────────────────────────────┘
     Condición:  qty <= 5
     Enviada:    Inmediata después de checkout
     Plataforma: Toast (local)
     Cuando:     Al hacer compra que deja stock bajo
```

---

## 8️⃣ MATRIZ DE COMPATIBILIDAD

```
╔═════════════╦════════╦═════════════╦═════════════╗
║ Navegador   ║ FCM    ║ Service     ║ Offline     ║
║             ║ Push   ║ Worker      ║ Sync        ║
╠═════════════╬════════╬═════════════╬═════════════╣
║ Chrome      ║  ✅    ║  ✅         ║  ✅         ║
║ Edge        ║  ✅    ║  ✅         ║  ✅         ║
║ Firefox     ║  ⚠️*   ║  ✅         ║  ✅         ║
║ Safari      ║  ❌    ║  ❌         ║  ✅         ║
║ IE 11       ║  ❌    ║  ❌         ║  ❌         ║
╚═════════════╩════════╩═════════════╩═════════════╝

* Firefox: soporte limitado para push
❌ No soporta
✅ Soporte completo
⚠️ Soporte parcial

Recomendación: Chrome o Edge en Desktop
```

---

## 9️⃣ LISTA DE VERIFICACIÓN DE ESTADO

```
Para verificar si todo está funcionando:

☐ BACKEND
  ☐ Cloud Function desplegada
  ☐ Cloud Scheduler visible
  ☐ Tokens FCM en Firestore
  ☐ Logs sin errores

☐ FRONTEND
  ☐ Service Worker registrado (DevTools → Application)
  ☐ App solicita permiso (pop-up aparece)
  ☐ Usuario clickea "Permitir"
  ☐ Token guardado en IndexedDB

☐ SINCRONIZACIÓN
  ☐ App funciona offline (badge "Offline" aparece)
  ☐ Datos vuelven cuando se conecta
  ☐ No hay errores de conexión

☐ NOTIFICACIONES
  ☐ Notificaciones push llegan a las 12 PM
  ☐ Hacer clic en notificación abre app
  ☐ Toast de stock aparece después de checkout
```

---

## 🔟 RESOLUCIÓN DE PROBLEMAS VISUAL

```
PROBLEMA: "No llegan notificaciones"

    ↓ Revisa:
    
┌─────────────────────────────────────┐
│ 1. ¿Clickeaste "Permitir"?          │
│    Busca: Pop-up Notifications      │
│    → Si NO aparece, recarga página  │
│    → Si SI pero clickeaste "Bloquear"│
│       → Limpia: DevTools → App      │
│         → Cookies → Clear all       │
└─────────────────────────────────────┘
    
    ↓ Si falla, revisa:
    
┌─────────────────────────────────────┐
│ 2. ¿Service Worker está activo?    │
│    DevTools → Application           │
│    → Service Workers                │
│    → Debe ver: ✅ ACTIVE            │
│    → Si NO: Ctrl+Shift+R (hard reload)
└─────────────────────────────────────┘
    
    ↓ Si falla, revisa:
    
┌─────────────────────────────────────┐
│ 3. ¿Token FCM existe?               │
│    DevTools → Application           │
│    → IndexedDB                      │
│    → firebaseLocalStorageDb         │
│    → fcmTokens                      │
│    → Debe haber datos               │
│    → Si NO: Loguéate nuevamente     │
└─────────────────────────────────────┘
    
    ↓ Si falla, revisa:
    
┌─────────────────────────────────────┐
│ 4. ¿Cloud Function se ejecutó?      │
│    Firebase Console                 │
│    → Cloud Functions → Logs         │
│    → Ver si hay errores             │
│    → Si hay errores, revisar VAPID  │
└─────────────────────────────────────┘
    
    ↓ Si falla, revisa:
    
┌─────────────────────────────────────┐
│ 5. ¿VAPID key es correcta?          │
│    .env.local                       │
│    → NEXT_PUBLIC_FIREBASE_VAPID_KEY │
│    → Copiar exactamente sin espacios│
│    → Si cambias, reinicia servidor  │
│    → npm run dev                    │
└─────────────────────────────────────┘
```

---

Versión: 1.0 | Último update: 2024
