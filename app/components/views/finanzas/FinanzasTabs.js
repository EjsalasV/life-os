"use client";

import React from "react";
import { BarChart3, Wallet, TrendingUp, ChevronDown } from "lucide-react";

const tabsConfig = [
  { title: "Control", icon: BarChart3, id: "control" },
  { title: "Billetera", icon: Wallet, id: "billetera" },
  { title: "Futuro", icon: TrendingUp, id: "futuro" },
];

export default function FinanzasTabs({ finSubTab, onTabChange }) {
  const activeTab = tabsConfig.find((tab) => tab.id === finSubTab) || tabsConfig[0];

  return (
    <div className="module-tabs sticky top-0 z-10 rounded-[24px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-2">
      <label htmlFor="finance-section" className="sr-only">Sección de Finanzas</label>
      <div className="module-tab-control flex items-center gap-3 rounded-2xl bg-[var(--fin-surface)] px-4 py-2.5">
        <activeTab.icon size={19} className="text-[var(--fin-lime)]" aria-hidden="true" />
        <select id="finance-section" value={finSubTab} onChange={(event) => onTabChange(event.target.value)} className="module-tab-select min-w-0 flex-1 appearance-none bg-transparent text-sm font-black text-[var(--fin-text)] outline-none">
          {tabsConfig.map((tab) => <option key={tab.id} value={tab.id}>{tab.title}</option>)}
        </select>
        <ChevronDown size={16} className="text-[var(--fin-text-muted)]" aria-hidden="true" />
      </div>
    </div>
  );
}
