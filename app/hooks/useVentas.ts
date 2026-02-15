// app/hooks/useVentas.ts
"use client";

import { db } from '@/lib/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { toCents, fromCents } from '../utils/helpers';
import type { FirebaseUser, Producto, ItemCarrito, Venta, Movimiento, Cuenta, PosForm } from '@/app/types';
import { validateData, schemas } from '@/app/schemas';

interface UseVentasContext {
    user: FirebaseUser | null;
    productos: Producto[];
    carrito: ItemCarrito[];
    setCarrito: (carrito: ItemCarrito[]) => void;
    ventas: Venta[];
    cuentas: Cuenta[];
    posForm: PosForm;
    setPosForm: (form: PosForm) => void;
    setModalOpen: (modal: any) => void;
    setErrorMsg: (msg: string, type?: 'success' | 'error' | 'info') => void;
    movimientos: Movimiento[];
}

export default function useVentas(ctx: UseVentasContext) {
    const {
        user, productos, carrito, setCarrito, ventas, cuentas,
        posForm, setPosForm, setModalOpen, setErrorMsg, movimientos
    } = ctx;

    const isPro = user?.plan === 'pro';

    const handleCheckout = async (): Promise<void> => {
        if (!user) return;

        // Validación de límites SAAS
        if (!isPro && !posForm.id) {
            const ahora = new Date();
            const ventasEsteMes = ventas.filter(v => {
                const fechaVenta = v.timestamp?.toDate ? v.timestamp.toDate() : new Date();
                return fechaVenta.getMonth() === ahora.getMonth() &&
                    fechaVenta.getFullYear() === ahora.getFullYear();
            });

            if (ventasEsteMes.length >= 10) {
                setErrorMsg("Límite mensual alcanzado (10 ventas). ¡Pásate a PRO! 🚀", "error");
                return;
            }
        }

        // Validación de cuenta
        if (!posForm?.cuentaId || posForm.cuentaId === "") {
            setErrorMsg("Debes seleccionar una cuenta de destino", "error");
            return;
        }

        // Validación de carrito
        if (!posForm.id && (!carrito || carrito.length === 0)) {
            setErrorMsg("El carrito está vacío", "error");
            return;
        }

        // Validar con Zod
        const validation = validateData(schemas.venta, {
            cliente: posForm.cliente,
            cuentaId: posForm.cuentaId,
            items: carrito
        });

        if (!validation.success) {
            const firstError = Object.values(validation.errors)[0];
            setErrorMsg(firstError, "error");
            return;
        }

        setModalOpen(null);

        const batch = writeBatch(db);
        const docRef = (col: string, id: string) => doc(db, 'users', user.uid, col, id);

        try {
            if (posForm.id) {
                // Modo edición
                if (!isPro) {
                    setErrorMsg("La edición de tickets es función PRO 💎", "error");
                    return;
                }

                const ventaOriginal = ventas.find(v => v.id === posForm.id);
                const movOriginal = movimientos?.find(m => (m as any).ventaRefId === posForm.id);

                if (ventaOriginal && ventaOriginal.cuentaId !== posForm.cuentaId) {
                    batch.update(docRef('cuentas', ventaOriginal.cuentaId), { monto: increment(-ventaOriginal.total) });
                    batch.update(docRef('cuentas', posForm.cuentaId), { monto: increment(ventaOriginal.total) });
                }

                batch.update(docRef('ventas', posForm.id), {
                    cliente: posForm.cliente || "Consumidor Final",
                    cuentaId: posForm.cuentaId
                });

                if (movOriginal && ventaOriginal) {
                    batch.update(docRef('movimientos', movOriginal.id), {
                        nombre: `Venta Ticket #${(ventaOriginal as any).reciboId} (Editado)`,
                        cuentaId: posForm.cuentaId,
                        cuentaNombre: cuentas.find(c => c.id === posForm.cuentaId)?.nombre || 'Caja'
                    });
                }

                await batch.commit();
                setErrorMsg("Ticket actualizado correctamente ✅");

            } else {
                // Modo venta nueva
                let totalCents = 0;
                let costoCents = 0;

                for (const item of carrito) {
                    totalCents += (toCents(item.precioUnitario) * item.cantidad);
                    costoCents += (toCents((item as any).costo || 0) * item.cantidad);
                }

                const totalFinal = fromCents(totalCents);
                const costoFinal = fromCents(costoCents);
                const gananciaFinal = totalFinal - costoFinal;
                const reciboId = String(ventas.length + 1).padStart(4, '0');

                const nuevaVentaRef = doc(collection(db, 'users', user.uid, 'ventas'));
                const ventaId = nuevaVentaRef.id;

                batch.set(nuevaVentaRef, {
                    reciboId,
                    cliente: posForm.cliente || "Consumidor Final",
                    items: carrito,
                    total: totalFinal,
                    costoTotal: costoFinal,
                    ganancia: gananciaFinal,
                    cuentaId: posForm.cuentaId,
                    timestamp: serverTimestamp()
                });

                for (const item of carrito) {
                    batch.update(docRef('productos', item.id), { stock: increment(-item.cantidad) });
                }

                batch.update(docRef('cuentas', posForm.cuentaId), { monto: increment(totalFinal) });

                const movRef = doc(collection(db, 'users', user.uid, 'movimientos'));
                batch.set(movRef, {
                    nombre: `Venta Ticket #${reciboId}`,
                    monto: totalFinal,
                    tipo: 'INGRESO',
                    categoria: 'comida',
                    cuentaId: posForm.cuentaId,
                    cuentaNombre: cuentas.find(c => c.id === posForm.cuentaId)?.nombre || 'Caja',
                    ventaRefId: ventaId,
                    timestamp: new Date()
                });

                await batch.commit();

                setCarrito([]);
                setErrorMsg(`Venta #${reciboId} exitosa por ${totalFinal.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })} ✅`);
            }

            setPosForm?.({ cliente: '', cuentaId: '', id: null });

        } catch (e: any) {
            console.error("CHECKOUT ERROR:", e);
            setErrorMsg("No se pudo completar la operación: " + e.message, "error");
        }
    };

    const addToCart = (producto: Producto): void => {
        if (!producto || producto.stock <= 0) {
            setErrorMsg("Producto sin existencias 📦", "error");
            return;
        }

        const itemEnCarrito = carrito.find(x => x.id === producto.id);

        if (itemEnCarrito) {
            if (itemEnCarrito.cantidad >= producto.stock) {
                setErrorMsg("No hay más unidades disponibles", "error");
                return;
            }
            setCarrito(carrito.map(x =>
                x.id === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x
            ));
        } else {
            setCarrito([...carrito, {
                ...producto,
                cantidad: 1,
                precioUnitario: producto.precioVenta,
                subtotal: producto.precioVenta
            } as ItemCarrito]);
        }
    };

    const handleGenerarPedido = () => {
        // Placeholder - not implemented
        console.log('Generar pedido not implemented');
    };

    return {
        addToCart,
        handleCheckout,
        handleGenerarPedido
    };
}
