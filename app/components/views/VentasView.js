"use client";
import React from 'react';
import { 
  Info, Trash2, Plus, PlusCircle, ClipboardCopy 
} from 'lucide-react';

export default function VentasView({
  ventasSubTab, setVentasSubTab, ventas, formatMoney, safeMonto, deleteItem, 
  getTime, productos, busquedaProd, setBusquedaProd, addToCart, setModalOpen,
  carrito, setCarrito, handleGenerarPedido
}) {
  return (
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

      {/* 2.2 POS Y 2.3 INVENTARIO */}
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
  );
}