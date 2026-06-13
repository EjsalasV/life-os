"use client";

import { useMemo } from "react";
import { safeMonto, formatMoney, getTime, CATEGORIAS } from "@/app/utils/helpers";

// Función pura: balance del conjunto de movimientos recibido.
// Solo INGRESO y GASTO cuentan; TRANSFERENCIA y AHORRO_META son neutros.
// Futuro/Fijos es SOLO informativo, no afecta el balance.
export function calcularBalanceMes(movimientos, fijos = []) {
  const ingresos = movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, current) => acc + safeMonto(current.monto), 0);

  const gastos = movimientos
    .filter((m) => m.tipo === "GASTO")
    .reduce((acc, current) => acc + safeMonto(current.monto), 0);

  const gastosFijos = fijos.reduce((acc, current) => acc + safeMonto(current.monto), 0);

  return {
    ingresos,
    gastos,
    gastosFijos,
    balance: ingresos - gastos,
    // Proyección = ingresos - gastos del periodo. Fijos NO se incluye (informativo).
    proyeccion: ingresos - gastos
  };
}

// Función pura: filtra los movimientos que caen en el mes calendario actual.
export function filtrarMesActual(movimientos, ahora = new Date()) {
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
  const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1).getTime();
  return movimientos.filter((m) => {
    const t = getTime(m.timestamp);
    return t >= inicio && t < fin;
  });
}

export default function useDashboardDerivedMetrics({ movimientos, fijos, presupuestos }) {
  // `movimientos` llega ya acotado al mes actual desde useDashboardRealtimeData;
  // este filtro es una red de seguridad (timestamps pendientes de servidor, etc.).
  const movimientosMesActual = useMemo(() => filtrarMesActual(movimientos), [movimientos]);

  const balanceMes = useMemo(
    () => calcularBalanceMes(movimientosMesActual, fijos),
    [movimientosMesActual, fijos]
  );

  const smartMessage = useMemo(() => {
    const gastos = movimientosMesActual.filter((m) => m.tipo === "GASTO");
    const gastoMensual = gastos.reduce((acc, current) => acc + safeMonto(current.monto), 0);
    if (gastoMensual === 0) return "Sin gastos este mes. ¡Buen trabajo! 🎯";

    // Categoría con más gasto
    const porCategoria = gastos.reduce((acc, m) => {
      const cat = m.categoria || "otros";
      acc[cat] = (acc[cat] || 0) + safeMonto(m.monto);
      return acc;
    }, {});
    const topCat = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];
    const topLabel = CATEGORIAS.find(c => c.id === topCat?.[0])?.label || topCat?.[0] || "otros";

    return `Mayor gasto: ${topLabel} con ${formatMoney(topCat?.[1] || 0)}`;
  }, [movimientosMesActual]);

  const presupuestoData = useMemo(() => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();
    const primerDia = new Date(añoActual, mesActual, 1);
    const ultimoDia = new Date(añoActual, mesActual + 1, 0);
    const diasTotalesMes = ultimoDia.getDate();
    const diaActual = ahora.getDate();
    const diasTranscurridos = diaActual;
    const diasRestantes = diasTotalesMes - diaActual;
    const porcentajeMes = (diasTranscurridos / diasTotalesMes) * 100;

    return CATEGORIAS.map((cat) => {
      const presupuesto = presupuestos.find((p) => p?.categoria === cat.id);
      const categoria = presupuesto?.categoria || cat.id;
      const limite = safeMonto(presupuesto?.limite);
      const gastado = movimientosMesActual
        .filter((m) => m.tipo === "GASTO" && m.categoria === cat.id)
        .reduce((acc, current) => acc + safeMonto(current.monto), 0);

      const porcentaje = limite > 0 ? Math.round((gastado / limite) * 100) : 0;
      const historial = presupuesto?.historial || [];

      // Proyección
      const gastoDiaPromedio = diasTranscurridos > 0 ? gastado / diasTranscurridos : 0;
      const proyeccionFinal = gastoDiaPromedio * diasTotalesMes;
      const presupuestoDiario = limite / diasTotalesMes;
      const diferencia = limite - proyeccionFinal;
      const diferenciaPorcentaje = limite > 0 ? (diferencia / limite) * 100 : 0;

      let estadoProyeccion = 'seguro';
      if (proyeccionFinal >= limite) {
        estadoProyeccion = 'critico';
      } else if (proyeccionFinal >= limite * 0.9) {
        estadoProyeccion = 'peligro';
      } else if (proyeccionFinal >= limite * 0.8) {
        estadoProyeccion = 'advertencia';
      } else if (proyeccionFinal >= limite * 0.7) {
        estadoProyeccion = 'elevado';
      }

      return {
        ...cat,
        id: presupuesto?.id || cat.id,
        presupuestoId: presupuesto?.id || null,
        categoria,
        label: cat.label || "Sin categoría",
        limite,
        gastado,
        porcentaje,
        historial,
        alertas: presupuesto?.alertas || [],
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
  }, [presupuestos, movimientosMesActual]);

  return {
    balanceMes,
    smartMessage,
    presupuestoData
  };
}
