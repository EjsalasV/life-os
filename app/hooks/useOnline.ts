import { useState, useEffect } from 'react';
import { onlineStatus } from '@/services/firebase/client';

export default function useOnline(): boolean {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Estado inicial
        setIsOnline(navigator.onLine);

        // Subscribe a cambios
        const unsubscribe = onlineStatus.subscribe((status: boolean) => {
            setIsOnline(status);
        });

        return unsubscribe;
    }, []);

    return isOnline;
}
