"use client";

import { useState, useMemo } from 'react';
import type {
  UsuarioPerfil,
  RecetaCompartida,
  RutinaCompartida,
  ComentarioComunidad,
  NotificacionSocial,
  Medallas
} from '@/app/types/comunidad';

export default function useComunidad() {
  // Datos simulados (en producción vendrían de backend)
  const [recetasCompartidas, setRecetasCompartidas] = useState<RecetaCompartida[]>([
    {
      id: 'rec-1',
      autorId: 'user-2',
      autorNombre: 'María Fit',
      autorAvatar: '👩‍🍳',
      titulo: 'Salmón Anti-Cortisol Express',
      descripcion: '15 minutos. Salmón + espinaca. Omega-3 puro para bajar cortisol',
      receta: {},
      macros: { calorias: 420, proteina: 36, carbohidratos: 8, grasas: 28 },
      objetivo: 'anti-cortisol',
      tiempoPreparacion: 15,
      dificultad: 'muy-fácil',
      ingredientes: ['salmón', 'espinaca', 'limón', 'aceite oliva'],
      likes: 342,
      comentarios: 28,
      compartidas: 54,
      guardadaPor: ['user-1', 'user-3', 'user-5'],
      puntuacion: 4.8,
      tags: ['#salmón', '#omega3', '#anticortisol', '#rapida'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      likedByUser: true
    },
    {
      id: 'rec-2',
      autorId: 'user-3',
      autorNombre: 'Carlos Muscu',
      autorAvatar: '💪',
      titulo: 'Desayuno Power Muscular',
      descripcion: '45g proteína. Huevo + avena + almendras. Perfecta para ganancia',
      receta: {},
      macros: { calorias: 480, proteina: 45, carbohidratos: 50, grasas: 15 },
      objetivo: 'ganancia-muscular',
      tiempoPreparacion: 10,
      dificultad: 'muy-fácil',
      ingredientes: ['huevo', 'avena', 'almendras', 'plátano'],
      likes: 521,
      comentarios: 47,
      compartidas: 89,
      guardadaPor: ['user-1', 'user-4', 'user-6'],
      puntuacion: 4.9,
      tags: ['#proteina', '#desayuno', '#musculo', '#ganancia'],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      likedByUser: false
    }
  ]);

  const [rutinasCompartidas, setRutinasCompartidas] = useState<RutinaCompartida[]>([
    {
      id: 'rut-1',
      autorId: 'user-4',
      autorNombre: 'Ana Bienestar',
      autorAvatar: '🧘‍♀️',
      titulo: 'Día Alto Estrés - Recuperación Rápida',
      descripcion: 'Rutina para cuando el estrés está al máximo. Meditación + ejercicio intenso + sueño profundo',
      tipo: 'dia-alto-estres',
      dias: 1,
      pasos: [
        { hora: '6:30am', actividad: 'Despertar con luz natural', duracion: 5 },
        { hora: '7am', actividad: 'Desayuno PROTEICO (huevo, avena)', duracion: 15 },
        { hora: '7:30am', actividad: 'Ejercicio INTENSO 45min (saca el estrés)', duracion: 45 },
        { hora: '10am', actividad: 'Meditación 15min (respira)', duracion: 15 },
        { hora: '12:30pm', actividad: 'Almuerzo: salmón + carbos complejos', duracion: 30 },
        { hora: '17pm', actividad: 'Pausa: té verde + meditación 10min', duracion: 20 },
        { hora: '19pm', actividad: 'Cena temprano (antes 20h)', duracion: 30 },
        { hora: '21pm', actividad: 'Magnesio + sin pantallas', duracion: 30 },
        { hora: '22pm', actividad: 'Dormir (cortinas cerradas)', duracion: 480 }
      ],
      objetivo: 'anti-cortisol',
      dificultad: 'intenso',
      beneficios: ['Reduce cortisol drásticamente', 'Mejora sueño', 'Energía estable'],
      likes: 1240,
      comentarios: 156,
      compartidas: 203,
      guardadaPor: ['user-1', 'user-2', 'user-5', 'user-6'],
      puntuacion: 4.9,
      tags: ['#anticortisol', '#estrés', '#meditación', '#sueño'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      likedByUser: true
    }
  ]);

  const [miPerfil, setMiPerfil] = useState<UsuarioPerfil>({
    id: 'user-1',
    nombre: 'Tu Nombre',
    avatar: '👤',
    bio: 'Obsesionado con la salud óptima. Anti-cortisol warrior 🧘',
    objetivo: 'anti-cortisol',
    peso: 75,
    altura: 175,
    edad: 28,
    recetasCompartidas: 3,
    rutinasCompartidas: 2,
    seguidores: 87,
    siguiendo: 45,
    puntuacion: 82,
    medallas: ['primera-receta', 'experto-cortisol'],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  });

  const [seguimientos, setSeguimientos] = useState<string[]>(['user-2', 'user-4']);

  const [notificacionesSociales, setNotificacionesSociales] = useState<NotificacionSocial[]>([
    {
      id: 'notif-1',
      tipo: 'like',
      usuarioId: 'user-2',
      usuarioNombre: 'María Fit',
      contenido: 'Le encantó tu receta de Atún Anti-inflamatorio',
      elementoId: 'rec-1',
      leida: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: 'notif-2',
      tipo: 'seguidor',
      usuarioId: 'user-5',
      usuarioNombre: 'Luis Entrenador',
      contenido: 'Empezó a seguirte',
      leida: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  // Compartir receta
  const compartirReceta = (receta: any, titulo: string, descripcion: string, tags: string[]) => {
    const nuevaReceta: RecetaCompartida = {
      id: `rec-${Date.now()}`,
      autorId: miPerfil.id,
      autorNombre: miPerfil.nombre,
      autorAvatar: miPerfil.avatar,
      titulo,
      descripcion,
      receta,
      macros: receta.macros,
      objetivo: miPerfil.objetivo,
      tiempoPreparacion: receta.tiempoTotal,
      dificultad: receta.dificultad || 'moderado',
      ingredientes: receta.ingredientes.map((i: any) => i.nombre),
      likes: 0,
      comentarios: 0,
      compartidas: 0,
      guardadaPor: [],
      puntuacion: 0,
      tags,
      createdAt: new Date(),
      likedByUser: false
    };

    setRecetasCompartidas([nuevaReceta, ...recetasCompartidas]);
    setMiPerfil({
      ...miPerfil,
      recetasCompartidas: miPerfil.recetasCompartidas + 1
    });

    return nuevaReceta;
  };

  // Compartir rutina
  const compartirRutina = (
    titulo: string,
    descripcion: string,
    pasos: any[],
    tipo: any,
    tags: string[]
  ) => {
    const nuevaRutina: RutinaCompartida = {
      id: `rut-${Date.now()}`,
      autorId: miPerfil.id,
      autorNombre: miPerfil.nombre,
      autorAvatar: miPerfil.avatar,
      titulo,
      descripcion,
      tipo,
      dias: 1,
      pasos,
      objetivo: miPerfil.objetivo,
      dificultad: 'moderado',
      beneficios: [],
      likes: 0,
      comentarios: 0,
      compartidas: 0,
      guardadaPor: [],
      puntuacion: 0,
      tags,
      createdAt: new Date(),
      likedByUser: false
    };

    setRutinasCompartidas([nuevaRutina, ...rutinasCompartidas]);
    setMiPerfil({
      ...miPerfil,
      rutinasCompartidas: miPerfil.rutinasCompartidas + 1
    });

    return nuevaRutina;
  };

  // Like a una receta
  const likeReceta = (recetaId: string) => {
    setRecetasCompartidas(prev =>
      prev.map(r =>
        r.id === recetaId
          ? { ...r, likes: r.likedByUser ? r.likes - 1 : r.likes + 1, likedByUser: !r.likedByUser }
          : r
      )
    );
  };

  // Guardar receta
  const guardarReceta = (recetaId: string) => {
    setRecetasCompartidas(prev =>
      prev.map(r =>
        r.id === recetaId
          ? {
              ...r,
              guardadaPor: r.guardadaPor.includes(miPerfil.id)
                ? r.guardadaPor.filter(id => id !== miPerfil.id)
                : [...r.guardadaPor, miPerfil.id]
            }
          : r
      )
    );
  };

  // Seguir usuario
  const seguirUsuario = (usuarioId: string) => {
    setSeguimientos(prev =>
      prev.includes(usuarioId) ? prev.filter(id => id !== usuarioId) : [...prev, usuarioId]
    );
  };

  // Comentar
  const comentar = (recetaId: string, texto: string) => {
    setRecetasCompartidas(prev =>
      prev.map(r =>
        r.id === recetaId ? { ...r, comentarios: r.comentarios + 1 } : r
      )
    );

    // Notificación al autor
    setNotificacionesSociales([
      {
        id: `notif-${Date.now()}`,
        tipo: 'comentario',
        usuarioId: miPerfil.id,
        usuarioNombre: miPerfil.nombre,
        contenido: `Comentó en tu receta: "${texto.substring(0, 50)}..."`,
        elementoId: recetaId,
        leida: false,
        createdAt: new Date()
      },
      ...notificacionesSociales
    ]);
  };

  // Buscar
  const buscar = (query: string) => {
    const termino = query.toLowerCase();

    const recetasEncontradas = recetasCompartidas.filter(
      r => r.titulo.toLowerCase().includes(termino) || r.tags.some(t => t.includes(termino))
    );

    const rutinasEncontradas = rutinasCompartidas.filter(
      r => r.titulo.toLowerCase().includes(termino) || r.tags.some(t => t.includes(termino))
    );

    return { recetas: recetasEncontradas, rutinas: rutinasEncontradas };
  };

  // Trending
  const trending = useMemo(() => {
    const recetas = [...recetasCompartidas]
      .sort((a, b) => (b.likes + b.comentarios * 2) - (a.likes + a.comentarios * 2))
      .slice(0, 5);

    const rutinas = [...rutinasCompartidas]
      .sort((a, b) => (b.likes + b.comentarios * 2) - (a.likes + a.comentarios * 2))
      .slice(0, 5);

    return { recetas, rutinas };
  }, [recetasCompartidas, rutinasCompartidas]);

  // Mis guardadas
  const misGuardadas = useMemo(() => {
    const recetas = recetasCompartidas.filter(r => r.guardadaPor.includes(miPerfil.id));
    const rutinas = rutinasCompartidas.filter(r => r.guardadaPor.includes(miPerfil.id));
    return { recetas, rutinas };
  }, [recetasCompartidas, rutinasCompartidas, miPerfil.id]);

  // Feed de quien sigo
  const feedSiguiendo = useMemo(() => {
    return recetasCompartidas.filter(r => seguimientos.includes(r.autorId));
  }, [recetasCompartidas, seguimientos]);

  return {
    // Datos
    recetasCompartidas,
    rutinasCompartidas,
    miPerfil,
    seguimientos,
    notificacionesSociales,

    // Acciones
    compartirReceta,
    compartirRutina,
    likeReceta,
    guardarReceta,
    seguirUsuario,
    comentar,
    buscar,

    // Vistas especiales
    trending,
    misGuardadas,
    feedSiguiendo,

    // Actualizar perfil
    actualizarPerfil: (updates: Partial<UsuarioPerfil>) => {
      setMiPerfil({ ...miPerfil, ...updates });
    }
  };
}
