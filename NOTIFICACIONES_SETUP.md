# 🔔 Configuración de Notificaciones Push (FCM)

## Paso 1: Obtener credenciales Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** (⚙️ > Configuración del proyecto)
4. Pestaña **Cloud Messaging**
5. Copia estos valores:
   - **Clave pública (VAPID)**
   - **ID del remitente**

## Paso 2: Actualizar variables de entorno

En el archivo `.env.local` (raíz del proyecto), agrega:

```env
# Notificaciones
NEXT_PUBLIC_FIREBASE_VAPID_KEY=tu_clave_publica_aqui
```

## Paso 3: Service Worker

✅ **YA ESTÁ HECHO** en `/public/firebase-messaging-sw.js`

El Service Worker:
- Recibe notificaciones cuando la app está cerrada
- Abre la app al hacer clic en la notificación
- Sincroniza datos automáticamente

## Paso 4: Crear Cloud Function

### En Firebase Console:

1. Ve a **Cloud Functions**
2. Haz clic en **Crear función**
3. Espera a que se cree el proyecto
4. Abre el archivo: `functions/index.js`
5. Reemplaza TODO el contenido con el código del archivo `CLOUD_FUNCTION_SETUP.js`

### IMPORTANTE - Personalización:

```javascript
// Cambia estos valores según tu zona horaria:
.timeZone('America/Bogota') // Tu zona horaria
.region('southamerica-bogota') // Tu región
```

### Zonas horarias disponibles:
- `America/Bogota` → Colombia
- `America/Mexico_City` → México
- `America/New_York` → USA Este
- `America/Los_Angeles` → USA Oeste
- `Europe/Madrid` → España
- [Ver todas](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Paso 5: Deploy de la función

En terminal, desde la carpeta del proyecto:

```bash
firebase deploy --only functions
```

O desde Firebase Console:
1. Cloud Functions
2. Selecciona `sendDailyReminders`
3. Haz clic en "Deploy"

## Paso 6: Verificar que funciona

### En Firebase Console → Cloud Functions → Logs:

A las 12:00 PM UTC (o tu zona) deberías ver:
```
✅ Iniciando envío de recordatorios diarios...
✅ Recordatorios enviados correctamente
```

### Para probar SIN esperar:

1. Ve a **Cloud Scheduler**
2. Busca el job `sendDailyReminders`
3. Haz clic en el menú (**⋮**) → **Ejecutar ahora**
4. Revisa los logs en **Cloud Functions**

## Paso 7: Conceder permisos en el navegador

Cuando el usuario entre a la app:
- Le aparecerá un popup: "¿Permitir notificaciones?"
- Debe hacer clic en **"Permitir"**

**Los navegadores en incógnito pueden bloquear notificaciones**

## 📊 Qué notificaciones se envían

Cada día a las 12:00 PM, se envían:

| Condición | Mensaje |
|-----------|---------|
| Racha no iniciada | 🔥 "¿Dónde está tu racha?" |
| Salud no registrada | 💪 "Registra tu salud" |
| Stock bajo (≤ 5) | 📦 "Stock Bajo" |

## ⚡ Solucionar problemas

### "No me llegan notificaciones"

1. ✅ ¿Diste permiso en el navegador?
2. ✅ ¿Está abierta la consola de Firebase?
3. ✅ ¿El Service Worker está registrado?
   - Abre DevTools → Application → Service Workers
4. ✅ ¿El token FCM se guardó?
   - En Firestore → users → [tu_user] → fcmToken

### "El Service Worker no se registra"

- Asegúrate que `firebase-messaging-sw.js` está en `/public/`
- Reinicia la app (Ctrl+Shift+R en Chrome)

### "La Cloud Function no se ejecuta"

- Verifica los logs: Cloud Functions → Logs
- Asegúrate de haber hecho Deploy (`firebase deploy --only functions`)
- Verifica la zona horaria y región

## 🔐 Seguridad

El token FCM:
- Se guarda en Firestore solo para ese usuario
- Solo se usa para enviarle notificaciones
- Se actualiza cada vez que abre la app

## 📱 Plataformas soportadas

✅ Chrome, Edge, Opera (Desktop)
✅ Firefox (soporte limitado)
✅ Safari (soporte limitado, requiere iOS 16.1+)
❌ Internet Explorer

Recomendación: Usa Chrome o Edge para mejor experiencia.
