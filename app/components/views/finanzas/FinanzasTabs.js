import React from "react";
import { motion } from "framer-motion";

const tabsOrder = ["control", "billetera", "futuro"];

export default function FinanzasTabs({ finSubTab, onTabChange }) {
  return (
    <div className="sticky top-0 z-10 rounded-2xl border border-[var(--life-border)] bg-[var(--life-surface-2)] p-1.5 backdrop-blur-md">
      {tabsOrder.map((id) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`relative z-10 flex-1 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wide transition-all ${
            finSubTab === id
              ? "text-[var(--life-text)]"
              : "text-[var(--life-text-muted)] hover:text-[var(--life-text-dim)]"
          }`}
        >
          {finSubTab === id && (
            <motion.div
              layoutId="activeTabFin"
              className="absolute inset-0 -z-10 rounded-xl border border-[var(--life-border-soft)] bg-[var(--life-surface)] shadow-sm"
            />
          )}
          {id === "control" ? "Control" : id === "billetera" ? "Billetera" : "Futuro"}
        </button>
      ))}
    </div>
  );
}
