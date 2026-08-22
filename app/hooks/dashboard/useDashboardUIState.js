"use client";

import { useState } from "react";
import { getTodayKey } from "@/app/utils/helpers";

export const createInitialFinanceForm = (overrides = {}) => ({
  id: null,
  nombre: "",
  monto: "",
  tipo: "GASTO",
  cuentaId: "",
  cuentaDestinoId: "",
  categoria: "otros",
  periodicidad: "Mensual",
  diaCobro: "1",
  limite: "",
  banco: "",
  saldo: "",
  metaId: "",
  fecha: getTodayKey(),
  ...overrides
});

const INITIAL_PRODUCT = { nombre: "", precioVenta: "", costo: "", stock: "" };
const INITIAL_POS = { cliente: "", cuentaId: "", id: null };
const INITIAL_HEALTH = {
  tipoEjercicio: "cardio",
  duracion: "20",
  tipoComida: "almuerzo",
  calidadComida: "normal",
  horasSueno: "7",
  calidadSueno: "regular",
  frecuencia: "Diario",
  iconType: "pill",
  nombre: "",
  peso: ""
};

export default function useDashboardUIState() {
  const [activeTab, setActiveTab] = useState("home");
  const [finSubTab, setFinSubTab] = useState("control");
  const [ventasSubTab, setVentasSubTab] = useState("terminal");
  const [saludSubTab, setSaludSubTab] = useState("vitalidad");

  const [modalOpen, setModalOpen] = useState(null);
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [authError, setAuthError] = useState("");

  const [filterDate, setFilterDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  const [carrito, setCarrito] = useState([]);
  const [busquedaProd, setBusquedaProd] = useState("");
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const [financeForm, setFinanceForm] = useState(() => createInitialFinanceForm());
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT);
  const [posForm, setPosForm] = useState(INITIAL_POS);
  const [healthForm, setHealthForm] = useState(INITIAL_HEALTH);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return {
    navigation: {
      activeTab,
      setActiveTab,
      finSubTab,
      setFinSubTab,
      ventasSubTab,
      setVentasSubTab,
      saludSubTab,
      setSaludSubTab
    },
    modals: {
      modalOpen,
      setModalOpen,
      streakModalOpen,
      setStreakModalOpen
    },
    feedback: {
      toast,
      errorMsg,
      authError,
      setAuthError,
      showToast
    },
    filters: {
      filterDate,
      setFilterDate,
      busquedaProd,
      setBusquedaProd,
      selectedMeta,
      setSelectedMeta,
      selectedAccountId,
      setSelectedAccountId
    },
    forms: {
      financeForm,
      setFinanceForm,
      productForm,
      setProductForm,
      posForm,
      setPosForm,
      healthForm,
      setHealthForm
    },
    commerce: {
      carrito,
      setCarrito
    }
  };
}
