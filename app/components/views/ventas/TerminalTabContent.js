import React from "react";
import { Plus, Calculator, PackageOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Money } from "@/app/components/ui/DesignPrimitives";
import PremiumLock from "../../ui/PremiumLock";

export default function TerminalTabContent({ isPro, metricaUtilidad, metricaVenta, metricaCosto, formatMoney, productosDisponibles, addToCart }) {
  return (
    <div className="space-y-4 pb-44">
      <div className="life-card relative overflow-hidden bg-[var(--life-surface)] p-5 text-[var(--life-text)]" style={{ '--life-card-accent': 'var(--life-business)' }}>
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-[var(--life-business)]/10 blur-3xl" />
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--life-business)]">Resultado de hoy</p>
            <PremiumLock isPro={isPro} text="Ver Utilidad">
              <Money value={metricaUtilidad} size={28} color="#10b981" />
            </PremiumLock>
          </div>
          <div className="rounded-2xl bg-[var(--life-surface-2)] p-3 text-[var(--life-business)]"><Calculator size={20} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-[var(--life-border)] pt-4">
          <div>
            <p className="text-[9px] font-black uppercase text-[var(--life-text-muted)]">Ventas</p>
            <Money value={metricaVenta} size={16} color="var(--life-text)" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-[var(--life-text-muted)]">Costos</p>
            <PremiumLock isPro={isPro} text="Sólo PRO">
              <Money value={metricaCosto} size={16} color="#f87171" />
            </PremiumLock>
          </div>
        </div>
      </div>

      {productosDisponibles.length === 0 ? (
        <div className="life-card space-y-3 p-8 text-center" style={{ '--life-card-accent': 'var(--life-business)' }}>
          <PackageOpen size={32} className="mx-auto text-[var(--life-text-muted)]" />
          <p className="text-sm font-black text-[var(--life-text)]">Crea tu primer producto</p>
          <p className="text-xs text-[var(--life-text-dim)]">Después podrás añadirlo al carrito y registrar tu primera venta.</p>
        </div>
      ) : (
      <div className="grid max-h-[450px] grid-cols-2 gap-3 overflow-y-auto pr-1 scrollbar-hide">
        {productosDisponibles.map((p) => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(p)}
            className="life-card space-y-1 p-4 text-left shadow-sm"
          >
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--life-surface-2)] text-[var(--life-business)]"><Plus size={16} /></div>
            <p className="line-clamp-2 h-7 text-[11px] font-bold leading-tight text-[var(--life-text)]">{p.nombre}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${p.stock <= 5 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}></div>
              <p className="text-[9px] font-black uppercase text-[var(--life-text-muted)]">{p.stock} uni</p>
            </div>
            <div className="pt-1"><Money value={p.precioVenta} size={14} color="#4f46e5" /></div>
          </motion.button>
        ))}
      </div>
      )}
    </div>
  );
}
