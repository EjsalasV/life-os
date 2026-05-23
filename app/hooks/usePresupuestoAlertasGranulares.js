"use client";

import { useEffect, useRef } from "react";

const UMBRALES = [50, 70, 80, 90, 100];

const getUmbralInfo = (porcentaje) => {
  if (porcentaje >= 100) return { umbral: 100, emoji: '🚨', label: 'Excedido', color: 'bg-rose-500' };
  if (porcentaje >= 90) return { umbral: 90, emoji: '🔴', label: 'Crítico', color: 'bg-red-500' };
  if (porcentaje >= 80) return { umbral: 80, emoji: '🟠', label: 'Cercano', color: 'bg-amber-500' };
  if (porcentaje >= 70) return { umbral: 70, emoji: '🟡', label: 'Elevado', color: 'bg-yellow-500' };
  if (porcentaje >= 50) return { umbral: 50, emoji: '⚪', label: 'Moderado', color: 'bg-blue-500' };
  return { umbral: 0, emoji: '✅', label: 'Seguro', color: 'bg-emerald-500' };
};

export default function usePresupuestoAlertasGranulares(presupuestoData, showToast) {
  const alertedPresupuestos = useRef(new Map());

  useEffect(() => {
    if (!presupuestoData || !showToast) return;

    presupuestoData.forEach((presupuesto) => {
      const porcentaje = presupuesto.porcentaje || 0;
      const umbralActual = getUmbralInfo(porcentaje);
      const alertKey = `${presupuesto.id}-${umbralActual.umbral}`;

      // Only alert if threshold has changed
      const alertado = alertedPresupuestos.current.get(presupuesto.id);

      if (!alertado || alertado.umbral !== umbralActual.umbral) {
        // Mostrar alerta
        let mensaje = '';

        if (porcentaje >= 100) {
          mensaje = `${umbralActual.emoji} ${presupuesto.label}: ¡EXCEDIDO! Has gastado ${Math.round(porcentaje)}% del presupuesto.`;
        } else if (porcentaje >= 90) {
          mensaje = `${umbralActual.emoji} ${presupuesto.label}: ¡CUIDADO! Estás al ${Math.round(porcentaje)}% del límite.`;
        } else if (porcentaje >= 80) {
          mensaje = `${umbralActual.emoji} ${presupuesto.label}: ${Math.round(porcentaje)}% utilizado. Aproximándote al límite.`;
        } else if (porcentaje >= 70) {
          mensaje = `${umbralActual.emoji} ${presupuesto.label}: ${Math.round(porcentaje)}% utilizado. Gasto elevado.`;
        } else if (porcentaje >= 50) {
          mensaje = `${umbralActual.emoji} ${presupuesto.label}: ${Math.round(porcentaje)}% utilizado. Mitad del presupuesto.`;
        }

        const tipoAlert = porcentaje >= 80 ? 'error' : porcentaje >= 70 ? 'info' : 'info';
        showToast(mensaje, tipoAlert);

        // Actualizar estado
        alertedPresupuestos.current.set(presupuesto.id, {
          umbral: umbralActual.umbral,
          porcentaje,
          timestamp: Date.now()
        });
      }
    });
  }, [presupuestoData, showToast]);

  return {
    getAlertStatus: (presupuestoId) => {
      const presupuesto = presupuestoData?.find(p => p.id === presupuestoId);
      if (!presupuesto) return null;
      return getUmbralInfo(presupuesto.porcentaje || 0);
    },
    getAlertedPresupuestos: () => {
      return Array.from(alertedPresupuestos.current.entries()).map(([id, data]) => ({
        id,
        ...data,
        info: getUmbralInfo(data.porcentaje)
      }));
    }
  };
}
