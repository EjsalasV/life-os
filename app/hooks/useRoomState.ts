import { useCallback, useMemo, useState } from 'react';
import { useStoredValue } from './useStoredValue';
import { z } from 'zod';
import { DEFAULT_ROOM_ITEMS } from '@/app/lib/roomDefaults';

const roomSchema = z.array(z.object({ id: z.string(), type: z.string(), label: z.string(), x: z.number().finite(), y: z.number().finite(), w: z.number().positive(), h: z.number().positive(), z: z.number().finite(), tint: z.string(), interactive: z.boolean(), state: z.string() }).passthrough());
const validItems = (v: unknown): v is typeof DEFAULT_ROOM_ITEMS => roomSchema.safeParse(v).success;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useRoomState(userId?: string) {
  const storageKey = `pet-room-${userId || 'main'}`;
  const [items, persist, storageError] = useStoredValue(storageKey, DEFAULT_ROOM_ITEMS, validItems);
  const [editorOpen, setEditorOpen] = useState(false);

  const moveItem = useCallback(
    (id: string, x: number, y: number) => {
      return persist((items) => items.map((item) =>
        item.id === id
          ? { ...item, x: clamp(x, 0, 95 - item.w), y: clamp(y, 22, 95 - item.h) }
          : item
      ));
    },
    [persist]
  );

  const setItemTint = useCallback(
    (id: string, tint: string) => {
      return persist((items) => items.map((item) => (item.id === id ? { ...item, tint } : item)));
    },
    [persist]
  );

  const setItemState = useCallback(
    (id: string, state: string) => {
      return persist((items) => items.map((item) => (item.id === id ? { ...item, state } : item)));
    },
    [persist]
  );

  const plate = useMemo(() => items.find((item: any) => item.type === 'plate') || null, [items]);

  const triggerFoodOnPlate = useCallback(() => {
    if (!plate) return;
    setItemState(plate.id, 'full');
    setTimeout(() => setItemState(plate.id, 'empty'), 2500);
  }, [plate, setItemState]);

  return {
    items, storageError,
    plate,
    editorOpen,
    setEditorOpen,
    moveItem,
    setItemTint,
    setItemState,
    triggerFoodOnPlate
  };
}
