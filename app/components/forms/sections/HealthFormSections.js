import React from "react";
import { Pill, SunMedium, Brain, Scale, Heart } from "lucide-react";

export function PesoFormSection({ healthForm, setHealthForm }) {
  return (
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
  );
}

export function HabitoFormSection({ healthForm, setHealthForm }) {
  return (
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
        {["Diario", "Semanal", "Mensual"].map(freq => (
          <button
            key={freq}
            onClick={() => setHealthForm({ ...healthForm, frecuencia: freq })}
            className={`p-3 rounded-xl font-black text-xs uppercase transition-all ${healthForm.frecuencia === freq ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}
          >
            {freq}
          </button>
        ))}
      </div>

      <div>
        <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-2 block">Icono</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "pill", icon: Pill, label: "Salud" },
            { id: "sun", icon: SunMedium, label: "Energía" },
            { id: "brain", icon: Brain, label: "Mental" },
            { id: "heart", icon: Heart, label: "Bienestar" }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setHealthForm({ ...healthForm, iconType: id })}
              className={`p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${healthForm.iconType === id ? "bg-emerald-500 text-white shadow-lg scale-105" : "bg-gray-100 text-gray-400"}`}
            >
              <Icon size={20} />
              <span className="text-[8px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
