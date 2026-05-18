"use client";

import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const categorias = [
  'proteina',
  'vegetal',
  'fruta',
  'carbohidrato',
  'lacteo',
  'bebida',
  'condimento',
  'otro'
];

const unidades = ['g', 'ml', 'unidad', 'porcion'];

const INITIAL_FORM = {
  nombre: '',
  categoria: 'otro',
  cantidad: 1,
  unidad: 'g',
  fechaExpiracion: '',
  precio: 0
};

export default function ModalAgregarItem({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleAdd = () => {
    if (!form.nombre.trim()) return;

    onAdd({
      ...form,
      cantidad: Number(form.cantidad) || 0,
      precio: Number(form.precio) || undefined,
      fechaExpiracion: form.fechaExpiracion || undefined
    });

    setForm(INITIAL_FORM);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="mx-4 w-full max-w-md space-y-4 rounded-[32px] bg-white p-6 dark:bg-gray-800"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Agregar al Refri</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            placeholder="Ej: pechuga de pollo"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Categoria</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Cantidad</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.cantidad}
              onChange={(e) => setForm((prev) => ({ ...prev, cantidad: Number(e.target.value) }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Unidad</label>
            <select
              value={form.unidad}
              onChange={(e) => setForm((prev) => ({ ...prev, unidad: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {unidades.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Expiracion</label>
            <input
              type="date"
              value={form.fechaExpiracion}
              onChange={(e) => setForm((prev) => ({ ...prev, fechaExpiracion: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Precio</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm((prev) => ({ ...prev, precio: Number(e.target.value) }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-100 py-2 font-bold text-gray-900 dark:bg-gray-700 dark:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 py-2 font-bold text-white hover:bg-blue-600"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}