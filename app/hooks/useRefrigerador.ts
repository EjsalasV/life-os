import { useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useStoredValue } from './useStoredValue';
import { useLocalDay } from './useLocalDay';
import { getTodayKey } from '@/app/utils/helpers';
import type { InventarioItem, InventarioUnidad } from '@/app/types/inventory';


const emptyInventory: InventarioItem[] = [];
const inventorySchema = z.array(z.object({
  id: z.string(), nombre: z.string().min(1), cantidad: z.number().finite().nonnegative(), unidad: z.string(),
  fechaAgregado: z.string(), categoria: z.string()
}).passthrough());
const validInventory = (value: unknown): value is InventarioItem[] => inventorySchema.safeParse(value).success;

function normalizeText(input: string) {
  return (input || '').trim().toLowerCase();
}

export function useRefrigerador(userId?: string) {
  const storageKey = `refri-${userId || 'main'}`;

  const today = useLocalDay();
  const [inventario, setInventario, storageError] = useStoredValue(storageKey, emptyInventory, validInventory);

  const agregarItem = useCallback((item: Omit<InventarioItem, 'id' | 'fechaAgregado'>) => {
    const newItem: InventarioItem = {
      ...item,
      cantidad: Number(item.cantidad) || 0,
      precio: item.precio ? Number(item.precio) : undefined,
      id: crypto.randomUUID(),
      fechaAgregado: new Date().toISOString()
    };

    return setInventario((prev) => [...prev, newItem]) ? newItem : null;
  }, [setInventario]);

  const removerItem = useCallback((itemId: string) => {
    setInventario((prev) => prev.filter((item) => item.id !== itemId));
  }, [setInventario]);

  const actualizarCantidad = useCallback((itemId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setInventario((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }

    setInventario((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, cantidad: nuevaCantidad } : item))
    );
  }, [setInventario]);

  const consumirIngrediente = useCallback((nombre: string, cantidad: number, unidad: string) => {
    const normalized = normalizeText(nombre);
    const cantidadConsumir = Number(cantidad) || 0;

    if (!normalized || cantidadConsumir <= 0) return;

    setInventario((prev) => {
      const candidate = prev.find(
        (item) =>
          normalizeText(item.nombre).includes(normalized) &&
          (item.unidad === unidad || !unidad)
      );

      if (!candidate) return prev;

      const nuevaCantidad = candidate.cantidad - cantidadConsumir;
      if (nuevaCantidad <= 0) {
        return prev.filter((item) => item.id !== candidate.id);
      }

      return prev.map((item) =>
        item.id === candidate.id ? { ...item, cantidad: nuevaCantidad } : item
      );
    });
  }, [setInventario]);

  const itemsProximosAExpirar = useMemo(() => {
    const now = new Date(today + "T00:00:00");
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return inventario.filter((item) => {
      if (!item.fechaExpiracion) return false;
      const expDate = new Date(item.fechaExpiracion.slice(0, 10) + "T00:00:00");
      return expDate >= now && expDate <= in7Days;
    });
  }, [inventario, today]);

  const itemsVencidos = useMemo(() => {
    const now = new Date(today + "T00:00:00");

    return inventario.filter((item) => {
      if (!item.fechaExpiracion) return false;
      return new Date(item.fechaExpiracion.slice(0, 10) + "T00:00:00") < now;
    });
  }, [inventario, today]);

  const recetasDisponibles = useCallback(
    (todasLasRecetas: any[] = []) => {
      return todasLasRecetas.filter((receta) => {
        const ingredientes = receta?.ingredientes || [];
        if (ingredientes.length === 0) return false;

        return ingredientes.every((ing: { nombre: string; cantidad: number; unidad?: InventarioUnidad }) => {
          const normalized = normalizeText(ing.nombre);
          const cantidadReq = Number(ing.cantidad) || 0;

          return inventario.some((item) => {
            const sameName = normalizeText(item.nombre).includes(normalized);
            const sameUnit = !ing.unidad || item.unidad === ing.unidad;
            return sameName && sameUnit && item.cantidad >= cantidadReq;
          });
        });
      });
    },
    [inventario]
  );

  return {
    inventario, storageError,
    agregarItem,
    removerItem,
    actualizarCantidad,
    consumirIngrediente,
    itemsProximosAExpirar,
    itemsVencidos,
    recetasDisponibles
  };
}