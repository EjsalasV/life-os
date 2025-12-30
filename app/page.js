"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { useUser } from '@/context/auth';
import { 
  collection, doc, addDoc, onSnapshot, 
  deleteDoc, serverTimestamp, updateDoc, increment, getDoc, setDoc, query, orderBy 
} from 'firebase/firestore';
import { 
  // Iconos UI General
  Plus, Settings, Trash2, Moon, Sun, X, Info,
  Loader2, Sparkles, Flame, ShieldCheck, LogOut,
  // Iconos Navegación
  Wallet, Store, Activity,
  // Iconos para Formularios (que se quedaron en el Modal)
  Pill, SunMedium, Brain, PlusCircle
} from 'lucide-react';

// --- IMPORTACIÓN DE VISTAS (LO NUEVO) ---
import FinanzasView from './components/views/FinanzasView';
import VentasView from './components/views/VentasView';
import SaludView from './components/views/SaludView';
import SettingsView from './components/views/SettingsView';

// --- UTILIDADES ---
const getTime = (t) => {
  if (!t) return 0;
  if (typeof t.toMillis === 'function') return t.toMillis();
  if (t instanceof Date) return t.getTime();
  if (t.seconds) return t.seconds * 1000;
  return 0;
};

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const safeMonto = (m) => {
  if (!m) return 0;
  const n = parseFloat(m); 
  return isNaN(n) ? 0 : n;
};

const formatMoney = (m) => safeMonto(m).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });

// --- CONSTANTES ---
const CATEGORIAS = [
  { id: 'trabajo', label: 'Trabajo', color: 'bg-emerald-500' },
  { id: 'ocio', label: 'Ocio', color: 'bg-indigo-500' },
  { id: 'comida', label: 'Alimentación', color: 'bg-orange-500' },
  { id: 'transporte', label: 'Transporte', color: 'bg-blue-500' },
  { id: 'salud', label: 'Salud', color: 'bg-rose-500' },
  { id: 'hogar', label: 'Hogar', color: 'bg-amber-600' },
  { id: 'otros', label: 'Otros', color: 'bg-gray-500' },
];

const FRASES_ASISTENTE = [
  "El dinero es una herramienta, úsala bien.",
  "Pequeños gastos, grandes agujeros.",
  "Tu 'yo' del futuro te agradecerá este control.",
  "Mantén el ritmo, vas excelente.",
  "¿Ya revisaste tus metas hoy?"
];

// --- COMPONENTE MODAL (SE QUEDA AQUÍ PARA MANEJAR FORMULARIOS) ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full bg-white rounded-t-[45px] p-6 pb-12 animate-in slide-in-from-bottom duration-300 max-w-[390px] overflow-y-auto max-h-[90%] shadow-2xl border-t border-gray-100">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- INICIO DE LA APP ---
const App = () => {
   const { user, register, login, logOut, loading: authLoading } = useUser();
   
   // --- A. ESTADOS DE INTERFAZ ---
   const [activeTab, setActiveTab] = useState('finanzas'); 
   const [finSubTab, setFinSubTab] = useState('control');  
   const [ventasSubTab, setVentasSubTab] = useState('panel'); 
   const [saludSubTab, setSaludSubTab] = useState('vitalidad'); 
   
   const [darkMode, setDarkMode] = useState(false);
   const [modalOpen, setModalOpen] = useState(null); 
   const [streakModalOpen, setStreakModalOpen] = useState(false); 
   const [errorMsg, setErrorMsg] = useState(""); 
   
   const [dailyCloseOpen, setDailyCloseOpen] = useState(false); 
   const [forceLoad, setForceLoad] = useState(false); 
 
   // --- B. ESTADOS DE AUTENTICACIÓN ---
   const [isRegistering, setIsRegistering] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [nombre, setNombre] = useState("");
   const [authError, setAuthError] = useState("");
 
   // --- C. ESTADOS DE SELECCIÓN ---
   const [selectedAccountId, setSelectedAccountId] = useState(null);
   const [selectedMeta, setSelectedMeta] = useState(null);
   const [selectedBudgetCat, setSelectedBudgetCat] = useState(null); 
   const [carrito, setCarrito] = useState([]); 
   const [busquedaProd, setBusquedaProd] = useState(""); 
 
   // --- D. DATOS DE FIREBASE ---
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
 
   // --- E. FORMULARIO UNIFICADO ---
   const FORM_INITIAL = { 
     nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', 
     categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '',
     precioVenta: '', costo: '', stock: '', cliente: '', 
     tipoEjercicio: 'cardio', duracion: '20', 
     tipoComida: 'almuerzo', calidadComida: 'normal', 
     horasSueno: '7', calidadSueno: 'regular', 
     frecuencia: 'Diario', iconType: 'pill', 
     peso: '' 
   };
   const [formData, setFormData] = useState(FORM_INITIAL);
 
   // --- F. REFERENCIAS A FIREBASE ---
   const colRef = (uid, colName) => collection(db, 'users', uid, colName);
   const docRef = (uid, colName, id) => doc(db, 'users', uid, colName, id);

   // --- G. CARGA DE DATOS ---
   useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) setForceLoad(true);
    }, 3000); 
    return () => clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    if (!user) return;
    
    const userUnsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
       if(doc.exists()) setUserStats(doc.data().stats || { lastActivity: null, currentStreak: 0 });
    });

    const collectionsToLoad = [
      'movimientos', 'cuentas', 'fijos', 'metas', 'presupuestos', 
      'productos', 'ventas', 'habitos', 'peso' 
    ];

    const streams = collectionsToLoad.map(name => {
      return onSnapshot(colRef(user.uid, name), (s) => {
        const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
        if (name === 'movimientos') setMovimientos(data);
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

    const historyQuery = query(colRef(user.uid, 'salud_diaria'), orderBy('fecha', 'desc'));
    const historyUnsub = onSnapshot(historyQuery, (s) => {
       const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
       setHistorialSalud(data);
    });

    const todayKey = getTodayKey(); 
    const dailyHealthRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);

    const healthUnsub = onSnapshot(dailyHealthRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        setSaludHoy(docSnapshot.data());
      } else {
        const initialData = {
          fecha: todayKey,
          bateria: 50,
          agua: 0,
          sueñoHoras: 0,
          sueñoCalidad: 'regular',
          animo: 'normal',
          ejercicioMinutos: 0,
          comidas: {},
          habitosChecks: [],
          lastUpdate: serverTimestamp()
        };
        await setDoc(dailyHealthRef, initialData);
        setSaludHoy(initialData);
      }
    });

    return () => {
      userUnsub();
      healthUnsub();
      historyUnsub();
      streams.forEach(unsub => unsub());
    };
  }, [user]);

  // --- H. LÓGICA PROTOCOLO ---
  const calculateBattery = (data) => {
   if (!data) return 50;
   let scoreSueño = 25; 
   if (data.sueñoCalidad === 'mal') scoreSueño = 10;
   if (data.sueñoCalidad === 'bien') scoreSueño = 40;
   const scoreAgua = Math.min((data.agua || 0) * 2.5, 20);
   let scoreEjercicio = 0;
   const mins = parseInt(data.ejercicioMinutos || 0);
   if (mins >= 10) scoreEjercicio = 10;
   if (mins >= 20) scoreEjercicio = 20;
   if (mins >= 40) scoreEjercicio = 30;
   const scoreAnimo = data.animo === 'genial' ? 10 : 0;
   return Math.min(scoreSueño + scoreAgua + scoreEjercicio + scoreAnimo, 100);
 };

 const updateHealthStat = async (field, value) => {
   if (!user || !saludHoy) return;
   const todayKey = getTodayKey();
   const docRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);
   let finalValue = value;
   if (field === 'ejercicioMinutos' && parseInt(saludHoy.ejercicioMinutos) === value) {
       finalValue = 0;
   }
   const newData = { ...saludHoy, [field]: finalValue };
   const newBattery = calculateBattery(newData);
   await updateDoc(docRef, { [field]: finalValue, bateria: newBattery, lastUpdate: serverTimestamp() });
 };

 const toggleComida = async (tipoComida, calidad) => {
   if (!user || !saludHoy) return;
   const todayKey = getTodayKey();
   const docRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);
   const comidasActuales = saludHoy.comidas || {};
   const nuevaCalidad = comidasActuales[tipoComida] === calidad ? null : calidad;
   const nuevasComidas = { ...comidasActuales, [tipoComida]: nuevaCalidad };
   await updateDoc(docRef, { comidas: nuevasComidas, lastUpdate: serverTimestamp() });
 };

 const toggleHabitCheck = async (habitoId) => {
   if (!user || !saludHoy) return;
   const todayKey = getTodayKey();
   const docRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);
   const checksActuales = saludHoy.habitosChecks || [];
   let nuevosChecks;
   if (checksActuales.includes(habitoId)) nuevosChecks = checksActuales.filter(id => id !== habitoId);
   else nuevosChecks = [...checksActuales, habitoId];
   await updateDoc(docRef, { habitosChecks: nuevosChecks, lastUpdate: serverTimestamp() });
 };

 const addWater = () => updateHealthStat('agua', (saludHoy?.agua || 0) + 1);
 const removeWater = () => updateHealthStat('agua', Math.max((saludHoy?.agua || 0) - 1, 0));

 // --- I. LÓGICA DE NEGOCIO (POS) ---
 const addToCart = (producto) => {
   if (producto.stock <= 0) { alert("¡Sin stock!"); return; }
   const existing = carrito.find(p => p.id === producto.id);
   if (existing) {
      if (existing.cantidad >= producto.stock) { alert("Stock insuficiente"); return; }
      setCarrito(carrito.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
   } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
   }
 };

 const handleCheckout = async (cuentaDestinoId) => {
    if (carrito.length === 0) return;
    if (!cuentaDestinoId) { setErrorMsg("Selecciona cuenta destino"); return; }
    try {
      const totalVenta = carrito.reduce((a, b) => a + (b.precioVenta * b.cantidad), 0);
      const costoVenta = carrito.reduce((a, b) => a + (b.costo * b.cantidad), 0); 
      const reciboId = String(ventas.length + 1).padStart(3, '0');
      const clienteNombre = formData.cliente || "Consumidor Final";
      const nuevaVentaRef = doc(colRef(user.uid, 'ventas'));
      const ventaId = nuevaVentaRef.id;
      await setDoc(nuevaVentaRef, {
         reciboId: reciboId, cliente: clienteNombre, items: carrito,
         total: totalVenta, costoTotal: costoVenta, ganancia: totalVenta - costoVenta,
         cuentaId: cuentaDestinoId, timestamp: serverTimestamp()
      });
      for (const item of carrito) {
         await updateDoc(docRef(user.uid, 'productos', item.id), { stock: increment(-item.cantidad) });
      }
      await updateDoc(docRef(user.uid, 'cuentas', cuentaDestinoId), { monto: increment(totalVenta) });
      await addDoc(colRef(user.uid, 'movimientos'), {
         nombre: `Venta #${reciboId} - ${clienteNombre}`, monto: totalVenta, tipo: 'INGRESO',
         categoria: 'trabajo', cuentaId: cuentaDestinoId, cuentaNombre: cuentas.find(c => c.id === cuentaDestinoId)?.nombre || 'Caja',
         ventaRefId: ventaId, timestamp: serverTimestamp()
      });
      setCarrito([]); setModalOpen(null); setFormData(FORM_INITIAL);
    } catch (e) { setErrorMsg("Error: " + e.message); }
 };

 const handleGenerarPedido = () => {
  const faltantes = productos.filter(p => p.stock <= 5);
  if (faltantes.length === 0) { alert("¡Todo tiene buen stock! Nada que pedir."); return; }
  const textoPedido = `📋 *PEDIDO REQUERIDO:*\n\n` + 
     faltantes.map(p => `- ${p.nombre} (Stock actual: ${p.stock})`).join('\n') +
     `\n\nGenerado por Life OS.`;
  navigator.clipboard.writeText(textoPedido);
  alert("📋 Lista de faltantes copiada al portapapeles.");
 };

 // --- J. LÓGICA FINANZAS (CRUD) ---
 const saveBudget = async () => {
    if (!selectedBudgetCat || !formData.limite) return;
    const limiteNum = safeMonto(formData.limite);
    const existing = presupuestos.find(p => p.categoriaId === selectedBudgetCat.id);
    if (existing) await updateDoc(docRef(user.uid, 'presupuestos', existing.id), { limite: limiteNum });
    else await addDoc(colRef(user.uid, 'presupuestos'), { categoriaId: selectedBudgetCat.id, limite: limiteNum, categoriaLabel: selectedBudgetCat.label });
    setModalOpen(null); setFormData(FORM_INITIAL);
 };

 const handleSave = async (col) => {
   if (!user) return;
   try {
     if (col === 'productos') {
        if (!formData.nombre || !formData.precioVenta) { setErrorMsg("Faltan datos"); return; }
        await addDoc(colRef(user.uid, 'productos'), {
           nombre: formData.nombre, precioVenta: safeMonto(formData.precioVenta),
           costo: safeMonto(formData.costo), stock: safeMonto(formData.stock), timestamp: serverTimestamp()
        });
     }
     else if (col === 'habitos') {
        if (!formData.nombre) return;
        await addDoc(colRef(user.uid, 'habitos'), { 
            nombre: formData.nombre, frecuencia: formData.frecuencia, 
            iconType: formData.iconType || 'pill', timestamp: serverTimestamp() 
        });
     }
     else if (col === 'peso') {
        if (!formData.peso) return;
        await addDoc(colRef(user.uid, 'peso'), { kilos: safeMonto(formData.peso), fecha: getTodayKey(), timestamp: serverTimestamp() });
     }
     else if (col === 'movimientos') {
         if (!formData.monto) { setErrorMsg("Ingresa un monto"); return; }
         const valor = safeMonto(formData.monto);
         if (formData.tipo === 'TRANSFERENCIA') {
           if (!formData.cuentaId || !formData.cuentaDestinoId) { setErrorMsg("Faltan cuentas"); return; }
           await updateDoc(docRef(user.uid, 'cuentas', formData.cuentaId), { monto: increment(-valor) });
           await updateDoc(docRef(user.uid, 'cuentas', formData.cuentaDestinoId), { monto: increment(valor) });
           await addDoc(colRef(user.uid, 'movimientos'), {
             nombre: `Transf: ${cuentas.find(c=>c.id===formData.cuentaId).nombre} -> ${cuentas.find(c=>c.id===formData.cuentaDestinoId).nombre}`,
             monto: valor, tipo: 'TRANSFERENCIA', cuentaId: formData.cuentaId, cuentaDestinoId: formData.cuentaDestinoId, timestamp: serverTimestamp()
           });
         } else {
            const dataToSave = { ...formData, monto: valor, timestamp: serverTimestamp() };
            if (formData.cuentaId) {
               const nSaldo = formData.tipo === 'INGRESO' ? increment(valor) : increment(-valor);
               await updateDoc(docRef(user.uid, 'cuentas', formData.cuentaId), { monto: nSaldo });
               dataToSave.cuentaNombre = cuentas.find(c => c.id === formData.cuentaId)?.nombre || 'Cuenta';
            }
            await addDoc(colRef(user.uid, col), dataToSave);
         }
     } else {
         await addDoc(colRef(user.uid, col), { ...formData, monto: safeMonto(formData.monto), timestamp: serverTimestamp() });
     }
     updateStreak(); setModalOpen(null); setFormData(FORM_INITIAL);
   } catch (e) { setErrorMsg("Error: " + e.message); }
 };

 const handleAhorroMeta = async () => {
   if (!user || !selectedMeta || !formData.monto || !formData.cuentaId) return;
   const valor = safeMonto(formData.monto);
   await updateDoc(docRef(user.uid, 'cuentas', formData.cuentaId), { monto: increment(-valor) });
   await updateDoc(docRef(user.uid, 'metas', selectedMeta.id), { montoActual: increment(valor) });
   await addDoc(colRef(user.uid, 'movimientos'), {
     nombre: `Ahorro: ${selectedMeta.nombre}`, monto: valor, tipo: 'GASTO', 
     cuentaId: formData.cuentaId, cuentaNombre: cuentas.find(c => c.id === formData.cuentaId)?.nombre, categoria: 'otros', timestamp: serverTimestamp()
   });
   setModalOpen(null); setFormData(FORM_INITIAL);
 };

 const deleteItem = async (col, item) => {
   if(!confirm('¿Eliminar? Se revertirán los valores asociados.')) return;
   try {
     if (col === 'movimientos') {
        if (item.ventaRefId) {
            const ventaExiste = ventas.find(v => v.id === item.ventaRefId);
            if (ventaExiste) { alert("⚠️ Borra la VENTA desde el Módulo de Negocio."); return; }
            await deleteDoc(docRef(user.uid, col, item.id)); return;
        }
        if (item.cuentaId) {
            const cuentaRef = docRef(user.uid, 'cuentas', item.cuentaId);
            const cuentaSnap = await getDoc(cuentaRef);
            if (cuentaSnap.exists()) {
                if (item.tipo === 'TRANSFERENCIA' && item.cuentaDestinoId) {
                    await updateDoc(cuentaRef, { monto: increment(item.monto) });
                    await updateDoc(docRef(user.uid, 'cuentas', item.cuentaDestinoId), { monto: increment(-item.monto) });
                } else {
                    const reverso = item.tipo === 'INGRESO' ? -item.monto : item.monto;
                    await updateDoc(cuentaRef, { monto: increment(reverso) });
                }
            }
        }
     }
     
     if (col === 'ventas') {
        if (item.cuentaId) {
            const cuentaRef = docRef(user.uid, 'cuentas', item.cuentaId);
            const cuentaSnap = await getDoc(cuentaRef);
            if (cuentaSnap.exists()) await updateDoc(cuentaRef, { monto: increment(-item.total) });
        }
        if (item.items) {
            for (const prod of item.items) {
                await updateDoc(docRef(user.uid, 'productos', prod.id), { stock: increment(prod.cantidad) });
            }
        }
        const movAsociado = movimientos.find(m => m.ventaRefId === item.id);
        if (movAsociado) await deleteDoc(docRef(user.uid, 'movimientos', movAsociado.id));
     }

     await deleteDoc(docRef(user.uid, col, item.id));
   } catch (e) { alert("Error controlado: " + e.message); }
 };

 const updateStreak = async () => { 
   if (!user) return;
   const now = new Date();
   const last = userStats.lastActivity?.toDate ? userStats.lastActivity.toDate() : new Date(0);
   const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
   const isSameDay = startOfDay(now).getTime() === startOfDay(last).getTime();
   const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
   const isNextDay = startOfDay(yesterday).getTime() === startOfDay(last).getTime();
   let newStreak = userStats.currentStreak;
   if (!isSameDay) {
     if (isNextDay) newStreak += 1; else newStreak = 1; 
     await updateDoc(doc(db, 'users', user.uid), {'stats.lastActivity': serverTimestamp(), 'stats.currentStreak': newStreak});
   }
 };
 const handleNoSpendToday = async () => { await updateStreak(); setStreakModalOpen(true); };
 const handleAuth = async (e) => { e.preventDefault(); try { if (isRegistering) await register(email.trim(), password, nombre); else await login(email, password); } catch (err) { setAuthError(err.message); } };

 // --- K. CÁLCULOS VISUALES (FIX DE FECHAS AQUÍ) ---
 const presupuestoData = useMemo(() => {
   // FIX: Filtramos por MES y AÑO actual para evitar mezcla de años
   const now = new Date();
   const gastosMes = movimientos
     .filter(m => {
        if (m.tipo !== 'GASTO' || !m.timestamp?.toDate) return false;
        const d = m.timestamp.toDate();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
     })
     .reduce((acc, m) => { acc[m.categoria] = (acc[m.categoria] || 0) + safeMonto(m.monto); return acc; }, {});
   
   return CATEGORIAS.map(c => ({
     ...c,
     // Icono necesario para la vista
     icon: ({size}) => <div className={`w-${size} h-${size} rounded-full bg-white/20`} />, 
     limite: safeMonto(presupuestos.find(p => p.categoriaId === c.id)?.limite) || 0,
     gastado: gastosMes[c.id] || 0
   }));
 }, [movimientos, presupuestos]);

 const balanceMes = useMemo(() => {
   const now = new Date();
   // FIX: Filtro estricto de mes actual
   const movimientosMes = movimientos.filter(m => {
       if (!m.timestamp?.toDate) return false;
       const d = m.timestamp.toDate();
       return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
   });
   const ingresos = movimientosMes.filter(m => m.tipo === 'INGRESO').reduce((a,b)=>a+safeMonto(b.monto),0);
   const gastos = movimientosMes.filter(m => m.tipo === 'GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
   
   const dineroTotal = cuentas.reduce((a,c)=>a+safeMonto(c.monto),0);
   const gastosFijosTotal = fijos.reduce((a,f)=>a+safeMonto(f.monto),0);
   const proyeccion = dineroTotal - gastosFijosTotal;

   return { ingresos, gastos, balance: ingresos - gastos, proyeccion };
 }, [movimientos, cuentas, fijos]);

 const smartMessage = useMemo(() => {
   const now = new Date();
   const totalGastos = movimientos
    .filter(m => m.tipo === 'GASTO' && m.timestamp?.toDate && m.timestamp.toDate().getMonth() === now.getMonth())
    .reduce((a,b)=>a+safeMonto(b.monto),0);
   
   if (totalGastos === 0) return "Empieza hoy y tendrás control desde el primer día.";
   if (userStats.currentStreak > 3) return FRASES_ASISTENTE[Math.floor(Math.random() * FRASES_ASISTENTE.length)];
   return `Has movido ${formatMoney(totalGastos)} este mes. ¿Controlamos ese presupuesto?`;
 }, [movimientos, userStats]);

 // --- RENDERIZADO (APP PRINCIPAL) ---
 if (authLoading && !forceLoad) return (
   <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-4">
       <Loader2 className="animate-spin text-blue-600"/>
       {forceLoad && <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold animate-pulse border border-rose-200">¿Tarda mucho? Reiniciar App</button>}
   </div>
 );

 if (!user) return (
   <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center mb-6 shadow-xl shadow-blue-200"><Sparkles className="text-white" size={40}/></div>
      <h1 className="text-3xl font-black mb-2 text-blue-900">Life OS</h1>
      <p className="mb-8 text-gray-400 text-sm font-bold">Tu sistema operativo personal.</p>
      <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
        {isRegistering && <input type="text" placeholder="Tu Nombre" className="w-full p-4 rounded-2xl bg-white font-bold outline-none border-2 border-transparent focus:border-blue-100" value={nombre} onChange={e => setNombre(e.target.value)} />}
        <input type="email" placeholder="Correo" className="w-full p-4 rounded-2xl bg-white font-bold outline-none border-2 border-transparent focus:border-blue-100" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-2xl bg-white font-bold outline-none border-2 border-transparent focus:border-blue-100" value={password} onChange={e => setPassword(e.target.value)} />
        {authError && <p className="text-rose-500 text-xs font-bold p-2 bg-rose-50 rounded-lg">{authError}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-transform">{isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} className="mt-6 text-xs font-bold text-gray-400">{isRegistering ? "¿Ya tienes cuenta? Inicia Sesión" : "¿Nuevo aquí? Crea una cuenta"}</button>
   </div>
 );

 return (
   <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-black' : 'bg-[#f2f2f7]'} p-4 font-sans select-none text-[#1c1c1e]`}>
     <div className={`w-full max-w-[390px] h-[844px] rounded-[55px] shadow-2xl overflow-hidden relative flex flex-col transition-colors duration-500 ${darkMode ? 'bg-[#1c1c1e] text-white' : 'bg-white text-black'}`}>
       
       {/* HEADER GLOBAL */}
       <div className="px-6 pt-12 pb-2">
         <div className="flex justify-between items-center mb-2">
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Life OS</span>
             {userStats.currentStreak > 0 && <div className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse"><Flame size={12} className="text-orange-500 fill-orange-500"/><span className="text-[9px] font-black text-orange-600">{userStats.currentStreak} días</span></div>}
           </div>
           <button onClick={()=>setDarkMode(!darkMode)} className="text-gray-400 active:scale-90 transition-transform">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
         </div>
         <h1 className="text-3xl font-black tracking-tight capitalize">{activeTab}</h1>
       </div>

       {/* CONTENIDO SCROLLABLE (AQUÍ USAMOS LAS VISTAS) */}
       <div className="flex-1 overflow-y-auto px-5 pb-32 pt-2 space-y-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
         
         {activeTab === 'finanzas' && (
           <FinanzasView 
             finSubTab={finSubTab} setFinSubTab={setFinSubTab}
             smartMessage={smartMessage} userStats={userStats}
             handleNoSpendToday={handleNoSpendToday}
             balanceMes={balanceMes} formatMoney={formatMoney}
             presupuestoData={presupuestoData}
             setSelectedBudgetCat={setSelectedBudgetCat}
             setModalOpen={setModalOpen} setFormData={setFormData} formData={formData}
             cuentas={cuentas} setSelectedAccountId={setSelectedAccountId} selectedAccountId={selectedAccountId}
             deleteItem={deleteItem} movimientos={movimientos}
             fijos={fijos} metas={metas} setSelectedMeta={setSelectedMeta} getTime={getTime}
           />
         )}

         {activeTab === 'ventas' && (
           <VentasView 
             ventasSubTab={ventasSubTab} setVentasSubTab={setVentasSubTab}
             ventas={ventas} formatMoney={formatMoney} safeMonto={safeMonto}
             deleteItem={deleteItem} getTime={getTime}
             productos={productos} busquedaProd={busquedaProd} setBusquedaProd={setBusquedaProd}
             addToCart={addToCart} setModalOpen={setModalOpen}
             carrito={carrito} setCarrito={setCarrito}
             handleGenerarPedido={handleGenerarPedido}
           />
         )}

         {activeTab === 'salud' && (
           <SaludView 
             saludSubTab={saludSubTab} setSaludSubTab={setSaludSubTab}
             saludHoy={saludHoy} updateHealthStat={updateHealthStat}
             removeWater={removeWater} addWater={addWater}
             toggleComida={toggleComida} habitos={habitos}
             toggleHabitCheck={toggleHabitCheck} deleteItem={deleteItem}
             historialPeso={historialPeso} safeMonto={safeMonto}
             historialSalud={historialSalud} getTodayKey={getTodayKey}
             setModalOpen={setModalOpen}
           />
         )}

         {activeTab === 'settings' && (
           <SettingsView 
             user={user} setDailyCloseOpen={setDailyCloseOpen} logOut={logOut}
           />
         )}
       </div>

       {/* FAB */}
       {activeTab === 'finanzas' && finSubTab === 'billetera' && (
          <button onClick={() => setModalOpen('movimiento')} className="absolute bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50 hover:bg-gray-900"><Plus size={28} strokeWidth={3} /></button>
       )}

       {/* DOCK INFERIOR */}
       <div className="h-24 border-t flex justify-around pt-4 backdrop-blur-md bg-white/90 border-gray-100 z-50">
          {[{ id: 'finanzas', icon: Wallet, l: 'Wallet' }, { id: 'ventas', icon: Store, l: 'Negocio' }, { id: 'salud', icon: Activity, l: 'Protocolo' }, { id: 'settings', icon: Settings, l: 'Perfil' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === t.id ? (t.id === 'salud' ? 'text-teal-600 scale-110' : t.id==='ventas' ? 'text-black scale-110' : 'text-blue-600 scale-110') : 'text-gray-400'}`}>
               <t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 2} />
               <span className="text-[9px] font-black uppercase">{t.l}</span>
            </button>
          ))}
       </div>

       {/* === MODAL MAESTRO (CONSERVA LOS FORMULARIOS) === */}
       <Modal isOpen={!!modalOpen} onClose={() => {setModalOpen(null); setErrorMsg("");}} 
          title={modalOpen === 'producto' ? 'Nuevo Producto' : modalOpen === 'cobrar' ? 'Cobrar Venta' : modalOpen === 'habito' ? 'Añadir al Protocolo' : modalOpen === 'peso' ? 'Registrar Peso' : 'Registrar'}>
         <div className="space-y-4">
           {errorMsg && <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl flex gap-2 items-center"><Info size={14}/> {errorMsg}</div>}
           
           {modalOpen === 'producto' ? (
              <>
                 <input placeholder="Nombre" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                 <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="P. Venta" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-black" value={formData.precioVenta} onChange={(e) => setFormData({...formData, precioVenta: e.target.value})} />
                    <input type="number" placeholder="Costo" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold" value={formData.costo} onChange={(e) => setFormData({...formData, costo: e.target.value})} />
                 </div>
                 <input type="number" placeholder="Stock Inicial" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </>
           ) : modalOpen === 'cobrar' ? (
              <div className="space-y-4 text-center animate-in zoom-in-95">
                 <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Total a recibir</p>
                 <p className="text-5xl font-black tracking-tighter">{formatMoney(carrito.reduce((a,b)=>a+(b.precioVenta*b.cantidad),0))}</p>
                 <div className="text-left space-y-3 pt-4">
                    <div><label className="text-[10px] font-black uppercase text-gray-400 ml-2">Destino</label><select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1" value={formData.cuentaId} onChange={(e)=>setFormData({...formData, cuentaId: e.target.value})}><option value="">Selecciona Cuenta</option>{cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
                 </div>
              </div>
           ) : modalOpen === 'habito' ? (
              <>
                 <input placeholder="Nombre (Ej: Bloqueador)" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                 <div className="flex gap-2 justify-center py-2">
                     {[{id:'pill', i:Pill, l:'Medicina'}, {id:'sun', i:SunMedium, l:'Cuidado'}, {id:'brain', i:Brain, l:'Mente'}].map(ic => (
                         <button key={ic.id} onClick={()=>setFormData({...formData, iconType: ic.id})} className={`p-3 rounded-xl flex flex-col items-center gap-1 w-24 border-2 transition-all ${formData.iconType === ic.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-100 text-gray-400'}`}>
                            <ic.i size={20}/> <span className="text-[9px] font-black uppercase">{ic.l}</span>
                         </button>
                     ))}
                 </div>
                 <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.frecuencia} onChange={(e)=>setFormData({...formData, frecuencia: e.target.value})}><option value="Diario">Diario</option><option value="Semanal">Semanal</option></select>
              </>
           ) : modalOpen === 'peso' ? (
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Kg</span><input type="number" placeholder="0.0" className="w-full bg-gray-100 p-4 pl-12 rounded-2xl outline-none font-black text-xl" value={formData.peso} onChange={(e) => setFormData({...formData, peso: e.target.value})} /></div>
           ) : (
              <>
                {modalOpen === 'presupuesto' ? (
                   <input autoFocus type="number" placeholder="Límite Mensual ($)" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-black text-xl" value={formData.limite} onChange={(e) => setFormData({...formData, limite: e.target.value})} />
                ) : (
                  <>
                    {modalOpen !== 'ahorroMeta' && <input placeholder="Concepto" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />}
                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span><input type="number" placeholder="0.00" className="w-full bg-gray-100 p-4 pl-8 rounded-2xl outline-none font-black text-xl" value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} /></div>
                    {modalOpen === 'movimiento' && (
                      <>
                         <div className="flex gap-2">{['GASTO', 'INGRESO'].map(t => (<button key={t} onClick={()=>setFormData({...formData, tipo: t})} className={`flex-1 py-3 rounded-xl font-black text-xs ${formData.tipo === t ? (t==='INGRESO'?'bg-emerald-500 text-white':'bg-rose-500 text-white') : 'bg-gray-100 text-gray-400'}`}>{t}</button>))}</div>
                         <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.categoria} onChange={(e)=>setFormData({...formData, categoria: e.target.value})}>{CATEGORIAS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select>
                         <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.cuentaId} onChange={(e)=>setFormData({...formData, cuentaId: e.target.value})}><option value="">Selecciona Cuenta...</option>{cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre} (${formatMoney(c.monto)})</option>)}</select>
                      </>
                    )}
                    {modalOpen === 'transferencia' && (
                       <div className="space-y-3">
                         <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.cuentaId} onChange={(e)=>setFormData({...formData, cuentaId: e.target.value, tipo: 'TRANSFERENCIA'})}><option value="">Desde</option>{cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre} (${formatMoney(c.monto)})</option>)}</select>
                         <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.cuentaDestinoId} onChange={(e)=>setFormData({...formData, cuentaDestinoId: e.target.value})}><option value="">Hacia</option>{cuentas.filter(c=>c.id !== formData.cuentaId).map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
                       </div>
                    )}
                    {(modalOpen === 'ahorroMeta' || modalOpen === 'fijo') && (modalOpen === 'fijo' ? (<div className="flex gap-3"><input type="number" placeholder="Día" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold" value={formData.diaCobro} onChange={(e)=>setFormData({...formData, diaCobro: e.target.value})} /></div>) : (<select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={formData.cuentaId} onChange={(e)=>setFormData({...formData, cuentaId: e.target.value})}><option value="">¿De qué cuenta?</option>{cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select>))}
                  </>
                )}
              </>
           )}

           <button onClick={() => {
               if (modalOpen === 'cobrar') handleCheckout(formData.cuentaId);
               else if (modalOpen === 'presupuesto') saveBudget();
               else if (modalOpen === 'ahorroMeta') handleAhorroMeta();
               else if (modalOpen === 'meta') { if (!formData.nombre || !formData.monto) return; addDoc(colRef(user.uid, 'metas'), { nombre: formData.nombre, montoObjetivo: safeMonto(formData.monto), montoActual: 0, timestamp: serverTimestamp() }); setModalOpen(null); setFormData(FORM_INITIAL); }
               else handleSave(
                   modalOpen === 'producto' ? 'productos' : 
                   modalOpen === 'habito' ? 'habitos' :
                   modalOpen === 'peso' ? 'peso' :
                   modalOpen === 'movimiento' || modalOpen === 'transferencia' ? 'movimientos' : 
                   modalOpen === 'cuenta' ? 'cuentas' : 'fijos'
               );
             }} className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-4 uppercase text-xs tracking-widest">
             {modalOpen === 'cobrar' ? 'Confirmar Venta' : 'Guardar'}
           </button>
         </div>
       </Modal>

       {/* MODAL RACHA */}
       <Modal isOpen={streakModalOpen} onClose={() => setStreakModalOpen(false)} title="¡Tu racha sigue viva! 🔥">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center animate-pulse"><Flame className="text-orange-500 fill-orange-500" size={40} /></div>
            <p className="text-sm font-bold text-gray-600 px-4">Hoy marcaste un día sin gastos. Eso te acerca más a tu libertad financiera.</p>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Racha: <span className="text-orange-500 text-lg">{userStats.currentStreak} días</span></p>
            <button onClick={() => setStreakModalOpen(false)} className="w-full py-3 text-[10px] font-bold text-gray-400">Genial</button>
          </div>
       </Modal>

       {/* MODAL CIERRE DEL DÍA */}
       <Modal isOpen={dailyCloseOpen} onClose={() => setDailyCloseOpen(false)} title="Resumen del Día 🌙">
          <div className="space-y-6">
             <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                <div className="flex gap-3 items-center">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Wallet size={18}/></div>
                   <div><p className="text-xs font-bold text-gray-500 uppercase">Gastado Hoy</p><p className="font-black text-lg">{formatMoney(movimientos.filter(m => m.tipo === 'GASTO' && m.timestamp?.toDate && m.timestamp.toDate().toDateString() === new Date().toDateString()).reduce((a,b)=>a+safeMonto(b.monto),0))}</p></div>
                </div>
                {movimientos.some(m => m.tipo === 'GASTO' && m.timestamp?.toDate && m.timestamp.toDate().toDateString() === new Date().toDateString()) ? <span className="text-rose-500 font-bold text-xs">Gastaste</span> : <span className="text-emerald-500 font-bold text-xs">Ahorraste</span>}
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                <div className="flex gap-3 items-center">
                   <div className="p-2 bg-black text-white rounded-xl"><Store size={18}/></div>
                   <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Ventas / Ganancia</p>
                      <div className="flex gap-2 items-baseline">
                         <p className="font-black text-lg">{formatMoney(ventas.reduce((a,v)=>a+safeMonto(v.total),0))}</p>
                         <p className="text-xs font-bold text-emerald-500">({formatMoney(ventas.reduce((a,v)=>a+safeMonto(v.ganancia),0))})</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                <div className="flex gap-3 items-center">
                   <div className="p-2 bg-teal-100 text-teal-600 rounded-xl"><Activity size={18}/></div>
                   <div><p className="text-xs font-bold text-gray-500 uppercase">Energía Final</p><p className="font-black text-lg">{saludHoy?.bateria || 50}%</p></div>
                </div>
                <div className="flex gap-1">
                   {[...Array(Math.min(saludHoy?.agua || 0, 5))].map((_,i)=><div key={i} className="w-2 h-2 rounded-full bg-cyan-400"></div>)}
                </div>
             </div>
             <div className="text-center pt-2">
                <p className="text-xs font-bold text-gray-400 mb-4">"Mañana es otra oportunidad para hacerlo mejor."</p>
                <button onClick={() => setDailyCloseOpen(false)} className="w-full bg-black text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-transform">Descansar</button>
             </div>
          </div>
       </Modal>
     </div>
   </div>
 );
};

export default App;