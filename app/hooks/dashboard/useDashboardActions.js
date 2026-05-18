"use client";

import { serverTimestamp, setDoc, runTransaction } from "firebase/firestore";
import { db } from "@/services/firebase/client";
import { getUserRef } from "@/lib/firebase-refs";

export default function useDashboardActions({
  user,
  showToast,
  setStreakModalOpen
}) {
  const updateStreak = async () => {
    if (!user) return false;

    try {
      return await runTransaction(db, async (transaction) => {
        const userRef = getUserRef(user.uid);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          transaction.set(
            userRef,
            {
              stats: {
                lastActivity: serverTimestamp(),
                currentStreak: 1
              }
            },
            { merge: true }
          );
          return true;
        }

        const userData = userSnap.data();
        const now = new Date();
        const last = userData.stats?.lastActivity?.toDate ? userData.stats.lastActivity.toDate() : null;

        const startOfDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const todayTimestamp = startOfDate(now);
        const lastTimestamp = last ? startOfDate(last) : 0;

        if (todayTimestamp === lastTimestamp) {
          return false;
        }

        const yesterdayTimestamp = todayTimestamp - 24 * 60 * 60 * 1000;
        const currentStreak = userData.stats?.currentStreak || 0;
        const newStreak = lastTimestamp === yesterdayTimestamp ? currentStreak + 1 : 1;

        transaction.update(userRef, {
          "stats.lastActivity": serverTimestamp(),
          "stats.currentStreak": newStreak
        });

        return true;
      });
    } catch (e) {
      console.error("Error en racha:", e);
      return false;
    }
  };

  const handleFinishOnboarding = async () => {
    if (!user) return;
    await setDoc(getUserRef(user.uid), { isNew: false }, { merge: true });
  };

  const handleNoSpendToday = async () => {
    const updated = await updateStreak();
    if (updated) setStreakModalOpen(true);
    else showToast("Racha ya actualizada hoy", "info");
  };

  return {
    updateStreak,
    handleFinishOnboarding,
    handleNoSpendToday
  };
}
