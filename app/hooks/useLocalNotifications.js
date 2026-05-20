import { useEffect } from 'react';
import { db, auth } from '@/services/firebase/client';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Hook para programar notificaciones LOCALES (cliente) una vez al dÃ­a
export default function useLocalNotifications() {
  // Activar solo si la app estÃ¡ en modo local (OPCIÃ“N A)
  if (process.env.NEXT_PUBLIC_NOTIFICATIONS_MODE && process.env.NEXT_PUBLIC_NOTIFICATIONS_MODE !== 'local') return;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    let intervalId = null;

    // Solicitar permiso si no lo hay (con manejo de errores)
    if (Notification.permission === 'default') {
      Notification.requestPermission()
        .then((permission) => {
          if (permission === 'denied') {
            console.warn('Usuario denegÃ³ permisos de notificaciÃ³n');
            // AquÃ­ se podrÃ­a guardar en estado para mostrar UI
          } else if (permission === 'granted') {
            console.log('Permisos de notificaciÃ³n concedidos');
          }
        })
        .catch((err) => {
          console.error('Error al solicitar permisos de notificaciÃ³n:', err);
          // El usuario sigue usando la app, pero notificaciones no funcionarÃ¡n
        });
    }

    const showNotification = async (title, body, tag) => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const options = {
          body,
          tag: tag || 'lifeos-local',
          renotify: false,
          data: { date: Date.now() },
          requireInteraction: true
        };

        if (reg && reg.showNotification) {
          reg.showNotification(title, options);
        } else if (Notification.permission === 'granted') {
          new Notification(title, options);
        }
      } catch (err) {
        // Silenciar errores de notificaciÃ³n
        console.error('Error mostrando notificaciÃ³n local', err);
      }
    };

    const shouldSendToday = (uid, key, slot = '') => {
      try {
        const k = `lifeos_lastSent_${uid}_${key}${slot ? `_${slot}` : ''}`;
        const raw = localStorage.getItem(k);
        if (!raw) return true;
        const last = new Date(raw);
        const today = new Date();
        return last.toDateString() !== today.toDateString();
      } catch (e) {
        return true;
      }
    };

    const markSentToday = (uid, key, slot = '') => {
      try {
        const k = `lifeos_lastSent_${uid}_${key}${slot ? `_${slot}` : ''}`;
        localStorage.setItem(k, new Date().toISOString());
      } catch (e) {
        // noop
      }
    };

    const checkAndNotify = async (force = false) => {
      try {
        if (Notification.permission !== 'granted') return;
        const user = auth.currentUser;
        if (!user) return;
        const uid = user.uid;

        // Determinar hora actual y slots permitidos
        const now = new Date();
        const hour = now.getHours();
        const allowedHours = [8, 12, 18];
        let isTestMode = false;
        try { isTestMode = process.env.NEXT_PUBLIC_LOCAL_NOTIF_TEST === '1' || localStorage.getItem('lifeos_local_notif_test') === '1'; } catch (e) { isTestMode = false; }

        if (!force && !isTestMode && !allowedHours.includes(hour)) {
          // No es hora vÃ¡lida y no es modo test ni forzado
          return;
        }

        const slotKey = `slot_${hour}`;

        // 1) Racha: si no existe lastActivity
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : null;

        if (userData && !userData.lastActivity && shouldSendToday(uid, 'racha', slotKey)) {
          await showNotification('ðŸ”¥ Â¿DÃ³nde estÃ¡ tu racha?', 'No has iniciado tu racha hoy. Â¡MantÃ©n la consistencia!', `racha_${hour}`);
          markSentToday(uid, 'racha', slotKey);
        }

        // 2) Salud diaria: revisar colecciÃ³n salud_diaria/{YYYY-MM-DD}
        const todayKey = new Date().toISOString().split('T')[0];
        const saludRef = doc(db, 'users', uid, 'salud_diaria', todayKey);
        const saludSnap = await getDoc(saludRef);
        const saludData = saludSnap.exists() ? saludSnap.data() : null;
        if (saludData && saludData.bateria === 50 && shouldSendToday(uid, 'salud', slotKey)) {
          await showNotification('ðŸ’ª Registra tu salud', 'No has ingresado tu salud hoy. Â¡Dinos cÃ³mo estÃ¡s!', `salud_${hour}`);
          markSentToday(uid, 'salud', slotKey);
        }

        // 3) Stock bajo: revisar productos (local cache or server)
        const productosQuery = query(collection(db, 'users', uid, 'productos'), where('stock', '<=', 5));
        const productsSnap = await getDocs(productosQuery);
        if (!productsSnap.empty && shouldSendToday(uid, 'stock', slotKey)) {
          const bajo = productsSnap.docs.map((d) => d.data().nombre || d.id).slice(0, 3);
          const body = `Revisa: ${bajo.join(', ')}${productsSnap.size > 3 ? '...' : ''}`;
          await showNotification('ðŸ“¦ Stock Bajo', body, `stock_${hour}`);
          markSentToday(uid, 'stock', slotKey);
        }

      } catch (error) {
        console.error('Error en scheduler local de notificaciones', error);
      }
    };

    // Ejecutar inmediatamente y luego cada minuto
    checkAndNotify();

    // Modo de prueba rÃ¡pido: si existe la key en localStorage o la variable de entorno
    let testMode = false;
    try { testMode = process.env.NEXT_PUBLIC_LOCAL_NOTIF_TEST === '1' || localStorage.getItem('lifeos_local_notif_test') === '1'; } catch (e) { testMode = false; }
    const intervalMs = testMode ? 10 * 1000 : 60 * 1000;
    intervalId = setInterval(checkAndNotify, intervalMs);

    // Exponer helpers para pruebas manuales desde la consola del navegador
    try {
      // function para disparar la comprobaciÃ³n manualmente (force=true para ignorar horario)
      window.runLifeOsLocalNotifications = async (force = true) => { await checkAndNotify(!!force); return 'OK'; };
      // funciÃ³n para mostrar una notificaciÃ³n de prueba
      window.showLifeOsTestNotification = async () => { await showNotification('Prueba Life OS', 'NotificaciÃ³n local de prueba', 'test'); return 'OK'; };
    } catch (e) {
      // noop si no se puede asignar al objeto window
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
}
