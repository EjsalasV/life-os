"use client";

import { useEffect, useRef } from "react";

export default function usePresupuestoAlerts(presupuestoData, showToast) {
  const alertedPresupuestos = useRef(new Set());

  useEffect(() => {
    if (!presupuestoData || !showToast) return;

    presupuestoData.forEach((presupuesto) => {
      const porcentaje = presupuesto.porcentaje || 0;
      const alertKey = `${presupuesto.id}-${Math.floor(porcentaje / 10) * 10}`;

      // Alerta crítica: excedido
      if (porcentaje >= 100 && !alertedPresupuestos.current.has(`${presupuesto.id}-100`)) {
        showToast(
          `⚠️ ${presupuesto.label}: ¡Presupuesto excedido! Gastaste ${Math.round(porcentaje - 100)}% más de lo planeado.`,
          "error"
        );
        alertedPresupuestos.current.add(`${presupuesto.id}-100`);
        alertedPresupuestos.current.delete(`${presupuesto.id}-80`);
        return;
      }

      // Alerta de advertencia: cerca del límite
      if (porcentaje >= 80 && porcentaje < 100 && !alertedPresupuestos.current.has(`${presupuesto.id}-80`)) {
        showToast(
          `⚠️ ${presupuesto.label}: Estás usando el ${Math.round(porcentaje)}% del presupuesto. ¡Ten cuidado!`,
          "info"
        );
        alertedPresupuestos.current.add(`${presupuesto.id}-80`);
        alertedPresupuestos.current.delete(`${presupuesto.id}-100`);
        return;
      }

      // Limpiar alertas si vuelve a estar dentro del rango seguro
      if (porcentaje < 80) {
        alertedPresupuestos.current.delete(`${presupuesto.id}-80`);
        alertedPresupuestos.current.delete(`${presupuesto.id}-100`);
      }
    });
  }, [presupuestoData, showToast]);

  return {
    getAlertStatus: (presupuestoId) => {
      const presupuesto = presupuestoData?.find(p => p.id === presupuestoId);
      if (!presupuesto) return null;

      const porcentaje = presupuesto.porcentaje || 0;
      if (porcentaje >= 100) return 'critico';
      if (porcentaje >= 80) return 'advertencia';
      return 'activo';
    }
  };
}
