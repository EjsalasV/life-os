import { getTodayKey } from '@/app/utils/helpers';
import { MetasNutricionalesDefault } from '@/app/constants/alimentos-base';
import type { SaludHoy, AlimentoRegistrado, MacrosDelDia, HistorialSalud } from '@/app/types';

export const createInitialSaludData = (): SaludHoy => ({
        fecha: getTodayKey(),
        bateria: 10,
        agua: 0,
        animo: 'normal',
        ejercicioMinutos: 0,
        comidas: {},
        habitosChecks: [],
        caloriasTotales: 0,
        proteinaTotal: 0,
        carbohidratosTotal: 0,
        grasasTotal: 0,
        vitaminasConsumo: {},
        mineralesConsumo: {},
        indiceInflamatorioPromedio: 0,
        alimentos: [],
        suenoHoras: 0,
        calidadSueno: 'regular',
        estres: 50,
        alertasNutricionales: [],
        consejosIA: []
    });

    // Análisis de Macronutrientes
export const analizarMacros = (alimentos: AlimentoRegistrado[]): MacrosDelDia => {
        const macros = alimentos.reduce<Omit<MacrosDelDia, 'fecha' | 'alimentos'>>((acc, alimento) => {
            acc.caloriasTotales += alimento.caloriasTotales;
            acc.proteinaTotal += alimento.nutrientes.proteina;
            acc.carbohidratosTotal += alimento.nutrientes.carbohidratos;
            acc.grasasTotal += alimento.nutrientes.grasas;

            Object.entries(alimento.nutrientes.vitaminas || {}).forEach(([vit, val]) => {
                acc.vitaminasConsumo[vit] = (acc.vitaminasConsumo[vit] || 0) + Number(val);
            });

            Object.entries(alimento.nutrientes.minerales || {}).forEach(([min, val]) => {
                acc.mineralesConsumo[min] = (acc.mineralesConsumo[min] || 0) + Number(val);
            });

            return acc;
        }, {
            caloriasTotales: 0,
            proteinaTotal: 0,
            carbohidratosTotal: 0,
            grasasTotal: 0,
            vitaminasConsumo: {},
            mineralesConsumo: {},
            indiceInflamatorioPromedio: 0
        });

        macros.indiceInflamatorioPromedio = alimentos.length > 0
            ? alimentos.reduce((sum, a) => sum + (a.nutrientes.indices?.indiceInflamatorio || 0), 0) / alimentos.length
            : 0;

        return {
            ...macros,
            fecha: getTodayKey(),
            alimentos
        };
    };

    // Detectar Alertas Nutricionales
export const generarAlertasNutricionales = (macros: MacrosDelDia, metas = MetasNutricionalesDefault): string[] => {
        const alertas: string[] = [];

        if (macros.proteinaTotal < metas.proteinaGramos * 0.7) {
            alertas.push(`⚠️ Proteína baja: ${Math.round(macros.proteinaTotal)}g (meta: ${metas.proteinaGramos}g)`);
        }

        if (macros.caloriasTotales < metas.caloriasTotales * 0.7) {
            alertas.push(`⚠️ Calorías insuficientes: ${Math.round(macros.caloriasTotales)} (meta: ${metas.caloriasTotales})`);
        }

        if (macros.indiceInflamatorioPromedio > 2) {
            alertas.push(`🔥 Nivel inflamatorio elevado: ${macros.indiceInflamatorioPromedio.toFixed(1)}`);
        }

        const vitaminasB = Object.keys(macros.vitaminasConsumo).filter(v => v.includes('B')).length;
        if (vitaminasB < 3) {
            alertas.push("💊 Considera agregar más alimentos ricos en vitaminas B");
        }

        if ((macros.mineralesConsumo['Hierro'] || 0) < metas.mineralesMinimos.Hierro * 0.5) {
            alertas.push(`🩸 Hierro bajo: considerá espinaca o carnes rojas`);
        }

        return alertas;
    };

    // Análisis de Compatibilidad Nutricional
export const analizarCompatibilidad = (alimentos: AlimentoRegistrado[]): string[] => {
        const sinergias: string[] = [];

        for (let i = 0; i < alimentos.length; i++) {
            for (let j = i + 1; j < alimentos.length; j++) {
                const alim1 = alimentos[i];
                const alim2 = alimentos[j];

                // Sinergia Vitamina C + Hierro
                if ((alim1.nutrientes.vitaminas['C'] || 0) > 20 &&
                    (alim2.nutrientes.minerales['Hierro'] || 0) > 1) {
                    sinergias.push(`✨ Sinergia encontrada: ${alim1.nombre} + ${alim2.nombre} mejoran absorción de hierro`);
                }

                // Sinergia Grasas + Vitaminas liposolubles
                if ((alim1.nutrientes.grasas || 0) > 5 &&
                    ((alim2.nutrientes.vitaminas['A'] || 0) > 100 ||
                     (alim2.nutrientes.vitaminas['D'] || 0) > 100)) {
                    sinergias.push(`✨ Excelente: Grasas de ${alim1.nombre} potencian vitaminas en ${alim2.nombre}`);
                }

                // Índice inflamatorio bajo combinado
                const inflamAlim1 = alim1.nutrientes.indices?.indiceInflamatorio || 0;
                const inflamAlim2 = alim2.nutrientes.indices?.indiceInflamatorio || 0;
                if (inflamAlim1 < 0 && inflamAlim2 < 0) {
                    sinergias.push(`💚 Combinación antiinflamatoria: ${alim1.nombre} + ${alim2.nombre}`);
                }
            }
        }

        return sinergias.slice(0, 3); // Retornar solo 3 mejores sinergias
    };

    // Predictor de Energía 24h
export const predecirBateriaManana = (
        historialReciente: HistorialSalud[],
        macrosHoy: MacrosDelDia,
        suenoEsperado: number = 7
    ): number => {
        let prediccion = 50; // Base

        // Factor sueño
        prediccion += (suenoEsperado / 8) * 20;

        // Factor nutricional
        const balanceNutricion =
            (macrosHoy.proteinaTotal / 150) * 15 +
            (macrosHoy.caloriasTotales / 2000) * 10;
        prediccion += Math.min(balanceNutricion, 25);

        // Factor histórico (promedio últimos 7 días)
        if (historialReciente.length > 0) {
            const promedioBateria = historialReciente
                .slice(0, 7)
                .reduce((sum, dia) => sum + (dia.bateria || 0), 0) / Math.min(7, historialReciente.length);
            prediccion = (prediccion + promedioBateria) / 2;
        }

        // Factor índice inflamatorio
        prediccion -= Math.abs(macrosHoy.indiceInflamatorioPromedio) * 5;

        return Math.max(0, Math.min(100, Math.round(prediccion)));
    };

    // Generar Consejos IA
export const generarConsejosIA = (
        saludActual: SaludHoy,
        macros: MacrosDelDia,
        historial: HistorialSalud[]
    ): string[] => {
        const consejos: string[] = [];

        // Consejo basado en energía
        if (saludActual.bateria < 30) {
            consejos.push("🚨 Tu energía está baja. Prioriza hidratación, proteína y sueño reparador.");
        } else if (saludActual.bateria > 80) {
            consejos.push("🔥 ¡Excelente energía! Aprovecha para entrenar o trabajar en tareas cognitivas.");
        }

        // Consejo nutricional basado en macros
        const balanceProteina = (macros.proteinaTotal / 150) * 100;
        if (balanceProteina < 60) {
            consejos.push("💪 Aumenta proteína. Considera: huevo, pollo, pescado o legumbres.");
        }

        // Consejo basado en patrón de sueño
        if (historial.length > 0 && historial[0].suenoHoras && historial[0].suenoHoras < 6) {
            consejos.push("😴 Descansa más. Menos de 6h reduce tu energía y metabolismo en 30%.");
        }

        // Consejo antiestrés
        if (saludActual.estres && saludActual.estres > 70) {
            consejos.push("🧘 Estrés elevado detectado. Prueba 10min de meditación o caminar.");
        }

        // Consejo de hidratación
        if (saludActual.agua < 6) {
            consejos.push("💧 Hidratación insuficiente. Bebe al menos 2 litros diarios.");
        }

        return consejos;
    };

export const calculateBattery = (data: Partial<SaludHoy>): number => {
        let score = 10;

        if (data.animo === 'mal') score -= 15;
        if (data.animo === 'normal') score += 5;
        if (data.animo === 'genial') score += 15;

        score += (data.agua || 0) * 3;

        Object.values(data.comidas || {}).forEach(val => {
            if (val === 'nutritivo') score += 10;
            if (val === 'normal') score += 5;
            if (val === 'procesado') score -= 10;
        });

        score += (data.habitosChecks || []).length * 5;

        if ((data.ejercicioMinutos || 0) > 0) score += 10;

        return Math.max(0, Math.min(100, score));
    };

