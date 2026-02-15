import React from 'react';
import { Pill, SunMedium, Brain, Info, Scale, Heart } from 'lucide-react';
import { CATEGORIAS, formatMoney } from '@/app/utils/helpers.ts';

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
          <Info size={14} /> {errorMsg}
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
              <span className="text-[8px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase">ID: {productForm.id.slice(0, 5)}</span>
            )}
          </div>

          <input
            autoFocus
            placeholder="Nombre comercial"
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all"
            value={productForm.nombre}
            onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
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
                  onChange={(e) => setProductForm({ ...productForm, precioVenta: e.target.value })}
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
                  onChange={(e) => setProductForm({ ...productForm, costo: e.target.value })}
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
              onChange={(e) => setProductForm({ ...productForm, stock: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>
        </div>
      )}

      {/* --- FORMULARIO MOVIMIENTO (INGRESO/GASTO) --- */}
      {modalType === 'movimiento' && (
        <div className="space-y-4">
          <input
            autoFocus
            placeholder="Descripción del movimiento"
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
            value={financeForm.nombre}
            onChange={(e) => setFinanceForm({ ...financeForm, nombre: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFinanceForm({ ...financeForm, tipo: 'INGRESO' })}
              className={`p-4 rounded-2xl font-black text-sm transition-all ${financeForm.tipo === 'INGRESO'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-400'
                }`}
            >
              💰 INGRESO
            </button>
            <button
              type="button"
              onClick={() => setFinanceForm({ ...financeForm, tipo: 'GASTO' })}
              className={`p-4 rounded-2xl font-black text-sm transition-all ${financeForm.tipo === 'GASTO'
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-400'
                }`}
            >
              💸 GASTO
            </button>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Monto</label>
            <div className="flex items-center bg-gray-100 p-4 rounded-2xl mt-1">
              <span className="text-gray-400 font-bold mr-2">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-transparent outline-none font-black text-2xl"
                value={financeForm.monto}
                onChange={(e) => setFinanceForm({ ...financeForm, monto: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Cuenta</label>
            <select
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.cuentaId}
              onChange={(e) => setFinanceForm({ ...financeForm, cuentaId: e.target.value })}
            >
              <option value="">Seleccionar cuenta...</option>
              {cuentas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({formatMoney(c.monto)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Categoría</label>
            <select
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.categoria}
              onChange={(e) => setFinanceForm({ ...financeForm, categoria: e.target.value })}
            >
              {CATEGORIAS.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* --- FORMULARIO PRESUPUESTO --- */}
      {modalType === 'presupuesto' && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Categoría</label>
            <select
              autoFocus
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.categoria}
              onChange={(e) => setFinanceForm({ ...financeForm, categoria: e.target.value })}
            >
              {CATEGORIAS.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Límite Mensual</label>
            <div className="flex items-center bg-gray-100 p-4 rounded-2xl mt-1">
              <span className="text-gray-400 font-bold mr-2">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-transparent outline-none font-black text-2xl"
                value={financeForm.limite || financeForm.monto}
                onChange={(e) => setFinanceForm({ ...financeForm, limite: e.target.value, monto: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULARIO META (AHORRO) --- */}
      {modalType === 'meta' && (
        <div className="space-y-4">
          <input
            autoFocus
            placeholder="Nombre de la meta (ej: Vacaciones, Auto)"
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
            value={financeForm.nombre}
            onChange={(e) => setFinanceForm({ ...financeForm, nombre: e.target.value })}
          />

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Monto Objetivo</label>
            <div className="flex items-center bg-gray-100 p-4 rounded-2xl mt-1">
              <span className="text-gray-400 font-bold mr-2">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-transparent outline-none font-black text-2xl"
                value={financeForm.monto}
                onChange={(e) => setFinanceForm({ ...financeForm, monto: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULARIO FIJO (GASTO RECURRENTE) --- */}
      {modalType === 'fijo' && (
        <div className="space-y-4">
          <input
            autoFocus
            placeholder="Nombre del gasto (ej: Netflix, Renta)"
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
            value={financeForm.nombre}
            onChange={(e) => setFinanceForm({ ...financeForm, nombre: e.target.value })}
          />

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Monto</label>
            <div className="flex items-center bg-gray-100 p-4 rounded-2xl mt-1">
              <span className="text-gray-400 font-bold mr-2">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-transparent outline-none font-black text-2xl"
                value={financeForm.monto}
                onChange={(e) => setFinanceForm({ ...financeForm, monto: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Periodicidad</label>
            <select
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.periodicidad || 'Mensual'}
              onChange={(e) => setFinanceForm({ ...financeForm, periodicidad: e.target.value })}
            >
              <option value="Semanal">Semanal</option>
              <option value="Quincenal">Quincenal</option>
              <option value="Mensual">Mensual</option>
              <option value="Anual">Anual</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Día de Cobro</label>
            <input
              type="number"
              min="1"
              max="31"
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.diaCobro || '1'}
              onChange={(e) => setFinanceForm({ ...financeForm, diaCobro: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* --- FORMULARIO CUENTA --- */}
      {modalType === 'cuenta' && (
        <div className="space-y-4">
          <input
            autoFocus
            placeholder="Nombre de la cuenta (ej: Efectivo, Banco)"
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
            value={financeForm.nombre}
            onChange={(e) => setFinanceForm({ ...financeForm, nombre: e.target.value })}
          />

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Saldo Inicial</label>
            <div className="flex items-center bg-gray-100 p-4 rounded-2xl mt-1">
              <span className="text-gray-400 font-bold mr-2">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-transparent outline-none font-black text-2xl"
                value={financeForm.monto}
                onChange={(e) => setFinanceForm({ ...financeForm, monto: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULARIO COBRAR (SISTEMA POS) --- */}
      {modalType === 'cobrar' && (
        <div className="space-y-4 text-center animate-in zoom-in-95">
          <div className="py-2">
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Monto a Cobrar</p>
            <p className="text-5xl font-black tracking-tighter text-indigo-600">
              {formatMoney(carrito.reduce((a, b) => a + (b.precioVenta * b.cantidad), 0))}
            </p>
          </div>

          <div className="text-left space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">¿A qué caja ingresa?</label>
              <select
                className="w-full bg-gray-100 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm mt-1 appearance-none transition-all cursor-pointer"
                value={posForm.cuentaId}
                onChange={(e) => setPosForm({ ...posForm, cuentaId: e.target.value })}
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
                onChange={(e) => setPosForm({ ...posForm, cliente: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULARIO PESO --- */}
      {modalType === 'peso' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[30px] shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Scale size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Registro de Peso</p>
                <p className="text-sm font-bold">Seguimiento Corporal</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <label className="text-[9px] font-black uppercase opacity-70 ml-1">Peso (kg)</label>
              <input
                autoFocus
                type="number"
                step="0.1"
                placeholder="Ej: 70.5"
                className="w-full bg-transparent outline-none font-black text-4xl mt-2 text-white placeholder-white/30"
                value={healthForm.peso}
                onChange={(e) => setHealthForm({ ...healthForm, peso: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULARIO HÁBITO --- */}
      {modalType === 'habito' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-emerald-100 p-2.5 rounded-xl">
              <Heart size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Nuevo Hábito</p>
              <p className="text-xs text-gray-500 font-bold">Construye tu rutina diaria</p>
            </div>
          </div>

          <input
            autoFocus
            placeholder="Nombre del hábito (Ej: Meditar 10 min)"
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-emerald-500 transition-all"
            value={healthForm.nombre}
            onChange={(e) => setHealthForm({ ...healthForm, nombre: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-2">
            {['Diario', 'Semanal', 'Mensual'].map(freq => (
              <button
                key={freq}
                onClick={() => setHealthForm({ ...healthForm, frecuencia: freq })}
                className={`p-3 rounded-xl font-black text-xs uppercase transition-all ${healthForm.frecuencia === freq
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {freq}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-2 block">Icono</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'pill', icon: Pill, label: 'Salud' },
                { id: 'sun', icon: SunMedium, label: 'Energía' },
                { id: 'brain', icon: Brain, label: 'Mental' },
                { id: 'heart', icon: Heart, label: 'Bienestar' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setHealthForm({ ...healthForm, iconType: id })}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${healthForm.iconType === id
                    ? 'bg-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-[8px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULARIO TRANSFERENCIA --- */}
      {modalType === 'transferencia' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-5 rounded-[25px] text-white shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2">Transferencia entre Cuentas</p>
            <p className="text-2xl font-black">💸</p>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Monto a Transferir</label>
            <input
              autoFocus
              type="number"
              placeholder="0.00"
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-2xl mt-1"
              value={financeForm.monto}
              onChange={(e) => setFinanceForm({ ...financeForm, monto: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Desde Cuenta</label>
            <select
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.cuentaId}
              onChange={(e) => setFinanceForm({ ...financeForm, cuentaId: e.target.value })}
            >
              <option value="">Seleccionar cuenta origen</option>
              {cuentas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} - {formatMoney(c.monto)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Hacia Cuenta</label>
            <select
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.cuentaDestinoId}
              onChange={(e) => setFinanceForm({ ...financeForm, cuentaDestinoId: e.target.value })}
            >
              <option value="">Seleccionar cuenta destino</option>
              {cuentas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} - {formatMoney(c.monto)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* --- FORMULARIO AHORRO A META --- */}
      {modalType === 'ahorroMeta' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 rounded-[25px] text-white shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2">Ahorrar a Meta</p>
            <p className="text-2xl font-black">🎯</p>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Monto a Ahorrar</label>
            <input
              autoFocus
              type="number"
              placeholder="0.00"
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-2xl mt-1"
              value={financeForm.monto}
              onChange={(e) => setFinanceForm({ ...financeForm, monto: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Desde Cuenta</label>
            <select
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm mt-1"
              value={financeForm.cuentaId}
              onChange={(e) => setFinanceForm({ ...financeForm, cuentaId: e.target.value })}
            >
              <option value="">Seleccionar cuenta</option>
              {cuentas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} - {formatMoney(c.monto)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        onClick={onConfirm}
        className="w-full bg-black text-white font-black py-5 rounded-[22px] shadow-xl active:scale-95 transition-all mt-4 uppercase text-[11px] tracking-widest"
      >
        {modalType === 'cobrar' ? 'Confirmar Pago y Cerrar' :
          modalType === 'producto' && productForm.id ? 'Actualizar Producto' :
            modalType === 'producto' ? 'Guardar en Inventario' :
              modalType === 'movimiento' ? 'Registrar Movimiento' :
                modalType === 'presupuesto' ? 'Crear Presupuesto' :
                  modalType === 'cuenta' ? 'Crear Cuenta' :
                    modalType === 'meta' ? 'Crear Meta de Ahorro' :
                      modalType === 'fijo' ? 'Crear Gasto Fijo' :
                        'Guardar'}
      </button>
    </div>
  );
}