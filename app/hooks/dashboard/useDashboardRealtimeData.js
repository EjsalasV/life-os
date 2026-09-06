"use client";

import { userError } from "@/lib/userError";
import { useLocalDay } from "@/app/hooks/useLocalDay";
import { useState, useEffect } from "react";
import { subscribeDashboard, subscribeMovimientos } from "@/services/firebase/dashboardService";

export default function useDashboardRealtimeData(user, filterDate) {
  // Dependemos del uid (string estable), no del objeto user: cada snapshot del
  // doc de usuario crea un objeto nuevo y re-suscribiría todos los listeners.
  const uid = user?.uid;
  const currentMonth = useLocalDay().slice(0, 7);
  const filterYear = filterDate.year;
  const filterMonth = filterDate.month;
  const [syncError, setSyncError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
    }, () => { setSyncError("No se pudieron sincronizar todos los datos. Revisa tu conexión y recarga para reintentar."); setIsLoading(false); }, () => setIsLoading(false));
  }, [uid]);

  // Movimientos FILTRADOS por mes (para vista mes actual)
  useEffect(() => {
    if (!uid) return;

    const start = new Date(filterYear, filterMonth, 1);
    const end = new Date(filterYear, filterMonth + 1, 1);

    return subscribeMovimientos(uid, start, end, 100, setMovimientos, (error) => setSyncError(userError(error)));
  }, [uid, filterYear, filterMonth]);

  // Movimientos del mes calendario actual (acotado: no degrada con el historial).
  useEffect(() => {
    if (!uid) return;

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return subscribeMovimientos(uid, inicioMes, finMes, 500, setMovimientosMesActual, (error) => setSyncError(userError(error)));
  }, [uid, currentMonth]);

  return {
    movimientos, isLoading,
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
