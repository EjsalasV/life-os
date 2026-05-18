export type InventarioCategoria =
  | 'proteina'
  | 'vegetal'
  | 'fruta'
  | 'carbohidrato'
  | 'lacteo'
  | 'bebida'
  | 'condimento'
  | 'otro';

export type InventarioUnidad = 'g' | 'ml' | 'unidad' | 'porcion';

export interface InventarioItem {
  id: string;
  nombre: string;
  categoria: InventarioCategoria;
  cantidad: number;
  unidad: InventarioUnidad;
  fechaAgregado: string;
  fechaExpiracion?: string;
  precio?: number;
}

export interface Refrigerador {
  userId: string;
  items: InventarioItem[];
  ultimaActualizacion: string;
  gastoBudget?: number;
}