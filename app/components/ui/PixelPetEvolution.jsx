"use client";
import PixelPet from './PixelPet';

export default function PixelPetEvolution({ nivel = 1, estadoEmocional, tipo = 'gato', color = '#3b82f6', accesorios = [], raridad = 'comun' }) {
  const getEvolutionStage = () => {
    if (nivel < 5) return 'egg';
    if (nivel < 15) return 'base';
    if (nivel < 25) return 'evolved';
    return 'mega';
  };

  const stage = getEvolutionStage();
  const scales = { egg: 0.7, base: 1, evolved: 1.2, mega: 1.5 };

  return (
    <div style={{ transform: `scale(${scales[stage]})`, transformOrigin: 'center' }}>
      <PixelPet estadoEmocional={estadoEmocional} tipo={tipo} color={color} accesorios={accesorios} raridad={raridad} />
      <div className="text-center mt-2">
        <p className="text-[10px] font-black text-gray-400 uppercase">
          {stage === 'egg' ? '🥚 Huevo' : stage === 'evolved' ? '✨ Evolucionado' : stage === 'mega' ? '⭐ Mega' : 'Base'}
        </p>
      </div>
    </div>
  );
}
