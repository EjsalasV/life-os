import React from 'react';
import { Plus } from 'lucide-react';

/**
 * COMPONENTE: FloatingActionButton (FAB)
 * Un botón flotante optimizado para acciones rápidas.
 * @param {Function} onClick - Función a ejecutar al presionar.
 * @param {string} iconColor - Color opcional para el icono.
 */
export default function FloatingActionButton({ onClick, iconColor = "white", adventure = false }) {
  return (
    <button 
      onClick={onClick} 
      className={`absolute bottom-24 right-6 z-50 group flex h-14 w-14 items-center justify-center text-white transition-all duration-200 ${adventure ? "adventure-fab" : "rounded-full bg-black shadow-2xl dark:bg-blue-600 active:scale-90 hover:scale-105"}`}
      aria-label="Agregar nuevo"
    >
      <Plus 
        size={28} 
        strokeWidth={3} 
        className={`text-${iconColor} group-hover:rotate-90 transition-transform duration-300`} 
      />
      
      {/* Efecto de brillo sutil para nivel experto */}
      <div className={`pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100 ${adventure ? "" : "rounded-full"}`} />
    </button>
  );
}
