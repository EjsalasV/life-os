export const RecetasBase = {
  "pollo-brocoli-arroz": {
    id: "pollo-brocoli-arroz",
    nombre: "Pollo con Brócoli y Arroz Integral",
    descripcion: "Clásica alta en proteína, antiinflamatoria",
    ingredientes: [
      { id: "pollo-pecho", nombre: "Pecho de pollo", cantidad: 200, unidad: "g" },
      { id: "brocoli", nombre: "Brócoli", cantidad: 150, unidad: "g" },
      { id: "arroz-integral", nombre: "Arroz integral cocido", cantidad: 100, unidad: "g" },
      { id: "aceite-oliva", nombre: "Aceite de oliva", cantidad: 1, unidad: "cucharada" }
    ],
    pasos: [
      { numero: 1, instruccion: "Cocina arroz integral en agua (15-20 min)", duracion: 20 },
      { numero: 2, instruccion: "Corta brócoli en floretes y saltealo en aceite de oliva (8 min)", duracion: 8 },
      { numero: 3, instruccion: "Cocina pollo a la plancha 6-8 min de cada lado", duracion: 16 },
      { numero: 4, instruccion: "Sirve todo junto, agrega limón al gusto", duracion: 2 }
    ],
    tiempoTotal: 46,
    dificultad: "fácil",
    macros: {
      calorias: 520,
      proteina: 45,
      carbohidratos: 48,
      grasas: 11
    },
    micronutrientes: {
      vitaminaC: 89,
      hierro: 2.6,
      magnesio: 79,
      potasio: 683
    },
    beneficios: ["Anti-inflamatorio", "Alto en proteína", "Digestión fácil"],
    metas: ["ganancia-muscular", "energia", "anti-cortisol"],
    indiceInflamatorio: -1,
    impactoBateria: 25
  },

  "salmon-espinaca-aguacate": {
    id: "salmon-espinaca-aguacate",
    nombre: "Salmón con Espinaca y Aguacate",
    descripcion: "Omega-3, antiinflamatorio, reduce cortisol",
    ingredientes: [
      { id: "salmon", nombre: "Salmón", cantidad: 150, unidad: "g" },
      { id: "espinaca", nombre: "Espinaca fresca", cantidad: 100, unidad: "g" },
      { id: "aguacate", nombre: "Aguacate", cantidad: 0.5, unidad: "unidad" },
      { id: "limon", nombre: "Limón", cantidad: 0.5, unidad: "unidad" },
      { id: "aceite-oliva", nombre: "Aceite de oliva", cantidad: 1, unidad: "cucharada" }
    ],
    pasos: [
      { numero: 1, instruccion: "Cocina salmón a la plancha 4-5 min de cada lado (opcional: al horno 12 min)", duracion: 12 },
      { numero: 2, instruccion: "Saltea espinaca en aceite de oliva 2-3 minutos", duracion: 3 },
      { numero: 3, instruccion: "Corta aguacate en rebanadas finas", duracion: 2 },
      { numero: 4, instruccion: "Sirve salmón + espinaca + aguacate, exprime limón", duracion: 1 }
    ],
    tiempoTotal: 18,
    dificultad: "fácil",
    macros: {
      calorias: 420,
      proteina: 36,
      carbohidratos: 8,
      grasas: 28
    },
    micronutrientes: {
      omega3: 2260,
      vitaminaK: 483,
      vitaminaD: 570,
      magnesio: 79
    },
    beneficios: ["Reduce cortisol", "Antiinflamatorio fuerte", "Omega-3 alto"],
    metas: ["anti-cortisol", "perdida-grasa", "energia"],
    indiceInflamatorio: -3,
    impactoBateria: 28
  },

  "huevo-avena-almendras": {
    id: "huevo-avena-almendras",
    nombre: "Desayuno Power: Huevo con Avena y Almendras",
    descripcion: "Proteína + complejo, mantiene energía 4 horas",
    ingredientes: [
      { id: "huevo", nombre: "Huevo grande", cantidad: 2, unidad: "unidad" },
      { id: "avena", nombre: "Avena integral", cantidad: 50, unidad: "g" },
      { id: "frutos-secos", nombre: "Almendras", cantidad: 30, unidad: "g" },
      { id: "platano", nombre: "Plátano", cantidad: 0.5, unidad: "unidad" },
      { id: "canela", nombre: "Canela", cantidad: 0.5, unidad: "cucharadita" }
    ],
    pasos: [
      { numero: 1, instruccion: "Cocina avena con agua 5 minutos, revolviendo", duracion: 5 },
      { numero: 2, instruccion: "Fríe 2 huevos en aceite de coco (3-4 min)", duracion: 4 },
      { numero: 3, instruccion: "Corta plátano y mezcla con avena cocida", duracion: 2 },
      { numero: 4, instruccion: "Sirve todo junto, agrega almendras picadas y canela", duracion: 1 }
    ],
    tiempoTotal: 12,
    dificultad: "muy-fácil",
    macros: {
      calorias: 480,
      proteina: 22,
      carbohidratos: 50,
      grasas: 19
    },
    micronutrientes: {
      magnesio: 155,
      vitamina E: 25,
      potasio: 553,
      fibraTotal: 10.5
    },
    beneficios: ["Energía sostenida", "Reduce cortisol", "Saciante"],
    metas: ["ganancia-muscular", "energia", "anti-cortisol"],
    indiceInflamatorio: 0,
    impactoBateria: 30
  },

  "tuna-ensalada": {
    id: "tuna-ensalada",
    nombre: "Ensalada de Atún Anti-inflamatoria",
    descripcion: "Almuerzo rápido, bajo en calorías, alto en proteína",
    ingredientes: [
      { id: "atun", nombre: "Atún enlatado en agua", cantidad: 150, unidad: "g" },
      { id: "espinaca", nombre: "Espinaca", cantidad: 100, unidad: "g" },
      { id: "zanahoria", nombre: "Zanahoria", cantidad: 50, unidad: "g" },
      { id: "tomate", nombre: "Tomate", cantidad: 100, unidad: "g" },
      { id: "limon", nombre: "Limón", cantidad: 0.5, unidad: "unidad" },
      { id: "aceite-oliva", nombre: "Aceite de oliva", cantidad: 1, unidad: "cucharada" }
    ],
    pasos: [
      { numero: 1, instruccion: "Lava y pica espinaca, zanahoria y tomate", duracion: 5 },
      { numero: 2, instruccion: "Escurre atún y coloca en un tazón", duracion: 1 },
      { numero: 3, instruccion: "Mezcla atún + verduras + aceite de oliva + limón", duracion: 2 },
      { numero: 4, instruccion: "Sirve inmediatamente, sin dejar reposar", duracion: 1 }
    ],
    tiempoTotal: 9,
    dificultad: "muy-fácil",
    macros: {
      calorias: 280,
      proteina: 38,
      carbohidratos: 12,
      grasas: 8
    },
    micronutrientes: {
      selenio: 36,
      hierro: 3.2,
      vitaminaC: 50,
      potasio: 470
    },
    beneficios: ["Proteína ultra alta", "Bajo en calorías", "Rápido de preparar"],
    metas: ["perdida-grasa", "ganancia-muscular"],
    indiceInflamatorio: 0,
    impactoBateria: 22
  },

  "batido-proteina": {
    id: "batido-proteina",
    nombre: "Batido Anti-Cortisol Power",
    descripcion: "Bebida nutritiva, magnesio + proteína, 2 minutos",
    ingredientes: [
      { id: "platano", nombre: "Plátano", cantidad: 1, unidad: "unidad" },
      { id: "almendras", nombre: "Almendras molidas", cantidad: 30, unidad: "g" },
      { id: "yogur-griego", nombre: "Yogur griego", cantidad: 150, unidad: "g" },
      { id: "arándanos", nombre: "Arándanos", cantidad: 80, unidad: "g" },
      { id: "miel", nombre: "Miel", cantidad: 1, unidad: "cucharada" }
    ],
    pasos: [
      { numero: 1, instruccion: "Añade plátano, almendras, yogur y arándanos a la licuadora", duracion: 1 },
      { numero: 2, instruccion: "Licúa por 30-45 segundos", duracion: 1 },
      { numero: 3, instruccion: "Vierte en vaso, añade miel opcional", duracion: 1 }
    ],
    tiempoTotal: 3,
    dificultad: "muy-fácil",
    macros: {
      calorias: 380,
      proteina: 20,
      carbohidratos: 48,
      grasas: 12
    },
    micronutrientes: {
      magnesio: 106,
      vitamina C: 35,
      antioxidantes: "muy-alto"
    },
    beneficios: ["Magnesio alto", "Reduce cortisol", "Antioxidantes"],
    metas: ["anti-cortisol", "energia"],
    indiceInflamatorio: -1,
    impactoBateria: 26
  },

  "pecho-camote": {
    id: "pecho-camote",
    nombre: "Pollo con Camote: Recuperación Post-Entrenamiento",
    descripcion: "Carbos + proteína, repone glucógeno muscular",
    ingredientes: [
      { id: "pollo-pecho", nombre: "Pecho de pollo", cantidad: 200, unidad: "g" },
      { id: "camote", nombre: "Camote cocido", cantidad: 150, unidad: "g" },
      { id: "espinaca", nombre: "Espinaca", cantidad: 80, unidad: "g" },
      { id: "aceite-oliva", nombre: "Aceite de oliva", cantidad: 1, unidad: "cucharada" }
    ],
    pasos: [
      { numero: 1, instruccion: "Cocina camote entero 20-25 min (horno 200°C)", duracion: 25 },
      { numero: 2, instruccion: "Cocina pollo a plancha 6 min c/lado", duracion: 12 },
      { numero: 3, instruccion: "Saltea espinaca en aceite de oliva", duracion: 3 },
      { numero: 4, instruccion: "Corta camote y sirve todo junto", duracion: 2 }
    ],
    tiempoTotal: 42,
    dificultad: "fácil",
    macros: {
      calorias: 550,
      proteina: 44,
      carbohidratos: 65,
      grasas: 10
    },
    micronutrientes: {
      vitaminaA: 10000,
      potasio: 750,
      fibra: 9
    },
    beneficios: ["Recuperación muscular", "Carbos complejos", "Vitamina A alta"],
    metas: ["ganancia-muscular", "energia", "post-entrenamiento"],
    indiceInflamatorio: 0,
    impactoBateria: 32
  }
};

export const ObjetivosNutricionales = {
  "ganancia-muscular": {
    nombre: "Ganancia Muscular",
    proteina: { min: 1.6, max: 2.2 },
    carbohidratos: { min: 4, max: 7 },
    grasas: { min: 0.8, max: 1.2 },
    descripcion: "Alto en proteína para síntesis muscular"
  },
  "perdida-grasa": {
    nombre: "Pérdida de Grasa",
    proteina: { min: 1.8, max: 2.2 },
    carbohidratos: { min: 2, max: 4 },
    grasas: { min: 0.8, max: 1.2 },
    descripcion: "Proteína alta, carbos moderados"
  },
  "anti-cortisol": {
    nombre: "Anti-Cortisol",
    proteina: { min: 1.4, max: 1.8 },
    carbohidratos: { min: 4, max: 6 },
    grasas: { min: 1, max: 1.4 },
    descripcion: "Balance para reducir estrés y cortisol"
  },
  "energia": {
    nombre: "Máxima Energía",
    proteina: { min: 1.2, max: 1.6 },
    carbohidratos: { min: 5, max: 8 },
    grasas: { min: 0.8, max: 1.2 },
    descripcion: "Carbos altos para rendimiento"
  }
};

export const TiemposPreparacion = {
  "rapido": { max: 10, label: "< 10 min" },
  "moderado": { max: 25, label: "10-25 min" },
  "lento": { max: 999, label: "> 25 min" }
};
