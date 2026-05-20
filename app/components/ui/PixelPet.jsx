"use client";
import { motion } from "framer-motion";
import { useAnimationFrame } from '@/app/hooks/useAnimationFrame';

const RARITY_COLORS = {
  comun:     { shadow: "rgba(156,163,175,0.6)", ring: "#d1d5db" },
  raro:      { shadow: "rgba(96,165,250,0.7)",  ring: "#60a5fa" },
  epico:     { shadow: "rgba(168,85,247,0.7)",  ring: "#a855f7" },
  legendario:{ shadow: "rgba(251,191,36,0.8)",  ring: "#fbbf24" }
};

// Mapeo de sprites con accesorios
const SPRITE_VARIANTS = {
  gato:      { spriteId: 'cat-default', frames: 4 },
  gatoCafe:  { spriteId: 'cat-default', frames: 4 },
  gatoBlanco:{ spriteId: 'cat-default', frames: 4 },
  // Accesorios Valentine
  cupido:    { spriteId: 'cupid', frames: 4 },
  nimbus:    { spriteId: 'nimbus', frames: 4 },
  alas:      { spriteId: 'wings', frames: 4 },
  monoAzul:  { spriteId: 'blue-bow', frames: 4 },
  monoOro:   { spriteId: 'gold-bow', frames: 4 },
  gafasOro:  { spriteId: 'gold-glasses', frames: 4 },
  monoVerde: { spriteId: 'green-bow', frames: 4 },
  monoRosa:  { spriteId: 'pink-bow', frames: 4 },
  monoRojo:  { spriteId: 'red-bow', frames: 4 },
  gafasRojas:{ spriteId: 'red-glasses', frames: 4 },
  // Accesorios Winter
  santa1:    { spriteId: 'santa-1', frames: 4 },
  santa2:    { spriteId: 'santa-2', frames: 4 },
  renoVerde: { spriteId: 'reindeer-green', frames: 4 },
  renoRojo:  { spriteId: 'reindeer-red', frames: 4 },
};

const SPRITE_PATHS = {
  'cat-default': '/sprites/cat 1.png',
  'cupid': '/sprites/cat 1 16x16 animation cupid.png',
  'nimbus': '/sprites/cat 1 16x16 animation nimbus.png',
  'wings': '/sprites/cat 1 16x16 animation wings.png',
  'blue-bow': '/sprites/cat 1 16x16 animation with blue bow 2.png',
  'gold-bow': '/sprites/cat 1 16x16 animation with gold bow.png',
  'gold-glasses': '/sprites/cat 1 16x16 animation with gold glasses hearts.png',
  'green-bow': '/sprites/cat 1 16x16 animation with green bow 2.png',
  'pink-bow': '/sprites/cat 1 16x16 animation with pink bow 2.png',
  'red-bow': '/sprites/cat 1 16x16 animation with red bow.png',
  'red-glasses': '/sprites/cat 1 16x16 animation with red glasses hearts.png',
  'santa-1': '/sprites/cat 1 16x16 animation with Santa hat 1.png',
  'santa-2': '/sprites/cat 1 16x16 animation with Santa hat 2.png',
  'reindeer-green': '/sprites/cat 1 16x16 animation with reindeer antler headband green.png',
  'reindeer-red': '/sprites/cat 1 16x16 animation with reindeer antler headband red.png',
};

export default function PixelPet({
  estadoEmocional = "normal",
  tipo = "gato",
  color = "#3b82f6",
  accesorios = [],
  raridad = "comun",
  pixelSize = 8,
  peso,
  altura,
  pesoObjetivo,
  salud = 80,
  isInteracting = false,
}) {
  const rarity = RARITY_COLORS[raridad] || RARITY_COLORS.comun;
  const glowIntens = salud > 70 ? 18 : salud > 40 ? 8 : 0;

  // Determinar qué sprite mostrar (con accesorios si hay)
  const spriteKey = accesorios.length > 0 ? accesorios[0] : tipo;
  const variant = SPRITE_VARIANTS[spriteKey] || SPRITE_VARIANTS.gato;
  const spritePath = SPRITE_PATHS[variant.spriteId] || SPRITE_PATHS['cat-default'];

  // Animación de frames
  const frame = useAnimationFrame(1);
  const currentFrame = Math.floor((frame / 60) * variant.frames) % variant.frames;

  // Dimensiones reales de los sprites: 352x1696 píxeles totales
  // Con 4 frames: 88px ancho x 424px alto por frame
  const frameWidth = 88;
  const frameHeight = 424;
  const displaySize = 88; // Tamaño a mostrar en pantalla (88x88)
  const offsetX = currentFrame * frameWidth;

  const ANIMS = {
    feliz:    { y: [0, -8, 0],  scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] },
    extatico: { y: [0, -12, 0], scale: [1, 1.12, 1], rotate: [0, 6, -6, 0] },
    normal:   { y: [0, -3, 0],  scale: [1, 1.02, 1] },
    triste:   { y: [0, 3, 0],   opacity: [1, 0.75, 1], scale: [1, 0.97, 1] },
    muerto:   {}
  };
  const ANIM_STATIC = { opacity: 0.5, scale: 0.85, rotate: -8 };

  const animate = estadoEmocional === "muerto"
    ? ANIM_STATIC
    : { ...(ANIMS[estadoEmocional] || ANIMS.normal), scale: isInteracting ? 1.15 : undefined };

  return (
    <motion.div
      animate={animate}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      className="flex justify-center items-center"
      style={{ filter: glowIntens > 0 ? `drop-shadow(0 0 ${glowIntens}px ${rarity.shadow})` : undefined }}
    >
      <div
        style={{
          width: displaySize,
          height: displaySize,
          overflow: 'hidden',
          imageRendering: 'pixelated',
          outline: `2px solid ${rarity.ring}`,
          borderRadius: '8px',
          padding: '6px',
          background: 'linear-gradient(to bottom, #fef9f0, #fdf4e3)',
          boxShadow: `0 8px 32px ${rarity.shadow}`,
          position: 'relative',
        }}
      >
        <img
          src={spritePath}
          alt="Pet sprite"
          style={{
            width: `${frameWidth * variant.frames}px`,
            height: `${frameHeight}px`,
            marginLeft: `-${offsetX}px`,
            marginTop: '-168px',
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />
      </div>
    </motion.div>
  );
}
