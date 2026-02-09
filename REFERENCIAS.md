# 🔗 Referencias Útiles - URLs y Recursos

## 📚 Documentación en el Proyecto

| Archivo | Propósito |
|---------|-----------|
| [README.md](./README.md) | Guía general del proyecto |
| [NOTIFICACIONES_SETUP.md](./NOTIFICACIONES_SETUP.md) | Documentación completa de notificaciones |
| [QUICK_SETUP.md](./QUICK_SETUP.md) | Checklist rápido de instalación |
| [.env.local.example](./.env.local.example) | Variables de entorno necesarias |
| [CLOUD_FUNCTION_SETUP.js](./CLOUD_FUNCTION_SETUP.js) | Código de Cloud Function para copiar |
| [public/firebase-messaging-sw.js](./public/firebase-messaging-sw.js) | Service Worker (ya instalado) |
| [lib/firebase.js](./lib/firebase.js) | Configuración de Firebase |
| [app/page.js](./app/page.js) | App principal |
| [app/hooks/useVentas.js](./app/hooks/useVentas.js) | Lógica de ventas + notificaciones |

---

## 🔐 Firebase Console

### Enlaces principales

| Sección | URL | Para qué |
|---------|-----|----------|
| **Proyecto** | https://console.firebase.google.com | Panel principal |
| **Configuración** | Proyecto → ⚙️ Configuración | Obtener credenciales y VAPID key |
| **Cloud Messaging** | Configuración → Cloud Messaging | VAPID key y Sender ID |
| **Cloud Functions** | Proyecto → Cloud Functions | Crear/Deploy/Logs |
| **Cloud Scheduler** | Proyecto → Cloud Scheduler | Ver y probar jobs |
| **Firestore Database** | Proyecto → Firestore Database | Ver datos guardados |
| **Authentication** | Proyecto → Authentication | Usuarios registrados |
| **Service Accounts** | Proyecto → ⚙️ → Service Accounts | Keys de Cloud Functions |

### Pasos específicos

**Obtener VAPID key:**
1. Firebase Console
2. Tu proyecto → Configuración ⚙️
3. Pestaña "Cloud Messaging"
4. Copiar "Clave pública (VAPID)"

**Crear Cloud Function:**
1. Firebase Console → Cloud Functions
2. "CREATE FUNCTION"
3. Runtime: Node.js 18+
4. Trigger: Cloud Pub/Sub (topic: `daily-reminders`)
5. Pegar código de `CLOUD_FUNCTION_SETUP.js`
6. Deploy

**Probar Cloud Function:**
1. Firebase Console → Cloud Scheduler
2. Buscar `sendDailyReminders`
3. Menú (**⋮**) → "RUN NOW"
4. Cloud Functions → Logs para ver resultado

---

## 🖥️ Códigos de Ejemplo

### ✅ Código que YA ESTÁ en el proyecto

```javascript
// En app/page.js
// ✅ Importar useOnline
import { useOnline } from '@/app/hooks/useOnline';

// ✅ Setup FCM
useEffect(() => {
  // Service Worker registration
  // Token request
  // Token storage
}, [user]);
```

```javascript
// En app/hooks/useVentas.js
// ✅ Notificaciones de stock
notifyStockEmpty(producto);
notifyStockLow(producto);
```

```javascript
// En lib/firebase.js
// ✅ FCM support
import { getMessaging, isSupported } from 'firebase/messaging';
export const messaging = async () => { ... }
```

### ⏰ Código que DEBE ir en Cloud Functions

Copiar desde `CLOUD_FUNCTION_SETUP.js` al archivo `functions/index.js`

---

## 🚀 Comandos Útiles

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Inicio servidor
npm run dev

# Abrir: http://localhost:3000

# Para limpieza profunda
npm run dev -- --reset
```

### Firebase CLI

```bash
# Instalar
npm install -g firebase-tools

# Login
firebase login

# Deploy solo Cloud Functions
firebase deploy --only functions

# Ver logs
firebase functions:log

# Ejecutar función localmente
firebase functions:shell
> sendDailyReminders()
```

---

## 📊 Estructura Firestore Esperada

```
firebaseLocalStorageDb/
├── fcmTokens/
│   └── {userId}: {token: "...", timestamp: ...}

users/
├── {userId}/
│   ├── fcmToken: "..."
│   ├── fcmTokenUpdated: timestamp
│   ├── email: "..."
│   ├── lastActivity: timestamp (racha)
│   ├── salud/
│   │   └── bateria: 50
│   ├── productos/
│   │   └── {productId}: {nombre: "...", qty: ...}
```

---

## 🐞 Debugging

### Chrome DevTools

```javascript
// Ver qué está guardado en IndexedDB
// DevTools → Application → IndexedDB → firebaseLocalStorageDb

// Ver Service Worker
// DevTools → Application → Service Workers → ✅ active

// Ver notificaciones
// DevTools → Application → Notifications → Solicitar permiso

// Logs de la app
// DevTools → Console
```

### Firebase Console Logs

```
Cloud Functions → Logs

Buscar:
- "Iniciando envío"
- "Error al enviar"
- Stack trace de errores
```

### Timezone Test

```javascript
// En browser console
new Date().toLocaleString('en-US', {timeZone: 'America/Bogota'})
```

---

## 📱 Notificaciones en el Navegador

### Permisos

```javascript
// Solicitar
Notification.requestPermission();

// Verificar estado
Notification.permission // "granted", "denied", "default"

// Mostrar notificación
new Notification("Título", {
  body: "Cuerpo",
  icon: "/icon.png"
})
```

### Service Worker

```javascript
// En firebase-messaging-sw.js
messaging.onBackgroundMessage((payload) => {
  // Procesa notificación cuando app está cerrada
})

self.addEventListener('notificationclick', (event) => {
  // Cuando usuario hace clic
})
```

---

## 🔄 Sincronización Offline

```javascript
// Firestore automáticamente:
// 1. Graba en caché local (IndexedDB)
// 2. Cuando vuelve conexión, sincroniza
// 3. Actualiza datos en tiempo real

// Ver estado:
onSnapshot(query, {includeMetadataChanges: true}, (snapshot) => {
  if (snapshot.metadata.fromCache) {
    console.log("Datos del caché local");
  } else {
    console.log("Datos del servidor");
  }
});
```

---

## 🎨 Stack de Tecnologías

```
┌─────────────────────────────┐
│    Next.js Frontend         │
│ (app/page.js + components)  │
└────────┬────────────────────┘
         │
    ┌────┴──────────────────────┐
    │                           │
    v                           v
┌──────────────┐    ┌─────────────────┐
│ Firestore    │    │ Firebase Auth   │
│ (Database)   │    │ (Login/Logout)  │
└──────────────┘    └─────────────────┘
    │                           │
    ├── Persistence: IndexedDB  │
    │   (Offline cache)         │
    │                           │
    └───────────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        v                       v
┌─────────────────┐   ┌──────────────┐
│ FCM (Cloud      │   │ Cloud        │
│ Messaging)      │   │ Functions    │
│ Push notifs     │   │ (Scheduler   │
└─────────────────┘   │  at 12 PM)   │
                      └──────────────┘
```

---

## ✨ Elementos Clave

### Archivos Críticos

```
✅ .env.local                    ← Variables Firebase (crear)
✅ public/firebase-messaging-sw.js ← Service Worker
✅ lib/firebase.js               ← Config Firebase
✅ app/page.js                   ← Setup FCM + UI
✅ app/hooks/useVentas.js        ← Notificaciones de stock
✅ CLOUD_FUNCTION_SETUP.js       ← Copiar a Firebase
```

### Flujo de Notificaciones

```
1. Usuario inicia sesión
   ↓
2. App solicita permiso
   ↓
3. Service Worker se registra
   ↓
4. Se obtiene token FCM
   ↓
5. Token se guarda en Firestore
   ↓
6. Cloud Function verifica tokens diarios
   ↓
7. Devuelve notificaciones push
```

---

## 💡 Tips

- 🔗 Guarda esta página como favorito
- 📋 Usa QUICK_SETUP.md para instalación
- 🐛 Si falla, revisa NOTIFICACIONES_SETUP.md → Solucionar problemas
- 🚀 Deploy Cloud Function es el paso más importante
- ⏰ Cloud Scheduler ejecuta automáticamente a las 12 PM
- 📱 Brower debe ser Chrome/Edge para mejor soporte

---

**Última actualización**: 2024
