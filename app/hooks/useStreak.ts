// app/hooks/useStreak.ts
"use client";
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserStats, FirebaseUser } from '@/app/types';

export default function useStreak(user: FirebaseUser | null, userStats: UserStats) {
    const [streakModalOpen, setStreakModalOpen] = useState(false);

    const updateStreak = async (): Promise<boolean> => {
        if (!user) return false;

        try {
            const now = new Date();
            const last = userStats.lastActivity?.toDate ? userStats.lastActivity.toDate() : null;

            // Normalizar fechas a medianoche para comparar solo días
            const startOfDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const todayTimestamp = startOfDate(now);
            const lastTimestamp = last ? startOfDate(last) : 0;

            // Si el último registro NO fue hoy
            if (todayTimestamp !== lastTimestamp) {
                const yesterdayTimestamp = todayTimestamp - (24 * 60 * 60 * 1000);
                let newStreak = (lastTimestamp === yesterdayTimestamp)
                    ? (userStats.currentStreak || 0) + 1
                    : 1;

                // Usamos setDoc con merge para mayor robustez
                await setDoc(doc(db, 'users', user.uid), {
                    stats: {
                        lastActivity: serverTimestamp(),
                        currentStreak: newStreak
                    }
                }, { merge: true });

                return true; // Se actualizó
            }
            return false; // Ya se actualizó hoy
        } catch (e) {
            console.error("Error en racha:", e);
            return false;
        }
    };

    const handleNoSpendToday = async (showToast: (msg: string, type?: 'success' | 'error' | 'info') => void) => {
        const updated = await updateStreak();
        if (updated) {
            setStreakModalOpen(true);
        } else {
            showToast("Racha ya actualizada hoy 🔥", "info");
        }
    };

    return {
        streakModalOpen,
        setStreakModalOpen,
        updateStreak,
        handleNoSpendToday
    };
}
