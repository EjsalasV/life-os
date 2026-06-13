"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, where, limit } from "firebase/firestore";
import {
  getUserRef,
  getCuentasCol,
  getTarjetasCol,
  getFijosCol,
  getMetasCol,
  getPresupuestosCol,
  getProductosCol,
  getVentasCol,
  getHabitosCol,
  getPesoCol,
  getMovimientosCol
} from "@/lib/firebase-refs";

export default function useDashboardRealtimeData(user, filterDate) {
  // Dependemos del uid (string estable), no del objeto user: cada snapshot del
  // doc de usuario crea un objeto nuevo y re-suscribiría todos los listeners.
  const uid = user?.uid;
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

    const unsubUser = onSnapshot(getUserRef(uid), (d) => {
      if (d.exists()) {
        const data = d.data();
        setUserStats(data.stats || { lastActivity: null, currentStreak: 0 });
      }
    });

    const unsubs = [
      onSnapshot(getCuentasCol(uid), (s) => setCuentas(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getTarjetasCol(uid), (s) => setTarjetas(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getFijosCol(uid), (s) => setFijos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getMetasCol(uid), (s) => setMetas(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getPresupuestosCol(uid), (s) => setPresupuestos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getProductosCol(uid), (s) => setProductos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(getVentasCol(uid), orderBy("timestamp", "desc")), (s) =>
        setVentas(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(getHabitosCol(uid), (s) => setHabitos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(getPesoCol(uid), orderBy("timestamp", "desc")), (s) =>
        setHistorialPeso(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
    ];

    return () => {
      unsubUser();
      unsubs.forEach((u) => u());
    };
  }, [uid]);

  // Movimientos FILTRADOS por mes (para vista mes actual)
  useEffect(() => {
    if (!uid) return;

    const start = new Date(filterDate.year, filterDate.month, 1);
    const end = new Date(filterDate.year, filterDate.month + 1, 0, 23, 59, 59);

    const q = query(
      getMovimientosCol(uid),
      orderBy("timestamp", "desc"),
      where("timestamp", ">=", start),
      where("timestamp", "<=", end),
      limit(100)
    );

    return onSnapshot(q, (s) => setMovimientos(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [uid, filterDate]);

  // Movimientos del mes calendario actual (acotado: no degrada con el historial).
  // limit(500) es solo un techo de seguridad para un único mes.
  useEffect(() => {
    if (!uid) return;

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const q = query(
      getMovimientosCol(uid),
      orderBy("timestamp", "desc"),
      where("timestamp", ">=", inicioMes),
      where("timestamp", "<=", finMes),
      limit(500)
    );

    return onSnapshot(q, (s) => setMovimientosMesActual(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
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
    historialPeso
  };
}
