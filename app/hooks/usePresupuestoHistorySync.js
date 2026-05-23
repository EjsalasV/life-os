"use client";

import { useEffect, useRef } from "react";
import { financeService } from "@/modules/finance/services/financeService";

export default function usePresupuestoHistorySync(presupuestoData, movimientos, user) {
  const lastSyncRef = useRef(null);

  useEffect(() => {
    if (!presupuestoData || !user || presupuestoData.length === 0) return;

    const now = new Date();
    const mesActual = now.getMonth();
    const añoActual = now.getFullYear();
    const syncKey = `${mesActual}-${añoActual}`;

    // Only sync once per month
    if (lastSyncRef.current === syncKey) return;

    // Check if we need to update historial
    presupuestoData.forEach(async (presupuesto) => {
      if (!presupuesto.id) return;

      const historial = presupuesto.historial || [];
      const ultimoRegistro = historial[0]; // Más reciente

      // Check if current month is already in history
      if (ultimoRegistro && ultimoRegistro.mes === mesActual && ultimoRegistro.año === añoActual) {
        // Already synced for this month
        lastSyncRef.current = syncKey;
        return;
      }

      // Get gasto for last month to update history
      if (ultimoRegistro && historial.length > 0) {
        const mesAnterior = ultimoRegistro.mes;
        const añoAnterior = ultimoRegistro.año;

        // Calculate spending for the stored month
        const gastadoMesAnterior = movimientos
          .filter((m) => {
            const mDate = new Date(m.timestamp.seconds ? m.timestamp.seconds * 1000 : m.timestamp);
            return (
              m.tipo === "GASTO" &&
              m.categoria === presupuesto.categoria &&
              mDate.getMonth() === mesAnterior &&
              mDate.getFullYear() === añoAnterior
            );
          })
          .reduce((acc, m) => acc + (m.monto || 0), 0);

        // Update last month record with actual spending
        const historialActualizado = historial.map((h, idx) => {
          if (idx === 0) {
            return {
              ...h,
              gastado: gastadoMesAnterior,
              superado: gastadoMesAnterior > h.limite
            };
          }
          return h;
        });

        // Add new month record
        historialActualizado.unshift({
          mes: mesActual,
          año: añoActual,
          limite: presupuesto.limite,
          gastado: 0,
          superado: false
        });

        // Keep only last 12 months
        const historialFinal = historialActualizado.slice(0, 12);

        // Update in Firestore
        try {
          await financeService.updateEntity(user.uid, "presupuestos", presupuesto.id, {
            historial: historialFinal,
            ultimaActualizacion: financeService.timestamp()
          });
        } catch (error) {
          console.error("Error updating presupuesto history:", error);
        }
      }

      lastSyncRef.current = syncKey;
    });
  }, [presupuestoData, movimientos, user]);

  return {
    isSynced: !!lastSyncRef.current
  };
}
