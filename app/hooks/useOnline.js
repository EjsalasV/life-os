import { useState, useEffect } from 'react';
import { onlineStatus } from '@/lib/firebase';

export default function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Estado inicial
    setIsOnline(navigator.onLine);

    // Subscribe a cambios
    const unsubscribe = onlineStatus.subscribe((status) => {
      setIsOnline(status);
    });

    return unsubscribe;
  }, []);

  return isOnline;
}
