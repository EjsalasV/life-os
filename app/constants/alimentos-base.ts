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
