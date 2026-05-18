import { useState, useEffect } from 'react';
import { db } from '@/services/firebase/client';
import { doc, setDoc } from 'firebase/firestore';

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

    try {
      if (user?.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          physicalProfile: payload,
          hasCompletedOnboarding: true,
          onboardingDate: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.error('Error guardando onboarding en Firestore', e);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`physical-profile-${user?.uid || 'main'}`, JSON.stringify(payload));
      localStorage.setItem(`onboarding-complete-${user?.uid || 'main'}`, 'true');
    }

    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}
