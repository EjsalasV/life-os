"use client";
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function ModalAlimentoCustom({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    nombre: '',
    calorias: 0,
    proteina: 0,
    carbohidratos: 0,
    grasas: 0
  });

  const handleAdd = () => {
    if (!form.nombre.trim()) return;
    onAdd(form);
    setForm({ nombre: '', calorias: 0, proteina: 0, carbohidratos: 0, grasas: 0 });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-[35px] max-w-sm w-full mx-4 space-y-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Agregar Alimento Custom</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="ej: Arroz con pollo"
            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">Calorías</label>
            <input
              type="number"
              value={form.calorias}
              onChange={(e) => setForm({ ...form, calorias: Number(e.target.value) })}
              placeholder="0"
              className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">Proteína (g)</label>
            <input
              type="number"
              value={form.proteina}
              onChange={(e) => setForm({ ...form, proteina: Number(e.target.value) })}
              placeholder="0"
              className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">Carbos (g)</label>
            <input
              type="number"
              value={form.carbohidratos}
              onChange={(e) => setForm({ ...form, carbohidratos: Number(e.target.value) })}
              placeholder="0"
              className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase">Grasas (g)</label>
            <input
              type="number"
              value={form.grasas}
              onChange={(e) => setForm({ ...form, grasas: Number(e.target.value) })}
              placeholder="0"
              className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-gray-900 dark:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
          >
            Agregar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
