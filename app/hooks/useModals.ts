// app/hooks/useModals.ts
"use client";
import { useState } from 'react';
import type { ModalType, FinanceForm, ProductForm, PosForm, HealthForm } from '@/app/types';

const INITIAL_FINANCE: FinanceForm = {
    nombre: '',
    monto: '',
    tipo: 'GASTO',
    cuentaId: '',
    cuentaDestinoId: '',
    categoria: 'otros',
    periodicidad: 'Mensual',
    diaCobro: '1',
    limite: ''
};

const INITIAL_PRODUCT: ProductForm = {
    nombre: '',
    precioVenta: '',
    costo: '',
    stock: ''
};

const INITIAL_POS: PosForm = {
    cliente: '',
    cuentaId: '',
    id: null
};

const INITIAL_HEALTH: HealthForm = {
    tipoEjercicio: 'cardio',
    duracion: '20',
    tipoComida: 'almuerzo',
    calidadComida: 'normal',
    horasSueno: '7',
    calidadSueno: 'regular',
    frecuencia: 'Diario',
    iconType: 'pill',
    nombre: '',
    peso: ''
};

export default function useModals() {
    const [modalOpen, setModalOpen] = useState<ModalType>(null);
    const [financeForm, setFinanceForm] = useState<FinanceForm>(INITIAL_FINANCE);
    const [productForm, setProductForm] = useState<ProductForm>(INITIAL_PRODUCT);
    const [posForm, setPosForm] = useState<PosForm>(INITIAL_POS);
    const [healthForm, setHealthForm] = useState<HealthForm>(INITIAL_HEALTH);

    const openModal = (type: ModalType) => {
        setModalOpen(type);
    };

    const closeModal = () => {
        setModalOpen(null);
        // Reset forms when closing
        setFinanceForm(INITIAL_FINANCE);
        setProductForm(INITIAL_PRODUCT);
        setPosForm(INITIAL_POS);
        setHealthForm(INITIAL_HEALTH);
    };

    const resetForms = () => {
        setFinanceForm(INITIAL_FINANCE);
        setProductForm(INITIAL_PRODUCT);
        setPosForm(INITIAL_POS);
        setHealthForm(INITIAL_HEALTH);
    };

    return {
        // State
        modalOpen,
        financeForm,
        productForm,
        posForm,
        healthForm,

        // Setters
        setModalOpen,
        setFinanceForm,
        setProductForm,
        setPosForm,
        setHealthForm,

        // Actions
        openModal,
        closeModal,
        resetForms
    };
}
