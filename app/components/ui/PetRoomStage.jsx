"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Palette, Move } from "lucide-react";
import PetSprite from "@/components/PetSprite";
import { ROOM_TINTS } from "@/app/lib/roomDefaults";

function itemEmoji(type, state) {
  if (type === "sofa") return "🛋️";
  if (type === "table") return "🪑";
  if (type === "plate") return state === "full" ? "🍖" : "🍽️";
  return "📦";
}

export default function PetRoomStage({
  pet,
  estadoEmocional,
  eventType,
  eventNonce,
  items,
  editorOpen,
  setEditorOpen,
  moveItem,
  setItemTint,
  pixelBackground,
  onPetTap,
  onPetPointerDown,
  showTapHint
}) {
  const boxRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [petScale, setPetScale] = useState(3.6);

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.z - b.z), [items]);

  const onPointerMove = (event) => {
    if (!dragging || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const xPct = ((event.clientX - rect.left) / rect.width) * 100 - dragging.offsetX;
    const yPct = ((event.clientY - rect.top) / rect.height) * 100 - dragging.offsetY;
    moveItem(dragging.id, xPct, yPct);
  };

  useEffect(() => {
    if (!boxRef.current) return;
    const updateScale = () => {
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;
      // 10% to 12.5% of room width, based on pet frame 32px
      const targetPx = rect.width * 0.11;
      const nextScale = Math.max(2.4, Math.min(4.2, targetPx / 32));
      setPetScale(nextScale);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={() => setEditorOpen(!editorOpen)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          {editorOpen ? "Cerrar editor" : "Editar sala"}
        </button>
      </div>

      <button
        ref={boxRef}
        onClick={onPetTap}
        onPointerDown={onPetPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
        className="group relative mx-auto aspect-square w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow dark:border-gray-700"
        style={pixelBackground}
      >
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className="absolute rounded-lg border border-black/30"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.w}%`,
              height: `${item.h}%`,
              backgroundColor: item.tint,
              zIndex: item.z
            }}
          >
            <div className="flex h-full w-full items-center justify-center text-sm">{itemEmoji(item.type, item.state)}</div>
            {editorOpen && (
              <div className="absolute -top-8 left-0 flex gap-1 rounded-lg bg-black/70 p-1 text-white">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextTint = ROOM_TINTS[(ROOM_TINTS.indexOf(item.tint) + 1) % ROOM_TINTS.length];
                    setItemTint(item.id, nextTint);
                  }}
                  className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]"
                >
                  <Palette size={10} />
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (!boxRef.current) return;
                    const rect = boxRef.current.getBoundingClientRect();
                    const offsetX = ((e.clientX - rect.left) / rect.width) * 100 - item.x;
                    const offsetY = ((e.clientY - rect.top) / rect.height) * 100 - item.y;
                    setDragging({ id: item.id, offsetX, offsetY });
                  }}
                  className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]"
                >
                  <Move size={10} />
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="flex h-full w-full items-center justify-center">
          <div className="relative h-full w-full">
            <PetSprite
              type={pet.tipo}
              mood={estadoEmocional}
              hunger={pet.hambre || 0}
              thirst={pet.sed || 0}
              eventType={eventType}
              eventNonce={eventNonce}
              embedded
              embeddedLeftPct={45}
              embeddedBottomPct={26}
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
      </button>
    </div>
  );
}
