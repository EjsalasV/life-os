"use client";
import React, { createContext, useContext } from "react";
import useDashboardApp from "@/app/hooks/useDashboardApp";

// Provider del dashboard: las vistas de nivel superior consumen
// { user, ui, data, metrics, actions } vía useDashboard() en lugar de
// recibir ~25 props desde page.js (prop drilling).
const DashboardContext = createContext(null);

export function DashboardProvider({ user, children }) {
  const dashboard = useDashboardApp(user);
  return (
    <DashboardContext.Provider value={{ user, ...dashboard }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard debe usarse dentro de <DashboardProvider>");
  }
  return ctx;
}
