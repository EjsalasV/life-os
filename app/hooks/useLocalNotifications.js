import { useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Hook para programar notificaciones LOCALES (cliente) una vez al día
export default function useLocalNotifications() {
  // Activar solo si la app está en modo local (OPCIÓN A)
  if (process.env.NEXT_PUBLIC_NOTIFICATIONS_MODE && process.env.NEXT_PUBLIC_NOTIFICATIONS_MODE !== 'local') return;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    let intervalId = null;

    // Solicitar permiso si no lo hay
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
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
        // Silenciar errores de notificación
        console.error('Error mostrando notificación local', err);
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
          // No es hora válida y no es modo test ni forzado
          return;
        }

        const slotKey = `slot_${hour}`;

        // 1) Racha: si no existe lastActivity
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : null;

        if (userData && !userData.lastActivity && shouldSendToday(uid, 'racha', slotKey)) {
          await showNotification('🔥 ¿Dónde está tu racha?', 'No has iniciado tu racha hoy. ¡Mantén la consistencia!', `racha_${hour}`);
          markSentToday(uid, 'racha', slotKey);
        }

        // 2) Salud diaria: revisar colección salud_diaria/{YYYY-MM-DD}
        const todayKey = new Date().toISOString().split('T')[0];
        const saludRef = doc(db, 'users', uid, 'salud_diaria', todayKey);
        const saludSnap = await getDoc(saludRef);
        const saludData = saludSnap.exists() ? saludSnap.data() : null;
        if (saludData && saludData.bateria === 50 && shouldSendToday(uid, 'salud', slotKey)) {
          await showNotification('💪 Registra tu salud', 'No has ingresado tu salud hoy. ¡Dinos cómo estás!', `salud_${hour}`);
          markSentToday(uid, 'salud', slotKey);
        }

        // 3) Stock bajo: revisar productos (local cache or server)
        const productosQuery = query(collection(db, 'users', uid, 'productos'), where('stock', '<=', 5));
        const productsSnap = await getDocs(productosQuery);
        if (!productsSnap.empty && shouldSendToday(uid, 'stock', slotKey)) {
          const bajo = productsSnap.docs.map((d) => d.data().nombre || d.id).slice(0, 3);
          const body = `Revisa: ${bajo.join(', ')}${productsSnap.size > 3 ? '...' : ''}`;
          await showNotification('📦 Stock Bajo', body, `stock_${hour}`);
          markSentToday(uid, 'stock', slotKey);
        }

      } catch (error) {
        console.error('Error en scheduler local de notificaciones', error);
      }
    };

    // Ejecutar inmediatamente y luego cada minuto
    checkAndNotify();

    // Modo de prueba rápido: si existe la key en localStorage o la variable de entorno
    let testMode = false;
    try { testMode = process.env.NEXT_PUBLIC_LOCAL_NOTIF_TEST === '1' || localStorage.getItem('lifeos_local_notif_test') === '1'; } catch (e) { testMode = false; }
    const intervalMs = testMode ? 10 * 1000 : 60 * 1000;
    intervalId = setInterval(checkAndNotify, intervalMs);

    // Exponer helpers para pruebas manuales desde la consola del navegador
    try {
      // function para disparar la comprobación manualmente (force=true para ignorar horario)
      window.runLifeOsLocalNotifications = async (force = true) => { await checkAndNotify(!!force); return 'OK'; };
      // función para mostrar una notificación de prueba
      window.showLifeOsTestNotification = async () => { await showNotification('Prueba Life OS', 'Notificación local de prueba', 'test'); return 'OK'; };
    } catch (e) {
      // noop si no se puede asignar al objeto window
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
}
