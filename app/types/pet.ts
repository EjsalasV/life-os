export type PetTipo = 'gatoNaranja' | 'gatoGris' | 'gatoBlanco' | 'conejo';
export type PetRaridad = 'comun' | 'raro' | 'epico' | 'legendario';

export interface PetInstance {
  id: string;
  tipo: PetTipo;
  nombre: string;
  color?: string;
  raridad: PetRaridad;
  nivel: number;
  salud: number;
  felicidad: number;
  energia: number;
  experiencia: number;
  diasSinActividad: number;
  hambre?: number;
  sed?: number;
  actividadHoy: {
    agua: number;
    comidas: number;
    habitos: number;
    recetasCompartidas: number;
    comentarios: number;
    likes: number;
    desafiosCompletados: number;
    tiempoApp: number;
  };
  lastDailyResetAt?: string;
  lastActivityAt: string;
  lastDecayAt: string;
  fechaAdopcion: string;
}
