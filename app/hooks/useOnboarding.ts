import { completePhysicalProfile } from "@/services/firebase/authService";
import { reportProductEvent } from "@/services/observability/reporter";

export function useOnboarding(user: any) {
  const showOnboarding = !!user && !user.hasCompletedOnboarding;

  const completeOnboarding = async (physicalProfile: any) => {
    const payload = {
      ...physicalProfile,
      fechaCreacion: new Date().toISOString()
    };

    if (user?.uid) {
      try {
        await completePhysicalProfile(user.uid, payload);
        reportProductEvent("onboarding_completed", { focus: payload.enfoque || "equilibrio" });
      } catch (e) {
        console.error('Error guardando onboarding en Firestore', e);
        throw e;
      }
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('physical-profile-main', JSON.stringify(payload));
      localStorage.setItem('onboarding-focus-main', payload.enfoque || 'equilibrio');
      localStorage.setItem('onboarding-complete-main', 'true');
    }

  };

  return { showOnboarding, completeOnboarding };
}
