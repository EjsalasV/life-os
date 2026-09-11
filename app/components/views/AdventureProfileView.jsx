"use client";

import React, { useState } from "react";
import { ChevronRight, Edit2, HelpCircle, LogOut, Mail, Trash2 } from "lucide-react";
import PricingModal from "../ui/PricingModal";
import Modal from "../ui/Modal";
import { AdventureIcon } from "../ui/AdventureIcons";

const FOCUS_OPTIONS = [
  { id: "equilibrio", label: "Un poco de todo", icon: "target", color: "#ffc837" },
  { id: "finanzas", label: "Ordenar mis finanzas", icon: "finance", color: "#ccff00" },
  { id: "negocio", label: "Impulsar mi negocio", icon: "business", color: "#ff9800" },
  { id: "salud", label: "Cuidar mi salud", icon: "health", color: "#5b8bd9" },
];

function SectionLabel({ children, color = "var(--adventure-muted-on-dark)" }) {
  return <div className="adventure-profile-section-label" style={{ color }}><i />{children}</div>;
}

function AdventureProfileView({
  user,
  logOut,
  deleteAccount,
  showToast,
  handleTogglePlan,
  handleUpdateName,
  handleUpdateFocus,
  handleUploadProfilePhoto,
  handleRemoveProfilePhoto,
}) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [focusOpen, setFocusOpen] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [nameError, setNameError] = useState("");
  const photoInputRef = React.useRef(null);

  const focus = user?.onboardingFocus || "equilibrio";
  const activeFocus = FOCUS_OPTIONS.find((option) => option.id === focus) || FOCUS_OPTIONS[0];
  const isPro = user?.plan === "pro";

  const saveName = () => {
    const value = newName.trim();
    if (!value) {
      setNameError("Escribe un nombre para continuar.");
      return;
    }
    setNameError("");
    handleUpdateName(value).then(() => setIsEditingName(false)).catch(() => {});
  };

  const choosePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^(image\/(jpeg|png|webp))$/.test(file.type)) {
      setPhotoError("Selecciona una imagen JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("La imagen debe pesar menos de 5 MB.");
      return;
    }
    setPhotoError("");
    try { await handleUploadProfilePhoto(file); } catch { /* the shared handler reports the safe error */ }
  };

  const handleDelete = async () => {
    if (deleting || !deletePassword) return;
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      showToast("Cuenta eliminada correctamente");
      setConfirmDeleteOpen(false);
      setDeletePassword("");
    } catch (error) {
      showToast(error?.message || "No se pudo eliminar la cuenta", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="adventure-profile-view">
      <div className="adventure-profile-kicker"><span /> PERFIL // AJUSTES</div>

      <section className="adventure-profile-panel adventure-profile-identity">
        <SectionLabel color="var(--adventure-text-on-parchment)">IDENTIDAD</SectionLabel>
        <div className="adventure-profile-identity-row">
          <button type="button" className="adventure-profile-avatar" onClick={() => photoInputRef.current?.click()} aria-label={user?.photoURL ? "Cambiar foto de perfil" : "Subir foto de perfil"}>
            {user?.photoURL ? <img src={user.photoURL} alt="" /> : <AdventureIcon type="profile" size={25} color="#161b2a" />}
          </button>
          {isEditingName ? (
            <div className="adventure-profile-name-editor">
              <input
                autoFocus
                aria-label="Nombre de perfil"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && saveName()}
              />
              <button type="button" aria-label="Guardar nombre" onClick={saveName}><AdventureIcon type="check" size={16} color="#161b2a" /></button>
            </div>
          ) : (
            <div className="adventure-profile-user-copy">
              <strong>{user?.name || "Sin nombre"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          )}
          {!isEditingName && <div className="adventure-profile-identity-actions"><button type="button" className="adventure-profile-compact-button" onClick={() => { setNewName(user?.name || ""); setIsEditingName(true); }}><Edit2 size={14} /> EDITAR</button><button type="button" className="adventure-profile-photo-button" onClick={() => photoInputRef.current?.click()}>{user?.photoURL ? "CAMBIAR FOTO" : "SUBIR FOTO"}</button></div>}
        </div>
        {isEditingName && nameError && <p className="adventure-profile-name-error" role="alert">{nameError}</p>}
        <input ref={photoInputRef} className="adventure-profile-photo-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
        {user?.photoURL && <button type="button" className="adventure-profile-remove-photo" onClick={() => handleRemoveProfilePhoto?.().catch(() => {})}>QUITAR FOTO</button>}
        {photoError && <p className="adventure-profile-photo-error" role="alert">{photoError}</p>}
      </section>

      <section className="adventure-profile-panel adventure-profile-plan">
        <div className="adventure-profile-panel-heading"><SectionLabel color="var(--adventure-text-on-dark)">PLAN ACTUAL</SectionLabel><span className={`adventure-profile-badge ${isPro ? "is-pro" : ""}`}>{isPro ? "PRO" : "FREE"}</span></div>
        <div className="adventure-profile-plan-row">
          <div><strong>{isPro ? "Life OS Pro" : "Life OS Free"}</strong><span>{isPro ? "Todas tus herramientas activas" : "Funciones esenciales para empezar"}</span></div>
          <button type="button" className="adventure-profile-primary-button" onClick={() => setIsPricingOpen(true)}>GESTIONAR PLAN</button>
        </div>
      </section>

      <section className="adventure-profile-panel adventure-profile-focus">
        <SectionLabel color="var(--adventure-text-on-parchment)">TU ENFOQUE</SectionLabel>
        <p>Define la prioridad de tus áreas en el sistema.</p>
        <button type="button" className="adventure-profile-focus-active" onClick={() => setFocusOpen((open) => !open)} aria-expanded={focusOpen}>
          <span className="adventure-profile-focus-icon"><AdventureIcon type={activeFocus.icon} size={20} color={activeFocus.color} /></span>
          <span><small>ENFOQUE ACTIVO</small><strong>{activeFocus.label}</strong></span>
          <ChevronRight size={18} className={focusOpen ? "rotate-90" : ""} />
        </button>
        {focusOpen && <div className="adventure-profile-focus-options">{FOCUS_OPTIONS.map((option) => <button type="button" key={option.id} onClick={() => { handleUpdateFocus?.(option.id); setFocusOpen(false); }} className={option.id === focus ? "is-active" : ""}><AdventureIcon type={option.icon} size={18} color={option.color} /><span>{option.label}</span>{option.id === focus && <AdventureIcon type="check" size={14} color="#ccff00" />}</button>)}</div>}
      </section>

      <section className="adventure-profile-account">
        <SectionLabel>AJUSTES DE CUENTA</SectionLabel>
        <button type="button" className="adventure-profile-action-row" onClick={() => setIsPricingOpen(true)}><span><span className="adventure-profile-row-icon"><AdventureIcon type="coin" size={17} color="#ffc837" /></span><strong>TABLA DE PRECIOS Y LÍMITES</strong></span><ChevronRight size={18} /></button>
        <button type="button" className="adventure-profile-action-row" onClick={() => { window.location.href = "mailto:ejsalasv@gmail.com?subject=Soporte Life OS&body=Hola, necesito ayuda con Life OS."; }}><span><span className="adventure-profile-row-icon"><HelpCircle size={17} /></span><strong>SOPORTE Y AYUDA DIRECTA</strong></span><Mail size={16} /></button>
      </section>

      <button type="button" className="adventure-profile-logout" onClick={logOut}><LogOut size={16} /> CERRAR SESIÓN</button>

      <section className="adventure-profile-danger">
        <SectionLabel color="#ff3b30">ZONA DE PELIGRO</SectionLabel>
        <p>Esta acción eliminará permanentemente tu cuenta y todos los registros guardados en el sistema.</p>
        <button type="button" onClick={() => setConfirmDeleteOpen(true)}><Trash2 size={16} /> ELIMINAR CUENTA</button>
      </section>

      <Modal adventure busy={deleting} isOpen={confirmDeleteOpen} onClose={() => !deleting && setConfirmDeleteOpen(false)} title="¿ELIMINAR CUENTA?">
        <div className="adventure-profile-modal-content">
          <p>Esta acción borrará permanentemente tus datos financieros, inventario, ventas y registros de salud. No se puede deshacer.</p>
          <input type="password" autoComplete="current-password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} aria-label="Confirma tu contraseña" placeholder="CONFIRMA TU CONTRASEÑA" />
          <div className="adventure-profile-modal-actions"><button type="button" onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>CANCELAR</button><button type="button" onClick={handleDelete} disabled={deleting || !deletePassword}>{deleting ? "ELIMINANDO..." : "SÍ, ELIMINAR"}</button></div>
        </div>
      </Modal>
      <PricingModal adventure isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} userPlan={user?.plan} onUpgrade={async () => { await handleTogglePlan(); setIsPricingOpen(false); }} />
    </div>
  );
}

export default AdventureProfileView;
