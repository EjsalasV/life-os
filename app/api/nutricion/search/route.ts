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

const OFF_BASE_URL = 'https://world.openfoodfacts.net/api/v3/foods';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const pageSize = searchParams.get('pageSize') || '10';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Llamar a Open Food Facts API (no requiere API key, gratuita)
    const offUrl = new URL(OFF_BASE_URL);
    offUrl.searchParams.append('search_terms', query);
    offUrl.searchParams.append('page_size', pageSize);
    offUrl.searchParams.append('sort_by', 'popularity');

    const response = await fetch(offUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Life-OS-App/1.0'
      }
    });

    if (!response.ok) {
      console.error('Open Food Facts API error:', response.status, response.statusText);
      return NextResponse.json(
        { foods: [], error: `Open Food Facts returned ${response.status}` },
        { status: 200 }
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
      { status: 200 }
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
