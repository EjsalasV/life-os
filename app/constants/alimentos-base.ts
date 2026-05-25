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

  "ceviche-250g": {
    id: "ceviche-250g",
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
  },

  // Más alimentos LATAM
  "ceviche": {
    id: "ceviche",
    nombre: "Ceviche (porción 250g)",
    calorias: 145,
    proteina: 26,
    carbohidratos: 3,
    grasas: 1.5,
    fibra: 0.8,
    vitaminas: {
      "C": 35,
      "B12": 2.5,
      "B3": 8
    },
    minerales: {
      "Selenio": 45,
      "Zinc": 2.5,
      "Potasio": 420
    },
    compatibilidad: ["limon", "cilantro", "cebolla"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 96
    }
  },

  "encebollado": {
    id: "encebollado",
    nombre: "Encebollado (porción 300g)",
    calorias: 180,
    proteina: 28,
    carbohidratos: 8,
    grasas: 3,
    fibra: 1,
    vitaminas: {
      "C": 15,
      "B12": 2,
      "B6": 0.5
    },
    minerales: {
      "Hierro": 1.8,
      "Potasio": 450,
      "Magnesio": 40
    },
    compatibilidad: ["aji", "cilantro", "platano"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 92
    }
  },

  "causa limeña": {
    id: "causa limeña",
    nombre: "Causa Limeña (porción 200g)",
    calorias: 220,
    proteina: 12,
    carbohidratos: 18,
    grasas: 10,
    fibra: 2,
    vitaminas: {
      "C": 20,
      "B3": 1.5,
      "A": 280
    },
    minerales: {
      "Potasio": 380,
      "Magnesio": 35,
      "Zinc": 1
    },
    compatibilidad: ["limon", "pollo", "huevo"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 85
    }
  },

  "lomo saltado": {
    id: "lomo saltado",
    nombre: "Lomo Saltado (porción 300g)",
    calorias: 380,
    proteina: 35,
    carbohidratos: 28,
    grasas: 12,
    fibra: 2,
    vitaminas: {
      "B12": 2,
      "B6": 0.8,
      "Niacina": 7
    },
    minerales: {
      "Hierro": 3,
      "Zinc": 6,
      "Potasio": 520
    },
    compatibilidad: ["cebolla", "tomate", "aji"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 94
    }
  },

  "mofongo": {
    id: "mofongo",
    nombre: "Mofongo (porción 200g)",
    calorias: 280,
    proteina: 8,
    carbohidratos: 35,
    grasas: 12,
    fibra: 3,
    vitaminas: {
      "C": 18,
      "B6": 0.4,
      "K": 10
    },
    minerales: {
      "Potasio": 450,
      "Magnesio": 32,
      "Cobre": 0.3
    },
    compatibilidad: ["ajo", "cebolla", "tomate"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 80
    }
  },

  "arroz con pollo": {
    id: "arroz con pollo",
    nombre: "Arroz con Pollo (porción 300g)",
    calorias: 320,
    proteina: 22,
    carbohidratos: 38,
    grasas: 6,
    fibra: 2,
    vitaminas: {
      "A": 120,
      "B3": 5,
      "C": 12
    },
    minerales: {
      "Hierro": 2,
      "Zinc": 2,
      "Potasio": 380
    },
    compatibilidad: ["cerveza", "platano", "ensalada"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 88
    }
  },

  "chilaquiles": {
    id: "chilaquiles",
    nombre: "Chilaquiles (porción 250g)",
    calorias: 350,
    proteina: 14,
    carbohidratos: 35,
    grasas: 16,
    fibra: 3,
    vitaminas: {
      "C": 20,
      "A": 180,
      "B6": 0.3
    },
    minerales: {
      "Calcio": 280,
      "Zinc": 2,
      "Potasio": 320
    },
    compatibilidad: ["queso", "huevo", "salsa verde"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 82
    }
  },

  "tamales": {
    id: "tamales",
    nombre: "Tamal (1 unidad 150g)",
    calorias: 240,
    proteina: 9,
    carbohidratos: 32,
    grasas: 8,
    fibra: 2,
    vitaminas: {
      "B1": 0.15,
      "B3": 2,
      "A": 100
    },
    minerales: {
      "Magnesio": 45,
      "Fósforo": 140,
      "Potasio": 280
    },
    compatibilidad: ["cafe", "atole", "salsa"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 75
    }
  },

  "empanada": {
    id: "empanada",
    nombre: "Empanada (1 unidad 120g)",
    calorias: 280,
    proteina: 10,
    carbohidratos: 28,
    grasas: 14,
    fibra: 1,
    vitaminas: {
      "A": 150,
      "B6": 0.2,
      "C": 5
    },
    minerales: {
      "Hierro": 1.5,
      "Zinc": 1.5,
      "Calcio": 80
    },
    compatibilidad: ["salsa picante", "limon"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 78
    }
  },

  "pupusa": {
    id: "pupusa",
    nombre: "Pupusa (1 unidad 100g)",
    calorias: 220,
    proteina: 9,
    carbohidratos: 24,
    grasas: 10,
    fibra: 1.5,
    vitaminas: {
      "B1": 0.12,
      "B3": 1.5,
      "A": 120
    },
    minerales: {
      "Calcio": 250,
      "Hierro": 1.2,
      "Magnesio": 30
    },
    compatibilidad: ["curtido", "salsa tomada"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 80
    }
  },

  "picadillo": {
    id: "picadillo",
    nombre: "Picadillo (porción 200g)",
    calorias: 280,
    proteina: 22,
    carbohidratos: 20,
    grasas: 12,
    fibra: 2,
    vitaminas: {
      "C": 15,
      "B6": 0.4,
      "A": 180
    },
    minerales: {
      "Hierro": 2.5,
      "Zinc": 3,
      "Potasio": 380
    },
    compatibilidad: ["platano", "arroz", "frijoles"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 90
    }
  },

  "ropa vieja": {
    id: "ropa vieja",
    nombre: "Ropa Vieja (porción 250g)",
    calorias: 240,
    proteina: 28,
    carbohidratos: 15,
    grasas: 8,
    fibra: 2,
    vitaminas: {
      "C": 35,
      "B12": 1.5,
      "B6": 0.5
    },
    minerales: {
      "Hierro": 3.5,
      "Zinc": 4,
      "Potasio": 450
    },
    compatibilidad: ["arroz", "black beans", "platano"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 92
    }
  },

  "tostadas": {
    id: "tostadas",
    nombre: "Tostadas (2 unidades 80g)",
    calorias: 180,
    proteina: 5,
    carbohidratos: 24,
    grasas: 7,
    fibra: 1.5,
    vitaminas: {
      "B1": 0.1,
      "B3": 1,
      "A": 80
    },
    minerales: {
      "Hierro": 1,
      "Calcio": 120,
      "Magnesio": 25
    },
    compatibilidad: ["guacamole", "refresco"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 75
    }
  },

  "enchiladas": {
    id: "enchiladas",
    nombre: "Enchiladas (2 unidades 200g)",
    calorias: 320,
    proteina: 15,
    carbohidratos: 32,
    grasas: 14,
    fibra: 2,
    vitaminas: {
      "C": 20,
      "A": 200,
      "B3": 2.5
    },
    minerales: {
      "Calcio": 320,
      "Hierro": 2,
      "Zinc": 1.5
    },
    compatibilidad: ["sour cream", "queso", "pollo"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 85
    }
  },

  "tacos al pastor": {
    id: "tacos al pastor",
    nombre: "Tacos Al Pastor (3 tacos 180g)",
    calorias: 420,
    proteina: 24,
    carbohidratos: 38,
    grasas: 18,
    fibra: 2,
    vitaminas: {
      "C": 25,
      "B6": 0.5,
      "A": 150
    },
    minerales: {
      "Hierro": 3,
      "Zinc": 4,
      "Potasio": 420
    },
    compatibilidad: ["pina", "cilantro", "cebolla"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 89
    }
  },

  "cevicheria chaufa": {
    id: "cevicheria chaufa",
    nombre: "Ceviche Chaufa (porción 280g)",
    calorias: 320,
    proteina: 32,
    carbohidratos: 25,
    grasas: 8,
    fibra: 2,
    vitaminas: {
      "C": 28,
      "B12": 2.8,
      "B6": 0.6
    },
    minerales: {
      "Selenio": 50,
      "Zinc": 3,
      "Hierro": 2
    },
    compatibilidad: ["aji amarillo", "limon", "cilantro"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 95
    }
  },

  "choclo cocido": {
    id: "choclo cocido",
    nombre: "Choclo Cocido (100g)",
    calorias: 86,
    proteina: 3.2,
    carbohidratos: 15,
    grasas: 1.2,
    fibra: 2.3,
    vitaminas: {
      "C": 5,
      "B1": 0.15,
      "B9": 46
    },
    minerales: {
      "Magnesio": 37,
      "Fósforo": 89,
      "Potasio": 290
    },
    compatibilidad: ["queso fresco", "sal"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 80
    }
  },

  "platano maduro frito": {
    id: "platano maduro frito",
    nombre: "Plátano Maduro Frito (100g)",
    calorias: 270,
    proteina: 1,
    carbohidratos: 32,
    grasas: 14,
    fibra: 2.6,
    vitaminas: {
      "C": 8,
      "B6": 0.4,
      "A": 40
    },
    minerales: {
      "Potasio": 358,
      "Magnesio": 27,
      "Manganeso": 0.3
    },
    compatibilidad: ["queso", "crema", "frijoles"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 85
    }
  },

  "camote cocido": {
    id: "camote cocido",
    nombre: "Camote Cocido (100g)",
    calorias: 86,
    proteina: 1.6,
    carbohidratos: 20,
    grasas: 0.1,
    fibra: 3,
    vitaminas: {
      "A": 900,
      "C": 2.4,
      "B6": 0.28
    },
    minerales: {
      "Potasio": 337,
      "Magnesio": 25,
      "Manganeso": 0.26
    },
    compatibilidad: ["limon", "ajo"],
    indices: {
      indiceInflamatorio: -2,
      biodisponibilidad: 88
    }
  },

  "frijoles negros": {
    id: "frijoles negros",
    nombre: "Frijoles Negros (100g)",
    calorias: 132,
    proteina: 8.9,
    carbohidratos: 24,
    grasas: 0.5,
    fibra: 8.7,
    vitaminas: {
      "B1": 0.42,
      "B9": 149,
      "B6": 0.12
    },
    minerales: {
      "Hierro": 2.4,
      "Magnesio": 60,
      "Zinc": 1.9
    },
    compatibilidad: ["arroz", "cebolla", "ajo"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 75
    }
  },

  "frijoles refritos": {
    id: "frijoles refritos",
    nombre: "Frijoles Refritos (150g)",
    calorias: 180,
    proteina: 9,
    carbohidratos: 28,
    grasas: 3,
    fibra: 8,
    vitaminas: {
      "B1": 0.3,
      "B9": 120,
      "A": 50
    },
    minerales: {
      "Hierro": 2.2,
      "Calcio": 150,
      "Magnesio": 55
    },
    compatibilidad: ["tortilla", "queso", "salsa"],
    indices: {
      indiceInflamatorio: -1,
      biodisponibilidad: 78
    }
  },

  "chiles rellenos": {
    id: "chiles rellenos",
    nombre: "Chile Relleno (1 unidad 200g)",
    calorias: 280,
    proteina: 14,
    carbohidratos: 22,
    grasas: 14,
    fibra: 3,
    vitaminas: {
      "C": 120,
      "A": 380,
      "B6": 0.35
    },
    minerales: {
      "Calcio": 420,
      "Potasio": 350,
      "Magnesio": 45
    },
    compatibilidad: ["tomate", "queso", "huevo"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 86
    }
  },

  "quesadilla": {
    id: "quesadilla",
    nombre: "Quesadilla (1 unidad 120g)",
    calorias: 280,
    proteina: 12,
    carbohidratos: 28,
    grasas: 14,
    fibra: 2,
    vitaminas: {
      "A": 240,
      "B1": 0.15,
      "C": 8
    },
    minerales: {
      "Calcio": 380,
      "Hierro": 1.5,
      "Zinc": 1.8
    },
    compatibilidad: ["salsa", "cebolla", "epazote"],
    indices: {
      indiceInflamatorio: 1,
      biodisponibilidad: 82
    }
  },

  "burrito": {
    id: "burrito",
    nombre: "Burrito (1 unidad 250g)",
    calorias: 420,
    proteina: 18,
    carbohidratos: 48,
    grasas: 16,
    fibra: 6,
    vitaminas: {
      "C": 20,
      "A": 180,
      "B3": 3
    },
    minerales: {
      "Hierro": 3,
      "Zinc": 3,
      "Magnesio": 65
    },
    compatibilidad: ["salsa picante", "guacamole", "crema"],
    indices: {
      indiceInflamatorio: 0,
      biodisponibilidad: 84
    }
  },

  "tres leches": {
    id: "tres leches",
    nombre: "Pastel Tres Leches (100g)",
    calorias: 320,
    proteina: 6,
    carbohidratos: 42,
    grasas: 14,
    fibra: 0.2,
    vitaminas: {
      "A": 180,
      "D": 40,
      "B12": 0.5
    },
    minerales: {
      "Calcio": 180,
      "Fósforo": 140,
      "Potasio": 150
    },
    compatibilidad: [],
    indices: {
      indiceInflamatorio: 2,
      biodisponibilidad: 72
    }
  },

  "flan": {
    id: "flan",
    nombre: "Flan (100g)",
    calorias: 220,
    proteina: 5,
    carbohidratos: 32,
    grasas: 8,
    fibra: 0,
    vitaminas: {
      "A": 220,
      "D": 50,
      "B12": 0.6
    },
    minerales: {
      "Calcio": 120,
      "Fósforo": 110,
      "Selenio": 15
    },
    compatibilidad: [],
    indices: {
      indiceInflamatorio: 1,
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
