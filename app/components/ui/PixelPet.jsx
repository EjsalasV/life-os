"use client";
import { motion } from "framer-motion";

const WIDTH = 16;
const HEIGHT = 20;

const RARITY_GLOW = {
  comun: "shadow-gray-300",
  raro: "shadow-blue-300",
  epico: "shadow-purple-300",
  legendario: "shadow-amber-300"
};

const BASE_COLORS = {
  gato: { skin: "#f6bf83", shade: "#de9d5e", line: "#0f172a", eye: "#111827", mouth: "#ef4444" },
  perro: { skin: "#d8a87a", shade: "#be8856", line: "#0f172a", eye: "#111827", mouth: "#f97316" },
  dragon: { skin: "#85d28f", shade: "#53b96d", line: "#0f172a", eye: "#111827", mouth: "#ef4444" },
  alienigena: { skin: "#a9f0d1", shade: "#78d8b5", line: "#0f172a", eye: "#111827", mouth: "#fb7185" },
  robot: { skin: "#cbd5e1", shade: "#94a3b8", line: "#0f172a", eye: "#111827", mouth: "#64748b" }
};

const EMPTY = ".";

function calcularEstaturaMascota(peso, altura, pesoObjetivo) {
  if (!peso || !altura || !pesoObjetivo) return 1;
  const imc = peso / ((altura / 100) ** 2);
  const imcObjetivo = pesoObjetivo / ((altura / 100) ** 2);
  const ratio = Math.min(1.3, Math.max(0.7, imc / imcObjetivo));
  return ratio;
}

function makeMatrix() {
  return Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => EMPTY));
}

function setPixel(m, x, y, color) {
  if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) m[y][x] = color;
}

function fillRect(m, x1, y1, x2, y2, color) {
  for (let y = y1; y <= y2; y += 1) {
    for (let x = x1; x <= x2; x += 1) {
      setPixel(m, x, y, color);
    }
  }
}

function outlineRect(m, x1, y1, x2, y2, color) {
  for (let x = x1; x <= x2; x += 1) {
    setPixel(m, x, y1, color);
    setPixel(m, x, y2, color);
  }
  for (let y = y1; y <= y2; y += 1) {
    setPixel(m, x1, y, color);
    setPixel(m, x2, y, color);
  }
}

function paintCat(m, c, wearColor) {
  outlineRect(m, 3, 2, 12, 10, c.line);
  fillRect(m, 4, 3, 11, 9, c.skin);
  fillRect(m, 4, 1, 5, 3, c.line);
  fillRect(m, 10, 1, 11, 3, c.line);
  fillRect(m, 5, 2, 5, 3, c.skin);
  fillRect(m, 10, 2, 10, 3, c.skin);
  setPixel(m, 6, 6, c.eye);
  setPixel(m, 9, 6, c.eye);
  setPixel(m, 7, 8, c.mouth);
  setPixel(m, 8, 8, c.mouth);
  fillRect(m, 4, 11, 11, 16, wearColor);
  outlineRect(m, 4, 11, 11, 16, c.line);
  fillRect(m, 2, 12, 3, 15, c.shade);
  fillRect(m, 12, 12, 13, 15, c.shade);
  setPixel(m, 2, 15, c.line);
  setPixel(m, 13, 15, c.line);
}

function paintDog(m, c, wearColor) {
  outlineRect(m, 3, 2, 12, 10, c.line);
  fillRect(m, 4, 3, 11, 9, c.skin);
  fillRect(m, 1, 4, 3, 8, c.shade);
  fillRect(m, 12, 4, 14, 8, c.shade);
  outlineRect(m, 1, 4, 3, 8, c.line);
  outlineRect(m, 12, 4, 14, 8, c.line);
  setPixel(m, 6, 6, c.eye);
  setPixel(m, 9, 6, c.eye);
  setPixel(m, 7, 8, c.mouth);
  setPixel(m, 8, 8, c.mouth);
  setPixel(m, 8, 9, "#fb7185"); // lengua afuera
  fillRect(m, 4, 11, 11, 16, wearColor);
  outlineRect(m, 4, 11, 11, 16, c.line);
  fillRect(m, 5, 16, 6, 17, c.skin);
  fillRect(m, 9, 16, 10, 17, c.skin);
}

function paintDragon(m, c, wearColor) {
  outlineRect(m, 3, 2, 12, 10, c.line);
  fillRect(m, 4, 3, 11, 9, c.skin);
  setPixel(m, 5, 1, c.line);
  setPixel(m, 10, 1, c.line);
  setPixel(m, 5, 2, c.shade);
  setPixel(m, 10, 2, c.shade);
  setPixel(m, 6, 6, c.eye);
  setPixel(m, 9, 6, c.eye);
  setPixel(m, 7, 8, c.mouth);
  setPixel(m, 8, 8, c.mouth);
  fillRect(m, 4, 11, 11, 16, wearColor);
  outlineRect(m, 4, 11, 11, 16, c.line);
  setPixel(m, 2, 12, c.shade);
  setPixel(m, 1, 13, c.shade);
  setPixel(m, 0, 14, c.shade);
  setPixel(m, 0, 15, c.line);
  setPixel(m, 1, 15, c.shade);
  setPixel(m, 2, 15, c.shade);
}

function paintAlien(m, c, wearColor) {
  outlineRect(m, 2, 1, 13, 10, c.line);
  fillRect(m, 3, 2, 12, 9, c.skin);
  fillRect(m, 4, 5, 6, 7, c.eye);
  fillRect(m, 9, 5, 11, 7, c.eye);
  setPixel(m, 7, 8, c.mouth);
  setPixel(m, 8, 8, c.mouth);
  fillRect(m, 4, 11, 11, 16, wearColor);
  outlineRect(m, 4, 11, 11, 16, c.line);
  fillRect(m, 4, 3, 4, 9, c.shade);
  fillRect(m, 11, 3, 11, 9, c.shade);
}

function paintRobot(m, c, wearColor) {
  outlineRect(m, 3, 2, 12, 10, c.line);
  fillRect(m, 4, 3, 11, 9, c.skin);
  setPixel(m, 7, 1, c.line);
  setPixel(m, 8, 1, c.line);
  setPixel(m, 7, 0, c.mouth); // antena
  setPixel(m, 6, 6, "#06b6d4");
  setPixel(m, 9, 6, "#06b6d4");
  setPixel(m, 7, 8, c.mouth);
  setPixel(m, 8, 8, c.mouth);
  fillRect(m, 4, 11, 11, 16, wearColor);
  outlineRect(m, 4, 11, 11, 16, c.line);
  setPixel(m, 5, 13, c.shade);
  setPixel(m, 10, 13, c.shade);
}

function paintAccessory(m, accessory, lineColor) {
  if (accessory === "sombrero") {
    fillRect(m, 4, 0, 11, 0, lineColor);
    fillRect(m, 5, 0, 10, 1, lineColor);
  }
  if (accessory === "gafas") {
    fillRect(m, 5, 6, 6, 7, lineColor);
    fillRect(m, 9, 6, 10, 7, lineColor);
    setPixel(m, 7, 6, lineColor);
    setPixel(m, 8, 6, lineColor);
  }
  if (accessory === "corona") {
    setPixel(m, 5, 0, "#facc15");
    setPixel(m, 7, 0, "#facc15");
    setPixel(m, 9, 0, "#facc15");
    fillRect(m, 4, 1, 10, 1, "#eab308");
  }
  if (accessory === "moño") {
    setPixel(m, 10, 4, "#ec4899");
    setPixel(m, 11, 4, "#ec4899");
    setPixel(m, 10, 5, "#ec4899");
    setPixel(m, 11, 5, "#ec4899");
  }
}

function createPetSprite(tipo = "gato", wearColor = "#3b82f6", accesorios = []) {
  const matrix = makeMatrix();
  const c = BASE_COLORS[tipo] || BASE_COLORS.gato;

  if (tipo === "gato") paintCat(matrix, c, wearColor);
  if (tipo === "perro") paintDog(matrix, c, wearColor);
  if (tipo === "dragon") paintDragon(matrix, c, wearColor);
  if (tipo === "alienigena") paintAlien(matrix, c, wearColor);
  if (tipo === "robot") paintRobot(matrix, c, wearColor);

  accesorios.forEach((a) => paintAccessory(matrix, a, c.line));
  return matrix.flat();
}

export default function PixelPet({
  estadoEmocional = "normal",
  tipo = "gato",
  color = "#3b82f6",
  accesorios = [],
  raridad = "comun",
  pixelSize = 10,
  peso,
  altura,
  pesoObjetivo,
  felicidad = 75,
  energia = 70,
  salud = 80,
  isInteracting = false
}) {
  const sprite = createPetSprite(tipo, color, accesorios);
  const estaturaMascota = calcularEstaturaMascota(peso, altura, pesoObjetivo);

  const animaciones = {
    feliz: { scale: [1, 1.15, 1], rotate: [0, 8, -8, 0], y: [0, -10, 0] },
    extatico: { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0], y: [0, -15, 0] },
    normal: { y: [0, 3, 0], scale: [1, 1.02, 1] },
    triste: { y: [0, 5, 0], opacity: [0.9, 0.7, 0.9], scale: [1, 0.97, 1] },
    muerto: { opacity: 0.45, scale: 0.85, rotate: -10 }
  };

  const brillo = salud > 70 ? 0.3 : salud > 40 ? 0.15 : 0;

  return (
    <motion.div
      animate={{
        ...animaciones[estadoEmocional] || animaciones.normal,
        filter: brillo > 0 ? `drop-shadow(0 0 ${12 * brillo}px rgba(59, 130, 246, ${brillo}))` : "none"
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={`flex justify-center items-center cursor-pointer transition-all ${isInteracting ? "scale-110" : ""}`}
    >
      <div
        className={`grid gap-0 p-4 rounded-[24px] bg-gradient-to-b from-[#efc998] to-[#e8b172] shadow-xl ${RARITY_GLOW[raridad] || RARITY_GLOW.comun}`}
        style={{
          gridTemplateColumns: `repeat(${WIDTH}, ${pixelSize}px)`,
          width: "fit-content",
          transform: `rotate(-2deg) scale(${estaturaMascota})`,
          transformOrigin: "center",
          opacity: Math.min(1, salud / 100 * 1.2)
        }}
      >
        {sprite.map((px, i) => (
          <div key={i} style={{ width: `${pixelSize}px`, height: `${pixelSize}px`, backgroundColor: px }} />
        ))}
      </div>
    </motion.div>
  );
}
