// Sistema de Notificaciones Smart para Life OS

export interface Notificacion {
  id: string;
  tipo: 'alerta' | 'recordatorio' | 'logro' | 'consejo';
  titulo: string;
  mensaje: string;
  icono: string;
  accion?: string;
  datos?: any;
  prioridad: 'baja' | 'media' | 'alta';
  timestamp: Date;
  leida: boolean;
}

export const TiposNotificaciones = {
  RECORDAR_DESAYUNO: 'recordar-desayuno',
  RECORDAR_ALMUERZO: 'recordar-almuerzo',
  RECORDAR_CENA: 'recordar-cena',
  ALERTA_DEFICIT_BAJO: 'deficit-bajo',
  ALERTA_DEFICIT_ALTO: 'deficit-alto',
  ALERTA_AGUA: 'beber-agua',
  ALERTA_EJERCICIO: 'falta-ejercicio',
  LOGRO_SEMANA: 'logro-semana',
  CONSEJO_ANTI_CORTISOL: 'consejo-cortisol',
  CONSEJO_NUTRICION: 'consejo-nutricion',
  ALERTA_SUEÑO: 'alerta-sueño',
  RECORDAR_MEDITACION: 'recordar-meditacion',
  HORA_OPTIMA_EJERCICIO: 'hora-optima-ejercicio',
  BATERIA_BAJA: 'bateria-baja',
  META_DIARIA_CUMPLIDA: 'meta-cumplida'
};

/**
 * Genera notificaciones inteligentes basadas en datos de salud
 */
export function generarNotificacionesInteligentes(saludHoy: any, horario: Date): Notificacion[] {
  const notificaciones: Notificacion[] = [];
  const hora = horario.getHours();

  // Recordatorios de comidas
  if (hora === 7 && !saludHoy?.desayunoRegistrado) {
    notificaciones.push({
      id: `breakfast-${Date.now()}`,
      tipo: 'recordatorio',
      titulo: '🌅 Hora del Desayuno',
      mensaje: 'Registra tu desayuno anti-cortisol para empezar bien el día',
      icono: '🥣',
      accion: 'ir-a-nutricion',
      prioridad: 'media',
      timestamp: new Date(),
      leida: false
    });
  }

  if (hora === 12 && !saludHoy?.almuerzoRegistrado) {
    notificaciones.push({
      id: `lunch-${Date.now()}`,
      tipo: 'recordatorio',
      titulo: '🍽️ Almuerzo',
      mensaje: 'Come proteína + carbos complejos para mantener energía',
      icono: '🍗',
      accion: 'ir-a-nutricion',
      prioridad: 'media',
      timestamp: new Date(),
      leida: false
    });
  }

  if (hora === 19 && !saludHoy?.cenaRegistrada) {
    notificaciones.push({
      id: `dinner-${Date.now()}`,
      tipo: 'recordatorio',
      titulo: '🌙 Hora de Cena',
      mensaje: 'Cena temprano (antes de las 20h) para dormir mejor',
      icono: '🍲',
      accion: 'ir-a-nutricion',
      prioridad: 'media',
      timestamp: new Date(),
      leida: false
    });
  }

  // Alertas de déficit calórico
  if (saludHoy?.balance < -300) {
    notificaciones.push({
      id: `low-deficit-${Date.now()}`,
      tipo: 'alerta',
      titulo: '⚠️ Déficit Muy Alto',
      mensaje: `Déficit de ${Math.abs(saludHoy.balance)} kcal. Come algo sano para no perder músculo`,
      icono: '🚨',
      accion: 'ver-nutricion',
      prioridad: 'alta',
      timestamp: new Date(),
      leida: false
    });
  }

  if (saludHoy?.balance > 300 && hora > 16) {
    notificaciones.push({
      id: `high-deficit-${Date.now()}`,
      tipo: 'alerta',
      titulo: '⚠️ Superávit Calórico',
      mensaje: `Llevas +${saludHoy.balance} kcal. A menos que busques ganancia, reduce un poco`,
      icono: '🔔',
      accion: 'ver-deficit',
      prioridad: 'baja',
      timestamp: new Date(),
      leida: false
    });
  }

  // Recordatorio de agua
  if ([9, 14, 17, 20].includes(hora)) {
    notificaciones.push({
      id: `water-${hora}-${Date.now()}`,
      tipo: 'recordatorio',
      titulo: '💧 Bebe Agua',
      mensaje: 'Hidratación = mejor cortisol. Bebe 500ml ahora',
      icono: '💙',
      prioridad: 'baja',
      timestamp: new Date(),
      leida: false
    });
  }

  // Alerta de sueño
  if (hora === 22 && saludHoy?.suenoHorasAnterior < 6) {
    notificaciones.push({
      id: `sleep-alert-${Date.now()}`,
      tipo: 'alerta',
      titulo: '😴 Dormir Mejor',
      mensaje: 'Anoche dormiste mal. Acuéstate YA, sin pantallas',
      icono: '🌙',
      accion: 'dormir',
      prioridad: 'alta',
      timestamp: new Date(),
      leida: false
    });
  }

  // Consejos anti-cortisol
  if (hora === 10 && saludHoy?.estres > 70) {
    notificaciones.push({
      id: `cortisol-tip-${Date.now()}`,
      tipo: 'consejo',
      titulo: '🧘 Estrés Alto Detectado',
      mensaje: 'Haz 10 min de meditación NOW. Reduce cortisol al instante',
      icono: '✨',
      accion: 'meditacion',
      prioridad: 'alta',
      timestamp: new Date(),
      leida: false
    });
  }

  // Recordatorio de ejercicio (hora óptima)
  if ([6, 7, 17, 18].includes(hora) && !saludHoy?.ejercicioHoy) {
    notificaciones.push({
      id: `exercise-${hora}-${Date.now()}`,
      tipo: 'recordatorio',
      titulo: '⚡ Hora Óptima para Ejercicio',
      mensaje: `Ahora cortisol está alto. Es el MEJOR momento para entrenar`,
      icono: '💪',
      accion: 'ir-a-ejercicio',
      prioridad: 'media',
      timestamp: new Date(),
      leida: false
    });
  }

  // Alerta de batería baja
  if (saludHoy?.bateria < 30) {
    notificaciones.push({
      id: `bateria-baja-${Date.now()}`,
      tipo: 'alerta',
      titulo: '⚡ Batería Baja',
      mensaje: 'Tu energía está baja. Come carbos + proteína ahora',
      icono: '🔋',
      accion: 'ver-nutricion',
      prioridad: 'alta',
      timestamp: new Date(),
      leida: false
    });
  }

  return notificaciones;
}

/**
 * Horarios óptimos para notificaciones
 */
export const HorariosOptimos = {
  desayuno: { hora: 7, minuto: 0, notificacionesTiempoAntes: 15 }, // 6:45
  almuerzo: { hora: 12, minuto: 30, notificacionesTiempoAntes: 30 }, // 12:00
  cena: { hora: 19, minuto: 0, notificacionesTiempoAntes: 30 }, // 18:30
  ejercicio: { hora: 6, minuto: 30, notificacionesTiempoAntes: 15 }, // 6:15 am
  ejercicioTarde: { hora: 17, minuto: 30, notificacionesTiempoAntes: 30 }, // 17:00
  meditacion: { hora: 10, minuto: 0, notificacionesTiempoAntes: 5 },
  meditacionNoche: { hora: 20, minuto: 0, notificacionesTiempoAntes: 10 },
  dormir: { hora: 22, minuto: 30, notificacionesTiempoAntes: 0 },
  agua: [9, 14, 17, 20]
};

/**
 * Calcula puntuación de prioridad para notificación
 */
export function calcularPrioridad(
  tipo: string,
  saludHoy: any
): 'baja' | 'media' | 'alta' {
  if (saludHoy?.estres > 80 || saludHoy?.bateria < 20) return 'alta';
  if (saludHoy?.suenoHoras < 5) return 'alta';
  if (saludHoy?.alertasNutricionales?.length > 2) return 'media';
  return 'baja';
}

/**
 * Textos motivacionales según contexto
 */
export const TextosMotivacionales = {
  deficit: [
    '🎯 Cada kcal cuenta. Vas a lograrlo',
    '💪 -0.5kg/semana es lo perfecto',
    '🔥 El déficit es tu aliado',
    '⚖️ Paciencia. El cambio es gradual'
  ],
  ejercicio: [
    '⚡ Tu mejor versión te espera',
    '💯 Este entrenamiento cuenta',
    '🏆 Campeones se hacen así',
    '🚀 Energía al máximo'
  ],
  nutricion: [
    '🥗 Come para ganar, no para engordar',
    '🧠 Macros balanceados = mente clara',
    '💚 Tu cuerpo lo agradecerá',
    '🌱 Nutrición = el mejor medicamento'
  ],
  cortisol: [
    '🧘 Respira. Baja el cortisol',
    '💆 Relájate. Mañana será mejor',
    '✨ Paz mental = salud física',
    '🌙 Descansa. Lo necesitas'
  ]
};

/**
 * Sistema de notificaciones persistentes (storage)
 */
export interface HistorialNotificaciones {
  semana: Notificacion[];
  mes: Notificacion[];
  leidas: number;
  noLeidas: number;
}

export function calcularEstadisticas(notificaciones: Notificacion[]): HistorialNotificaciones {
  const ahora = new Date();
  const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

  const semana = notificaciones.filter(n => n.timestamp > hace7Dias);
  const mes = notificaciones.filter(n => n.timestamp > hace30Dias);
  const leidas = notificaciones.filter(n => n.leida).length;
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return { semana, mes, leidas, noLeidas };
}
