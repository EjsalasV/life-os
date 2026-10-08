"use client";

import useVentas from "@/app/hooks/useVentas";
import useHealthSystem from "@/app/hooks/useHealthSystem";
import useFinanzas from "@/app/hooks/useFinanzas";
import useOnline from "@/app/hooks/useOnline";
import useLocalNotifications from "@/app/hooks/useLocalNotifications";
import useHealthActions from "@/app/hooks/useHealthActions";
import useProfileActions from "@/app/hooks/useProfileActions";

import useDashboardUIState from "./dashboard/useDashboardUIState";
import useDashboardRealtimeData from "./dashboard/useDashboardRealtimeData";
import useDashboardDerivedMetrics from "./dashboard/useDashboardDerivedMetrics";
import useDashboardActions from "./dashboard/useDashboardActions";

export default function useDashboardApp(user) {
  const isOnline = useOnline();
  useLocalNotifications();

  const uiState = useDashboardUIState();
  const dataState = useDashboardRealtimeData(user, uiState.filters.filterDate);

  const baseActions = useDashboardActions({
    user,
    showToast: uiState.feedback.showToast,
    setStreakModalOpen: uiState.modals.setStreakModalOpen
  });

  const ventasActions = useVentas({
    user,
    productos: dataState.productos,
    carrito: uiState.commerce.carrito,
    setCarrito: uiState.commerce.setCarrito,
    ventas: dataState.ventas,
    cuentas: dataState.cuentas,
    posForm: uiState.forms.posForm,
    setPosForm: uiState.forms.setPosForm,
    setModalOpen: uiState.modals.setModalOpen,
    setErrorMsg: uiState.feedback.showToast,
    movimientos: dataState.movimientos
  });

  const finanzasActions = useFinanzas({
    user,
    cuentas: dataState.cuentas,
    setModalOpen: uiState.modals.setModalOpen,
    setFinanceForm: uiState.forms.setFinanceForm,
    setErrorMsg: uiState.feedback.showToast,
    updateStreakExternal: baseActions.updateStreak,
    movimientos: dataState.movimientos,
    ventas: dataState.ventas
  });

  const saludLogic = useHealthSystem(user, uiState.feedback.showToast);
  const { saludHoy, historialSalud, healthError, ...saludActions } = saludLogic;
  const healthActions = useHealthActions({
    user,
    setModalOpen: uiState.modals.setModalOpen,
    setErrorMsg: uiState.feedback.showToast,
    healthSystem: saludActions
  });
  const profileActions = useProfileActions({ user, setErrorMsg: uiState.feedback.showToast });

  const metrics = useDashboardDerivedMetrics({
    movimientos: dataState.movimientosMesActual, // métricas del mes; el saldo real vive en cuentas[].monto
    cuentas: dataState.cuentas,
    fijos: dataState.fijos,
    presupuestos: dataState.presupuestos
  });

  const financeCollectionByModal = {
    movimiento: "movimientos",
    cuenta: "cuentas",
    fijo: "fijos",
    meta: "metas",
    presupuesto: "presupuestos",
    transferencia: "transferencia",
    tarjeta: "tarjetas",
    ahorroMeta: "ahorroMeta"
  };

  const handleModalConfirm = async () => {
    const { modalOpen } = uiState.modals;
    const { selectedMeta } = uiState.filters;
    const { financeForm, productForm, healthForm } = uiState.forms;

    const modalHandlers = {
      cobrar: () => ventasActions.handleCheckout(),
      nutricion: () => healthActions.handleQuickMeal(healthForm),
      agua: () => healthActions.handleWater(),
      producto: () => ventasActions.handleProductSave({ uid: user.uid, isPro: user.plan === "pro", productosCount: dataState.productos.length, productForm }),
      habito: () => healthActions.handleHealthSave("habitos", healthForm),
      peso: () => healthActions.handleHealthSave("peso", healthForm)
    };
    const handler = modalHandlers[modalOpen];
    if (handler) {
      await handler();
      return;
    }
    const collection = financeCollectionByModal[modalOpen];
    if (!collection) return;
    const formFinal = collection === "ahorroMeta" && selectedMeta ? { ...financeForm, metaId: selectedMeta.id } : financeForm;
    await finanzasActions.handleSave(collection, formFinal);
  };

  const deleteItem = (collection, item) => {
    if (collection === "ventas") return ventasActions.cancelSaleItem(item);
    if (collection === "productos") return ventasActions.deleteProduct(item);
    if (collection === "habitos") return healthActions.archiveHabit(item);
    return finanzasActions.deleteItem(collection, item);
  };

  return {
    ui: {
      isOnline,
      isSaving: finanzasActions.isSaving || ventasActions.isCheckingOut || ventasActions.isSavingProducts || healthActions.isSavingHealth,
      navigation: uiState.navigation,
      feedback: uiState.feedback,
      filters: uiState.filters,
      modals: uiState.modals,
      forms: uiState.forms,
      commerce: uiState.commerce
    },
    data: {
      ...dataState,
      syncError: dataState.syncError || healthError,
      saludHoy,
      historialSalud
    },
    metrics,
    actions: {
      ...baseActions,
      ...ventasActions,
      ...finanzasActions,
      ...saludActions,
      ...healthActions,
      ...profileActions,
      deleteItem,
      handleModalConfirm
    }
  };
}
