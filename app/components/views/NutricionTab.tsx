"use client";
import React, { useMemo, useState, useEffect } from 'react';
import {
  Plus, Trash2, Flame, Drumstick, Wheat, Droplet, AlertCircle, Pill, Search, X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PremiumLock from '../ui/PremiumLock';
import { AlimentosBase } from '@/app/constants/alimentos-base';
import ModalAlimentoCustom from '../ui/ModalAlimentoCustom';
import { getAlimentosCustom, saveAlimentoCustom } from '@/app/constants/alimentos-custom';
import { useComunidadPet } from '@/app/hooks/useComunidadPet';
import useNutricionAPI from '@/app/hooks/useNutricionAPI';

export default function NutricionTab({
  saludHoy,
  registrarAlimento,
  removeAlimento,
  isPro,
  registrarComidaPet: registrarComidaPetFromProps
}: any) {
  const { registrarComidaPet: registrarComidaPetFallback } = useComunidadPet();
  const registrarComidaPet = registrarComidaPetFromProps || registrarComidaPetFallback;

  // Estados de UI
  const [mostrarBase, setMostrarBase] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [modalCustomOpen, setModalCustomOpen] = useState(false);
  const [alimentosCustom, setAlimentosCustom] = useState(() => getAlimentosCustom());
  const [petFeedback, setPetFeedback] = useState<null | { id: number; texto: string; macrosOK: boolean }>(null);

  // Hook de búsqueda con API USDA
  const { searchTerm, setSearchTerm, results, loading, buscar } = useNutricionAPI();

  // Auto-buscar cuando cambia el término
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        buscar(searchTerm);
      }
    }, 300); // Debounce de 300ms
    return () => clearTimeout(timer);
  }, [searchTerm, buscar]);

  const normalizarAlimento = (alimento: any) => ({
    id: alimento.id,
    nombre: alimento.nombre,
    calorias: Number(alimento.calorias || 0),
    proteina: Number(alimento.proteina || 0),
    carbohidratos: Number(alimento.carbohidratos || 0),
    grasas: Number(alimento.grasas || 0),
    fibra: Number(alimento.fibra || 0),
    vitaminas: alimento.vitaminas || {},
    minerales: alimento.minerales || {},
    compatibilidad: alimento.compatibilidad || [],
    indices: alimento.indices || { indiceInflamatorio: 0, biodisponibilidad: 80 }
  });

  const todosLosAlimentos = useMemo(() => {
    const customMap = Object.fromEntries(
      alimentosCustom.map((a: any) => [a.id, normalizarAlimento(a)])
    );
    return { ...AlimentosBase, ...customMap };
  }, [alimentosCustom]);

  const macros = {
    proteina: saludHoy?.proteinaTotal || 0,
    carbohidratos: saludHoy?.carbohidratosTotal || 0,
    grasas: saludHoy?.grasasTotal || 0,
    calorias: saludHoy?.caloriasTotales || 0,
  };

  const metas = {
    proteina: 150,
    carbohidratos: 225,
    grasas: 65,
    calorias: 2000,
  };

  const porcentajes = {
    proteina: Math.round((macros.proteina / metas.proteina) * 100),
    carbohidratos: Math.round((macros.carbohidratos / metas.carbohidratos) * 100),
    grasas: Math.round((macros.grasas / metas.grasas) * 100),
    calorias: Math.round((macros.calorias / metas.calorias) * 100),
  };

  const handleRegistrarAlimento = (alimentoInput: any) => {
    const alimento = normalizarAlimento(alimentoInput);

    const proteinaOK = alimento.proteina >= 120;
    const carbosOK = alimento.carbohidratos >= 180;
    const grasasOK = alimento.grasas >= 52;
    const macrosOK = proteinaOK && carbosOK && grasasOK;
    const macrosFuertes =
      alimento.proteina >= metas.proteina &&
      alimento.carbohidratos >= metas.carbohidratos &&
      alimento.grasas >= metas.grasas;

    registrarAlimento({
      id: `${alimento.id}-${Date.now()}`,
      alimentoId: alimento.id,
      nombre: alimento.nombre,
      tipo: 'almuerzo',
      cantidad: 1,
      unidad: 'porción',
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      caloriasTotales: alimento.calorias,
      nutrientes: alimento,
      impactoBateria: Math.round(alimento.calorias / 20)
    });

    registrarComidaPet(macrosOK, alimento.calorias);

    const texto = macrosFuertes
      ? '?? ¡Tu mascota está EXTASIADA!'
      : macrosOK
        ? '? ¡Tu mascota está feliz! ??'
        : '?? Tu mascota comió pero quería más proteína';

    setPetFeedback({ id: Date.now(), texto, macrosOK });
    setTimeout(() => setPetFeedback(null), 2800);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-8 rounded-[40px] border border-orange-200 dark:border-orange-700 shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Energía Consumida</p>
            <h2 className="text-5xl font-black text-orange-900 dark:text-orange-200 mt-2">{macros.calorias}</h2>
            <p className="text-[11px] font-bold text-orange-700 dark:text-orange-300 mt-1">kcal / {metas.calorias} meta</p>
          </div>
          <Flame className="text-orange-600 dark:text-orange-400" size={48} />
        </div>
        <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(porcentajes.calorias, 100)}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          />
        </div>
        <p className="text-xs font-bold text-orange-700 dark:text-orange-300 mt-2">{porcentajes.calorias}% de meta</p>
      </div>

      <PremiumLock isPro={isPro} text="Análisis de Macros PRO">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Proteína', valor: macros.proteina, meta: metas.proteina, icono: Drumstick, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Carbos', valor: macros.carbohidratos, meta: metas.carbohidratos, icono: Wheat, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Grasas', valor: macros.grasas, meta: metas.grasas, icono: Droplet, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
          ].map(macro => {
            const IconComponent = macro.icono;
            const porcentaje = Math.round((macro.valor / macro.meta) * 100);
            return (
              <div key={macro.label} className={`${macro.bg} p-4 rounded-[28px] border border-gray-100 dark:border-gray-700`}>
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent size={20} className={macro.color} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">{macro.label}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{macro.valor.toFixed(0)}</h3>
                <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400">meta: {macro.meta}g</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(porcentaje, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full bg-gradient-to-r ${macro.color === 'text-red-500' ? 'from-red-400 to-red-600' : macro.color === 'text-amber-500' ? 'from-amber-400 to-amber-600' : 'from-yellow-400 to-yellow-600'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PremiumLock>

      {(saludHoy?.alertasNutricionales || []).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-[28px] space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <span className="text-[10px] font-black text-red-700 dark:text-red-300 uppercase">Alertas Nutricionales</span>
          </div>
          {saludHoy.alertasNutricionales.map((alerta: any, i: any) => (
            <p key={i} className="text-[10px] text-red-700 dark:text-red-300 font-semibold leading-relaxed">{alerta}</p>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center px-2 gap-2">
          <h3 className="text-[11px] font-black text-gray-400 uppercase">Alimentos Registrados</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMostrarBase(!mostrarBase);
                setMostrarBusqueda(false);
              }}
              className="px-3 py-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              + Base
            </button>
            <button
              onClick={() => {
                setMostrarBusqueda(!mostrarBusqueda);
                setMostrarBase(false);
              }}
              className="px-3 py-1 text-sm font-bold text-green-600 hover:text-green-700"
            >
              🔍 Buscar
            </button>
            <button
              onClick={() => setModalCustomOpen(true)}
              className="px-3 py-1 text-sm font-bold text-purple-600 hover:text-purple-700"
            >
              + Custom
            </button>
          </div>
        </div>

        <AnimatePresence>
          {petFeedback && (
            <motion.div
              key={petFeedback.id}
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-3 border rounded-2xl ${petFeedback.macrosOK ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'}`}
            >
              <p className={`text-[10px] font-bold ${petFeedback.macrosOK ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                {petFeedback.texto}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BÚSQUEDA CON USDA API */}
        {mostrarBusqueda && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 space-y-3"
          >
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alimentos (pollo, manzana, etc)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-[16px] text-sm font-bold"
              />
            </div>

            {/* Información de fuentes */}
            {searchTerm && (
              <div className="text-[8px] font-bold text-gray-500 dark:text-gray-400 flex gap-4">
                <span>Local: {results.fuentes.local}</span>
                <span>USDA: {results.fuentes.usda}</span>
                <span>Total: {results.total}</span>
              </div>
            )}

            {/* Resultados */}
            {loading && (
              <div className="text-center py-4">
                <p className="text-[10px] text-gray-400">Buscando...</p>
              </div>
            )}

            {!loading && searchTerm && results.alimentos.length === 0 && (
              <div className="text-center py-4 opacity-50">
                <p className="text-[10px] font-bold text-gray-400">No se encontraron alimentos</p>
              </div>
            )}

            {!loading && results.alimentos.map((alimento: any) => (
              <motion.button
                key={alimento.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  handleRegistrarAlimento(alimento);
                  setSearchTerm('');
                  setMostrarBusqueda(false);
                }}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all flex justify-between items-start group"
              >
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white">{alimento.nombre}</p>
                  <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {alimento.calorias} kcal • P:{alimento.proteina}g • C:{alimento.carbohidratos}g • G:{alimento.grasas}g
                  </p>
                  {alimento.fuente === 'usda' && (
                    <p className="text-[7px] text-blue-600 dark:text-blue-400 mt-0.5">📡 Base USDA</p>
                  )}
                </div>
                <Plus size={16} className="text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0 ml-2" />
              </motion.button>
            ))}
          </motion.div>
        )}

        {mostrarBase && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 max-h-96 overflow-y-auto space-y-2">
            <p className="text-[9px] font-black text-gray-500 uppercase mb-3">Selecciona un alimento</p>
            {Object.entries(todosLosAlimentos).map(([key, alimento]: any) => (
              <button
                key={key}
                onClick={() => {
                  handleRegistrarAlimento(alimento);
                  setMostrarBase(false);
                }}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all flex justify-between items-center group"
              >
                <div>
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white">{alimento.nombre}</p>
                  <p className="text-[8px] text-gray-500 dark:text-gray-400">{alimento.calorias} kcal</p>
                </div>
                <Plus size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {(saludHoy?.alimentos || []).length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <Pill size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase">Sin alimentos registrados</p>
          </div>
        ) : (
          (saludHoy?.alimentos || []).map((alimento: any) => (
            <motion.div
              key={alimento.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-[28px] border border-gray-100 dark:border-gray-700 flex justify-between items-start group"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{alimento.nombre}</p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">{alimento.hora} • {alimento.caloriasTotales} kcal</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-[8px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                    {alimento.nutrientes.proteina.toFixed(0)}p
                  </span>
                  <span className="text-[8px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {alimento.nutrientes.carbohidratos.toFixed(0)}c
                  </span>
                  <span className="text-[8px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                    {alimento.nutrientes.grasas.toFixed(0)}g
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeAlimento(alimento.id)}
                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <ModalAlimentoCustom
        isOpen={modalCustomOpen}
        onClose={() => setModalCustomOpen(false)}
        onAdd={(alimento: any) => {
          const saved = saveAlimentoCustom(alimento);
          setAlimentosCustom(getAlimentosCustom());
          handleRegistrarAlimento(saved);
          setModalCustomOpen(false);
          setMostrarBase(false);
        }}
      />

      <PremiumLock isPro={isPro} text="Perfil de Vitaminas & Minerales PRO">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[35px] border border-gray-100 dark:border-gray-700 space-y-4">
          <div>
            <h4 className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase mb-3">Vitaminas Consumidas</h4>
            <div className="space-y-2">
              {Object.entries(saludHoy?.vitaminasConsumo || {}).slice(0, 5).map(([vit, val]: any) => (
                <div key={vit} className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">{vit}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((val / 50) * 100, 100)}%` }} />
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 w-8">{val.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumLock>
    </div>
  );
}

