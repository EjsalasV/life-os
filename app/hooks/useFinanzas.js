"use client";

import { db } from '@/lib/firebase';
import {
  doc, collection, addDoc, updateDoc, deleteDoc,
  increment, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { safeMonto } from '../utils/helpers';
import { getMovimientosCol } from '@/lib/firebase-refs';

export default function useFinanzas(ctx) {
  const {
    user, cuentas, setModalOpen, setFinanceForm, setProductForm,
    setHealthForm, setErrorMsg, updateStreakExternal, movimientos,
    productos, setPosForm
  } = ctx || {};

  const isPro = user?.plan === 'pro';
  const docRef = (col, id) => doc(db, 'users', user.uid, col, id);

  const handleSave = async (col, financeForm, productForm, healthForm) => {
    if (!user) return;
    try {
      if (col === 'productos' && !productForm.id) {
        if (!isPro && productos.length >= 5) throw new Error("Límite de 5 productos alcanzado. ¡Mejora a PRO! 🚀");
      }
      if (col === 'cuentas' && !isPro && cuentas.length >= 2) throw new Error("Límite de 2 cuentas alcanzado. 🏦");

      if (col === 'productos') {
        const stockFinal = Math.max(0, parseInt(productForm.stock) || 0);
        if (productForm.id) {
          if (!isPro) throw new Error("La edición es función PRO 💎");
          await updateDoc(docRef('productos', productForm.id), {
            nombre: productForm.nombre, precioVenta: safeMonto(productForm.precioVenta),
            costo: safeMonto(productForm.costo), stock: stockFinal
          });
        } else {
          await addDoc(collection(db, 'users', user.uid, 'productos'), {
            nombre: productForm.nombre, precioVenta: safeMonto(productForm.precioVenta),
            costo: safeMonto(productForm.costo), stock: stockFinal, timestamp: serverTimestamp()
          });
        }
      } else if (col === 'movimientos') {
        const valor = safeMonto(financeForm.monto);
        const esGasto = financeForm.tipo === 'GASTO';
        await updateDoc(docRef('cuentas', financeForm.cuentaId), { monto: increment(esGasto ? -valor : valor) });
        await addDoc(getMovimientosCol(user.uid), {
          ...financeForm, monto: valor, timestamp: new Date(),
          cuentaNombre: cuentas.find(c => c.id === financeForm.cuentaId)?.nombre || 'General'
        });
        if (esGasto) await updateStreakExternal();
      } else if (col === 'transferencia') {
        // Nueva lógica para transferencias
        const valor = safeMonto(financeForm.monto);
        if (!financeForm.cuentaDestinoId) throw new Error("Selecciona cuenta destino");

        // Restar de cuenta origen
        await updateDoc(docRef('cuentas', financeForm.cuentaId), { monto: increment(-valor) });
        // Sumar a cuenta destino
        await updateDoc(docRef('cuentas', financeForm.cuentaDestinoId), { monto: increment(valor) });

        // Registrar movimiento
        await addDoc(getMovimientosCol(user.uid), {
          nombre: `Transferencia: ${financeForm.nombre || 'Sin descripción'}`,
          monto: valor,
          tipo: 'TRANSFERENCIA',
          categoria: 'otros',
          cuentaId: financeForm.cuentaId,
          cuentaDestinoId: financeForm.cuentaDestinoId,
          cuentaNombre: cuentas.find(c => c.id === financeForm.cuentaId)?.nombre || 'Origen',
          timestamp: new Date()
        });
      } else if (col === 'cuentas') {
        await addDoc(collection(db, 'users', user.uid, 'cuentas'), {
          nombre: financeForm.nombre, monto: safeMonto(financeForm.monto), timestamp: serverTimestamp()
        });
      } else if (col === 'fijos') {
        // Nueva lógica para gastos fijos
        await addDoc(collection(db, 'users', user.uid, 'fijos'), {
          nombre: financeForm.nombre,
          monto: safeMonto(financeForm.monto),
          periodicidad: financeForm.periodicidad || 'Mensual',
          diaCobro: financeForm.diaCobro || '1',
          timestamp: serverTimestamp()
        });
      } else if (col === 'metas') {
        // Nueva lógica para metas de ahorro
        await addDoc(collection(db, 'users', user.uid, 'metas'), {
          nombre: financeForm.nombre,
          montoObjetivo: safeMonto(financeForm.monto),
          montoActual: 0,
          timestamp: serverTimestamp()
        });
      } else if (col === 'ahorroMeta') {
        // Agregar ahorro a una meta existente
        if (!financeForm.id) throw new Error("Meta no especificada");
        const metaRef = docRef('metas', financeForm.id);
        const valor = safeMonto(financeForm.monto);

        await updateDoc(metaRef, { montoActual: increment(valor) });
        await updateDoc(docRef('cuentas', financeForm.cuentaId), { monto: increment(-valor) });

        await addDoc(getMovimientosCol(user.uid), {
          nombre: `Ahorro: ${financeForm.nombre}`,
          monto: valor,
          tipo: 'GASTO',
          categoria: 'otros',
          cuentaId: financeForm.cuentaId,
          cuentaNombre: cuentas.find(c => c.id === financeForm.cuentaId)?.nombre || 'General',
          timestamp: new Date()
        });
      } else if (col === 'presupuestos') {
        // Nueva lógica para presupuestos
        await addDoc(collection(db, 'users', user.uid, 'presupuestos'), {
          categoria: financeForm.categoria || 'otros',
          limite: safeMonto(financeForm.limite || financeForm.monto),
          timestamp: serverTimestamp()
        });
      } else if (col === 'peso') {
        if (!isPro) throw new Error("Seguimiento de peso es función PRO 💎");
        await addDoc(collection(db, 'users', user.uid, 'peso'), { peso: safeMonto(healthForm.peso), timestamp: serverTimestamp() });
      }

      setModalOpen(null);
      setErrorMsg("Guardado con éxito ✅");
    } catch (e) { setErrorMsg(e.message, "error"); }
  };

  // --- FUNCIONES DE ADMINISTRACIÓN PARA ERICK ---

  const handleTogglePlan = async () => {
    if (!user) return;
    try {
      const nuevoPlan = user.plan === 'pro' ? 'free' : 'pro';
      await updateDoc(doc(db, 'users', user.uid), { plan: nuevoPlan });
      setErrorMsg(`Plan cambiado a ${nuevoPlan.toUpperCase()} 🔄`);
    } catch (e) { setErrorMsg("Error al cambiar plan", "error"); }
  };

  const handleUpdateName = async (nuevoNombre) => {
    if (!user || !nuevoNombre) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: nuevoNombre });
      setErrorMsg("Nombre actualizado ✅");
    } catch (e) { setErrorMsg("Error al actualizar nombre", "error"); }
  };

  const deleteItem = async (col, item) => {
    if (!user || !item?.id) return;
    try {
      if (col === 'ventas') {
        if (!isPro) throw new Error("Anular tickets es función PRO 💎");
        const batch = writeBatch(db);
        if (item.cuentaId) batch.update(docRef('cuentas', item.cuentaId), { monto: increment(-item.total) });
        if (item.items) for (const p of item.items) batch.update(docRef('productos', p.id), { stock: increment(p.cantidad) });
        const mov = movimientos.find(m => m.ventaRefId === item.id);
        if (mov) batch.delete(docRef('movimientos', mov.id));
        batch.delete(docRef('ventas', item.id));
        await batch.commit();
        setErrorMsg("Venta anulada 🗑️");
        return;
      }
      await deleteDoc(docRef(col, item.id));
      setErrorMsg("Eliminado correctamente 🗑️");
    } catch (e) { setErrorMsg(e.message, "error"); }
  };

  return { handleSave, deleteItem, handleTogglePlan, handleUpdateName };
}