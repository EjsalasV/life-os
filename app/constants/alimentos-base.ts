export const AlimentosBase = {
  // Proteínas
  "pollo-pecho": {
    id: "pollo-pecho",
    nombre: "Pecho de Pollo (100g)",
    calorias: 165,
    proteina: 31,
    carbohidratos: 0,
    grasas: 3.6,
    fibra: 0,
    vitaminas: {
      "B6": 0.9,
      "B12": 0.3,
      "Niacina": 8.5
    },
    minerales: {
      "Hierro": 0.9,
      "Fósforo": 200,
      "Selenio": 27
    },
    compatibilidad: ["vitamina-c", "hierro-vegetales"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 95
    }
  },

  "huevo": {
    id: "huevo",
    nombre: "Huevo Grande (1 unidad)",
    calorias: 155,
    proteina: 13,
    carbohidratos: 1.1,
    grasas: 11,
    fibra: 0,
    vitaminas: {
      "Colina": 147,
      "Luteína": 147,
      "B7": 33
    },
    minerales: {
      "Hierro": 1.2,
      "Fósforo": 99,
      "Zinc": 0.6
    },
    compatibilidad: ["vegetales"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 97
    }
  },

  "salmon": {
    id: "salmon",
    nombre: "Salmón (100g)",
    calorias: 206,
    proteina: 22,
    carbohidratos: 0,
    grasas: 13,
    fibra: 0,
    vitaminas: {
      "D": 570,
      "B12": 3.2,
      "Omega-3": 2260
    },
    minerales: {
      "Selenio": 36,
      "Potasio": 363
    },
    compatibilidad: ["vegetales-verdes", "limon"],
    indices: {
      indiceInflamatorio: -2,
      biodisponibilidad: 94
    }
  },

  // Carbohidratos
  "avena": {
    id: "avena",
    nombre: "Avena Cocida (100g)",
    calorias: 150,
    proteina: 2.4,
    carbohidratos: 27,
    grasas: 2.7,
    fibra: 8,
    vitaminas: {
      "B1": 0.3,
      "B5": 1.1
    },
    minerales: {
      "Manganeso": 2.2,
      "Fósforo": 180,
      "Hierro": 4.3
    },
    compatibilidad: ["proteinas", "frutas"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 85
    }
  },

  "arroz-integral": {
    id: "arroz-integral",
    nombre: "Arroz Integral Cocido (100g)",
    calorias: 111,
    proteina: 2.6,
    carbohidratos: 23,
    grasas: 0.9,
    fibra: 1.8,
    vitaminas: {
      "B1": 0.1,
      "B3": 1.5
    },
    minerales: {
      "Manganeso": 1.8,
      "Magnesio": 43
    },
    compatibilidad: ["proteinas", "vegetales"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 80
    }
  },

  "platano": {
    id: "platano",
    nombre: "Plátano Mediano (118g)",
    calorias: 105,
    proteina: 1.3,
    carbohidratos: 27,
    grasas: 0.3,
    fibra: 3.1,
    vitaminas: {
      "B6": 0.4,
      "C": 8.7,
      "Folato": 20
    },
    minerales: {
      "Potasio": 358,
      "Manganeso": 0.3
    },
    compatibilidad: ["proteinas", "mantequilla-almendras"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 90
    }
  },

  // Grasas Saludables
  "aguacate": {
    id: "aguacate",
    nombre: "Aguacate (100g)",
    calorias: 160,
    proteina: 2,
    carbohidratos: 9,
    grasas: 15,
    fibra: 7,
    vitaminas: {
      "K": 21,
      "E": 1.3,
      "Folato": 81
    },
    minerales: {
      "Potasio": 485,
      "Cobre": 0.2
    },
    compatibilidad: ["limon", "vegetales", "tomate"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 92
    }
  },

  "frutos-secos": {
    id: "frutos-secos",
    nombre: "Almendras (30g / 23 almendras)",
    calorias: 164,
    proteina: 6,
    carbohidratos: 6,
    grasas: 14,
    fibra: 3.5,
    vitaminas: {
      "E": 25.6,
      "B7": 14.7
    },
    minerales: {
      "Magnesio": 76,
      "Calcio": 76,
      "Zinc": 2.1
    },
    compatibilidad: ["frutas", "chocolate-amargo"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 88
    }
  },

  // Vegetales
  "brocoli": {
    id: "brocoli",
    nombre: "Brócoli Cocido (100g)",
    calorias: 34,
    proteina: 2.8,
    carbohidratos: 7,
    grasas: 0.4,
    fibra: 2.4,
    vitaminas: {
      "C": 89,
      "K": 102,
      "A": 623
    },
    minerales: {
      "Calcio": 47,
      "Hierro": 0.7,
      "Manganeso": 0.2
    },
    compatibilidad: ["aceite-oliva", "ajo", "limon"],
    indices: {
      indiceInflamatorio: -2,
      biodisponibilidad: 85
    }
  },

  "espinaca": {
    id: "espinaca",
    nombre: "Espinaca Cruda (100g)",
    calorias: 23,
    proteina: 2.7,
    carbohidratos: 3.6,
    grasas: 0.4,
    fibra: 2.7,
    vitaminas: {
      "K": 483,
      "A": 9377,
      "C": 28
    },
    minerales: {
      "Hierro": 2.7,
      "Calcio": 99,
      "Magnesio": 79
    },
    compatibilidad: ["vitamina-c", "aceite-oliva"],
    indices: {
      indiceInflamatorio: -2,
      biodisponibilidad: 90
    }
  },

  "zanahoria": {
    id: "zanahoria",
    nombre: "Zanahoria Cruda (100g)",
    calorias: 41,
    proteina: 0.9,
    carbohidratos: 10,
    grasas: 0.2,
    fibra: 2.8,
    vitaminas: {
      "A": 8286,
      "K": 13.2,
      "C": 5.5
    },
    minerales: {
      "Potasio": 320,
      "Manganeso": 0.2
    },
    compatibilidad: ["aceite", "proteinas"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 80
    }
  },

  // Frutas
  "manzana": {
    id: "manzana",
    nombre: "Manzana Mediana (182g)",
    calorias: 95,
    proteina: 0.5,
    carbohidratos: 25,
    grasas: 0.3,
    fibra: 4.4,
    vitaminas: {
      "C": 5.7,
      "K": 4.6
    },
    minerales: {
      "Potasio": 195
    },
    compatibilidad: ["almendras", "chocolate-amargo"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 92
    }
  },

  "arándanos": {
    id: "arándanos",
    nombre: "Arándanos (100g)",
    calorias: 57,
    proteina: 0.7,
    carbohidratos: 14,
    grasas: 0.3,
    fibra: 2.4,
    vitaminas: {
      "C": 9.7,
      "K": 19.3
    },
    minerales: {
      "Manganeso": 0.3
    },
    compatibilidad: ["yogur", "avena"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 95
    }
  },

  // Productos Procesados
  "pan-blanco": {
    id: "pan-blanco",
    nombre: "Pan Blanco (1 rebanada 28g)",
    calorias: 79,
    proteina: 2.3,
    carbohidratos: 14,
    grasas: 1,
    fibra: 0.6,
    vitaminas: {},
    minerales: {},
    compatibilidad: [],
    indices: {
      indiceInflamatorio: 3,
      biodisponibilidad: 70
    }
  },

  "refresco": {
    id: "refresco",
    nombre: "Refresco Azucarado (355ml)",
    calorias: 140,
    proteina: 0,
    carbohidratos: 39,
    grasas: 0,
    fibra: 0,
    vitaminas: {},
    minerales: {},
    compatibilidad: [],
    indices: {
      indiceInflamatorio: 5,
      biodisponibilidad: 100
    }
  },

  "hamburguesa-rapida": {
    id: "hamburguesa-rapida",
    nombre: "Hamburguesa de Comida Rápida",
    calorias: 540,
    proteina: 25,
    carbohidratos: 45,
    grasas: 29,
    fibra: 2,
    vitaminas: {},
    minerales: {},
    compatibilidad: [],
    indices: {
      indiceInflamatorio: 4,
      biodisponibilidad: 75
    }
  },

  // ==================== ALIMENTOS TÍPICOS LATAM ====================
  "salchipapa": {
    id: "salchipapa",
    nombre: "Salchipapa (porción de 200g)",
    calorias: 420,
    proteina: 12,
    carbohidratos: 48,
    grasas: 18,
    fibra: 3,
    vitaminas: {
      "B1": 0.15,
      "B6": 0.35,
      "C": 12
    },
    minerales: {
      "Potasio": 450,
      "Hierro": 1.5,
      "Magnesio": 35
    },
    compatibilidad: ["vegetales", "salsa-aji"],
    indices: {
      indiceInflamatorio: 2,
      biodisponibilidad: 75
    }
  },

  "papa-frita": {
    id: "papa-frita",
    nombre: "Papas Fritas (100g)",
    calorias: 365,
    proteina: 3.4,
    carbohidratos: 48,
    grasas: 17,
    fibra: 4.2,
    vitaminas: {
      "B1": 0.1,
      "B6": 0.3,
      "C": 19
    },
    minerales: {
      "Potasio": 567,
      "Magnesio": 23,
      "Hierro": 0.8
    },
    compatibilidad: ["salsa-aji", "queso"],
    indices: {
      indiceInflamatorio: 2,
      biodisponibilidad: 78
    }
  },

  "papa-a-la-huancaina": {
    id: "papa-a-la-huancaina",
    nombre: "Papa a la Huancaína (porción 250g)",
    calorias: 285,
    proteina: 8,
    carbohidratos: 38,
    grasas: 12,
    fibra: 4,
    vitaminas: {
      "B1": 0.12,
      "B6": 0.28,
      "C": 15,
      "A": 450
    },
    minerales: {
      "Potasio": 520,
      "Calcio": 120,
      "Hierro": 1.2
    },
    compatibilidad: ["queso", "aji-amarillo"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 82
    }
  },

  "ceviche": {
    id: "ceviche",
    nombre: "Ceviche de Pescado (porción 200g)",
    calorias: 130,
    proteina: 24,
    carbohidratos: 6,
    grasas: 1.5,
    fibra: 1,
    vitaminas: {
      "B12": 3,
      "B3": 8,
      "C": 25,
      "A": 150
    },
    minerales: {
      "Hierro": 2,
      "Zinc": 2.5,
      "Selenio": 35,
      "Potasio": 380
    },
    compatibilidad: ["limon", "tomate", "cebolla"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 95
    }
  },

  "arepa": {
    id: "arepa",
    nombre: "Arepa (1 unidad de 70g)",
    calorias: 155,
    proteina: 3.5,
    carbohidratos: 28,
    grasas: 2.5,
    fibra: 2,
    vitaminas: {
      "B1": 0.08,
      "B3": 2.5
    },
    minerales: {
      "Magnesio": 45,
      "Hierro": 1.5,
      "Zinc": 0.5
    },
    compatibilidad: ["queso", "carnes", "aguacate"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 80
    }
  },

  "tamal": {
    id: "tamal",
    nombre: "Tamal Tradicional (1 unidad 150g)",
    calorias: 280,
    proteina: 10,
    carbohidratos: 35,
    grasas: 12,
    fibra: 2,
    vitaminas: {
      "B1": 0.15,
      "B6": 0.25,
      "A": 200
    },
    minerales: {
      "Potasio": 280,
      "Magnesio": 40,
      "Calcio": 80
    },
    compatibilidad: ["chocolate-caliente", "cafe"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 75
    }
  },

  "locro": {
    id: "locro",
    nombre: "Locro (porción 300g)",
    calorias: 220,
    proteina: 14,
    carbohidratos: 28,
    grasas: 6,
    fibra: 5,
    vitaminas: {
      "B1": 0.2,
      "B6": 0.35,
      "C": 18,
      "A": 350
    },
    minerales: {
      "Hierro": 2.5,
      "Potasio": 480,
      "Calcio": 100,
      "Magnesio": 50
    },
    compatibilidad: ["queso", "pan"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 85
    }
  },

  "choclo-cocido": {
    id: "choclo-cocido",
    nombre: "Choclo Cocido (100g)",
    calorias: 86,
    proteina: 3.2,
    carbohidratos: 19,
    grasas: 1.2,
    fibra: 2.7,
    vitaminas: {
      "B1": 0.2,
      "B3": 1.7,
      "C": 7,
      "A": 250
    },
    minerales: {
      "Potasio": 270,
      "Magnesio": 37,
      "Fósforo": 89,
      "Hierro": 0.5
    },
    compatibilidad: ["queso", "mantequilla", "aji"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 82
    }
  },

  "yuca-cocida": {
    id: "yuca-cocida",
    nombre: "Yuca Cocida (100g)",
    calorias: 160,
    proteina: 1.2,
    carbohidratos: 38,
    grasas: 0.3,
    fibra: 2.4,
    vitaminas: {
      "B1": 0.1,
      "B6": 0.1,
      "C": 40
    },
    minerales: {
      "Potasio": 271,
      "Manganeso": 0.2,
      "Magnesio": 21
    },
    compatibilidad: ["aji", "salsa-picante"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 80
    }
  },

  "aji-rojo": {
    id: "aji-rojo",
    nombre: "Ají Rojo (100g)",
    calorias: 31,
    proteina: 1,
    carbohidratos: 6,
    grasas: 0.3,
    fibra: 1.3,
    vitaminas: {
      "C": 128,
      "A": 3100,
      "E": 1.6
    },
    minerales: {
      "Potasio": 322,
      "Hierro": 0.6,
      "Magnesio": 12
    },
    compatibilidad: ["cebolla", "tomate", "ajo"],
    indices: {
      indiceInflamatorio: -2,
      biodisponibilidad: 88
    }
  },

  "aji-amarillo": {
    id: "aji-amarillo",
    nombre: "Ají Amarillo (100g)",
    calorias: 40,
    proteina: 1.5,
    carbohidratos: 7,
    grasas: 0.4,
    fibra: 1.5,
    vitaminas: {
      "C": 130,
      "A": 2800,
      "E": 1.8
    },
    minerales: {
      "Potasio": 310,
      "Hierro": 0.7,
      "Magnesio": 15
    },
    compatibilidad: ["ceviche", "papa-a-la-huancaina", "pollo"],
    indices: {
      indiceInflamatorio: -2,
      biodisponibilidad: 90
    }
  },

  "quinua-cocida": {
    id: "quinua-cocida",
    nombre: "Quinua Cocida (100g)",
    calorias: 120,
    proteina: 4.4,
    carbohidratos: 21,
    grasas: 2,
    fibra: 2.8,
    vitaminas: {
      "B1": 0.2,
      "B2": 0.3,
      "B9": 78
    },
    minerales: {
      "Magnesio": 64,
      "Hierro": 2.8,
      "Zinc": 1.2,
      "Manganeso": 0.6
    },
    compatibilidad: ["vegetales", "proteinas", "frutas"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 93
    }
  },

  "platano-maduro-frito": {
    id: "platano-maduro-frito",
    nombre: "Plátano Maduro Frito (100g)",
    calorias: 270,
    proteina: 1,
    carbohidratos: 32,
    grasas: 14,
    fibra: 2,
    vitaminas: {
      "B6": 0.4,
      "C": 8,
      "A": 50
    },
    minerales: {
      "Potasio": 340,
      "Manganeso": 0.2
    },
    compatibilidad: ["queso", "carnes", "huevos"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 85
    }
  },

  "camote-cocido": {
    id: "camote-cocido",
    nombre: "Camote Cocido (100g)",
    calorias: 86,
    proteina: 1.6,
    carbohidratos: 20,
    grasas: 0.1,
    fibra: 3,
    vitaminas: {
      "A": 9100,
      "C": 2.4,
      "B6": 0.3
    },
    minerales: {
      "Potasio": 337,
      "Manganeso": 0.3,
      "Magnesio": 25
    },
    compatibilidad: ["especias", "proteinas"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 87
    }
  },

  "frijoles-negros": {
    id: "frijoles-negros",
    nombre: "Frijoles Negros Cocidos (100g)",
    calorias: 132,
    proteina: 8.9,
    carbohidratos: 24,
    grasas: 0.5,
    fibra: 8.7,
    vitaminas: {
      "B1": 0.4,
      "B9": 149,
      "A": 2
    },
    minerales: {
      "Hierro": 2.1,
      "Magnesio": 70,
      "Zinc": 1.6,
      "Potasio": 218
    },
    compatibilidad: ["arroz", "ajo", "cebolla"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 85
    }
  },

  "gallo-pinto": {
    id: "gallo-pinto",
    nombre: "Gallo Pinto (porción 200g)",
    calorias: 260,
    proteina: 9,
    carbohidratos: 42,
    grasas: 4,
    fibra: 6,
    vitaminas: {
      "B1": 0.25,
      "B9": 120,
      "A": 100
    },
    minerales: {
      "Hierro": 2.5,
      "Magnesio": 65,
      "Potasio": 350
    },
    compatibilidad: ["huevo", "platano", "queso"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 88
    }
  }
};

export const MetasNutricionalesDefault = {
  proteinaGramos: 150,
  carbohidratosGramos: 225,
  grasasGramos: 65,
  fibra: 30,
  caloriasTotales: 2000,
  vitaminasMinimas: {
    "B12": 2.4,
    "D": 600,
    "C": 75,
    "A": 700,
    "E": 15
  },
  mineralesMinimos: {
    "Calcio": 1000,
    "Hierro": 18,
    "Zinc": 11,
    "Magnesio": 320,
    "Potasio": 3400
  }
};
