"use client";

import { useEffect, useState } from "react";
import { Loader2, Link2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useUser } from "@/context/auth";
import { auth } from "@/services/firebase/client";

export default function TelegramConnectPage() {
  const { user, loading, login, register } = useUser();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  useEffect(() => {
    if (!user || !token || status !== "idle") return;
    async function confirmLink() {
      setStatus("loading");
      try {
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch("/api/integrations/telegram/link/confirm", {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudo vincular la cuenta.");
        setStatus("success");
        setMessage(`Telegram ${data.telegramUserId} quedó vinculado a tu cuenta de Life OS.`);
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se pudo completar la vinculación.");
      }
    }
    void confirmLink();
  }, [user, token, status]);

  async function submitAuth(event) {
    event.preventDefault();
    setMessage("");
    try {
      if (isRegister) await register(email, password, email.split("@")[0]);
      else await login(email, password);
    } catch {
      setMessage("No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.");
    }
  }

  if (!token) return <ConnectShell><AlertTriangle className="text-amber-500" size={32} /><p>El enlace de vinculación no es válido.</p></ConnectShell>;
  if (loading || status === "loading") return <ConnectShell><Loader2 className="animate-spin" size={32} /><p>Preparando la vinculación…</p></ConnectShell>;
  if (status === "success") return <ConnectShell><CheckCircle2 className="text-emerald-500" size={40} /><h1>Cuenta vinculada</h1><p>{message}</p></ConnectShell>;
  if (user) return <ConnectShell><AlertTriangle className="text-rose-500" size={32} /><p>{message || "No se pudo vincular la cuenta."}</p></ConnectShell>;

  return <ConnectShell>
    <Link2 className="text-indigo-600" size={36} />
    <h1>Conectar Telegram</h1>
    <p>Inicia sesión en Life OS para confirmar la vinculación segura.</p>
    <form onSubmit={submitAuth} className="mt-4 w-full space-y-3 text-left">
      <input aria-label="Correo" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo" className="w-full rounded-xl border p-3" />
      <input aria-label="Contraseña" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" className="w-full rounded-xl border p-3" />
      <button className="w-full rounded-xl bg-black p-3 font-bold text-white">{isRegister ? "Crear cuenta y vincular" : "Iniciar sesión y vincular"}</button>
    </form>
    <button type="button" onClick={() => setIsRegister((value) => !value)} className="mt-3 text-sm text-indigo-600">{isRegister ? "Ya tengo una cuenta" : "Crear una cuenta nueva"}</button>
    {message && <p className="mt-3 text-sm text-rose-600">{message}</p>}
  </ConnectShell>;
}

function ConnectShell({ children }) {
  return <main className="flex min-h-screen items-center justify-center bg-[var(--life-surface)] p-6"><section className="flex w-full max-w-md flex-col items-center rounded-3xl bg-white p-8 text-center shadow-xl"><div className="mb-4 flex items-center gap-2"><span className="font-black">Life OS</span><span className="text-gray-400">·</span><span className="text-sm text-gray-500">Telegram</span></div>{children}</section></main>;
}
