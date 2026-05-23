"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useFinanceViewModel from "@/modules/finance/hooks/useFinanceViewModel";
import FinanzasTabs from "./finanzas/FinanzasTabs";
import ControlTabContent from "./finanzas/ControlTabContent";
import WalletTabContent from "./finanzas/WalletTabContent";
import FutureTabContent from "./finanzas/FutureTabContent";

export default function FinanzasView({
  finSubTab, setFinSubTab, smartMessage, userStats, handleNoSpendToday,
  balanceMes, formatMoney, presupuestoData, setSelectedBudgetCat, setModalOpen,
  setFormData, formData, cuentas, tarjetas, setSelectedAccountId, selectedAccountId,
  setSelectedCard, deleteItem, movimientos, fijos, metas, setSelectedMeta, getTime,
  filterDate, setFilterDate, handleImport, userPlan, showToast, user, presupuestos
}) {
  const isPro = userPlan === "pro";
  const tabsOrder = ["control", "billetera", "futuro"];
  const [direction, setDirection] = useState(0);

  const vm = useFinanceViewModel({
    cuentas,
    movimientos,
    presupuestoData,
    fijos,
    metas,
    selectedAccountId,
    getTime
  });

  const handleTabChange = (newTab) => {
    const oldIndex = tabsOrder.indexOf(finSubTab);
    const newIndex = tabsOrder.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setFinSubTab(newTab);
  };

  const tabVariants = {
    initial: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0, transition: { duration: 0.2 } })
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <FinanzasTabs finSubTab={finSubTab} onTabChange={handleTabChange} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={finSubTab} custom={direction} variants={tabVariants} initial="initial" animate="animate" exit="exit" className="w-full">
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
              handleImport={handleImport}
              userPlan={userPlan}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
