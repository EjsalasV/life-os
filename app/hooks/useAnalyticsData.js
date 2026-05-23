"use client";

import { useMemo } from "react";
import { safeMonto } from "@/app/utils/helpers";

export default function useAnalyticsData({ movimientos, presupuestos, cuentas, metas }) {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();

  // Gastos por categoría este mes
  const gastosPorCategoria = useMemo(() => {
    const categorias = {};

    movimientos.forEach((m) => {
      if (m.tipo === "GASTO") {
        const mDate = new Date(m.timestamp.seconds ? m.timestamp.seconds * 1000 : m.timestamp);
        if (mDate.getMonth() === mesActual && mDate.getFullYear() === añoActual) {
          const cat = m.categoria || "otros";
          categorias[cat] = (categorias[cat] || 0) + safeMonto(m.monto);
        }
      }
    });

    return categorias;
  }, [movimientos]);

  // Comparación mes actual vs mes anterior
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const añoMesAnterior = mesActual === 0 ? añoActual - 1 : añoActual;

  const gastosMesAnterior = useMemo(() => {
    return movimientos
      .filter((m) => {
        if (m.tipo !== "GASTO") return false;
        const mDate = new Date(m.timestamp.seconds ? m.timestamp.seconds * 1000 : m.timestamp);
        return mDate.getMonth() === mesAnterior && mDate.getFullYear() === mesAnterior === 0 ? añoActual - 1 : añoActual;
      })
      .reduce((acc, m) => acc + safeMonto(m.monto), 0);
  }, [movimientos]);

  const gastosMesActual = useMemo(() => {
    return movimientos
      .filter((m) => {
        if (m.tipo !== "GASTO") return false;
        const mDate = new Date(m.timestamp.seconds ? m.timestamp.seconds * 1000 : m.timestamp);
        return mDate.getMonth() === mesActual && mDate.getFullYear() === añoActual;
      })
      .reduce((acc, m) => acc + safeMonto(m.monto), 0);
  }, [movimientos]);

  const variacionMes = gastosMesAnterior > 0 ? ((gastosMesActual - gastosMesAnterior) / gastosMesAnterior) * 100 : 0;

  // Top 5 categorías
  const topCategorias = useMemo(() => {
    return Object.entries(gastosPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoria, monto]) => ({
        categoria,
        monto,
        porcentaje: ((monto / gastosMesActual) * 100).toFixed(1)
      }));
  }, [gastosPorCategoria, gastosMesActual]);

  // Ingresos vs Gastos
  const ingresosMesActual = useMemo(() => {
    return movimientos
      .filter((m) => {
        if (m.tipo !== "INGRESO") return false;
        const mDate = new Date(m.timestamp.seconds ? m.timestamp.seconds * 1000 : m.timestamp);
        return mDate.getMonth() === mesActual && mDate.getFullYear() === añoActual;
      })
      .reduce((acc, m) => acc + safeMonto(m.monto), 0);
  }, [movimientos]);

  const ahorroMesActual = ingresosMesActual - gastosMesActual;
  const tasaAhorro = ingresosMesActual > 0 ? ((ahorroMesActual / ingresosMesActual) * 100).toFixed(1) : 0;

  // Cumplimiento de presupuestos
  const cumplimientoPresupuestos = useMemo(() => {
    const presupuestosConDatos = presupuestos
      .filter((p) => {
        const gasto = gastosPorCategoria[p.categoria] || 0;
        return p.limite > 0;
      })
      .map((p) => {
        const gasto = gastosPorCategoria[p.categoria] || 0;
        const porcentaje = (gasto / p.limite) * 100;
        return {
          categoria: p.categoria,
          limite: p.limite,
          gasto,
          porcentaje: Math.round(porcentaje),
          cumple: gasto <= p.limite
        };
      });

    const cumple = presupuestosConDatos.filter((p) => p.cumple).length;
    const total = presupuestosConDatos.length;

    return {
      cumple,
      total,
      porcentaje: total > 0 ? Math.round((cumple / total) * 100) : 0,
      presupuestos: presupuestosConDatos
    };
  }, [presupuestos, gastosPorCategoria]);

  // Ahorros potenciales
  const ahorrosPotenciales = useMemo(() => {
    return presupuestos
      .filter((p) => {
        const gasto = gastosPorCategoria[p.categoria] || 0;
        return gasto < p.limite;
      })
      .map((p) => {
        const gasto = gastosPorCategoria[p.categoria] || 0;
        const ahorroPotencial = p.limite - gasto;
        return {
          categoria: p.categoria,
          ahorroActual: p.limite - gasto,
          porcentaje: ((ahorroPotencial / p.limite) * 100).toFixed(1)
        };
      })
      .reduce((acc, p) => acc + p.ahorroActual, 0);
  }, [presupuestos, gastosPorCategoria]);

  // Promedio de gasto diario
  const promedioDiario = Math.round(gastosMesActual / ahora.getDate());

  // Metas en progreso
  const metasProgreso = useMemo(() => {
    return (metas || [])
      .map((m) => ({
        nombre: m.nombre,
        objetivo: m.montoObjetivo,
        actual: m.montoActual,
        porcentaje: Math.round((m.montoActual / m.montoObjetivo) * 100),
        restante: m.montoObjetivo - m.montoActual
      }))
      .sort((a, b) => b.porcentaje - a.porcentaje);
  }, [metas]);

  return {
    gastosMesActual,
    ingresosMesActual,
    ahorroMesActual,
    tasaAhorro,
    gastosMesAnterior,
    variacionMes,
    gastosPorCategoria,
    topCategorias,
    cumplimientoPresupuestos,
    ahorrosPotenciales,
    promedioDiario,
    metasProgreso,
    mesActual,
    añoActual
  };
}
