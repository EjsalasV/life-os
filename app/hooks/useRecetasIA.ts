"use client";

import { useState, useMemo } from 'react';
import { RecetasBase, ObjetivosNutricionales, TiemposPreparacion } from '../constants/recetas-base';
import type { AlimentoRegistrado } from '@/app/types';

export interface Receta {
  id: string;
  nombre: string;
  descripcion: string;
  ingredientes: Array<{ id: string; nombre: string; cantidad: number; unidad: string }>;
  pasos: Array<{ numero: number; instruccion: string; duracion: number }>;
  tiempoTotal: number;
  dificultad: string;
  macros: {
    calorias: number;
    proteina: number;
    carbohidratos: number;
    grasas: number;
  };
  micronutrientes: { [key: string]: any };
  beneficios: string[];
  metas: string[];
  indiceInflamatorio: number;
  impactoBateria: number;
}

interface FiltrosRecetas {
  objetivo: string;
  tiempoMaximo: number;
  dificultad?: string;
  ingredientesDisponibles?: string[];
}

export default function useRecetasIA() {
  const [recetasFavoritas, setRecetasFavoritas] = useState<string[]>([]);
  const [historialCocinado, setHistorialCocinado] = useState<Array<{ id: string; fecha: string }>>([]);

  // Calcular puntuación de coincidencia de ingredientes
  const calcularCoincidenciaIngredientes = (
    receta: Receta,
    ingredientesDisponibles: string[]
  ): { coincidencia: number; faltantes: string[] } => {
    if (ingredientesDisponibles.length === 0) {
      return { coincidencia: 0, faltantes: receta.ingredientes.map(i => i.nombre) };
    }

    const ingredientesReceta = receta.ingredientes.map(i => i.id);
    const coincidentes = ingredientesReceta.filter(id =>
      ingredientesDisponibles.some(disp =>
        disp.toLowerCase().includes(id) || id.includes(disp)
      )
    ).length;

    const faltantes = receta.ingredientes
      .filter(i => !ingredientesDisponibles.some(disp =>
        disp.toLowerCase().includes(i.id) || i.id.includes(disp)
      ))
      .map(i => i.nombre);

    const coincidencia = Math.round((coincidentes / ingredientesReceta.length) * 100);

    return { coincidencia, faltantes };
  };

  // Generar recetas inteligentes basadas en filtros
  const generarRecetas = (filtros: FiltrosRecetas): Array<Receta & { puntuacion: number; coincidencia: number; faltantes: string[] }> => {
    let recetasCandidatas = Object.values(RecetasBase) as Receta[];

    // Filtro 1: Objetivo nutricional
    if (filtros.objetivo) {
      recetasCandidatas = recetasCandidatas.filter(r =>
        r.metas.includes(filtros.objetivo)
      );
    }

    // Filtro 2: Tiempo de preparación
    recetasCandidatas = recetasCandidatas.filter(r =>
      r.tiempoTotal <= filtros.tiempoMaximo
    );

    // Filtro 3: Dificultad
    if (filtros.dificultad) {
      recetasCandidatas = recetasCandidatas.filter(r =>
        r.dificultad === filtros.dificultad
      );
    }

    // Calcular puntuación y ordenar
    const recetasConPuntuacion = recetasCandidatas.map(receta => {
      const { coincidencia, faltantes } = calcularCoincidenciaIngredientes(
        receta,
        filtros.ingredientesDisponibles || []
      );

      // Puntuación = coincidencia de ingredientes (60%) + impacto batería (40%)
      const puntuacion = (coincidencia * 0.6) + (receta.impactoBateria * 0.4);

      return {
        ...receta,
        puntuacion: Math.round(puntuacion),
        coincidencia,
        faltantes
      };
    });

    // Ordenar por puntuación descendente
    return recetasConPuntuacion.sort((a, b) => b.puntuacion - a.puntuacion);
  };

  // IA inteligente: sugerir mejores recetas basadas en perfil
  const sugerirRecetasPersonalizadas = (
    objetivo: string,
    tiempoDisponible: number,
    ingredientesActuales: string[]
  ): Receta[] => {
    const recetas = generarRecetas({
      objetivo,
      tiempoMaximo: tiempoDisponible,
      ingredientesDisponibles: ingredientesActuales
    });

    // Retornar top 3 recetas con mejor puntuación
    return recetas.slice(0, 3).map(r => {
      const { puntuacion, coincidencia, faltantes, ...recetaLimpia } = r;
      return recetaLimpia;
    });
  };

  // Generar instrucciones paso a paso con timers
  const generarInstruccionesPasoAPaso = (receta: Receta): string[] => {
    return receta.pasos.map(paso =>
      `⏱️ ${paso.duracion}min: ${paso.instruccion}`
    );
  };

  // Análisis: Cómo esta receta afecta tus metas
  const analizarAlineacionConMetas = (
    receta: Receta,
    pesoUsuario: number,
    objetivo: string
  ): { alineado: boolean; diferencia: string; recomendacion: string } => {
    const objetivoData = ObjetivosNutricionales[objetivo as keyof typeof ObjetivosNutricionales];

    if (!objetivoData) {
      return {
        alineado: false,
        diferencia: "Objetivo no encontrado",
        recomendacion: "Selecciona un objetivo válido"
      };
    }

    const macrosPorKg = {
      proteina: receta.macros.proteina / pesoUsuario,
      carbohidratos: receta.macros.carbohidratos / pesoUsuario,
      grasas: receta.macros.grasas / pesoUsuario
    };

    const proteinaAlineada =
      macrosPorKg.proteina >= objetivoData.proteina.min &&
      macrosPorKg.proteina <= objetivoData.proteina.max;

    const carbosAlineados =
      macrosPorKg.carbohidratos >= objetivoData.carbohidratos.min &&
      macrosPorKg.carbohidratos <= objetivoData.carbohidratos.max;

    const grasasAlineadas =
      macrosPorKg.grasas >= objetivoData.grasas.min &&
      macrosPorKg.grasas <= objetivoData.grasas.max;

    const alineado = proteinaAlineada && carbosAlineados && grasasAlineadas;

    let diferencia = "";
    if (!proteinaAlineada) diferencia += `Proteína: ${macrosPorKg.proteina.toFixed(1)}g/kg vs ${objetivoData.proteina.min}-${objetivoData.proteina.max}. `;
    if (!carbosAlineados) diferencia += `Carbos: ${macrosPorKg.carbohidratos.toFixed(1)}g/kg vs ${objetivoData.carbohidratos.min}-${objetivoData.carbohidratos.max}. `;
    if (!grasasAlineadas) diferencia += `Grasas: ${macrosPorKg.grasas.toFixed(1)}g/kg vs ${objetivoData.grasas.min}-${objetivoData.grasas.max}.`;

    let recomendacion = alineado
      ? "✅ Perfecta para tu objetivo"
      : "⚠️ Considera combinar con otra receta o ajustar porciones";

    return { alineado, diferencia, recomendacion };
  };

  // Combinar múltiples recetas para día completo
  const generarPlanDiario = (
    objetivo: string,
    ingredientesDisponibles: string[],
    pesoUsuario: number
  ): { desayuno: Receta; almuerzo: Receta; cena: Receta; macrosTotales: any; consejo: string } => {
    const recetas = generarRecetas({
      objetivo,
      tiempoMaximo: 100,
      ingredientesDisponibles
    });

    if (recetas.length < 3) {
      throw new Error("No hay suficientes recetas disponibles para este objetivo");
    }

    const seleccionadas = recetas.slice(0, 3);
    const desayuno = seleccionadas[0];
    const almuerzo = seleccionadas[1];
    const cena = seleccionadas[2];

    const macrosTotales = {
      calorias: desayuno.macros.calorias + almuerzo.macros.calorias + cena.macros.calorias,
      proteina: desayuno.macros.proteina + almuerzo.macros.proteina + cena.macros.proteina,
      carbohidratos: desayuno.macros.carbohidratos + almuerzo.macros.carbohidratos + cena.macros.carbohidratos,
      grasas: desayuno.macros.grasas + almuerzo.macros.grasas + cena.macros.grasas
    };

    const proteinaPorKg = macrosTotales.proteina / pesoUsuario;
    let consejo = "📋 Plan personalizado ";

    if (objetivo === "anti-cortisol") {
      consejo += "anti-cortisol creado. Todas las recetas son antiinflamatorias. 🧘";
    } else if (objetivo === "ganancia-muscular") {
      consejo += `de ganancia muscular. ${proteinaPorKg.toFixed(1)}g proteína/kg (excelente). 💪`;
    } else if (objetivo === "perdida-grasa") {
      consejo += `de pérdida de grasa. Proteína alta, carbos controlados. 🔥`;
    } else {
      consejo += "de máxima energía para tu día. ⚡";
    }

    return {
      desayuno: desayuno as Receta,
      almuerzo: almuerzo as Receta,
      cena: cena as Receta,
      macrosTotales,
      consejo
    };
  };

  const toggleRecetaFavorita = (recetaId: string) => {
    setRecetasFavoritas(prev =>
      prev.includes(recetaId)
        ? prev.filter(id => id !== recetaId)
        : [...prev, recetaId]
    );
  };

  const registrarCocinada = (recetaId: string) => {
    setHistorialCocinado(prev => [
      ...prev,
      { id: recetaId, fecha: new Date().toISOString() }
    ]);
  };

  return {
    generarRecetas,
    sugerirRecetasPersonalizadas,
    generarInstruccionesPasoAPaso,
    analizarAlineacionConMetas,
    generarPlanDiario,
    toggleRecetaFavorita,
    registrarCocinada,
    recetasFavoritas,
    historialCocinado,
    RecetasBase
  };
}
