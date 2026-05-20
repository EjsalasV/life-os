import React from "react";
import { Plus, Trash2, Search, Copy, Edit3, Lock } from "lucide-react";
import { motion } from "framer-motion";
import PremiumLock from "../../ui/PremiumLock";

export default function InventarioTabContent({
  isPro,
  busquedaProd,
  setBusquedaProd,
  setProductForm,
  setModalOpen,
  handleGenerarPedido,
  productosFiltrados,
  deleteItem,
  formatMoney
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Buscar..." className="w-full bg-gray-100 dark:bg-gray-800 p-4 pl-12 rounded-2xl font-bold text-xs" value={busquedaProd} onChange={(e) => setBusquedaProd(e.target.value)} />
        </div>

        <button
          onClick={() => {
            setProductForm({ nombre: "", precioVenta: "", costo: "", stock: "" });
            setModalOpen("producto");
          }}
          className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"
        >
          <Plus size={20} />
        </button>

        <div className="relative group">
          <button
            onClick={() => isPro ? handleGenerarPedido() : null}
            className={`p-4 rounded-2xl shadow-lg transition-all ${isPro ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}
          >
            <Copy size={20} />
          </button>
          {!isPro && <Lock size={10} className="absolute top-2 right-2 text-gray-500" />}
        </div>
      </div>

      <div className="space-y-2 pb-20">
        {productosFiltrados.map(p => (
          <motion.div
            key={p.id}
            layout
            whileTap={isPro ? { scale: 0.98 } : {}}
            onClick={() => {
              if (isPro) {
                setProductForm(p);
                setModalOpen("producto");
              }
            }}
            className={`bg-white dark:bg-gray-800 p-5 rounded-[30px] border border-gray-100 flex flex-col gap-3 group shadow-sm relative ${isPro ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{p.nombre}</p>
                  {isPro && <Edit3 size={10} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  {!isPro && <Lock size={10} className="text-gray-300" />}
                </div>
                <p className={`text-[9px] font-black uppercase mt-1 ${p.stock <= 5 ? "text-rose-500" : "text-indigo-400"}`}>Stock: {p.stock} uni</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteItem("productos", p); }} className="text-gray-200 hover:text-rose-500 transition-colors p-1"><Trash2 size={16} /></button>
            </div>

            <PremiumLock isPro={isPro} text="Análisis Financiero PRO">
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 dark:border-gray-700">
                <div><p className="text-[8px] font-black text-gray-400 uppercase">Costo</p><p className="text-xs font-bold">{formatMoney(p.costo)}</p></div>
                <div><p className="text-[8px] font-black text-gray-400 uppercase">Venta</p><p className="text-xs font-bold text-indigo-600">{formatMoney(p.precioVenta)}</p></div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-1.5 rounded-xl text-center">
                  <p className="text-[8px] font-black text-emerald-600 uppercase">Utilidad</p>
                  <p className="text-xs font-black text-emerald-700">{formatMoney(p.utilidad)}</p>
                </div>
              </div>
            </PremiumLock>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
