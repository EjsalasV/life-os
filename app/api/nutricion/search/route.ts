/**
 * API Route: /api/nutricion/search
 * Proxy para USDA FDC API
 *
 * Necesario porque el API de USDA tiene restricciones CORS y no permite
 * llamadas directas desde el navegador. Este endpoint en el servidor
 * actúa como intermediario.
 */

import { NextRequest, NextResponse } from 'next/server';

const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || '';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

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

    if (!USDA_API_KEY) {
      return NextResponse.json(
        { foods: [], message: 'USDA API key not configured' },
        { status: 200 }
      );
    }

    // Llamar a USDA API desde el servidor (sin restricciones CORS)
    const ussdaUrl = new URL(USDA_BASE_URL);
    ussdaUrl.searchParams.append('query', query);
    ussdaUrl.searchParams.append('pageSize', pageSize);
    ussdaUrl.searchParams.append('api_key', USDA_API_KEY);

    const response = await fetch(ussdaUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('USDA API error:', response.status, response.statusText);
      return NextResponse.json(
        { foods: [], error: `USDA API returned ${response.status}` },
        { status: 200 } // Retornar 200 para que el cliente sepa que intentamos pero USDA no respondió
      );
    }

    const data = await response.json();

    // Cachear respuesta por 7 días en el navegador del cliente
    const response2 = NextResponse.json(data);
    response2.headers.set('Cache-Control', 'public, max-age=604800'); // 7 días

    return response2;
  } catch (error) {
    console.error('Error in /api/nutricion/search:', error);
    return NextResponse.json(
      { foods: [], error: 'Internal server error' },
      { status: 200 } // Retornar 200 para que el cliente pueda manejar el error gracefully
    );
  }
}
