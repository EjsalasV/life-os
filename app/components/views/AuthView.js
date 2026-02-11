import React, { useState } from 'react';
import { LayoutGrid, TrendingUp, Store, Activity, Zap, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';

export default function AuthView({ onLogin, onRegister, loading, error }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Evita doble clic

    // Validaciones básicas antes de enviar
    if (!email || !password) return;

    try {
      if (isRegistering) {
        await onRegister(email, password, nombre);
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      console.error("Error en el formulario de Auth:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
      {/* Fondo Aurora Animado */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="space-y-4 animate-in slide-in-from-top duration-700">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl">
            <LayoutGrid size={48} className="text-white"/>
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              Life OS
            </h1>
            <p className="text-gray-400 font-medium text-sm mt-2 font-black uppercase tracking-widest text-[10px]">Studio Brikk</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs animate-in zoom-in duration-700 delay-200">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center gap-2">
            <TrendingUp className="text-emerald-400" size={24}/>
            <p className="text-[10px] font-bold text-gray-300">Wallet</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col items-center gap-2">
            <Store className="text-blue-400" size={24}/>
            <p className="text-[10px] font-bold text-gray-300">Negocio</p>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4 animate-in slide-in-from-bottom duration-700 delay-300">
          <button 
            onClick={() => setModalOpen(true)}
            className="w-full py-4 bg-white text-black font-black rounded-2xl text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Entrar a la App
          </button>
        </div>
      </div>

      {/* MODAL DE ACCESO */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => !loading && setModalOpen(false)} 
        title={isRegistering ? "Nueva Cuenta" : "Acceso"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {isRegistering && (
            <input 
              type="text" 
              placeholder="Tu Nombre" 
              className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm text-black border-2 border-transparent focus:border-blue-500 transition-all"
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm text-black border-2 border-transparent focus:border-blue-500 transition-all"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-sm text-black border-2 border-transparent focus:border-blue-500 transition-all"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-rose-500 text-[10px] font-black uppercase text-center">{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>VERIFICANDO...</span>
              </>
            ) : (
              <span>{isRegistering ? "CREAR CUENTA" : "INICIAR SESIÓN"}</span>
            )}
          </button>

          <button 
            type="button"
            disabled={loading}
            onClick={() => setIsRegistering(!isRegistering)} 
            className="w-full text-center text-[10px] font-black text-gray-400 py-2 uppercase tracking-widest hover:text-black transition-colors"
          >
            {isRegistering ? "¿Ya tienes cuenta? Entra aquí" : "¿No tienes cuenta? Regístrate"}
          </button>
        </form>
      </Modal>
    </div>
  );
}