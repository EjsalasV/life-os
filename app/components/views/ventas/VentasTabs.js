"use client";

import React from "react";
import { ShoppingCart, Package, History, ChevronDown } from "lucide-react";
import { AdventureIcon } from "../../ui/AdventureIcons";

const tabsConfig = [
  { title: "Terminal", icon: ShoppingCart, id: "terminal" },
  { title: "Inventario", icon: Package, id: "inventario" },
  { title: "Historial", icon: History, id: "historial" },
];

export default function VentasTabs({ personality, ventasSubTab, onTabChange }) {
  const activeTab = tabsConfig.find((tab) => tab.id === ventasSubTab) || tabsConfig[0];

  if (personality === "aventura") {
    return (
      <nav className="business-tabs-adventure" aria-label="Secciones de Negocio">
        {tabsConfig.map((tab) => {
          const active = tab.id === ventasSubTab;
          const iconType = tab.id === "terminal" ? "business" : tab.id === "inventario" ? "coin" : "calendar";
          return (
            <button
              type="button"
              key={tab.id}
              aria-pressed={active}
              className={`business-tab-adventure ${active ? "is-active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              <AdventureIcon type={iconType} size={18} color="currentColor" />
              <span>{tab.title}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="module-tabs sticky top-0 z-10 mb-4 rounded-[24px] border border-[var(--life-border)] bg-[var(--life-surface-2)] p-2">
      <label htmlFor="business-section" className="sr-only">Sección de Negocio</label>
      <div className="module-tab-control flex items-center gap-3 rounded-2xl bg-[var(--life-surface)] px-4 py-2.5">
        <activeTab.icon size={19} className="text-[var(--life-business)]" aria-hidden="true" />
        <select id="business-section" value={ventasSubTab} onChange={(event) => onTabChange(event.target.value)} className="module-tab-select min-w-0 flex-1 appearance-none bg-transparent text-sm font-black text-[var(--life-text)] outline-none">
          {tabsConfig.map((tab) => <option key={tab.id} value={tab.id}>{tab.title}</option>)}
        </select>
        <ChevronDown size={16} className="text-[var(--life-text-muted)]" aria-hidden="true" />
      </div>
    </div>
  );
}
