"use client";
import React, { useState } from 'react';
import { 
  Wallet, ShoppingBag, Activity, Crown, Lock, Mail, User, ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AUTH VIEW - LIFE OS
 * Pantalla de entrada con marketing visual de los 3 pilares.
 */
export default function AuthView({ onLogin, onRegister, loading, error }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) onLogin(email, password);
    else onRegister(email, password, name);
  };

  const features = [
    { l: 'Wallet', desc: 'Control de Gastos', icon: Wallet, color: 'bg-blue-500' },
    { l: 'Negocio', desc: 'Ventas y Stock', icon: ShoppingBag, color: 'bg-indigo-600' },
    { l: 'Salud', desc: 'Energía y Peso', icon: Activity, color: 'bg-rose-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pb-12">
      
      {/* HEADER / LOGO */}
      <div className="text-center mb-10">
         <div className="w-16 h-16 bg-black rounded-[22px] flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Crown size={32} className="text-white" />
         </div>
         <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Life OS</h1>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1 italic">Version 1</p>
      </div>

      {/* FORMULARIO DE ACCESO */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-white p-8 rounded-[40px] shadow-2xl shadow-gray-200 border border-gray-100"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
              <input 
                type="text" 
                placeholder="Tu nombre o Nickname" 
                required 
                className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-black/5 transition-all" 
                value={name} 
                onChange={(e)=>setName(e.target.value)} 
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
            <input 
              type="email" 
              placeholder="Email" 
              required 
              className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none font-bold text-sm" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
            <input 
              type="password" 
              placeholder="Contraseña" 
              required 
              className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none font-bold text-sm" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
            />
          </div>

          {error && (
            <p className="text-[10px] font-black text-rose-500 uppercase text-center bg-rose-50 p-2 rounded-xl border border-rose-100 animate-pulse">
              {error}
            </p>
          )}

          <button 
            disabled={loading} 
            className="w-full bg-black text-white font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Sincronizando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            {!loading && <ArrowRight size={16}/>}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
        >
          {isLogin ? '¿Nuevo aquí? Regístrate gratis' : '¿Ya tienes cuenta? Entra aquí'}
        </button>
      </motion.div>

      {/* LOS TRES PILARES (MARKETING VISUAL) */}
      <div className="w-full max-w-md mt-16 space-y-6">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] text-center mb-2 italic">Explora el ecosistema</p>
         <div className="grid grid-cols-3 gap-3">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 transition-transform hover:scale-105">
                 <div className={`${f.color} p-3 rounded-2xl text-white shadow-lg shadow-current/10`}>
                    <f.icon size={20} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-900 leading-tight uppercase">{f.l}</p>
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter leading-none">{f.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}