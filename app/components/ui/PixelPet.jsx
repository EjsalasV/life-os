"use client";
import { motion } from "framer-motion";

const W = 24;
const H = 28;
const EMPTY = null;

const RARITY_COLORS = {
  comun:     { shadow: "rgba(156,163,175,0.6)", ring: "#d1d5db" },
  raro:      { shadow: "rgba(96,165,250,0.7)",  ring: "#60a5fa" },
  epico:     { shadow: "rgba(168,85,247,0.7)",  ring: "#a855f7" },
  legendario:{ shadow: "rgba(251,191,36,0.8)",  ring: "#fbbf24" }
};

const SKIN = {
  gato:      { base: "#f9c884", shade: "#e8a85a", deep: "#c87d35", nose: "#f87171", tongue: "#fb7185", inner_ear: "#fda4af" },
  perro:     { base: "#d4a574", shade: "#b8855a", deep: "#8b5e3c", nose: "#374151", tongue: "#fb7185", inner_ear: "#fda4af" },
  dragon:    { base: "#6ee7b7", shade: "#34d399", deep: "#059669", nose: "#f87171", tongue: "#ef4444", inner_ear: "#a7f3d0" },
  alienigena:{ base: "#bef264", shade: "#a3e635", deep: "#65a30d", nose: "#bbf7d0", tongue: "#4ade80", inner_ear: "#d9f99d" },
  robot:     { base: "#e2e8f0", shade: "#94a3b8", deep: "#475569", nose: "#06b6d4", tongue: "#0ea5e9", inner_ear: "#7dd3fc" }
};

const EYE_COLORS = {
  normal:  { iris: "#1d4ed8", pupil: "#0f172a", shine: "#ffffff" },
  feliz:   { iris: "#16a34a", pupil: "#0f172a", shine: "#ffffff" },
  extatico:{ iris: "#7c3aed", pupil: "#0f172a", shine: "#ffffff" },
  triste:  { iris: "#64748b", pupil: "#0f172a", shine: "#e2e8f0" },
  muerto:  { iris: "#6b7280", pupil: "#374151", shine: null      }
};

function px(m, x, y, c) {
  if (x >= 0 && x < W && y >= 0 && y < H && c !== null) m[y][x] = c;
}
function rect(m, x1, y1, x2, y2, c) {
  for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) px(m, x, y, c);
}
function outline(m, x1, y1, x2, y2, c) {
  for (let x = x1; x <= x2; x++) { px(m, x, y1, c); px(m, x, y2, c); }
  for (let y = y1; y <= y2; y++) { px(m, x1, y, c); px(m, x2, y, c); }
}

function drawEye(m, cx, cy, estado) {
  const e = EYE_COLORS[estado] || EYE_COLORS.normal;
  if (estado === 'muerto') {
    px(m, cx - 1, cy - 1, "#374151"); px(m, cx + 1, cy - 1, "#374151");
    px(m, cx,     cy,     "#374151");
    px(m, cx - 1, cy + 1, "#374151"); px(m, cx + 1, cy + 1, "#374151");
    return;
  }
  if (estado === 'triste') {
    rect(m, cx - 1, cy, cx + 1, cy + 1, e.iris);
    px(m, cx, cy + 1, e.pupil);
    if (e.shine) px(m, cx - 1, cy, e.shine);
    px(m, cx - 1, cy - 1, "#374151"); px(m, cx, cy - 1, "#374151");
    return;
  }
  if (estado === 'extatico') {
    rect(m, cx - 1, cy - 1, cx + 1, cy + 1, e.iris);
    px(m, cx, cy, e.pupil);
    if (e.shine) px(m, cx - 1, cy - 1, e.shine);
    px(m, cx - 2, cy - 1, "#f59e0b"); px(m, cx + 2, cy - 1, "#f59e0b");
    return;
  }
  rect(m, cx - 1, cy, cx + 1, cy + 1, e.iris);
  px(m, cx, cy + 1, e.pupil);
  if (e.shine) px(m, cx - 1, cy, e.shine);
}

function drawMouth(m, cx, cy, estado, tongueColor) {
  const LINE = "#0f172a";
  if (estado === 'extatico') {
    rect(m, cx - 2, cy, cx + 2, cy + 1, LINE);
    rect(m, cx - 1, cy, cx + 1, cy + 1, tongueColor);
    return;
  }
  if (estado === 'feliz') {
    px(m, cx - 2, cy, LINE); px(m, cx - 1, cy + 1, LINE);
    px(m, cx,     cy + 1, LINE); px(m, cx + 1, cy + 1, LINE);
    px(m, cx + 2, cy, LINE);
    px(m, cx - 1, cy + 1, tongueColor); px(m, cx, cy + 1, tongueColor);
    return;
  }
  if (estado === 'triste') {
    px(m, cx - 2, cy + 1, LINE); px(m, cx - 1, cy, LINE);
    px(m, cx, cy, LINE); px(m, cx + 1, cy, LINE); px(m, cx + 2, cy + 1, LINE);
    return;
  }
  if (estado === 'muerto') {
    px(m, cx - 1, cy, LINE); px(m, cx + 1, cy, LINE);
    return;
  }
  px(m, cx - 1, cy, LINE); px(m, cx, cy, LINE); px(m, cx + 1, cy, LINE);
}

function paintCat(m, s, wearColor, estado) {
  const L = "#0f172a";
  // orejas
  rect(m, 4, 0, 6, 3, L); rect(m, 5, 1, 6, 2, s.inner_ear);
  rect(m, 17, 0, 19, 3, L); rect(m, 17, 1, 18, 2, s.inner_ear);
  // cabeza
  outline(m, 3, 3, 20, 13, L);
  rect(m, 4, 4, 19, 12, s.base);
  // mejillas
  rect(m, 4, 8, 5, 10, s.shade); rect(m, 18, 8, 19, 10, s.shade);
  // nariz
  px(m, 11, 9, s.nose); px(m, 12, 9, s.nose);
  px(m, 10, 10, L); px(m, 13, 10, L); px(m, 11, 10, s.shade); px(m, 12, 10, s.shade);
  // bigotes
  px(m, 3, 9, s.deep); px(m, 2, 8, s.deep); px(m, 1, 9, s.deep);
  px(m, 20, 9, s.deep); px(m, 21, 8, s.deep); px(m, 22, 9, s.deep);
  // ojos
  drawEye(m, 8, 6, estado); drawEye(m, 15, 6, estado);
  // boca
  drawMouth(m, 11, 11, estado, s.tongue);
  // cuerpo
  outline(m, 5, 14, 18, 24, L);
  rect(m, 6, 15, 17, 23, wearColor);
  rect(m, 6, 15, 17, 17, lighten(wearColor));
  // patas delanteras
  rect(m, 2, 18, 4, 24, s.shade); outline(m, 2, 18, 4, 24, L); px(m, 2, 24, s.base); px(m, 3, 25, s.base); px(m, 4, 24, s.base);
  rect(m, 19, 18, 21, 24, s.shade); outline(m, 19, 18, 21, 24, L); px(m, 19, 24, s.base); px(m, 20, 25, s.base); px(m, 21, 24, s.base);
  // patas traseras
  rect(m, 6, 25, 9, 27, s.shade); outline(m, 6, 25, 9, 27, L);
  rect(m, 14, 25, 17, 27, s.shade); outline(m, 14, 25, 17, 27, L);
  // cola
  px(m, 1, 20, s.shade); px(m, 0, 21, s.shade); px(m, 0, 22, s.shade); px(m, 1, 23, s.shade); px(m, 2, 23, s.shade);
}

function paintDog(m, s, wearColor, estado) {
  const L = "#0f172a";
  // orejas caídas
  rect(m, 1, 4, 5, 12, s.shade); outline(m, 1, 4, 5, 12, L);
  rect(m, 18, 4, 22, 12, s.shade); outline(m, 18, 4, 22, 12, L);
  rect(m, 2, 5, 4, 11, s.base);
  rect(m, 19, 5, 21, 11, s.base);
  // cabeza
  outline(m, 4, 2, 19, 13, L);
  rect(m, 5, 3, 18, 12, s.base);
  // hocico
  rect(m, 8, 9, 15, 13, s.shade); outline(m, 8, 9, 15, 13, L);
  rect(m, 9, 10, 14, 12, s.base);
  // nariz
  rect(m, 10, 9, 13, 10, L); rect(m, 11, 9, 12, 9, "#6b7280");
  // ojos
  drawEye(m, 8, 6, estado); drawEye(m, 15, 6, estado);
  // boca
  drawMouth(m, 11, 12, estado, s.tongue);
  // cuerpo
  outline(m, 5, 14, 18, 24, L);
  rect(m, 6, 15, 17, 23, wearColor);
  rect(m, 6, 15, 17, 17, lighten(wearColor));
  // patas
  rect(m, 2, 19, 4, 25, s.shade); outline(m, 2, 19, 4, 25, L);
  rect(m, 19, 19, 21, 25, s.shade); outline(m, 19, 19, 21, 25, L);
  rect(m, 6, 25, 9, 27, s.shade); outline(m, 6, 25, 9, 27, L);
  rect(m, 14, 25, 17, 27, s.shade); outline(m, 14, 25, 17, 27, L);
  // mancha
  px(m, 7, 5, s.deep); px(m, 8, 4, s.deep); px(m, 9, 4, s.deep);
}

function paintDragon(m, s, wearColor, estado) {
  const L = "#0f172a";
  // cuernos
  px(m, 7, 0, s.deep); px(m, 7, 1, s.shade); px(m, 8, 0, s.deep);
  px(m, 15, 0, s.deep); px(m, 16, 0, s.deep); px(m, 15, 1, s.shade);
  // crestas
  rect(m, 5, 1, 6, 3, s.deep); rect(m, 17, 1, 18, 3, s.deep);
  // cabeza
  outline(m, 4, 3, 19, 13, L);
  rect(m, 5, 4, 18, 12, s.base);
  rect(m, 5, 4, 5, 8, s.shade); rect(m, 18, 4, 18, 8, s.shade);
  // escamas
  px(m, 8, 5, s.deep); px(m, 12, 5, s.deep); px(m, 16, 5, s.deep);
  px(m, 10, 7, s.deep); px(m, 14, 7, s.deep);
  // ojos brillantes
  drawEye(m, 8, 7, estado); drawEye(m, 15, 7, estado);
  // nariz
  px(m, 11, 11, s.nose); px(m, 12, 11, s.nose);
  // boca
  drawMouth(m, 11, 12, estado, s.tongue);
  // cuerpo
  outline(m, 5, 14, 18, 24, L);
  rect(m, 6, 15, 17, 23, wearColor);
  // escamas cuerpo
  px(m, 8, 16, s.shade); px(m, 12, 16, s.shade); px(m, 16, 16, s.shade);
  // cola
  px(m, 0, 18, s.shade); px(m, 0, 19, s.shade); px(m, 1, 20, s.shade); px(m, 1, 21, s.deep);
  // alas
  px(m, 22, 16, s.shade); px(m, 23, 15, s.shade); px(m, 22, 17, s.shade);
  px(m, 1, 16, s.shade); px(m, 0, 15, s.shade); px(m, 1, 17, s.shade);
  // patas
  rect(m, 5, 25, 8, 27, s.shade); outline(m, 5, 25, 8, 27, L);
  rect(m, 15, 25, 18, 27, s.shade); outline(m, 15, 25, 18, 27, L);
}

function paintAlien(m, s, wearColor, estado) {
  const L = "#0f172a";
  // antenas
  px(m, 8, 0, s.deep); px(m, 8, 1, s.shade); rect(m, 7, 1, 9, 1, L);
  px(m, 15, 0, s.deep); px(m, 15, 1, s.shade); rect(m, 14, 1, 16, 1, L);
  // cabeza ovalada
  outline(m, 3, 2, 20, 14, L);
  rect(m, 4, 3, 19, 13, s.base);
  rect(m, 3, 5, 3, 11, s.shade); rect(m, 20, 5, 20, 11, s.shade);
  // ojos grandes
  rect(m, 6, 5, 9, 9, L); rect(m, 7, 6, 8, 8, s.deep); px(m, 7, 6, "#ffffff"); px(m, 8, 7, s.base);
  rect(m, 14, 5, 17, 9, L); rect(m, 15, 6, 16, 8, s.deep); px(m, 15, 6, "#ffffff"); px(m, 16, 7, s.base);
  if (estado === 'feliz' || estado === 'extatico') {
    px(m, 7, 5, "#fde68a"); px(m, 8, 5, "#fde68a");
    px(m, 15, 5, "#fde68a"); px(m, 16, 5, "#fde68a");
  }
  // boca
  drawMouth(m, 11, 12, estado, s.tongue);
  // cuerpo
  outline(m, 6, 15, 17, 24, L);
  rect(m, 7, 16, 16, 23, wearColor);
  rect(m, 7, 16, 16, 17, lighten(wearColor));
  // brazos
  rect(m, 3, 16, 5, 22, s.shade); outline(m, 3, 16, 5, 22, L);
  rect(m, 18, 16, 20, 22, s.shade); outline(m, 18, 16, 20, 22, L);
  // patas
  rect(m, 7, 25, 10, 27, s.shade); outline(m, 7, 25, 10, 27, L);
  rect(m, 13, 25, 16, 27, s.shade); outline(m, 13, 25, 16, 27, L);
}

function paintRobot(m, s, wearColor, estado) {
  const L = "#0f172a";
  const METAL = "#cbd5e1";
  // antena
  rect(m, 11, 0, 12, 1, L); px(m, 11, 0, "#f59e0b"); px(m, 12, 0, "#f59e0b");
  // cabeza cuadrada
  outline(m, 4, 2, 19, 13, L);
  rect(m, 5, 3, 18, 12, s.base);
  // líneas de panel
  px(m, 6, 4, s.shade); px(m, 6, 5, s.shade); px(m, 6, 6, s.shade);
  px(m, 17, 4, s.shade); px(m, 17, 5, s.shade); px(m, 17, 6, s.shade);
  rect(m, 6, 13, 17, 13, s.deep);
  // ojos led
  if (estado === 'muerto') {
    rect(m, 7, 6, 9, 8, "#374151");
    rect(m, 14, 6, 16, 8, "#374151");
  } else {
    const ledColor = estado === 'feliz' ? "#4ade80" : estado === 'extatico' ? "#f59e0b" : estado === 'triste' ? "#60a5fa" : "#06b6d4";
    rect(m, 7, 6, 9, 8, ledColor); px(m, 7, 6, "#ffffff");
    rect(m, 14, 6, 16, 8, ledColor); px(m, 14, 6, "#ffffff");
  }
  // boca pantalla
  rect(m, 8, 11, 15, 12, L);
  if (estado === 'feliz' || estado === 'extatico') {
    rect(m, 9, 11, 14, 11, "#4ade80"); rect(m, 8, 12, 15, 12, "#22c55e");
  } else if (estado === 'triste') {
    rect(m, 9, 12, 14, 12, "#60a5fa");
  } else {
    rect(m, 9, 11, 14, 12, "#94a3b8");
  }
  // cuerpo
  outline(m, 5, 14, 18, 24, L);
  rect(m, 6, 15, 17, 23, wearColor);
  rect(m, 8, 16, 15, 19, s.shade);
  px(m, 10, 17, "#f59e0b"); px(m, 11, 17, "#ef4444"); px(m, 12, 17, "#4ade80"); px(m, 13, 17, "#60a5fa");
  // brazos
  rect(m, 2, 15, 4, 23, METAL); outline(m, 2, 15, 4, 23, L); rect(m, 2, 23, 4, 25, s.deep); outline(m, 2, 23, 4, 25, L);
  rect(m, 19, 15, 21, 23, METAL); outline(m, 19, 15, 21, 23, L); rect(m, 19, 23, 21, 25, s.deep); outline(m, 19, 23, 21, 25, L);
  // patas
  rect(m, 6, 25, 9, 27, s.deep); outline(m, 6, 25, 9, 27, L);
  rect(m, 14, 25, 17, 27, s.deep); outline(m, 14, 25, 17, 27, L);
}

function lighten(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, r + 40);
    const lg = Math.min(255, g + 40);
    const lb = Math.min(255, b + 40);
    return `rgb(${lr},${lg},${lb})`;
  } catch { return hex; }
}

function buildSprite(tipo, wearColor, estado) {
  const matrix = Array.from({ length: H }, () => Array(W).fill(EMPTY));
  const s = SKIN[tipo] || SKIN.gato;
  if (tipo === "gato")      paintCat(matrix, s, wearColor, estado);
  else if (tipo === "perro")     paintDog(matrix, s, wearColor, estado);
  else if (tipo === "dragon")    paintDragon(matrix, s, wearColor, estado);
  else if (tipo === "alienigena") paintAlien(matrix, s, wearColor, estado);
  else if (tipo === "robot")     paintRobot(matrix, s, wearColor, estado);
  return matrix.flat();
}

function calcBodyScale(peso, altura, pesoObjetivo) {
  if (!peso || !altura || !pesoObjetivo) return 1;
  const imc    = peso / ((altura / 100) ** 2);
  const imcObj = pesoObjetivo / ((altura / 100) ** 2);
  return Math.min(1.25, Math.max(0.8, imc / imcObj));
}

const ANIMS = {
  feliz:   { y: [0, -8, 0],  scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] },
  extatico:{ y: [0, -12, 0], scale: [1, 1.12, 1], rotate: [0, 6, -6, 0] },
  normal:  { y: [0, -3, 0],  scale: [1, 1.02, 1] },
  triste:  { y: [0, 3, 0],   opacity: [1, 0.75, 1], scale: [1, 0.97, 1] },
  muerto:  {}
};
const ANIM_STATIC = { opacity: 0.5, scale: 0.85, rotate: -8 };

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
  const sprite     = buildSprite(tipo, color, estadoEmocional);
  const bodyScale  = calcBodyScale(peso, altura, pesoObjetivo);
  const rarity     = RARITY_COLORS[raridad] || RARITY_COLORS.comun;
  const glowIntens = salud > 70 ? 18 : salud > 40 ? 8 : 0;

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
          display: "grid",
          gridTemplateColumns: `repeat(${W}, ${pixelSize}px)`,
          gap: 0,
          transform: `scale(${bodyScale})`,
          transformOrigin: "bottom center",
          imageRendering: "pixelated",
          outline: `2px solid ${rarity.ring}`,
          borderRadius: "8px",
          padding: "6px",
          background: "linear-gradient(to bottom, #fef9f0, #fdf4e3)",
          boxShadow: `0 8px 32px ${rarity.shadow}`,
        }}
      >
        {sprite.map((color, i) => (
          <div
            key={i}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color ?? "transparent",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
