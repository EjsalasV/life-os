"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { useUser } from '@/context/AuthContext';
import { 
  collection, doc, addDoc, onSnapshot, 
  deleteDoc, serverTimestamp, updateDoc, increment, getDoc, setDoc, query, orderBy, where 
} from 'firebase/firestore';
import { 
  // UI General
  Plus, PlusCircle, Settings, Trash2, Bell, Check, Moon, Sun, X, Info, Repeat,
  Loader2, Sparkles, Flame, Calendar, Shield, ShieldCheck, LogOut, RefreshCw,
  // Finanzas
  TrendingUp, TrendingDown, Wallet, Target, ArrowRightLeft, 
  PiggyBank, CreditCard, DollarSign,
  // Categorías Finanzas
  Briefcase, Gamepad2, Coffee, Car, Heart, Home,
  // Negocio
  Store, ShoppingCart, Tag, ShoppingBag, Calculator, Users, 
  Archive, FileText, User, History, Package, ClipboardCopy,
  // Salud / Protocolo (Nuevos iconos incluidos)
  Activity, Droplet, Zap, Battery, BatteryCharging, 
  Utensils, Salad, Pizza, Soup,
  Dumbbell, PersonStanding, Timer,
  Pill, Stethoscope, Thermometer, BarChart2,
  Brain, ClipboardCheck, Smile, SunMedium 
} from 'lucide-react';

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
  { id: 'trabajo', label: 'Trabajo', icon: Briefcase, color: 'bg-emerald-500' },
  { id: 'ocio', label: 'Ocio', icon: Gamepad2, color: 'bg-indigo-500' },
  { id: 'comida', label: 'Alimentación', icon: Coffee, color: 'bg-orange-500' },
  { id: 'transporte', label: 'Transporte', icon: Car, color: 'bg-blue-500' },
  { id: 'salud', label: 'Salud', icon: Heart, color: 'bg-rose-500' },
  { id: 'hogar', label: 'Hogar', icon: Home, color: 'bg-amber-600' },
  { id: 'otros', label: 'Otros', icon: Sparkles, color: 'bg-gray-500' },
];

const FRASES_ASISTENTE = [
  "El dinero es una herramienta, úsala bien.",
  "Pequeños gastos, grandes agujeros.",
  "Tu 'yo' del futuro te agradecerá este control.",
  "Mantén el ritmo, vas excelente.",
  "¿Ya revisaste tus metas hoy?"
];

// --- COMPONENTE MODAL (DISEÑO ORIGINAL) ---
// Volvimos al diseño con bordes extra redondeados (rounded-t-[45px]) y estilo limpio
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
   const { user, userData, register, login, logOut, loading: authLoading } = useUser();
   
   // --- A. ESTADOS DE INTERFAZ (Navegación) ---
   const [activeTab, setActiveTab] = useState('finanzas'); // Pestaña Principal
   const [finSubTab, setFinSubTab] = useState('control');  // Finanzas: Control | Billetera | Futuro
   const [ventasSubTab, setVentasSubTab] = useState('panel'); // Negocio: Panel | Operar | Inventario
   const [saludSubTab, setSaludSubTab] = useState('vitalidad'); // Salud: Vitalidad | Registro | Expediente
   
   const [darkMode, setDarkMode] = useState(false);
   const [modalOpen, setModalOpen] = useState(null); // Controla qué ventana flota
   const [streakModalOpen, setStreakModalOpen] = useState(false); // Modal de Fuego/Racha
   const [errorMsg, setErrorMsg] = useState(""); // Mensajes de error en rojo
   
   // --- A.2 NUEVOS ESTADOS (MEJORAS LÓGICAS) ---
   const [dailyCloseOpen, setDailyCloseOpen] = useState(false); // Modal "Cierre del Día"
   const [forceLoad, setForceLoad] = useState(false); // "Seguro de Vida" para el bug de carga
 
   // --- B. ESTADOS DE AUTENTICACIÓN ---
   const [isRegistering, setIsRegistering] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [nombre, setNombre] = useState("");
   const [authError, setAuthError] = useState("");
 
   // --- C. ESTADOS DE SELECCIÓN ---
   // Finanzas
   const [selectedAccountId, setSelectedAccountId] = useState(null);
   const [selectedMeta, setSelectedMeta] = useState(null);
   const [selectedBudgetCat, setSelectedBudgetCat] = useState(null); 
   // Negocio
   const [carrito, setCarrito] = useState([]); // Lista de productos en el POS
   const [busquedaProd, setBusquedaProd] = useState(""); // Buscador de inventario
 
   // --- D. DATOS DE FIREBASE (La Memoria) ---
   // 1. Finanzas
   const [movimientos, setMovimientos] = useState([]);
   const [cuentas, setCuentas] = useState([]);
   const [fijos, setFijos] = useState([]);
   const [metas, setMetas] = useState([]);
   const [presupuestos, setPresupuestos] = useState([]);
   const [userStats, setUserStats] = useState({ lastActivity: null, currentStreak: 0 });
   
   // 2. Negocio
   const [productos, setProductos] = useState([]);
   const [ventas, setVentas] = useState([]); // Historial de recibos
 
   // 3. Salud / Protocolo
   const [saludHoy, setSaludHoy] = useState(null); // Objeto con la data de HOY
   const [habitos, setHabitos] = useState([]); // Lista de "Protocolo" (Vitaminas, etc.)
   const [historialPeso, setHistorialPeso] = useState([]); // Gráfica de peso
   const [historialSalud, setHistorialSalud] = useState([]); // Historial de días anteriores
 
   // --- E. FORMULARIO UNIFICADO ---
   // Un solo estado para controlar TODOS los inputs de la App
   const FORM_INITIAL = { 
     // > Finanzas
     nombre: '', monto: '', tipo: 'GASTO', cuentaId: '', cuentaDestinoId: '', 
     categoria: 'otros', periodicidad: 'Mensual', diaCobro: '1', limite: '',
     
     // > Negocio (Inventario y Ventas)
     precioVenta: '', costo: '', stock: '', 
     cliente: '', // Para el recibo
     
     // > Salud (Registro Diario)
     // Ejercicio
     tipoEjercicio: 'cardio', // pesas, cardio, deporte
     duracion: '20', // 10, 20, 40 (Minutos)
     // Comida
     tipoComida: 'almuerzo', // desayuno, almuerzo, cena
     calidadComida: 'normal', // ligero, normal, pesado
     // Sueño
     horasSueno: '7',
     calidadSueno: 'regular', // mal, regular, bien
     
     // > Protocolo (Configuración)
     frecuencia: 'Diario', 
     iconType: 'pill', // NUEVO: pill (Pastilla), sun (Cuidado), brain (Mente)
     
     notaMedica: '',
     peso: '' 
   };
   const [formData, setFormData] = useState(FORM_INITIAL);
 
   // --- F. REFERENCIAS A FIREBASE (Helpers) ---
   const colRef = (uid, colName) => collection(db, 'users', uid, colName);
   const docRef = (uid, colName, id) => doc(db, 'users', uid, colName, id);
// --- G. CARGA DE DATOS Y SINCRONIZACIÓN (BLINDADA) ---
  
  // 1. SISTEMA ANTI-CONGELAMIENTO (BUG FIX)
  // Si la autenticación tarda más de 3 segundos, asumimos que hay un problema de caché
  // y activamos el botón de "Reinicio de Emergencia".
  useEffect(() => {
   const timer = setTimeout(() => {
     if (authLoading) {
       setForceLoad(true);
     }
   }, 3000); // 3 segundos de tolerancia

   return () => clearTimeout(timer);
 }, [authLoading]);


 // 2. LISTENERS DE DATOS (El Cerebro)
 useEffect(() => {
   if (!user) return;
   
   // A. Listener Global de Usuario (Racha y Estadísticas)
   const userUnsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if(doc.exists()) setUserStats(doc.data().stats || { lastActivity: null, currentStreak: 0 });
   });

   // B. Listeners de Colecciones (Carga masiva de datos)
   const collectionsToLoad = [
     // > Finanzas
     'movimientos', 'cuentas', 'fijos', 'metas', 'presupuestos', 
     // > Negocio
     'productos', 'ventas',
     // > Protocolo / Salud (Largo Plazo)
     'habitos', 'peso' 
   ];

   const streams = collectionsToLoad.map(name => {
     return onSnapshot(colRef(user.uid, name), (s) => {
       const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
       
       // Asignación inteligente a su estado
       if (name === 'movimientos') setMovimientos(data);
       if (name === 'cuentas') setCuentas(data);
       if (name === 'fijos') setFijos(data);
       if (name === 'metas') setMetas(data);
       if (name === 'presupuestos') setPresupuestos(data);
       
       if (name === 'productos') setProductos(data);
       if (name === 'ventas') setVentas(data);
       
       if (name === 'habitos') setHabitos(data); // Tu Protocolo
       if (name === 'peso') setHistorialPeso(data);
     });
   });

   // C. Listener del Historial de Salud (Para ver días anteriores)
   const historyQuery = query(colRef(user.uid, 'salud_diaria'), orderBy('fecha', 'desc'));
   const historyUnsub = onSnapshot(historyQuery, (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistorialSalud(data);
   });

   // D. LISTENER ESPECÍFICO DE "HOY" (El Reseteo Diario)
   // Esto revisa si ya existe el documento de hoy (YYYY-MM-DD).
   const todayKey = getTodayKey(); 
   const dailyHealthRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);

   const healthUnsub = onSnapshot(dailyHealthRef, async (docSnapshot) => {
     if (docSnapshot.exists()) {
       // Ya existe registro de hoy, lo cargamos
       setSaludHoy(docSnapshot.data());
     } else {
       // ¡Es un NUEVO DÍA! (O primera vez hoy)
       // Creamos el registro inicial automáticamente.
       const initialData = {
         fecha: todayKey,
         bateria: 50, // Empezamos al 50%
         agua: 0,
         sueñoHoras: 0,
         sueñoCalidad: 'regular',
         animo: 'normal',
         ejercicioMinutos: 0,
         comidas: {}, // Objeto vacío para las comidas del día
         habitosChecks: [], // Lista vacía de checks del Protocolo
         lastUpdate: serverTimestamp()
       };
       
       // Guardamos en Firebase con el ID de la fecha
       await setDoc(dailyHealthRef, initialData);
       setSaludHoy(initialData);
     }
   });

   // CLEANUP (Evitar fugas de memoria)
   return () => {
     userUnsub();
     healthUnsub();
     historyUnsub();
     streams.forEach(unsub => unsub());
   };
 }, [user]);
// --- H. LÓGICA PROTOCOLO (BIO-OS) ---

  // 1. Calculadora de Batería (Algoritmo Estricto)
  const calculateBattery = (data) => {
   if (!data) return 50;
   
   // A. Sueño (Base: 10 - 40 pts)
   let scoreSueño = 25; 
   if (data.sueñoCalidad === 'mal') scoreSueño = 10;
   if (data.sueñoCalidad === 'bien') scoreSueño = 40;
   
   // B. Agua (0 - 20 pts) -> 2.5 pts por vaso (Max 8 vasos)
   const scoreAgua = Math.min((data.agua || 0) * 2.5, 20);
   
   // C. Ejercicio (0 - 30 pts)
   let scoreEjercicio = 0;
   const mins = parseInt(data.ejercicioMinutos || 0);
   if (mins >= 10) scoreEjercicio = 10;
   if (mins >= 20) scoreEjercicio = 20;
   if (mins >= 40) scoreEjercicio = 30;

   // D. Ánimo (Bonus +10 pts)
   const scoreAnimo = data.animo === 'genial' ? 10 : 0;

   // Total (Tope 100)
   return Math.min(scoreSueño + scoreAgua + scoreEjercicio + scoreAnimo, 100);
 };

 // 2. Actualizar Dato Genérico (Agua, Sueño, Ánimo, Ejercicio)
 const updateHealthStat = async (field, value) => {
   if (!user || !saludHoy) return;
   const todayKey = getTodayKey();
   const docRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);
   
   // Lógica Toggle para Ejercicio (Si tocas el mismo, se deselecciona a 0)
   let finalValue = value;
   if (field === 'ejercicioMinutos' && parseInt(saludHoy.ejercicioMinutos) === value) {
       finalValue = 0;
   }

   const newData = { ...saludHoy, [field]: finalValue };
   const newBattery = calculateBattery(newData);

   await updateDoc(docRef, {
     [field]: finalValue,
     bateria: newBattery,
     lastUpdate: serverTimestamp()
   });
 };

 // 3. Actualizar Comidas (Independientes)
 const toggleComida = async (tipoComida, calidad) => {
   if (!user || !saludHoy) return;
   const todayKey = getTodayKey();
   const docRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);
   
   const comidasActuales = saludHoy.comidas || {};
   // Si ya estaba seleccionado, lo quitamos (null), si no, lo ponemos
   const nuevaCalidad = comidasActuales[tipoComida] === calidad ? null : calidad;
   const nuevasComidas = { ...comidasActuales, [tipoComida]: nuevaCalidad };

   await updateDoc(docRef, { comidas: nuevasComidas, lastUpdate: serverTimestamp() });
 };

 // 4. Check de Hábitos (Protocolo)
 const toggleHabitCheck = async (habitoId) => {
   if (!user || !saludHoy) return;
   const todayKey = getTodayKey();
   const docRef = doc(db, 'users', user.uid, 'salud_diaria', todayKey);
   
   const checksActuales = saludHoy.habitosChecks || [];
   let nuevosChecks;

   if (checksActuales.includes(habitoId)) {
       nuevosChecks = checksActuales.filter(id => id !== habitoId); // Quitar check
   } else {
       nuevosChecks = [...checksActuales, habitoId]; // Poner check
   }

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
 const removeFromCart = (prodId) => setCarrito(carrito.filter(p => p.id !== prodId));

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

 // --- J. LÓGICA FINANZAS Y GENERAL (CRUD) ---

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
        // AQUÍ GUARDAMOS EL TIPO DE ICONO
        if (!formData.nombre) return;
        await addDoc(colRef(user.uid, 'habitos'), { 
            nombre: formData.nombre, 
            frecuencia: formData.frecuencia, 
            iconType: formData.iconType || 'pill', 
            timestamp: serverTimestamp() 
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

 // --- K. LÓGICA DE ELIMINACIÓN (FIX BLINDADO) ---
 const deleteItem = async (col, item) => {
   if(!confirm('¿Eliminar? Se revertirán los valores asociados.')) return;
   try {
     // 1. MOVIMIENTOS (WALLET)
     if (col === 'movimientos') {
        if (item.ventaRefId) {
            const ventaExiste = ventas.find(v => v.id === item.ventaRefId);
            if (ventaExiste) { alert("⚠️ Borra la VENTA desde el Módulo de Negocio."); return; }
            // Si la venta ya no existe (huérfano), dejamos borrar sin error.
            await deleteDoc(docRef(user.uid, col, item.id)); return;
        }
        // FIX: Verificar si la cuenta existe antes de devolver dinero
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
     
     // 2. VENTAS (NEGOCIO)
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
 const handleAuth = async (e) => { e.preventDefault(); try { if (isRegistering) await register(email, password, nombre); else await login(email, password); } catch (err) { setAuthError(err.message); } };
// --- L. CÁLCULOS VISUALES (MEMORIZADOS) ---

  // Datos para Presupuestos (Barras de progreso)
  const presupuestoData = useMemo(() => {
   const gastosMes = movimientos
     .filter(m => m.tipo === 'GASTO' && m.timestamp?.toDate && m.timestamp.toDate().getMonth() === new Date().getMonth())
     .reduce((acc, m) => { acc[m.categoria] = (acc[m.categoria] || 0) + safeMonto(m.monto); return acc; }, {});
   return CATEGORIAS.map(c => ({
     ...c,
     limite: safeMonto(presupuestos.find(p => p.categoriaId === c.id)?.limite) || 0,
     gastado: gastosMes[c.id] || 0
   }));
 }, [movimientos, presupuestos]);

 // Balance Mensual y PROYECCIÓN (NUEVO CÁLCULO)
 const balanceMes = useMemo(() => {
   const movimientosMes = movimientos.filter(m => m.timestamp?.toDate && m.timestamp.toDate().getMonth() === new Date().getMonth());
   const ingresos = movimientosMes.filter(m => m.tipo === 'INGRESO').reduce((a,b)=>a+safeMonto(b.monto),0);
   const gastos = movimientosMes.filter(m => m.tipo === 'GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
   
   // Proyección: Dinero Total - Gastos Fijos Totales
   const dineroTotal = cuentas.reduce((a,c)=>a+safeMonto(c.monto),0);
   const gastosFijosTotal = fijos.reduce((a,f)=>a+safeMonto(f.monto),0);
   const proyeccion = dineroTotal - gastosFijosTotal;

   return { ingresos, gastos, balance: ingresos - gastos, proyeccion };
 }, [movimientos, cuentas, fijos]);

 // Gráfica de Dona
 const donutStyles = useMemo(() => {
   const total = movimientos.filter(m => m.tipo === 'GASTO').reduce((a,b)=>a+safeMonto(b.monto),0) || 1;
   let accum = 0;
   const segments = presupuestoData.filter(c => c.gastado > 0).map(c => {
       const start = (accum / total) * 100;
       accum += c.gastado;
       const end = (accum / total) * 100;
       const colorMap = { 'bg-emerald-500':'#10b981', 'bg-indigo-500':'#6366f1', 'bg-orange-500':'#f97316', 'bg-blue-500':'#3b82f6', 'bg-rose-500':'#f43f5e', 'bg-amber-600':'#d97706', 'bg-gray-500':'#6b7280' };
       return `${colorMap[c.color] || '#ccc'} ${start}% ${end}%`;
   });
   return { background: segments.length ? `conic-gradient(${segments.join(', ' )})` : '#f3f4f6' };
 }, [presupuestoData, movimientos]);

 // Mensaje Inteligente
 const smartMessage = useMemo(() => {
   const totalGastos = movimientos.filter(m => m.tipo === 'GASTO').reduce((a,b)=>a+safeMonto(b.monto),0);
   if (totalGastos === 0) return "Empieza hoy y tendrás control desde el primer día.";
   if (userStats.currentStreak > 3) return FRASES_ASISTENTE[Math.floor(Math.random() * FRASES_ASISTENTE.length)];
   return `Has movido ${formatMoney(totalGastos)} este mes. ¿Controlamos ese presupuesto?`;
 }, [movimientos, userStats]);

 // Generador de Pedido (Negocio)
 const handleGenerarPedido = () => {
    const faltantes = productos.filter(p => p.stock <= 5);
    if (faltantes.length === 0) { alert("¡Todo tiene buen stock! Nada que pedir."); return; }
    
    const textoPedido = `📋 *PEDIDO REQUERIDO:*\n\n` + 
       faltantes.map(p => `- ${p.nombre} (Stock actual: ${p.stock})`).join('\n') +
       `\n\nGenerado por Life OS.`;
       
    navigator.clipboard.writeText(textoPedido);
    alert("📋 Lista de faltantes copiada al portapapeles.");
 };

 // --- VISTAS (RENDERIZADO) ---
 
 // PANTALLA DE CARGA (CON BOTÓN DE EMERGENCIA SI TARDA MUCHO)
 if (authLoading && !forceLoad) return (
   <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-4">
       <Loader2 className="animate-spin text-blue-600"/>
       {/* Botón Anti-Bug: Solo aparece si forceLoad es true (después de 3 segs) */}
       {forceLoad && (
           <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold animate-pulse border border-rose-200">
               ¿Tarda mucho? Reiniciar App
           </button>
       )}
   </div>
 );

 // PANTALLA DE LOGIN (DISEÑO ORIGINAL: BLANCO Y AZUL)
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

 // APP WRAPPER PRINCIPAL
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

       {/* CONTENIDO SCROLLABLE (Scroll Invisible) */}
       <div className="flex-1 overflow-y-auto px-5 pb-32 pt-2 space-y-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
         
         {/* ==================== MÓDULO 1: FINANZAS ==================== */}
         {activeTab === 'finanzas' && (
           <>
             {/* Navegación Interna */}
             <div className="flex p-1 bg-gray-100 rounded-2xl mb-2 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                {[{ id: 'control', l: 'Control' }, { id: 'billetera', l: 'Billetera' }, { id: 'futuro', l: 'Futuro' }].map(t => (
                  <button key={t.id} onClick={() => setFinSubTab(t.id)} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${finSubTab === t.id ? 'bg-white shadow text-blue-600 scale-95' : 'text-gray-400'}`}>{t.l}</button>
                ))}
             </div>

             {/* 1.1 CONTROL */}
             {finSubTab === 'control' && (
               <div className="space-y-6 animate-in fade-in">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                     <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Sparkles size={16}/></div>
                     <div><p className="text-[10px] uppercase font-black text-blue-400 mb-0.5">Asistente</p><p className="text-xs font-bold text-blue-900 leading-snug">{smartMessage}</p></div>
                  </div>
                  <div className="p-6 rounded-[30px] bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg relative overflow-hidden text-center">
                     <Flame className="absolute -right-4 -bottom-4 text-white opacity-20" size={120} />
                     <h2 className="text-5xl font-black mb-1">{userStats.currentStreak}</h2>
                     <p className="text-[10px] uppercase font-black opacity-80 mb-4">Días de Racha</p>
                     <button onClick={handleNoSpendToday} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 mx-auto transition-all active:scale-95"><ShieldCheck size={16}/> Hoy no gasté nada</button>
                  </div>
                  
                  {/* NUEVA TARJETA: PROYECCIÓN (Estilo colorido original) */}
                  <div className="p-5 bg-indigo-900 text-white rounded-[25px] shadow-lg flex justify-between items-center relative overflow-hidden">
                     <div className="absolute -left-4 -top-4 w-20 h-20 bg-indigo-700 rounded-full blur-2xl"></div>
                     <div className="relative z-10">
                       <p className="text-[10px] uppercase font-black text-indigo-200 mb-1">Proyección Fin de Mes</p>
                       <p className="text-2xl font-black">{formatMoney(balanceMes.proyeccion)}</p>
                       <p className="text-[9px] text-indigo-300 font-bold mt-1">Cashflow libre estimado</p>
                     </div>
                     <Target className="text-indigo-400 relative z-10" size={24}/>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100"><div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-500"/><span className="text-[9px] font-black text-emerald-400 uppercase">Ingresos</span></div><p className="text-lg font-black text-emerald-900">{formatMoney(balanceMes.ingresos)}</p></div>
                     <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100"><div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-rose-500"/><span className="text-[9px] font-black text-rose-400 uppercase">Gastos</span></div><p className="text-lg font-black text-rose-900">{formatMoney(balanceMes.gastos)}</p></div>
                  </div>
                  <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-[25px]">
                     <div className="w-24 h-24 rounded-full flex-shrink-0 relative" style={donutStyles}><div className="absolute inset-4 bg-gray-50 rounded-full flex items-center justify-center"><span className="text-[10px] font-black text-gray-400">Gastos</span></div></div>
                     <div className="flex-1 space-y-1"><p className="text-xs font-bold mb-2">Top Categorías</p>{presupuestoData.filter(c=>c.gastado>0).sort((a,b)=>b.gastado-a.gastado).slice(0,3).map(c => (<div key={c.id} className="flex justify-between text-[10px]"><div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${c.color}`}/> {c.label}</div><span className="font-bold">{formatMoney(c.gastado)}</span></div>))}{presupuestoData.every(c=>c.gastado===0) && <p className="text-[10px] text-gray-400">Sin datos este mes</p>}</div>
                  </div>
                  <div className="space-y-3">{presupuestoData.map(cat => {const porcentaje = cat.limite > 0 ? Math.min((cat.gastado / cat.limite) * 100, 100) : 0; const colorBarra = porcentaje >= 100 ? 'bg-rose-500' : porcentaje > 80 ? 'bg-amber-400' : 'bg-emerald-400'; return (<div key={cat.id} className="bg-white border border-gray-100 p-4 rounded-2xl relative"><button onClick={()=>{setSelectedBudgetCat(cat); setModalOpen('presupuesto'); setFormData({...formData, limite: cat.limite || ''})}} className="absolute top-4 right-4 text-gray-300 hover:text-blue-500 active:scale-90 transition-transform"><Settings size={14}/></button><div className="flex items-center gap-2 mb-2"><div className={`p-1.5 rounded-lg ${cat.color} text-white`}><cat.icon size={14}/></div><span className="text-xs font-bold">{cat.label}</span></div><div className="flex justify-between text-[10px] font-black mb-1 text-gray-400"><span>Gastado: {formatMoney(cat.gastado)}</span><span>Límite: {cat.limite > 0 ? formatMoney(cat.limite) : '∞'}</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${colorBarra} transition-all duration-500`} style={{ width: `${porcentaje}%` }} /></div></div>)})}</div>
               </div>
             )}

             {/* 1.2 BILLETERA */}
             {finSubTab === 'billetera' && (
               <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setModalOpen('transferencia')} className="p-4 bg-black text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"><ArrowRightLeft size={16}/> Transferir</button>
                     <button onClick={() => setSelectedAccountId(null)} className="p-4 bg-gray-100 text-gray-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"><Wallet size={16}/> Ver Todo</button>
                  </div>
                  <div className="overflow-x-auto flex gap-3 pb-2 snap-x" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <div className="snap-center min-w-[140px] p-4 rounded-3xl flex flex-col justify-between h-32 border-2 border-blue-600 bg-blue-50 relative overflow-hidden"><Shield className="absolute right-[-10px] bottom-[-10px] text-blue-200 opacity-50" size={60} /><div className="p-2 bg-blue-200 text-blue-700 rounded-full w-fit"><ShieldCheck size={16}/></div><div className="text-left relative z-10"><p className="text-[9px] uppercase font-black opacity-60 mb-0.5">Todo tu dinero</p><p className="font-black text-lg text-blue-900">{formatMoney(cuentas.reduce((a,c)=>a+safeMonto(c.monto),0))}</p></div></div>
                    {cuentas.map(c => (<button key={c.id} onClick={()=>setSelectedAccountId(c.id)} className={`snap-center min-w-[140px] p-4 rounded-3xl flex flex-col justify-between h-32 border-2 transition-all relative group ${selectedAccountId === c.id ? 'border-black bg-gray-900 text-white' : 'border-transparent bg-white shadow-sm'}`}><div onClick={(e)=>{e.stopPropagation(); deleteItem('cuentas', c)}} className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 hover:text-rose-500"><Trash2 size={12}/></div><div className={`p-2 rounded-full w-fit ${selectedAccountId === c.id ? 'bg-white/20' : 'bg-gray-100'}`}><Wallet size={16}/></div><div className="text-left"><p className="text-[10px] uppercase font-black opacity-50">{c.nombre}</p><p className="font-black text-lg">{formatMoney(c.monto)}</p></div></button>))}
                    <button onClick={()=>setModalOpen('cuenta')} className="snap-center min-w-[80px] rounded-3xl flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 active:bg-gray-200"><Plus size={24}/></button>
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-3 pl-2">{selectedAccountId ? 'Historial de Cuenta' : 'Últimos Movimientos'}</h3>
                    <div className="space-y-2 pb-20">
                      {movimientos.filter(m => selectedAccountId ? (m.cuentaId === selectedAccountId || m.cuentaDestinoId === selectedAccountId) : true).sort((a,b) => getTime(b.timestamp) - getTime(a.timestamp)).map(m => (<div key={m.id} className="p-4 rounded-2xl flex justify-between items-center bg-white border border-gray-100 group"><div className="flex gap-3 items-center"><div className={`p-2 rounded-xl ${m.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-600' : m.tipo === 'TRANSFERENCIA' ? 'bg-gray-100 text-gray-600' : 'bg-rose-100 text-rose-600'}`}>{m.tipo === 'INGRESO' ? <TrendingUp size={16}/> : m.tipo === 'TRANSFERENCIA' ? <ArrowRightLeft size={16}/> : <TrendingDown size={16}/>}</div><div><p className="font-bold text-sm">{m.nombre}</p><p className="text-[10px] text-gray-400 uppercase">{m.categoria || 'General'}</p></div></div><div className="flex items-center gap-3"><p className={`font-black text-sm ${m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-gray-900'}`}>{m.tipo === 'INGRESO' ? '+' : m.tipo === 'GASTO' ? '-' : ''}{formatMoney(m.monto)}</p><button onClick={()=>deleteItem('movimientos', m)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></div></div>))}
                      {movimientos.length === 0 && (<div className="text-center p-10 opacity-40 font-bold text-sm bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200"><p>Aún no hay movimientos.</p><button onClick={()=>setModalOpen('movimiento')} className="text-blue-600 mt-2 underline">Registrar el primero</button></div>)}
                    </div>
                  </div>
               </div>
             )}

             {/* 1.3 FUTURO */}
             {finSubTab === 'futuro' && (
               <div className="space-y-6 animate-in fade-in">
                  <div className="bg-black text-white p-6 rounded-[30px] shadow-xl shadow-gray-200 flex justify-between items-center relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                     <div className="relative z-10">
                        <p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Gastos Fijos Mensuales</p>
                        <h2 className="text-3xl font-black">{formatMoney(fijos.reduce((a,f)=>a+safeMonto(f.monto),0))}</h2>
                     </div>
                     <button onClick={()=>setModalOpen('fijo')} className="relative z-10 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors active:scale-95 backdrop-blur-md"><Plus size={20}/></button>
                  </div>
                  <div className="space-y-2">{fijos.map(f => (<div key={f.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-black transition-colors group"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-xs text-gray-900 border border-gray-100">Dia {f.diaCobro}</div><div><span className="font-bold text-sm block">{f.nombre}</span><span className="text-[10px] text-gray-400 font-bold uppercase">Mensual</span></div></div><div className="flex items-center gap-3"><span className="font-black">{formatMoney(f.monto)}</span><button onClick={()=>deleteItem('fijos', f)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></div></div>))}</div>
                  <div><div className="flex justify-between items-center mb-3 px-2"><h3 className="font-black text-lg">Tus Metas</h3><button onClick={()=>setModalOpen('meta')} className="bg-black text-white p-1 rounded-full"><Plus size={16}/></button></div><div className="grid grid-cols-2 gap-3 pb-20">{metas.map(m => {const progreso = m.montoObjetivo > 0 ? Math.min((m.montoActual / m.montoObjetivo) * 100, 100) : 0; return (<div key={m.id} className="p-4 bg-white border border-gray-100 rounded-[25px] flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-lg transition-shadow"><div><div className="flex justify-between mb-2"><Target size={18} className="text-emerald-500"/><button onClick={()=>deleteItem('metas', m)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button></div><p className="font-black text-sm leading-tight mb-1">{m.nombre}</p><p className="text-[10px] text-gray-400 font-bold">{formatMoney(m.montoActual)} / {formatMoney(m.montoObjetivo)}</p></div><div><div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{width: `${progreso}%`}}/></div><button onClick={()=>{setSelectedMeta(m); setModalOpen('ahorroMeta');}} className="w-full py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase hover:scale-95 transition-transform">Ahorrar +</button></div></div>)})}{metas.length === 0 && <div className="col-span-2 text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl text-xs font-bold text-gray-400">Sin metas no hay paraíso. <br/>Crea la primera hoy.</div>}</div></div>
               </div>
             )}
           </>
         )}

         {/* ==================== MÓDULO 2: NEGOCIO ==================== */}
         {activeTab === 'ventas' && (
           <>
             <div className="flex p-1 bg-gray-100 rounded-2xl mb-2 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                {[{ id: 'panel', l: 'Panel' }, { id: 'operar', l: 'Operar' }, { id: 'inventario', l: 'Inventario' }].map(t => (
                  <button key={t.id} onClick={() => setVentasSubTab(t.id)} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${ventasSubTab === t.id ? 'bg-white shadow text-black scale-95' : 'text-gray-400'}`}>{t.l}</button>
                ))}
             </div>

             {/* 2.1 PANEL NEGOCIO */}
             {ventasSubTab === 'panel' && (
               <div className="space-y-4 animate-in fade-in">
                  <div className="p-6 bg-black text-white rounded-[30px] shadow-xl relative overflow-hidden">
                     <div className="relative z-10">
                       <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Balance del Día</p>
                       <div className="flex justify-between items-end mb-4">
                          <div><p className="text-3xl font-black">{formatMoney(ventas.reduce((a,v)=>a+safeMonto(v.ganancia),0))}</p><p className="text-[10px] text-emerald-400 font-bold mt-1">Ganancia Neta Real</p></div>
                          <div className="text-right opacity-60"><p className="text-sm font-bold">{formatMoney(ventas.reduce((a,v)=>a+safeMonto(v.total),0))}</p><p className="text-[9px] uppercase">Ventas Brutas</p></div>
                       </div>
                       <div className="p-3 bg-gray-800 rounded-xl text-xs font-bold text-gray-300 flex gap-2"><Info size={16} className="text-blue-400"/><span>{ventas.length > 0 ? "Negocio activo. Revisa el stock regularmente." : "Abre caja y registra tu primera venta."}</span></div>
                     </div>
                  </div>
                  {/* Historial Recibos */}
                  <div className="bg-white border border-gray-100 p-4 rounded-[25px]">
                     <h3 className="font-black text-lg mb-3 px-2">Últimas Ventas</h3>
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-1" style={{scrollbarWidth:'none'}}>
                        {[...ventas].sort((a,b)=>getTime(b.timestamp)-getTime(a.timestamp)).map((v) => (
                          <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex flex-col items-center justify-center"><span className="text-[8px] font-black text-gray-400">REC</span><span className="text-[10px] font-black">#{v.reciboId || '000'}</span></div>
                                <div><p className="font-bold text-xs">{v.cliente || 'Consumidor Final'}</p><p className="text-[9px] text-gray-400">{v.items?.length} items • {new Date(getTime(v.timestamp)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
                             </div>
                             <div className="flex items-center gap-3"><span className="font-black text-sm">{formatMoney(v.total)}</span><button onClick={()=>deleteItem('ventas', v)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></div>
                          </div>
                        ))}
                        {ventas.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No hay ventas registradas hoy.</p>}
                     </div>
                  </div>
               </div>
             )}

             {/* 2.2 POS Y 2.3 INVENTARIO (Con Botón Copiar Pedido) */}
             {ventasSubTab === 'operar' && (
               <div className="space-y-4 animate-in fade-in h-full flex flex-col">
                  <input placeholder="🔍 Buscar producto..." className="w-full bg-gray-100 p-3 rounded-2xl outline-none font-bold text-sm" value={busquedaProd} onChange={e=>setBusquedaProd(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-32" style={{scrollbarWidth: 'none'}}>
                     {productos.filter(p => p.nombre.toLowerCase().includes(busquedaProd.toLowerCase())).map(p => (
                       <button key={p.id} onClick={()=>addToCart(p)} disabled={p.stock <= 0} className={`p-4 rounded-2xl border-2 flex flex-col justify-between h-28 text-left transition-all active:scale-95 ${p.stock <= 0 ? 'bg-gray-50 border-gray-100 opacity-50' : 'bg-white border-gray-100 hover:border-black'}`}>
                          <div><p className="font-black text-sm leading-tight">{p.nombre}</p><p className="text-[10px] text-gray-400 font-bold">{p.stock} disp.</p></div>
                          <div className="flex justify-between items-end"><p className="font-black text-lg">{formatMoney(p.precioVenta)}</p><div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center"><Plus size={14}/></div></div>
                       </button>
                     ))}
                     <button onClick={()=>setModalOpen('producto')} className="p-4 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-28 text-gray-400 gap-2 active:bg-gray-100"><PlusCircle size={24}/> <span className="text-[10px] font-bold uppercase">Nuevo Prod.</span></button>
                  </div>
                  {carrito.length > 0 && (
                    <div className="absolute bottom-24 left-4 right-4 bg-black text-white p-4 rounded-[25px] shadow-2xl animate-in slide-in-from-bottom flex justify-between items-center z-50">
                       <div className="flex items-center gap-3"><div className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center font-black">{carrito.reduce((a,b)=>a+b.cantidad,0)}</div><div><p className="text-[10px] uppercase font-black text-gray-400">Total a Cobrar</p><p className="text-xl font-black">{formatMoney(carrito.reduce((a,b)=>a+(b.precioVenta*b.cantidad),0))}</p></div></div>
                       <div className="flex gap-2"><button onClick={()=>setCarrito([])} className="p-3 bg-gray-800 rounded-xl hover:bg-rose-500 transition-colors"><Trash2 size={20}/></button><button onClick={()=>setModalOpen('cobrar')} className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest active:scale-95">Cobrar</button></div>
                    </div>
                  )}
               </div>
             )}

             {ventasSubTab === 'inventario' && (
               <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center px-2">
                      <h3 className="font-black text-lg">Tus Productos</h3>
                      <div className="flex gap-2">
                          {/* Botón Nuevo: Generar Pedido */}
                          <button onClick={handleGenerarPedido} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-blue-200 transition-colors"><ClipboardCopy size={14}/> Copiar Pedido</button>
                          <button onClick={()=>setModalOpen('producto')} className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"><Plus size={14}/> Crear</button>
                      </div>
                  </div>
                  <div className="space-y-2 pb-24">
                     {productos.map(p => (
                       <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-center group">
                          <div><p className="font-bold text-sm">{p.nombre}</p><div className="flex gap-2 text-[10px] font-bold text-gray-400"><span>Venta: {formatMoney(p.precioVenta)}</span><span className="text-emerald-500">Ganancia: {formatMoney(p.precioVenta - p.costo)}</span></div></div>
                          <div className="flex items-center gap-3"><span className={`px-2 py-1 rounded-lg text-[10px] font-black ${p.stock < 5 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.stock} Stock</span><button onClick={()=>deleteItem('productos', p)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></div>
                       </div>
                     ))}
                  </div>
               </div>
             )}
           </>
         )}
{/* ==================== MÓDULO 3: PROTOCOLO (BIO-OS) ==================== */}
{activeTab === 'salud' && (
            <>
              {/* Navegación Interna */}
              <div className="flex p-1 bg-gray-100 rounded-2xl mb-2 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
                 {[{ id: 'vitalidad', l: 'Vitalidad' }, { id: 'registro', l: 'Registro' }, { id: 'expediente', l: 'Expediente' }].map(t => (
                   <button key={t.id} onClick={() => setSaludSubTab(t.id)} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${saludSubTab === t.id ? 'bg-white shadow text-teal-600 scale-95' : 'text-gray-400'}`}>{t.l}</button>
                 ))}
              </div>

              {/* 3.1 VITALIDAD (Panel de Control) */}
              {saludSubTab === 'vitalidad' && (
                <div className="space-y-6 animate-in fade-in">
                   {/* BATERÍA CORPORAL */}
                   <div className="bg-white border border-gray-100 p-6 rounded-[30px] shadow-sm flex flex-col items-center relative overflow-hidden">
                      <div className={`absolute top-0 w-full h-2 ${saludHoy?.bateria > 70 ? 'bg-emerald-500' : saludHoy?.bateria > 30 ? 'bg-amber-400' : 'bg-rose-500'}`}></div>
                      <div className="flex justify-between w-full mb-2">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Batería Corporal</h3>
                          <button onClick={()=>updateHealthStat('agua', 0)} className="text-[9px] text-gray-300 hover:text-rose-500 flex items-center gap-1"><Repeat size={10}/> Reset Hoy</button>
                      </div>
                      
                      {/* Círculo Gráfico */}
                      <div className="relative w-40 h-40 flex items-center justify-center">
                         <div className={`w-full h-full rounded-full border-[8px] opacity-20 ${saludHoy?.bateria > 70 ? 'border-emerald-500' : saludHoy?.bateria > 30 ? 'border-amber-400' : 'border-rose-500'}`}></div>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Zap size={32} className={`mb-1 ${saludHoy?.bateria > 70 ? 'text-emerald-500 fill-emerald-500' : saludHoy?.bateria > 30 ? 'text-amber-400 fill-amber-400' : 'text-rose-500 fill-rose-500'}`} />
                            <span className="text-4xl font-black text-gray-800">{saludHoy?.bateria || 50}%</span>
                         </div>
                      </div>

                      <div className="mt-6 p-3 bg-gray-50 rounded-xl text-center w-full">
                         <p className="text-xs font-bold text-gray-500">
                           {(saludHoy?.bateria || 0) < 40 ? "Necesitas recuperarte. Prioriza sueño y agua." : 
                            (saludHoy?.bateria || 0) < 80 ? "Vas bien. Un poco de ejercicio te llevaría al 100%." : 
                            "¡Energía al máximo! Rompe tus límites hoy."}
                         </p>
                      </div>
                   </div>

                   {/* CONTADORES RÁPIDOS */}
                   <div className="grid grid-cols-2 gap-3">
                      {/* Agua */}
                      <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-[25px] flex flex-col items-center justify-between h-32">
                         <div className="flex items-center gap-1 text-cyan-600"><Droplet size={18} className="fill-cyan-600"/><span className="text-[10px] font-black uppercase">Agua</span></div>
                         <div className="text-3xl font-black text-cyan-900">{saludHoy?.agua || 0}<span className="text-sm text-cyan-400 font-bold">/8</span></div>
                         <div className="flex gap-2 w-full">
                            <button onClick={removeWater} className="flex-1 bg-white p-2 rounded-xl text-cyan-600 font-black shadow-sm active:scale-95">-</button>
                            <button onClick={addWater} className="flex-1 bg-cyan-500 text-white p-2 rounded-xl font-black shadow-sm active:scale-95">+</button>
                         </div>
                      </div>
                      {/* Sueño */}
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-[25px] flex flex-col items-center justify-between h-32">
                         <div className="flex items-center gap-1 text-indigo-600"><Moon size={18} className="fill-indigo-600"/><span className="text-[10px] font-black uppercase">Sueño</span></div>
                         <div className="text-xs font-bold text-center text-indigo-900 px-1">
                            {saludHoy?.sueñoCalidad === 'bien' ? 'Descanso Óptimo' : saludHoy?.sueñoCalidad === 'mal' ? 'Mala Noche' : 'Regular'}
                         </div>
                         <div className="flex gap-1 w-full justify-center">
                            {['mal', 'regular', 'bien'].map(s => (
                               <button key={s} onClick={()=>updateHealthStat('sueñoCalidad', s)} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${saludHoy?.sueñoCalidad === s ? 'border-indigo-600 bg-indigo-200' : 'border-transparent bg-white'}`}>
                                  <div className={`w-3 h-3 rounded-full ${s==='mal'?'bg-rose-400':s==='bien'?'bg-emerald-400':'bg-amber-400'}`}></div>
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* 3.2 REGISTRO (Acción Rápida) */}
              {saludSubTab === 'registro' && (
                <div className="space-y-6 animate-in fade-in">
                   {/* EJERCICIO */}
                   <div>
                      <h3 className="font-black text-lg mb-3 px-2 flex items-center gap-2"><Dumbbell size={20}/> Movimiento</h3>
                      <div className="grid grid-cols-3 gap-3">
                         {[10, 20, 40].map(min => (
                            <button key={min} onClick={()=>updateHealthStat('ejercicioMinutos', min)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${parseInt(saludHoy?.ejercicioMinutos) === min ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-white'}`}>
                               <Timer size={20} className={parseInt(saludHoy?.ejercicioMinutos) === min ? 'text-teal-600' : 'text-gray-300'}/>
                               <span className="font-black text-sm">{min} min</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* ALIMENTACIÓN */}
                   <div>
                      <h3 className="font-black text-lg mb-3 px-2 flex items-center gap-2"><Utensils size={20}/> Comida</h3>
                      <div className="space-y-3">
                         {['Desayuno', 'Almuerzo', 'Cena'].map((comida) => (
                            <div key={comida} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                               <span className="font-bold text-sm">{comida}</span>
                               <div className="flex gap-2">
                                  {['Ligero', 'Normal', 'Pesado'].map(tipo => {
                                     const isSelected = saludHoy?.comidas?.[comida] === tipo;
                                     return (
                                     <button key={tipo} onClick={()=>toggleComida(comida, tipo)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${isSelected ? 'bg-teal-500 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-200'}`}>
                                        {tipo}
                                     </button>
                                  )})}
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* ÁNIMO */}
                   <div>
                      <h3 className="font-black text-lg mb-3 px-2 flex items-center gap-2"><Heart size={20}/> Ánimo</h3>
                      <div className="flex justify-between bg-white p-4 rounded-[25px] border border-gray-100">
                         {['fatal', 'mal', 'normal', 'bien', 'genial'].map(a => (
                            <button key={a} onClick={()=>updateHealthStat('animo', a)} className={`text-2xl hover:scale-125 transition-transform ${saludHoy?.animo === a ? 'scale-125 grayscale-0' : 'grayscale opacity-50'}`}>
                               {a==='fatal'?'😫':a==='mal'?'😕':a==='normal'?'😐':a==='bien'?'🙂':'🤩'}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* 3.3 EXPEDIENTE (PROTOCOLO + HISTORIAL) */}
              {saludSubTab === 'expediente' && (
                 <div className="space-y-6 animate-in fade-in">
                    {/* Protocolo Diario */}
                    <div>
                       <div className="flex justify-between items-center px-2 mb-3">
                          <h3 className="font-black text-lg">Protocolo Diario</h3>
                          <button onClick={()=>setModalOpen('habito')} className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Plus size={14}/> Añadir</button>
                       </div>
                       <div className="space-y-2">
                          {habitos.map(h => {
                             const isChecked = saludHoy?.habitosChecks?.includes(h.id);
                             // SELECCIÓN DE ICONO VISUAL (NUEVO)
                             const Icon = h.iconType === 'sun' ? SunMedium : h.iconType === 'brain' ? Brain : Pill;
                             
                             return (
                             <div key={h.id} className={`p-4 border rounded-2xl flex justify-between items-center group transition-colors ${isChecked ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isChecked ? 'bg-teal-200 text-teal-700' : 'bg-gray-50 text-gray-400'}`}><Icon size={20}/></div>
                                   <div><p className={`font-bold text-sm ${isChecked ? 'text-teal-900 line-through opacity-50' : 'text-gray-900'}`}>{h.nombre}</p><p className="text-[10px] text-gray-400 font-bold uppercase">{h.frecuencia}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <button onClick={()=>toggleHabitCheck(h.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-teal-500 border-teal-500 text-white scale-110' : 'border-gray-200 hover:border-teal-400'}`}>{isChecked && <Check size={16} strokeWidth={4} />}</button>
                                   <button onClick={()=>deleteItem('habitos', h)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                </div>
                             </div>
                          )})}
                          {habitos.length === 0 && <p className="text-center text-xs text-gray-400 py-4 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">Añade vitaminas, lectura o cuidados.</p>}
                       </div>
                    </div>

                    {/* Peso */}
                    <div>
                       <div className="flex justify-between items-center px-2 mb-3">
                          <h3 className="font-black text-lg">Control de Peso</h3>
                          <button onClick={()=>setModalOpen('peso')} className="text-gray-400 hover:text-teal-600"><PlusCircle size={20}/></button>
                       </div>
                       <div className="bg-white p-4 rounded-[25px] border border-gray-100 h-40 flex items-end justify-between px-6 pb-2 relative">
                          <div className="absolute top-1/2 w-full h-[1px] bg-gray-100 left-0 border-dashed border-t border-gray-200"></div>
                          {historialPeso.slice(-7).map((p, i) => (
                             <div key={p.id} className="flex flex-col items-center gap-2 z-10">
                                <div className="w-3 bg-teal-300 rounded-t-full hover:bg-teal-500 transition-colors" style={{height: `${Math.min(safeMonto(p.kilos), 120)}px`}}></div>
                                <span className="text-[9px] font-bold text-gray-400">{p.kilos}</span>
                             </div>
                          ))}
                          {historialPeso.length === 0 && <p className="w-full text-center text-xs text-gray-400 self-center">Registra tu peso para ver la tendencia.</p>}
                       </div>
                    </div>

                    {/* Historial (Días Anteriores) */}
                    <div>
                       <div className="flex justify-between items-center px-2 mb-3"><h3 className="font-black text-lg">Historial</h3><BarChart2 size={18} className="text-gray-400"/></div>
                       <div className="space-y-3 max-h-60 overflow-y-auto pr-1" style={{scrollbarWidth:'none'}}>
                          {historialSalud.filter(d => d.fecha !== getTodayKey()).map(dia => (
                             <div key={dia.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                                <div><p className="font-bold text-sm text-gray-600">{dia.fecha}</p><div className="flex gap-2 text-[10px] text-gray-400 font-bold uppercase mt-1"><span className="flex items-center gap-1"><Droplet size={10}/> {dia.agua}/8</span><span className="flex items-center gap-1"><Moon size={10}/> {dia.sueñoCalidad}</span></div></div>
                                <div className="flex flex-col items-end"><span className={`text-lg font-black ${dia.bateria > 70 ? 'text-emerald-500' : dia.bateria > 30 ? 'text-amber-500' : 'text-rose-500'}`}>{dia.bateria}%</span><span className="text-[9px] font-bold text-gray-400 uppercase">Energía</span></div>
                             </div>
                          ))}
                          {historialSalud.length <= 1 && <p className="text-center text-xs text-gray-400 py-4">Sin días anteriores.</p>}
                       </div>
                    </div>
                 </div>
              )}
            </>
          )}

          {/* === PERFIL (CON BOTÓN CIERRE DEL DÍA) === */}
          {activeTab === 'settings' && (
            <div className="text-center pt-8 animate-in fade-in px-4">
               <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-black mb-4 shadow-xl">{user.displayName ? user.displayName[0] : "U"}</div>
               <h2 className="text-2xl font-black">{user.displayName}</h2>
               <p className="text-xs font-bold text-gray-400 mb-8">{user.email}</p>
               
               {/* BOTÓN NUEVO: CIERRE DEL DÍA */}
               <button onClick={()=>setDailyCloseOpen(true)} className="w-full p-5 rounded-2xl font-black text-white bg-gray-900 mb-4 flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform">
                  <Moon size={20} className="text-purple-300"/>
                  Ver Resumen del Día
               </button>

               <button onClick={logOut} className="w-full p-4 rounded-2xl font-bold text-rose-500 bg-rose-50 flex justify-center gap-2 active:scale-95 transition-transform"><LogOut size={20}/> Cerrar Sesión</button>
            </div>
          )}
        </div>

        {/* FAB (Botón Flotante para Finanzas) */}
        {activeTab === 'finanzas' && finSubTab === 'billetera' && (
           <button onClick={() => setModalOpen('movimiento')} className="absolute bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50 hover:bg-gray-900"><Plus size={28} strokeWidth={3} /></button>
        )}

        {/* BARRA DE NAVEGACIÓN INFERIOR (AMIGABLE) */}
        <div className="h-24 border-t flex justify-around pt-4 backdrop-blur-md bg-white/90 border-gray-100 z-50">
           {[{ id: 'finanzas', icon: Wallet, l: 'Wallet' }, { id: 'ventas', icon: Store, l: 'Negocio' }, { id: 'salud', icon: Activity, l: 'Protocolo' }, { id: 'settings', icon: Settings, l: 'Perfil' }].map(t => (
             <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === t.id ? (t.id === 'salud' ? 'text-teal-600 scale-110' : t.id==='ventas' ? 'text-black scale-110' : 'text-blue-600 scale-110') : 'text-gray-400'}`}>
                <t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase">{t.l}</span>
             </button>
           ))}
        </div>

        {/* === MODAL MAESTRO UNIFICADO === */}
        <Modal isOpen={!!modalOpen} onClose={() => {setModalOpen(null); setErrorMsg("");}} 
           title={modalOpen === 'producto' ? 'Nuevo Producto' : modalOpen === 'cobrar' ? 'Cobrar Venta' : modalOpen === 'habito' ? 'Añadir al Protocolo' : modalOpen === 'peso' ? 'Registrar Peso' : 'Registrar'}>
          <div className="space-y-4">
            {errorMsg && <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl flex gap-2 items-center"><Info size={14}/> {errorMsg}</div>}
            
            {/* FORMULARIOS */}
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
               /* FORM PROTOCOLO (Con Iconos y Diseño Amigable) */
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
               /* FINANZAS */
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

        {/* === MODAL RACHA === */}
        <Modal isOpen={streakModalOpen} onClose={() => setStreakModalOpen(false)} title="¡Tu racha sigue viva! 🔥">
           <div className="space-y-4 text-center">
             <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center animate-pulse"><Flame className="text-orange-500 fill-orange-500" size={40} /></div>
             <p className="text-sm font-bold text-gray-600 px-4">Hoy marcaste un día sin gastos. Eso te acerca más a tu libertad financiera.</p>
             <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Racha: <span className="text-orange-500 text-lg">{userStats.currentStreak} días</span></p>
             <button onClick={() => setStreakModalOpen(false)} className="w-full py-3 text-[10px] font-bold text-gray-400">Genial</button>
           </div>
        </Modal>

        {/* === MODAL CIERRE DEL DÍA (RESUMEN GERENCIAL) === */}
        <Modal isOpen={dailyCloseOpen} onClose={() => setDailyCloseOpen(false)} title="Resumen del Día 🌙">
           <div className="space-y-6">
              {/* Resumen Finanzas */}
              <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                 <div className="flex gap-3 items-center">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Wallet size={18}/></div>
                    <div><p className="text-xs font-bold text-gray-500 uppercase">Gastado Hoy</p><p className="font-black text-lg">{formatMoney(movimientos.filter(m => m.tipo === 'GASTO' && m.timestamp?.toDate && m.timestamp.toDate().toDateString() === new Date().toDateString()).reduce((a,b)=>a+safeMonto(b.monto),0))}</p></div>
                 </div>
                 {movimientos.some(m => m.tipo === 'GASTO' && m.timestamp?.toDate && m.timestamp.toDate().toDateString() === new Date().toDateString()) ? <span className="text-rose-500 font-bold text-xs">Gastaste</span> : <span className="text-emerald-500 font-bold text-xs">Ahorraste</span>}
              </div>

              {/* Resumen Negocio */}
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

              {/* Resumen Protocolo */}
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
// Actualizacion final v2