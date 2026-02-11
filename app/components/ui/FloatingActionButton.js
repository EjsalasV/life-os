import React from 'react';
import { Plus } from 'lucide-react';

/**
 * COMPONENTE: FloatingActionButton (FAB)
 * Un botón flotante optimizado para acciones rápidas.
 * @param {Function} onClick - Función a ejecutar al presionar.
 * @param {string} iconColor - Color opcional para el icono.
 */
export default function FloatingActionButton({ onClick, iconColor = "white" }) {
  return (
    <button 
      onClick={onClick} 
      className="absolute bottom-24 right-6 w-14 h-14 bg-black dark:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200 z-50 group"
      aria-label="Agregar nuevo"
    >
      <Plus 
        size={28} 
        strokeWidth={3} 
        className={`text-${iconColor} group-hover:rotate-90 transition-transform duration-300`} 
      />
      
      {/* Efecto de brillo sutil para nivel experto */}
      <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}