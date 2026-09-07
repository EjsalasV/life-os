"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "lifeos-install-prompt-dismissed";

export default function InstallAppPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedUntil > Date.now()) return undefined;

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setPromptEvent(event);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  if (!visible || !promptEvent) return null;

  const install = async () => {
    await promptEvent.prompt();
    setVisible(false);
    setPromptEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[80] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[var(--life-border)] bg-[var(--life-surface)] p-3 shadow-2xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--life-accent-soft)] text-[var(--life-accent)]">
        <Download size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-[var(--life-text)]">Instala Life OS</p>
        <p className="mt-0.5 text-[11px] text-[var(--life-text-dim)]">Ábrela rápido como una app en tu dispositivo.</p>
      </div>
      <button type="button" onClick={install} className="rounded-xl bg-[var(--life-accent)] px-3 py-2 text-[11px] font-black text-black">Instalar</button>
      <button type="button" onClick={dismiss} aria-label="Cerrar aviso de instalación" className="p-1 text-[var(--life-text-muted)]"><X size={16} /></button>
    </div>
  );
}
