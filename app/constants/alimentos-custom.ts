export interface AlimentoCustom {
  id: string;
  nombre: string;
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasas: number;
  createdAt: string;
}

const STORAGE_KEY = 'alimentos-custom';

export const getAlimentosCustom = (): AlimentoCustom[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveAlimentoCustom = (
  alimento: Omit<AlimentoCustom, 'id' | 'createdAt'>
): AlimentoCustom => {
  const custom = getAlimentosCustom();
  const nuevo: AlimentoCustom = {
    ...alimento,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...custom, nuevo]));
  return nuevo;
};
