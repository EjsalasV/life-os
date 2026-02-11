import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { onSnapshot, setDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getTodayKey } from '../utils/helpers';
import { getSaludDiariaDoc, getSaludDiariaCol } from '@/lib/firebase-refs';

/**
 * HOOK DE SALUD - NIVEL EXPERTO
 * Gestiona el algoritmo de energía vital basado en nutrición de impacto y reset total.
 */
export default function useSalud(user, setErrorMsg) {
  const [saludHoy, setSaludHoy] = useState(null);
  const [historialSalud, setHistorialSalud] = useState([]);

  useEffect(() => {
    if (!user) return;
    const todayKey = getTodayKey();
    const dailyRef = getSaludDiariaDoc(user.uid, todayKey);

    const unsubHoy = onSnapshot(dailyRef, async (docSnap) => {
      if (docSnap.exists()) {
        setSaludHoy(docSnap.data());
      } else {
        const initialData = {
          fecha: todayKey, bateria: 10, agua: 0, sueñoHoras: 7, sueñoCalidad: 'regular',
          animo: 'normal', ejercicioMinutos: 0, comidas: {}, habitosChecks: [],
          ayunoInicio: null, lastUpdate: serverTimestamp()
        };
        await setDoc(dailyRef, initialData);
        setSaludHoy(initialData);
      }
    });

    const unsubHist = onSnapshot(query(getSaludDiariaCol(user.uid), orderBy('fecha', 'desc')), (snap) => {
      setHistorialSalud(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubHoy(); unsubHist(); };
  }, [user]);

  // ALGORITMO DE ENERGÍA REAL (Base 10% + Impacto de Nutrición)
  const calculateBattery = (data) => {
    let score = 10; // Base mínima

    // 1. Ánimo
    if (data.animo === 'mal') score -= 15;
    if (data.animo === 'normal') score += 5;
    if (data.animo === 'genial') score += 15;

    // 2. Agua (3% por vaso)
    score += (data.agua || 0) * 3;

    // 3. NUTRICIÓN DE IMPACTO (La lógica que pediste)
    Object.values(data.comidas || {}).forEach(val => {
      if (val === 'nutritivo') score += 10;
      if (val === 'normal') score += 5;
      if (val === 'procesado') score -= 10;
    });

    // 4. Protocolos (5% por cada hábito)
    score += (data.habitosChecks || []).length * 5;

    // 5. Movimiento (10% si hay ejercicio)
    if ((data.ejercicioMinutos || 0) > 0) score += 10;

    return Math.max(0, Math.min(100, score));
  };

  const updateHealthStat = async (field, value) => {
    if (!user || !saludHoy) return;
    const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
    const newData = { ...saludHoy, [field]: value };
    
    try {
      await updateDoc(dailyRef, { 
        [field]: value, 
        bateria: calculateBattery(newData), 
        lastUpdate: serverTimestamp() 
      });
    } catch (e) { console.error(e); }
  };

  const resetDailyHealth = async () => {
    if (!user || !saludHoy) return;
    const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
    const resetData = {
      agua: 0, animo: 'normal', comidas: {}, habitosChecks: [],
      ejercicioMinutos: 0, bateria: 10, lastUpdate: serverTimestamp()
    };
    try {
      await updateDoc(dailyRef, resetData);
      setErrorMsg?.("Sistema reiniciado ✅");
    } catch (e) { setErrorMsg?.("Error al reiniciar", "error"); }
  };

  const toggleComida = async (tipoComida, calidad) => {
    if (!user || !saludHoy) return;
    const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
    const nuevasComidas = { ...saludHoy.comidas, [tipoComida]: calidad };
    const newData = { ...saludHoy, comidas: nuevasComidas };
    await updateDoc(dailyRef, { comidas: nuevasComidas, bateria: calculateBattery(newData) });
  };

  const toggleHabitCheck = async (habitoId) => {
    if (!user || !saludHoy) return;
    const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
    const checks = saludHoy.habitosChecks || [];
    const nuevos = checks.includes(habitoId) ? checks.filter(id => id !== habitoId) : [...checks, habitoId];
    const newData = { ...saludHoy, habitosChecks: nuevos };
    await updateDoc(dailyRef, { habitosChecks: nuevos, bateria: calculateBattery(newData) });
  };

  const addWater = () => updateHealthStat('agua', (saludHoy?.agua || 0) + 1);
  const removeWater = () => updateHealthStat('agua', Math.max((saludHoy?.agua || 0) - 1, 0));
  const toggleFasting = async () => {
    const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
    await updateDoc(dailyRef, { ayunoInicio: saludHoy.ayunoInicio ? null : Date.now() });
  };

  return { 
    saludHoy, historialSalud, updateHealthStat, toggleComida, 
    toggleHabitCheck, addWater, removeWater, toggleFasting, resetDailyHealth 
  };
}