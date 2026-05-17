// Sistema de Cálculo Calórico Avanzado

export interface PerfilMetabolico {
  peso: number; // kg
  altura: number; // cm
  edad: number;
  sexo: 'hombre' | 'mujer';
  nivelActividad: 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'muy-intenso';
  objetivo: 'perdida-grasa' | 'mantenimiento' | 'ganancia-muscular';
  metabolismoBasal?: number; // TMB calculado
  tdee?: number; // Gasto energético total
  deficitObjetivo?: number; // kcal deficit por día
}

// Factores de actividad (Mifflin-St Jeor mejorado)
export const NivelesActividad = {
  sedentario: {
    factor: 1.2,
    descripcion: 'Sin ejercicio',
    ejemplos: 'Trabajo de oficina, sin actividad física'
  },
  ligero: {
    factor: 1.375,
    descripcion: '1-3 días/semana ejercicio',
    ejemplos: 'Yoga, caminata, pilates ligero'
  },
  moderado: {
    factor: 1.55,
    descripcion: '3-5 días/semana',
    ejemplos: 'Entrenamientos moderados, deportes'
  },
  intenso: {
    factor: 1.725,
    descripcion: '6-7 días/semana',
    ejemplos: 'Entrenamientos fuertes, deportes competitivos'
  },
  'muy-intenso': {
    factor: 1.9,
    descripcion: 'Atleta profesional',
    ejemplos: 'Entrenamientos 2x día, deportista élite'
  }
};

export const ObjetivosCalóricos = {
  'perdida-grasa': {
    deficitSemanal: 3500, // 500 kcal/día = 0.5kg/semana
    velocidad: '0.5kg/semana',
    proteina: 1.8, // g/kg
    carbos: 3.5,
    grasas: 1.0,
    recomendacion: 'Déficit moderado, mantiene masa muscular'
  },
  mantenimiento: {
    deficitSemanal: 0,
    velocidad: 'Sin cambio',
    proteina: 1.6,
    carbos: 4.5,
    grasas: 1.0,
    recomendacion: 'Come según TDEE exacto'
  },
  'ganancia-muscular': {
    deficitSemanal: -3500, // +500 kcal/día = 0.5kg/semana
    velocidad: '+0.5kg/semana',
    proteina: 2.0,
    carbos: 5.0,
    grasas: 1.2,
    recomendacion: 'Superávit calórico, alto en proteína'
  }
};

/**
 * Calcula el Metabolismo Basal usando fórmula Mifflin-St Jeor
 * Más precisa que Harris-Benedict
 */
export function calcularTMB(
  peso: number,
  altura: number,
  edad: number,
  sexo: 'hombre' | 'mujer'
): number {
  if (sexo === 'hombre') {
    return 10 * peso + 6.25 * altura - 5 * edad + 5;
  } else {
    return 10 * peso + 6.25 * altura - 5 * edad - 161;
  }
}

/**
 * Calcula TDEE (Total Daily Energy Expenditure)
 */
export function calcularTDEE(
  tmb: number,
  nivelActividad: keyof typeof NivelesActividad
): number {
  const factor = NivelesActividad[nivelActividad].factor;
  return Math.round(tmb * factor);
}

/**
 * Calcula calorías objetivo según objetivo
 */
export function calcularCaloriasObjetivo(
  tdee: number,
  objetivo: keyof typeof ObjetivosCalóricos
): { calorias: number; deficit: number; velocidad: string } {
  const obj = ObjetivosCalóricos[objetivo];

  let calorias = tdee;
  let deficit = 0;

  if (objetivo === 'perdida-grasa') {
    deficit = 500; // 500 kcal deficit = 0.5kg/semana
    calorias = tdee - deficit;
  } else if (objetivo === 'ganancia-muscular') {
    deficit = -500; // 500 kcal superávit
    calorias = tdee + 500;
  }

  return {
    calorias: Math.round(calorias),
    deficit,
    velocidad: obj.velocidad
  };
}

/**
 * Distribuye macros según objetivo
 */
export function distribuirMacros(
  calorias: number,
  objetivo: keyof typeof ObjetivosCalóricos,
  peso: number
): { proteina: number; carbos: number; grasas: number; gramos: { proteina: number; carbos: number; grasas: number } } {
  const obj = ObjetivosCalóricos[objetivo];

  const proteinaGramos = peso * obj.proteina;
  const grasasGramos = peso * obj.grasas;
  const carbosGramos = peso * obj.carbos;

  // Validar que sumen aproximadamente 100%
  const proteinaCalorias = proteinaGramos * 4;
  const grasasCalorias = grasasGramos * 9;
  const carbosCalorias = carbosGramos * 4;
  const total = proteinaCalorias + grasasCalorias + carbosCalorias;

  return {
    proteina: Math.round((proteinaCalorias / total) * 100),
    carbos: Math.round((carbosCalorias / total) * 100),
    grasas: Math.round((grasasCalorias / total) * 100),
    gramos: {
      proteina: Math.round(proteinaGramos),
      carbos: Math.round(carbosGramos),
      grasas: Math.round(grasasGramos)
    }
  };
}

/**
 * Predictor: cuándo llegarás a tu peso objetivo
 */
export function predecirFechaObjetivo(
  pesoActual: number,
  pesoObjetivo: number,
  deficitDiario: number
): { diasFaltantes: number; fechaEstimada: Date; kg_por_semana: number } {
  const deficitSemanal = deficitDiario * 7;
  const kg_por_semana = deficitSemanal / 7700; // 7700 kcal = 1kg grasa
  const kgFaltantes = Math.abs(pesoActual - pesoObjetivo);
  const semanasNecesarias = kgFaltantes / kg_por_semana;
  const diasFaltantes = Math.round(semanasNecesarias * 7);

  const fechaEstimada = new Date();
  fechaEstimada.setDate(fechaEstimada.getDate() + diasFaltantes);

  return {
    diasFaltantes,
    fechaEstimada,
    kg_por_semana: parseFloat(kg_por_semana.toFixed(2))
  };
}

/**
 * Analiza progreso vs objetivo
 */
export function analizarProgreso(
  pesoHoy: number,
  pesoInicial: number,
  objetivo: 'perdida-grasa' | 'ganancia-muscular',
  diasProgreso: number
): {
  kgCambiados: number;
  velocidadPromedio: number;
  evaluacion: string;
  recomendacion: string;
} {
  const kgCambiados = pesoInicial - pesoHoy;
  const velocidadPromedio = (kgCambiados / diasProgreso) * 7; // por semana

  let evaluacion = '';
  let recomendacion = '';

  if (objetivo === 'perdida-grasa') {
    if (velocidadPromedio < 0.3) {
      evaluacion = '⚠️ Muy lento';
      recomendacion = 'Aumenta déficit a 600 kcal/día o intensifica ejercicio';
    } else if (velocidadPromedio < 0.5) {
      evaluacion = '✅ Perfecto';
      recomendacion = 'Mantienes el ritmo. 0.5kg/semana es óptimo';
    } else if (velocidadPromedio < 1.0) {
      evaluacion = '✅ Bueno';
      recomendacion = 'Progreso acelerado. Monitorea que no pierdas músculo';
    } else {
      evaluacion = '🚨 Muy rápido';
      recomendacion = 'Riesgo de perder masa muscular. Reduce déficit a 500 kcal/día';
    }
  } else {
    // Ganancia muscular
    if (velocidadPromedio < 0.25) {
      evaluacion = '⚠️ Muy lento';
      recomendacion = 'Aumenta superávit a 600 kcal/día';
    } else if (velocidadPromedio < 0.5) {
      evaluacion = '✅ Perfecto';
      recomendacion = 'Ganancia óptima (músculo con poco grasa)';
    } else {
      evaluacion = '⚠️ Demasiado rápido';
      recomendacion = 'Reduce superávit, probablemente sea grasa. Máximo 0.5kg/semana';
    }
  }

  return {
    kgCambiados: parseFloat(kgCambiados.toFixed(1)),
    velocidadPromedio: parseFloat(velocidadPromedio.toFixed(2)),
    evaluacion,
    recomendacion
  };
}

/**
 * Calcula calorías quemadas por actividad
 */
export const ActividadesQuemadas = {
  'reposo': { kcal_por_min: 1.0, icono: '😴' },
  'caminata-ligera': { kcal_por_min: 3.5, icono: '🚶' },
  'caminata-rápida': { kcal_por_min: 5.0, icono: '🏃' },
  'carrera-lenta': { kcal_por_min: 8.0, icono: '🏃‍♂️' },
  'carrera-rápida': { kcal_por_min: 12.0, icono: '⚡' },
  'ciclismo-ligero': { kcal_por_min: 6.0, icono: '🚴' },
  'ciclismo-intenso': { kcal_por_min: 12.0, icono: '🚴‍♀️' },
  'natación': { kcal_por_min: 8.0, icono: '🏊' },
  'yoga': { kcal_por_min: 2.5, icono: '🧘' },
  'pesas-moderado': { kcal_por_min: 6.0, icono: '🏋️' },
  'pesas-intenso': { kcal_por_min: 10.0, icono: '💪' },
  'hiit': { kcal_por_min: 12.0, icono: '🔥' },
  'futbol': { kcal_por_min: 8.5, icono: '⚽' },
  'tenis': { kcal_por_min: 9.0, icono: '🎾' }
};

/**
 * Calcula calorías quemadas en actividad
 */
export function calcularCaloriasQuemadas(
  actividad: keyof typeof ActividadesQuemadas,
  minutos: number,
  peso: number
): number {
  const tasaBase = ActividadesQuemadas[actividad].kcal_por_min;
  // Ajustar por peso (personas más pesadas queman más)
  const tasaAjustada = tasaBase * (peso / 70); // 70kg es referencia
  return Math.round(minutos * tasaAjustada);
}
