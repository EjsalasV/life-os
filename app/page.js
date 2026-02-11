"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { useUser } from '@/context/auth';
import { 
  onSnapshot, query, orderBy, where, limit, serverTimestamp, addDoc, updateDoc, doc, setDoc
} from 'firebase/firestore';
import { 
  getUserRef, getCuentasCol, getFijosCol, getMetasCol, getPresupuestosCol, 
  getProductosCol, getVentasCol, getHabitosCol, getPesoCol, getMovimientosCol 
} from '@/lib/firebase-refs';

// COMPONENTES DE VISTA
import FinanzasView from './components/views/FinanzasView';
import VentasView from './components/views/VentasView';
import SaludView from './components/views/SaludView';
import SettingsView from './components/views/SettingsView';
import AuthView from './components/views/AuthView';
import Onboarding from './components/ui/Onboarding';

// UI Y HELPERS
import { getTime, getTodayKey, safeMonto, formatMoney, CATEGORIAS } from './utils/helpers';
import Modal from './components/ui/Modal';
import AppForms from './components/forms/AppForms';
import MainLayout from './components/layout/MainLayout';
import FloatingActionButton from './components/ui/FloatingActionButton';
import { Loader2 } from 'lucide-react';

// HOOKS
import useVentas from './hooks/useVentas';
import useSalud from './hooks/useSalud';
import useFinanzas from './hooks/useFinanzas';
import useOnline from './hooks/useOnline';
import useLocalNotifications from './hooks/useLocalNotifications';

const INITIAL_FINANCE = { nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' };
const INITIAL_PRODUCT = { nombre: '', precioVenta: '', costo: '', stock: '' };
const INITIAL_POS = { cliente: '', cuentaId: '', id: null };
const INITIAL_HEALTH = { tipoEjercicio: 'cardio', duracion: '20', tipoComida: 'almuerzo', calidadComida: 'normal', horasSueno: '7', calidadSueno: 'regular', frecuencia: 'Diario', iconType: 'pill', nombre: '', peso: '' };

const App = () => {
   const { user, register, login, logOut, deleteAccount, loading: authLoading } = useUser();
   const isOnline = useOnline();
   useLocalNotifications();

   // --- NAVEGACIÓN ---
   const [activeTab, setActiveTab] = useState('finanzas');
   const [finSubTab, setFinSubTab] = useState('control');
   const [ventasSubTab, setVentasSubTab] = useState('terminal');
   const [saludSubTab, setSaludSubTab] = useState('vitalidad');

   // --- INTERFAZ ---
   const [modalOpen, setModalOpen] = useState(null);
   const [toast, setToast] = useState(null);
   const [streakModalOpen, setStreakModalOpen] = useState(false);
   const [errorMsg, setErrorMsg] = useState("");
   const [authError, setAuthError] = useState("");

   // --- DATOS ---
   const [filterDate, setFilterDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
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

   const showToast = (msg, type = 'success') => { 
      setToast({ message: msg, type }); 
      setTimeout(() => setToast(null), 3000); 
   };

   // --- FIREBASE SYNC ---
   useEffect(() => {
      if (!user) return;
      const unsubUser = onSnapshot(getUserRef(user.uid), (d) => { 
         if(d.exists()) {
            const data = d.data();
            setUserStats(data.stats || { lastActivity: null, currentStreak: 0 }); 
         }
      });
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
      const q = query(getMovimientosCol(user.uid), orderBy('timestamp','desc'), where('timestamp','>=',start), where('timestamp','<=',end), limit(100));
      return onSnapshot(q, s => setMovimientos(s.docs.map(d => ({id:d.id, ...d.data()}))));
   }, [user, filterDate]);

   // --- LÓGICA DE RACHA (STREAK) CORREGIDA ---
   const updateStreak = async () => {
      if(!user) return;
      try {
         const now = new Date(); 
         const last = userStats.lastActivity?.toDate ? userStats.lastActivity.toDate() : null;
         
         // Normalizar fechas a medianoche para comparar solo días
         const startOfDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
         const todayTimestamp = startOfDate(now);
         const lastTimestamp = last ? startOfDate(last) : 0;

         // Si el último registro NO fue hoy
         if(todayTimestamp !== lastTimestamp) {
            const yesterdayTimestamp = todayTimestamp - (24 * 60 * 60 * 1000);
            let newS = (lastTimestamp === yesterdayTimestamp) ? (userStats.currentStreak || 0) + 1 : 1;
            
            // Usamos setDoc con merge para mayor robustez
            await setDoc(getUserRef(user.uid), {
               stats: {
                  lastActivity: serverTimestamp(),
                  currentStreak: newS
               }
            }, { merge: true });
            
            return true; // Se actualizó
         }
         return false; // Ya se actualizó hoy
      } catch(e){ 
         console.error("Error en racha:", e); 
         return false;
      }
   };

   // --- HOOKS LOGIC ---
   const { addToCart, handleCheckout, handleGenerarPedido } = useVentas({ user, productos, carrito, setCarrito, ventas, cuentas, posForm, setPosForm, setModalOpen, setErrorMsg: showToast, movimientos });
   const { handleSave, handleImport, deleteItem, handleTogglePlan, handleUpdateName } = useFinanzas({ user, cuentas, setModalOpen, setFinanceForm, setProductForm, setHealthForm, setErrorMsg: showToast, updateStreakExternal: updateStreak, movimientos, productos, setPosForm });
   const { saludHoy, historialSalud, updateHealthStat, toggleComida, toggleHabitCheck, addWater, removeWater, toggleFasting, resetDailyHealth } = useSalud(user, showToast);

   // --- DASHBOARD MATH ---
   const balanceMes = useMemo(() => {
      const i = movimientos.filter(m=>m.tipo==='INGRESO').reduce((a,b)=>a+safeMonto(b.monto),0);
      const g = movimientos.filter(m=>m.tipo==='GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
      return { ingresos: i, gastos: g, balance: i - g, proyeccion: cuentas.reduce((a,c)=>a+safeMonto(c.monto),0) - fijos.reduce((a,f)=>a+safeMonto(f.monto),0) };
   }, [movimientos, cuentas, fijos]);

   const smartMessage = useMemo(() => {
      const g = movimientos.filter(m=>m.tipo==='GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
      return g===0 ? "Sin gastos este mes." : `Movimiento mensual: ${formatMoney(g)}`;
   }, [movimientos]);

   const handleFinishOnboarding = async () => {
      if(!user) return;
      await setDoc(getUserRef(user.uid), { isNew: false }, { merge: true });
   };

   // --- RENDER LOGIC ---
   if (authLoading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;
   if (!user) return <AuthView onLogin={login} onRegister={register} loading={authLoading} error={authError} />;
   if (user.isNew) return (<Onboarding userName={user.name} onFinish={handleFinishOnboarding} />);

   return (
      <MainLayout userStats={userStats} isOnline={isOnline} darkMode={false} setDarkMode={()=>{}} activeTab={activeTab} setActiveTab={setActiveTab} toast={toast}>
         
         {activeTab === 'finanzas' && (
            <FinanzasView 
               finSubTab={finSubTab} setFinSubTab={setFinSubTab} smartMessage={smartMessage} 
               userStats={userStats} 
               handleNoSpendToday={async () => {
                  const updated = await updateStreak(); 
                  if(updated) setStreakModalOpen(true);
                  else showToast("Racha ya actualizada hoy 🔥", "info");
               }} 
               balanceMes={balanceMes} formatMoney={formatMoney} presupuestoData={[]} 
               setSelectedBudgetCat={()=>{}} setModalOpen={setModalOpen} 
               setFormData={setFinanceForm} formData={financeForm} cuentas={cuentas} 
               setSelectedAccountId={()=>{}} selectedAccountId={null} 
               deleteItem={deleteItem} movimientos={movimientos} fijos={fijos} metas={metas} 
               setSelectedMeta={()=>{}} getTime={getTime} handleImport={handleImport} 
               userPlan={user?.plan || 'free'} filterDate={filterDate} setFilterDate={setFilterDate} 
            />
         )}

         {activeTab === 'ventas' && (
            <VentasView 
               ventasSubTab={ventasSubTab} setVentasSubTab={setVentasSubTab} 
               ventas={ventas} formatMoney={formatMoney} safeMonto={safeMonto} 
               deleteItem={deleteItem} getTime={getTime} productos={productos} 
               busquedaProd={busquedaProd} setBusquedaProd={setBusquedaProd} 
               addToCart={addToCart} setModalOpen={setModalOpen} 
               carrito={carrito} setCarrito={setCarrito} 
               handleGenerarPedido={handleGenerarPedido}
               setProductForm={setProductForm}
               setPosForm={setPosForm}
               user={user}
            />
         )}

         {activeTab === 'salud' && (
            <SaludView 
               saludSubTab={saludSubTab} setSaludSubTab={setSaludSubTab} saludHoy={saludHoy} 
               updateHealthStat={updateHealthStat} removeWater={removeWater} addWater={addWater} 
               toggleComida={toggleComida} habitos={habitos} toggleHabitCheck={toggleHabitCheck} 
               deleteItem={deleteItem} historialPeso={historialPeso} safeMonto={safeMonto} 
               historialSalud={historialSalud} getTodayKey={getTodayKey} setModalOpen={setModalOpen} 
               toggleFasting={toggleFasting} resetDailyHealth={resetDailyHealth} 
               user={user}
            />
         )}

         {activeTab === 'settings' && (
            <SettingsView 
               user={user} 
               logOut={logOut} 
               handleTogglePlan={handleTogglePlan} 
               handleUpdateName={handleUpdateName}
               handleDeleteAccount={async () => {
                  if(window.confirm("¿ESTÁS SEGURO? Esta acción borrará todos tus datos permanentemente.")) {
                     try {
                        await deleteAccount();
                        showToast("Cuenta eliminada correctamente");
                     } catch(e) { showToast(e.message, "error"); }
                  }
               }}
            />
         )}

         {activeTab === 'finanzas' && finSubTab === 'billetera' && (
            <FloatingActionButton onClick={() => setModalOpen('movimiento')} />
         )}

         <Modal isOpen={!!modalOpen} onClose={() => setModalOpen(null)} title={modalOpen}>
            <AppForms 
               modalType={modalOpen} errorMsg={errorMsg} 
               financeForm={financeForm} setFinanceForm={setFinanceForm} 
               productForm={productForm} setProductForm={setProductForm} 
               posForm={posForm} setPosForm={setPosForm} 
               healthForm={healthForm} setHealthForm={setHealthForm} 
               cuentas={cuentas} carrito={carrito} selectedBudgetCat={null} 
               onConfirm={() => {
                  if(modalOpen==='cobrar') handleCheckout();
                  else handleSave(modalOpen==='producto'?'productos':modalOpen==='habito'?'habitos':modalOpen==='peso'?'peso':modalOpen==='movimiento'?'movimientos':modalOpen==='cuenta'?'cuentas':'fijos', financeForm, productForm, healthForm);
               }}
            />
         </Modal>
         
         <Modal isOpen={streakModalOpen} onClose={() => setStreakModalOpen(false)} title="Racha 🔥">
            <div className="text-center p-6 space-y-4">
               <div className="text-6xl">🔥</div>
               <h3 className="text-xl font-black italic">¡Felicidades, {user?.name || 'Erick'}!</h3>
               <p className="text-sm font-bold text-gray-500 uppercase">Has mantenido tu racha activa. Sigue así para dominar tus finanzas.</p>
               <button onClick={() => setStreakModalOpen(false)} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-xs">Entendido</button>
            </div>
         </Modal>
      </MainLayout>
   );
};

export default App;