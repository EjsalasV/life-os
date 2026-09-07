import React from "react";

const MEALS = ["desayuno", "almuerzo", "merienda", "cena", "snack"];

export default function QuickMealFormSection({ healthForm, setHealthForm }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--life-text-muted)]">Registro rápido</p>
        <p className="mt-1 text-sm font-bold text-[var(--life-text-dim)]">Anota lo que comiste y continúa con tu día.</p>
      </div>
      <input
        autoFocus
        aria-label="Alimento"
        placeholder="Ej: huevos con pan"
        value={healthForm.foodName || ""}
        onChange={(event) => setHealthForm({ ...healthForm, foodName: event.target.value })}
        className="w-full rounded-2xl border border-[var(--life-border)] bg-[var(--life-surface-2)] p-4 font-bold text-[var(--life-text)] outline-none focus:border-[var(--life-accent)]"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          aria-label="Cantidad"
          type="number"
          min="1"
          step="1"
          value={healthForm.foodQuantity || 1}
          onChange={(event) => setHealthForm({ ...healthForm, foodQuantity: Number(event.target.value) })}
          className="w-full rounded-2xl border border-[var(--life-border)] bg-[var(--life-surface-2)] p-3 font-bold text-[var(--life-text)]"
        />
        <input
          aria-label="Calorías aproximadas"
          type="number"
          min="0"
          placeholder="Calorías"
          value={healthForm.foodCalories || ""}
          onChange={(event) => setHealthForm({ ...healthForm, foodCalories: Number(event.target.value) })}
          className="w-full rounded-2xl border border-[var(--life-border)] bg-[var(--life-surface-2)] p-3 font-bold text-[var(--life-text)]"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MEALS.map((meal) => (
          <button
            key={meal}
            type="button"
            onClick={() => setHealthForm({ ...healthForm, tipoComida: meal })}
            className={`rounded-xl px-3 py-2 text-xs font-black capitalize ${healthForm.tipoComida === meal ? "bg-[var(--life-accent)] text-black" : "bg-[var(--life-surface-3)] text-[var(--life-text-dim)]"}`}
          >
            {meal}
          </button>
        ))}
      </div>
    </div>
  );
}
