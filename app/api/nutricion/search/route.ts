/**
 * API Route: /api/nutricion/search
 * Proxy para Open Food Facts API
 *
 * Open Food Facts tiene mejor cobertura global incluyendo LATAM.
 * API es gratuita y no requiere API key.
 * Fallback para cuando la BD local no tiene suficientes resultados.
 *
 * Estrategia: BD Local (prioridad) + Open Food Facts (fallback)
 */

import { NextRequest, NextResponse } from 'next/server';

const OFF_BASE_URL = 'https://world.openfoodfacts.net/cgi/search.pl';
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const requestWindows = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: NextRequest): boolean {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || current.resetAt <= now) {
    if (requestWindows.size > 5_000) {
      for (const [storedKey, window] of requestWindows) {
        if (window.resetAt <= now) requestWindows.delete(storedKey);
      }
      if (requestWindows.size > 10_000) requestWindows.clear();
    }
    requestWindows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

export async function GET(request: NextRequest) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();
    // Cap: evita usar el deploy como proxy de búsquedas masivas
    const requestedPageSize = parseInt(searchParams.get('pageSize') || '10', 10) || 10;
    const pageSize = String(Math.max(1, Math.min(requestedPageSize, 25)));

    if (!query || query.length < 2 || query.length > 100) {
      return NextResponse.json(
        { error: 'Query must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Llamar a Open Food Facts API (no requiere API key, gratuita)
    const offUrl = new URL(OFF_BASE_URL);
    offUrl.searchParams.append('search_terms', query);
    offUrl.searchParams.append('json', '1');
    offUrl.searchParams.append('page_size', pageSize);

    const response = await fetch(offUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LifeOS/1.0 (https://github.com/EjsalasV/life-os)'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      console.error('Open Food Facts API error:', response.status, response.statusText);
      return NextResponse.json(
        { foods: [], error: `Open Food Facts returned ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Transformar respuesta de Open Food Facts al formato esperado
    // Open Food Facts devuelve: { products: [...] }
    const foods = (data.products || []).map((product: any) => ({
      fdcId: product.id || product.code,
      description: product.product_name || 'Unknown',
      foodNutrients: formatNutrients(product)
    }));

    // Cachear respuesta por 7 días en el navegador del cliente
    const response2 = NextResponse.json({ foods });
    response2.headers.set('Cache-Control', 'public, max-age=604800'); // 7 días

    return response2;
  } catch (error) {
    console.error('Error in /api/nutricion/search:', error);
    return NextResponse.json(
      { foods: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Transformar nutrientes de Open Food Facts a formato USDA-like
 */
function formatNutrients(product: any): Array<{ nutrientName: string; value: number; unitName: string }> {
  const nutrients: Array<{ nutrientName: string; value: number; unitName: string }> = [];

  // Open Food Facts devuelve nutrientes en producto.nutrition_data_per
  const nutrition = product.nutriments || {};

  if (nutrition['energy-kcal']) {
    nutrients.push({
      nutrientName: 'Energy (kcal)',
      value: nutrition['energy-kcal'],
      unitName: 'kcal'
    });
  }

  if (nutrition['energy-kcal_100g']) {
    nutrients.push({
      nutrientName: 'Energy (kcal)',
      value: nutrition['energy-kcal_100g'],
      unitName: 'kcal'
    });
  }

  if (nutrition['proteins']) {
    nutrients.push({
      nutrientName: 'Protein (g)',
      value: nutrition['proteins'],
      unitName: 'g'
    });
  }

  if (nutrition['proteins_100g']) {
    nutrients.push({
      nutrientName: 'Protein (g)',
      value: nutrition['proteins_100g'],
      unitName: 'g'
    });
  }

  if (nutrition['carbohydrates']) {
    nutrients.push({
      nutrientName: 'Carbohydrate, by difference (g)',
      value: nutrition['carbohydrates'],
      unitName: 'g'
    });
  }

  if (nutrition['carbohydrates_100g']) {
    nutrients.push({
      nutrientName: 'Carbohydrate, by difference (g)',
      value: nutrition['carbohydrates_100g'],
      unitName: 'g'
    });
  }

  if (nutrition['fat']) {
    nutrients.push({
      nutrientName: 'Total lipid (fat) (g)',
      value: nutrition['fat'],
      unitName: 'g'
    });
  }

  if (nutrition['fat_100g']) {
    nutrients.push({
      nutrientName: 'Total lipid (fat) (g)',
      value: nutrition['fat_100g'],
      unitName: 'g'
    });
  }

  if (nutrition['fiber']) {
    nutrients.push({
      nutrientName: 'Fiber, total dietary (g)',
      value: nutrition['fiber'],
      unitName: 'g'
    });
  }

  if (nutrition['fiber_100g']) {
    nutrients.push({
      nutrientName: 'Fiber, total dietary (g)',
      value: nutrition['fiber_100g'],
      unitName: 'g'
    });
  }

  return nutrients;
}
