export type PetTipo = 'gato' | 'perro' | 'dragon' | 'robot' | 'alienigena';
export type PetRaridad = 'comun' | 'raro' | 'epico' | 'legendario';

export interface PetInstance {
  id: string;
  tipo: PetTipo;
  nombre: string;
  color?: string;
  accesorios?: string[];
  raridad: PetRaridad;
  nivel: number;
  salud: number;
  felicidad: number;
  energia: number;
  experiencia: number;
  diasSinActividad: number;
  actividadHoy: {
    recetasCompartidas: number;
    comentarios: number;
    likes: number;
    desafiosCompletados: number;
    tiempoApp: number;
  };
  lastActivityAt: string;
  lastDecayAt: string;
  fechaAdopcion: string;
}

export interface PetsCollection {
  userId: string;
  pets: PetInstance[];
  petActivoId: string;
}