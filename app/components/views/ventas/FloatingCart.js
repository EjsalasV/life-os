import React, { useState } from "react";
import { X, ChevronUp, ArrowRightCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingCart({ carrito, carritoItems, carritoTotal, setCarrito, setPosForm, setModalOpen, formatMoney }) {
  const [showCartList, setShowCartList] = useState(false);

  return (
    <AnimatePresence>
      {carrito.length > 0 && (
        <motion.div initial={{ y: 100, x: "-50%", opacity: 0 }} animate={{ y: 0, x: "-50%", opacity: 1 }} exit={{ y: 120, x: "-50%", opacity: 0 }} className="fixed bottom-28 left-1/2 w-[92%] max-w-[400px] bg-[#1a1c2c] text-white rounded-[40px] shadow-2xl z-[70] border border-white/10 overflow-hidden">
          {showCartList && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="p-6 max-h-[280px] overflow-y-auto border-b border-white/5 space-y-3">
              {carritoItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400">{item.cantidad}x {item.nombre}</span>
                  <div className="flex items-center gap-3">
                    <span>{formatMoney(item.subtotal)}</span>
                    <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-rose-500 hover:scale-125 transition-transform"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          <div className="p-5 flex items-center justify-between bg-[#1e2030]">
            <button onClick={() => setShowCartList(!showCartList)} className="flex items-center gap-3">
              <motion.div animate={{ rotate: showCartList ? 180 : 0 }} className={`p-2.5 rounded-xl ${showCartList ? "bg-indigo-500" : "bg-white/10"} transition-colors`}>
                <ChevronUp size={18} />
              </motion.div>
              <div className="text-left">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Total a pagar</p>
                <p className="text-xl font-black">{formatMoney(carritoTotal)}</p>
              </div>
            </button>
            <div className="flex gap-2">
              <button onClick={() => setCarrito([])} className="p-4 bg-white/5 rounded-2xl hover:bg-rose-500/20 transition-colors"><X size={20} /></button>
              <button
                onClick={() => {
                  setPosForm({ cliente: "", cuentaId: "", id: null });
                  setModalOpen("cobrar");
                }}
                className="bg-indigo-500 text-white px-7 py-4 rounded-2xl font-black text-[11px] uppercase flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Cobrar <ArrowRightCircle size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
