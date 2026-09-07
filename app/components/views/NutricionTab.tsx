"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Flame,
  Plus,
  Search,
  Trash2,
  Wheat,
  Droplet,
  Droplets,
  X,
  BookOpen
} from "lucide-react";
import PremiumLock from "../ui/PremiumLock";
import ModalAlimentoCustom from "../ui/ModalAlimentoCustom";
import { getAlimentosCustom, saveAlimentoCustom } from "@/app/constants/alimentos-custom";
import { AlimentosBase, MetasNutricionalesDefault } from "@/app/constants/alimentos-base";
import { useComunidadPet } from "@/app/hooks/useComunidadPet";
import useNutricionAPI from "@/app/hooks/useNutricionAPI";
import useDeficitCalorico from "@/app/hooks/useDeficitCalorico";
import { useNutritionTemplates } from "@/app/hooks/useNutritionTemplates";
import {
  buildRegisteredFoodEntry,
  findFoodMatches,
  getMealLabel,
  getMealSectionType,
  getNutritionGoalSnapshot,
  groupFoodItemsByMeal,
  parseNaturalMealInput,
  scaleNutrients,
  summarizeMealItems,
  summarizeMicronutrients,
  type MealType,
  type NutritionSourceFood,
  type ParsedMealItem,
  type MealTemplate,
  MEAL_SECTION_TYPES
} from "@/app/lib/nutricionTools";
import { ProgressBar } from "@/app/components/ui/DesignPrimitives";

type NutricionTabProps = {
  user?: { uid?: string } | null;
  saludHoy: any;
  historialSalud?: any[];
  registrarAlimento: (alimento: any) => Promise<boolean>;
  removeAlimento: (id: string) => void;
  isPro: boolean;
  registrarComidaPet?: (macrosOK: boolean, calorias: number) => void;
  removeWater?: () => void;
  addWater?: () => Promise<boolean> | boolean;
  registrarAgua?: () => Promise<void> | void;
  playSound?: (name: string) => void;
};

const UNIT_OPTIONS = ["porción", "unidad", "g", "ml", "taza", "cucharada", "rebanada"];

function normalizeCustomFood(food: any): NutritionSourceFood {
  return {
    id: String(food.id),
    nombre: String(food.nombre),
    calorias: Number(food.calorias || 0),
    proteina: Number(food.proteina || 0),
    carbohidratos: Number(food.carbohidratos || 0),
    grasas: Number(food.grasas || 0),
    fibra: Number(food.fibra || 0),
    vitaminas: food.vitaminas || {},
    minerales: food.minerales || {},
    compatibilidad: food.compatibilidad || [],
    indices: food.indices || { indiceInflamatorio: 0, biodisponibilidad: 80 },
    fuente: food.fuente || "custom",
    origen: food.origen || "custom",
    baseCantidad: food.baseCantidad,
    baseUnidad: food.baseUnidad,
    notaFuente: food.notaFuente
  };
}

function formatMicronutrientValue(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function foodFromParsedItem(item: ParsedMealItem): NutritionSourceFood | null {
  if (item.match) return item.match;
  const suggested = item.suggestions?.[0];
  return suggested || null;
}

export default function NutricionTab({
  user,
  saludHoy,
  historialSalud = [],
  registrarAlimento,
  removeAlimento,
  isPro,
  registrarComidaPet: registrarComidaPetFromProps,
  removeWater,
  addWater,
  registrarAgua,
  playSound
}: NutricionTabProps) {
  const { registrarComidaPet: registrarComidaPetFallback } = useComunidadPet();
  const registrarComidaPet = registrarComidaPetFromProps || registrarComidaPetFallback;
  const registering = useRef(false);

  const [mostrarBase, setMostrarBase] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [modalCustomOpen, setModalCustomOpen] = useState(false);
  const [alimentosCustom, setAlimentosCustom] = useState(() => getAlimentosCustom());
  const [petFeedback, setPetFeedback] = useState<null | { id: number; texto: string; macrosOK: boolean }>(null);
  const [mealType, setMealType] = useState<MealType>("desayuno");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("porción");
  const [naturalText, setNaturalText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedMealItem[]>([]);
  const [parserMealType, setParserMealType] = useState<MealType>("almuerzo");

  const { peso, altura, edad, sexo, nivelActividad, objetivo } = useDeficitCalorico(user as any);
  const nutritionGoals = useMemo(
    () =>
      getNutritionGoalSnapshot(user as any, {
        peso,
        altura,
        edad,
        sexo,
        nivelActividad,
        objetivo
      }),
    [user, peso, altura, edad, sexo, nivelActividad, objetivo]
  );

  const { searchTerm, setSearchTerm, results, loading, buscar, error: searchError } = useNutricionAPI();
  const { templatesByMeal, saveTemplate, removeTemplate, touchTemplate, storageError: templateError } = useNutritionTemplates(
    user?.uid,
    saludHoy,
    historialSalud
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) void buscar(searchTerm);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchTerm, buscar]);

  const todosLosAlimentos = useMemo(() => {
    const customMap = Object.fromEntries(
      alimentosCustom.map((item: any) => [item.id, normalizeCustomFood(item)])
    );
    return { ...AlimentosBase, ...customMap } as Record<string, NutritionSourceFood>;
  }, [alimentosCustom]);

  const mealGroups = useMemo(
    () => groupFoodItemsByMeal(saludHoy?.alimentos || []),
    [saludHoy?.alimentos]
  );

  const dailyTotals = useMemo(
    () => summarizeMealItems(saludHoy?.alimentos || []),
    [saludHoy?.alimentos]
  );

  const micronutrients = useMemo(
    () => summarizeMicronutrients(saludHoy?.alimentos || []),
    [saludHoy?.alimentos]
  );

  const nutritionMeta = nutritionGoals.source === "perfil" ? nutritionGoals : {
    source: "fallback",
    calorias: MetasNutricionalesDefault.caloriasTotales,
    proteina: MetasNutricionalesDefault.proteinaGramos,
    carbohidratos: MetasNutricionalesDefault.carbohidratosGramos,
    grasas: MetasNutricionalesDefault.grasasGramos,
    tmb: null,
    tdee: null,
    deficit: null
  };

  const macroProgress = {
    proteina: Math.round((dailyTotals.proteina / Math.max(nutritionMeta.proteina, 1)) * 100),
    carbohidratos: Math.round((dailyTotals.carbohidratos / Math.max(nutritionMeta.carbohidratos, 1)) * 100),
    grasas: Math.round((dailyTotals.grasas / Math.max(nutritionMeta.grasas, 1)) * 100),
    calorias: Math.round((dailyTotals.calorias / Math.max(nutritionMeta.calorias, 1)) * 100)
  };

  const registerResolvedFood = async (
    food: NutritionSourceFood,
    type: MealType = mealType,
    qty = quantity,
    currentUnit = unit,
    displayName?: string
  ) => {
    if (registering.current) return false;
    registering.current = true;
    try {
      const saved = await registrarAlimento(
        buildRegisteredFoodEntry({
          alimento: food,
          mealType: type,
          quantity: qty,
          unit: currentUnit,
          sourceLabel: food.fuente || food.origen || "estimado",
          overrideName: displayName
        })
      );
      if (!saved) return false;

      const macrosOK = Number(food.proteina || 0) >= 12 || Number(food.calorias || 0) >= 180;
      registrarComidaPet?.(macrosOK, Number(food.calorias || 0));
      setPetFeedback({
        id: Date.now(),
        macrosOK,
        texto: macrosOK ? `Guardado como ${getMealLabel(type).toLowerCase()}.` : `Guardado como ${getMealLabel(type).toLowerCase()}.`
      });
      setTimeout(() => setPetFeedback(null), 2600);
      return true;
    } finally {
      registering.current = false;
    }
  };

  const handleNaturalParse = async () => {
    const parsed = parseNaturalMealInput(naturalText, todosLosAlimentos, mealType);
    setParserMealType(parsed.mealType);

    const enriched = await Promise.all(
      parsed.items.map(async (item) => {
        if (item.match && !item.needsReview) return item;
        const remote = await buscar(item.query);
        const candidate = remote?.alimentos?.[0];
        if (!candidate) return item;
        const resolved = normalizeCustomFood(candidate);
        return {
          ...item,
          match: resolved,
          nutrients: scaleNutrients(resolved, item.quantity, item.unit),
          confidence: Math.max(item.confidence, 75),
          sourceLabel: resolved.fuente || "usda",
          needsReview: false,
          note: `Coincidencia enriquecida desde ${resolved.fuente || "USDA"}`
        };
      })
    );

    setParsedItems(enriched);
  };

  const handleSaveParsed = async () => {
    for (const item of parsedItems) {
      const food = foodFromParsedItem(item);
      if (!food) continue;
      await registerResolvedFood(food, item.mealType, item.quantity, item.unit, item.match?.nombre || item.query);
    }
  };

  const handleUseTemplate = async (template: MealTemplate) => {
    touchTemplate(template.signature);
    setMealType(template.mealType);
    for (const item of template.items) {
      await registerResolvedFood(
        {
          id: item.alimentoId,
          nombre: item.nombre,
          calorias: Number(item.caloriasTotales || 0),
          proteina: Number(item.nutrientes?.proteina || 0),
          carbohidratos: Number(item.nutrientes?.carbohidratos || 0),
          grasas: Number(item.nutrientes?.grasas || 0),
          fibra: Number(item.nutrientes?.fibra || 0),
          vitaminas: item.nutrientes?.vitaminas || {},
          minerales: item.nutrientes?.minerales || {},
          compatibilidad: item.nutrientes?.compatibilidad || [],
          indices: item.nutrientes?.indices || { indiceInflamatorio: 0, biodisponibilidad: 80 },
          fuente: item.nutrientes?.fuente || "estimado",
          origen: item.nutrientes?.origen || "estimado"
        },
        item.tipo as MealType,
        Number(item.cantidad || 1),
        item.unidad
      );
    }
  };

  const handleSaveMealSection = (type: MealType) => {
    const items = mealGroups[getMealSectionType(type)];
    const template = saveTemplate(type, items, `${getMealLabel(type)} habitual`);
    if (template) {
      setPetFeedback({ id: Date.now(), texto: `Guardado ${template.nombre} como frecuente.`, macrosOK: true });
      setTimeout(() => setPetFeedback(null), 2200);
    }
  };

  const allTemplates = MEAL_SECTION_TYPES.flatMap((type) => templatesByMeal[type] || []).slice(0, 8);

  return (
    <div className="space-y-6">
      {(searchError || templateError) && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-200">
          {searchError || templateError}
        </p>
      )}

      {removeWater && addWater && (
        <motion.div whileHover={{ scale: 1.01 }} className="rounded-[34px] border border-sky-200 bg-white p-5 shadow-sm dark:border-sky-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Hidratación</p>
              <p className="text-3xl font-black text-sky-600">{saludHoy?.agua || 0}</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400">vasos de agua</p>
            </div>
            <Droplets className="text-sky-500" size={40} />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={removeWater} className="flex-1 rounded-2xl bg-gray-100 py-3 font-black dark:bg-gray-700 dark:text-white">
              -
            </button>
            <button
              onClick={async () => {
                if (playSound) playSound("drink");
                if (await addWater() && registrarAgua) await registrarAgua();
              }}
              className="flex-1 rounded-2xl bg-sky-500 py-3 font-black text-white"
            >
              + Agua
            </button>
          </div>
        </motion.div>
      )}

      <div className="rounded-[38px] border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm dark:border-orange-700 dark:from-orange-900/20 dark:to-amber-900/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-700 dark:text-orange-300">Energía consumida</p>
            <h2 className="mt-2 text-5xl font-black text-orange-950 dark:text-orange-100">{dailyTotals.calorias.toFixed(0)}</h2>
            <p className="mt-1 text-[11px] font-semibold text-orange-700 dark:text-orange-300">
              Meta {nutritionMeta.calorias} kcal {nutritionGoals.source === "perfil" ? "según tu déficit" : "con fallback base"}
            </p>
          </div>
          <Flame size={46} className="text-orange-600 dark:text-orange-400" />
        </div>
        <div className="mt-4">
          <ProgressBar value={dailyTotals.calorias} max={nutritionMeta.calorias} color="#f97316" size="lg" showLabel={false} />
        </div>
        <p className="mt-2 text-xs font-bold text-orange-700 dark:text-orange-300">{macroProgress.calorias}% de la meta diaria</p>
        {nutritionGoals.source === "perfil" && (
          <p className="mt-2 text-[10px] text-orange-700/80 dark:text-orange-200/80">
            TMB {nutritionGoals.tmb} kcal, TDEE {nutritionGoals.tdee} kcal.
          </p>
        )}
      </div>

      <PremiumLock isPro={isPro} text="Análisis de Macros PRO">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Proteína", value: dailyTotals.proteina, meta: nutritionMeta.proteina, icon: Wheat, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
            { label: "Carbos", value: dailyTotals.carbohidratos, meta: nutritionMeta.carbohidratos, icon: Wheat, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Grasas", value: dailyTotals.grasas, meta: nutritionMeta.grasas, icon: Droplet, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" }
          ].map((macro) => {
            const Icon = macro.icon;
            const percent = Math.min(Math.round((macro.value / Math.max(macro.meta, 1)) * 100), 100);
            return (
              <div key={macro.label} className={`${macro.bg} rounded-[24px] border border-white/60 p-4 dark:border-gray-700`}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={18} className={macro.color} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">{macro.label}</span>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{macro.value.toFixed(0)}</p>
                <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400">Meta {macro.meta.toFixed(0)}g</p>
                <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-current to-transparent" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </PremiumLock>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          { label: "Desayuno", key: "desayuno" as MealType },
          { label: "Almuerzo", key: "almuerzo" as MealType },
          { label: "Merienda", key: "merienda" as MealType },
          { label: "Cena / Snack", key: "cena" as MealType }
        ].map((section) => {
          const items = mealGroups[getMealSectionType(section.key)];
          const totals = summarizeMealItems(items);
          return (
            <MealSectionCard
              key={section.key}
              title={section.label}
              items={items}
              totals={totals}
              onSaveAsTemplate={() => handleSaveMealSection(section.key)}
              onRemove={removeAlimento}
            />
          );
        })}
      </div>

      <div className="rounded-[34px] border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400">Registro rápido</h3>
          <div className="flex flex-wrap gap-2">
            {MEAL_SECTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`rounded-full px-3 py-1 text-[10px] font-black capitalize transition-all ${
                  mealType === type
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {getMealLabel(type)}
              </button>
            ))}
            <button
              onClick={() => setMealType("snack")}
              className={`rounded-full px-3 py-1 text-[10px] font-black transition-all ${
                mealType === "snack"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Snack
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Cantidad</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Unidad</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            >
              {UNIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Texto natural</label>
            <div className="flex gap-2">
              <textarea
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="Desayuné 2 huevos y un plátano"
                className="min-h-12 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              />
              <button onClick={handleNaturalParse} className="rounded-2xl bg-emerald-500 px-4 font-black text-white">
                Analizar
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {parsedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 space-y-3 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900/20"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">Revisión antes de guardar</p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-200/80">Se usó {getMealLabel(parserMealType)} como sugerencia inicial.</p>
                </div>
                <button onClick={handleSaveParsed} className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white">
                  Guardar todo
                </button>
              </div>
              {parsedItems.map((item) => (
                <ParsedItemRow
                  key={item.id}
                  item={item}
                  onMealTypeChange={(next) => setParsedItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, mealType: next } : entry))}
                  onQuantityChange={(next) => setParsedItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: next } : entry))}
                  onUnitChange={(next) => setParsedItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, unit: next } : entry))}
                  onResolveWithLocal={() => {
                    const best = findFoodMatches(item.query, todosLosAlimentos)[0]?.food;
                    if (!best) return;
                    setParsedItems((current) => current.map((entry) => entry.id === item.id ? {
                      ...entry,
                      match: best,
                      nutrients: scaleNutrients(best, entry.quantity, entry.unit),
                      confidence: 95,
                      needsReview: false,
                      sourceLabel: best.fuente || "local"
                    } : entry));
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button
            onClick={() => {
              setMostrarBusqueda((current) => !current);
              setMostrarBase(false);
            }}
            className="rounded-2xl bg-gray-100 py-3 font-black text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          >
            Buscar en base / USDA
          </button>
          <button
            onClick={() => {
              setMostrarBase((current) => !current);
              setMostrarBusqueda(false);
            }}
            className="rounded-2xl bg-gray-100 py-3 font-black text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          >
            Ver base local
          </button>
        </div>

        {mostrarBusqueda && (
          <div className="mt-4 space-y-3 rounded-[28px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alimentos (pollo, manzana, etc)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="text-[8px] font-bold text-gray-500 dark:text-gray-400">
              <span className="mr-4">Local: {results.fuentes.local}</span>
              <span className="mr-4">USDA/API: {results.fuentes.usda}</span>
              <span>Total: {results.total}</span>
            </div>
            {loading && <p className="text-[10px] text-gray-500">Buscando...</p>}
            {!loading && results.alimentos.length === 0 && searchTerm && (
              <p className="text-[10px] text-gray-500">No se encontraron resultados.</p>
            )}
            <div className="space-y-2">
              {!loading &&
                results.alimentos.map((alimento: any) => (
                  <button
                    key={alimento.id}
                    onClick={() => registerResolvedFood(normalizeCustomFood(alimento) as NutritionSourceFood)}
                    className="flex w-full items-start justify-between rounded-2xl bg-white p-3 text-left shadow-sm transition hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="pr-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{alimento.nombre}</p>
                      <p className="mt-1 text-[9px] text-gray-500 dark:text-gray-400">
                        {Number(alimento.calorias || 0)} kcal • P:{Number(alimento.proteina || 0)}g • C:{Number(alimento.carbohidratos || 0)}g • G:{Number(alimento.grasas || 0)}g
                      </p>
                    </div>
                    <Plus size={16} className="text-gray-400" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {mostrarBase && (
          <div className="mt-4 max-h-[26rem] space-y-2 overflow-y-auto rounded-[28px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
            <p className="mb-3 text-[9px] font-black uppercase text-gray-500">Selecciona un alimento</p>
            {Object.values(todosLosAlimentos).map((alimento: any) => (
              <button
                key={alimento.id}
                onClick={() => registerResolvedFood(alimento)}
                className="flex w-full items-center justify-between rounded-2xl bg-white p-3 text-left transition hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{alimento.nombre}</p>
                  <p className="text-[8px] text-gray-500 dark:text-gray-400">{Number(alimento.calorias || 0)} kcal</p>
                </div>
                <Plus size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      <PremiumLock isPro={isPro} text="Frecuentes e Historial PRO">
        <div className="space-y-4 rounded-[34px] border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400">Comidas frecuentes</h3>
            <BookOpen size={18} className="text-gray-400" />
          </div>
          {allTemplates.length === 0 ? (
            <p className="py-6 text-center text-[10px] font-bold uppercase text-gray-400">Sin comidas frecuentes todavía</p>
          ) : (
            <div className="space-y-2">
              {allTemplates.map((template) => (
                <TemplateCard
                  key={template.signature}
                  template={template}
                  onUse={() => void handleUseTemplate(template)}
                  onDelete={() => removeTemplate(template.signature)}
                />
              ))}
            </div>
          )}
        </div>
      </PremiumLock>

      <PremiumLock isPro={isPro} text="Micronutrientes PRO">
        <div className="space-y-4 rounded-[34px] border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400">Vitaminas y minerales</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Cantidades estimadas a partir de los alimentos registrados</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[9px] font-black uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              Fuente: {micronutrients.sourceLabel}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <NutrientBox title="Vitaminas" values={micronutrients.vitaminas} />
            <NutrientBox title="Minerales" values={micronutrients.minerales} />
          </div>
        </div>
      </PremiumLock>

      {(saludHoy?.alertasNutricionales || []).length > 0 && (
        <div className="space-y-2 rounded-[28px] border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
            <span className="text-[10px] font-black uppercase text-red-700 dark:text-red-300">Alertas nutricionales</span>
          </div>
          {(saludHoy.alertasNutricionales || []).map((alerta: string, index: number) => (
            <p key={index} className="text-[10px] font-semibold text-red-700 dark:text-red-300">{alerta}</p>
          ))}
        </div>
      )}

      {petFeedback && (
        <div
          className={`rounded-2xl border p-3 text-[10px] font-bold ${
            petFeedback.macrosOK
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          }`}
        >
          {petFeedback.texto}
        </div>
      )}

      <ModalAlimentoCustom
        isOpen={modalCustomOpen}
        onClose={() => setModalCustomOpen(false)}
        onAdd={(alimento: any) => {
          const saved = saveAlimentoCustom(alimento);
          setAlimentosCustom(getAlimentosCustom());
          void registerResolvedFood(normalizeCustomFood(saved), mealType, quantity, unit, saved.nombre);
          setModalCustomOpen(false);
          setMostrarBase(false);
        }}
      />
    </div>
  );
}

function MealSectionCard({
  title,
  items,
  totals,
  onSaveAsTemplate,
  onRemove
}: {
  title: string;
  items: any[];
  totals: { calorias: number; proteina: number; carbohidratos: number; grasas: number; fibra: number };
  onSaveAsTemplate: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-[30px] border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{totals.calorias.toFixed(0)} kcal</p>
          <p className="text-[9px] text-gray-500 dark:text-gray-400">
            P {totals.proteina.toFixed(0)}g • C {totals.carbohidratos.toFixed(0)}g • G {totals.grasas.toFixed(0)}g • Fibra {totals.fibra.toFixed(0)}g
          </p>
        </div>
        <button onClick={onSaveAsTemplate} className="rounded-full bg-gray-100 px-3 py-2 text-[10px] font-black text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          Guardar
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 px-3 py-4 text-center text-[10px] font-bold uppercase text-gray-400 dark:border-gray-700">
            Sin registros
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-700">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.nombre}</p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">
                  {item.hora} • {Number(item.cantidad || 1)} {item.unidad} • {Number(item.caloriasTotales || 0)} kcal
                </p>
              </div>
              <button onClick={() => onRemove(item.id)} className="text-rose-500 transition hover:text-rose-700">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ParsedItemRow({
  item,
  onMealTypeChange,
  onQuantityChange,
  onUnitChange,
  onResolveWithLocal
}: {
  item: ParsedMealItem;
  onMealTypeChange: (type: MealType) => void;
  onQuantityChange: (value: number) => void;
  onUnitChange: (value: string) => void;
  onResolveWithLocal: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900 dark:text-white">{item.match?.nombre || item.query}</p>
          <p className="text-[9px] text-gray-500 dark:text-gray-400">{item.note}</p>
        </div>
        {item.needsReview ? (
          <button onClick={onResolveWithLocal} className="rounded-full bg-amber-100 px-3 py-1 text-[9px] font-black uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            Buscar
          </button>
        ) : (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Listo
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <select value={item.mealType} onChange={(e) => onMealTypeChange(e.target.value as MealType)} className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-[10px] font-bold dark:border-gray-700 dark:bg-gray-700 dark:text-white">
          <option value="desayuno">Desayuno</option>
          <option value="almuerzo">Almuerzo</option>
          <option value="merienda">Merienda</option>
          <option value="cena">Cena</option>
          <option value="snack">Snack</option>
        </select>
        <input type="number" min="0.1" step="0.1" value={item.quantity} onChange={(e) => onQuantityChange(Number(e.target.value) || 1)} className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-[10px] font-bold dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
        <input value={item.unit} onChange={(e) => onUnitChange(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-2 py-2 text-[10px] font-bold dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
        <div className="rounded-xl bg-gray-50 px-2 py-2 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {item.confidence}% • {formatMicronutrientValue(item.nutrients?.calorias || 0)} kcal
        </div>
      </div>
      <div className="mt-2 text-[9px] text-gray-500 dark:text-gray-400">
        {item.match ? `Base: ${item.match.fuente || "local"} • ` : ""}
        {item.quantity} {item.unit}
      </div>
    </div>
  );
}

function NutrientBox({ title, values }: { title: string; values: Record<string, number> }) {
  const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <div className="rounded-[24px] bg-gray-50 p-4 dark:bg-gray-700/60">
      <p className="mb-3 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">{title}</p>
      {entries.length === 0 ? (
        <p className="text-[10px] text-gray-400">Sin datos suficientes</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([name, value]) => (
            <div key={name} className="flex items-center justify-between gap-3">
              <span className="truncate text-[10px] font-bold text-gray-700 dark:text-gray-200">{name}</span>
              <span className="text-[10px] font-black text-gray-900 dark:text-white">{formatMicronutrientValue(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onUse,
  onDelete
}: {
  template: MealTemplate;
  onUse: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/60">
      <button onClick={onUse} className="flex-1 text-left">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{template.nombre}</p>
        <p className="text-[9px] text-gray-500 dark:text-gray-400">
          {template.uses} usos • {template.totals.calorias.toFixed(0)} kcal • {template.items.length} alimentos
        </p>
      </button>
      <button onClick={onDelete} className="text-rose-500 transition hover:text-rose-700">
        <X size={16} />
      </button>
    </div>
  );
}
