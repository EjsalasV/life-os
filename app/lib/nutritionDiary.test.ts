import { describe, expect, it } from 'vitest';
import { parseFoodText, scaleNutriente } from './nutritionDiary';

const foods = {
  huevo: {
    id: 'huevo', nombre: 'Huevo Grande', calorias: 155, proteina: 13,
    carbohidratos: 1.1, grasas: 11, fibra: 0, vitaminas: { B7: 33 }, minerales: { Hierro: 1.2 }
  }
};

describe('nutrition diary helpers', () => {
  it('scales macros, fiber and micronutrients by portion', () => {
    const scaled = scaleNutriente(foods.huevo, 2);
    expect(scaled.calorias).toBe(310);
    expect(scaled.proteina).toBe(26);
    expect(scaled.vitaminas.B7).toBe(66);
    expect(scaled.minerales.Hierro).toBe(2.4);
  });

  it('parses food lists with quantities and aliases', () => {
    const parsed = parseFoodText('2 huevos y tortilla', foods);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].cantidad).toBe(2);
    expect(parsed[0].encontrado).toBe(true);
    expect(parsed[1].id).toBe('huevo');
  });
});
