export interface ErrorContext {
  source: string;
  details?: Record<string, unknown>;
}

export function reportClientError(error: unknown, context: ErrorContext): void {
  const normalized = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: String(error) };

  if (process.env.NODE_ENV === "development") {
    console.error(`[${context.source}]`, error, context.details || {});
    return;
  }

  void fetch("/api/observability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ type: "client_error", error: normalized, context, path: window.location.pathname })
  }).catch(() => {});
}

export function reportWebVital(metric: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") return;
  void fetch("/api/observability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ type: "web_vital", metric, path: window.location.pathname })
  }).catch(() => {});
}
