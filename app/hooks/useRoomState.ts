import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_ROOM_ITEMS } from '@/app/lib/roomDefaults';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useRoomState(userId?: string) {
  const storageKey = `pet-room-${userId || 'main'}`;
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_ROOM_ITEMS;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return DEFAULT_ROOM_ITEMS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_ROOM_ITEMS;
    } catch {
      return DEFAULT_ROOM_ITEMS;
    }
  });
  const [editorOpen, setEditorOpen] = useState(false);

  const persist = useCallback(
    (nextItems: any[]) => {
      setItems(nextItems);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(nextItems));
      }
    },
    [storageKey]
  );

  const moveItem = useCallback(
    (id: string, x: number, y: number) => {
      const next = items.map((item: any) =>
        item.id === id
          ? { ...item, x: clamp(x, 0, 95 - item.w), y: clamp(y, 22, 95 - item.h) }
          : item
      );
      persist(next);
    },
    [items, persist]
  );

  const setItemTint = useCallback(
    (id: string, tint: string) => {
      const next = items.map((item: any) => (item.id === id ? { ...item, tint } : item));
      persist(next);
    },
    [items, persist]
  );

  const setItemState = useCallback(
    (id: string, state: string) => {
      const next = items.map((item: any) => (item.id === id ? { ...item, state } : item));
      persist(next);
    },
    [items, persist]
  );

  const plate = useMemo(() => items.find((item: any) => item.type === 'plate') || null, [items]);

  const triggerFoodOnPlate = useCallback(() => {
    if (!plate) return;
    setItemState(plate.id, 'full');
    setTimeout(() => setItemState(plate.id, 'empty'), 2500);
  }, [plate, setItemState]);

  return {
    items,
    plate,
    editorOpen,
    setEditorOpen,
    moveItem,
    setItemTint,
    setItemState,
    triggerFoodOnPlate
  };
}
