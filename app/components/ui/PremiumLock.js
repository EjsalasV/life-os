import React from 'react';
import { Lock } from 'lucide-react';

export default function PremiumLock({ isPro, children, text = "Función Premium" }) {
  // Si es PRO, mostramos el contenido normal
  if (isPro) return children;

  // Si es FREE, mostramos el contenido borroso y bloqueado
  return (
    <div className="relative group overflow-hidden rounded-2xl">
      {/* Contenido original (borroso y desactivado) */}
      <div className="filter blur-[2px] opacity-50 pointer-events-none select-none grayscale">
        {children}
      </div>

      {/* Capa del Candado */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/10 backdrop-blur-[1px] transition-all hover:bg-gray-50/20 cursor-not-allowed">
        <div className="bg-black text-white p-3 rounded-full shadow-xl mb-2 animate-in zoom-in duration-300">
          <Lock size={18} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 bg-white/80 px-2 py-1 rounded-lg shadow-sm">
          {text}
        </span>
      </div>
    </div>
  );
}
