import type { Timestamp } from "firebase/firestore";

export interface Nutriente {
  id: string;
  nombre: string;
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasas: number;
  fibra: number;
  vitaminas: Record<string, number>;
  minerales: Record<string, number>;
  compatibilidad?: string[];
  indices?: { indiceInflamatorio?: number; biodisponibilidad?: number };
  fuente?: "local" | "usda" | "custom" | "receta" | "estimado";
  origen?: "local" | "usda" | "custom" | "receta" | "estimado";
  baseCantidad?: number;
  baseUnidad?: string;
  notaFuente?: string;
}

export interface AlimentoRegistrado {
  id: string;
  alimentoId: string;
  nombre: string;
  tipo: "desayuno" | "almuerzo" | "merienda" | "cena" | "snack";
  cantidad: number;
  unidad: string;
  hora: string;
  caloriasTotales: number;
  nutrientes: Nutriente;
  impactoBateria: number;
}

export interface MacrosDelDia {
  fecha: string;
  caloriasTotales: number;
  proteinaTotal: number;
  carbohidratosTotal: number;
  grasasTotal: number;
  vitaminasConsumo: Record<string, number>;
  mineralesConsumo: Record<string, number>;
  indiceInflamatorioPromedio: number;
  alimentos: AlimentoRegistrado[];
}

export interface SaludHoy extends MacrosDelDia {
  deficitCalorico?: { actividades: Array<{ id: string | number; tipo: string; minutos: number; calorias: number }>; caloriasQuemadas: number; balance: number };
  bateria: number;
  agua: number;
  animo: "mal" | "normal" | "genial";
  ejercicioMinutos: number;
  comidas: {
    desayuno?: "nutritivo" | "normal" | "procesado";
    almuerzo?: "nutritivo" | "normal" | "procesado";
    merienda?: "nutritivo" | "normal" | "procesado";
    cena?: "nutritivo" | "normal" | "procesado";
    snack?: "nutritivo" | "normal" | "procesado";
  };
  ayunoInicio?: number;
  habitosChecks: string[];
  suenoHoras?: number;
  calidadSueno?: "mala" | "regular" | "buena" | "excelente";
  estres?: number;
  recuperacionTiempoEstimado?: string;
  prediccionBateriaManana?: number;
  alertasNutricionales?: string[];
  consejosIA?: string[];
}

export interface Habito {
  id: string;
  nombre: string;
  frecuencia: "Diario" | "Semanal" | "Mensual";
  iconType: string;
  activo?: boolean;
  archivedAt?: Timestamp | null;
  createdAt?: Timestamp;
  timestamp: Timestamp;
}

export interface RegistroPeso {
  id: string;
  peso: number;
  timestamp: Timestamp;
}

export interface HistorialSalud extends MacrosDelDia {
  id: string;
  bateria: number;
  agua: number;
  habitosChecks: string[];
  suenoHoras?: number;
  calidadSueno?: string;
}

export interface ConsejosIA {
  id: string;
  tipo: "nutricion" | "ejercicio" | "sueño" | "habitos" | "hidratacion";
  contenido: string;
  prioridad: "baja" | "media" | "alta";
  basadoEn: string[];
  timestamp: Timestamp;
}

export interface CompatibilidadNutricional {
  alimento1: string;
  alimento2: string;
  sinergiaIndex: number;
  descripcion: string;
  impacto: "positivo" | "negativo" | "neutral";
}

export interface HealthForm {
  tipoEjercicio: string;
  duracion: string;
  tipoComida: string;
  calidadComida: string;
  horasSueno: string;
  calidadSueno: string;
  frecuencia: "Diario" | "Semanal" | "Mensual";
  iconType: string;
  nombre: string;
  peso: string;
}
