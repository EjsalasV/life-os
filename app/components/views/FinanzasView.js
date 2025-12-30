"use client";
import { useState, useMemo } from "react";
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, 
  ArrowRightLeft, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, X 
} from "lucide-react";

export default function FinanzasView({
  accounts,
  transactions,
  handleTransaction,
  deleteTransaction,
  formatCurrency
}) {
  // --- 1. ESTADO DEL FILTRO DE FECHA (Los "Lentes") ---
  const [currentDate, setCurrentDate] = useState(new Date()); // Empieza hoy
  
  // --- 2. ESTADO DEL FORMULARIO NUEVO ---
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense", // o 'income'
    accountId: accounts.length > 0 ? accounts[0].id : ""
  });

  // --- 3. LÓGICA DE FILTRADO (El Cerebro) ---
  
  // A. Cambiar de mes
  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // B. Filtrar movimientos SOLO del mes y año seleccionados
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentDate.getMonth() &&
        tDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [transactions, currentDate]);

  // C. Calcular Totales del MES (Se reinician cada mes)
  const monthlyStats = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
      
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

    return { income, expense, balance: income - expense };
  }, [monthlyTransactions]);

  // D. Calcular Saldo TOTAL REAL (Acumulado de cuentas)
  const totalGlobalBalance = useMemo(() => {
    return accounts.reduce((acc, account) => acc + (parseFloat(account.balance) || 0), 0);
  }, [accounts]);

  // --- 4. MANEJO DEL FORMULARIO ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.accountId) return alert("Faltan datos");
    
    handleTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    
    setFormData({ ...formData, description: "", amount: "" }); // Limpiar
    setShowForm(false); // Cerrar modal
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">

      {/* --- TARJETA DE SALDO GLOBAL (Bancos) --- */}
      {/* Esto SIEMPRE muestra cuánto dinero tienes en total, sin importar el mes */}
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 p-6 rounded-3xl shadow-2xl border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1 flex items-center gap-2">
            <Wallet size={16} /> Patrimonio Neto
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {formatCurrency(totalGlobalBalance)}
          </h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white/10 px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm whitespace-nowrap">
                {acc.name}: <span className="font-bold text-white">{formatCurrency(acc.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SELECTOR DE MES --- */}
      <div className="flex items-center justify-between bg-gray-800 p-3 rounded-2xl border border-gray-700">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2 font-bold text-lg">
          <Calendar size={18} className="text-blue-400" />
          {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* --- RESUMEN DEL MES (Ingresos vs Gastos) --- */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
          <div className="flex items-center gap-2 mb-2 text-green-400">
            <div className="p-2 bg-green-500/20 rounded-full"><TrendingUp size={16} /></div>
            <span className="text-xs font-bold">INGRESOS</span>
          </div>
          <p className="text-xl font-bold text-green-100">{formatCurrency(monthlyStats.income)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
          <div className="flex items-center gap-2 mb-2 text-red-400">
            <div className="p-2 bg-red-500/20 rounded-full"><TrendingDown size={16} /></div>
            <span className="text-xs font-bold">GASTOS</span>
          </div>
          <p className="text-xl font-bold text-red-100">{formatCurrency(monthlyStats.expense)}</p>
        </div>
      </div>

      {/* --- BOTÓN FLOTANTE PARA AGREGAR --- */}
      <button 
        onClick={() => setShowForm(true)}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <Plus size={20} /> Nuevo Movimiento
      </button>

      {/* --- LISTA DE MOVIMIENTOS DEL MES --- */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Historial Mensual</h3>
        
        {monthlyTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No hay movimientos en este mes 🍃</p>
          </div>
        ) : (
          monthlyTransactions.map((t) => (
            <div key={t.id} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <p className="font-bold text-gray-200">{t.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(t.date).toLocaleDateString()} • {accounts.find(a => a.id === t.accountId)?.name || 'Cuenta borrada'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold ${t.type === 'income' ? 'text-green-400' : 'text-gray-200'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
                <button 
                  onClick={() => deleteTransaction(t.id)}
                  className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODAL SIMPLE PARA AGREGAR (Overlay) --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-3xl border border-gray-800 p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Registrar</h2>
              <button onClick={() => setShowForm(false)} className="p-2 bg-gray-800 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo */}
              <div className="flex gap-2 p-1 bg-gray-800 rounded-xl">
                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-400'}`}>Gasto</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.type === 'income' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>Ingreso</button>
              </div>

              {/* Monto */}
              <div>
                <label className="text-xs text-gray-400 ml-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-xl font-bold focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs text-gray-400 ml-1">Descripción</label>
                <input 
                  type="text" 
                  placeholder="Ej: Almuerzo, Uber, Pago Cliente..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Cuenta */}
              <div>
                <label className="text-xs text-gray-400 ml-1">Cuenta</label>
                <select 
                  value={formData.accountId}
                  onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4">
                Guardar Movimiento
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}