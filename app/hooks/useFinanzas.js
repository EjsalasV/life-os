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
      } else if (col === 'cuentas') {
        await addDoc(collection(db, 'users', user.uid, 'cuentas'), { 
          nombre: financeForm.nombre, monto: safeMonto(financeForm.monto), timestamp: serverTimestamp() 
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