"use client";

import { useMemo } from "react";
import { safeMonto, formatMoney, CATEGORIAS } from "@/app/utils/helpers";

export default function useDashboardDerivedMetrics({ movimientos, cuentas, fijos, presupuestos }) {
  const balanceMes = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipo === "INGRESO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    const gastos = movimientos
      .filter((m) => m.tipo === "GASTO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    return {
      ingresos,
      gastos,
      balance: ingresos - gastos,
      proyeccion:
        cuentas.reduce((acc, current) => acc + safeMonto(current.monto), 0) -
        fijos.reduce((acc, current) => acc + safeMonto(current.monto), 0)
    };
  }, [movimientos, cuentas, fijos]);

  const smartMessage = useMemo(() => {
    const gastoMensual = movimientos
      .filter((m) => m.tipo === "GASTO")
      .reduce((acc, current) => acc + safeMonto(current.monto), 0);

    return gastoMensual === 0 ? "Sin gastos este mes." : `Movimiento mensual: ${formatMoney(gastoMensual)}`;
  }, [movimientos]);

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
      const gastado = movimientos
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
  }, [presupuestos, movimientos]);

  return {
    balanceMes,
    smartMessage,
    presupuestoData
  };
}
