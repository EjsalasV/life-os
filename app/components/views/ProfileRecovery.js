"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/auth";
import { hasPendingAccountDeletion } from "@/services/api/backendService";
import { userError } from "@/lib/userError";

export default function ProfileRecovery() {
  const { profileError, retryProfile, logOut, deleteAccount } = useUser();
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    hasPendingAccountDeletion().then(value => { if (active) setPending(value); })
      .catch(e => { if (active) setError(userError(e)); });
    return () => { active = false; };
  }, []);
  const retryDeletion = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try { await deleteAccount(password); }
    catch (e) { setError(userError(e)); }
    finally { setBusy(false); }
  };
  return <main className="mx-auto max-w-sm space-y-4 p-6">
    <p role="alert">{pending ? "Tu eliminación quedó pendiente. Confirma tu contraseña para terminarla." : profileError}</p>
    {pending && <form onSubmit={retryDeletion} className="space-y-3">
      <input type="password" aria-label="Contraseña" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} className="w-full rounded-xl border p-3" />
      <button disabled={busy} className="min-h-11 rounded-xl bg-red-700 p-3 text-white">{busy ? "Eliminando…" : "Completar eliminación solicitada"}</button>
    </form>}
    {error && <p role="alert">{error}</p>}
    <button disabled={busy} className="min-h-11 p-3 font-bold" onClick={retryProfile}>Reintentar carga</button>
    <button disabled={busy} className="min-h-11 p-3" onClick={logOut}>Cerrar sesión</button>
  </main>;
}
