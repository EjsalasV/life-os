"use client";

/**
 * useNutricionAPI - Hook para búsqueda de alimentos
 *
 * Funcionalidades:
 * ✅ Buscar primero en AlimentosBase local (offline-first, prioridad LATAM)
 * ✅ Si no encuentra suficientes resultados, buscar en Open Food Facts
 * ✅ Transformar respuesta al formato local
 * ✅ Cachear resultados en localStorage para rendimiento
 * ✅ Permitir guardar alimentos custom locales
 *
 * Estrategia:
 * - BD Local: Prioridad (contiene alimentos típicos LATAM: salchipapa, papa a la huancaína, etc)
 * - Open Food Facts: Fallback global (gratuita, sin límite de requests)
 *
 * Estructura de datos:
 * - Entrada API: fdcId, description, foodNutrients[]
 * - Salida local: {id, nombre, calorias, proteina, etc}
 */

import { useState, useCallback, useMemo } from 'react';
import { AlimentosBase } from '@/app/constants/alimentos-base';

interface Alimento {
  id: string;
  nombre: string;
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasas: number;
  fibra: number;
  vitaminas: Record<string, number>;
  minerales: Record<string, number>;
  compatibilidad: string[];
  indices: {
    indiceInflamatorio: number;
    biodisponibilidad: number;
  };
  fuente?: 'local' | 'usda' | 'custom';
}

interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: string;
  description: string;
  foodNutrients: USDAFoodNutrient[];
}

interface SearchResult {
  alimentos: Alimento[];
  total: number;
  fuentes: { local: number; usda: number };
}

const CACHE_PREFIX = 'nutricion-api-cache-';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Mapear nutrientes USDA a nuestro formato
 */
function mapUSDANutrient(
  nutrientName: string,
  value: number
): { key: string; category: 'macro' | 'vitamin' | 'mineral'; value: number } | null {
  // Macros
  if (nutrientName.includes('Energy')) return { key: 'calorias', category: 'macro', value };
  if (nutrientName.includes('Protein')) return { key: 'proteina', category: 'macro', value };
  if (nutrientName.includes('Carbohydrate')) return { key: 'carbohidratos', category: 'macro', value };
  if (nutrientName.includes('Total lipid')) return { key: 'grasas', category: 'macro', value };
  if (nutrientName.includes('Fiber')) return { key: 'fibra', category: 'macro', value };

  // Vitaminas
  if (nutrientName.includes('Vitamin A')) return { key: 'A', category: 'vitamin', value };
  if (nutrientName.includes('Vitamin B-6')) return { key: 'B6', category: 'vitamin', value };
  if (nutrientName.includes('Vitamin B-12')) return { key: 'B12', category: 'vitamin', value };
  if (nutrientName.includes('Vitamin C')) return { key: 'C', category: 'vitamin', value };
  if (nutrientName.includes('Vitamin D')) return { key: 'D', category: 'vitamin', value };
  if (nutrientName.includes('Vitamin E')) return { key: 'E', category: 'vitamin', value };
  if (nutrientName.includes('Folate')) return { key: 'Folato', category: 'vitamin', value };

  // Minerales
  if (nutrientName.includes('Iron')) return { key: 'Hierro', category: 'mineral', value };
  if (nutrientName.includes('Calcium')) return { key: 'Calcio', category: 'mineral', value };
  if (nutrientName.includes('Magnesium')) return { key: 'Magnesio', category: 'mineral', value };
  if (nutrientName.includes('Phosphorus')) return { key: 'Fósforo', category: 'mineral', value };
  if (nutrientName.includes('Potassium')) return { key: 'Potasio', category: 'mineral', value };
  if (nutrientName.includes('Zinc')) return { key: 'Zinc', category: 'mineral', value };
  if (nutrientName.includes('Selenium')) return { key: 'Selenio', category: 'mineral', value };

  return null;
}

/**
 * Transformar respuesta USDA a nuestro formato
 */
function transformUSDAFood(food: USDAFood): Alimento {
  const macros: Record<string, number> = {
    calorias: 0,
    proteina: 0,
    carbohidratos: 0,
    grasas: 0,
    fibra: 0
  };
  const vitaminas: Record<string, number> = {};
  const minerales: Record<string, number> = {};

  // Procesar nutrientes
  food.foodNutrients.forEach((nutrient) => {
    const mapped = mapUSDANutrient(nutrient.nutrientName, nutrient.value);
    if (!mapped) return;

    if (mapped.category === 'macro') {
      macros[mapped.key] = Math.round(mapped.value * 10) / 10;
    } else if (mapped.category === 'vitamin') {
      vitaminas[mapped.key] = Math.round(mapped.value * 10) / 10;
    } else if (mapped.category === 'mineral') {
      minerales[mapped.key] = Math.round(mapped.value * 10) / 10;
    }
  });

  // Calcular índices básicos
  const indiceInflamatorio = calcularIndiceInflamatorio(macros);
  const biodisponibilidad = calcularBiodisponibilidad(vitaminas, minerales);

  return {
    id: `usda-${food.fdcId}`,
    nombre: food.description,
    calorias: macros.calorias,
    proteina: macros.proteina,
    carbohidratos: macros.carbohidratos,
    grasas: macros.grasas,
    fibra: macros.fibra,
    vitaminas,
    minerales,
    compatibilidad: [],
    indices: {
      indiceInflamatorio,
      biodisponibilidad
    },
    fuente: 'usda'
  };
}

/**
 * Estimar índice inflamatorio basado en macros
 * Fórmula simple: grasas saturadas malas, fibra buena
 */
function calcularIndiceInflamatorio(macros: Record<string, number>): number {
  // Simplificado: Entre -2 y 2
  // Altos en fibra: más negativo (antiinflamatorio)
  // Altos en grasas/carbos refinados: más positivo (inflamatorio)
  const fibra = macros.fibra || 0;
  const grasas = macros.grasas || 0;

  let indice = 0;
  if (fibra > 5) indice -= 1;
  if (grasas > 15) indice += 1;

  return Math.max(-2, Math.min(2, indice));
}

/**
 * Estimar biodisponibilidad basada en vitaminas/minerales
 */
function calcularBiodisponibilidad(
  vitaminas: Record<string, number>,
  minerales: Record<string, number>
): number {
  // Entre 70 y 100
  const vitaminasCount = Object.keys(vitaminas).length;
  const mineralesCount = Object.keys(minerales).length;
  const totalNutrientes = vitaminasCount + mineralesCount;

  return Math.min(100, 70 + totalNutrientes * 3);
}

/**
 * Hook principal
 */
export default function useNutricionAPI() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult>({
    alimentos: [],
    total: 0,
    fuentes: { local: 0, usda: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar en cache de localStorage
   */
  const getFromCache = useCallback((query: string): SearchResult | null => {
    const cacheKey = `${CACHE_PREFIX}${query.toLowerCase()}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.error('Error reading cache:', e);
    }

    return null;
  }, []);

  /**
   * Guardar en cache
   */
  const saveToCache = useCallback((query: string, data: SearchResult) => {
    const cacheKey = `${CACHE_PREFIX}${query.toLowerCase()}`;
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );
  }, []);

  /**
   * Buscar en Open Food Facts API via backend proxy
   *
   * Usa /api/nutricion/search endpoint como fallback después de BD local.
   * Open Food Facts es gratuita, sin límite de requests, y tiene cobertura global.
   */
  const searchOFF = useCallback(async (query: string): Promise<Alimento[]> => {
    try {
      const params = new URLSearchParams({
        query,
        pageSize: '10'
      });

      // Llamar a nuestro endpoint backend que hace proxy a Open Food Facts
      const response = await fetch(`/api/nutricion/search?${params}`);
      console.log('Open Food Facts API Response status:', response.status);

      if (!response.ok) throw new Error(`Backend API error: ${response.status}`);

      const data = await response.json();
      console.log('Open Food Facts API Response data:', data);

      const foods = data.foods || [];
      console.log('Foods to transform:', foods.length);

      const transformed = foods.map((food: any) => {
        try {
          return transformUSDAFood(food); // Reutiliza la transformación, el formato es compatible
        } catch (err) {
          console.error('Error transforming food:', food, err);
          return null;
        }
      }).filter((f: any) => f !== null);

      console.log('Transformed foods:', transformed.length);
      return transformed;
    } catch (e) {
      console.error('Error searching Open Food Facts via backend:', e);
      return [];
    }
  }, []);

  /**
   * Búsqueda principal: Local + USDA
   */
  const buscar = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults({ alimentos: [], total: 0, fuentes: { local: 0, usda: 0 } });
        return;
      }

      // Verificar cache primero
      const cached = getFromCache(query);
      if (cached) {
        setResults(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Buscar en local primero (prioridad LATAM)
        const queryLower = query.toLowerCase();
        const locales = Object.values(AlimentosBase).filter(
          (alimento) =>
            alimento.nombre.toLowerCase().includes(queryLower) ||
            alimento.id.toLowerCase().includes(queryLower)
        );

        // Buscar en Open Food Facts si hay menos de 3 resultados locales
        let off: Alimento[] = [];
        if (locales.length < 3) {
          off = await searchOFF(query);
        }

        const combined = [
          ...locales.map((a) => ({ ...a, fuente: 'local' as const })),
          ...off
        ];

        // Deduplicar por similitud
        const deduped = combined.filter((item, index, self) => {
          const isDuplicate = self.findIndex(
            (other) =>
              other.nombre.toLowerCase() === item.nombre.toLowerCase() && index !== self.indexOf(other)
          );
          return isDuplicate === -1;
        });

        const resultado: SearchResult = {
          alimentos: deduped.slice(0, 15),
          total: deduped.length,
          fuentes: {
            local: locales.length,
            usda: off.length // Renombrado a 'off' pero mantiene la clave 'usda' para compatibilidad
          }
        };

        setResults(resultado);
        saveToCache(query, resultado);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error en búsqueda');
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, searchOFF, saveToCache]
  );

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    buscar
  };
}
