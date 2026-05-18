"use client";

import React, { useMemo, useState } from 'react';
import { AlertCircle, ChefHat, Clock, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRefrigerador } from '@/app/hooks/useRefrigerador';
import ModalAgregarItem from '../ui/ModalAgregarItem';

const CATEGORIAS = {
  proteina: { label: 'Proteina', icon: '??' },
  vegetal: { label: 'Vegetal', icon: '??' },
  fruta: { label: 'Fruta', icon: '??' },
  carbohidrato: { label: 'Carbohidrato', icon: '??' },
  lacteo: { label: 'Lacteo', icon: '??' },
  bebida: { label: 'Bebida', icon: '??' },
  condimento: { label: 'Condimento', icon: '??' },
  otro: { label: 'Otro', icon: '??' }
};

export default function RefrigeradorTab({ user, todasLasRecetas = [] }) {
  const {
    inventario,
    agregarItem,
    removerItem,
    actualizarCantidad,
    itemsProximosAExpirar,
    itemsVencidos,
    recetasDisponibles
  } = useRefrigerador(user?.uid);

  const [modalOpen, setModalOpen] = useState(false);
  const [filtro, setFiltro] = useState('todos');

  const itemsFiltrados = useMemo(() => {
    if (filtro === 'todos') return inventario;
    return inventario.filter((item) => item.categoria === filtro);
  }, [filtro, inventario]);

  const recetasQuePuedesHacer = recetasDisponibles(todasLasRecetas);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <ResumenCard title="Total" value={inventario.length} color="text-gray-900 dark:text-white" />
        <ResumenCard title="Proximos" value={itemsProximosAExpirar.length} color="text-orange-600" />
        <ResumenCard title="Vencidos" value={itemsVencidos.length} color="text-red-600" />
      </div>

      {itemsVencidos.length > 0 && (
        <div className="space-y-2 rounded-[28px] border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <div className="mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase">Items vencidos</span>
          </div>
          {itemsVencidos.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-[10px]">
              <span>{item.nombre}</span>
              <button onClick={() => removerItem(item.id)} className="font-bold hover:underline">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {itemsProximosAExpirar.length > 0 && (
        <div className="space-y-2 rounded-[28px] border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20">
          <div className="mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <Clock size={18} />
            <span className="text-[10px] font-black uppercase">Proximos a vencer</span>
          </div>
          {itemsProximosAExpirar.map((item) => (
            <div key={item.id} className="text-[10px] text-orange-700 dark:text-orange-300">
              {item.nombre} - {new Date(item.fechaExpiracion).toLocaleDateString('es-ES')}
            </div>
          ))}
        </div>
      )}

      {recetasQuePuedesHacer.length > 0 && (
        <div className="rounded-[28px] border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
          <div className="mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
            <ChefHat size={18} />
            <span className="text-[10px] font-black uppercase">Recetas disponibles</span>
          </div>
          <div className="space-y-2">
            {recetasQuePuedesHacer.slice(0, 3).map((receta) => (
              <div key={receta.id} className="rounded-xl bg-white p-3 text-[10px] font-bold text-gray-900 dark:bg-gray-800 dark:text-white">
                {receta.nombre}
              </div>
            ))}
            {recetasQuePuedesHacer.length > 3 && (
              <p className="text-center text-[9px] text-green-700 dark:text-green-300">
                +{recetasQuePuedesHacer.length - 3} mas
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        <FiltroButton active={filtro === 'todos'} onClick={() => setFiltro('todos')}>
          Todos ({inventario.length})
        </FiltroButton>
        {Object.entries(CATEGORIAS).map(([key, cat]) => (
          <FiltroButton key={key} active={filtro === key} onClick={() => setFiltro(key)}>
            {cat.icon} ({inventario.filter((item) => item.categoria === key).length})
          </FiltroButton>
        ))}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 font-black text-white"
      >
        <Plus size={18} /> Agregar a Refri
      </button>

      <div className="space-y-3">
        {itemsFiltrados.length === 0 ? (
          <div className="py-8 text-center opacity-50">
            <ShoppingCart size={30} className="mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold uppercase text-gray-400">Refri vacio</p>
          </div>
        ) : (
          itemsFiltrados.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-[28px] border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {CATEGORIAS[item.categoria]?.icon || '??'} {item.nombre}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[8px] font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {item.cantidad}{item.unidad}
                    </span>
                    {item.fechaExpiracion && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-[8px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {new Date(item.fechaExpiracion).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removerItem(item.id)}
                  className="text-rose-500 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                  className="rounded-lg bg-gray-100 py-1 text-[10px] font-black dark:bg-gray-700"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) => actualizarCantidad(item.id, Number(e.target.value))}
                  className="rounded-lg bg-gray-100 px-2 py-1 text-center text-[10px] font-black dark:bg-gray-700"
                />
                <button
                  onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                  className="rounded-lg bg-blue-500 py-1 text-[10px] font-black text-white"
                >
                  +
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ModalAgregarItem isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={agregarItem} />
    </div>
  );
}

function ResumenCard({ title, value, color }) {
  return (
    <div className="rounded-[28px] border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1 text-[9px] font-black uppercase text-gray-500">{title}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function FiltroButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-2 text-[10px] font-bold transition-all ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}