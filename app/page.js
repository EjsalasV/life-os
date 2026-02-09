"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { useUser } from '@/context/auth';
import { 
  collection, doc, addDoc, onSnapshot, 
  deleteDoc, serverTimestamp, updateDoc, increment, getDoc, setDoc, query, orderBy, where, limit 
} from 'firebase/firestore';

// --- IMPORTS DE UTILIDADES ---
import { getTime, getTodayKey, safeMonto, formatMoney, CATEGORIAS } from './utils/helpers';
import { TrendingUp } from 'lucide-react';
import Modal from './components/ui/Modal';
import AppForms from './components/forms/AppForms';
import useVentas from './hooks/useVentas';
import useSalud from './hooks/useSalud';
import useFinanzas from './hooks/useFinanzas';
import useOnline from './hooks/useOnline';
import useLocalNotifications from './hooks/useLocalNotifications';

// --- IMPORTS DE ICONOS ---
import { 
  Plus, Settings, Trash2, Moon, Sun,
  Loader2, Sparkles, Flame, ShieldCheck, Search, Printer,
  Wallet, Store, Activity, LayoutGrid, Zap, TrendingUp
} from 'lucide-react';

// --- IMPORTS DE VISTAS ---
import FinanzasView from './components/views/FinanzasView';
import VentasView from './components/views/VentasView';
import SaludView from './components/views/SaludView';
import SettingsView from './components/views/SettingsView';

// --- CONSTANTES ---
// Movidas a app/utils/helpers.js

// --- ESTADOS INICIALES ---
const INITIAL_FINANCE = { nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '' };
const INITIAL_PRODUCT = { nombre: '', precioVenta: '', costo: '', stock: '' };
const INITIAL_POS = { cliente: '', cuentaId: '' };
const INITIAL_HEALTH = { tipoEjercicio: 'cardio', duracion: '20', tipoComida: 'almuerzo', calidadComida: 'normal', horasSueno: '7', calidadSueno: 'regular', frecuencia: 'Diario', iconType: 'pill', nombre: '', peso: '' };

// --- COMPONENTE MODAL ---
// Movido a app/components/ui/Modal.js

// --- INICIO DE LA APP ---
const App = () => {
   const { user, register, login, logOut, loading: authLoading } = useUser();
   const isOnline = useOnline();
  // Scheduler local de notificaciones (Opción A)
  useLocalNotifications();
   
   // --- ESTADOS ---
   const [activeTab, setActiveTab] = useState('finanzas'); 
   const [finSubTab, setFinSubTab] = useState('control');  
   const [ventasSubTab, setVentasSubTab] = useState('panel'); 
   const [saludSubTab, setSaludSubTab] = useState('vitalidad'); 
   const [darkMode, setDarkMode] = useState(false);
   const [modalOpen, setModalOpen] = useState(null); 
   const [toast, setToast] = useState(null);
   const [streakModalOpen, setStreakModalOpen] = useState(false); 
   const [dailyCloseOpen, setDailyCloseOpen] = useState(false); 
   const [errorMsg, setErrorMsg] = useState(""); 
   const [forceLoad, setForceLoad] = useState(false); 

   // FECHA GLOBAL (CEREBRO DE FILTROS) 🧠
   const [filterDate, setFilterDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
 
   // AUTH & SELECCION
   const [isRegistering, setIsRegistering] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [nombre, setNombre] = useState("");
   const [authError, setAuthError] = useState("");
   const [selectedAccountId, setSelectedAccountId] = useState(null);
   const [selectedMeta, setSelectedMeta] = useState(null);
   const [selectedBudgetCat, setSelectedBudgetCat] = useState(null); 
   const [carrito, setCarrito] = useState([]); 
   const [busquedaProd, setBusquedaProd] = useState(""); 

   // DATOS
   const [movimientos, setMovimientos] = useState([]);
   const [cuentas, setCuentas] = useState([]);
   const [fijos, setFijos] = useState([]);
   const [metas, setMetas] = useState([]);
   const [presupuestos, setPresupuestos] = useState([]);
   const [userStats, setUserStats] = useState({ lastActivity: null, currentStreak: 0 });
   const [productos, setProductos] = useState([]);
   const [ventas, setVentas] = useState([]); 
   const [saludHoy, setSaludHoy] = useState(null); 
   const [habitos, setHabitos] = useState([]); 
   const [historialPeso, setHistorialPeso] = useState([]); 
   const [historialSalud, setHistorialSalud] = useState([]); 
 
   // FORMULARIOS
   const [financeForm, setFinanceForm] = useState(INITIAL_FINANCE);
   const [productForm, setProductForm] = useState(INITIAL_PRODUCT);
   const [posForm, setPosForm] = useState(INITIAL_POS);
   const [healthForm, setHealthForm] = useState(INITIAL_HEALTH);
 
   const colRef = (uid, colName) => collection(db, 'users', uid, colName);
   const docRef = (uid, colName, id) => doc(db, 'users', uid, colName, id);

   // --- FUNCIÓN PARA MOSTRAR LA NOTIFICACIÓN ---
   const showToast = (message, type = 'success') => {
     setToast({ message, type });
     setTimeout(() => setToast(null), 3000); // Se borra en 3 segundos
   };

   // --- EFECTOS (CARGA DE DATOS) ---
   useEffect(() => { const timer = setTimeout(() => { if (authLoading) setForceLoad(true); }, 3000); return () => clearTimeout(timer); }, [authLoading]);

   useEffect(() => {
    if (!user) return;
    const userUnsub = onSnapshot(doc(db, 'users', user.uid), (doc) => { if(doc.exists()) setUserStats(doc.data().stats || { lastActivity: null, currentStreak: 0 }); });
    const collectionsToLoad = ['cuentas', 'fijos', 'metas', 'presupuestos', 'productos', 'ventas', 'habitos', 'peso'];
    const streams = collectionsToLoad.map(name => {
      const q = name === 'peso' || name === 'ventas' ? query(colRef(user.uid, name), orderBy('timestamp', 'desc')) : colRef(user.uid, name);
      return onSnapshot(q, (s) => {
        const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
        if (name === 'cuentas') setCuentas(data);
        if (name === 'fijos') setFijos(data);
        if (name === 'metas') setMetas(data);
        if (name === 'presupuestos') setPresupuestos(data);
        if (name === 'productos') setProductos(data);
        if (name === 'ventas') setVentas(data);
        if (name === 'habitos') setHabitos(data);
        if (name === 'peso') setHistorialPeso(data);
      });
    });
    const todayKey = getTodayKey(); 
    const dailyHealthRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);
    const healthUnsub = onSnapshot(dailyHealthRef, async (docSnapshot) => {
      if (docSnapshot.exists()) { setSaludHoy(docSnapshot.data()); } 
      else {
        const initialData = { fecha: todayKey, bateria: 50, agua: 0, sueñoHoras: 0, sueñoCalidad: 'regular', animo: 'normal', ejercicioMinutos: 0, comidas: {}, habitosChecks: [], lastUpdate: serverTimestamp() };
        await setDoc(dailyHealthRef, initialData); setSaludHoy(initialData);
      }
    });
    const historyUnsub = onSnapshot(query(colRef(user.uid, 'salud_diaria'), orderBy('fecha', 'desc')), (s) => { setHistorialSalud(s.docs.map(d => ({ id: d.id, ...d.data() }))); });
    return () => { userUnsub(); healthUnsub(); historyUnsub(); streams.forEach(unsub => unsub()); };
  }, [user]);

  // CARGA DE MOVIMIENTOS POR FECHA 📅
  useEffect(() => {
    if (!user) return;
    const start = new Date(filterDate.year, filterDate.month, 1);
    const end = new Date(filterDate.year, filterDate.month + 1, 0, 23, 59, 59);
    const q = query(
      colRef(user.uid, 'movimientos'),
      orderBy('timestamp', 'desc'),
      where('timestamp', '>=', start),
      where('timestamp', '<=', end),
      limit(50) // Solo trae los últimos 50 movimientos dentro del rango
    );
    const unsubscribe = onSnapshot(q, (snapshot) => { setMovimientos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    return () => unsubscribe();
  }, [user, filterDate]);

  // � Registrar Service Worker y obtener token FCM
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const setupFCM = async () => {
      try {
        // 1. Registrar Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          console.log('✅ Service Worker registrado:', registration);
        }

        // 2. Solicitar permiso de notificaciones
        if ('Notification' in window && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          console.log('📬 Permiso de notificaciones:', permission);
        }

        // 3. Obtener token FCM
        const { messaging } = await import('@/lib/firebase');
        const messagingService = await messaging();
        
        if (messagingService) {
          const { getToken } = await import('firebase/messaging');
          try {
            const token = await getToken(messagingService, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });
            
            if (token) {
              // 4. Guardar token en Firestore
              await updateDoc(doc(db, 'users', user.uid), {
                fcmToken: token,
                fcmTokenUpdated: serverTimestamp()
              });
              console.log('✅ Token FCM guardado:', token.substring(0, 20) + '...');
            }
          } catch (err) {
            console.error('Error obteniendo token FCM:', err);
          }
        }
      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };

    setupFCM();
  }, [user]);

  // --- FUNCIÓN DE RACHA (DEBE ESTAR ANTES DE LOS HOOKS) ---
  const updateStreak = async () => { 
    if (!user) return;
    try {
      const now = new Date(); const last = userStats.lastActivity?.toDate ? userStats.lastActivity.toDate() : new Date(0);
      const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const isSameDay = startOfDay(now).getTime() === startOfDay(last).getTime();
      const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
      const isNextDay = startOfDay(yesterday).getTime() === startOfDay(last).getTime();
      let newStreak = userStats.currentStreak;
      if (!isSameDay) { if (isNextDay) newStreak += 1; else newStreak = 1; await updateDoc(doc(db, 'users', user.uid), {'stats.lastActivity': serverTimestamp(), 'stats.currentStreak': newStreak}); }
    } catch (e) { console.error(e); }
  };

  // --- LÓGICA DE NEGOCIO (delegada a hooks) ---
  const { addToCart, handleCheckout, handleGenerarPedido, requestNotificationPermission } = useVentas({ user, productos, carrito, setCarrito, ventas, cuentas, posForm, setPosForm, setModalOpen, setErrorMsg: showToast });
  const { calculateBattery, updateHealthStat, toggleComida, toggleHabitCheck, addWater, removeWater, toggleFasting } = useSalud({ user, saludHoy, setSaludHoy, setErrorMsg: showToast });
  const { handleSave, saveBudget, handleImport } = useFinanzas({ user, cuentas, presupuestos, setModalOpen, setFinanceForm, setErrorMsg: showToast, updateStreakExternal: updateStreak });

 const handleAhorroMeta = async () => {
   if (!user || !selectedMeta || !financeForm.monto || !financeForm.cuentaId) return;
   const valor = safeMonto(financeForm.monto);
   try {
     await updateDoc(docRef(user.uid, 'cuentas', financeForm.cuentaId), { monto: increment(-valor) });
     await updateDoc(docRef(user.uid, 'metas', selectedMeta.id), { montoActual: increment(valor) });
     await addDoc(colRef(user.uid, 'movimientos'), { nombre: `Ahorro: ${selectedMeta.nombre}`, monto: valor, tipo: 'GASTO', cuentaId: financeForm.cuentaId, cuentaNombre: cuentas.find(c => c.id === financeForm.cuentaId)?.nombre, categoria: 'otros', timestamp: serverTimestamp() });
     setModalOpen(null); setFinanceForm(INITIAL_FINANCE);
   } catch (e) { showToast("Error: " + e.message, 'error'); }
 };

 const deleteItem = async (col, item) => {
   try {
     if (col === 'movimientos') {
        if (item.ventaRefId) { showToast("Borra desde Negocio", 'error'); return; }
        if (item.cuentaId) {
            const cuentaRef = docRef(user.uid, 'cuentas', item.cuentaId);
            const cuentaSnap = await getDoc(cuentaRef);
            if (cuentaSnap.exists()) {
                if (item.tipo === 'TRANSFERENCIA' && item.cuentaDestinoId) {
                    await updateDoc(cuentaRef, { monto: increment(item.monto) });
                    await updateDoc(docRef(user.uid, 'cuentas', item.cuentaDestinoId), { monto: increment(-item.monto) });
                } else {
                    await updateDoc(cuentaRef, { monto: increment(item.tipo === 'INGRESO' ? -item.monto : item.monto) });
                }
            }
        }
     }
     if (col === 'ventas') {
        if (item.cuentaId) { const ref = docRef(user.uid, 'cuentas', item.cuentaId); const snap = await getDoc(ref); if(snap.exists()) await updateDoc(ref, { monto: increment(-item.total) }); }
        if (item.items) { for (const p of item.items) await updateDoc(docRef(user.uid, 'productos', p.id), { stock: increment(p.cantidad) }); }
        const mov = movimientos.find(m => m.ventaRefId === item.id); if (mov) await deleteDoc(docRef(user.uid, 'movimientos', mov.id));
     }
     await deleteDoc(docRef(user.uid, col, item.id));
     showToast("Eliminado correctamente ✓", 'success');
   } catch (e) { showToast("Error: " + e.message, 'error'); }
 };

 const handleNoSpendToday = async () => { await updateStreak(); setStreakModalOpen(true); };
 const handleAuth = async (e) => { e.preventDefault(); try { if (isRegistering) await register(email.trim(), password, nombre); else await login(email, password); } catch (err) { setAuthError(err.message); } };
// --- CÁLCULOS VISUALES ---
   const presupuestoData = useMemo(() => {
     const gastosMes = movimientos.filter(m => m.tipo === 'GASTO').reduce((acc, m) => { acc[m.categoria] = (acc[m.categoria] || 0) + safeMonto(m.monto); return acc; }, {});
     return CATEGORIAS.map(c => ({ ...c, limite: safeMonto(presupuestos.find(p => p.categoriaId === c.id)?.limite) || 0, gastado: gastosMes[c.id] || 0 }));
   }, [movimientos, presupuestos]);

   const balanceMes = useMemo(() => {
     const ingresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((a,b)=>a+safeMonto(b.monto),0);
     const gastos = movimientos.filter(m => m.tipo === 'GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
     const dineroTotal = cuentas.reduce((a,c)=>a+safeMonto(c.monto),0);
     const gastosFijosTotal = fijos.reduce((a,f)=>a+safeMonto(f.monto),0);
     return { ingresos, gastos, balance: ingresos - gastos, proyeccion: dineroTotal - gastosFijosTotal };
   }, [movimientos, cuentas, fijos]);

   const smartMessage = useMemo(() => {
     const totalGastos = movimientos.filter(m => m.tipo === 'GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
     if (totalGastos === 0) return "No hay movimientos en este periodo.";
     const fechaTexto = new Date(filterDate.year, filterDate.month).toLocaleString('es-EC', { month: 'long' });
     return `En ${fechaTexto} moviste ${formatMoney(totalGastos)}.`;
   }, [movimientos, filterDate]);

   // --- RENDERIZADO ---
   if (authLoading && !forceLoad) return <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-4"><Loader2 className="animate-spin text-blue-600"/>{forceLoad && <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold animate-pulse border border-rose-200">Reiniciar</button>}</div>;
   
   if (!user) return (
     <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
       {/* Fondo con degradado animado */}
       <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
       </div>

       {/* Contenido Principal */}
       <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
           
           {/* Logo y Marca */}
           <div className="space-y-4 animate-in slide-in-from-top duration-700">
               <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl shadow-blue-900/50">
                   <LayoutGrid size={48} className="text-white"/>
               </div>
               <div>
                 <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                     Life OS
                 </h1>
                 <p className="text-gray-400 font-medium text-sm tracking-wide mt-2">Tu vida y negocio, en sintonía.</p>
               </div>
           </div>

           {/* Grid de Beneficios */}
           <div className="grid grid-cols-2 gap-3 w-full max-w-xs animate-in zoom-in duration-700 delay-200">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center gap-2">
                   <TrendingUp className="text-emerald-400" size={24}/>
                   <p className="text-[10px] font-bold text-gray-300">Finanzas Claras</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center gap-2">
                   <Store className="text-blue-400" size={24}/>
                   <p className="text-[10px] font-bold text-gray-300">Control Stock</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center gap-2">
                   <Activity className="text-rose-400" size={24}/>
                   <p className="text-[10px] font-bold text-gray-300">Hábitos Salud</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center gap-2">
                   <Zap className="text-yellow-400" size={24}/>
                   <p className="text-[10px] font-bold text-gray-300">Modo Offline</p>
               </div>
           </div>

           {/* Botón de Acción */}
           <div className="w-full max-w-xs space-y-4 animate-in slide-in-from-bottom duration-700 delay-300">
               <button 
                   onClick={() => setModalOpen('auth')}
                   className="w-full py-4 bg-white text-black font-black rounded-2xl text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
               >
                   Empezar Ahora
               </button>
               <p className="text-[10px] text-gray-500">v1.0 • Studio Brikk</p>
           </div>
       </div>

       {/* Modal Auth */}
       <Modal isOpen={modalOpen === 'auth'} onClose={() => setModalOpen(null)} title={isRegistering ? "Crear Cuenta" : "Bienvenido"}>
            <div className="space-y-4">
               {isRegistering && (
                   <input type="text" placeholder="Nombre" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
                       value={nombre} onChange={(e) => setNombre(e.target.value)} />
               )}
               <input type="email" placeholder="Correo electrónico" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
                   value={email} onChange={(e) => setEmail(e.target.value)} />
               <input type="password" placeholder="Contraseña" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
               {authError && <p className="text-rose-500 text-xs font-bold p-2 bg-rose-50 rounded-lg">{authError}</p>}
               
               <button onClick={handleAuth} className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-2">
                   {isRegistering ? "Registrarse Gratis" : "Entrar"}
               </button>

               <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-center text-xs font-bold text-gray-400 py-2">
                   {isRegistering ? "¿Ya tienes cuenta? Inicia Sesión" : "¿Nuevo aquí? Crea una cuenta"}
               </button>
               
               <div className="relative py-2">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                   <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">O continúa con</span></div>
               </div>

               <button className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-gray-50">
                   <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                   Google
               </button>
            </div>
       </Modal>
     </div>
   );

   return (
     <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-black' : 'bg-[#f2f2f7]'} p-4 font-sans select-none text-[#1c1c1e]`}>
       <div className={`w-full max-w-[390px] h-[844px] rounded-[55px] shadow-2xl overflow-hidden relative flex flex-col transition-colors duration-500 ${darkMode ? 'bg-[#1c1c1e] text-white' : 'bg-white text-black'}`}>
         
         {/* HEADER GLOBAL (SIN LUPA NI FILTROS) */}
         <div className="px-6 pt-12 pb-2">
           <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Life OS</span>
               {userStats.currentStreak > 0 && <div className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse"><Flame size={12} className="text-orange-500 fill-orange-500"/><span className="text-[9px] font-black text-orange-600">{userStats.currentStreak} días</span></div>}
               {!isOnline && <div className="flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse"><div className="w-2 h-2 bg-rose-500 rounded-full"/><span className="text-[9px] font-black text-rose-600">Offline</span></div>}
             </div>
             <button onClick={()=>setDarkMode(!darkMode)} className="text-gray-400 active:scale-90 transition-transform">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
           </div>
           <div className="flex items-baseline gap-2"><h1 className="text-3xl font-black tracking-tight capitalize">{activeTab}</h1></div>
         </div>

         {/* CONTENIDO (VISTAS) */}
         <div className="flex-1 overflow-y-auto px-5 pb-32 pt-2 space-y-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
           {activeTab === 'finanzas' && (
             <FinanzasView 
               finSubTab={finSubTab} setFinSubTab={setFinSubTab}
               smartMessage={smartMessage} userStats={userStats}
               handleNoSpendToday={handleNoSpendToday}
               balanceMes={balanceMes} formatMoney={formatMoney}
               presupuestoData={presupuestoData} setSelectedBudgetCat={setSelectedBudgetCat}
               setModalOpen={setModalOpen} setFormData={setFinanceForm} formData={financeForm}
               cuentas={cuentas} setSelectedAccountId={setSelectedAccountId} selectedAccountId={selectedAccountId}
               deleteItem={deleteItem} movimientos={movimientos} fijos={fijos} metas={metas} setSelectedMeta={setSelectedMeta} getTime={getTime}
               handleImport={handleImport}
               userPlan={user?.plan || 'free'}
               // AQUÍ CONECTAMOS LA BARRA DE FECHA 👇
               filterDate={filterDate} setFilterDate={setFilterDate}
             />
           )}

           {activeTab === 'ventas' && (
             <VentasView 
               ventasSubTab={ventasSubTab} setVentasSubTab={setVentasSubTab}
               ventas={ventas} formatMoney={formatMoney} safeMonto={safeMonto}
               deleteItem={deleteItem} getTime={getTime}
               productos={productos} busquedaProd={busquedaProd} setBusquedaProd={setBusquedaProd}
               addToCart={addToCart} setModalOpen={setModalOpen} carrito={carrito} setCarrito={setCarrito}
               handleGenerarPedido={handleGenerarPedido}
             />
           )}

           {activeTab === 'salud' && (
             <SaludView 
               saludSubTab={saludSubTab} setSaludSubTab={setSaludSubTab}
               saludHoy={saludHoy} updateHealthStat={updateHealthStat}
               removeWater={removeWater} addWater={addWater}
               toggleComida={toggleComida} habitos={habitos} toggleHabitCheck={toggleHabitCheck}
               deleteItem={deleteItem} historialPeso={historialPeso} safeMonto={safeMonto}
               historialSalud={historialSalud} getTodayKey={getTodayKey} setModalOpen={setModalOpen} toggleFasting={toggleFasting}
             />
           )}

           {activeTab === 'settings' && (<SettingsView user={user} setDailyCloseOpen={setDailyCloseOpen} logOut={logOut} />)}
         </div>

         {/* BOTONES FLOTANTES */}
         {activeTab === 'finanzas' && finSubTab === 'billetera' && (<button onClick={() => setModalOpen('movimiento')} className="absolute bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50 hover:bg-gray-900"><Plus size={28} strokeWidth={3} /></button>)}

         {/* DOCK */}
         <div className="h-24 border-t flex justify-around pt-4 backdrop-blur-md bg-white/90 border-gray-100 z-50">
            {[{ id: 'finanzas', icon: Wallet, l: 'Wallet' }, { id: 'ventas', icon: Store, l: 'Negocio' }, { id: 'salud', icon: Activity, l: 'Protocolo' }, { id: 'settings', icon: Settings, l: 'Perfil' }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === t.id ? (t.id === 'salud' ? 'text-teal-600 scale-110' : t.id==='ventas' ? 'text-black scale-110' : 'text-blue-600 scale-110') : 'text-gray-400'}`}><t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 2} /><span className="text-[9px] font-black uppercase">{t.l}</span></button>
            ))}
         </div>

         {/* MODAL MAESTRO */}
         <Modal isOpen={!!modalOpen} onClose={() => {setModalOpen(null);}} title={modalOpen === 'producto' ? 'Nuevo Producto' : modalOpen === 'cobrar' ? 'Cobrar Venta' : modalOpen === 'peso' ? 'Registrar Peso' : 'Registrar'}>
           <AppForms
             modalType={modalOpen}
             errorMsg={errorMsg}
             financeForm={financeForm}
             setFinanceForm={setFinanceForm}
             productForm={productForm}
             setProductForm={setProductForm}
             posForm={posForm}
             setPosForm={setPosForm}
             healthForm={healthForm}
             setHealthForm={setHealthForm}
             cuentas={cuentas}
             carrito={carrito}
             selectedBudgetCat={selectedBudgetCat}
             onConfirm={() => {
               if (modalOpen === 'cobrar') handleCheckout();
               else if (modalOpen === 'presupuesto') saveBudget(selectedBudgetCat, financeForm);
               else if (modalOpen === 'ahorroMeta') handleAhorroMeta();
               else if (modalOpen === 'meta') { if (!financeForm.nombre || !financeForm.monto) return; addDoc(colRef(user.uid, 'metas'), { nombre: financeForm.nombre, montoObjetivo: safeMonto(financeForm.monto), montoActual: 0, timestamp: serverTimestamp() }); setModalOpen(null); setFinanceForm(INITIAL_FINANCE); }
               else {
                 // LÓGICA DE GUARDADO GENÉRICO
                 if (modalOpen === 'producto' || modalOpen === 'habito' || modalOpen === 'peso' || modalOpen === 'movimiento' || modalOpen === 'transferencia' || modalOpen === 'cuenta' || modalOpen === 'fijo') {
                   
                   // --- NUEVO: VALIDACIÓN DE LÍMITE DE PRODUCTOS ---
                   if (modalOpen === 'producto') {
                      const isPro = user?.plan === 'pro';
                      // Si NO es Pro Y ya tiene 3 o más productos...
                      if (!isPro && productos.length >= 3) {
                         showToast("Límite gratuito alcanzado (3 productos). Pásate a PRO 🚀", "error");
                         return; // <--- Detiene el guardado aquí mismo
                      }
                   }
                   // ------------------------------------------------

                   handleSave(
                     modalOpen === 'producto' ? 'productos' : 
                     modalOpen === 'habito' ? 'habitos' : 
                     modalOpen === 'peso' ? 'peso' : 
                     modalOpen === 'movimiento' || modalOpen === 'transferencia' ? 'movimientos' : 
                     modalOpen === 'cuenta' ? 'cuentas' : 'fijos',
                     financeForm, productForm, healthForm
                   );
                 }
               }
             }}
           />
         </Modal>

         <Modal isOpen={streakModalOpen} onClose={() => setStreakModalOpen(false)} title="¡Tu racha sigue viva! 🔥"><div className="space-y-4 text-center"><div className="mx-auto w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center animate-pulse"><Flame className="text-orange-500 fill-orange-500" size={40} /></div><p className="text-sm font-bold text-gray-600 px-4">Hoy marcaste un día sin gastos. Eso te acerca más a tu libertad financiera.</p><p className="text-xs text-gray-400 font-black uppercase tracking-widest">Racha: <span className="text-orange-500 text-lg">{userStats.currentStreak} días</span></p><button onClick={() => setStreakModalOpen(false)} className="w-full py-3 text-[10px] font-bold text-gray-400">Genial</button></div></Modal>
         <Modal isOpen={dailyCloseOpen} onClose={() => setDailyCloseOpen(false)} title="Resumen del Día 🌙"><div className="space-y-6"><div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center"><div className="flex gap-3 items-center"><div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Wallet size={18}/></div><div><p className="text-xs font-bold text-gray-500 uppercase">Gastado Hoy</p><p className="font-black text-lg">{formatMoney(movimientos.filter(m => m.tipo === 'GASTO' && m.timestamp?.toDate && m.timestamp.toDate().toDateString() === new Date().toDateString()).reduce((a,b)=>a+safeMonto(b.monto),0))}</p></div></div></div><div className="text-center pt-2"><button onClick={() => setDailyCloseOpen(false)} className="w-full bg-black text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-transform">Descansar</button></div></div></Modal>

         {toast && (
           <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-top duration-300 ${
             toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
           }`}>
             {toast.message}
           </div>
         )}
       </div>
     </div>
   );
};

export default App;