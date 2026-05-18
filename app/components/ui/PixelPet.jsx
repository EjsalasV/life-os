"use client";
import { motion } from 'framer-motion';

export default function PixelPet({ estadoEmocional }) {
  // Mapa de píxeles 16x20 - Tamagotchi estilo imagen
  // 0=transparent, 1=borde negro, 2=piel clara, 3=piel oscura, 4=ojos, 5=boca, 6=ropa
  const pixelData = [
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    [1, 2, 2, 4, 4, 2, 2, 2, 2, 4, 4, 2, 2, 2, 1, 0],
    [1, 2, 2, 4, 4, 2, 2, 2, 2, 4, 4, 2, 2, 2, 1, 0],
    [1, 2, 2, 2, 2, 2, 2, 5, 5, 2, 2, 2, 2, 2, 1, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0],
    [0, 0, 1, 6, 6, 6, 6, 6, 6, 6, 6, 1, 0, 0, 0, 0],
    [0, 1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1, 0, 0, 0],
    [1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1, 0, 0],
    [1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1, 0, 0],
    [1, 1, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1, 1, 0, 0],
    [0, 1, 3, 3, 6, 6, 6, 6, 6, 6, 6, 3, 3, 1, 0, 0],
    [0, 1, 3, 3, 3, 6, 6, 6, 6, 6, 3, 3, 3, 1, 0, 0],
    [0, 1, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 3, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const colorMap = {
    0: 'transparent',
    1: '#000000',    // Negro borde
    2: '#FFB366',    // Piel clara
    3: '#FF8C42',    // Piel oscura (orejas/pies)
    4: '#000000',    // Ojos negro
    5: '#FF6B6B',    // Boca roja
    6: '#8B6914',    // Ropa marrón
  };

  const animaciones = {
    feliz: {
      scale: [1, 1.15, 1],
      rotate: [0, 8, -8, 0],
      y: [0, -10, 0],
    },
    extatico: {
      scale: [1, 1.2, 1],
      rotate: [0, 15, -15, 0],
      y: [0, -15, 0],
    },
    normal: {
      y: [0, 3, 0],
      scale: [1, 1.02, 1],
    },
    triste: {
      y: [0, -5, 0],
      opacity: [0.8, 1, 0.8],
      scale: [0.95, 1, 0.95],
    },
    muerto: {
      opacity: 0.5,
      scale: 0.85,
      rotate: -10,
    }
  };

  return (
    <motion.div
      animate={animaciones[estadoEmocional]}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="flex justify-center items-center"
    >
      <div
        className="grid gap-0 bg-gradient-to-b from-orange-200 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-8 rounded-[40px]"
        style={{
          gridTemplateColumns: `repeat(16, 16px)`,
          width: 'fit-content',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        }}
      >
        {pixelData.map((row, rowIdx) =>
          row.map((pixel, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              style={{
                backgroundColor: colorMap[pixel],
                width: '16px',
                height: '16px',
                border: 'none',
              }}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
