import type { AlimentoRegistrado, Nutriente, SaludHoy } from "@/app/types";
import type { FirebaseUser } from "@/app/types";
import { AlimentosBase } from "@/app/constants/alimentos-base";
import {
  calcularCaloriasObjetivo,
  calcularTDEE,
  calcularTMB,
  distribuirMacros,
  type PerfilMetabolico
} from "@/app/constants/deficit-calorico";

export const MEAL_TYPES = ["desayuno", "almuerzo", "merienda", "cena", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];
export const MEAL_SECTION_TYPES: Array<Exclude<MealType, "snack">> = ["desayuno", "almuerzo", "merienda", "cena"];

export interface NutritionSourceFood extends Nutriente {
  fuente?: "local" | "usda" | "custom" | "receta" | "estimado";
  origen?: "local" | "usda" | "custom" | "receta" | "estimado";
  baseCantidad?: number;
  baseUnidad?: string;
  notaFuente?: string;
}

export interface ParsedMealItem {
  id: string;
  rawText: string;
  query: string;
  mealType: MealType;
  quantity: number;
  unit: string;
  confidence: number;
  sourceLabel: string;
  match: NutritionSourceFood | null;
  suggestions: NutritionSourceFood[];
  nutrients: Nutriente | null;
  needsReview: boolean;
  note: string;
}

export interface MealTemplate {
  id: string;
  nombre: string;
  mealType: MealType;
  signature: string;
  source: "historico" | "guardado";
  uses: number;
  lastUsedAt: string;
  items: Array<Pick<AlimentoRegistrado, "nombre" | "cantidad" | "unidad" | "tipo" | "caloriasTotales" | "nutrientes"> & { alimentoId: string }>;
  totals: {
    calorias: number;
    proteina: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
  };
}

const UNIT_ALIASES: Record<string, string> = {
  gr: "g",
  gramos: "g",
  gram: "g",
  kilogramo: "kg",
  kilos: "kg",
  kilo: "kg",
  mililitro: "ml",
  mililitros: "ml",
  litro: "l",
  litros: "l",
  porciones: "porción",
  porcion: "porción",
  porcioneses: "porción",
  unidad: "unidad",
  unidades: "unidad",
  u: "unidad",
  huevos: "unidad",
  huevo: "unidad",
  rebanadas: "rebanada",
  rebanada: "rebanada",
  tazas: "taza",
  taza: "taza",
  cucharadas: "cucharada",
  cucharada: "cucharada",
  cucharaditas: "cucharadita",
  cucharadita: "cucharadita",
  rodajas: "rodaja",
  rodaja: "rodaja"
};

const MEAL_ALIASES: Array<[RegExp, MealType]> = [
  [/\b(desayun|desayuno|breakfast)\w*\b/i, "desayuno"],
  [/\b(almorz|almuerzo|comid|lunch)\w*\b/i, "almuerzo"],
  [/\b(meriend|snack|tentempi[eé]?)\w*\b/i, "merienda"],
  [/\b(cen|cena|dinner)\w*\b/i, "cena"]
];

const STOP_WORDS = new Set([
  "desayune",
  "desayuné",
  "almorce",
  "almorcé",
  "merende",
  "merendé",
  "cene",
  "cené",
  "hoy",
  "ayer",
  "comi",
  "comí",
  "me",
  "un",
  "una",
  "unos",
  "unas",
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "con",
  "y",
  "e",
  "a",
  "al",
  "por",
  "para",
  "más",
  "mas"
]);

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeText(value: string) {
  return stripAccents(String(value || ""))
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\b([a-z0-9]{4,})s\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeMealType(value: string | undefined, fallback: MealType = "almuerzo"): MealType {
  const normalized = normalizeText(value || "");
  const matched = MEAL_ALIASES.find(([regex]) => regex.test(normalized));
  return matched?.[1] || fallback;
}

export function getMealSectionType(type: MealType): Exclude<MealType, "snack"> {
  return type === "snack" ? "cena" : type;
}

export function getMealLabel(type: MealType) {
  switch (type) {
    case "desayuno":
      return "Desayuno";
    case "almuerzo":
      return "Almuerzo";
    case "merienda":
      return "Merienda";
    case "snack":
    case "cena":
    default:
      return "Cena / Snack";
  }
}

export function getFoodLabel(food: Partial<Nutriente> & { nombre?: string }) {
  return food.nombre || "";
}

export function inferBasePortion(food: Partial<Nutriente> & { nombre?: string; baseCantidad?: number; baseUnidad?: string }) {
  if (Number.isFinite(food.baseCantidad) && food.baseUnidad) {
    return {
      baseCantidad: Number(food.baseCantidad),
      baseUnidad: normalizeUnit(String(food.baseUnidad))
    };
  }

  const name = normalizeText(food.nombre || "");
  const inline = name.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|gramos?|ml|l|litros?|unidad(?:es)?|porcion(?:es)?|rebanada(?:s)?|taza(?:s)?|cucharada(?:s)?|cucharadita(?:s)?|rodaja(?:s)?)/i);
  if (inline) {
    const amount = Number(String(inline[1]).replace(",", "."));
    const unit = normalizeUnit(inline[2]);
    return { baseCantidad: Number.isFinite(amount) && amount > 0 ? amount : 1, baseUnidad: unit };
  }

  if (/\b\d+\s*x\b/i.test(name)) {
    return { baseCantidad: 1, baseUnidad: "porción" };
  }

  return { baseCantidad: 1, baseUnidad: "porción" };
}

export function normalizeUnit(unit?: string) {
  const normalized = normalizeText(unit || "");
  if (!normalized) return "porción";
  if (UNIT_ALIASES[normalized]) return UNIT_ALIASES[normalized];
  if (normalized === "g" || normalized === "kg" || normalized === "ml" || normalized === "l") return normalized;
  return normalized;
}

function toBaseUnit(quantity: number, unit: string) {
  const normalizedUnit = normalizeUnit(unit);
  if (normalizedUnit === "kg") return { quantity: quantity * 1000, unit: "g" };
  if (normalizedUnit === "l") return { quantity: quantity * 1000, unit: "ml" };
  return { quantity, unit: normalizedUnit };
}

export function scaleNutrients(food: Partial<Nutriente> & { nombre?: string; fuente?: string; origen?: string; baseCantidad?: number; baseUnidad?: string }, quantity = 1, unit = "porción"): Nutriente {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const normalizedUnit = normalizeUnit(unit);
  const { baseCantidad, baseUnidad } = inferBasePortion(food);
  const normalizedBase = normalizeUnit(baseUnidad);

  const requested = toBaseUnit(safeQuantity, normalizedUnit);
  const base = toBaseUnit(baseCantidad || 1, normalizedBase);
  const compatible = requested.unit === base.unit || normalizedUnit === "porción" || normalizedBase === "porción";
  const factor = compatible && base.quantity > 0 ? requested.quantity / base.quantity : safeQuantity;

  const round = (value: unknown) => Math.round(Number(value || 0) * factor * 10) / 10;
  const vitaminas = Object.entries(food.vitaminas || {}).reduce<Record<string, number>>((acc, [key, value]) => {
    acc[key] = round(value);
    return acc;
  }, {});
  const minerales = Object.entries(food.minerales || {}).reduce<Record<string, number>>((acc, [key, value]) => {
    acc[key] = round(value);
    return acc;
  }, {});

  return {
    id: String(food.id || ""),
    nombre: String(food.nombre || ""),
    calorias: round(food.calorias),
    proteina: round(food.proteina),
    carbohidratos: round(food.carbohidratos),
    grasas: round(food.grasas),
    fibra: round(food.fibra),
    vitaminas,
    minerales,
    compatibilidad: [...(food.compatibilidad || [])],
    indices: {
      indiceInflamatorio: Number(food.indices?.indiceInflamatorio || 0),
      biodisponibilidad: Number(food.indices?.biodisponibilidad || 0)
    },
    fuente: food.fuente || food.origen || "estimado",
    origen: food.origen || food.fuente || "estimado",
    baseCantidad: baseCantidad || 1,
    baseUnidad: normalizedBase
  } as Nutriente;
}

function tokenOverlap(a: string, b: string) {
  const tokensA = new Set(normalizeText(a).split(" ").filter(Boolean));
  const tokensB = new Set(normalizeText(b).split(" ").filter(Boolean));
  const intersection = [...tokensA].filter((token) => tokensB.has(token));
  return intersection.length / Math.max(tokensA.size || 1, tokensB.size || 1);
}

export function findFoodMatches(query: string, foods: Record<string, any> | Array<any> = AlimentosBase) {
  const list = Array.isArray(foods) ? foods : Object.values(foods);
  const normalizedQuery = normalizeText(query);

  return list
    .map((food) => {
      const normalizedName = normalizeText(food.nombre || "");
      const normalizedId = normalizeText(food.id || "");
      const exact = normalizedName === normalizedQuery || normalizedId === normalizedQuery;
      const includes = normalizedName.includes(normalizedQuery) || normalizedId.includes(normalizedQuery) || normalizedQuery.includes(normalizedName);
      const overlap = tokenOverlap(normalizedName || normalizedId, normalizedQuery);
      const score = exact ? 1 : includes ? Math.min(0.95, 0.7 + overlap / 2) : overlap;
      return {
        food: {
          ...food,
          fuente: food.fuente || "local",
          origen: food.origen || food.fuente || "local"
        } as NutritionSourceFood,
        score,
        exact,
        includes
      };
    })
    .filter((item) => item.score >= 0.2)
    .sort((a, b) => b.score - a.score);
}

function removeLeadingMealPhrases(text: string) {
  return text
    .replace(/^(?:desayun\w*|almorz\w*|merend\w*|cen\w*|com\w*|me com\w*)\b[:\s-]*/i, "")
    .replace(/^(hoy|ayer)\b[:\s-]*/i, "")
    .trim();
}

function splitMealSegments(text: string) {
  return text
    .split(/(?:,|;|\n|\s+y\s+)/i)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function parseNumericQuantity(text: string) {
  const cleaned = text.trim();
  const wordsToNumbers: Record<string, number> = {
    un: 1,
    una: 1,
    uno: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
    seis: 6,
    siete: 7,
    ocho: 8,
    nueve: 9,
    diez: 10
  };
  const wordMatch = cleaned.match(new RegExp(`^(${Object.keys(wordsToNumbers).join("|")})\\b`, "i"));
  if (wordMatch) {
    const quantity = wordsToNumbers[normalizeText(wordMatch[1])];
    return { quantity, unit: "unidad", rest: cleaned.slice(wordMatch[0].length).trim() };
  }

  const numericMatch = cleaned.match(/^(\d+(?:[.,]\d+)?)(?:\s+(kg|g|gr|gramos?|ml|l|litros?|huevos?|unidades?|u|porciones?|rebanadas?|tazas?|cucharadas?|cucharaditas?|rodajas?))?/i);
  if (numericMatch) {
    const quantity = Number(String(numericMatch[1]).replace(",", "."));
    const unit = normalizeUnit(numericMatch[2] || "porción");
    return { quantity, unit, rest: cleaned.slice(numericMatch[0].length).trim() };
  }

  return { quantity: 1, unit: "porción", rest: cleaned };
}

function cleanFoodQuery(text: string) {
  return removeLeadingMealPhrases(text)
    .replace(/^(de|del|la|el|los|las|con|y|e)\b\s*/i, "")
    .trim();
}

export function parseNaturalMealInput(
  text: string,
  foods: Record<string, any> | Array<any> = AlimentosBase,
  fallbackMealType: MealType = "almuerzo"
): { mealType: MealType; items: ParsedMealItem[] } {
  const inferredMealType = normalizeMealType(text, fallbackMealType);
  const cleaned = removeLeadingMealPhrases(text);
  const segments = splitMealSegments(cleaned);
  const items: ParsedMealItem[] = segments.map((segment, index) => {
    const mealType = normalizeMealType(segment, inferredMealType);
    const parsedQuantity = parseNumericQuantity(segment);
    const leadingNumber = segment.match(/^\s*(\d+(?:[.,]\d+)?)/);
    const quantity = leadingNumber ? Number(leadingNumber[1].replace(",", ".")) : parsedQuantity.quantity;
    const unit = parsedQuantity.unit;
    const rest = parsedQuantity.rest;
    const query = cleanFoodQuery(rest || segment);
    const matches = findFoodMatches(query, foods);
    const topMatch = matches[0]?.food || null;
    const score = matches[0]?.score || 0;
    const normalizedNutrients = topMatch ? scaleNutrients(topMatch, quantity, unit) : null;

    return {
      id: `parsed-${index}-${Date.now()}`,
      rawText: segment,
      query: query || segment,
      mealType,
      quantity,
      unit,
      confidence: Math.round(score * 100),
      sourceLabel: topMatch ? String(topMatch.fuente || topMatch.origen || "local") : "pendiente",
      match: topMatch,
      suggestions: matches.slice(0, 3).map((item) => item.food),
      nutrients: normalizedNutrients,
      needsReview: !topMatch || score < 0.55,
      note: topMatch
        ? `${Math.round(score * 100)}% de coincidencia local`
        : `Revisa o busca "${query || segment}" en la base local/USDA`
    };
  });

  return { mealType: inferredMealType, items };
}

export function buildRegisteredFoodEntry({
  alimento,
  mealType,
  quantity = 1,
  unit = "porción",
  sourceLabel = "local",
  overrideName
}: {
  alimento: NutritionSourceFood;
  mealType: MealType;
  quantity?: number;
  unit?: string;
  sourceLabel?: string;
  overrideName?: string;
}): AlimentoRegistrado {
  const nutrientes = scaleNutrients(alimento, quantity, unit);
  return {
    id: `${alimento.id || "alimento"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    alimentoId: alimento.id,
    nombre: overrideName || alimento.nombre,
    tipo: mealType,
    cantidad: quantity,
    unidad: normalizeUnit(unit),
    hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    caloriasTotales: Number(nutrientes.calorias || 0),
    nutrientes: {
      ...nutrientes,
      origen: sourceLabel as any,
      fuente: sourceLabel as any
    } as Nutriente,
    impactoBateria: Math.round(Number(nutrientes.calorias || 0) / 20)
  };
}

export function mealKeyForType(type: MealType) {
  return getMealSectionType(type);
}

export function mealSortIndex(type: MealType) {
  return MEAL_SECTION_TYPES.indexOf(getMealSectionType(type));
}

export function groupFoodItemsByMeal(items: AlimentoRegistrado[]) {
  return MEAL_SECTION_TYPES.reduce<Record<Exclude<MealType, "snack">, AlimentoRegistrado[]>>((acc, section) => {
    acc[section] = items.filter((item) => getMealSectionType(item.tipo as MealType) === section);
    return acc;
  }, { desayuno: [], almuerzo: [], merienda: [], cena: [] });
}

export function summarizeMealItems(items: AlimentoRegistrado[]) {
  return items.reduce(
    (acc, item) => {
      acc.calorias += Number(item.caloriasTotales || 0);
      acc.proteina += Number(item.nutrientes?.proteina || 0);
      acc.carbohidratos += Number(item.nutrientes?.carbohidratos || 0);
      acc.grasas += Number(item.nutrientes?.grasas || 0);
      acc.fibra += Number(item.nutrientes?.fibra || 0);
      return acc;
    },
    { calorias: 0, proteina: 0, carbohidratos: 0, grasas: 0, fibra: 0 }
  );
}

export function summarizeMicronutrients(items: AlimentoRegistrado[]) {
  const vitaminas: Record<string, number> = {};
  const minerales: Record<string, number> = {};
  const sources = new Set<string>();

  items.forEach((item) => {
    const food = item.nutrientes as Nutriente & { fuente?: string; origen?: string };
    const source = String(food.fuente || food.origen || "estimado");
    sources.add(source);
    Object.entries(food.vitaminas || {}).forEach(([key, value]) => {
      vitaminas[key] = (vitaminas[key] || 0) + Number(value || 0);
    });
    Object.entries(food.minerales || {}).forEach(([key, value]) => {
      minerales[key] = (minerales[key] || 0) + Number(value || 0);
    });
  });

  return {
    vitaminas,
    minerales,
    sourceLabel: sources.size === 1 ? [...sources][0] : "estimado"
  };
}

function mealSignature(items: AlimentoRegistrado[]) {
  return items
    .map((item) => `${normalizeText(item.nombre)}:${Number(item.cantidad || 1)}:${normalizeUnit(item.unidad)}`)
    .sort()
    .join("|");
}

export function buildMealTemplatesFromHistory(days: Array<{ fecha: string; alimentos?: AlimentoRegistrado[] }>) {
  const templatesBySignature = new Map<string, MealTemplate>();

  days.forEach((day) => {
    const items = day.alimentos || [];
    MEAL_SECTION_TYPES.forEach((section) => {
      const sectionItems = items.filter((item) => getMealSectionType(item.tipo as MealType) === section);
      if (sectionItems.length === 0) return;
      const signature = mealSignature(sectionItems);
      const existing = templatesBySignature.get(signature);
      const totals = summarizeMealItems(sectionItems);
      if (existing) {
        existing.uses += 1;
        existing.lastUsedAt = day.fecha;
        return;
      }
      templatesBySignature.set(signature, {
        id: `hist-${section}-${signature.slice(0, 24)}`,
        nombre: sectionItems.map((item) => item.nombre).slice(0, 2).join(" + "),
        mealType: section,
        signature,
        source: "historico",
        uses: 1,
        lastUsedAt: day.fecha,
        items: sectionItems.map((item) => ({
          alimentoId: item.alimentoId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          unidad: item.unidad,
          tipo: item.tipo,
          caloriasTotales: item.caloriasTotales,
          nutrientes: item.nutrientes
        })),
        totals
      });
    });
  });

  return [...templatesBySignature.values()]
    .sort((a, b) => b.uses - a.uses || b.lastUsedAt.localeCompare(a.lastUsedAt))
    .slice(0, 12);
}

export function mergeMealTemplates(saved: MealTemplate[], historical: MealTemplate[]) {
  const merged = new Map<string, MealTemplate>();
  [...historical, ...saved].forEach((template) => {
    const current = merged.get(template.signature);
    if (!current || current.source === "historico") {
      merged.set(template.signature, template);
      return;
    }
    merged.set(template.signature, {
      ...current,
      uses: Math.max(current.uses, template.uses),
      lastUsedAt: template.lastUsedAt > current.lastUsedAt ? template.lastUsedAt : current.lastUsedAt
    });
  });
  return [...merged.values()].sort((a, b) => b.uses - a.uses || b.lastUsedAt.localeCompare(a.lastUsedAt));
}

export function createMealTemplateFromItems(mealType: MealType, items: AlimentoRegistrado[], name?: string): MealTemplate | null {
  if (items.length === 0) return null;
  const totals = summarizeMealItems(items);
  const signature = mealSignature(items);
  return {
    id: `saved-${mealType}-${signature.slice(0, 24)}-${Date.now()}`,
    nombre: name || `${getMealLabel(mealType)} habitual`,
    mealType,
    signature,
    source: "guardado",
    uses: 1,
    lastUsedAt: new Date().toISOString(),
    items: items.map((item) => ({
      alimentoId: item.alimentoId,
      nombre: item.nombre,
      cantidad: item.cantidad,
      unidad: item.unidad,
      tipo: item.tipo,
      caloriasTotales: item.caloriasTotales,
      nutrientes: item.nutrientes
    })),
    totals
  };
}

export function getNutritionGoalSnapshot(user?: FirebaseUser | null, profile?: Partial<PerfilMetabolico> | null) {
  const resolvedProfile = profile || null;
  if (!user || !resolvedProfile?.peso || !resolvedProfile?.altura || !resolvedProfile?.edad || !resolvedProfile?.sexo || !resolvedProfile?.nivelActividad || !resolvedProfile?.objetivo) {
    return {
      source: "fallback" as const,
      calorias: 2000,
      proteina: 150,
      carbohidratos: 225,
      grasas: 65,
      tmb: null,
      tdee: null,
      deficit: null
    };
  }

  const tmb = calcularTMB(resolvedProfile.peso, resolvedProfile.altura, resolvedProfile.edad, resolvedProfile.sexo);
  const tdee = calcularTDEE(tmb, resolvedProfile.nivelActividad);
  const objetivo = calcularCaloriasObjetivo(tdee, resolvedProfile.objetivo);
  const macros = distribuirMacros(objetivo.calorias, resolvedProfile.objetivo, resolvedProfile.peso);

  return {
    source: "perfil" as const,
    calorias: objetivo.calorias,
    proteina: macros.gramos.proteina,
    carbohidratos: macros.gramos.carbos,
    grasas: macros.gramos.grasas,
    tmb: Math.round(tmb),
    tdee,
    deficit: objetivo.deficit
  };
}

export function mealTypeFromText(text: string, fallback: MealType = "almuerzo") {
  return normalizeMealType(text, fallback);
}

export function splitFoodText(text: string) {
  return splitMealSegments(removeLeadingMealPhrases(text));
}
