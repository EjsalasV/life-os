import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, busy = false }) {
  const titleId = useId();
  const panel = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape' && !busy) closeRef.current();
      if (event.key !== 'Tab') return;
      const focusable = [...panel.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter((node) => node.getClientRects().length);
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); panel.current.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previousFocus?.focus?.(); };
  }, [isOpen, busy]);
  if (!isOpen || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={busy}
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl dark:bg-gray-900 sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-xl font-black text-gray-900 dark:text-white">{title}</h2>
          <button type="button" disabled={busy} aria-label="Cerrar diálogo" onClick={onClose} className="min-h-11 min-w-11 rounded-full bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-200"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>, document.body
  );
}
