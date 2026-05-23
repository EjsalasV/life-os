"use client";

import { useMemo } from "react";

export default function usePresupuestoProyeccion(presupuestoData) {
  return useMemo(() => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    // Primer día del mes
    const primerDia = new Date(añoActual, mesActual, 1);
    // Último día del mes
    const ultimoDia = new Date(añoActual, mesActual + 1, 0);

    const diasTotalesMes = ultimoDia.getDate();
    const diaActual = ahora.getDate();
    const diasTranscurridos = diaActual;
    const diasRestantes = diasTotalesMes - diaActual;
    const porcentajeMes = (diasTranscurridos / diasTotalesMes) * 100;

    return presupuestoData.map((presupuesto) => {
      const gastado = presupuesto.gastado || 0;
      const limite = presupuesto.limite || 0;

      // Gasto promedio por día hasta ahora
      const gastoDiaPromedio = diasTranscurridos > 0 ? gastado / diasTranscurridos : 0;

      // Proyección si continúa el mismo ritmo
      const proyeccionFinal = gastoDiaPromedio * diasTotalesMes;

      // Presupuesto diario recomendado
      const presupuestoDiario = limite / diasTotalesMes;

      // Diferencia vs límite
      const diferencia = limite - proyeccionFinal;
      const diferenciaPorcentaje = limite > 0 ? (diferencia / limite) * 100 : 0;

      // Estado de proyección
      let estadoProyeccion = 'seguro'; // ✅
      if (proyeccionFinal >= limite) {
        estadoProyeccion = 'critico'; // 🚨
      } else if (proyeccionFinal >= limite * 0.9) {
        estadoProyeccion = 'peligro'; // 🔴
      } else if (proyeccionFinal >= limite * 0.8) {
        estadoProyeccion = 'advertencia'; // 🟠
      } else if (proyeccionFinal >= limite * 0.7) {
        estadoProyeccion = 'elevado'; // 🟡
      }

      return {
        ...presupuesto,
        proyeccion: {
          gastoDiaPromedio: Math.round(gastoDiaPromedio * 100) / 100,
          proyeccionFinal: Math.round(proyeccionFinal * 100) / 100,
          presupuestoDiario: Math.round(presupuestoDiario * 100) / 100,
          diferencia: Math.round(diferencia * 100) / 100,
          diferenciaPorcentaje: Math.round(diferenciaPorcentaje),
          estado: estadoProyeccion,
          diasTranscurridos,
          diasRestantes,
          diasTotalesMes,
          porcentajeMes: Math.round(porcentajeMes)
        }
      };
    });
  }, [presupuestoData]);
}
