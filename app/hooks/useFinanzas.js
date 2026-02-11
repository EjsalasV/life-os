import { db } from '@/lib/firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { safeMonto } from '../utils/helpers';
import { getMovimientosCol } from '@/lib/firebase-refs';

export default function useFinanzas(ctx) {
  const { 
    user, 
    cuentas, 
    presupuestos, 
    setModalOpen, 
    setFinanceForm, 
    setErrorMsg, 
    updateStreakExternal,
    movimientos // Necesario para buscar referencias en el borrado
  } = ctx || {};

  const docRef = (col, id) => doc(db, 'users', user.uid, col, id);

  const handleSave = async (col, financeForm, productForm, healthForm) => {
    if (!user) return;
    try {
      if (col === 'cuentas') {
        await addDoc(collection(db, 'users', user.uid, 'cuentas'), { 
          nombre: financeForm.nombre, 
          monto: safeMonto(financeForm.monto), 
          timestamp: serverTimestamp() 
        });
      } else if (col === 'movimientos') {
        const valor = safeMonto(financeForm.monto);
        const esGasto = financeForm.tipo === 'GASTO';
        const esTransferencia = financeForm.tipo === 'TRANSFERENCIA';

        if (esTransferencia) {
          if (!financeForm.cuentaId || !financeForm.cuentaDestinoId) throw new Error("Selecciona ambas cuentas");
          await updateDoc(docRef('cuentas', financeForm.cuentaId), { monto: increment(-valor) });
          await updateDoc(docRef('cuentas', financeForm.cuentaDestinoId), { monto: increment(valor) });
        } else {
          await updateDoc(docRef('cuentas', financeForm.cuentaId), { monto: increment(esGasto ? -valor : valor) });
        }

        await addDoc(getMovimientosCol(user.uid), {
          ...financeForm,
          monto: valor,
          timestamp: serverTimestamp(),
          cuentaNombre: cuentas.find(c => c.id === financeForm.cuentaId)?.nombre || 'General'
        });
        
        if (esGasto) await updateStreakExternal();
      } else if (col === 'fijos') {
        await addDoc(collection(db, 'users', user.uid, 'fijos'), { 
          ...financeForm, 
          monto: safeMonto(financeForm.monto), 
          timestamp: serverTimestamp() 
        });
      }
      
      setModalOpen(null);
      setFinanceForm({ nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros' });
      setErrorMsg("Guardado correctamente ✅");
    } catch (e) {
      setErrorMsg("Error al guardar: " + e.message);
    }
  };

  const handleAhorroMeta = async (selectedMeta, financeForm) => {
    if (!user || !selectedMeta || !financeForm.monto || !financeForm.cuentaId) {
      setErrorMsg("Faltan datos para el ahorro");
      return;
    }
    const valor = safeMonto(financeForm.monto);
    try {
      await updateDoc(docRef('cuentas', financeForm.cuentaId), { monto: increment(-valor) });
      await updateDoc(docRef('metas', selectedMeta.id), { montoActual: increment(valor) });
      await addDoc(getMovimientosCol(user.uid), { 
        nombre: `Ahorro: ${selectedMeta.nombre}`, 
        monto: valor, 
        tipo: 'GASTO', 
        cuentaId: financeForm.cuentaId, 
        cuentaNombre: cuentas.find(c => c.id === financeForm.cuentaId)?.nombre, 
        categoria: 'otros', 
        timestamp: serverTimestamp() 
      });
      setModalOpen(null);
      setErrorMsg("Ahorro registrado 🎯");
    } catch (e) {
      setErrorMsg("Error: " + e.message);
    }
  };

  const deleteItem = async (col, item) => {
    if (!user) return;
    try {
      if (col === 'movimientos') {
        if (item.ventaRefId) {
          setErrorMsg("⚠️ Debes borrar esto desde la pestaña de Negocio");
          return;
        }
        if (item.cuentaId) {
          const cuentaRef = docRef('cuentas', item.cuentaId);
          const cuentaSnap = await getDoc(cuentaRef);
          if (cuentaSnap.exists()) {
            if (item.tipo === 'TRANSFERENCIA' && item.cuentaDestinoId) {
              await updateDoc(cuentaRef, { monto: increment(item.monto) });
              await updateDoc(docRef('cuentas', item.cuentaDestinoId), { monto: increment(-item.monto) });
            } else {
              await updateDoc(cuentaRef, { monto: increment(item.tipo === 'INGRESO' ? -item.monto : item.monto) });
            }
          }
        }
      }
      
      if (col === 'ventas') {
        if (item.cuentaId) {
          const ref = docRef('cuentas', item.cuentaId);
          const snap = await getDoc(ref);
          if (snap.exists()) await updateDoc(ref, { monto: increment(-item.total) });
        }
        if (item.items) {
          for (const p of item.items) {
            await updateDoc(docRef('productos', p.id), { stock: increment(p.cantidad) });
          }
        }
        const mov = movimientos.find(m => m.ventaRefId === item.id);
        if (mov) await deleteDoc(docRef('movimientos', mov.id));
      }

      await deleteDoc(docRef(col, item.id));
      setErrorMsg("Eliminado correctamente 🗑️");
    } catch (e) {
      setErrorMsg("Error al eliminar: " + e.message);
    }
  };

  const saveBudget = async (category, financeForm) => {
    if (!user || !category) return;
    try {
      const budgetRef = doc(db, 'users', user.uid, 'presupuestos', category.id);
      await setDoc(budgetRef, { 
        categoriaId: category.id, 
        limite: safeMonto(financeForm.limite), 
        timestamp: serverTimestamp() 
      });
      setModalOpen(null);
      setErrorMsg("Presupuesto actualizado 📈");
    } catch (e) {
      setErrorMsg("Error: " + e.message);
    }
  };

  const handleImport = async (data, col) => {
    // Lógica de importación mantenida igual
  };

  return { handleSave, saveBudget, handleImport, handleAhorroMeta, deleteItem };
}