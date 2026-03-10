// app/hooks/useFinanzas.ts
"use client";

import { db } from '@/lib/firebase';
import {
    doc, collection, addDoc, updateDoc, deleteDoc,
    increment, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { safeMonto } from '../utils/helpers';
import { getMovimientosCol } from '@/lib/firebase-refs';
import type {
    FirebaseUser, Cuenta, Movimiento, Producto, FinanceForm,
    ProductForm, HealthForm, Venta
} from '@/app/types';
import { validateData, schemas } from '@/app/schemas';

interface UseFinanzasContext {
    user: FirebaseUser | null;
    cuentas: Cuenta[];
    setModalOpen: (modal: any) => void;
    setFinanceForm: (form: any) => void;
    setProductForm: (form: any) => void;
    setHealthForm: (form: any) => void;
    setErrorMsg: (msg: string, type?: 'success' | 'error' | 'info') => void;
    updateStreakExternal: () => Promise<boolean>;
    movimientos: Movimiento[];
    productos: Producto[];
    setPosForm: (form: any) => void;
}

export default function useFinanzas(ctx: UseFinanzasContext) {
    const {
        user, cuentas, setModalOpen, setFinanceForm, setProductForm,
        setHealthForm, setErrorMsg, updateStreakExternal, movimientos,
        productos, setPosForm
    } = ctx;

    const isPro = user?.plan === 'pro';
    const docRef = (col: string, id: string) => doc(db, 'users', user!.uid, col, id);

    const handleSave = async (
        col: string,
        financeForm: FinanceForm,
        productForm: ProductForm,
        healthForm: HealthForm
    ): Promise<void> => {
        if (!user) return;

        try {
            // Validaciones de límites de plan
            if (col === 'productos' && !productForm.id) {
                if (!isPro && productos.length >= 5) {
                    throw new Error("Límite de 5 productos alcanzado. ¡Mejora a PRO! 🚀");
                }
            }
            if (col === 'cuentas' && !isPro && cuentas.length >= 2) {
                throw new Error("Límite de 2 cuentas alcanzado. 🏦");
            }

            // Guardar producto
            if (col === 'productos') {
                // Validar con Zod - DEBE ser exitosa
                const validation = validateData(schemas.producto, productForm);
                if (!validation.success) {
                    throw new Error(`Validación de producto falló: ${JSON.stringify(validation.errors)}`);
                }

                const stockFinal = Math.max(0, parseInt(productForm.stock) || 0);

                if (productForm.id) {
                    if (!isPro) throw new Error("La edición es función PRO 💎");
                    await updateDoc(docRef('productos', productForm.id), {
                        nombre: productForm.nombre,
                        precioVenta: safeMonto(productForm.precioVenta),
                        costo: safeMonto(productForm.costo),
                        stock: stockFinal
                    });
                } else {
                    await addDoc(collection(db, 'users', user.uid, 'productos'), {
                        nombre: productForm.nombre,
                        precioVenta: safeMonto(productForm.precioVenta),
                        costo: safeMonto(productForm.costo),
                        stock: stockFinal,
                        timestamp: serverTimestamp()
                    });
                }
            }

            // Guardar movimiento
            else if (col === 'movimientos') {
                // Validar con Zod - DEBE ser exitosa
                const validation = validateData(schemas.movimiento, financeForm);
                if (!validation.success) {
                    throw new Error(`Validación de movimiento falló: ${JSON.stringify(validation.errors)}`);
                }

                const valor = safeMonto(financeForm.monto);
                const esGasto = financeForm.tipo === 'GASTO';

                await updateDoc(docRef('cuentas', financeForm.cuentaId), {
                    monto: increment(esGasto ? -valor : valor)
                });

                await addDoc(getMovimientosCol(user.uid), {
                    ...financeForm,
                    monto: valor,
                    timestamp: new Date(),
                    cuentaNombre: cuentas.find(c => c.id === financeForm.cuentaId)?.nombre || 'General'
                });

                if (esGasto) await updateStreakExternal();
            }

            // Guardar cuenta
            else if (col === 'cuentas') {
                const validation = validateData(schemas.cuenta, financeForm);
                if (!validation.success) {
                    const firstError = Object.values(validation.errors)[0];
                    throw new Error(firstError);
                }

                await addDoc(collection(db, 'users', user.uid, 'cuentas'), {
                    nombre: financeForm.nombre,
                    monto: safeMonto(financeForm.monto),
                    timestamp: serverTimestamp()
                });
            }

            // Guardar peso
            else if (col === 'peso') {
                if (!isPro) throw new Error("Seguimiento de peso es función PRO 💎");

                const validation = validateData(schemas.peso, healthForm);
                if (!validation.success) {
                    const firstError = Object.values(validation.errors)[0];
                    throw new Error(firstError);
                }

                await addDoc(collection(db, 'users', user.uid, 'peso'), {
                    peso: safeMonto(healthForm.peso),
                    timestamp: serverTimestamp()
                });
            }

            // Guardar fijo
            else if (col === 'fijos') {
                await addDoc(collection(db, 'users', user.uid, 'fijos'), {
                    nombre: financeForm.nombre,
                    monto: safeMonto(financeForm.monto),
                    periodicidad: financeForm.periodicidad || 'Mensual',
                    diaCobro: financeForm.diaCobro || '1',
                    cuentaId: financeForm.cuentaId,
                    timestamp: serverTimestamp()
                });
            }

            // Guardar meta
            else if (col === 'metas') {
                await addDoc(collection(db, 'users', user.uid, 'metas'), {
                    nombre: financeForm.nombre,
                    montoObjetivo: safeMonto(financeForm.monto),
                    montoActual: 0,
                    timestamp: serverTimestamp()
                });
            }

            // Guardar presupuesto
            else if (col === 'presupuestos') {
                await addDoc(collection(db, 'users', user.uid, 'presupuestos'), {
                    categoria: financeForm.categoria || 'otros',
                    limite: safeMonto(financeForm.limite),
                    timestamp: serverTimestamp()
                });
            }

            // Guardar hábito
            else if (col === 'habitos') {
                await addDoc(collection(db, 'users', user.uid, 'habitos'), {
                    nombre: healthForm.nombre,
                    frecuencia: healthForm.frecuencia || 'Diario',
                    iconType: healthForm.iconType || 'pill',
                    timestamp: serverTimestamp()
                });
            }

            // Transferencia entre cuentas
            else if (col === 'transferencia') {
                const monto = safeMonto(financeForm.monto);
                if (!financeForm.cuentaId || !financeForm.cuentaDestinoId) {
                    throw new Error("Selecciona ambas cuentas");
                }
                if (financeForm.cuentaId === financeForm.cuentaDestinoId) {
                    throw new Error("No puedes transferir a la misma cuenta");
                }

                // Restar de cuenta origen
                await updateDoc(docRef('cuentas', financeForm.cuentaId), {
                    monto: increment(-monto)
                });

                // Sumar a cuenta destino
                await updateDoc(docRef('cuentas', financeForm.cuentaDestinoId), {
                    monto: increment(monto)
                });

                // Registrar movimiento de transferencia
                await addDoc(getMovimientosCol(user.uid), {
                    nombre: `Transferencia: ${cuentas.find(c => c.id === financeForm.cuentaId)?.nombre} → ${cuentas.find(c => c.id === financeForm.cuentaDestinoId)?.nombre}`,
                    monto: monto,
                    tipo: 'TRANSFERENCIA',
                    cuentaId: financeForm.cuentaId,
                    cuentaDestinoId: financeForm.cuentaDestinoId,
                    timestamp: new Date()
                });
            }

            // Ahorro a meta
            else if (col === 'ahorroMeta') {
                const monto = safeMonto(financeForm.monto);
                if (!financeForm.cuentaId) {
                    throw new Error("Selecciona una cuenta");
                }

                // Obtener la meta seleccionada desde el contexto
                // La meta ID debe venir en financeForm o como parámetro adicional
                const metaId = (financeForm as any).metaId;
                if (!metaId) {
                    throw new Error("No se seleccionó una meta");
                }

                // Restar de cuenta
                await updateDoc(docRef('cuentas', financeForm.cuentaId), {
                    monto: increment(-monto)
                });

                // Sumar a meta
                await updateDoc(docRef('metas', metaId), {
                    montoActual: increment(monto)
                });

                // Registrar movimiento
                await addDoc(getMovimientosCol(user.uid), {
                    nombre: `Ahorro a meta`,
                    monto: monto,
                    tipo: 'AHORRO_META',
                    cuentaId: financeForm.cuentaId,
                    metaId: metaId,
                    timestamp: new Date()
                });
            }

            setModalOpen(null);
            setErrorMsg("Guardado con éxito ✅");
        } catch (e: any) {
            setErrorMsg(e.message, "error");
        }
    };

    // --- FUNCIONES DE ADMINISTRACIÓN ---

    const handleTogglePlan = async (): Promise<void> => {
        if (!user) return;
        try {
            const nuevoPlan = user.plan === 'pro' ? 'free' : 'pro';
            await updateDoc(doc(db, 'users', user.uid), { plan: nuevoPlan });
            setErrorMsg(`Plan cambiado a ${nuevoPlan.toUpperCase()} 🔄`);
        } catch (e: any) {
            setErrorMsg("Error al cambiar plan", "error");
        }
    };

    const handleUpdateName = async (nuevoNombre: string): Promise<void> => {
        if (!user || !nuevoNombre) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), { name: nuevoNombre });
            setErrorMsg("Nombre actualizado ✅");
        } catch (e: any) {
            setErrorMsg("Error al actualizar nombre", "error");
        }
    };

    const deleteItem = async (col: string, item: any): Promise<void> => {
        if (!user || !item?.id) return;

        try {
            if (col === 'ventas') {
                if (!isPro) throw new Error("Anular tickets es función PRO 💎");

                const venta = item as Venta;
                const batch = writeBatch(db);

                if (venta.cuentaId) {
                    batch.update(docRef('cuentas', venta.cuentaId), {
                        monto: increment(-venta.total)
                    });
                }

                if (venta.items) {
                    for (const p of venta.items) {
                        batch.update(docRef('productos', p.id), {
                            stock: increment(p.cantidad)
                        });
                    }
                }

                const mov = movimientos.find(m => (m as any).ventaRefId === item.id);
                if (mov) {
                    batch.delete(docRef('movimientos', mov.id));
                }

                batch.delete(docRef('ventas', item.id));
                await batch.commit();
                setErrorMsg("Venta anulada 🗑️");
                return;
            }

            await deleteDoc(docRef(col, item.id));
            setErrorMsg("Eliminado correctamente 🗑️");
        } catch (e: any) {
            setErrorMsg(e.message, "error");
        }
    };

    // Placeholder for handleImport (not migrated yet)
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // TODO: Implement Excel import logic
        console.log('Import not implemented yet');
    };

    return {
        handleSave,
        deleteItem,
        handleTogglePlan,
        handleUpdateName,
        handleImport
    };
}
