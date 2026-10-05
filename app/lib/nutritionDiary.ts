import type { AlimentoRegistrado, Nutriente } from '@/app/types';

export type TiempoComida = 'desayuno' | 'almuerzo' | 'merienda' | 'cena';

const aliases: Record<string, string> = {
  tortilla: 'huevo',
  huevos: 'huevo',
  pollo: 'pollo-pecho',
  arroz: 'arroz-integral',
  banana: 'platano',
  plátano: 'platano',
  almendra: 'frutos-secos',
  almendras: 'frutos-secos',
  pan: 'pan-blanco',
  yogur: 'yogur-natural',
  yogurt: 'yogur-natural'
};

export function scaleNutriente(nutriente: Nutriente, factor: number): Nutriente {
  const scaleMap = (values: Record<string, number> = {}) => Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Number(value) * factor])
  );

  return {
    ...nutriente,
    calorias: nutriente.calorias * factor,
    proteina: nutriente.proteina * factor,
    carbohidratos: nutriente.carbohidratos * factor,
    grasas: nutriente.grasas * factor,
    fibra: nutriente.fibra * factor,
    vitaminas: scaleMap(nutriente.vitaminas),
    minerales: scaleMap(nutriente.minerales)
  };
}

export function parseFoodText(text: string, foods: Record<string, Nutriente>) {
  const parts = text
    .toLowerCase()
    .replace(/\s+y\s+/g, ',')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.map((part) => {
    const quantityMatch = part.match(/^(\d+(?:[.,]\d+)?)\s*/);
    const quantity = quantityMatch ? Number(quantityMatch[1].replace(',', '.')) : 1;
    const label = part.replace(/^\d+(?:[.,]\d+)?\s*/, '').trim();
    const key = Object.keys(foods).find((foodKey) => {
      const food = foods[foodKey];
      const searchable = `${foodKey} ${food.nombre}`.toLowerCase();
      return searchable.includes(label) || label.includes(foodKey);
    }) || aliases[label];
    const food = key ? foods[key] : undefined;

    return {
      id: key || `custom-${label.replace(/\s+/g, '-')}`,
      nombre: food?.nombre || label,
      cantidad: quantity,
      unidad: 'porción',
      nutrients: food ? scaleNutriente(food, quantity) : null,
      encontrado: Boolean(food)
    };
  });
}

export function groupFoodByMeal(foods: AlimentoRegistrado[]) {
  return foods.reduce<Record<TiempoComida, AlimentoRegistrado[]>>((groups, food) => {
    const meal = food.tipo === 'snack' ? 'merienda' : food.tipo;
    groups[meal] = [...(groups[meal] || []), food];
    return groups;
  }, { desayuno: [], almuerzo: [], merienda: [], cena: [] });
}
