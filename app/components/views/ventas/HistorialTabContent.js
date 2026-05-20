import React from "react";
import { PackageOpen, Receipt, Edit3, Lock } from "lucide-react";

export default function HistorialTabContent({ ventas, hasVentas, isPro, setPosForm, setModalOpen, deleteItem, formatMoney }) {
  if (!hasVentas) {
    return (
      <div className="py-20 text-center space-y-6 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border-2 border-dashed border-gray-200">
        <PackageOpen size={48} className="mx-auto text-gray-200" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-gray-300">Aún no hay ventas registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      {ventas.map(v => (
        <div key={v.id} className="bg-white dark:bg-gray-800 p-5 rounded-[28px] border border-gray-100 flex justify-between items-start group shadow-sm">
          <div
            onClick={() => {
              if (isPro) {
                setPosForm({ ...v, id: v.id });
                setModalOpen("cobrar");
              }
            }}
            className={`flex items-center gap-3 ${isPro ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Receipt size={18} /></div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">Ticket #{v.reciboId}</p>
                {!isPro && <Lock size={10} className="text-gray-300" />}
                {isPro && <Edit3 size={10} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{v.cliente}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <p className="text-sm font-black text-emerald-600">{formatMoney(v.total)}</p>
            <button
              onClick={() => {
                if (isPro) {
                  if (window.confirm("¿Anular esta venta?")) deleteItem("ventas", v);
                }
              }}
              className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg border transition-all ${isPro ? "bg-rose-50 text-rose-500 border-rose-100 active:bg-rose-500 active:text-white" : "bg-gray-50 text-gray-300 border-gray-100"}`}
            >
              {isPro ? "Anular Venta" : "Anulación PRO"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
