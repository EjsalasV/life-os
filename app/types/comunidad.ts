// Tipos para el sistema de Comunidad

export interface UsuarioPerfil {
  id: string;
  nombre: string;
  avatar?: string;
  bio?: string;
  objetivo: 'ganancia-muscular' | 'perdida-grasa' | 'anti-cortisol' | 'energia';
  peso?: number;
  altura?: number;
  edad?: number;
  recetasCompartidas: number;
  rutinasCompartidas: number;
  seguidores: number;
  siguiendo: number;
  puntuacion: number; // 0-100
  medallas: string[]; // badges
  createdAt: Date;
  updatedAt?: Date;
}

export interface RecetaCompartida {
  id: string;
  autorId: string;
  autorNombre: string;
  autorAvatar?: string;
  titulo: string;
  descripcion: string;
  receta: any; // Receta completa
  macros: {
    calorias: number;
    proteina: number;
    carbohidratos: number;
    grasas: number;
  };
  objetivo: string;
  tiempoPreparacion: number;
  dificultad: 'muy-fácil' | 'fácil' | 'moderado' | 'difícil';
  ingredientes: string[];
  likes: number;
  comentarios: number;
  compartidas: number;
  guardadaPor: string[]; // IDs de usuarios que la guardaron
  puntuacion: number; // 1-5 estrellas
  tags: string[]; // #proteina #rapida #bajagrasa
  imagen?: string;
  createdAt: Date;
  likedByUser?: boolean;
}

export interface RutinaCompartida {
  id: string;
  autorId: string;
  autorNombre: string;
  autorAvatar?: string;
  titulo: string;
  descripcion: string;
  tipo: 'dia-bajo-estres' | 'dia-alto-estres' | 'fin-de-semana' | 'post-entrenamiento' | 'custom';
  dias: number; // Duración en días
  pasos: Array<{
    hora: string;
    actividad: string;
    duracion?: number;
  }>;
  objetivo: string;
  dificultad: 'fácil' | 'moderado' | 'intenso';
  beneficios: string[];
  likes: number;
  comentarios: number;
  compartidas: number;
  guardadaPor: string[];
  puntuacion: number;
  tags: string[];
  imagen?: string;
  createdAt: Date;
  likedByUser?: boolean;
}

export interface ComentarioComunidad {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioAvatar?: string;
  contenido: string;
  likes: number;
  respuestas?: ComentarioComunidad[];
  createdAt: Date;
}

export interface MedallaUsuario {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: string;
}

export interface NotificacionSocial {
  id: string;
  tipo: 'like' | 'comentario' | 'seguidor' | 'compartido';
  usuarioId: string;
  usuarioNombre: string;
  usuarioAvatar?: string;
  contenido: string;
  elementoId?: string;
  leida: boolean;
  createdAt: Date;
}

export const Medallas = {
  'primera-receta': {
    id: 'primera-receta',
    nombre: '👨‍🍳 Chef Inicial',
    descripcion: 'Compartiste tu primera receta',
    icono: '👨‍🍳'
  },
  'recetas-estrella': {
    id: 'recetas-estrella',
    nombre: '⭐ Recetero',
    descripcion: 'Tienes 5+ recetas con 4+ estrellas',
    icono: '⭐'
  },
  'influyente': {
    id: 'influyente',
    nombre: '🌟 Influencer de Salud',
    descripcion: '500+ seguidores',
    icono: '🌟'
  },
  'experto-cortisol': {
    id: 'experto-cortisol',
    nombre: '🧘 Experto Anti-Cortisol',
    descripcion: 'Compartiste 10 rutinas anti-cortisol',
    icono: '🧘'
  },
  'campeón-semana': {
    id: 'campeón-semana',
    nombre: '🏆 Campeón Semanal',
    descripcion: 'Receta/rutina #1 esta semana',
    icono: '🏆'
  },
  'ayudador': {
    id: 'ayudador',
    nombre: '💪 Motivador',
    descripcion: '100+ comentarios útiles en comunidad',
    icono: '💪'
  },
  'trending': {
    id: 'trending',
    nombre: '🔥 Trending',
    descripcion: 'Tu receta/rutina fue trending',
    icono: '🔥'
  },
  'objetivo-cumplido': {
    id: 'objetivo-cumplido',
    nombre: '✅ Meta Alcanzada',
    descripcion: 'Alcanzaste tu objetivo y lo compartiste',
    icono: '✅'
  }
};

export interface EstadisticasComunidad {
  totalUsuarios: number;
  totalRecetas: number;
  totalRutinas: number;
  recetasHoyCreadas: number;
  rutinasHoyCreadas: number;
  usuariosActivos24h: number;
}
