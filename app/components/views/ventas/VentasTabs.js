import React from "react";
import { motion } from "framer-motion";

const tabsOrder = ["terminal", "inventario", "historial"];

export default function VentasTabs({ ventasSubTab, onTabChange }) {
  const tabLabels = {
    terminal: "Terminal",
    inventario: "Inventario",
    historial: "Historial"
  };

  return (
    <div className="sticky top-0 z-10 rounded-2xl border border-[var(--life-border-soft)] bg-[var(--life-surface-2)] p-2.5 backdrop-blur-md flex gap-2 mb-4">
      {tabsOrder.map(t => (
        <button
          key={t}
          onClick={() => onTabChange(t)}
          className={`relative flex-1 py-3 px-2 text-[10px] font-black uppercase rounded-[14px] transition-all z-10 ${
            ventasSubTab === t
              ? "text-[var(--life-text)]"
              : "text-[var(--life-text-muted)] hover:text-[var(--life-text-dim)]"
          }`}
        >
          {ventasSubTab === t && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute inset-0 bg-[var(--life-surface)] border border-[var(--life-border-soft)] shadow-sm rounded-[14px] z-[-1]"
            />
          )}
          {tabLabels[t]}
        </button>
      ))}
    </div>
  );
}
