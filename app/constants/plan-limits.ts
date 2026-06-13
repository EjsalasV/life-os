// Límites del plan FREE en un solo lugar.
// OJO: esto es solo UX del lado del cliente; el blindaje real del plan
// (impedir que el usuario se auto-asigne "pro") vive en firestore.rules (Fase 4).
export const FREE_PLAN_LIMITS = {
  cuentas: 2,
  productos: 5,
  ventasPorMes: 10
} as const;
