"use client";

import { finishOnboarding, updateUserStreak } from "@/services/firebase/dashboardService";

export default function useDashboardActions({
  user,
  showToast,
  setStreakModalOpen
}) {
  const updateStreak = async () => {
    if (!user) return false;

    try {
      return await updateUserStreak(user.uid);
    } catch (e) {
      console.error("Error en racha:", e);
      return false;
    }
  };

  const handleFinishOnboarding = async () => {
    if (!user) return;
    await finishOnboarding(user.uid);
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
