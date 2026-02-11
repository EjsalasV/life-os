"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { useUser } from '@/context/auth';
import { 
  onSnapshot, query, orderBy, where, limit, serverTimestamp, addDoc, updateDoc
} from 'firebase/firestore';
import { 
  getUserRef, getCuentasCol, getFijosCol, getMetasCol, getPresupuestosCol, 
  getProductosCol, getVentasCol, getHabitosCol, getPesoCol, getMovimientosCol 
} from '@/lib/firebase-refs';

// COMPONENTES Y UTILIDADES
import { getTime, getTodayKey, safeMonto, formatMoney, CATEGORIAS } from './utils/helpers';
import Modal from './components/ui/Modal';
import AppForms from './components/forms/AppForms';
import MainLayout from './components/layout/MainLayout';
import AuthView from './components/views/AuthView';
import FinanzasView from './components/views/FinanzasView';
import VentasView from './components/views/VentasView';
import SaludView from './components/views/SaludView';
import SettingsView from './components/views/SettingsView';
import FloatingActionButton from './components/ui/FloatingActionButton';
import { Loader2 } from 'lucide-react';

// HOOKS ESPECIALIZADOS
import useVentas from './hooks/useVentas';
import useSalud from './hooks/useSalud';
import useFinanzas from './hooks/useFinanzas';
import useOnline from './hooks/useOnline';
import useLocalNotifications from './hooks/useLocalNotifications';

const INITIAL_FINANCE = { nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' };
const INITIAL_PRODUCT = { nombre: '', precioVenta: '', costo: '', stock: '' };
const INITIAL_POS = { cliente: '', cuentaId: '' };
const INITIAL_HEALTH = { tipoEjercicio: 'cardio', duracion: '20', tipoComida: 'almuerzo', calidadComida: 'normal', horasSueno: '7', calidadSueno: 'regular', frecuencia: 'Diario', iconType: 'pill', nombre: '', peso: '' };

const App = () => {
   const { user, register, login, logOut, loading: authLoading } = useUser();
   const isOnline = useOnline();
   useLocalNotifications();

   // ESTADOS UI
   const [activeTab, setActiveTab] = useState('finanzas');
   const [finSubTab, setFinSubTab] = useState('control');
   const [ventasSubTab, setVentasSubTab] = useState('terminal');
   const [saludSubTab, setSaludSubTab] = useState('vitalidad');
   const [darkMode, setDarkMode] = useState(false);
   const [modalOpen, setModalOpen] = useState(null);
   const [toast, setToast] = useState(null);
   const [streakModalOpen, setStreakModalOpen] = useState(false);
   const [errorMsg, setErrorMsg] = useState("");
   const [authError, setAuthError] = useState("");
   const [forceLoad, setForceLoad] = useState(false);

   // ESTADOS DATOS
   const [filterDate, setFilterDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
   const [selectedAccountId, setSelectedAccountId] = useState(null);
   const [selectedMeta, setSelectedMeta] = useState(null);
   const [selectedBudgetCat, setSelectedBudgetCat] = useState(null);
   const [carrito, setCarrito] = useState([]);
   const [busquedaProd, setBusquedaProd] = useState("");
   
   const [movimientos, setMovimientos] = useState([]);
   const [cuentas, setCuentas] = useState([]);
   const [fijos, setFijos] = useState([]);
   const [metas, setMetas] = useState([]);
   const [presupuestos, setPresupuestos] = useState([]);
   const [userStats, setUserStats] = useState({ lastActivity: null, currentStreak: 0 });
   const [productos, setProductos] = useState([]);
   const [ventas, setVentas] = useState([]);
   const [habitos, setHabitos] = useState([]);
   const [historialPeso, setHistorialPeso] = useState([]);

   const [financeForm, setFinanceForm] = useState(INITIAL_FINANCE);
   const [productForm, setProductForm] = useState(INITIAL_PRODUCT);
   const [posForm, setPosForm] = useState(INITIAL_POS);
   const [healthForm, setHealthForm] = useState(INITIAL_HEALTH);

   const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };
   const handleLoginWrapper = async (e, p) => { try { setAuthError(""); await login(e, p); } catch(err){ setAuthError("Credenciales incorrectas"); }};
   const handleRegisterWrapper = async (e, p, n) => { try { setAuthError(""); await register(e, p, n); } catch(err){ setAuthError(err.message); }};

   // LÓGICA DE DATOS GLOBAL
   useEffect(() => {
      if (!user) return;
      const unsubUser = onSnapshot(getUserRef(user.uid), (d) => { if(d.exists()) setUserStats(d.data().stats || { lastActivity: null, currentStreak: 0 }); });
      const unsubs = [
         onSnapshot(getCuentasCol(user.uid), s => setCuentas(s.docs.map(d => ({id:d.id, ...d.data()})))),
         onSnapshot(getFijosCol(user.uid), s => setFijos(s.docs.map(d => ({id:d.id, ...d.data()})))),
         onSnapshot(getMetasCol(user.uid), s => setMetas(s.docs.map(d => ({id:d.id, ...d.data()})))),
         onSnapshot(getPresupuestosCol(user.uid), s => setPresupuestos(s.docs.map(d => ({id:d.id, ...d.data()})))),
         onSnapshot(getProductosCol(user.uid), s => setProductos(s.docs.map(d => ({id:d.id, ...d.data()})))),
         onSnapshot(query(getVentasCol(user.uid), orderBy('timestamp','desc')), s => setVentas(s.docs.map(d => ({id:d.id, ...d.data()})))),
         onSnapshot(getHabitosCol(user.uid), s => setHabitos(s.docs.map(d => ({id:d.id, ...d.data()})))),
         onSnapshot(query(getPesoCol(user.uid), orderBy('timestamp','desc')), s => setHistorialPeso(s.docs.map(d => ({id:d.id, ...d.data()}))))
      ];
      return () => { unsubUser(); unsubs.forEach(u => u()); };
   }, [user]);

   useEffect(() => {
      if(!user) return;
      const start = new Date(filterDate.year, filterDate.month, 1);
      const end = new Date(filterDate.year, filterDate.month + 1, 0, 23, 59, 59);
      const q = query(getMovimientosCol(user.uid), orderBy('timestamp','desc'), where('timestamp','>=',start), where('timestamp','<=',end), limit(50));
      const unsub = onSnapshot(q, s => setMovimientos(s.docs.map(d => ({id:d.id, ...d.data()}))));
      return () => unsub();
   }, [user, filterDate]);

   const updateStreak = async () => {
      if(!user) return;
      try {
         const now = new Date(); const last = userStats.lastActivity?.toDate ? userStats.lastActivity.toDate() : new Date(0);
         const startDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
         if(startDay(now) !== startDay(last)) {
            const yesterday = new Date(now); yesterday.setDate(now.getDate()-1);
            let newS = (startDay(yesterday) === startDay(last)) ? userStats.currentStreak + 1 : 1;
            await updateDoc(getUserRef(user.uid), {'stats.lastActivity': serverTimestamp(), 'stats.currentStreak': newS});
         }
      } catch(e){ console.error(e); }
   };

   // INVOCACIÓN DE HOOKS
   const { addToCart, handleCheckout, handleGenerarPedido } = useVentas({ user, productos, carrito, setCarrito, ventas, cuentas, posForm, setPosForm, setModalOpen, setErrorMsg: showToast });
   const { handleSave, saveBudget, handleImport, handleAhorroMeta, deleteItem } = useFinanzas({ user, cuentas, presupuestos, setModalOpen, setFinanceForm, setErrorMsg: showToast, updateStreakExternal: updateStreak, movimientos });
   
   const { 
     saludHoy, 
     historialSalud, 
     updateHealthStat, 
     toggleComida, 
     toggleHabitCheck, 
     addWater, 
     removeWater, 
     toggleFasting,
     resetDailyHealth // Función conectada
   } = useSalud(user, showToast);

   const balanceMes = useMemo(() => {
      const i = movimientos.filter(m=>m.tipo==='INGRESO').reduce((a,b)=>a+safeMonto(b.monto),0);
      const g = movimientos.filter(m=>m.tipo==='GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
      return { ingresos:i, gastos:g, balance:i-g, proyeccion: cuentas.reduce((a,c)=>a+safeMonto(c.monto),0) - fijos.reduce((a,f)=>a+safeMonto(f.monto),0) };
   }, [movimientos, cuentas, fijos]);

   const presupuestoData = useMemo(() => {
      const g = movimientos.filter(m=>m.tipo==='GASTO').reduce((a,m)=>{ a[m.categoria]=(a[m.categoria]||0)+safeMonto(m.monto); return a; }, {});
      return CATEGORIAS.map(c => ({...c, limite: safeMonto(presupuestos.find(p=>p.categoriaId===c.id)?.limite)||0, gastado: g[c.id]||0}));
   }, [movimientos, presupuestos]);

   const smartMessage = useMemo(() => {
      const g = movimientos.filter(m=>m.tipo==='GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
      return g===0 ? "Sin gastos registrados." : `Has movido ${formatMoney(g)} este mes.`;
   }, [movimientos]);

   if (authLoading && !forceLoad) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
   if (!user) return <AuthView onLogin={handleLoginWrapper} onRegister={handleRegisterWrapper} loading={authLoading} error={authError} />;

   return (
      <MainLayout userStats={userStats} isOnline={isOnline} darkMode={darkMode} setDarkMode={setDarkMode} activeTab={activeTab} setActiveTab={setActiveTab} toast={toast}>
         
         {activeTab === 'finanzas' && (
            <FinanzasView finSubTab={finSubTab} setFinSubTab={setFinSubTab} smartMessage={smartMessage} userStats={userStats} handleNoSpendToday={() => {updateStreak(); setStreakModalOpen(true);}} balanceMes={balanceMes} formatMoney={formatMoney} presupuestoData={presupuestoData} setSelectedBudgetCat={setSelectedBudgetCat} setModalOpen={setModalOpen} setFormData={setFinanceForm} formData={financeForm} cuentas={cuentas} setSelectedAccountId={setSelectedAccountId} selectedAccountId={selectedAccountId} deleteItem={deleteItem} movimientos={movimientos} fijos={fijos} metas={metas} setSelectedMeta={setSelectedMeta} getTime={getTime} handleImport={handleImport} userPlan={user?.plan || 'free'} filterDate={filterDate} setFilterDate={setFilterDate} />
         )}

         {activeTab === 'ventas' && (
            <VentasView ventasSubTab={ventasSubTab} setVentasSubTab={setVentasSubTab} ventas={ventas} formatMoney={formatMoney} safeMonto={safeMonto} deleteItem={deleteItem} getTime={getTime} productos={productos} busquedaProd={busquedaProd} setBusquedaProd={setBusquedaProd} addToCart={addToCart} setModalOpen={setModalOpen} carrito={carrito} setCarrito={setCarrito} handleGenerarPedido={handleGenerarPedido} />
         )}

         {activeTab === 'salud' && (
            <SaludView 
              saludSubTab={saludSubTab} setSaludSubTab={setSaludSubTab}
              saludHoy={saludHoy} 
              updateHealthStat={updateHealthStat}
              removeWater={removeWater} addWater={addWater}
              toggleComida={toggleComida} habitos={habitos} toggleHabitCheck={toggleHabitCheck}
              deleteItem={deleteItem} historialPeso={historialPeso} safeMonto={safeMonto}
              historialSalud={historialSalud} getTodayKey={getTodayKey} 
              setModalOpen={setModalOpen} toggleFasting={toggleFasting}
              resetDailyHealth={resetDailyHealth}
            />
         )}

         {activeTab === 'settings' && (<SettingsView user={user} logOut={logOut} />)}

         {activeTab === 'finanzas' && finSubTab === 'billetera' && (<FloatingActionButton onClick={() => setModalOpen('movimiento')} />)}

         <Modal isOpen={!!modalOpen} onClose={() => setModalOpen(null)} title={modalOpen}>
            <AppForms modalType={modalOpen} errorMsg={errorMsg} financeForm={financeForm} setFinanceForm={setFinanceForm} productForm={productForm} setProductForm={setProductForm} posForm={posForm} setPosForm={setPosForm} healthForm={healthForm} setHealthForm={setHealthForm} cuentas={cuentas} carrito={carrito} selectedBudgetCat={selectedBudgetCat} onConfirm={() => {
                  if(modalOpen==='cobrar') handleCheckout();
                  else if(modalOpen==='presupuesto') saveBudget(selectedBudgetCat, financeForm);
                  else if(modalOpen==='ahorroMeta') handleAhorroMeta(selectedMeta, financeForm);
                  else if(modalOpen==='meta') { if(financeForm.nombre && financeForm.monto){ addDoc(getMetasCol(user.uid), {nombre:financeForm.nombre, montoObjetivo:safeMonto(financeForm.monto), montoActual:0, timestamp:serverTimestamp()}); setModalOpen(null); setFinanceForm(INITIAL_FINANCE); }}
                  else {
                     if(modalOpen==='producto' && user?.plan!=='pro' && productos.length>=3){ showToast("Límite Free alcanzado",'error'); return; }
                     handleSave(modalOpen==='producto'?'productos':modalOpen==='habito'?'habitos':modalOpen==='peso'?'peso':modalOpen==='movimiento'?'movimientos':modalOpen==='cuenta'?'cuentas':'fijos', financeForm, productForm, healthForm);
                  }
               }}
            />
         </Modal>
         
         <Modal isOpen={streakModalOpen} onClose={() => setStreakModalOpen(false)} title="Racha 🔥"><div className="text-center p-4 font-bold">¡Racha guardada! Sigue así.</div></Modal>
      </MainLayout>
   );
};

export default App;