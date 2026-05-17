"use client";
import React, { useState, useMemo } from 'react';
import {
  Bell, CheckCircle2, AlertCircle, Lightbulb, Clock, X, Archive,
  Settings, Filter, Heart, Utensils, Zap, Moon, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generarNotificacionesInteligentes, calcularEstadisticas } from '@/app/constants/notificaciones';

export default function NotificacionesTab({ saludHoy, isPro = true }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  // Generar notificaciones automáticas
  const notificacionesGeneradas = useMemo(() => {
    return generarNotificacionesInteligentes(saludHoy, new Date());
  }, [saludHoy]);

  // Combinar con notificaciones guardadas
  const todasLasNotificaciones = [...notificaciones, ...notificacionesGeneradas];

  // Filtrar
  const notificacionesFiltradas = useMemo(() => {
    let resultado = todasLasNotificaciones;

    if (filtroActivo === 'no-leidas') {
      resultado = resultado.filter(n => !n.leida);
    } else if (filtroActivo !== 'todas') {
      resultado = resultado.filter(n => n.tipo === filtroActivo);
    }

    return resultado.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [todasLasNotificaciones, filtroActivo]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    return calcularEstadisticas(todasLasNotificaciones);
  }, [todasLasNotificaciones]);

  const marcarComoLeida = (id) => {
    setNotificaciones(prev => {
      const actualizada = [...prev];
      const idx = actualizada.findIndex(n => n.id === id);
      if (idx > -1) actualizada[idx].leida = true;
      return actualizada;
    });
  };

  const eliminarNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const archivarTodas = () => {
    setNotificaciones(prev =>
      prev.map(n => ({ ...n, leida: true }))
    );
  };

  const getColorPrioridad = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      case 'media':
        return 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'alerta': return <AlertCircle size={18} className="text-red-600" />;
      case 'recordatorio': return <Clock size={18} className="text-blue-600" />;
      case 'logro': return <CheckCircle2 size={18} className="text-green-600" />;
      case 'consejo': return <Lightbulb size={18} className="text-yellow-600" />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-[40px] border border-purple-200 dark:border-purple-700 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-purple-900 dark:text-purple-200 flex items-center gap-2">
            <Bell size={28} /> Notificaciones Inteligentes
          </h2>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
            {estadisticas.noLeidas} sin leer • {Math.round((estadisticas.noLeidas / Math.max(estadisticas.leidas + estadisticas.noLeidas, 1)) * 100)}% tasa apertura
          </p>
        </div>
        <button
          onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
          className="p-3 bg-white dark:bg-gray-800 rounded-full hover:shadow-lg transition-all"
        >
          <Settings size={20} className="text-purple-600" />
        </button>
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-4 gap-2">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-red-50 dark:bg-red-900/20 p-3 rounded-[20px] text-center"
        >
          <p className="text-[9px] font-bold text-red-700 dark:text-red-300">Críticas</p>
          <p className="text-xl font-black text-red-900 dark:text-red-200">
            {todasLasNotificaciones.filter(n => n.prioridad === 'alta').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-[20px] text-center"
        >
          <p className="text-[9px] font-bold text-orange-700 dark:text-orange-300">Importantes</p>
          <p className="text-xl font-black text-orange-900 dark:text-orange-200">
            {todasLasNotificaciones.filter(n => n.prioridad === 'media').length}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-[20px] text-center"
        >
          <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300">Sin Leer</p>
          <p className="text-xl font-black text-blue-900 dark:text-blue-200">
            {estadisticas.noLeidas}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-green-50 dark:bg-green-900/20 p-3 rounded-[20px] text-center"
        >
          <p className="text-[9px] font-bold text-green-700 dark:text-green-300">Leídas</p>
          <p className="text-xl font-black text-green-900 dark:text-green-200">
            {estadisticas.leidas}
          </p>
        </motion.div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'todas', label: '📋 Todas' },
          { id: 'no-leidas', label: '🔔 Sin Leer' },
          { id: 'alerta', label: '⚠️ Alertas' },
          { id: 'recordatorio', label: '⏰ Recordatorios' },
          { id: 'consejo', label: '💡 Consejos' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFiltroActivo(f.id)}
            className={`px-4 py-2 rounded-full text-[9px] font-black whitespace-nowrap transition-all ${
              filtroActivo === f.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* NOTIFICACIONES */}
      <div className="space-y-2">
        {notificacionesFiltradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 opacity-50"
          >
            <Bell size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              {filtroActivo === 'no-leidas' ? 'Sin notificaciones sin leer' : 'Sin notificaciones'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {notificacionesFiltradas.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => marcarComoLeida(notif.id)}
                className={`p-4 rounded-[24px] border cursor-pointer transition-all hover:shadow-md ${
                  getColorPrioridad(notif.prioridad)
                } ${notif.leida ? 'opacity-60' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {getIconoTipo(notif.tipo)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {notif.titulo}
                        </p>
                        <p className="text-[9px] text-gray-600 dark:text-gray-400 mt-1">
                          {notif.mensaje}
                        </p>
                      </div>
                      {!notif.leida && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[8px] text-gray-500 dark:text-gray-400">
                        {new Date(notif.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarNotificacion(notif.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* BOTÓN ARCHIVAR TODAS */}
      {estadisticas.noLeidas > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={archivarTodas}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[24px] font-bold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          ✅ Marcar todas como leídas
        </motion.button>
      )}

      {/* CONFIGURACIÓN */}
      {mostrarConfiguracion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-4"
        >
          <h3 className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase">
            Configurar Notificaciones
          </h3>

          <div className="space-y-3">
            {[
              { id: 'comidas', label: '🍽️ Recordatorio de Comidas', enabled: true },
              { id: 'agua', label: '💧 Beber Agua', enabled: true },
              { id: 'ejercicio', label: '💪 Hora Óptima Ejercicio', enabled: true },
              { id: 'cortisol', label: '🧘 Consejos Anti-Cortisol', enabled: true },
              { id: 'sueño', label: '😴 Alerta de Sueño', enabled: true },
              { id: 'deficit', label: '⚖️ Balance Calórico', enabled: false }
            ].map(notif => (
              <label key={notif.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-[20px] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={notif.enabled}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-white">{notif.label}</span>
              </label>
            ))}
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Hora Silenciosa</p>
            <div className="flex gap-2">
              <input
                type="time"
                defaultValue="22:00"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
              <input
                type="time"
                defaultValue="07:00"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            <p className="text-[8px] text-gray-600 dark:text-gray-400 mt-1">Sin notificaciones de 22:00 a 07:00</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
