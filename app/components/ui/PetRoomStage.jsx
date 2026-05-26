"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Droplets, UtensilsCrossed } from "lucide-react";
import PetSprite from "@/components/PetSprite";

export default function PetRoomStage({
  pet,
  estadoEmocional,
  eventType,
  eventNonce,
  onPetTap,
  onPetPointerDown,
  showTapHint,
  isCritical = false
}) {
  const boxRef = useRef(null);
  const [petScale, setPetScale] = useState(2.8);

  useEffect(() => {
    if (!boxRef.current) return;

    const updateScale = () => {
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;
      const targetPx = rect.width * 0.08;
      const nextScale = Math.max(2.2, Math.min(4.2, targetPx / 32));
      setPetScale(nextScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-2">
      {/* Contenedor principal */}
      <div className="relative ml-0 w-[min(100vw,420px)]">
        {/* HUD de Stats - Posicionado arriba a la izquierda, fuera del contenedor del gato */}
        <div className="pointer-events-none absolute -top-2 left-0 z-30">
          <div className="flex flex-col gap-1">
            {/* Salud */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-black/35 backdrop-blur-sm border border-white/15">
              <Heart size={10} className="text-rose-400" strokeWidth={2.5} />
              <span className="text-[8px] font-bold text-white/85 w-8 text-right">{Math.round(pet.salud)}%</span>
            </div>

            {/* Energía */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-black/35 backdrop-blur-sm border border-white/15">
              <Zap size={10} className="text-violet-300" strokeWidth={2.5} />
              <span className="text-[8px] font-bold text-white/85 w-8 text-right">{Math.round(pet.energia)}%</span>
            </div>

            {/* Agua */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-black/35 backdrop-blur-sm border border-white/15">
              <Droplets size={10} className="text-blue-300" strokeWidth={2.5} />
              <span className="text-[8px] font-bold text-white/85 w-8 text-right">{Math.round(pet.sed)}%</span>
            </div>

            {/* Hambre - solo si está alta */}
            {(pet.hambre || 0) > 40 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-orange-900/40 backdrop-blur-sm border border-orange-400/30"
              >
                <UtensilsCrossed size={10} className="text-orange-300" strokeWidth={2.5} />
                <span className="text-[8px] font-bold text-orange-200/90 w-8 text-right">{Math.round(pet.hambre)}%</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sala con el gato */}
        <div className="relative w-[min(100vw,360px)] aspect-square ml-0">
          <motion.div
            ref={boxRef}
            animate={isCritical ? { boxShadow: ['0 0 0 2px rgba(239,68,68,0)', '0 0 0 2px rgba(239,68,68,0.6)', '0 0 0 2px rgba(239,68,68,0)'] } : {}}
            transition={isCritical ? { duration: 1.5, repeat: Infinity } : {}}
            className={`group relative isolate h-full aspect-square rounded-[24px] border transition-all dark:border-gray-700 ${
              isCritical ? 'border-rose-400 bg-white/80' : 'border-slate-200 bg-white hover:shadow-lg'
            }`}
            style={{
              clipPath: "inset(0 round 24px)",
              transform: "translateZ(0)"
            }}
          >
            <button
              type="button"
              onClick={onPetTap}
              onPointerDown={onPetPointerDown}
              className="absolute inset-0 rounded-[24px]"
              aria-label="Interactuar con mascota"
            />

            <div className="pointer-events-none flex h-full w-full items-center justify-center">
              <div className="relative h-full w-full">
                <PetSprite
                  type={pet.tipo}
                  mood={estadoEmocional}
                  hunger={pet.hambre || 0}
                  thirst={pet.sed || 0}
                  eventType={eventType}
                  eventNonce={eventNonce}
                  embedded
                  embeddedLeftPct={46}
                  embeddedTopPct={71}
                  scale={petScale}
                  roam={36}
                  step={20}
                />
              </div>
            </div>

            {showTapHint && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2"
              >
                <span className="rounded-full bg-black/65 px-3 py-1 text-[11px] font-bold text-white">
                  Toca para acariciar
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
