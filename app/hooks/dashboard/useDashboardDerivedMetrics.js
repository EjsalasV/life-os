"use client";

import { useMemo } from "react";
import { safeMonto, formatMoney, getTime, CATEGORIAS } from "@/app/utils/helpers";

export default function useDashboardDerivedMetrics({ movimientos, cuentas, fijos, presupuestos }) {
  // Presupuestos y mensajes comparan contra el MES ACTUAL;
  // el saldo (balanceMes) sí usa todos los movimientos (acumulado).
  const movimientosMesActual = useMemo(() => {
    const ahora = new Date();
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
    const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1).getTime();
    return movimientos.filter((m) => {
      const t = getTime(m.timestamp);
      return t >= inicio && t < fin;
    });
  }, [movimientos]);

  const balanceMes = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipo === "INGRESO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    // Gastos REALES: excluye transferencias (solo GASTO)
    const gastos = movimientos
      .filter((m) => m.tipo === "GASTO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    // Futuro/Fijos es SOLO informativo, no afecta el balance
    const gastosFijos = fijos.reduce((acc, current) => acc + safeMonto(current.monto), 0);

    return {
      ingresos,
      gastos,
      gastosFijos,
      balance: ingresos - gastos,
      // Proyección REAL = ingresos - gastos REALES
      // Futuro/Fijos NO se incluye (es solo visual/informativo)
      proyeccion: ingresos - gastos
    };
  }, [movimientos, cuentas, fijos]);

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
