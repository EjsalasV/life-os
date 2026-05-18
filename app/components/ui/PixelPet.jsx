"use client";
import { motion } from "framer-motion";

export default function PixelPet({ estadoEmocional = "normal" }) {
  // 16x20 - mono estilo referencia (orejas grandes, cara clara, cuerpo marron, cola lateral)
  // . transparent, K borde, F cara, T sombra cara, C cuerpo, S sombra cuerpo, M boca
  const art = [
    "................",
    "....KKKKKKKK....",
    "...KCCCCCCCCK...",
    "..KCCFFFFFFCCKK.",
    ".KCCFFFFFFFFFCCK",
    "KCCFFFKFFKFFFFCK",
    "KCCFFFKFFKFFFFCK",
    "KCCFFFFFFFFFFFCK",
    "KCCFFFFK.KFFFFCK",
    ".KCCFFFFFFFFFCK.",
    "KKKKKKKKKKKKKK..",
    "KCCSSSSSSSSSSCK.",
    "KCSSSSSSSSSSSSCK",
    "KCSSCCCCCCCCSSCK",
    "KCSSCCCCCCCCSSCK",
    ".KCSSTCCCCCSTCK.",
    ".KCSSSCCCCCSSCK.",
    "..KCSSKCCCKSSK..",
    "...KK.K..K.KK...",
    "................"
  ];

  // orejas
  const ears = [
    [0, 5], [1, 5], [0, 6], [1, 6], [0, 7], [1, 7], [1, 8],
    [14, 5], [15, 5], [14, 6], [15, 6], [14, 7], [15, 7], [14, 8]
  ];

  // cola a la izquierda
  const tail = [
    [0, 11], [1, 11], [1, 12], [2, 12], [2, 13], [1, 13], [0, 13], [0, 14], [1, 14], [1, 15]
  ];

  const color = {
    ".": "transparent",
    K: "#0f172a",
    F: "#f6bf83",
    T: "#e3a86d",
    C: "#6f4329",
    S: "#8a5835",
    M: "#ef4444"
  };

  const grid = [];
  for (let y = 0; y < 20; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const ch = art[y]?.[x] || ".";
      grid.push(color[ch] || "transparent");
    }
  }

  ears.forEach(([x, y], i) => {
    const idx = y * 16 + x;
    if (grid[idx] === "transparent") grid[idx] = i % 3 === 0 ? "#0f172a" : "#8a5835";
  });
  tail.forEach(([x, y], i) => {
    const idx = y * 16 + x;
    grid[idx] = i % 4 === 0 ? "#0f172a" : "#6f4329";
  });

  // nariz / boca
  grid[8 * 16 + 7] = "#ef4444";
  grid[8 * 16 + 8] = "#fb7185";

  const animaciones = {
    feliz: { scale: [1, 1.15, 1], rotate: [0, 8, -8, 0], y: [0, -10, 0] },
    extatico: { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0], y: [0, -15, 0] },
    normal: { y: [0, 3, 0], scale: [1, 1.02, 1] },
    triste: { y: [0, 5, 0], opacity: [0.9, 0.7, 0.9], scale: [1, 0.97, 1] },
    muerto: { opacity: 0.45, scale: 0.85, rotate: -10 }
  };

  return (
    <motion.div
      animate={animaciones[estadoEmocional] || animaciones.normal}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="flex justify-center items-center"
    >
      <div
        className="grid gap-0 p-6 rounded-[36px] bg-gradient-to-b from-[#efc998] to-[#e8b172] shadow-xl"
        style={{
          gridTemplateColumns: "repeat(16, 12px)",
          width: "fit-content",
          transform: "rotate(-3deg)"
        }}
      >
        {grid.map((px, i) => (
          <div
            key={i}
            style={{ width: "12px", height: "12px", backgroundColor: px }}
          />
        ))}
      </div>
    </motion.div>
  );
}
