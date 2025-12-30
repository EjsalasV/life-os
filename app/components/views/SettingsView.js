"use client";
import { LogOut, User, Moon, Sun, ShieldCheck } from "lucide-react";

export default function SettingsView({ user, logOut }) {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User className="text-blue-400" /> Perfil
        </h2>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.displayName || "Usuario"}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
              <ShieldCheck className="w-3 h-3 mr-1" /> Plan Free
            </div>
          </div>
        </div>

        <button 
          onClick={() => logOut()}
          className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-900/50 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 opacity-50">
        <h3 className="text-lg font-bold mb-2">Próximamente</h3>
        <p className="text-sm text-gray-400">Aquí podrás configurar tus metas, conectar n8n y cambiar a Modo Claro (si te atreves).</p>
      </div>
    </div>
  );
}