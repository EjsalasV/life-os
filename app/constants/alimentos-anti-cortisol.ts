export const AlimentosAntiCortisol = {
  // Alimentos que REDUCEN cortisol (magnésio, omega-3, antioxidantes)
  "salmón": {
    nombre: "Salmón",
    impactoCortisol: -4,
    razon: "Omega-3 alto, reduce inflamación",
    magnesio: 29,
    antioxidantes: "muy-alto"
  },
  "espinaca": {
    nombre: "Espinaca",
    impactoCortisol: -3,
    razon: "Magnesio, reduce estrés muscular",
    magnesio: 79,
    antioxidantes: "muy-alto"
  },
  "almendras": {
    nombre: "Almendras",
    impactoCortisol: -2,
    razon: "Magnesio, relaja sistema nervioso",
    magnesio: 76,
    antioxidantes: "alto"
  },
  "arándanos": {
    nombre: "Arándanos",
    impactoCortisol: -3,
    razon: "Antioxidantes, reducen inflamación",
    magnesio: 6,
    antioxidantes: "muy-alto"
  },
  "chocolate-amargo": {
    nombre: "Chocolate Amargo 70%+",
    impactoCortisol: -2,
    razon: "Feniletilamina, anandamida (felicidad)",
    magnesio: 228,
    antioxidantes: "muy-alto"
  },
  "aguacate": {
    nombre: "Aguacate",
    impactoCortisol: -2,
    razon: "Potasio, grasas saludables",
    magnesio: 29,
    antioxidantes: "alto"
  },
  "camote": {
    nombre: "Camote",
    impactoCortisol: -1,
    razon: "Carbos complejos, estabilizan glucosa",
    magnesio: 25,
    antioxidantes: "alto"
  },
  "té-verde": {
    nombre: "Té Verde",
    impactoCortisol: -2,
    razon: "L-theanine calma, reduce ansiedad",
    magnesio: 2,
    antioxidantes: "muy-alto"
  },

  // Alimentos que ELEVAN cortisol (evitar bajo estrés)
  "cafe-exceso": {
    nombre: "Café (>3 tazas)",
    impactoCortisol: 3,
    razon: "Cafeína dispara cortisol bajo estrés",
    magnesio: -5,
    antioxidantes: "bajo"
  },
  "azucar-procesada": {
    nombre: "Azúcar Procesada",
    impactoCortisol: 4,
    razon: "Picos de glucosa = picos de cortisol",
    magnesio: 0,
    antioxidantes: "nulo"
  },
  "comida-ultraprocesada": {
    nombre: "Ultra-procesado",
    impactoCortisol: 5,
    razon: "Inflamación sistémica, aumenta cortisol",
    magnesio: 0,
    antioxidantes: "nulo"
  },
  "alcohol-exceso": {
    nombre: "Alcohol (>2 tragos)",
    impactoCortisol: 3,
    razon: "Estrés oxidativo, altera dormir",
    magnesio: -10,
    antioxidantes: "nulo"
  }
};

export const PatronesCortisolAlto = [
  {
    nombre: "Pico Matutino Normal",
    descripcion: "Cortisol naturalmente alto en mañana (6-8am)",
    accion: "✅ Normal, aprovecha para ejercitar o trabajar duro",
    tipo: "normal"
  },
  {
    nombre: "Elevado Todo el Día",
    descripcion: "Cortisol >25 mcg/dL constante",
    accion: "⚠️ Estrés crónico, prioriza meditación + sueño + anti-cortisol foods",
    tipo: "alerta"
  },
  {
    nombre: "Pico Nocturno Elevado",
    descripcion: "Cortisol NO baja en noche (>5 mcg/dL post 22h)",
    accion: "🚨 No puedes dormir bien. Usa magnesio + té verde 2h antes de dormir",
    tipo: "critico"
  },
  {
    nombre: "Caída Demasiado Rápida",
    descripcion: "Crash de cortisol en tarde (somnolencia 14-16h)",
    accion: "💪 Come proteína + carbos complejos en almuerzo, evita siesta >15min",
    tipo: "alerta"
  }
];

export const HorariosOptimosCortisol = {
  "ejercicio": {
    horario: "6-8am o 17-18h",
    razon: "Cuando cortisol está naturalmente alto",
    beneficio: "Maximiza rendimiento, recuperación rápida",
    evitar: "22h-6am (cortisol bajo, cuerpo quiere dormir)"
  },
  "comidas-principales": {
    horario: "7am, 12-13h, 19h",
    razon: "Alinea con ritmo circadiano",
    beneficio: "Digestión óptima, metabolismo eficiente",
    consejo: "Salta desayuno SOLO si practicas ayuno deliberado"
  },
  "carbohidratos": {
    horario: "Después del ejercicio o almuerzo",
    razon: "Ayuda a bajar cortisol post-estrés",
    beneficio: "Repone glucógeno, relaja sistema nervioso",
    evitar: "Noche (interfiere con melatonina)"
  },
  "meditacion-relajacion": {
    horario: "10-11am, 19-20h",
    razon: "Reduce cortisol en picos moderados",
    beneficio: "Mejora enfoque (mañana), prepara sueño (noche)",
    duracion: "10-20 minutos"
  },
  "sueño": {
    horario: "22-23h (acostarse), 6-7h (despertar)",
    razon: "Ritmo circadiano óptimo",
    beneficio: "Cortisol baja naturalmente, melatonina sube",
    consejo: "Luz azul OFF desde 21h, duerme en oscuridad total"
  }
};

export const RutinaAntiCortisol = {
  "dia-bajo-estres": {
    descripcion: "Día relajado, sin presiones",
    rutina: [
      "7am: Desayuno (proteína + carbos + café 1 taza)",
      "7:30am: Caminata ligera 20min (solar, sin auriculares)",
      "10am: Snack (almendras + té verde)",
      "12pm: Almuerzo (salmón + brócoli + camote)",
      "14h: Meditación 10min o lectura relajada",
      "16h: Snack (arándanos + chocolate 70%)",
      "18h: Ejercicio ligero (yoga, natación) 30min",
      "19:30h: Cena (pollo + espinaca)",
      "21h: Magnesio + Té de manzanilla",
      "22h: Acostarse (sin pantallas)"
    ]
  },
  "dia-alto-estres": {
    descripcion: "Día con mucho trabajo/estrés",
    rutina: [
      "6:30am: Despertar (luz natural de inmediato)",
      "7am: Desayuno PROTEICO (huevo + avena + almendras)",
      "7:30am: Ejercicio INTENSO 30-45min (saca adrenalina de forma controlada)",
      "8:30am: Café 1 taza máximo (después del ejercicio)",
      "10am: Meditación 15min (mindfulness, respiración)",
      "12:30pm: Almuerzo (salmón + carbos complejos)",
      "15h: Snack anti-cortisol (arándanos + almendras)",
      "17h: PAUSA trabajo, té verde + 10min meditación",
      "19h: Cena (pollo + espinaca + aguacate)",
      "20h: Magnesio sublingual + sin pantallas",
      "21h: Lectura o baño caliente",
      "22h: Acostarse (cortinas completamente cerradas)"
    ]
  },
  "fin-de-semana-recuperacion": {
    descripcion: "Reset y recuperación completa",
    rutina: [
      "Dormir según necesidad (sin alarma)",
      "Desayuno lento (no correr)",
      "Actividad placentera (hobby, amigos)",
      "2 comidas principales anti-cortisol",
      "Ejercicio ligero o estiramientos (no competitivo)",
      "Tiempo en naturaleza 30min (parque, playa)",
      "Sin trabajo, sin redes sociales después de 20h",
      "Dormir 1h más que entre semana"
    ]
  }
};

export const SupplementosAntiCortisol = {
  "magnesio": {
    dosis: "200-400mg/día",
    horario: "Noche (30min antes dormir)",
    razon: "Relaja músculos, baja cortisol nocturno",
    efectoSemanas: "3-5 semanas"
  },
  "omega3": {
    dosis: "1-2g EPA/DHA/día",
    horario: "Con comidas principales",
    razon: "Anti-inflamatorio, reduce cortisol crónico",
    efectoSemanas: "4-8 semanas"
  },
  "ashwagandha": {
    dosis: "300-600mg/día",
    horario: "Mañana o noche",
    razon: "Adaptógeno, reduce ansiedad y cortisol",
    efectoSemanas: "6-8 semanas"
  },
  "rhodiola": {
    dosis: "200-600mg/día",
    horario: "Mañana (estimulante)",
    razon: "Mejora estrés físico y mental",
    efectoSemanas: "2-4 semanas"
  },
  "L-theanine": {
    dosis: "100-200mg",
    horario: "Cuando estrés agudo (con o sin café)",
    razon: "Calma sin somnolencia",
    efectoSemanas: "Inmediato (30-60min)"
  }
};
