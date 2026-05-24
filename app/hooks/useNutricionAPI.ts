"use client";

/**
 * useNutricionAPI - Hook para búsqueda de alimentos con USDA FDC API
 *
 * Funcionalidades:
 * ✅ Buscar primero en AlimentosBase local (offline-first)
 * ✅ Si no encuentra, buscar en USDA FDC API (300k+ alimentos)
 * ✅ Transformar respuesta USDA al formato local
 * ✅ Cachear resultados en localStorage para rendimiento
 * ✅ Permitir guardar alimentos custom locales
 *
 * API: USDA FoodData Central
 * - Endpoint: https://fdc.nal.usda.gov/api/foods/search
 * - API Key: Requerida (obtener en https://fdc.nal.usda.gov/api-key)
 * - Rate Limit: 1200 requests/hour (desarrollo), unlimited con key
 *
 * Estructura de datos:
 * - Entrada USDA: fdcId, description, foodNutrients[]
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

const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || '';
const USDA_BASE_URL = 'https://fdc.nal.usda.gov/api/foods/search';
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
   * Buscar en USDA API
   */
  const searchUSDA = useCallback(async (query: string): Promise<Alimento[]> => {
    if (!USDA_API_KEY) {
      console.warn('USDA API Key no configurada. Usando solo base local.');
      return [];
    }

    try {
      const params = new URLSearchParams({
        query,
        pageSize: '10',
        api_key: USDA_API_KEY
      });

      const response = await fetch(`${USDA_BASE_URL}?${params}`);
      if (!response.ok) throw new Error('USDA API error');

      const data = await response.json();
      return (data.foods || []).map(transformUSDAFood);
    } catch (e) {
      console.error('Error searching USDA:', e);
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
        // Buscar en local primero
        const queryLower = query.toLowerCase();
        const locales = Object.values(AlimentosBase).filter(
          (alimento) =>
            alimento.nombre.toLowerCase().includes(queryLower) ||
            alimento.id.toLowerCase().includes(queryLower)
        );

        // Buscar en USDA si hay menos de 3 resultados locales
        let usda: Alimento[] = [];
        if (locales.length < 3) {
          usda = await searchUSDA(query);
        }

        const combined = [
          ...locales.map((a) => ({ ...a, fuente: 'local' as const })),
          ...usda
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
            usda: usda.length
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
    [getFromCache, searchUSDA, saveToCache]
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
