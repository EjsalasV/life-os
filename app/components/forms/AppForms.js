import React from 'react';
import { Pill, SunMedium, Brain, Info } from 'lucide-react';
import { CATEGORIAS, formatMoney } from '@/app/utils/helpers';

/**
 * APP FORMS - EXPERT EDITION
 * Sistema centralizado de formularios con lógica de detección de edición (CRUD).
 */
export default function AppForms({
  modalType, 
  errorMsg,
  financeForm, setFinanceForm,
  productForm, setProductForm,
  posForm, setPosForm,
  healthForm, setHealthForm,
  cuentas, carrito, selectedBudgetCat,
  onConfirm
}) {

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl flex gap-2 items-center animate-in fade-in zoom-in-95">
          <Info size={14}/> {errorMsg}
        </div>
      )}

      {/* --- FORMULARIO PRODUCTO (CREACIÓN Y EDICIÓN COMPLETA) --- */}
      {modalType === 'producto' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
              {productForm.id ? 'Modificar Producto' : 'Nuevo Producto'}
            </p>
            {productForm.id && (
              <span className="text-[8px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase">ID: {productForm.id.slice(0,5)}</span>
            )}
          </div>
          
          <input 
            autoFocus 
            placeholder="Nombre comercial" 
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" 
            value={productForm.nombre} 
            onChange={(e) => setProductForm({...productForm, nombre: e.target.value})} 
          />
          
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Precio Venta</label>
                <div className="flex items-center mt-1">
                   <span className="text-gray-400 font-bold mr-1">$</span>
                   <input 
                      type="number" 
                      step="0.01"
                      className="w-full bg-transparent outline-none font-black text-indigo-600" 
                      value={productForm.precioVenta} 
                      onChange={(e) => setProductForm({...productForm, precioVenta: e.target.value})} 
                   />
                </div>
             </div>
             <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Costo Unitario</label>
                <div className="flex items-center mt-1">
                   <span className="text-gray-400 font-bold mr-1">$</span>
                   <input 
                      type="number" 
                      step="0.01"
                      className="w-full bg-transparent outline-none font-bold text-gray-500" 
                      value={productForm.costo} 
                      onChange={(e) => setProductForm({...productForm, costo: e.target.value})} 
                   />
                </div>
             </div>
          </div>

          <div className="bg-gray-900 p-5 rounded-[25px] shadow-lg shadow-indigo-100 dark:shadow-none">
            <label className="text-[10px] font-black uppercase text-indigo-300 ml-1 tracking-wider">Existencia en Almacén</label>
            <input 
                type="number" 
                min="0"
                className="w-full bg-transparent outline-none font-black text-3xl mt-1 text-white" 
                value={productForm.stock} 
                onChange={(e) => setProductForm({...productForm, stock: Math.max(0, parseInt(e.target.value) || 0)})} 
            />
          </div>
        </div>
      )}

      {/* --- FORMULARIO COBRAR (SISTEMA POS) --- */}
      {modalType === 'cobrar' && (
        <div className="space-y-4 text-center animate-in zoom-in-95">
           <div className="py-2">
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Monto a Cobrar</p>
              <p className="text-5xl font-black tracking-tighter text-indigo-600">
                {formatMoney(carrito.reduce((a,b)=>a+(b.precioVenta*b.cantidad),0))}
              </p>
           </div>
           
           <div className="text-left space-y-4 pt-4 border-t border-gray-100">
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">¿A qué caja ingresa?</label>
                <select 
                    className="w-full bg-gray-100 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm mt-1 appearance-none transition-all cursor-pointer" 
                    value={posForm.cuentaId} 
                    onChange={(e)=>setPosForm({...posForm, cuentaId: e.target.value})}
                >
                  <option value="">Seleccionar cuenta...</option>
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.nombre} ({formatMoney(c.monto)})
                    </option>
                  ))}
                </select>
             </div>
             
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cliente / Nota</label>
                <input 
                    placeholder="Ej: Consumidor Final" 
                    className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1" 
                    value={posForm.cliente} 
                    onChange={(e)=>setPosForm({...posForm, cliente: e.target.value})} 
                />
             </div>
           </div>
        </div>
      )}

      <button 
        onClick={onConfirm} 
        className="w-full bg-black text-white font-black py-5 rounded-[22px] shadow-xl active:scale-95 transition-all mt-4 uppercase text-[11px] tracking-widest"
      >
        {modalType === 'cobrar' ? 'Confirmar Pago y Cerrar' : productForm.id ? 'Actualizar Producto' : 'Guardar en Inventario'}
      </button>
    </div>
  );
}