import React, { useState } from 'react';
import { 
  Store, Search, ShoppingCart, Package, TrendingUp, Plus, Trash2, 
  ArrowRight, User, PackageOpen, X, ChevronUp, Copy, Tag, Box,
  LayoutGrid, BarChart3, Receipt, ArrowRightCircle, Calculator, Info
} from 'lucide-react';

export default function VentasView({
  ventasSubTab, setVentasSubTab, ventas, formatMoney, safeMonto,
  deleteItem, getTime, productos, busquedaProd, setBusquedaProd,
  addToCart, setModalOpen, carrito, setCarrito, handleGenerarPedido
}) {

  const [showCartList, setShowCartList] = useState(false);

  // MÉTRICAS DE HOY (TERMINAL)
  const ventasHoy = ventas.filter(v => {
    const d = v.timestamp?.toDate ? v.timestamp.toDate() : new Date();
    return d.toDateString() === new Date().toDateString();
  });

  const metricaVenta = ventasHoy.reduce((acc, v) => acc + safeMonto(v.total), 0);
  const metricaCosto = ventasHoy.reduce((acc, v) => acc + safeMonto(v.costoTotal), 0);
  const metricaUtilidad = metricaVenta - metricaCosto;

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busquedaProd.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* NAVEGACIÓN INVERSA */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2">
        {['terminal', 'inventario', 'historial'].map(t => (
          <button key={t} onClick={() => setVentasSubTab(t)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${ventasSubTab === t ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 1. TERMINAL (PUNTO DE VENTA Y MÉTRICAS) */}
      {ventasSubTab === 'terminal' && (
        <div className="space-y-4 pb-40 animate-in fade-in duration-500">
          {/* MÉTRICAS DE RENDIMIENTO DIARIO */}
          <div className="p-6 bg-[#1a1c2c] text-white rounded-[35px] shadow-xl relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
             <div className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Utilidad del Día</p>
                   <h2 className="text-3xl font-black italic text-emerald-400">{formatMoney(metricaUtilidad)}</h2>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl"><Calculator size={20} className="text-indigo-300"/></div>
             </div>
             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div><p className="text-[9px] font-black text-gray-400 uppercase">Venta Total</p><p className="font-black text-sm">{formatMoney(metricaVenta)}</p></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase">Mi Costo</p><p className="font-black text-sm text-rose-300">{formatMoney(metricaCosto)}</p></div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1" style={{scrollbarWidth: 'none'}}>
            {productos.filter(p => p.stock > 0).map(p => (
              <button key={p.id} onClick={() => addToCart(p)} 
                className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 text-left space-y-2 active:scale-95 transition-all shadow-sm"
              >
                <div className="bg-indigo-50 dark:bg-indigo-900/20 w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600"><Plus size={16}/></div>
                <p className="text-[11px] font-bold text-gray-800 dark:text-white leading-tight h-8 line-clamp-2">{p.nombre}</p>
                <p className="text-sm font-black text-indigo-600">{formatMoney(p.precioVenta)}</p>
              </button>
            ))}
          </div>

          {/* CARRITO FLOTANTE MEJORADO */}
          {carrito.length > 0 && (
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[350px] bg-[#1a1c2c] text-white rounded-[40px] shadow-2xl z-[70] border border-white/10 animate-in slide-in-from-bottom-20 overflow-hidden">
              {showCartList && (
                <div className="p-6 max-h-[250px] overflow-y-auto border-b border-white/5 space-y-2">
                   {carrito.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-400">{item.cantidad}x {item.nombre}</span>
                        <div className="flex items-center gap-3">
                           <span>{formatMoney(item.precioVenta * item.cantidad)}</span>
                           <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-rose-500"><X size={14}/></button>
                        </div>
                     </div>
                   ))}
                </div>
              )}
              <div className="p-5 flex items-center justify-between">
                <button onClick={()=>setShowCartList(!showCartList)} className="flex items-center gap-2">
                   <div className={`p-2 rounded-xl ${showCartList ? 'bg-indigo-500 rotate-180' : 'bg-white/10'} transition-all`}><ChevronUp size={18}/></div>
                   <div className="text-left"><p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total</p><p className="text-lg font-black">{formatMoney(carrito.reduce((a,b)=>a+(b.precioVenta*b.cantidad),0))}</p></div>
                </button>
                <div className="flex gap-2">
                   <button onClick={()=>setCarrito([])} className="p-4 bg-white/5 rounded-2xl"><X size={20}/></button>
                   <button onClick={() => setModalOpen('cobrar')} className="bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2">Cobrar <ArrowRightCircle size={16}/></button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. INVENTARIO (GESTIÓN Y UTILIDAD) */}
      {ventasSubTab === 'inventario' && (
        <div className="space-y-4 animate-in fade-in">
           <div className="flex gap-2">
              <div className="flex-1 relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input type="text" placeholder="Filtrar..." className="w-full bg-gray-100 p-4 pl-12 rounded-2xl outline-none font-bold text-xs" value={busquedaProd} onChange={(e)=>setBusquedaProd(e.target.value)} />
              </div>
              <button onClick={()=>setModalOpen('producto')} className="p-4 bg-indigo-600 text-white rounded-2xl"><Plus size={20}/></button>
              <button onClick={handleGenerarPedido} className="p-4 bg-black text-white rounded-2xl"><Copy size={20}/></button>
           </div>

           <div className="space-y-2">
             {productosFiltrados.map(p => (
               <div key={p.id} className="bg-white dark:bg-gray-800 p-5 rounded-[30px] border border-gray-100 dark:border-gray-700 flex flex-col gap-3 group shadow-sm">
                  <div className="flex justify-between items-start">
                     <div><p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{p.nombre}</p><p className="text-[9px] font-black text-indigo-400 uppercase">Stock: {p.stock} uni</p></div>
                     <button onClick={()=>deleteItem('productos', p)} className="text-gray-200 group-hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                     <div><p className="text-[8px] font-black text-gray-400 uppercase">Costo</p><p className="text-xs font-bold">{formatMoney(p.costo)}</p></div>
                     <div><p className="text-[8px] font-black text-gray-400 uppercase">Venta</p><p className="text-xs font-bold text-indigo-600">{formatMoney(p.precioVenta)}</p></div>
                     <div className="bg-emerald-50 dark:bg-emerald-900/10 p-1.5 rounded-xl text-center">
                        <p className="text-[8px] font-black text-emerald-600 uppercase">Utilidad</p>
                        <p className="text-xs font-black text-emerald-700">{formatMoney(p.precioVenta - p.costo)}</p>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* 3. HISTORIAL (ESTADO VACÍO MEJORADO) */}
      {ventasSubTab === 'historial' && (
        <div className="space-y-4 animate-in fade-in">
           {ventas.length === 0 ? (
             <div className="py-20 text-center space-y-6 bg-gray-50 dark:bg-gray-800/50 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                <PackageOpen size={48} className="mx-auto text-gray-200"/>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sin ventas hoy</p>
                <button onClick={()=>setVentasSubTab('terminal')} className="mx-auto flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase">Genera tu primera venta <ArrowRightCircle size={14}/></button>
             </div>
           ) : (
             ventas.map(v => (
               <div key={v.id} className="bg-white dark:bg-gray-800 p-5 rounded-[28px] border flex justify-between items-start group shadow-sm">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><Receipt size={18}/></div>
                     <div><p className="text-sm font-black text-gray-900 dark:text-white">#{v.reciboId}</p><p className="text-[9px] font-bold text-gray-400 uppercase">{v.cliente}</p></div>
                  </div>
                  <div className="text-right"><p className="text-sm font-black text-emerald-600">{formatMoney(v.total)}</p><button onClick={()=>deleteItem('ventas', v)} className="text-[9px] text-rose-500 font-black opacity-0 group-hover:opacity-100 uppercase mt-1">Anular</button></div>
               </div>
             ))
           )}
        </div>
      )}
    </div>
  );
}