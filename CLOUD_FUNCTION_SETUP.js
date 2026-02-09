// ========================================
// CLOUD FUNCTION PARA RECORDATORIOS DIARIOS
// ========================================
// Copiar este código en: Firebase Console → Functions → Crear/Editar
// Archivo: functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// 🔔 Función que se ejecuta cada día a las 12:00 PM (UTC)
exports.sendDailyReminders = functions
  .region('southamerica-bogota') // O la región más cercana a ti
  .pubsub.schedule('0 12 * * *') // 12:00 PM UTC (ajusta según tu zona)
  .timeZone('America/Bogota') // Cambia a tu zona horaria
  .onRun(async (context) => {
    console.log('🔔 Iniciando envío de recordatorios diarios...');
    
    try {
      // 1. Obtener todos los usuarios
      const usersSnapshot = await db.collection('users').get();
      const promises = [];

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;

        if (!fcmToken) {
          console.log(`⚠️ Usuario ${userId} no tiene token FCM`);
          return;
        }

        // 2. Obtener datos del día actual
        const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const saludDiariaRef = db
          .collection('users')
          .doc(userId)
          .collection('salud_diaria')
          .doc(todayKey);

        const userStatsRef = db.collection('users').doc(userId);

        // 3. Verificar estado del usuario y enviar notificaciones
        const promise = Promise.all([
          saludDiariaRef.get(),
          userStatsRef.get()
        ]).then(([saludSnapshot, statsSnapshot]) => {
          const saludData = saludSnapshot.data();
          const statsData = statsSnapshot.data();

          const messages = [];

          // 🔥 Verificar si la racha está activa hoy
          if (statsData && !statsData.lastActivity) {
            messages.push({
              notification: {
                title: '🔥 ¿Dónde está tu racha?',
                body: 'No has iniciado tu racha hoy. ¡Mantén la consistencia!'
              }
            });
          }

          // 💪 Verificar si registró salud hoy
          if (saludData && saludData.bateria === 50) {
            // bartería = 50 es el valor inicial (sin registros del día)
            messages.push({
              notification: {
                title: '💪 Registra tu salud',
                body: 'No has ingresado tu salud hoy. ¡Dinos cómo estás!'
              }
            });
          }

          // 📦 Verificar stock bajo (opcional, si tienes productos)
          return db
            .collection('users')
            .doc(userId)
            .collection('productos')
            .where('stock', '<=', 5)
            .get()
            .then((productsSnapshot) => {
              if (!productsSnapshot.empty) {
                const bajoStock = productsSnapshot.docs
                  .filter((doc) => doc.data().stock <= 5)
                  .map((doc) => doc.data().nombre);

                if (bajoStock.length > 0) {
                  messages.push({
                    notification: {
                      title: '📦 Stock Bajo',
                      body: `Revisa: ${bajoStock.slice(0, 2).join(', ')}${bajoStock.length > 2 ? '...' : ''}`
                    }
                  });
                }
              }

              // 4. Enviar notificaciones
              return Promise.all(
                messages.map((msgTemplate) =>
                  messaging.sendToDevice(fcmToken, {
                    notification: msgTemplate.notification,
                    android: {
                      priority: 'high',
                      notification: {
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                      }
                    },
                    webpush: {
                      fcmOptions: {
                        link: 'https://tu-dominio.com' // Cambiar a tu dominio
                      }
                    }
                  })
                )
              );
            });
        });

        promises.push(promise);
      });

      // Esperar a que todas las promesas se resuelvan
      await Promise.all(promises);
      console.log('✅ Recordatorios enviados correctamente');
      return null;
    } catch (error) {
      console.error('❌ Error enviando recordatorios:', error);
      return null;
    }
  });

// ========================================
// INSTRUCCIONES DE INSTALACIÓN
// ========================================
/*

1. En Firebase Console, ve a: Functions

2. Si es primera vez:
   - Haz clic en "Crear función"
   - Selecciona "Conectar a Cloud Firestore"
   - Espera a que se cree el proyecto

3. En el archivo index.js, reemplaza TODO el contenido con el código de arriba

4. IMPORTANTE - Actualiza en el código:
   - Tu región: .region('southamerica-bogota') → cambia según tu zona
   - Tu zona horaria: .timeZone('America/Bogota') → ajusta a tu zona
   - Tu dominio en webpush.fcmOptions.link

5. En archivo package.json (functions/package.json), asegúrate que tenga:
   {
     "name": "functions",
     "dependencies": {
       "firebase-admin": "^12.0.0",
       "firebase-functions": "^4.4.0"
     }
   }

6. Haz Deploy:
   - Terminal: firebase deploy --only functions
   - O desde Firebase Console: Deploy

7. Verifica en Logs:
   - Firebase Console → Functions → Logs
   - Buscas por "Recordatorios" a las 12:00 PM

8. Para PROBAR sin esperar a las 12:00:
   - Ve a Cloud Scheduler
   - Edita el job "sendDailyReminders"
   - Haz click en "Ejecutar ahora"

*/
