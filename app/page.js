"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/auth";

import FinanzasView from "./components/views/FinanzasView";
import VentasView from "./components/views/VentasView";
import SaludView from "./components/views/SaludView";
import SettingsView from "./components/views/SettingsView";
import AuthView from "./components/views/AuthView";
import Onboarding from "./components/ui/Onboarding";

import Modal from "./components/ui/Modal";
import AppForms from "./components/forms/AppForms";
import MainLayout from "./components/layout/MainLayout";
import FloatingActionButton from "./components/ui/FloatingActionButton";

import { getTime, getTodayKey, safeMonto, formatMoney } from "./utils/helpers";
import useDashboardApp from "./hooks/useDashboardApp";

const App = () => {
  const { user, register, login, logOut, deleteAccount, loading: authLoading } = useUser();
  const dashboard = useDashboardApp(user);
  const [darkMode, setDarkMode] = useState(false);

  const { ui, data, metrics, actions } = dashboard;

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
    return <AuthView onLogin={login} onRegister={register} loading={authLoading} error={ui.feedback.authError} />;
  }

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
      {ui.navigation.activeTab === "finanzas" && (
        <FinanzasView
          finSubTab={ui.navigation.finSubTab}
          setFinSubTab={ui.navigation.setFinSubTab}
          smartMessage={metrics.smartMessage}
          userStats={data.userStats}
          handleNoSpendToday={actions.handleNoSpendToday}
          balanceMes={metrics.balanceMes}
          formatMoney={formatMoney}
          presupuestoData={metrics.presupuestoData}
          setSelectedBudgetCat={() => {}}
          setModalOpen={ui.modals.setModalOpen}
          setFormData={ui.forms.setFinanceForm}
          formData={ui.forms.financeForm}
          cuentas={data.cuentas}
          tarjetas={data.tarjetas}
          setSelectedAccountId={ui.filters.setSelectedAccountId}
          selectedAccountId={ui.filters.selectedAccountId}
          setSelectedCard={() => {}}
          deleteItem={actions.deleteItem}
          movimientos={data.movimientos}
          fijos={data.fijos}
          metas={data.metas}
          setSelectedMeta={ui.filters.setSelectedMeta}
          getTime={getTime}
          handleImport={actions.handleImport}
          userPlan={user?.plan || "free"}
          filterDate={ui.filters.filterDate}
          setFilterDate={ui.filters.setFilterDate}
          showToast={ui.feedback.showToast}
          user={user}
          presupuestos={data.presupuestos}
        />
      )}

      {ui.navigation.activeTab === "ventas" && (
        <VentasView
          ventasSubTab={ui.navigation.ventasSubTab}
          setVentasSubTab={ui.navigation.setVentasSubTab}
          ventas={data.ventas}
          formatMoney={formatMoney}
          safeMonto={safeMonto}
          deleteItem={actions.deleteItem}
          getTime={getTime}
          productos={data.productos}
          busquedaProd={ui.filters.busquedaProd}
          setBusquedaProd={ui.filters.setBusquedaProd}
          addToCart={actions.addToCart}
          setModalOpen={ui.modals.setModalOpen}
          carrito={ui.commerce.carrito}
          setCarrito={ui.commerce.setCarrito}
          handleGenerarPedido={actions.handleGenerarPedido}
          setProductForm={ui.forms.setProductForm}
          setPosForm={ui.forms.setPosForm}
          user={user}
        />
      )}

      {ui.navigation.activeTab === "salud" && (
        <SaludView
          saludSubTab={ui.navigation.saludSubTab}
          setSaludSubTab={ui.navigation.setSaludSubTab}
          saludHoy={data.saludHoy}
          updateHealthStat={actions.updateHealthStat}
          removeWater={actions.removeWater}
          addWater={actions.addWater}
          toggleComida={actions.toggleComida}
          habitos={data.habitos}
          toggleHabitCheck={actions.toggleHabitCheck}
          deleteItem={actions.deleteItem}
          historialPeso={data.historialPeso}
          safeMonto={safeMonto}
          historialSalud={data.historialSalud}
          getTodayKey={getTodayKey}
          setModalOpen={ui.modals.setModalOpen}
          toggleFasting={actions.toggleFasting}
          resetDailyHealth={actions.resetDailyHealth}
          registrarAlimento={actions.registrarAlimento}
          removeAlimento={actions.removeAlimento}
          predecirBateriaManana={actions.predecirBateriaManana}
          analizarCompatibilidad={actions.analizarCompatibilidad}
          user={user}
        />
      )}

      {ui.navigation.activeTab === "settings" && (
        <SettingsView
          user={user}
          logOut={logOut}
          handleTogglePlan={actions.handleTogglePlan}
          handleUpdateName={actions.handleUpdateName}
          handleDeleteAccount={async () => {
            if (window.confirm("¿ESTÁS SEGURO? Esta acción borrará todos tus datos permanentemente.")) {
              try {
                await deleteAccount();
                ui.feedback.showToast("Cuenta eliminada correctamente");
              } catch (e) {
                ui.feedback.showToast(e.message, "error");
              }
            }
          }}
        />
      )}

      {ui.navigation.activeTab === "finanzas" && ui.navigation.finSubTab === "billetera" && (
        <FloatingActionButton onClick={() => ui.modals.setModalOpen("movimiento")} />
      )}

      <Modal isOpen={!!ui.modals.modalOpen} onClose={() => ui.modals.setModalOpen(null)} title={ui.modals.modalOpen}>
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
          <h3 className="text-xl font-black italic">¡Felicidades, {user?.name || "Erick"}!</h3>
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
};

export default App;
