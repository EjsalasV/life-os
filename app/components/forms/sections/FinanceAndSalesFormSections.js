import React from "react";
import { CATEGORIAS, formatMoney } from "@/app/utils/helpers.ts";

export function ProductoFormSection({ productForm, setProductForm }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
          {productForm.id ? "Modificar Producto" : "Nuevo Producto"}
        </p>
        {productForm.id && (
          <span className="text-[8px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase">
            ID: {productForm.id.slice(0, 5)}
          </span>
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
  );
}

export function CobrarFormSection({ carrito, posForm, setPosForm, cuentas }) {
  return (
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
  );
}

export function MovimientoFormSection({ financeForm, setFinanceForm, cuentas }) {
  return (
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
          onClick={() => setFinanceForm({ ...financeForm, tipo: "INGRESO" })}
          className={`p-4 rounded-2xl font-black text-sm transition-all ${financeForm.tipo === "INGRESO" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"}`}
        >
          💰 INGRESO
        </button>
        <button
          type="button"
          onClick={() => setFinanceForm({ ...financeForm, tipo: "GASTO" })}
          className={`p-4 rounded-2xl font-black text-sm transition-all ${financeForm.tipo === "GASTO" ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-400"}`}
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
  );
}

export function PresupuestoFormSection({ financeForm, setFinanceForm }) {
  return (
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
  );
}

export function MetaFormSection({ financeForm, setFinanceForm }) {
  return (
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
  );
}

export function FijoFormSection({ financeForm, setFinanceForm }) {
  return (
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
          value={financeForm.periodicidad || "Mensual"}
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
          value={financeForm.diaCobro || "1"}
          onChange={(e) => setFinanceForm({ ...financeForm, diaCobro: e.target.value })}
        />
      </div>
    </div>
  );
}

export function CuentaFormSection({ financeForm, setFinanceForm }) {
  return (
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
  );
}

export function TransferenciaFormSection({ financeForm, setFinanceForm, cuentas }) {
  return (
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
  );
}

export function AhorroMetaFormSection({ financeForm, setFinanceForm, cuentas }) {
  return (
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
  );
}
