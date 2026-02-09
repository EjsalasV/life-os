import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { safeMonto, getTodayKey } from '../utils/helpers';

export default function useFinanzas(ctx) {
  const { 
    user, cuentas, presupuestos, setModalOpen, 
    setFinanceForm, setErrorMsg, updateStreakExternal 
  } = ctx || {};

  const handleSave = async (col, financeForm, productForm, healthForm) => {
    if (!user) return;
    const batch = writeBatch(db);

    try {
      if (col === 'movimientos') {
        const { monto, tipo, cuentaId, cuentaDestinoId } = financeForm;
        const valor = safeMonto(monto);

        // 🚦 SEMÁFORO: Validación de monto
        if (valor <= 0) { 
          setErrorMsg && setErrorMsg("¡Oye! El monto debe ser mayor a 0 💰"); 
          return; 
        }

        const movRef = doc(collection(db, 'users', user.uid, 'movimientos'));

        if (tipo === 'TRANSFERENCIA') {
          if (!cuentaId || !cuentaDestinoId) { 
            setErrorMsg && setErrorMsg("Selecciona ambas cuentas para transferir 🔄"); 
            return; 
          }
          batch.update(doc(db, 'users', user.uid, 'cuentas', cuentaId), { monto: increment(-valor) });
          batch.update(doc(db, 'users', user.uid, 'cuentas', cuentaDestinoId), { monto: increment(valor) });
          batch.set(movRef, { 
            nombre: `Transf: ${cuentas.find(c=>c.id===cuentaId).nombre} -> ${cuentas.find(c=>c.id===cuentaDestinoId).nombre}`, 
            monto: valor, tipo: 'TRANSFERENCIA', cuentaId, cuentaDestinoId, timestamp: serverTimestamp() 
          });
        } else {
          if (!cuentaId) { setErrorMsg && setErrorMsg("Selecciona una cuenta 🏦"); return; }
          const nSaldo = tipo === 'INGRESO' ? increment(valor) : increment(-valor);
          batch.update(doc(db, 'users', user.uid, 'cuentas', cuentaId), { monto: nSaldo });
          batch.set(movRef, { ...financeForm, monto: valor, timestamp: serverTimestamp(), cuentaNombre: cuentas.find(c => c.id === cuentaId)?.nombre || 'Cuenta' });
        }
        updateStreakExternal && updateStreakExternal();
      } else {
        // Para otros como productos, pesaje, etc.
        const ref = doc(collection(db, 'users', user.uid, col));
        const data = col === 'productos' ? { ...productForm, precioVenta: safeMonto(productForm.precioVenta), costo: safeMonto(productForm.costo), stock: safeMonto(productForm.stock) } : { ...financeForm, monto: safeMonto(financeForm.monto) };
        batch.set(ref, { ...data, timestamp: serverTimestamp() });
      }

      await batch.commit();
      setFinanceForm && setFinanceForm({ nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' });
      setModalOpen && setModalOpen(null);
    } catch (e) { setErrorMsg && setErrorMsg("Error: " + e.message); }
  };

  return { handleSave };
}