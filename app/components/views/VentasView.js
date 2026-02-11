"use client";

import React, { useState } from 'react';
import { 
  Plus, Trash2, Search, X, ChevronUp, Receipt, ArrowRightCircle, Calculator, 
  PackageOpen, Copy, Edit3, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';

/**
 * VENTAS VIEW - EXPERT SAAS EDITION
 * Implementa restricciones de negocio para usuarios Free y funciones avanzadas para PRO.
 */
export default function VentasView({
  ventasSubTab, setVentasSubTab, ventas, formatMoney, safeMonto,
  deleteItem, productos, busquedaProd, setBusquedaProd,
  addToCart, setModalOpen, carrito, setCarrito, handleGenerarPedido,
  setProductForm, setPosForm, user // Recibe el objeto user para validar el plan
}) {

  const [showCartList, setShowCartList] = useState(false);
  const isPro = user?.plan === 'pro';

  // --- LÓGICA DE MÉTRICAS ---
  const ventasHoy = ventas.filter(v => {
    const d = v.timestamp?.toDate ? v.timestamp.toDate() : new Date();
    return d.toDateString() === new Date().toDateString();
  });

  const metricaVenta = ventasHoy.reduce((acc, v) => acc + safeMonto(v.total), 0);
  const metricaCosto = ventasHoy.reduce((acc, v) => acc + (v.costoTotal || 0), 0);
  const metricaUtilidad = metricaVenta - metricaCosto;

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busquedaProd.toLowerCase())
  );

  // --- ANIMACIONES ---
  const tabVariants = {
    initial: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  const tabsOrder = ['terminal', 'inventario', 'historial'];
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab) => {
    const oldIndex = tabsOrder.indexOf(ventasSubTab);
    const newIndex = tabsOrder.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setVentasSubTab(newTab);
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 relative">
        {tabsOrder.map(t => (
          <button 
            key={t} 
            onClick={() => handleTabChange(t)}
            className={`relative flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all z-10 ${ventasSubTab === t ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            {ventasSubTab === t && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-xl z-[-1]"
              />
            )}
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={ventasSubTab}
          custom={direction}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {/* --- 1. TERMINAL (POS) --- */}
          {ventasSubTab === 'terminal' && (
            <div className="space-y-4 pb-44">
              
              {/* CARD DE RENDIMIENTO CON BLOQUEO PRO */}
              <div className="p-6 bg-[#1a1c2c] text-white rounded-[35px] shadow-xl relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Resultado de Hoy</p>
                       <PremiumLock isPro={isPro} text="Ver Utilidad">
                          <h2 className="text-3xl font-black italic text-emerald-400">{formatMoney(metricaUtilidad)}</h2>
                       </PremiumLock>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl"><Calculator size={20}/></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase">Ventas</p>
                       <p className="font-black text-sm">{formatMoney(metricaVenta)}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase">Inversión (Costos)</p>
                       <PremiumLock isPro={isPro} text="Sólo PRO">
                          <p className="font-black text-sm text-rose-300">{formatMoney(metricaCosto)}</p>
                       </PremiumLock>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-hide">
                {productos.filter(p => p.stock > 0).map((p, idx) => (
                  <motion.button 
                    key={p.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(p)} 
                    className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 text-left space-y-1 shadow-sm"
                  >
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 mb-1"><Plus size={16}/></div>
                    <p className="text-[11px] font-bold text-gray-800 dark:text-white leading-tight line-clamp-2 h-7">{p.nombre}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.stock <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">{p.stock} uni</p>
                    </div>
                    <p className="text-sm font-black text-indigo-600 pt-1">{formatMoney(p.precioVenta)}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* --- 2. INVENTARIO (BLOQUEO DE EDICIÓN FREE) --- */}
          {ventasSubTab === 'inventario' && (
            <div className="space-y-4">
               <div className="flex gap-2">
                  <div className="flex-1 relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                     <input type="text" placeholder="Buscar..." className="w-full bg-gray-100 dark:bg-gray-800 p-4 pl-12 rounded-2xl font-bold text-xs" value={busquedaProd} onChange={(e)=>setBusquedaProd(e.target.value)} />
                  </div>
                  
                  {/* Botón Nuevo Producto (Límite 5 manejado en hook) */}
                  <button 
                    onClick={()=>{
                      setProductForm({ nombre: '', precioVenta: '', costo: '', stock: '' }); 
                      setModalOpen('producto');
                    }} 
                    className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"
                  >
                    <Plus size={20}/>
                  </button>

                  {/* REPORTE STOCK BAJO (Bloqueado para Free) */}
                  <div className="relative group">
                    <button 
                      onClick={() => isPro ? handleGenerarPedido() : null}
                      className={`p-4 rounded-2xl shadow-lg transition-all ${isPro ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}
                    >
                      <Copy size={20}/>
                    </button>
                    {!isPro && <Lock size={10} className="absolute top-2 right-2 text-gray-500"/>}
                  </div>
               </div>

               <div className="space-y-2 pb-20">
                 {productosFiltrados.map(p => (
                   <motion.div 
                      key={p.id}
                      layout
                      whileTap={isPro ? { scale: 0.98 } : {}}
                      onClick={() => {
                        if(isPro) {
                          setProductForm(p); 
                          setModalOpen('producto');
                        }
                      }}
                      className={`bg-white dark:bg-gray-800 p-5 rounded-[30px] border border-gray-100 flex flex-col gap-3 group shadow-sm relative ${isPro ? 'cursor-pointer' : 'cursor-default'}`}
                   >
                      <div className="flex justify-between items-start">
                         <div>
                           <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{p.nombre}</p>
                              {isPro && <Edit3 size={10} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"/>}
                              {!isPro && <Lock size={10} className="text-gray-300"/>}
                           </div>
                           <p className={`text-[9px] font-black uppercase mt-1 ${p.stock <= 5 ? 'text-rose-500' : 'text-indigo-400'}`}>Stock: {p.stock} uni</p>
                         </div>
                         <button onClick={(e)=>{e.stopPropagation(); deleteItem('productos', p)}} className="text-gray-200 hover:text-rose-500 transition-colors p-1"><Trash2 size={16}/></button>
                      </div>

                      {/* BLOQUEO DE COSTOS Y UTILIDADES EN LISTA */}
                      <PremiumLock isPro={isPro} text="Análisis Financiero PRO">
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 dark:border-gray-700">
                          <div><p className="text-[8px] font-black text-gray-400 uppercase">Costo</p><p className="text-xs font-bold">{formatMoney(p.costo)}</p></div>
                          <div><p className="text-[8px] font-black text-gray-400 uppercase">Venta</p><p className="text-xs font-bold text-indigo-600">{formatMoney(p.precioVenta)}</p></div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-1.5 rounded-xl text-center">
                              <p className="text-[8px] font-black text-emerald-600 uppercase">Utilidad</p>
                              <p className="text-xs font-black text-emerald-700">{formatMoney(p.precioVenta - p.costo)}</p>
                          </div>
                        </div>
                      </PremiumLock>
                   </motion.div>
                 ))}
               </div>
            </div>
          )}

          {/* --- 3. HISTORIAL (BLOQUEO DE EDICIÓN DE TICKETS) --- */}
          {ventasSubTab === 'historial' && (
            <div className="space-y-4">
               {ventas.length === 0 ? (
                 <div className="py-20 text-center space-y-6 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border-2 border-dashed border-gray-200">
                    <PackageOpen size={48} className="mx-auto text-gray-200"/>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-gray-300">Aún no hay ventas registradas</p>
                 </div>
               ) : (
                 <div className="space-y-3 pb-20">
                   {ventas.map(v => (
                     <div key={v.id} className="bg-white dark:bg-gray-800 p-5 rounded-[28px] border border-gray-100 flex justify-between items-start group shadow-sm">
                        <div 
                          onClick={() => { 
                            if(isPro) {
                              setPosForm({ ...v, id: v.id }); 
                              setModalOpen('cobrar'); 
                            }
                          }} 
                          className={`flex items-center gap-3 ${isPro ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                           <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Receipt size={18}/></div>
                           <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">Ticket #{v.reciboId}</p>
                                {!isPro && <Lock size={10} className="text-gray-300"/>}
                                {isPro && <Edit3 size={10} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"/>}
                              </div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{v.cliente}</p>
                           </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-sm font-black text-emerald-600">{formatMoney(v.total)}</p>
                          
                          {/* ANULACIÓN (Función PRO) */}
                          <button 
                            onClick={() => { 
                              if(isPro) {
                                if(window.confirm("¿Anular esta venta?")) deleteItem('ventas', v); 
                              }
                            }} 
                            className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg border transition-all ${isPro ? 'bg-rose-50 text-rose-500 border-rose-100 active:bg-rose-500 active:text-white' : 'bg-gray-50 text-gray-300 border-gray-100'}`}
                          >
                            {isPro ? 'Anular Venta' : 'Anulación PRO'}
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* --- CARRITO FLOTANTE (ESTILO PREMIUM) --- */}
      <AnimatePresence>
        {carrito.length > 0 && (
          <motion.div initial={{ y: 100, x: "-50%", opacity: 0 }} animate={{ y: 0, x: "-50%", opacity: 1 }} exit={{ y: 120, x: "-50%", opacity: 0 }} className="fixed bottom-28 left-1/2 w-[92%] max-w-[400px] bg-[#1a1c2c] text-white rounded-[40px] shadow-2xl z-[70] border border-white/10 overflow-hidden">
            {showCartList && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="p-6 max-h-[280px] overflow-y-auto border-b border-white/5 space-y-3">
                 {carrito.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-400">{item.cantidad}x {item.nombre}</span>
                      <div className="flex items-center gap-3">
                         <span>{formatMoney(item.precioVenta * item.cantidad)}</span>
                         <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-rose-500 hover:scale-125 transition-transform"><X size={14}/></button>
                      </div>
                   </div>
                 ))}
              </motion.div>
            )}
            <div className="p-5 flex items-center justify-between bg-[#1e2030]">
              <button onClick={()=>setShowCartList(!showCartList)} className="flex items-center gap-3">
                 <motion.div animate={{ rotate: showCartList ? 180 : 0 }} className={`p-2.5 rounded-xl ${showCartList ? 'bg-indigo-500' : 'bg-white/10'} transition-colors`}>
                    <ChevronUp size={18}/>
                 </motion.div>
                 <div className="text-left">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Total a pagar</p>
                    <p className="text-xl font-black">{formatMoney(carrito.reduce((a,b)=>a+(b.precioVenta*b.cantidad),0))}</p>
                 </div>
              </button>
              <div className="flex gap-2">
                 <button onClick={()=>setCarrito([])} className="p-4 bg-white/5 rounded-2xl hover:bg-rose-500/20 transition-colors"><X size={20}/></button>
                 <button 
                  onClick={() => { 
                    setPosForm({ cliente: '', cuentaId: '', id: null }); 
                    setModalOpen('cobrar'); 
                  }} 
                  className="bg-indigo-500 text-white px-7 py-4 rounded-2xl font-black text-[11px] uppercase flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                 >
                    Cobrar <ArrowRightCircle size={16}/>
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}