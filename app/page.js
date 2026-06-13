"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/auth";
import { DashboardProvider, useDashboard } from "@/context/dashboard";

import FinanzasView from "./components/views/FinanzasView";
import VentasView from "./components/views/VentasView";
import SettingsView from "./components/views/SettingsView";
// Lazy-load Salud: 11 sub-tabs, 150+ líneas, chart + pet. Se carga solo si el usuario entra.
const SaludView = dynamic(() => import("./components/views/SaludView"), {
  loading: () => <div className="text-center py-8 text-gray-500">Cargando...</div>
});
import AuthView from "./components/views/AuthView";
import HomeView from "./components/views/HomeView";
import Onboarding from "./components/ui/Onboarding";

import Modal from "./components/ui/Modal";
import AppForms from "./components/forms/AppForms";
import MainLayout from "./components/layout/MainLayout";
import FloatingActionButton from "./components/ui/FloatingActionButton";

// Títulos legibles para el modal según la key interna
const MODAL_TITLES = {
  movimiento: "Registrar movimiento",
  transferencia: "Transferencia",
  cuenta: "Nueva cuenta",
  tarjeta: "Tarjeta",
  fijo: "Gasto fijo",
  meta: "Nueva meta",
  ahorroMeta: "Ahorro a meta",
  presupuesto: "Presupuesto",
  producto: "Producto",
  cobrar: "Cobrar",
  habito: "Nuevo hábito",
  peso: "Registrar peso",
  nutricion: "Registrar comida"
};

function AppShell({ darkMode, setDarkMode }) {
  const { user, ui, data, actions } = useDashboard();

  if (user.isNew) {
    return <Onboarding userName={user.name} onFinish={actions.handleFinishOnboarding} />;
  }

  return (
    <MainLayout
      userStats={data.userStats}
      isOnline={ui.isOnline}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      activeTab={ui.navigation.activeTab}
      setActiveTab={ui.navigation.setActiveTab}
      toast={ui.feedback.toast}
    >
      {ui.navigation.activeTab === "finanzas" && <FinanzasView />}
      {ui.navigation.activeTab === "home" && <HomeView />}
      {ui.navigation.activeTab === "ventas" && <VentasView />}
      {ui.navigation.activeTab === "salud" && <SaludView />}
      {ui.navigation.activeTab === "settings" && <SettingsView />}

      {ui.navigation.activeTab === "finanzas" && ui.navigation.finSubTab === "billetera" && (
        <FloatingActionButton onClick={() => ui.modals.setModalOpen("movimiento")} />
      )}

      <Modal
        isOpen={!!ui.modals.modalOpen}
        onClose={() => ui.modals.setModalOpen(null)}
        title={MODAL_TITLES[ui.modals.modalOpen] || ui.modals.modalOpen}
      >
        <AppForms
          modalType={ui.modals.modalOpen}
          errorMsg={ui.feedback.errorMsg}
          financeForm={ui.forms.financeForm}
          setFinanceForm={ui.forms.setFinanceForm}
          productForm={ui.forms.productForm}
          setProductForm={ui.forms.setProductForm}
          posForm={ui.forms.posForm}
          setPosForm={ui.forms.setPosForm}
          healthForm={ui.forms.healthForm}
          setHealthForm={ui.forms.setHealthForm}
          cuentas={data.cuentas}
          carrito={ui.commerce.carrito}
          selectedBudgetCat={null}
          onConfirm={actions.handleModalConfirm}
        />
      </Modal>

      <Modal isOpen={ui.modals.streakModalOpen} onClose={() => ui.modals.setStreakModalOpen(false)} title="Racha 🔥">
        <div className="text-center p-6 space-y-4">
          <div className="text-6xl">🔥</div>
          <h3 className="text-xl font-black italic">¡Felicidades, {user?.name || "crack"}!</h3>
          <p className="text-sm font-bold text-gray-500 uppercase">
            Has mantenido tu racha activa. Sigue así para dominar tus finanzas.
          </p>
          <button
            onClick={() => ui.modals.setStreakModalOpen(false)}
            className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-xs"
          >
            Entendido
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
}

const App = () => {
  const { user, register, login, loading: authLoading } = useUser();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("lifeos-dark-mode");
    if (stored !== null) {
      setDarkMode(stored === "true");
      return;
    }
    setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("lifeos-dark-mode", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <AuthView onLogin={login} onRegister={register} loading={authLoading} />;
  }

  return (
    <DashboardProvider user={user}>
      <AppShell darkMode={darkMode} setDarkMode={setDarkMode} />
    </DashboardProvider>
  );
};

export default App;
