import type { Timestamp } from "firebase/firestore";

export interface Producto { id: string; nombre: string; precioVenta: number; costo: number; stock: number; timestamp: Timestamp; }
export interface ItemVenta { id: string; nombre: string; cantidad: number; precioUnitario: number; subtotal: number; }
export interface Venta { id: string; cliente: string; items: ItemVenta[]; total: number; cuentaId: string; timestamp: Timestamp; }
export interface ItemCarrito extends ItemVenta { stock: number; }
export interface ProductForm { originalStock?: number; id?: string; nombre: string; precioVenta: string; costo: string; stock: string; }
export interface PosForm { cliente: string; cuentaId: string; id: string | null; }
