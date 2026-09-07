"use client";

import useVentas from "@/app/hooks/useVentas";
import useHealthSystem from "@/app/hooks/useHealthSystem";
import useFinanzas from "@/app/hooks/useFinanzas";
import useOnline from "@/app/hooks/useOnline";
import useLocalNotifications from "@/app/hooks/useLocalNotifications";

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
    setProductForm: uiState.forms.setProductForm,
    setHealthForm: uiState.forms.setHealthForm,
    setErrorMsg: uiState.feedback.showToast,
    updateStreakExternal: baseActions.updateStreak,
    movimientos: dataState.movimientos,
    ventas: dataState.ventas,
    productos: dataState.productos,
    setPosForm: uiState.forms.setPosForm
  });

  const saludLogic = useHealthSystem(user, uiState.feedback.showToast);
  const { saludHoy, historialSalud, healthError, ...saludActions } = saludLogic;

  const metrics = useDashboardDerivedMetrics({
    movimientos: dataState.movimientosMesActual, // métricas del mes; el saldo real vive en cuentas[].monto
    cuentas: dataState.cuentas,
    fijos: dataState.fijos,
    presupuestos: dataState.presupuestos
  });

  const handleModalConfirm = async () => {
    const { modalOpen, setModalOpen } = uiState.modals;
    const { selectedMeta } = uiState.filters;
    const { financeForm, productForm, healthForm } = uiState.forms;

    if (modalOpen === "cobrar") {
      await ventasActions.handleCheckout();
      return;
    }

    if (modalOpen === "nutricion") {
      const nombre = String(healthForm.foodName || "").trim();
      if (!nombre) {
        uiState.feedback.showToast("Escribe qué comiste para registrarlo.", "error");
        return;
      }
      const cantidad = Math.max(1, Number(healthForm.foodQuantity) || 1);
      const calorias = Math.max(0, Number(healthForm.foodCalories) || 0);
      const saved = await saludActions.registrarAlimento({
        id: `quick-${Date.now()}`,
        alimentoId: `quick-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        nombre,
        tipo: healthForm.tipoComida || "almuerzo",
        cantidad,
        unidad: "porción",
        hora: new Date().toISOString(),
        caloriasTotales: calorias * cantidad,
        nutrientes: { proteina: 0, carbohidratos: 0, grasas: 0, vitaminas: {}, minerales: {} },
        impactoBateria: 0
      });
      if (saved) setModalOpen(null);
      return;
    }

    let collection = modalOpen;
    let formFinal = financeForm;

    if (modalOpen === "producto") collection = "productos";
    else if (modalOpen === "habito") collection = "habitos";
    else if (modalOpen === "peso") collection = "peso";
    else if (modalOpen === "movimiento") collection = "movimientos";
    else if (modalOpen === "cuenta") collection = "cuentas";
    else if (modalOpen === "fijo") collection = "fijos";
    else if (modalOpen === "meta") collection = "metas";
    else if (modalOpen === "presupuesto") collection = "presupuestos";
    else if (modalOpen === "transferencia") collection = "transferencia";
    else if (modalOpen === "tarjeta") collection = "tarjetas";
    else if (modalOpen === "ahorroMeta") {
      collection = "ahorroMeta";
      if (selectedMeta) {
        formFinal = { ...financeForm, metaId: selectedMeta.id };
      }
    }

    await finanzasActions.handleSave(collection, formFinal, productForm, healthForm);
  };

  return {
    ui: {
      isOnline,
      isSaving: finanzasActions.isSaving || ventasActions.isCheckingOut,
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
      handleModalConfirm
    }
  };
}
