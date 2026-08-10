import React from "react";
import { formatMoney } from "@/app/utils/helpers.ts";

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

export function TarjetaFormSection({ financeForm, setFinanceForm }) {
  return (
    <div className="space-y-4">
      <input
        autoFocus
        placeholder="Nombre de la tarjeta (ej: Visa, Mastercard)"
        className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
        value={financeForm.nombre}
        onChange={(e) => setFinanceForm({ ...financeForm, nombre: e.target.value })}
      />

      <input
        placeholder="Banco (ej: Banco Popular, Citibank)"
        className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm"
        value={financeForm.banco}
        onChange={(e) => setFinanceForm({ ...financeForm, banco: e.target.value })}
      />

      <div>
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Límite de Crédito</label>
        <div className="flex items-center bg-gray-100 p-4 rounded-2xl mt-1">
          <span className="text-gray-400 font-bold mr-2">$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full bg-transparent outline-none font-black text-2xl"
            value={financeForm.limite}
            onChange={(e) => setFinanceForm({ ...financeForm, limite: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Saldo Actual</label>
        <div className="flex items-center bg-gray-100 p-4 rounded-2xl mt-1">
          <span className="text-gray-400 font-bold mr-2">$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full bg-transparent outline-none font-black text-2xl"
            value={financeForm.saldo}
            onChange={(e) => setFinanceForm({ ...financeForm, saldo: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
