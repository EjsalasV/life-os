import React, { useState } from "react";
import {
  Wallet,
  Shield,
  ShieldCheck,
  Trash2,
  Plus,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Upload,
  Printer,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { exportToExcel } from "@/app/utils/exportHandler";
import PremiumLock from "../../ui/PremiumLock";

export default function WalletTabContent({
  setModalOpen,
  setSelectedAccountId,
  cuentas,
  selectedAccountId,
  deleteItem,
  visibleMovimientos,
  totalCuentasBalance,
  hasMovimientos,
  formatMoney,
  filterDate,
  setFilterDate,
  handleImport,
  userPlan
}) {
  const [showTools, setShowTools] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModalOpen("transferencia")} className="p-4 bg-black text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"><ArrowRightLeft size={16} /> Transferir</button>
        <button onClick={() => setSelectedAccountId(null)} className="p-4 bg-gray-100 text-gray-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"><Wallet size={16} /> Ver Todo</button>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-[25px] overflow-hidden transition-all duration-300">
        <button onClick={() => setShowTools(!showTools)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><FileSpreadsheet size={14} /></div>
            <span className="text-xs font-black text-gray-700 uppercase tracking-wide">Herramientas Excel</span>
          </div>
          {showTools ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showTools && (
          <div className="p-4 pt-0 bg-gray-50 animate-in slide-in-from-top-2 duration-200">
            <p className="text-[10px] text-gray-400 mb-3 px-1">Importa y exporta tus movimientos masivamente.</p>
            <div className="grid grid-cols-2 gap-3">
              <PremiumLock isPro={userPlan === "pro"} text="Solo PRO">
                <button
                  onClick={() => exportToExcel(visibleMovimientos, `${filterDate.month + 1}-${filterDate.year}`)}
                  className="w-full flex flex-col items-center justify-center gap-2 p-3 bg-white border border-emerald-100 rounded-xl shadow-sm hover:border-emerald-300 transition-all active:scale-95"
                >
                  <FileSpreadsheet size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-gray-600">Descargar</span>
                </button>
              </PremiumLock>

              <PremiumLock isPro={userPlan === "pro"} text="Solo PRO">
                <label className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-dashed border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all active:scale-95 h-full">
                  <input type="file" accept=".xlsx, .xls" className="hidden" onChange={userPlan === "pro" ? handleImport : null} disabled={userPlan !== "pro"} onClick={(e) => e.target.value = null} />
                  <Upload size={18} className="text-blue-500" />
                  <span className="text-[10px] font-bold text-gray-600">Subir Excel</span>
                </label>
              </PremiumLock>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto flex gap-3 pb-2 snap-x scrollbar-hide">
        <div className="snap-center min-w-[140px] p-4 rounded-3xl flex flex-col justify-between h-32 border-2 border-blue-600 bg-blue-50 relative overflow-hidden">
          <Shield className="absolute right-[-10px] bottom-[-10px] text-blue-200 opacity-50" size={60} />
          <div className="p-2 bg-blue-200 text-blue-700 rounded-full w-fit"><ShieldCheck size={16} /></div>
          <div className="text-left relative z-10">
            <p className="text-[9px] uppercase font-black opacity-60 mb-0.5 text-blue-900">Todo tu dinero</p>
            <p className="font-black text-lg text-blue-900">{formatMoney(totalCuentasBalance)}</p>
          </div>
        </div>
        {cuentas.map(c => (
          <button key={c.id} onClick={() => setSelectedAccountId(c.id)} className={`snap-center min-w-[140px] p-4 rounded-3xl flex flex-col justify-between h-32 border-2 transition-all relative group ${selectedAccountId === c.id ? "border-black bg-gray-900 text-white" : "border-transparent bg-white shadow-sm"}`}>
            <div onClick={(e) => { e.stopPropagation(); deleteItem("cuentas", c); }} className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 hover:text-rose-500"><Trash2 size={12} /></div>
            <div className={`p-2 rounded-full w-fit ${selectedAccountId === c.id ? "bg-white/20" : "bg-gray-100"}`}><Wallet size={16} /></div>
            <div className="text-left"><p className={`text-[10px] uppercase font-black ${selectedAccountId === c.id ? "opacity-50 text-white" : "text-gray-400"}`}>{c.nombre}</p><p className={`font-black text-lg ${selectedAccountId === c.id ? "text-white" : "text-gray-900"}`}>{formatMoney(c.monto)}</p></div>
          </button>
        ))}
        <button onClick={() => setModalOpen("cuenta")} className="snap-center min-w-[80px] rounded-3xl flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 active:bg-gray-200"><Plus size={24} /></button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 mt-4 px-2">
          <h3 className="font-black text-lg text-gray-900 dark:text-white">{selectedAccountId ? "Historial" : "Últimos Movimientos"}</h3>
          <div className="flex gap-2 items-center bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <select value={filterDate.month} onChange={(e) => setFilterDate({ ...filterDate, month: parseInt(e.target.value) })} className="text-[10px] font-bold bg-transparent outline-none text-gray-600 pl-1 cursor-pointer">
              {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={filterDate.year} onChange={(e) => setFilterDate({ ...filterDate, year: parseInt(e.target.value) })} className="text-[10px] font-bold bg-transparent outline-none text-gray-600 cursor-pointer">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="w-px h-3 bg-gray-200 mx-1"></div>
            <button onClick={() => window.print()} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Printer size={14} /></button>
          </div>
        </div>

        <div className="space-y-2 pb-20">
          {visibleMovimientos.map(m => (
            <div key={m.id} className="p-4 rounded-2xl flex justify-between items-center bg-white border border-gray-100 group shadow-sm">
              <div className="flex gap-3 items-center">
                <div className={`p-2 rounded-xl ${m.tipo === "INGRESO" ? "bg-emerald-100 text-emerald-600" : m.tipo === "TRANSFERENCIA" ? "bg-gray-100 text-gray-600" : "bg-rose-100 text-rose-600"}`}>
                  {m.tipo === "INGRESO" ? <TrendingUp size={16} /> : m.tipo === "TRANSFERENCIA" ? <ArrowRightLeft size={16} /> : <TrendingDown size={16} />}
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight text-gray-900">{m.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{m.categoria || "General"}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] text-blue-400 font-bold">{m.displayDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-black text-sm ${m.tipo === "INGRESO" ? "text-emerald-600" : "text-gray-900"}`}>
                  {m.amountPrefix}{formatMoney(m.monto)}
                </p>
                <button onClick={() => deleteItem("movimientos", m)} className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {!hasMovimientos && (
            <div className="text-center p-10 opacity-40 font-bold text-sm bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p>No hay movimientos en este periodo. 🍃</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
