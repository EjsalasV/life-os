# ⚡ Quick Setup Checklist - Notificaciones Push

Sigue estos pasos para activar notificaciones push diarias a las 12 PM.

## ✅ Checklist de Configuración

### Fase 1: Variables de Entorno (5 min)

- [ ] **Paso 1.1**: Abre [Firebase Console](https://console.firebase.google.com)
- [ ] **Paso 1.2**: Ve a tu proyecto → Configuración ⚙️
- [ ] **Paso 1.3**: Copia desde "Cloud Messaging":
  - [ ] Clave pública (VAPID key)
  - [ ] ID del remitente (Sender ID)
- [ ] **Paso 1.4**: Copia desde "Credenciales de tu app":
  - [ ] apiKey
  - [ ] authDomain
  - [ ] projectId
  - [ ] storageBucket
  - [ ] messagingSenderId
  - [ ] appId

**En el archivo `.env.local` (crear si no existe):**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=abc123...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=miapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mi-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mi-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BIz5...  # ← Clave pública FCM
```

- [ ] **Paso 1.5**: Reinicia servidor: `npm run dev`

---

### Fase 2: Service Worker (YA HECHO ✅)

- [x] `/public/firebase-messaging-sw.js` ya existe
- [x] Se registra automáticamente en `page.js`

---

### Fase 3: Cloud Function (15-20 min)

#### 3.1 - Preparar código

- [ ] Abre el archivo `CLOUD_FUNCTION_SETUP.js` del proyecto
- [ ] Copia TODO su contenido

#### 3.2 - En Firebase Console

1. Ve a **Cloud Functions**
2. Haz clic en **Crear función**
3. Espera a que se configure (puede tardarse 1-2 min)
4. Selecciona la función `sendDailyReminders`
5. Pestaña **CÓDIGO**
6. Archivo `index.js` → Reemplaza TODO con el código del paso 3.1
7. Instala dependencias si es necesario
8. **Deploy** (botón azul)

#### 3.3 - Personalizar (IMPORTANTE)

En el código de la Cloud Function, busca esta línea:

```javascript
.timeZone('America/Bogota') // ← CAMBIA SI NO ESTÁS EN BOGOTÁ
```

Reemplaza con tu zona horaria:
- Colombia: `America/Bogota`
- México: `America/Mexico_City`
- España: `Europe/Madrid`
- USA Este: `America/New_York`
- USA Oeste: `America/Los_Angeles`

[Ver todas las zonas](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

#### 3.4 - Deploy

- [ ] Haz clic en **Deploy**
- [ ] Espera mensaje "✅ Deployment Successful"
- [ ] Ve a **Cloud Scheduler** y verifica que aparece `sendDailyReminders`

---

### Fase 4: Probar (5 min)

#### Test inmediato (sin esperar a las 12 PM)

1. Firebase Console → **Cloud Scheduler**
2. Busca job `sendDailyReminders`
3. Haz clic en el menú (**⋮**) → **Ejecutar ahora**
4. Ve a **Cloud Functions** → **Logs**
5. Deberías ver:
   ```
   ✅ Iniciando envío de recordatorios diarios...
   ✅ Recordatorios enviados correctamente
   ```

#### Test en la app

1. Abre http://localhost:3000
2. Inicia sesión
3. Te pedirá permitir notificaciones → **Haz clic en "Permitir"**
4. Verifica en DevTools:
   - Application → Service Workers → Debe estar ✅ activo
   - Application → IndexedDB → firebaseLocalStorageDb → fcmTokens

#### Si todo funcionó

- ✅ Recibirás notificaciones automáticamente a las 12 PM
- ✅ La app estará online/offline

---

## 🐛 Si algo no funciona

| Problema | Solución |
|----------|----------|
| No llegan notificaciones | ¿Clickeaste "Permitir" en el navegador? Si falló, limpia datos: DevTools → Application → Cookies → Elimina todo → Recarga |
| `Error: VAPID key is invalid` | Copia la VAPID key exactamente como aparece en Firebase Console (sin espacios) |
| Service Worker no registra | Recarga con Ctrl+Shift+R (hard refresh) |
| Cloud Function no se ejecuta | Verifica los logs: Cloud Functions → Logs. Busca errores. |
| La app dice "Offline" permanente | Abre DevTools → Network → Recarga. Verifica tu conexión WiFi. |

---

## 📱 Después de Deploy

La app ahora:
- ✅ Funciona **offline** (datos se sincronizan automáticamente)
- ✅ Envía **notificaciones push** (incluso si la app está cerrada)
- ✅ Recibe recordatorios **diarios a las 12 PM**

---

## 🎯 Próximos pasos opcionales

- Personalizar horario: Edita `0 12 * * *` en Cloud Function (formato CRON)
- Agregar más notificaciones: Edita la función en Cloud Functions
- Monitorear: Revisa Cloud Scheduler → Logs

---

**¿Preguntas?** Ver [NOTIFICACIONES_SETUP.md](NOTIFICACIONES_SETUP.md) para documentación completa.
