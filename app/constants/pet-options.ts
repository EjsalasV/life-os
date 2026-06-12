// Opciones de personalización visual del pet (vocabulario de PixelPet).
// Antes vivían en usePetStore; la personalización ahora se guarda en
// el campo `apariencia` del pet principal (users/{uid}/pet/main).

export type PetVisualTipo = "gato" | "gatoCafe" | "gatoBlanco" | "perro" | "dragon" | "alienigena" | "robot";
export type PetRarity = "comun" | "raro" | "epico" | "legendario";
export type PetAccessory = "sombrero" | "gafas" | "corona" | "moño";

export const PET_COLOR_OPTIONS = [
  "#3b82f6",
  "#ef4444",
  "#eab308",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#94a3b8"
];

export const PET_TYPE_OPTIONS: Array<{ id: PetVisualTipo; label: string }> = [
  { id: "gato", label: "Gato" },
  { id: "gatoCafe", label: "Gato Café" },
  { id: "gatoBlanco", label: "Gato Blanco" },
  { id: "perro", label: "Perro" },
  { id: "dragon", label: "Dragón" },
  { id: "alienigena", label: "Alienígena" },
  { id: "robot", label: "Robot" }
];

export const PET_ACCESSORY_OPTIONS: Array<{ id: PetAccessory; label: string }> = [
  { id: "sombrero", label: "Sombrero" },
  { id: "gafas", label: "Gafas" },
  { id: "corona", label: "Corona" },
  { id: "moño", label: "Moño" }
];

export const PET_RARITY_OPTIONS: Array<{ id: PetRarity; label: string }> = [
  { id: "comun", label: "Común" },
  { id: "raro", label: "Raro" },
  { id: "epico", label: "Épico" },
  { id: "legendario", label: "Legendario" }
];
