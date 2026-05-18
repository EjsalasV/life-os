"use client";

import { useState, useEffect } from "react";
import { onSnapshot, query, orderBy, where, limit } from "firebase/firestore";
import {
  getUserRef,
  getCuentasCol,
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
  const [movimientos, setMovimientos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [fijos, setFijos] = useState([]);
  const [metas, setMetas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [userStats, setUserStats] = useState({ lastActivity: null, currentStreak: 0 });
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [habitos, setHabitos] = useState([]);
  const [historialPeso, setHistorialPeso] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubUser = onSnapshot(getUserRef(user.uid), (d) => {
      if (d.exists()) {
        const data = d.data();
        setUserStats(data.stats || { lastActivity: null, currentStreak: 0 });
      }
    });

    const unsubs = [
      onSnapshot(getCuentasCol(user.uid), (s) => setCuentas(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getFijosCol(user.uid), (s) => setFijos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getMetasCol(user.uid), (s) => setMetas(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getPresupuestosCol(user.uid), (s) => setPresupuestos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(getProductosCol(user.uid), (s) => setProductos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(getVentasCol(user.uid), orderBy("timestamp", "desc")), (s) =>
        setVentas(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(getHabitosCol(user.uid), (s) => setHabitos(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(getPesoCol(user.uid), orderBy("timestamp", "desc")), (s) =>
        setHistorialPeso(s.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
    ];

    return () => {
      unsubUser();
      unsubs.forEach((u) => u());
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const start = new Date(filterDate.year, filterDate.month, 1);
    const end = new Date(filterDate.year, filterDate.month + 1, 0, 23, 59, 59);

    const q = query(
      getMovimientosCol(user.uid),
      orderBy("timestamp", "desc"),
      where("timestamp", ">=", start),
      where("timestamp", "<=", end),
      limit(100)
    );

    return onSnapshot(q, (s) => setMovimientos(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [user, filterDate]);

  return {
    movimientos,
    cuentas,
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
