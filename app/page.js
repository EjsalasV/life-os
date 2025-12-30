"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  updateDoc, 
  where 
} from "firebase/firestore";

// --- IMPORTAMOS LAS VISTAS SEPARADAS ---
import FinanzasView from "./components/views/FinanzasView";
import VentasView from "./components/views/VentasView";
import SaludView from "./components/views/SaludView";
import SettingsView from "./components/views/SettingsView";

// --- ICONOS DE NAVEGACIÓN ---
import { LayoutDashboard, ShoppingCart, Activity, Settings } from "lucide-react";

export default function Home() {
  // --- HOOKS DE AUTENTICACIÓN Y NAVEGACIÓN ---
  const { user, loading, logOut } = useUser();
  const router = useRouter();
  
  // --- ESTADOS DE NAVEGACIÓN ---
  const [activeTab, setActiveTab] = useState("finance"); // finance, pos, health, settings

  // --- ESTADOS DE DATOS (DATA) ---
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  
  // --- ESTADOS DEL CARRITO DE VENTAS ---
  const [cart, setCart] = useState([]);
  
  // --- ESTADOS DE SALUD ---
  const [habits, setHabits] = useState([]); 
  const [weight, setWeight] = useState([]);
  const [dailyCheck, setDailyCheck] = useState({});

  // --- ESTADOS DE UI/CARGA ---
  const [isSaving, setIsSaving] = useState(false);
// --- PROTECCIÓN DE RUTA (SI NO HAY USUARIO, AL LOGIN) ---
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // --- ESCUCHADORES DE FIREBASE (REALTIME LISTENERS) ---
  useEffect(() => {
    if (user) {
      // 1. Escuchar Cuentas
      const qAccounts = query(collection(db, "users", user.uid, "accounts"));
      const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAccounts(data);
      });

      // 2. Escuchar Transacciones (Ordenadas por fecha, últimas primero)
      const qTrans = query(
        collection(db, "users", user.uid, "transactions"), 
        orderBy("createdAt", "desc")
      );
      const unsubTrans = onSnapshot(qTrans, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(data);
      });

      // 3. Escuchar Productos
      const qProducts = query(collection(db, "users", user.uid, "products"));
      const unsubProducts = onSnapshot(qProducts, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      });

      // 4. Escuchar Hábitos (Salud)
      const qHabits = query(collection(db, "users", user.uid, "habits"));
      const unsubHabits = onSnapshot(qHabits, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHabits(data);
      });

      // Limpieza al desmontar (Evita fugas de memoria)
      return () => { 
        unsubAccounts(); 
        unsubTrans(); 
        unsubProducts(); 
        unsubHabits();
      };
    }
  }, [user]);

  // --- UTILIDAD: FORMATEAR MONEDA ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
// --- LÓGICA DE FINANZAS ---
  const handleTransaction = async (data) => {
    // data trae: { amount, type, accountId, description, category }
    setIsSaving(true);
    try {
      // 1. Guardar el movimiento en el historial
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        ...data,
        amount: parseFloat(data.amount),
        createdAt: serverTimestamp(),
        date: new Date().toISOString()
      });

      // 2. Actualizar el saldo de la cuenta correspondiente
      const accountRef = doc(db, "users", user.uid, "accounts", data.accountId);
      const currentAccount = accounts.find(acc => acc.id === data.accountId);
      
      if (currentAccount) {
        const newBalance = data.type === "income" 
          ? (currentAccount.balance || 0) + parseFloat(data.amount)
          : (currentAccount.balance || 0) - parseFloat(data.amount);
          
        await updateDoc(accountRef, { balance: newBalance });
      }

      alert("Movimiento registrado correctamente");
    } catch (e) {
      console.error("Error guardando transacción:", e);
      alert("Error al guardar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (confirm("¿Estás seguro de borrar este movimiento? Esta acción no deshace el saldo.")) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "transactions", id));
      } catch (e) {
        console.error("Error al borrar:", e);
      }
    }
  };

  // --- LÓGICA DE VENTAS (POS) ---
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSaving(true);
    try {
      const totalVenta = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      // 1. Guardar la venta
      await addDoc(collection(db, "users", user.uid, "sales"), {
        items: cart,
        total: totalVenta,
        createdAt: serverTimestamp(),
        date: new Date().toISOString()
      });

      setCart([]);
      alert(`Venta registrada por ${formatCurrency(totalVenta)} ✅`);
    } catch (e) {
      console.error(e);
      alert("Error en la venta");
    } finally {
      setIsSaving(false);
    }
  };

  // --- LÓGICA DE SALUD ---
  const saveDailyCheck = async (checkData) => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "daily_health"), {
        ...checkData,
        createdAt: serverTimestamp(),
        date: new Date().toISOString()
      });
      alert("Check diario guardado 💪");
    } catch (e) {
      console.error(e);
      alert("Error al guardar salud");
    } finally {
      setIsSaving(false);
    }
  };
// --- RENDERIZADO (VISUAL) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="h-10 w-10 text-blue-500 mb-2" />
          <p>Cargando Life OS...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Si no hay usuario y ya cargó, el useEffect lo manda al login

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* HEADER FIJO */}
      <header className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-md border-b border-gray-800 z-50 px-6 py-4 flex justify-between items-center max-w-[500px] left-1/2 -translate-x-1/2">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Life OS <span className="text-xs text-gray-500 ml-1">v2.0</span>
        </h1>
        <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 text-sm font-bold text-gray-300">
           {user.displayName ? user.displayName[0].toUpperCase() : "U"}
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL (Scrollable) */}
      <main className="pt-24 px-4 pb-32 max-w-[500px] mx-auto min-h-screen relative">
        
        {/* RENDERIZADO CONDICIONAL DE VISTAS */}
        
        {activeTab === "finance" && (
          <FinanzasView 
            user={user}
            accounts={accounts}
            transactions={transactions}
            handleTransaction={handleTransaction}
            deleteTransaction={deleteTransaction}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "pos" && (
          <VentasView 
            products={products}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            handleCheckout={handleCheckout}
            formatCurrency={formatCurrency}
            isCheckingOut={isSaving}
          />
        )}

        {activeTab === "health" && (
          <SaludView 
            user={user}
            habits={habits}
            setHabits={setHabits}
            weight={weight}
            setWeight={setWeight}
            saveDailyCheck={saveDailyCheck}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView 
            user={user} 
            logOut={logOut} 
          />
        )}

      </main>

      {/* BARRA DE NAVEGACIÓN INFERIOR (Dock Flotante) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl px-6 py-3 flex gap-8 shadow-2xl z-50">
        <button 
          onClick={() => setActiveTab("finance")} 
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === "finance" ? "text-blue-400 -translate-y-1" : "text-gray-500 hover:text-gray-300"}`}
        >
          <LayoutDashboard size={24} strokeWidth={activeTab === "finance" ? 2.5 : 2} />
        </button>
        
        <button 
          onClick={() => setActiveTab("pos")} 
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === "pos" ? "text-purple-400 -translate-y-1" : "text-gray-500 hover:text-gray-300"}`}
        >
          <ShoppingCart size={24} strokeWidth={activeTab === "pos" ? 2.5 : 2} />
        </button>

        <button 
          onClick={() => setActiveTab("health")} 
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === "health" ? "text-green-400 -translate-y-1" : "text-gray-500 hover:text-gray-300"}`}
        >
          <Activity size={24} strokeWidth={activeTab === "health" ? 2.5 : 2} />
        </button>

        <button 
          onClick={() => setActiveTab("settings")} 
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === "settings" ? "text-gray-200 -translate-y-1" : "text-gray-500 hover:text-gray-300"}`}
        >
          <Settings size={24} strokeWidth={activeTab === "settings" ? 2.5 : 2} />
        </button>
      </nav>

    </div>
  );
}