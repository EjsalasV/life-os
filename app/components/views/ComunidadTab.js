"use client";
import React, { useState, useMemo } from 'react';
import {
  Users, Heart, Share2, MessageCircle, Bookmark, Search, Flame, TrendingUp,
  User, Settings, Award, Plus, MoreVertical, Eye, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';
import useComunidad from '@/app/hooks/useComunidad';
import useComunidadPet from '@/app/hooks/useComunidadPet';
import ComunidadPet from '../ui/ComunidadPet';

export default function ComunidadTab({ isPro = true, saludHoy }) {
  const {
    recetasCompartidas,
    rutinasCompartidas,
    miPerfil,
    seguimientos,
    notificacionesSociales,
    compartirReceta,
    likeReceta,
    guardarReceta,
    seguirUsuario,
    buscar,
    trending,
    misGuardadas,
    feedSiguiendo
  } = useComunidad();

  const {
    pet,
    petVisuals,
    mensaje,
    estadoEmocional,
    registrarCompartirReceta,
    registrarComentario,
    registrarLike,
    registrarDesafio
  } = useComunidadPet();

  const [vistaPrincipal, setVistaPrincipal] = useState('feed'); // feed, trending, guardadas, perfil, buscar
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState(null);
  const [filtroObjetivo, setFiltroObjetivo] = useState('todas');

  const handleBuscar = (query) => {
    setBusqueda(query);
    if (query.length > 2) {
      setResultadosBusqueda(buscar(query));
      setVistaPrincipal('buscar');
    }
  };

  const notificacionesNoLeidas = notificacionesSociales.filter(n => !n.leida).length;

  // Filtrar recetas por objetivo
  const recetasFiltradas = useMemo(() => {
    if (filtroObjetivo === 'todas') return recetasCompartidas;
    return recetasCompartidas.filter(r => r.objetivo === filtroObjetivo);
  }, [recetasCompartidas, filtroObjetivo]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-[40px] border border-pink-200 dark:border-pink-700 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-pink-900 dark:text-pink-200 flex items-center gap-2">
            <Users size={28} /> Comunidad Life OS
          </h2>
          <p className="text-sm text-pink-700 dark:text-pink-300 mt-2">
            Conecta, comparte recetas y rutinas, inspírate {recetasCompartidas.length}+ compartidas
          </p>
        </div>
        <div className="relative">
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
            {notificacionesNoLeidas}
          </div>
          <Zap size={40} className="text-pink-600 dark:text-pink-400" />
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Busca recetas, usuarios, tags (#salmón, #musculo)..."
          value={busqueda}
          onChange={(e) => handleBuscar(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[24px] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-pink-500"
        />
        <Search size={20} className="absolute right-4 top-3.5 text-gray-400" />
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'feed', label: '📱 Mi Feed', icon: null },
          { id: 'trending', label: '🔥 Trending', icon: null },
          { id: 'guardadas', label: '📌 Guardadas', icon: null },
          { id: 'perfil', label: '👤 Mi Perfil', icon: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setVistaPrincipal(tab.id)}
            className={`px-4 py-2 rounded-full text-[9px] font-black whitespace-nowrap transition-all ${
              vistaPrincipal === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VISTA: FEED */}
      {vistaPrincipal === 'feed' && (
        <PremiumLock isPro={isPro} text="Feed Personalizado PRO">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {['todas', 'anti-cortisol', 'ganancia-muscular', 'perdida-grasa'].map(obj => (
                <button
                  key={obj}
                  onClick={() => setFiltroObjetivo(obj)}
                  className={`px-3 py-1.5 rounded-full text-[8px] font-bold transition-all ${
                    filtroObjetivo === obj
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {obj === 'todas' ? '📋 Todas' : obj === 'anti-cortisol' ? '🧘 Anti-Cortisol' : obj === 'ganancia-muscular' ? '💪 Muscular' : '🔥 Grasa'}
                </button>
              ))}
            </div>

            {feedSiguiendo.length === 0 ? (
              <div className="text-center py-12 opacity-50">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Sigue a usuarios para ver su feed
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {feedSiguiendo.map((receta, idx) => (
                  <TarjetaReceta
                    key={receta.id}
                    receta={receta}
                    idx={idx}
                    onLike={() => {
                      likeReceta(receta.id);
                      registrarLike();
                    }}
                    onGuardar={() => guardarReceta(receta.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </PremiumLock>
      )}

      {/* VISTA: TRENDING */}
      {vistaPrincipal === 'trending' && (
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2">
            <Flame size={16} /> Recetas Trending Esta Semana
          </h3>

          <AnimatePresence>
            {trending.recetas.map((receta, idx) => (
              <motion.div
                key={receta.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="absolute -left-6 top-4 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full flex items-center justify-center text-xs font-black">
                  {idx + 1}
                </div>
                <TarjetaReceta
                  receta={receta}
                  idx={idx}
                  onLike={() => {
                    likeReceta(receta.id);
                    registrarLike();
                  }}
                  onGuardar={() => guardarReceta(receta.id)}
                  mostrarPosicion={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* VISTA: GUARDADAS */}
      {vistaPrincipal === 'guardadas' && (
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">
            📌 Mis Recetas Guardadas ({misGuardadas.recetas.length})
          </h3>

          {misGuardadas.recetas.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <Bookmark size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Guarda recetas para prepararlas después
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {misGuardadas.recetas.map((receta, idx) => (
                <TarjetaReceta
                  key={receta.id}
                  receta={receta}
                  idx={idx}
                  onLike={() => {
                    likeReceta(receta.id);
                    registrarLike();
                  }}
                  onGuardar={() => guardarReceta(receta.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* VISTA: PERFIL */}
      {vistaPrincipal === 'perfil' && (
        <div className="space-y-6">
          {/* PET DIGITAL - TAMAGOTCHI */}
          <ComunidadPet
            pet={pet}
            petVisuals={petVisuals}
            mensaje={mensaje}
            estadoEmocional={estadoEmocional}
          />

          {/* TARJETA DE PERFIL */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-[35px] border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{miPerfil.avatar}</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{miPerfil.nombre}</h3>
                  <p className="text-[9px] text-gray-600 dark:text-gray-400">{miPerfil.bio}</p>
                </div>
              </div>
              <button className="p-3 bg-white dark:bg-gray-800 rounded-full hover:shadow-lg transition-all">
                <Settings size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <p className="text-[8px] font-bold text-gray-600 dark:text-gray-400">Recetas</p>
                <p className="text-lg font-black text-purple-600 dark:text-purple-400">{miPerfil.recetasCompartidas}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <p className="text-[8px] font-bold text-gray-600 dark:text-gray-400">Seguidores</p>
                <p className="text-lg font-black text-pink-600 dark:text-pink-400">{miPerfil.seguidores}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <p className="text-[8px] font-bold text-gray-600 dark:text-gray-400">Siguiendo</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">{miPerfil.siguiendo}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-[20px] text-center">
                <p className="text-[8px] font-bold text-gray-600 dark:text-gray-400">Puntuación</p>
                <p className="text-lg font-black text-yellow-600 dark:text-yellow-400">{miPerfil.puntuacion}</p>
              </div>
            </div>

            {/* MEDALLAS */}
            {miPerfil.medallas.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Medallas</p>
                <div className="flex gap-2 flex-wrap">
                  {miPerfil.medallas.map(medalla => (
                    <div key={medalla} className="text-3xl" title={medalla}>
                      {medalla === 'primera-receta' && '👨‍🍳'}
                      {medalla === 'experto-cortisol' && '🧘'}
                      {medalla === 'influyente' && '🌟'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* MIS RECETAS */}
          <div>
            <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase flex items-center gap-2 mb-4">
              <Plus size={16} /> Mis Recetas Compartidas
            </h3>

            {recetasCompartidas.filter(r => r.autorId === miPerfil.id).length === 0 ? (
              <div className="text-center py-8 opacity-50">
                <Share2 size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Comparte tu primera receta
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recetasCompartidas
                  .filter(r => r.autorId === miPerfil.id)
                  .map((receta, idx) => (
                    <TarjetaReceta
                      key={receta.id}
                      receta={receta}
                      idx={idx}
                      onLike={() => likeReceta(receta.id)}
                      onGuardar={() => guardarReceta(receta.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA: BÚSQUEDA */}
      {vistaPrincipal === 'buscar' && resultadosBusqueda && (
        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">
            Resultados para "{busqueda}"
          </h3>

          {resultadosBusqueda.recetas.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-3">
                Recetas ({resultadosBusqueda.recetas.length})
              </h4>
              <div className="space-y-3">
                {resultadosBusqueda.recetas.map((receta, idx) => (
                  <TarjetaReceta
                    key={receta.id}
                    receta={receta}
                    idx={idx}
                    onLike={() => likeReceta(receta.id)}
                    onGuardar={() => guardarReceta(receta.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {resultadosBusqueda.recetas.length === 0 && (
            <div className="text-center py-12 opacity-50">
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                No encontramos coincidencias
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// COMPONENTE TARJETA RECETA
function TarjetaReceta({ receta, idx, onLike, onGuardar, mostrarPosicion = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white dark:bg-gray-800 p-5 rounded-[28px] border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-600 transition-all"
    >
      <div className="flex gap-4">
        {/* AVATAR AUTOR */}
        <div className="flex-shrink-0">
          <div className="text-3xl">{receta.autorAvatar}</div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[9px] text-gray-600 dark:text-gray-400 font-bold">Por {receta.autorNombre}</p>
              <h4 className="text-sm font-black text-gray-900 dark:text-white mt-1">{receta.titulo}</h4>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          </div>

          <p className="text-[9px] text-gray-600 dark:text-gray-400 mb-3">{receta.descripcion}</p>

          {/* STATS */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <span className="text-[8px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-bold">
              {receta.macros.calorias} kcal
            </span>
            <span className="text-[8px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-bold">
              {receta.macros.proteina}g proteína
            </span>
            <span className="text-[8px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-bold">
              ⏱️ {receta.tiempoPreparacion} min
            </span>
            <span className="text-[8px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full font-bold">
              ⭐ {receta.puntuacion.toFixed(1)}
            </span>
          </div>

          {/* ACCIONES */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 px-3 py-2 rounded-[16px] text-[9px] font-bold transition-all ${
                receta.likedByUser
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart size={14} fill={receta.likedByUser ? 'currentColor' : 'none'} />
              {receta.likes}
            </button>

            <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-[16px] text-[9px] font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
              <MessageCircle size={14} />
              {receta.comentarios}
            </button>

            <button
              onClick={onGuardar}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-[16px] text-[9px] font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <Bookmark size={14} />
              Guardar
            </button>

            <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-[16px] text-[9px] font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
              <Share2 size={14} />
              Compartir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
