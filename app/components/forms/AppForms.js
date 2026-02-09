import React from 'react';
import { Pill, SunMedium, Brain, Info } from 'lucide-react';
import { CATEGORIAS, formatMoney } from '@/app/utils/helpers';

export default function AppForms({
  modalType, 
  errorMsg,
  // Formularios y Setters
  financeForm, setFinanceForm,
  productForm, setProductForm,
  posForm, setPosForm,
  healthForm, setHealthForm,
  // Datos necesarios
  cuentas, carrito, selectedBudgetCat,
  // Acciones
  onConfirm
}) {

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl flex gap-2 items-center">
          <Info size={14}/> {errorMsg}
        </div>
      )}

      {/* --- FORMULARIO PRODUCTO --- */}
      {modalType === 'producto' && (
        <>
          <input autoFocus placeholder="Nombre" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={productForm.nombre} onChange={(e) => setProductForm({...productForm, nombre: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
             <input type="number" placeholder="P. Venta" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-black" value={productForm.precioVenta} onChange={(e) => setProductForm({...productForm, precioVenta: e.target.value})} />
             <input type="number" placeholder="Costo" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold" value={productForm.costo} onChange={(e) => setProductForm({...productForm, costo: e.target.value})} />
          </div>
          <input type="number" placeholder="Stock Inicial" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} />
        </>
      )}

      {/* --- FORMULARIO COBRAR (POS) --- */}
      {modalType === 'cobrar' && (
        <div className="space-y-4 text-center animate-in zoom-in-95">
           <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Total a recibir</p>
           <p className="text-5xl font-black tracking-tighter">{formatMoney(carrito.reduce((a,b)=>a+(b.precioVenta*b.cantidad),0))}</p>
           <div className="text-left space-y-3 pt-4">
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Destino</label>
                <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1" value={posForm.cuentaId} onChange={(e)=>setPosForm({...posForm, cuentaId: e.target.value})}>
                  <option value="">Selecciona Cuenta</option>
                  {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
             </div>
           </div>
        </div>
      )}

      {/* --- FORMULARIO HÁBITO --- */}
      {modalType === 'habito' && (
        <>
           <input autoFocus placeholder="Nombre" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={healthForm.nombre} onChange={(e) => setHealthForm({...healthForm, nombre: e.target.value})} />
           <div className="flex gap-2 justify-center py-2">
             {[{id:'pill', i:Pill, l:'Medicina'}, {id:'sun', i:SunMedium, l:'Cuidado'}, {id:'brain', i:Brain, l:'Mente'}].map(ic => (
               <button key={ic.id} onClick={()=>setHealthForm({...healthForm, iconType: ic.id})} className={`p-3 rounded-xl flex flex-col items-center gap-1 w-24 border-2 transition-all ${healthForm.iconType === ic.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-100 text-gray-400'}`}>
                 <ic.i size={20}/> <span className="text-[9px] font-black uppercase">{ic.l}</span>
               </button>
             ))}
           </div>
           <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={healthForm.frecuencia} onChange={(e)=>setHealthForm({...healthForm, frecuencia: e.target.value})}>
             <option value="Diario">Diario</option>
             <option value="Semanal">Semanal</option>
           </select>
        </>
      )}

      {/* --- FORMULARIO PESO --- */}
      {modalType === 'peso' && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Kg</span>
          <input autoFocus type="number" placeholder="0.0" className="w-full bg-gray-100 p-4 pl-12 rounded-2xl outline-none font-black text-xl" value={healthForm.peso} onChange={(e) => setHealthForm({...healthForm, peso: e.target.value})} />
        </div>
      )}

      {/* --- FORMULARIOS FINANCIEROS (Gastos, Ingresos, Transferencias, Presupuestos) --- */}
      {['presupuesto', 'movimiento', 'transferencia', 'ahorroMeta', 'fijo', 'meta'].includes(modalType) && (
        <>
          {modalType === 'presupuesto' ? (
             <input autoFocus type="number" placeholder="Límite Mensual ($)" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-black text-xl" value={financeForm.limite} onChange={(e) => setFinanceForm({...financeForm, limite: e.target.value})} />
          ) : (
            <>
              {modalType !== 'ahorroMeta' && (
                 <input placeholder="Concepto" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={financeForm.nombre} onChange={(e) => setFinanceForm({...financeForm, nombre: e.target.value})} />
              )}
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input autoFocus type="number" placeholder="0.00" className="w-full bg-gray-100 p-4 pl-8 rounded-2xl outline-none font-black text-xl" value={financeForm.monto} onChange={(e) => setFinanceForm({...financeForm, monto: e.target.value})} />
              </div>

              {modalType === 'movimiento' && (
                <>
                   <div className="flex gap-2">
                     {['GASTO', 'INGRESO'].map(t => (
                       <button key={t} onClick={()=>setFinanceForm({...financeForm, tipo: t})} className={`flex-1 py-3 rounded-xl font-black text-xs ${financeForm.tipo === t ? (t==='INGRESO'?'bg-emerald-500 text-white':'bg-rose-500 text-white') : 'bg-gray-100 text-gray-400'}`}>{t}</button>
                     ))}
                   </div>
                   <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={financeForm.categoria} onChange={(e)=>setFinanceForm({...financeForm, categoria: e.target.value})}>
                     {CATEGORIAS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                   </select>
                   <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={financeForm.cuentaId} onChange={(e)=>setFinanceForm({...financeForm, cuentaId: e.target.value})}>
                     <option value="">Selecciona Cuenta...</option>
                     {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre} (${formatMoney(c.monto)})</option>)}
                   </select>
                </>
              )}

              {modalType === 'transferencia' && (
                 <div className="space-y-3">
                   <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={financeForm.cuentaId} onChange={(e)=>setFinanceForm({...financeForm, cuentaId: e.target.value, tipo: 'TRANSFERENCIA'})}>
                     <option value="">Desde</option>
                     {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre} (${formatMoney(c.monto)})</option>)}
                   </select>
                   <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={financeForm.cuentaDestinoId} onChange={(e)=>setFinanceForm({...financeForm, cuentaDestinoId: e.target.value})}>
                     <option value="">Hacia</option>
                     {cuentas.filter(c=>c.id !== financeForm.cuentaId).map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                   </select>
                 </div>
              )}

              {(modalType === 'ahorroMeta' || modalType === 'fijo') && (
                 modalType === 'fijo' ? (
                   <div className="flex gap-3">
                     <input type="number" placeholder="Día" className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold" value={financeForm.diaCobro} onChange={(e)=>setFinanceForm({...financeForm, diaCobro: e.target.value})} />
                   </div>
                 ) : (
                   <select className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm" value={financeForm.cuentaId} onChange={(e)=>setFinanceForm({...financeForm, cuentaId: e.target.value})}>
                     <option value="">¿De qué cuenta?</option>
                     {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                   </select>
                 )
              )}
            </>
          )}
        </>
      )}

      <button onClick={onConfirm} className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-4 uppercase text-xs tracking-widest">
        {modalType === 'cobrar' ? 'Confirmar Venta' : 'Guardar'}
      </button>
    </div>
  );
}
