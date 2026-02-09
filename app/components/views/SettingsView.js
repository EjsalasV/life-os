"use client";
import React, { useState } from 'react';
import { 
  LogOut, User, Crown, Shield, CreditCard, ChevronRight, 
  CheckCircle2, Save, X, Mail, LifeBuoy 
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';

export default function SettingsView({ user, logOut }) {
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  
  const isPro = user?.plan === 'pro';

  // --- 1. EDITAR PERFIL ---
  const handleSaveProfile = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
        await updateProfile(user, { displayName: newName });
        await updateDoc(doc(db, "users", user.uid), { name: newName });
        setEditing(false);
        window.location.reload(); 
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // --- 2. SEGURIDAD (Cambiar Contraseña) ---
  const handleSecurity = async () => {
    if (!confirm(`¿Enviar un correo a ${user.email} para cambiar la contraseña?`)) return;
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("✅ Correo enviado. Revisa tu bandeja de entrada (y spam) para crear una nueva contraseña.");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SUSCRIPCIÓN (Simulada) ---
  const handleUpgrade = async () => {
    if (!confirm("¿Simular pago de suscripción PRO? 💳")) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { plan: 'pro' });
      alert("¡Bienvenido al Plan PRO! 🚀");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDowngrade = async () => {
    if (!confirm("¿Cancelar suscripción?")) return;
    try { await updateDoc(doc(db, "users", user.uid), { plan: 'free' }); } catch(e){}
  };

  // --- 4. SOPORTE (Email) ---
  const handleSupport = () => {
    window.location.href = `mailto:joaosalas123@gmail.com?subject=Soporte Life OS - Usuario ${user.uid}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* TARJETA DE PERFIL */}
      <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-24 ${isPro ? 'bg-gradient-to-r from-amber-200 to-yellow-400' : 'bg-gray-100'}`}></div>
        
        <div className="relative z-10 mt-4 mb-3">
            <div className={`w-24 h-24 rounded-full border-4 ${isPro ? 'border-white shadow-xl shadow-yellow-200' : 'border-white shadow-lg'} bg-white flex items-center justify-center text-3xl font-black text-gray-300 overflow-hidden`}>
                {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover"/> : (user?.displayName?.[0] || <User size={40}/>)}
            </div>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md ${isPro ? 'bg-black text-yellow-400' : 'bg-gray-200 text-gray-500'}`}>
                {isPro ? <><Crown size={12} fill="currentColor"/> PRO</> : 'FREE'}
            </div>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">
            {editing ? (
                <div className="flex items-center gap-2 mt-2 animate-in zoom-in">
                    <input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-center font-bold text-gray-900 text-sm focus:outline-blue-500 w-40"
                        autoFocus
                    />
                    <button onClick={handleSaveProfile} disabled={loading} className="p-2 bg-black text-white rounded-xl hover:scale-105 transition-transform"><Save size={14}/></button>
                    <button onClick={() => setEditing(false)} className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-rose-100 hover:text-rose-500 transition-colors"><X size={14}/></button>
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-black text-gray-900">{user?.displayName || 'Usuario'}</h2>
                    <p className="text-xs font-bold text-gray-400">{user?.email}</p>
                </>
            )}
        </div>
      </div>

      {/* SECCIÓN DE SUSCRIPCIÓN */}
      {!isPro ? (
        <div className="p-1 rounded-[25px] bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 animate-pulse">
            <div className="bg-white p-5 rounded-[23px] flex items-center justify-between">
                <div>
                    <h3 className="font-black text-sm flex items-center gap-2 text-gray-900"><Crown size={16} className="text-yellow-500 fill-yellow-500"/> Pásate a PRO</h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">Desbloquea Excel, Gráficos y más.</p>
                </div>
                <button onClick={handleUpgrade} disabled={loading} className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50">
                    {loading ? '...' : 'Mejorar'}
                </button>
            </div>
        </div>
      ) : (
        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[25px] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle2 size={20}/></div>
                <div><h3 className="font-black text-sm text-emerald-900">Eres Miembro PRO</h3><p className="text-[10px] text-emerald-600 font-bold">Tu suscripción está activa</p></div>
            </div>
            <button onClick={handleDowngrade} className="text-[10px] font-bold text-emerald-400 underline hover:text-emerald-600">Cancelar</button>
        </div>
      )}

      {/* MENÚ DE AJUSTES */}
      <div className="space-y-2">
         <MenuItem icon={User} label="Editar Perfil" onClick={() => setEditing(true)} />
         <MenuItem icon={Shield} label="Seguridad (Cambiar Clave)" onClick={handleSecurity} />
         <MenuItem icon={LifeBuoy} label="Soporte y Feedback" onClick={handleSupport} />
      </div>

      <button onClick={logOut} className="w-full p-5 rounded-[25px] bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors active:scale-95">
         <LogOut size={18}/> Cerrar Sesión
      </button>

      <div className="text-center pt-4 opacity-50">
          <p className="text-[10px] font-bold text-gray-300">Life OS v1.0 • Studio Brikk</p>
          <a href="#" className="text-[9px] text-gray-300 underline">Política de Privacidad</a>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, value, onClick }) {
    return (
        <button onClick={onClick} className="w-full p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between active:scale-95 transition-transform group hover:border-blue-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"><Icon size={18}/></div>
                <span className="text-sm font-bold text-gray-700">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{value}</span>}
                <ChevronRight size={16} className="text-gray-300"/>
            </div>
        </button>
    )
}