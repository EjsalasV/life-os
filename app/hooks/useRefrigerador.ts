import { useCallback, useEffect, useMemo, useState } from 'react';
import type { InventarioItem, InventarioUnidad } from '@/app/types/inventory';

function normalizeText(input: string) {
  return (input || '').trim().toLowerCase();
}

export function useRefrigerador(userId?: string) {
  const storageKey = `refri-${userId || 'main'}`;

  const [inventario, setInventario] = useState<InventarioItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];

    try {
      return JSON.parse(stored) as InventarioItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(inventario));
  }, [inventario, storageKey]);

  const agregarItem = useCallback((item: Omit<InventarioItem, 'id' | 'fechaAgregado'>) => {
    const newItem: InventarioItem = {
      ...item,
      cantidad: Number(item.cantidad) || 0,
      precio: item.precio ? Number(item.precio) : undefined,
      id: `item-${Date.now()}`,
      fechaAgregado: new Date().toISOString()
    };

    setInventario((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const removerItem = useCallback((itemId: string) => {
    setInventario((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const actualizarCantidad = useCallback((itemId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setInventario((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }

    setInventario((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, cantidad: nuevaCantidad } : item))
    );
  }, []);

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
  }, []);

  const itemsProximosAExpirar = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return inventario.filter((item) => {
      if (!item.fechaExpiracion) return false;
      const expDate = new Date(item.fechaExpiracion);
      return expDate >= now && expDate <= in7Days;
    });
  }, [inventario]);

  const itemsVencidos = useMemo(() => {
    const now = new Date();

    return inventario.filter((item) => {
      if (!item.fechaExpiracion) return false;
      return new Date(item.fechaExpiracion) < now;
    });
  }, [inventario]);

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
    inventario,
    agregarItem,
    removerItem,
    actualizarCantidad,
    consumirIngrediente,
    itemsProximosAExpirar,
    itemsVencidos,
    recetasDisponibles
  };
}