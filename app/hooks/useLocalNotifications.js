"use client";

import { useEffect, useRef } from 'react';
import { auth } from '@/services/firebase/client';
import { readDocument, readMatching, userDocument } from '@/services/firebase/firestoreService';
import { getTodayKey } from '@/app/utils/helpers';

// Notificaciones locales (navegador + service worker) programadas una vez al día.
// Se disparan a horas específicas (8, 12, 18) si hay condiciones no satisfechas.
export default function useLocalNotifications() {
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    // Comprobar si está explícitamente deshabilitado via env var
    if (process.env.NEXT_PUBLIC_NOTIFICATIONS_MODE && process.env.NEXT_PUBLIC_NOTIFICATIONS_MODE !== 'local') {
      return;
    }

    // Solicitar permiso de forma lazy: solo cuando sea necesario (no al montar).
    // Los navegadores penalizan requestPermission() al cargar la app.
    const ensurePermission = async () => {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission === 'denied') return false;

      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (e) {
        console.error('Error al solicitar permisos de notificación:', e);
        return false;
      }
    };

    const showNotification = async (title, body, tag) => {
      try {
        const hasPermission = await ensurePermission();
        if (!hasPermission) return;

        const options = {
          body,
          tag: tag || 'lifeos-local',
          renotify: false,
          data: { date: Date.now() },
          requireInteraction: true
        };

        // Intentar via service worker (recomendado) o fallback a Notification API
        const reg = await navigator.serviceWorker?.getRegistration?.();
        if (reg && reg.showNotification) {
          reg.showNotification(title, options);
        } else if (Notification.permission === 'granted') {
          new Notification(title, options);
        }
      } catch (e) {
        console.error('Error mostrando notificación local:', e);
      }
    };

    const shouldSendToday = (uid, key, slot = '') => {
      try {
        const storageKey = `lifeos_lastSent_${uid}_${key}${slot ? `_${slot}` : ''}`;
        const raw = localStorage.getItem(storageKey);
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
        const storageKey = `lifeos_lastSent_${uid}_${key}${slot ? `_${slot}` : ''}`;
        localStorage.setItem(storageKey, new Date().toISOString());
      } catch (e) {
        // noop
      }
    };

    const checkAndNotify = async (force = false) => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const uid = user.uid;
        const now = new Date();
        const hour = now.getHours();
        const allowedHours = [8, 12, 18];

        // Modo test: permite cualquier hora
        let isTestMode = false;
        try {
          isTestMode =
            process.env.NEXT_PUBLIC_LOCAL_NOTIF_TEST === '1' ||
            localStorage.getItem('lifeos_local_notif_test') === '1';
        } catch (e) {
          isTestMode = false;
        }

        // Si no es hora permitida y no está forzado, salir
        if (!force && !isTestMode && !allowedHours.includes(hour)) {
          return;
        }

        const slotKey = `slot_${hour}`;

        // 1) RACHA: si la última actividad no es hoy
        const userRef = userDocument(uid);
        const userSnap = await readDocument(userRef);
        const userData = userSnap.exists() ? userSnap.data() : null;

        if (userData && shouldSendToday(uid, 'racha', slotKey)) {
          const lastActivity = userData.stats?.lastActivity;
          const lastDate = lastActivity ? new Date(lastActivity.toDate?.() || lastActivity).toDateString() : null;
          const today = new Date().toDateString();

          if (lastDate !== today) {
            await showNotification(
              '🔥 ¿Dónde está tu racha?',
              'No has iniciado tu racha hoy. ¡Mantén la consistencia!',
              `racha_${hour}`
            );
            markSentToday(uid, 'racha', slotKey);
          }
        }

        // 2) SALUD: si la batería está en 0 (usuario no registró nada hoy)
        const todayKey = getTodayKey(now);
        const saludRef = userDocument(uid, 'salud_diaria', todayKey);
        const saludSnap = await readDocument(saludRef);
        const saludData = saludSnap.exists() ? saludSnap.data() : null;

        if (saludData && shouldSendToday(uid, 'salud', slotKey)) {
          // Batería inicial es 10; dispara si sigue siendo 10 (sin registros) o bajó mucho
          if (saludData.bateria === 10 || saludData.bateria < 30) {
            await showNotification(
              '💪 Registra tu salud',
              'No has ingresado tu salud hoy. ¡Dinos cómo estás!',
              `salud_${hour}`
            );
            markSentToday(uid, 'salud', slotKey);
          }
        }

        // 3) STOCK: productos bajo de existencias
        const productsSnap = await readMatching(uid, 'productos', 'stock', '<=', 5);

        if (!productsSnap.empty && shouldSendToday(uid, 'stock', slotKey)) {
          const bajo = productsSnap.docs.map((d) => d.data().nombre || d.id).slice(0, 3);
          const body = `Revisa: ${bajo.join(', ')}${productsSnap.size > 3 ? '...' : ''}`;
          await showNotification('📦 Stock Bajo', body, `stock_${hour}`);
          markSentToday(uid, 'stock', slotKey);
        }
      } catch (error) {
        console.error('Error en scheduler local de notificaciones:', error);
      }
    };

    // Ejecutar inmediatamente y luego cada minuto
    checkAndNotify();

    // Intervalo: 10s en test, 60s en producción
    let testMode = false;
    try {
      testMode =
        process.env.NEXT_PUBLIC_LOCAL_NOTIF_TEST === '1' ||
        localStorage.getItem('lifeos_local_notif_test') === '1';
    } catch (e) {
      testMode = false;
    }

    const intervalMs = testMode ? 10 * 1000 : 60 * 1000;
    const intervalId = setInterval(checkAndNotify, intervalMs);

    // Helpers para debugging desde la consola del navegador
    try {
      window.runLifeOsLocalNotifications = async (force = true) => {
        await checkAndNotify(!!force);
        return 'OK';
      };
      window.showLifeOsTestNotification = async () => {
        await showNotification('Prueba Life OS', 'Notificación local de prueba', 'test');
        return 'OK';
      };
    } catch (e) {
      // noop
    }

    return () => {
      clearInterval(intervalId);
    };
  }, []);
}
