import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { safeMonto } from '../utils/helpers';

export default function useFinanzas(ctx) {
  const { user, cuentas, presupuestos, setModalOpen, setFinanceForm, setErrorMsg, setSelectedMeta, updateStreakExternal } = ctx || {};

  const saveBudget = async (selectedBudgetCat, financeForm) => {
    if (!selectedBudgetCat || !financeForm.limite) return;
    try {
      const existing = presupuestos.find(p => p.categoriaId === selectedBudgetCat.id);
      const limiteNum = safeMonto(financeForm.limite);
      if (existing) await updateDoc(doc(db, 'users', user.uid, 'presupuestos', existing.id), { limite: limiteNum });
      else await addDoc(collection(db, 'users', user.uid, 'presupuestos'), { categoriaId: selectedBudgetCat.id, limite: limiteNum, categoriaLabel: selectedBudgetCat.label });
      setModalOpen && setModalOpen(null); setFinanceForm && setFinanceForm({ nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' });
    } catch (e) { setErrorMsg && setErrorMsg("Error: " + e.message); }
  };

  const handleSave = async (col, financeForm, productForm, healthForm, addDocFn) => {
    if (!user) return;
    try {
      if (col === 'productos') {
        const { nombre, precioVenta, costo, stock } = productForm;
        if (!nombre || !precioVenta) { setErrorMsg && setErrorMsg("Faltan datos"); return; }
        await addDoc(collection(db, 'users', user.uid, 'productos'), { nombre, precioVenta: safeMonto(precioVenta), costo: safeMonto(costo), stock: safeMonto(stock), timestamp: serverTimestamp() });
      } else if (col === 'habitos') {
        if (!healthForm.nombre) return;
        await addDoc(collection(db, 'users', user.uid, 'habitos'), { nombre: healthForm.nombre, frecuencia: healthForm.frecuencia, iconType: healthForm.iconType || 'pill', timestamp: serverTimestamp() });
      } else if (col === 'peso') {
        if (!healthForm.peso) return;
        await addDoc(collection(db, 'users', user.uid, 'peso'), { kilos: safeMonto(healthForm.peso), fecha: getTodayKey(), timestamp: serverTimestamp() });
      } else if (col === 'movimientos') {
        const { monto, tipo, cuentaId, cuentaDestinoId } = financeForm;
        if (!monto) { setErrorMsg && setErrorMsg("Ingresa un monto"); return; }
        const valor = safeMonto(monto);
        if (tipo === 'TRANSFERENCIA') {
          if (!cuentaId || !cuentaDestinoId) { setErrorMsg && setErrorMsg("Faltan cuentas"); return; }
          await updateDoc(doc(db, 'users', user.uid, 'cuentas', cuentaId), { monto: increment(-valor) });
          await updateDoc(doc(db, 'users', user.uid, 'cuentas', cuentaDestinoId), { monto: increment(valor) });
          await addDoc(collection(db, 'users', user.uid, 'movimientos'), { nombre: `Transf: ${cuentas.find(c=>c.id===cuentaId).nombre} -> ${cuentas.find(c=>c.id===cuentaDestinoId).nombre}`, monto: valor, tipo: 'TRANSFERENCIA', cuentaId, cuentaDestinoId, timestamp: serverTimestamp() });
        } else {
          const dataToSave = { ...financeForm, monto: valor, timestamp: serverTimestamp() };
          if (cuentaId) {
            const nSaldo = tipo === 'INGRESO' ? increment(valor) : increment(-valor);
            await updateDoc(doc(db, 'users', user.uid, 'cuentas', cuentaId), { monto: nSaldo });
            dataToSave.cuentaNombre = cuentas.find(c => c.id === cuentaId)?.nombre || 'Cuenta';
          }
          await addDoc(collection(db, 'users', user.uid, col), dataToSave);
        }
        updateStreakExternal && updateStreakExternal(); setFinanceForm && setFinanceForm({ nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' });
      } else {
        await addDoc(collection(db, 'users', user.uid, col), { ...financeForm, monto: safeMonto(financeForm.monto), timestamp: serverTimestamp() });
      }
      setModalOpen && setModalOpen(null);
    } catch (e) { setErrorMsg && setErrorMsg("Error: " + e.message); }
  };

  return { saveBudget, handleSave };
}
