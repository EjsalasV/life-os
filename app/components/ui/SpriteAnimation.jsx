"use client";
import { useAnimationFrame } from '@/app/hooks/useAnimationFrame';
import { motion } from 'framer-motion';

// Mapeo de sprites disponibles con sus nombres amigables
const SPRITES_MAP = {
  // Valentine (14 feb)
  'cupid': { path: '/sprites/cat 1 16x16 animation cupid.png', frames: 4, label: 'Cupido' },
  'nimbus': { path: '/sprites/cat 1 16x16 animation nimbus.png', frames: 4, label: 'Nimbus' },
  'wings': { path: '/sprites/cat 1 16x16 animation wings.png', frames: 4, label: 'Alas' },
  'blue-bow': { path: '/sprites/cat 1 16x16 animation with blue bow 2.png', frames: 4, label: 'Moño Azul' },
  'gold-bow': { path: '/sprites/cat 1 16x16 animation with gold bow.png', frames: 4, label: 'Moño Dorado' },
  'gold-glasses': { path: '/sprites/cat 1 16x16 animation with gold glasses hearts.png', frames: 4, label: 'Gafas Doradas' },
  'green-bow': { path: '/sprites/cat 1 16x16 animation with green bow 2.png', frames: 4, label: 'Moño Verde' },
  'pink-bow': { path: '/sprites/cat 1 16x16 animation with pink bow 2.png', frames: 4, label: 'Moño Rosa' },
  'red-bow': { path: '/sprites/cat 1 16x16 animation with red bow.png', frames: 4, label: 'Moño Rojo' },
  'red-glasses': { path: '/sprites/cat 1 16x16 animation with red glasses hearts.png', frames: 4, label: 'Gafas Rojas' },

  // Winter
  'santa-1': { path: '/sprites/cat 1 16x16 animation with Santa hat 1.png', frames: 4, label: 'Santa 1' },
  'santa-2': { path: '/sprites/cat 1 16x16 animation with Santa hat 2.png', frames: 4, label: 'Santa 2' },
  'reindeer-green': { path: '/sprites/cat 1 16x16 animation with reindeer antler headband green.png', frames: 4, label: 'Reno Verde' },
  'reindeer-red': { path: '/sprites/cat 1 16x16 animation with reindeer antler headband red.png', frames: 4, label: 'Reno Rojo' },

  // Free pack
  'cat-default': { path: '/sprites/cat 1.png', frames: 4, label: 'Gato Base' },
};

export default function SpriteAnimation({
  spriteId = 'cat-default',
  size = 200,
  isInteracting = false,
}) {
  const sprite = SPRITES_MAP[spriteId] || SPRITES_MAP['cat-default'];
  const frame = useAnimationFrame(1);

  // Calcular qué frame mostrar
  const frameWidth = size;
  const currentFrame = Math.floor((frame / 60) * sprite.frames) % sprite.frames;
  const offsetX = currentFrame * frameWidth;

  return (
    <motion.div
      animate={isInteracting ? { scale: 1.1 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex justify-center items-center"
    >
      <div
        style={{
          width: size,
          height: size,
          overflow: 'hidden',
          imageRendering: 'pixelated',
          borderRadius: '8px',
        }}
      >
        <img
          src={sprite.path}
          alt={sprite.label}
          style={{
            width: `${size * sprite.frames}px`,
            height: size,
            marginLeft: `-${offsetX}px`,
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
