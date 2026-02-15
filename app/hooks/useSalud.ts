// app/hooks/useSalud.ts
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { onSnapshot, setDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getTodayKey } from '../utils/helpers';
import { getSaludDiariaDoc, getSaludDiariaCol } from '@/lib/firebase-refs';
import type { FirebaseUser, SaludHoy, HistorialSalud } from '@/app/types';

export default function useSalud(
    user: FirebaseUser | null,
    setErrorMsg: (msg: string, type?: 'success' | 'error' | 'info') => void
) {
    const [saludHoy, setSaludHoy] = useState<SaludHoy | null>(null);
    const [historialSalud, setHistorialSalud] = useState<HistorialSalud[]>([]);

    useEffect(() => {
        if (!user) return;
        const todayKey = getTodayKey();
        const dailyRef = getSaludDiariaDoc(user.uid, todayKey);

        const unsubHoy = onSnapshot(dailyRef, async (docSnap) => {
            if (docSnap.exists()) {
                setSaludHoy(docSnap.data() as SaludHoy);
            } else {
                const initialData: Partial<SaludHoy> = {
                    fecha: todayKey,
                    bateria: 10,
                    agua: 0,
                    animo: 'normal',
                    ejercicioMinutos: 0,
                    comidas: {},
                    habitosChecks: [],
                    ayunoInicio: undefined
                };
                await setDoc(dailyRef, { ...initialData, lastUpdate: serverTimestamp() });
                setSaludHoy(initialData as SaludHoy);
            }
        });

        const unsubHist = onSnapshot(
            query(getSaludDiariaCol(user.uid), orderBy('fecha', 'desc')),
            (snap) => {
                setHistorialSalud(snap.docs.map(d => ({ id: d.id, ...d.data() } as HistorialSalud)));
            }
        );

        return () => { unsubHoy(); unsubHist(); };
    }, [user]);

    const calculateBattery = (data: Partial<SaludHoy>): number => {
        let score = 10;

        if (data.animo === 'mal') score -= 15;
        if (data.animo === 'normal') score += 5;
        if (data.animo === 'genial') score += 15;

        score += (data.agua || 0) * 3;

        Object.values(data.comidas || {}).forEach(val => {
            if (val === 'nutritivo') score += 10;
            if (val === 'normal') score += 5;
            if (val === 'procesado') score -= 10;
        });

        score += (data.habitosChecks || []).length * 5;

        if ((data.ejercicioMinutos || 0) > 0) score += 10;

        return Math.max(0, Math.min(100, score));
    };

    const updateHealthStat = async (field: keyof SaludHoy, value: any): Promise<void> => {
        if (!user || !saludHoy) return;
        const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
        const newData = { ...saludHoy, [field]: value };

        try {
            await updateDoc(dailyRef, {
                [field]: value,
                bateria: calculateBattery(newData),
                lastUpdate: serverTimestamp()
            });
        } catch (e) {
            console.error(e);
        }
    };

    const resetDailyHealth = async (): Promise<void> => {
        if (!user || !saludHoy) return;
        const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
        const resetData = {
            agua: 0,
            animo: 'normal' as const,
            comidas: {},
            habitosChecks: [],
            ejercicioMinutos: 0,
            bateria: 10,
            lastUpdate: serverTimestamp()
        };
        try {
            await updateDoc(dailyRef, resetData);
            setErrorMsg("Sistema reiniciado ✅");
        } catch (e) {
            setErrorMsg("Error al reiniciar", "error");
        }
    };

    const toggleComida = async (
        tipoComida: 'desayuno' | 'almuerzo' | 'cena',
        calidad: 'nutritivo' | 'normal' | 'procesado'
    ): Promise<void> => {
        if (!user || !saludHoy) return;
        const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
        const nuevasComidas = { ...saludHoy.comidas, [tipoComida]: calidad };
        const newData = { ...saludHoy, comidas: nuevasComidas };
        await updateDoc(dailyRef, {
            comidas: nuevasComidas,
            bateria: calculateBattery(newData)
        });
    };

    const toggleHabitCheck = async (habitoId: string): Promise<void> => {
        if (!user || !saludHoy) return;
        const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
        const checks = saludHoy.habitosChecks || [];
        const nuevos = checks.includes(habitoId)
            ? checks.filter(id => id !== habitoId)
            : [...checks, habitoId];
        const newData = { ...saludHoy, habitosChecks: nuevos };
        await updateDoc(dailyRef, {
            habitosChecks: nuevos,
            bateria: calculateBattery(newData)
        });
    };

    const addWater = () => updateHealthStat('agua', (saludHoy?.agua || 0) + 1);
    const removeWater = () => updateHealthStat('agua', Math.max((saludHoy?.agua || 0) - 1, 0));

    const toggleFasting = async (): Promise<void> => {
        if (!user || !saludHoy) return;
        const dailyRef = getSaludDiariaDoc(user.uid, getTodayKey());
        await updateDoc(dailyRef, {
            ayunoInicio: saludHoy.ayunoInicio ? null : Date.now()
        });
    };

    return {
        saludHoy,
        historialSalud,
        updateHealthStat,
        toggleComida,
        toggleHabitCheck,
        addWater,
        removeWater,
        toggleFasting,
        resetDailyHealth
    };
}
