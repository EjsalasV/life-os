import React from "react";
import FormErrorBanner from "./sections/FormErrorBanner";
import FormSubmitButton from "./sections/FormSubmitButton";
import {
  ProductoFormSection,
  CobrarFormSection,
  MovimientoFormSection,
  PresupuestoFormSection,
  MetaFormSection
} from "./sections/FinanceAndSalesFormSections";
import {
  FijoFormSection,
  CuentaFormSection,
  TransferenciaFormSection,
  AhorroMetaFormSection,
  TarjetaFormSection
} from "./sections/AccountFormSections";
import { PesoFormSection, HabitoFormSection } from "./sections/HealthFormSections";

const sectionByModal = {
  producto: ProductoFormSection,
  cobrar: CobrarFormSection,
  movimiento: MovimientoFormSection,
  presupuesto: PresupuestoFormSection,
  meta: MetaFormSection,
  fijo: FijoFormSection,
  cuenta: CuentaFormSection,
  peso: PesoFormSection,
  habito: HabitoFormSection,
  transferencia: TransferenciaFormSection,
  ahorroMeta: AhorroMetaFormSection,
  tarjeta: TarjetaFormSection
};

export default function AppForms(props) {
  const {
    modalType,
    errorMsg,
    productForm,
    onConfirm
  } = props;

  const Section = sectionByModal[modalType];

  return (
    <form noValidate onSubmit={(event) => { event.preventDefault(); if (!props.isSaving) onConfirm(); }}>
    <fieldset disabled={props.isSaving} className="space-y-4 min-w-0">
      <FormErrorBanner errorMsg={errorMsg} />

      {Section ? <Section {...props} /> : null}

      <FormSubmitButton modalType={modalType} productForm={productForm} onConfirm={onConfirm} isSaving={props.isSaving} />
    </fieldset>
    </form>
  );
}
