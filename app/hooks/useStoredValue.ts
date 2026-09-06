import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const localEvent = "lifeos-storage-change";
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(localEvent, notify);
  return () => { window.removeEventListener("storage", notify); window.removeEventListener(localEvent, notify); };
}
export function useStoredValue<T>(key: string, fallback: T, validate: (value: unknown) => value is T) {
  const [writeError, setWriteError] = useState("");
  const getRaw = useCallback(() => {
    try { return localStorage.getItem(key); } catch { return "!storage-unavailable"; }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, getRaw, () => null);
  const parsed = useMemo(() => {
    if (raw === null) return { value: fallback, error: "" };
    try {
      const value: unknown = JSON.parse(raw);
      if (!validate(value)) throw new Error();
      return { value, error: "" };
    } catch { return { value: fallback, error: "No se pudieron leer los datos locales. Se conservan sin sobrescribirlos." }; }
  }, [raw, fallback, validate]);
  const setValue = useCallback((update: T | ((current: T) => T)): boolean => {
    try {
      const stored = getRaw();
      const current: unknown = stored === null ? fallback : JSON.parse(stored);
      if (!validate(current)) throw new Error();
      const next = typeof update === "function" ? (update as (current: T) => T)(current) : update;
      if (!validate(next)) throw new Error();
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(localEvent));
      setWriteError("");
      return true;
    } catch { setWriteError("No se pudo guardar en este navegador. Revisa el almacenamiento y vuelve a intentarlo."); return false; }
  }, [key, getRaw, fallback, validate]);
  return [parsed.value, setValue, parsed.error || writeError] as const;
}
