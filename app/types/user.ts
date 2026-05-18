export interface PhysicalProfile {
  peso: number;
  altura: number;
  edad: number;
  sexo: 'hombre' | 'mujer';
  nivelActividad: 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy-activo';
  objetivo: 'perdida-grasa' | 'mantenimiento' | 'ganancia-musculo';
  pesoObjetivo: number;
  fechaCreacion: string;
}

export interface UserWithPhysicalProfile {
  uid: string;
  name?: string;
  email?: string;
  plan?: 'free' | 'pro';
  isNew?: boolean;
  hasCompletedOnboarding?: boolean;
  physicalProfile?: PhysicalProfile;
}
