import React from "react";
import FormErrorBanner from "./sections/FormErrorBanner";
import FormSubmitButton from "./sections/FormSubmitButton";
import {
  ProductoFormSection,
  CobrarFormSection,
  MovimientoFormSection,
  PresupuestoFormSection,
  MetaFormSection,
  FijoFormSection,
  CuentaFormSection,
  TransferenciaFormSection,
  AhorroMetaFormSection
} from "./sections/FinanceAndSalesFormSections";
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
  ahorroMeta: AhorroMetaFormSection
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
    <div className="space-y-4">
      <FormErrorBanner errorMsg={errorMsg} />

      {Section ? <Section {...props} /> : null}

      <FormSubmitButton modalType={modalType} productForm={productForm} onConfirm={onConfirm} />
    </div>
  );
}
