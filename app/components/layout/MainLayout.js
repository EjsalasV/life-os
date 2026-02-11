import React from 'react';
import { Wallet, Store, Activity, Settings, WifiOff, Sun, Moon, Flame } from 'lucide-react';

export default function MainLayout({ 
  children, 
  userStats, 
  isOnline, 
  darkMode, 
  setDarkMode, 
  activeTab, 
  setActiveTab, 
  toast 
}) {
  
  const navItems = [
    { id: 'finanzas', icon: Wallet, label: 'Wallet' },
    { id: 'ventas', icon: Store, label: 'Negocio' },
    { id: 'salud', icon: Activity, label: 'Protocolo' },
    { id: 'settings', icon: Settings, label: 'Perfil' },
  ];

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-black' : 'bg-[#f2f2f7]'} p-4 font-sans select-none text-[#1c1c1e] transition-colors duration-500`}>
      
      {/* Contenedor del Simulador (Diseño 2995eac) */}
      <div className={`w-full max-w-[390px] h-[844px] rounded-[55px] shadow-2xl overflow-hidden relative flex flex-col transition-colors duration-500 ${darkMode ? 'bg-[#1c1c1e] text-white' : 'bg-white text-black'}`}>
        
        {/* HEADER GLOBAL */}
        <div className="px-6 pt-12 pb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Life OS</span>
              {userStats?.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse">
                  <Flame size={12} className="text-orange-500 fill-orange-500"/>
                  <span className="text-[9px] font-black text-orange-600">{userStats.currentStreak} días</span>
                </div>
              )}
              {!isOnline && (
                <div className="flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"/>
                  <span className="text-[9px] font-black text-rose-600">Offline</span>
                </div>
              )}
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="text-gray-400 active:scale-90 transition-transform">
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-black tracking-tight capitalize">{activeTab}</h1>
          </div>
        </div>

        {/* ÁREA DE CONTENIDO (Vistas) */}
        <div className="flex-1 overflow-y-auto px-5 pb-32 pt-2 space-y-4" style={{scrollbarWidth: 'none'}}>
          {children}
        </div>

        {/* MENÚ INFERIOR (DOCK) */}
        <div className="h-24 border-t flex justify-around pt-4 backdrop-blur-md bg-white/90 dark:bg-black/90 border-gray-100 dark:border-gray-800 z-50">
          {navItems.map((t) => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === t.id ? (t.id === 'salud' ? 'text-teal-600 scale-110' : t.id==='ventas' ? 'text-black dark:text-white scale-110' : 'text-blue-600 scale-110') : 'text-gray-400'}`}
            >
              <t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase">{t.label}</span>
            </button>
          ))}
        </div>

        {/* NOTIFICACIONES (TOAST) */}
        {toast && (
          <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-top duration-300 ${
            toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
          }`}>
            {toast.message}
          </div>
        )}

      </div>
    </div>
  );
}