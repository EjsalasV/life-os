import React from "react";
import { motion } from "framer-motion";

const tabsOrder = ["control", "billetera", "futuro"];

export default function FinanzasTabs({ finSubTab, onTabChange }) {
  return (
    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-2 sticky top-0 z-10 backdrop-blur-md bg-opacity-80 transition-colors">
      {tabsOrder.map(id => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`relative flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all z-10 ${finSubTab === id ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
        >
          {finSubTab === id && (
            <motion.div
              layoutId="activeTabFin"
              className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-xl z-[-1]"
            />
          )}
          {id === "control" ? "Control" : id === "billetera" ? "Billetera" : "Futuro"}
        </button>
      ))}
    </div>
  );
}
