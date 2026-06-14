"use client";

import React from "react";
import { ShoppingCart, Package, History } from "lucide-react";
import { ExpandableTabs } from "@/app/components/ui/expandable-tabs";

const tabsConfig = [
  { title: "Terminal", icon: ShoppingCart, id: "terminal" },
  { title: "Inventario", icon: Package, id: "inventario" },
  { title: "Historial", icon: History, id: "historial" },
];

export default function VentasTabs({ ventasSubTab, onTabChange }) {
  return (
    <div className="sticky top-0 z-10 mb-4">
      <ExpandableTabs
        tabs={tabsConfig}
        className="border-[var(--life-border-soft)] bg-[var(--life-surface-2)]"
        activeColor="text-orange-500"
        gap={7}
        onChange={(index) => {
          if (index !== null) {
            onTabChange(tabsConfig[index].id);
          }
        }}
      />
    </div>
  );
}
