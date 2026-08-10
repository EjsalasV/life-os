import { useState, useEffect } from 'react';
import { setDocument, userDocument } from '@/services/firebase/firestoreService';

export function useOnboarding(user: any) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  const completeOnboarding = async (physicalProfile: any) => {
    const payload = {
      ...physicalProfile,
      fechaCreacion: new Date().toISOString()
    };

    if (user?.uid) {
      try {
        await setDocument(userDocument(user.uid), {
          physicalProfile: payload,
          hasCompletedOnboarding: true,
          onboardingDate: new Date().toISOString()
        }, true);
      } catch (e) {
        console.error('Error guardando onboarding en Firestore', e);
        throw e;
      }
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('physical-profile-main', JSON.stringify(payload));
      localStorage.setItem('onboarding-complete-main', 'true');
    }

    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
