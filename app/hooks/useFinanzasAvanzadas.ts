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
            const fechaMovimiento = new Date(m.timestamp instanceof Date ? m.timestamp : m.timestamp);
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

  // ===== UTILIDADES =====
  const estadisticasFiltroBusqueda = useMemo(() => {
    return {
      busquedaActiva: searchQuery.trim().length > 0,
      filtrosActivos: selectedCategories.length,
      totalFiltros: searchQuery.trim().length + selectedCategories.length
    };
  }, [searchQuery, selectedCategories]);

  return {
    // Alertas
    generarAlertasPresupuesto,

    // Búsqueda y filtro
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategoryFilter,
    clearFilters,
    buscarMovimientos,
    estadisticasFiltroBusqueda,

    // Transacciones recurrentes
    transaccionesRecurrentes,
    crearTransaccionRecurrente,
    actualizarTransaccionRecurrente,
    eliminarTransaccionRecurrente,
    proximasTransacciones
  };
}
