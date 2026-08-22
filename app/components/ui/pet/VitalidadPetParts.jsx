import { motion } from "framer-motion";

export const RARIDAD_STYLE = {
  comun: { label: "Comun", bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-600 dark:text-gray-300" },
  raro: { label: "Raro", bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  epico: { label: "Epico", bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
  legendario: { label: "Legendario", bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
};

export const PET_OPTIONS = [
  { tipo: "gatoNaranja", label: "Cat Naranja", tag: "CAT", accent: "from-orange-400 to-orange-600" },
  { tipo: "gatoGris", label: "Cat Gris", tag: "CAT", accent: "from-slate-400 to-slate-600" },
  { tipo: "gatoBlanco", label: "Cat Blanco", tag: "CAT", accent: "from-violet-300 to-slate-300" },
  { tipo: "conejo", label: "Bunny", tag: "BUN", accent: "from-emerald-300 to-lime-500" },
];

export const PET_VISUALS = {
  gatoNaranja: {
    sky: "linear-gradient(180deg, #fff2d8 0%, #ffe6bf 55%, #f7d7a1 100%)",
    pixel: "rgba(251, 146, 60, 0.14)",
    floor: "#c97332",
    floorShade: "rgba(124, 45, 18, 0.18)",
  },
  gatoGris: {
    sky: "linear-gradient(180deg, #eef2ff 0%, #e2e8f0 55%, #d6deea 100%)",
    pixel: "rgba(100, 116, 139, 0.14)",
    floor: "#64748b",
    floorShade: "rgba(51, 65, 85, 0.20)",
  },
  gatoBlanco: {
    sky: "linear-gradient(180deg, #ffffff 0%, #f5f3ff 60%, #ebe9fe 100%)",
    pixel: "rgba(196, 181, 253, 0.16)",
    floor: "#a78bfa",
    floorShade: "rgba(109, 40, 217, 0.18)",
  },
  conejo: {
    sky: "linear-gradient(180deg, #effdf5 0%, #dcfce7 58%, #bbf7d0 100%)",
    pixel: "rgba(34, 197, 94, 0.12)",
    floor: "#65a30d",
    floorShade: "rgba(63, 98, 18, 0.20)",
  },
};

export const MOOD_BADGES = {
  muerto: { label: "Descansando", tone: "bg-slate-700/90 text-white" },
  triste: { label: "Necesita mimos", tone: "bg-blue-600/90 text-white" },
  normal: { label: "Tranquilo", tone: "bg-white/85 text-slate-700" },
  feliz: { label: "Feliz", tone: "bg-emerald-500/90 text-white" },
  extatico: { label: "Extatico", tone: "bg-amber-500/95 text-white" },
};

export function StatRow({ label, value, icon, color, track }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-24 shrink-0 items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-black text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className={`relative h-2.5 flex-1 overflow-hidden rounded-full ${track}`}>
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="w-9 text-right text-[11px] font-black text-gray-600 dark:text-gray-300">{Math.round(pct)}%</span>
    </div>
  );
}

const NEED_STYLE = {
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700",
    text: "text-orange-600 dark:text-orange-400",
    bar: "bg-orange-400",
    track: "bg-orange-100 dark:bg-orange-900/30",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-700",
    text: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-400",
    track: "bg-blue-100 dark:bg-blue-900/30",
  },
};

export function NeedCard({ label, value, icon, color, tip, scaleHint }) {
  const s = NEED_STYLE[color];
  const pct = Math.max(0, Math.min(100, value));
  const isHigh = pct > 70;

  return (
    <div className={`rounded-2xl border p-3 ${s.bg} ${s.border}`}>
      <div className={`mb-2 flex items-center justify-between ${s.text}`}>
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-wide">{label}</span>
        </div>
        <span className="text-[11px] font-black">{Math.round(pct)}%</span>
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${s.track}`}>
        <motion.div
          className={`h-full rounded-full ${s.bar} ${isHigh ? "animate-pulse" : ""}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {scaleHint && <p className="mt-1 text-[9px] font-bold text-gray-500 dark:text-gray-400">{scaleHint}</p>}
      {isHigh && <p className={`mt-1.5 text-[9px] font-bold ${s.text} opacity-80`}>{tip}</p>}
    </div>
  );
}
