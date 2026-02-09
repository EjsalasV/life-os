import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getTodayKey } from '../utils/helpers';

export default function useSalud(ctx) {
  const { user, saludHoy, setSaludHoy, setErrorMsg } = ctx || {};

  const calculateBattery = (data) => {
    if (!data) return 50;
    let s = 25; if (data.sueñoCalidad === 'mal') s = 10; if (data.sueñoCalidad === 'bien') s = 40;
    const a = Math.min((data.agua || 0) * 2.5, 20);
    let e = 0; const m = parseInt(data.ejercicioMinutos || 0);
    if (m >= 10) e = 10; if (m >= 20) e = 20; if (m >= 40) e = 30;
    const an = data.animo === 'genial' ? 10 : 0;
    return Math.min(s + a + e + an, 100);
  };

  const updateHealthStat = async (field, value) => {
    if (!user || !saludHoy) return;
    const docRef = doc(db, 'users', user.uid, 'salud_diaria', getTodayKey());
    let finalValue = value;
    if (field === 'ejercicioMinutos' && parseInt(saludHoy.ejercicioMinutos) === value) finalValue = 0;
    const newData = { ...saludHoy, [field]: finalValue };
    try { await updateDoc(docRef, { [field]: finalValue, bateria: calculateBattery(newData), lastUpdate: serverTimestamp() }); } catch (e) { console.error(e); setErrorMsg && setErrorMsg(e.message); }
  };

  const toggleComida = async (tipoComida, calidad) => {
    if (!user || !saludHoy) return;
    const docRef = doc(db, 'users', user.uid, 'salud_diaria', getTodayKey());
    const nuevaCalidad = saludHoy.comidas?.[tipoComida] === calidad ? null : calidad;
    try { await updateDoc(docRef, { comidas: { ...saludHoy.comidas, [tipoComida]: nuevaCalidad }, lastUpdate: serverTimestamp() }); } catch (e) { console.error(e); setErrorMsg && setErrorMsg(e.message); }
  };

  const toggleHabitCheck = async (habitoId) => {
    if (!user || !saludHoy) return;
    const docRef = doc(db, 'users', user.uid, 'salud_diaria', getTodayKey());
    const checks = saludHoy.habitosChecks || [];
    const nuevos = checks.includes(habitoId) ? checks.filter(id => id !== habitoId) : [...checks, habitoId];
    try { await updateDoc(docRef, { habitosChecks: nuevos, lastUpdate: serverTimestamp() }); } catch (e) { console.error(e); setErrorMsg && setErrorMsg(e.message); }
  };

  const addWater = () => updateHealthStat('agua', (saludHoy?.agua || 0) + 1);
  const removeWater = () => updateHealthStat('agua', Math.max((saludHoy?.agua || 0) - 1, 0));

  return { calculateBattery, updateHealthStat, toggleComida, toggleHabitCheck, addWater, removeWater };
}
