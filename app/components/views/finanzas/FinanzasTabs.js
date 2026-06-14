"use client";

import React from "react";
import { BarChart3, Wallet, TrendingUp } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";

const tabsConfig = [
  { title: "Control", icon: BarChart3, id: "control" },
  { title: "Billetera", icon: Wallet, id: "billetera" },
  { title: "Futuro", icon: TrendingUp, id: "futuro" },
];

export default function FinanzasTabs({ finSubTab, onTabChange }) {
  const tabIndex = tabsConfig.findIndex((tab) => tab.id === finSubTab);

  return (
    <div className="sticky top-0 z-10">
      <ExpandableTabs
        tabs={tabsConfig}
        className="border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)]"
        activeColor="text-[var(--fin-lime)]"
        onChange={(index) => {
          if (index !== null) {
            onTabChange(tabsConfig[index].id);
          }
        }}
      />
    </div>
  );
}
