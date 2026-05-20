import React from "react";
import { motion } from "framer-motion";

const tabsOrder = ["terminal", "inventario", "historial"];

export default function VentasTabs({ ventasSubTab, onTabChange }) {
  return (
    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 relative">
      {tabsOrder.map(t => (
        <button
          key={t}
          onClick={() => onTabChange(t)}
          className={`relative flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all z-10 ${ventasSubTab === t ? "text-indigo-600" : "text-gray-400"}`}
        >
          {ventasSubTab === t && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-xl z-[-1]"
            />
          )}
          {t}
        </button>
      ))}
    </div>
  );
}
