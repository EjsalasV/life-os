"use client";

import { useState, useMemo, useCallback } from 'react';
import type { Movimiento, Presupuesto } from '@/app/types';

interface TransaccionRecurrente {
  id: string;
  nombre: string;
  monto: number;
  categoria: string;
  tipo: 'INGRESO' | 'GASTO';
  diaDelMes: number;
  cuentaId: string;
  activa: boolean;
  ultimaEjecucion?: Date;
  frecuencia: 'mensual' | 'semanal' | 'quincenal';
}

interface AlertaPresupuesto {
  id: string;
  categoriaId: string;
  categoriaNombre: string;
  porcentajeUsado: number;
  alerta: 'normal' | 'advertencia' | 'critica';
  mensaje: string;
}

interface GastoAnomalo {
  id: string;
  movimientoId: string;
  nombre: string;
  monto: number;
  categoria: string;
  fecha: Date;
  desviacionEstandar: number;
  porcentajeSobrePromedio: number;
  severidad: 'leve' | 'moderada' | 'severa';
}

interface ForecastGasto {
  mes: string;
  prediccion: number;
  confianza: number;
  porcentajeCambio: number;
}

interface ComparativaMonthly {
  mes: string;
  total: number;
  porcentajeCambio: number;
  tendencia: 'subida' | 'bajada' | 'estable';
  categoriasDetalle: {
    categoria: string;
    monto: number;
    cambio: number;
  }[];
}

export default function useFinanzasAvanzadas() {
  const [transaccionesRecurrentes, setTransaccionesRecurrentes] = useState<TransaccionRecurrente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // ===== 1. ALERTAS DE PRESUPUESTO =====
  const generarAlertasPresupuesto = useCallback(
    (presupuestos: Presupuesto[], movimientos: Movimiento[]): AlertaPresupuesto[] => {
      const alertas: AlertaPresupuesto[] = [];

      presupuestos.forEach(presupuesto => {
        // Calcular gasto en esta categoría este mes
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

        const gastoCategoria = movimientos
          .filter(m => {
            const fechaMovimiento = m.timestamp instanceof Date ? m.timestamp : new Date((m.timestamp as any).toDate?.() || m.timestamp);
            return (
              m.categoria === presupuesto.categoria &&
              m.tipo === 'GASTO' &&
              fechaMovimiento >= inicioMes
            );
          })
          .reduce((sum, m) => sum + m.monto, 0);

        const porcentajeUsado = presupuesto.limite > 0
          ? Math.round((gastoCategoria / presupuesto.limite) * 100)
          : 0;

        // Determinar nivel de alerta
        let alerta: 'normal' | 'advertencia' | 'critica' = 'normal';
        let mensaje = '';

        if (porcentajeUsado >= 100) {
          alerta = 'critica';
          mensaje = `⚠️ ¡Superaste el presupuesto de ${presupuesto.categoria}! ${porcentajeUsado}%`;
        } else if (porcentajeUsado >= 80) {
          alerta = 'advertencia';
          mensaje = `📊 Cuidado: ${porcentajeUsado}% del presupuesto de ${presupuesto.categoria}`;
        } else {
          alerta = 'normal';
          mensaje = `✅ Vas bien en ${presupuesto.categoria}: ${porcentajeUsado}%`;
        }

        alertas.push({
          id: `alerta-${presupuesto.id}`,
          categoriaId: presupuesto.id,
          categoriaNombre: presupuesto.categoria,
          porcentajeUsado,
          alerta,
          mensaje
        });
      });

      return alertas;
    },
    []
  );

  // ===== 2. BÚSQUEDA Y FILTRO =====
  const buscarMovimientos = useCallback(
    (movimientos: Movimiento[]): Movimiento[] => {
      let resultados = [...movimientos];

      // Filtrar por texto (nombre, categoría)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        resultados = resultados.filter(m =>
          m.nombre.toLowerCase().includes(query) ||
          (m.categoria && m.categoria.toLowerCase().includes(query))
        );
      }

      // Filtrar por categorías seleccionadas
      if (selectedCategories.length > 0) {
        resultados = resultados.filter(m =>
          m.categoria && selectedCategories.includes(m.categoria)
        );
      }

      return resultados;
    },
    [searchQuery, selectedCategories]
  );

  const toggleCategoryFilter = useCallback((categoria: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories([]);
  }, []);

  // ===== 3. TRANSACCIONES RECURRENTES =====
  const crearTransaccionRecurrente = useCallback(
    (transaccion: Omit<TransaccionRecurrente, 'id' | 'ultimaEjecucion'>) => {
      const nuevaTransaccion: TransaccionRecurrente = {
        ...transaccion,
        id: `rec-${Date.now()}`,
        ultimaEjecucion: undefined
      };
      setTransaccionesRecurrentes(prev => [...prev, nuevaTransaccion]);
      return nuevaTransaccion;
    },
    []
  );

  const actualizarTransaccionRecurrente = useCallback(
    (id: string, updates: Partial<TransaccionRecurrente>) => {
      setTransaccionesRecurrentes(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
    },
    []
  );

  const eliminarTransaccionRecurrente = useCallback((id: string) => {
    setTransaccionesRecurrentes(prev => prev.filter(t => t.id !== id));
  }, []);

  // Detectar próximas transacciones recurrentes a ejecutar
  const proximasTransacciones = useMemo(() => {
    const hoy = new Date();
    const diaHoy = hoy.getDate();
    const proximosGastos: TransaccionRecurrente[] = [];

    transaccionesRecurrentes.forEach(t => {
      if (!t.activa) return;

      let debeEjecutar = false;

      switch (t.frecuencia) {
        case 'mensual':
          if (diaHoy === t.diaDelMes) debeEjecutar = true;
          break;
        case 'semanal':
          if (diaHoy % 7 === t.diaDelMes % 7) debeEjecutar = true;
          break;
        case 'quincenal':
          if (diaHoy === t.diaDelMes || diaHoy === t.diaDelMes + 15) debeEjecutar = true;
          break;
      }

      if (debeEjecutar) {
        proximosGastos.push(t);
      }
    });

    return proximosGastos;
  }, [transaccionesRecurrentes]);

  // ===== 4. ANÁLISIS PREDICTIVO (FASE 2) =====

  /**
   * Forecast de gastos basado en últimos 3 meses
   */
  const generarForecast = useCallback(
    (movimientos: Movimiento[]): ForecastGasto[] => {
      const ahora = new Date();
      const ultimos3Meses = [];

      // Obtener datos de últimos 3 meses
      for (let i = 2; i >= 0; i--) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
        const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

        const gastosMes = movimientos
          .filter(m => {
            const fechaM = m.timestamp instanceof Date ? m.timestamp : new Date((m.timestamp as any).toDate?.() || m.timestamp);
            return m.tipo === 'GASTO' && fechaM >= inicioMes && fechaM <= finMes;
          })
          .reduce((sum, m) => sum + m.monto, 0);

        ultimos3Meses.push({
          mes: inicioMes.toLocaleString('es-EC', { month: 'short', year: '2-digit' }),
          total: gastosMes
        });
      }

      // Calcular promedio y desviación
      const promedio = ultimos3Meses.reduce((a, m) => a + m.total, 0) / 3;
      const desv = Math.sqrt(
        ultimos3Meses.reduce((a, m) => a + Math.pow(m.total - promedio, 2), 0) / 3
      );

      // Forecast para próximos meses
      const forecast: ForecastGasto[] = [];
      for (let i = 0; i < 3; i++) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() + i + 1, 1);
        const mesFuture = fecha.toLocaleString('es-EC', { month: 'short', year: '2-digit' });

        // Tendencia: si en últimos 3 meses hay crecimiento
        const tendencia = ultimos3Meses[2].total > ultimos3Meses[0].total ? 1.02 : 0.98;
        const prediccion = promedio * tendencia;

        forecast.push({
          mes: mesFuture,
          prediccion: Math.round(prediccion),
          confianza: Math.max(50, 95 - desv / promedio * 10), // Menos varianza = más confianza
          porcentajeCambio: Math.round(((prediccion - promedio) / promedio) * 100)
        });
      }

      return forecast;
    },
    []
  );

  /**
   * Detectar anomalías en gastos (outliers)
   */
  const detectarAnomalias = useCallback(
    (movimientos: Movimiento[]): GastoAnomalo[] => {
      const gastos = movimientos.filter(m => m.tipo === 'GASTO');
      if (gastos.length < 3) return [];

      const anomalias: GastoAnomalo[] = [];

      // Agrupar por categoría para análisis más preciso
      const porCategoria = new Map<string, Movimiento[]>();
      gastos.forEach(g => {
        const cat = g.categoria || 'otros';
        if (!porCategoria.has(cat)) porCategoria.set(cat, []);
        porCategoria.get(cat)!.push(g);
      });

      porCategoria.forEach((movimientosCategoria, categoria) => {
        if (movimientosCategoria.length < 3) return;

        const montos = movimientosCategoria.map(m => m.monto);
        const promedio = montos.reduce((a, b) => a + b, 0) / montos.length;
        const varianza = montos.reduce((a, m) => a + Math.pow(m - promedio, 2), 0) / montos.length;
        const desv = Math.sqrt(varianza);

        // Detectar outliers (más de 2 desviaciones estándar)
        movimientosCategoria.forEach(m => {
          const desviaciones = Math.abs(m.monto - promedio) / (desv || 1);
          if (desviaciones > 2) {
            const severidad: 'leve' | 'moderada' | 'severa' =
              desviaciones > 4 ? 'severa' : desviaciones > 3 ? 'moderada' : 'leve';

            anomalias.push({
              id: `anomalia-${m.id}`,
              movimientoId: m.id,
              nombre: m.nombre,
              monto: m.monto,
              categoria: categoria,
              fecha: m.timestamp instanceof Date ? m.timestamp : new Date((m.timestamp as any).toDate?.() || m.timestamp),
              desviacionEstandar: desviaciones,
              porcentajeSobrePromedio: Math.round(((m.monto - promedio) / promedio) * 100),
              severidad
            });
          }
        });
      });

      return anomalias.sort((a, b) => b.desviacionEstandar - a.desviacionEstandar);
    },
    []
  );

  /**
   * Comparativa mes a mes
   */
  const generarComparativaMonthly = useCallback(
    (movimientos: Movimiento[]): ComparativaMonthly[] => {
      const ahora = new Date();
      const comparativa: ComparativaMonthly[] = [];

      // Últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
        const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

        const gastosMes = movimientos
          .filter(m => {
            const fechaM = m.timestamp instanceof Date ? m.timestamp : new Date((m.timestamp as any).toDate?.() || m.timestamp);
            return m.tipo === 'GASTO' && fechaM >= inicioMes && fechaM <= finMes;
          })
          .reduce((sum, m) => sum + m.monto, 0);

        // Desglose por categoría
        const categoriasDetalle: ComparativaMonthly['categoriasDetalle'] = [];
        const categorias = new Set(
          movimientos
            .filter(m => {
              const fechaM = m.timestamp instanceof Date ? m.timestamp : new Date((m.timestamp as any).toDate?.() || m.timestamp);
              return m.tipo === 'GASTO' && fechaM >= inicioMes && fechaM <= finMes;
            })
            .map(m => m.categoria || 'otros')
        );

        categorias.forEach(cat => {
          const montoCategoria = movimientos
            .filter(m => {
              const fechaM = m.timestamp instanceof Date ? m.timestamp : new Date((m.timestamp as any).toDate?.() || m.timestamp);
              return (
                m.tipo === 'GASTO' &&
                m.categoria === cat &&
                fechaM >= inicioMes &&
                fechaM <= finMes
              );
            })
            .reduce((sum, m) => sum + m.monto, 0);

          categoriasDetalle.push({
            categoria: cat,
            monto: montoCategoria,
            cambio: 0 // Se calcula después
          });
        });

        comparativa.push({
          mes: fecha.toLocaleString('es-EC', { month: 'short', year: '2-digit' }),
          total: gastosMes,
          porcentajeCambio: 0,
          tendencia: 'estable',
          categoriasDetalle
        });
      }

      // Calcular cambios porcentuales
      for (let i = 1; i < comparativa.length; i++) {
        const anterior = comparativa[i - 1].total;
        const actual = comparativa[i].total;
        const cambio = anterior > 0 ? Math.round(((actual - anterior) / anterior) * 100) : 0;

        comparativa[i].porcentajeCambio = cambio;
        comparativa[i].tendencia = cambio > 5 ? 'subida' : cambio < -5 ? 'bajada' : 'estable';

        // Cambios por categoría
        comparativa[i].categoriasDetalle.forEach(cat => {
          const catAnterior = comparativa[i - 1].categoriasDetalle.find(
            c => c.categoria === cat.categoria
          );
          if (catAnterior && catAnterior.monto > 0) {
            cat.cambio = Math.round(((cat.monto - catAnterior.monto) / catAnterior.monto) * 100);
          }
        });
      }

      return comparativa;
    },
    []
  );

  // ===== UTILIDADES =====
  const estadisticasFiltroBusqueda = useMemo(() => {
    return {
      busquedaActiva: searchQuery.trim().length > 0,
      filtrosActivos: selectedCategories.length,
      totalFiltros: searchQuery.trim().length + selectedCategories.length
    };
  }, [searchQuery, selectedCategories]);

  return {
    // Fase 1: Alertas
    generarAlertasPresupuesto,

    // Fase 1: Búsqueda y filtro
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategoryFilter,
    clearFilters,
    buscarMovimientos,
    estadisticasFiltroBusqueda,

    // Fase 1: Transacciones recurrentes
    transaccionesRecurrentes,
    crearTransaccionRecurrente,
    actualizarTransaccionRecurrente,
    eliminarTransaccionRecurrente,
    proximasTransacciones,

    // Fase 2: Análisis Predictivo
    generarForecast,
    detectarAnomalias,
    generarComparativaMonthly
  };
}
