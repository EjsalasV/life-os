"use client";
import React from "react";
import useFinanceViewModel from "@/modules/finance/hooks/useFinanceViewModel";
import { useDashboard } from "@/context/dashboard";
import { getTime, formatMoney } from "@/app/utils/helpers";
import FinanzasTabs from "./finanzas/FinanzasTabs";
import ControlTabContent from "./finanzas/ControlTabContent";
import WalletTabContent from "./finanzas/WalletTabContent";
import FutureTabContent from "./finanzas/FutureTabContent";

export default function FinanzasView() {
  const { user, ui, data, metrics, actions } = useDashboard();

  const { finSubTab, setFinSubTab } = ui.navigation;
  const { setModalOpen } = ui.modals;
  const { showToast } = ui.feedback;
  const { financeForm: formData, setFinanceForm: setFormData } = ui.forms;
  const { filterDate, setFilterDate, selectedAccountId, setSelectedAccountId, setSelectedMeta } = ui.filters;
  const { cuentas, tarjetas, movimientos, fijos, metas, presupuestos, userStats } = data;
  const { smartMessage, balanceMes, presupuestoData } = metrics;
  const { handleNoSpendToday, deleteItem } = actions;

  // Pendiente (Fase 3): selección de presupuesto/tarjeta aún sin implementar
  const setSelectedBudgetCat = () => {};
  const setSelectedCard = () => {};

  const userPlan = user?.plan || "free";
  const isPro = userPlan === "pro";

  const vm = useFinanceViewModel({
    cuentas,
    movimientos,
    presupuestoData,
    fijos,
    metas,
    selectedAccountId,
    getTime
  });

  return (
    <div className="finance-module space-y-6 overflow-x-hidden">
      <FinanzasTabs finSubTab={finSubTab} onTabChange={setFinSubTab} />

      {/* Animación CSS (compositor): el cambio de tab no depende de rAF/JS,
          así funciona aunque la pestaña esté en segundo plano. */}
      <div key={finSubTab} className="w-full animate-fade-in-scale">
          {finSubTab === "control" && (
            <ControlTabContent
              smartMessage={smartMessage}
              userStats={userStats}
              handleNoSpendToday={handleNoSpendToday}
              balanceMes={balanceMes}
              formatMoney={formatMoney}
              presupuestoData={vm.preparedBudgetData}
              setSelectedBudgetCat={setSelectedBudgetCat}
              setModalOpen={setModalOpen}
              setFormData={setFormData}
              formData={formData}
              movimientos={movimientos}
              isPro={isPro}
              showToast={showToast}
              user={user}
              metas={metas}
              cuentas={cuentas}
              presupuestos={presupuestos}
            />
          )}

          {finSubTab === "billetera" && (
            <WalletTabContent
              setModalOpen={setModalOpen}
              setSelectedAccountId={setSelectedAccountId}
              cuentas={cuentas}
              tarjetas={tarjetas}
              selectedAccountId={selectedAccountId}
              deleteItem={deleteItem}
              setSelectedCard={setSelectedCard}
              deleteCard={(id) => deleteItem("tarjetas", { id })}
              visibleMovimientos={vm.visibleMovimientos}
              totalCuentasBalance={vm.totalCuentasBalance}
              hasMovimientos={vm.hasMovimientos}
              formatMoney={formatMoney}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              userPlan={userPlan}
              setFinanceForm={setFormData}
            />
          )}

          {finSubTab === "futuro" && (
            <FutureTabContent
              isPro={isPro}
              fijos={fijos}
              metas={vm.metasConProgreso}
              totalFijosMensuales={vm.totalFijosMensuales}
              formatMoney={formatMoney}
              setModalOpen={setModalOpen}
              deleteItem={deleteItem}
              setSelectedMeta={setSelectedMeta}
            />
          )}
        </div>
    </div>
  );
}
