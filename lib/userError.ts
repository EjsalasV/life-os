export function userError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code.includes("permission-denied")) return "No se pudo guardar. Comprueba tu sesión y vuelve a intentarlo.";
  if (code.includes("unavailable") || code.includes("network")) return "No hay conexión con el servidor. Tus datos del formulario se conservan; vuelve a intentarlo.";
  if (code.includes("not-found")) return "El registro ya no existe. Actualiza los datos antes de continuar.";
  if (code.includes("auth/")) return "No se pudo verificar tu sesión. Revisa tus datos y vuelve a intentarlo.";
  if (code) return "No se pudo completar la operación. Vuelve a intentarlo.";
  if (error instanceof TypeError) return "No se pudo conectar con el servidor. Vuelve a intentarlo.";
  return error instanceof Error ? error.message : "No se pudo completar la operación.";
}

