"use client";
import React from 'react';
import { Moon, LogOut } from 'lucide-react';

export default function SettingsView({ user, setDailyCloseOpen, logOut }) {
  return (
    <div className="text-center pt-8 animate-in fade-in px-4">
       <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-black mb-4 shadow-xl">{user.displayName ? user.displayName[0] : "U"}</div>
       <h2 className="text-2xl font-black">{user.displayName}</h2>
       <p className="text-xs font-bold text-gray-400 mb-8">{user.email}</p>
       
       <button onClick={()=>setDailyCloseOpen(true)} className="w-full p-5 rounded-2xl font-black text-white bg-gray-900 mb-4 flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform">
          <Moon size={20} className="text-purple-300"/>
          Ver Resumen del Día
       </button>

       <button onClick={logOut} className="w-full p-4 rounded-2xl font-bold text-rose-500 bg-rose-50 flex justify-center gap-2 active:scale-95 transition-transform"><LogOut size={20}/> Cerrar Sesión</button>
    </div>
  );
}