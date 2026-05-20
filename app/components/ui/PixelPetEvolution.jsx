"use client";
import PixelPet from './PixelPet';

const STAGE_SCALE = { egg: 0.75, base: 1, evolved: 1.2, mega: 1.45 };
const STAGE_LABEL = { egg: '🥚 Huevo', base: null, evolved: '✨ Evolucionado', mega: '⭐ Mega' };

function getStage(nivel) {
  if (nivel < 5)  return 'egg';
  if (nivel < 15) return 'base';
  if (nivel < 25) return 'evolved';
  return 'mega';
}

export default function PixelPetEvolution({
  nivel = 1,
  estadoEmocional,
  tipo = 'gato',
  color = '#7c3aed',
  accesorios = [],
  raridad = 'comun',
  peso,
  altura,
  pesoObjetivo,
  salud = 80,
  isInteracting = false,
}) {
  const stage = getStage(nivel);
  const scale = STAGE_SCALE[stage];
  const label = STAGE_LABEL[stage];

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center', transition: 'transform 0.3s ease' }}>
        <PixelPet
          estadoEmocional={estadoEmocional}
          tipo={tipo}
          color={color}
          accesorios={accesorios}
          raridad={raridad}
          pixelSize={8}
          peso={peso}
          altura={altura}
          pesoObjetivo={pesoObjetivo}
          salud={salud}
          isInteracting={isInteracting}
        />
      </div>
      {label && (
        <span className="rounded-full bg-white/80 dark:bg-gray-800/80 px-3 py-1 text-[10px] font-black text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700">
          {label}
        </span>
      )}
    </div>
  );
}
