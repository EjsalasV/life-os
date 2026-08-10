"use client";

import { useState, useEffect } from "react";
import { subscribeDashboard, subscribeMovimientos } from "@/services/firebase/dashboardService";

export default function useDashboardRealtimeData(user, filterDate) {
  // Dependemos del uid (string estable), no del objeto user: cada snapshot del
  // doc de usuario crea un objeto nuevo y re-suscribiría todos los listeners.
  const uid = user?.uid;
  const filterYear = filterDate.year;
  const filterMonth = filterDate.month;
  const [syncError, setSyncError] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  // Movimientos del MES CALENDARIO ACTUAL (para métricas: ingresos/gastos/saldo del mes).
  // El saldo acumulado real vive en cuentas[].monto, mantenido por batches/transacciones.
  const [movimientosMesActual, setMovimientosMesActual] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [fijos, setFijos] = useState([]);
  const [metas, setMetas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [userStats, setUserStats] = useState({ lastActivity: null, currentStreak: 0 });
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [habitos, setHabitos] = useState([]);
  const [historialPeso, setHistorialPeso] = useState([]);

  useEffect(() => {
    if (!uid) return;

    return subscribeDashboard(uid, {
      setUserStats, setCuentas, setTarjetas, setFijos, setMetas, setPresupuestos,
      setProductos, setVentas, setHabitos, setHistorialPeso
    }, (error) => setSyncError(error.message || "No se pudieron sincronizar los datos"));
  }, [uid]);

  // Movimientos FILTRADOS por mes (para vista mes actual)
  useEffect(() => {
    if (!uid) return;

    const start = new Date(filterYear, filterMonth, 1);
    const end = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59);

    return subscribeMovimientos(uid, start, end, 100, setMovimientos, (error) => setSyncError(error.message));
  }, [uid, filterYear, filterMonth]);

  // Movimientos del mes calendario actual (acotado: no degrada con el historial).
  // limit(500) es solo un techo de seguridad para un único mes.
  useEffect(() => {
    if (!uid) return;

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return subscribeMovimientos(uid, inicioMes, finMes, 500, setMovimientosMesActual, (error) => setSyncError(error.message));
  }, [uid]);

  return {
    movimientos,
    movimientosMesActual, // mes calendario actual (para métricas)
    cuentas,
    tarjetas,
    fijos,
    metas,
    presupuestos,
    userStats,
    productos,
    ventas,
    habitos,
    historialPeso,
    syncError
  };
}
