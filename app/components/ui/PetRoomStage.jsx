"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PetSprite from "@/components/PetSprite";

export default function PetRoomStage({
  pet,
  estadoEmocional,
  eventType,
  eventNonce,
  onPetTap,
  onPetPointerDown,
  showTapHint
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
      <div
        ref={boxRef}
        className="group relative mx-auto aspect-square w-[min(92vw,360px)] overflow-hidden rounded-[24px] border border-slate-200 bg-black hover:shadow-lg transition-shadow dark:border-gray-700"
        style={{ clipPath: "inset(0 round 24px)" }}
      >
        <img
          src="/sprites/backgrounds/pet-room.png"
          alt="Room"
          className="absolute inset-0 h-full w-full rounded-[24px] pixelated"
          style={{ objectFit: "contain", objectPosition: "center center" }}
        />

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
              embeddedTopPct={60}
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
      </div>
    </div>
  );
}
