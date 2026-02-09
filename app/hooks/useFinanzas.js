import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { safeMonto, getTodayKey } from '../utils/helpers';

export default function useFinanzas(ctx) {
  const { 
    user, cuentas, presupuestos, setModalOpen, 
    setFinanceForm, setErrorMsg, updateStreakExternal 
  } = ctx || {};

  const saveBudget = async (selectedBudgetCat, financeForm) => {
    if (!selectedBudgetCat || !financeForm.limite) return;
    const batch = writeBatch(db);

    try {
      const existing = presupuestos.find(p => p.categoriaId === selectedBudgetCat.id);
      const limiteNum = safeMonto(financeForm.limite);
      
      if (existing) {
        const budgetRef = doc(db, 'users', user.uid, 'presupuestos', existing.id);
        batch.update(budgetRef, { limite: limiteNum });
      } else {
        const newBudgetRef = doc(collection(db, 'users', user.uid, 'presupuestos'));
        batch.set(newBudgetRef, { 
          categoriaId: selectedBudgetCat.id, 
          limite: limiteNum, 
          categoriaLabel: selectedBudgetCat.label 
        });
      }

      await batch.commit();
      setModalOpen && setModalOpen(null); 
      setFinanceForm && setFinanceForm({ nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' });
    } catch (e) { 
      setErrorMsg && setErrorMsg("Error al guardar presupuesto: " + e.message); 
    }
  };

  const handleSave = async (col, financeForm, productForm, healthForm) => {
    if (!user) return;
    const batch = writeBatch(db);

    try {
      if (col === 'productos') {
        const { nombre, precioVenta, costo, stock } = productForm;
        if (!nombre || !precioVenta) { setErrorMsg && setErrorMsg("Faltan datos"); return; }
        const prodRef = doc(collection(db, 'users', user.uid, 'productos'));
        batch.set(prodRef, { 
          nombre, 
          precioVenta: safeMonto(precioVenta), 
          costo: safeMonto(costo), 
          stock: safeMonto(stock), 
          timestamp: serverTimestamp() 
        });

      } else if (col === 'habitos') {
        if (!healthForm.nombre) return;
        const habitRef = doc(collection(db, 'users', user.uid, 'habitos'));
        batch.set(habitRef, { 
          nombre: healthForm.nombre, 
          frecuencia: healthForm.frecuencia, 
          iconType: healthForm.iconType || 'pill', 
          timestamp: serverTimestamp() 
        });

      } else if (col === 'peso') {
        if (!healthForm.peso) return;
        const pesoRef = doc(collection(db, 'users', user.uid, 'peso'));
        batch.set(pesoRef, { 
          kilos: safeMonto(healthForm.peso), 
          fecha: getTodayKey(), 
          timestamp: serverTimestamp() 
        });

      } else if (col === 'movimientos') {
        const { monto, tipo, cuentaId, cuentaDestinoId } = financeForm;
        if (!monto) { setErrorMsg && setErrorMsg("Ingresa un monto"); return; }
        const valor = safeMonto(monto);
        const movRef = doc(collection(db, 'users', user.uid, 'movimientos'));

        if (tipo === 'TRANSFERENCIA') {
          if (!cuentaId || !cuentaDestinoId) { setErrorMsg && setErrorMsg("Faltan cuentas"); return; }
          
          // 1. Quitar de cuenta origen
          batch.update(doc(db, 'users', user.uid, 'cuentas', cuentaId), { monto: increment(-valor) });
          // 2. Sumar a cuenta destino
          batch.update(doc(db, 'users', user.uid, 'cuentas', cuentaDestinoId), { monto: increment(valor) });
          // 3. Registrar el movimiento
          batch.set(movRef, { 
            nombre: `Transf: ${cuentas.find(c=>c.id===cuentaId).nombre} -> ${cuentas.find(c=>c.id===cuentaDestinoId).nombre}`, 
            monto: valor, tipo: 'TRANSFERENCIA', cuentaId, cuentaDestinoId, timestamp: serverTimestamp() 
          });

        } else {
          // GASTO o INGRESO
          const dataToSave = { ...financeForm, monto: valor, timestamp: serverTimestamp() };
          if (cuentaId) {
            // 1. Actualizar saldo de la cuenta
            const nSaldo = tipo === 'INGRESO' ? increment(valor) : increment(-valor);
            batch.update(doc(db, 'users', user.uid, 'cuentas', cuentaId), { monto: nSaldo });
            dataToSave.cuentaNombre = cuentas.find(c => c.id === cuentaId)?.nombre || 'Cuenta';
          }
          // 2. Registrar el movimiento
          batch.set(movRef, dataToSave);
        }
        updateStreakExternal && updateStreakExternal();
      }

      // DISPARAMOS TODAS LAS TAREAS DE GOLPE
      await batch.commit();
      
      setFinanceForm && setFinanceForm({ nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' });
      setModalOpen && setModalOpen(null);
    } catch (e) { 
      setErrorMsg && setErrorMsg("Error: " + e.message); 
    }
  };

  return { saveBudget, handleSave };
}