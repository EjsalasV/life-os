import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full bg-white rounded-t-[45px] p-6 pb-12 animate-in slide-in-from-bottom duration-300 max-w-[390px] overflow-y-auto max-h-[90%] shadow-2xl border-t border-gray-100">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
