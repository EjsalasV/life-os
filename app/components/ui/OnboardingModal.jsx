"use client";
import { motion } from 'framer-motion';
import { userError } from '@/lib/userError';
import { useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function OnboardingModal({ isOpen, onComplete }) {
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    peso: 75,
    altura: 175,
    edad: 30,
    sexo: 'hombre',
    nivelActividad: 'moderado',
    objetivo: 'mantenimiento',
    pesoObjetivo: 75,
    enfoque: 'equilibrio'
  });

  const steps = [
    {
      title: 'Empieza tu sistema personal',
      description: 'Primero elegiremos qué quieres ordenar. Luego configuraremos tu punto de partida para que Life OS pueda recomendarte acciones útiles y hacer que tu mascota evolucione contigo.',
      fields: [
        {
          key: 'enfoque',
          label: '¿Qué quieres mejorar primero?',
          type: 'select',
          options: [
            { value: 'equilibrio', label: '⚖️ Un poco de todo' },
            { value: 'finanzas', label: '💰 Ordenar mis finanzas' },
            { value: 'negocio', label: '🧾 Impulsar mi negocio' },
            { value: 'salud', label: '🌱 Cuidar mi salud' }
          ]
        },
        { key: 'peso', label: 'Peso (kg)', type: 'number', min: 30, max: 300 },
        { key: 'altura', label: 'Altura (cm)', type: 'number', min: 140, max: 220 },
        { key: 'edad', label: 'Edad', type: 'number', min: 13, max: 120 }
      ]
    },
    {
      title: '👥 Perfil',
      description: 'Esto ayuda a que tus recomendaciones sean más realistas para tu ritmo de vida.',
      fields: [
        {
          key: 'sexo',
          label: 'Sexo',
          type: 'select',
          options: [
            { value: 'hombre', label: '👨 Hombre' },
            { value: 'mujer', label: '👩 Mujer' }
          ]
        },
        {
          key: 'nivelActividad',
          label: 'Nivel de Actividad',
          type: 'select',
          options: [
            { value: 'sedentario', label: 'Sedentario (sin ejercicio)' },
            { value: 'ligero', label: 'Ligero (1-3 días/semana)' },
            { value: 'moderado', label: 'Moderado (3-5 días/semana)' },
            { value: 'intenso', label: 'Activo (6-7 días/semana)' },
            { value: 'muy-intenso', label: 'Muy Activo (intenso diario)' }
          ]
        }
      ]
    },
    {
      title: '🎯 Objetivo',
      description: 'Elige una dirección. Podrás cambiarla cuando quieras.',
      fields: [
        {
          key: 'objetivo',
          label: 'Tu Objetivo',
          type: 'select',
          options: [
            { value: 'perdida-grasa', label: '⬇️ Perder Peso' },
            { value: 'mantenimiento', label: '↔️ Mantener' },
            { value: 'ganancia-muscular', label: '⬆️ Ganar Masa' }
          ]
        },
        {
          key: 'pesoObjetivo',
          label: 'Peso Objetivo (kg)',
          type: 'number',
          min: 30,
          max: 300
        }
      ]
    }
  ];

  const currentStep = steps[step];

  const handleNext = async () => {
    if (saving.current) return;
    const invalid = currentStep.fields.find(field => field.type === 'number' &&
      (!Number.isFinite(Number(formData[field.key])) || Number(formData[field.key]) < field.min || Number(formData[field.key]) > field.max));
    if (invalid) { setError(`Revisa ${invalid.label}: debe estar entre ${invalid.min} y ${invalid.max}.`); return; }
    setError('');
    if (step < steps.length - 1) { setStep(step + 1); return; }
    saving.current = true;
    setBusy(true);
    try { await onComplete(formData); }
    catch (failure) { setError(userError(failure)); }
    finally { saving.current = false; setBusy(false); }
  };

  const isLastStep = step === steps.length - 1;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        role="dialog" aria-modal="true" aria-label="Configurar tu experiencia en Life OS"
        className="max-h-[90dvh] w-full max-w-md space-y-6 overflow-y-auto rounded-[32px] border border-[var(--life-border)] bg-[var(--life-surface)] p-6 shadow-2xl mx-4"
      >
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 grid-cols-2 gap-0.5 rounded-xl bg-[var(--life-accent)] p-1.5">
              <span className="rounded-[2px] bg-black/80" /><span className="rounded-[2px] bg-black/80" />
              <span className="rounded-[2px] bg-black/80" /><span className="rounded-[2px] bg-black/80" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[var(--life-text)]">Life OS</p>
              <p className="text-[10px] font-semibold text-[var(--life-text-muted)]">Tu progreso, a tu ritmo</p>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--life-text)]">{currentStep.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--life-text-dim)]">{currentStep.description}</p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--life-text-muted)]">Paso {step + 1} de {steps.length}</p>
          <div className="mt-3 flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-[var(--life-accent)]' : 'bg-[var(--life-surface-3)]'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {currentStep.fields.map((field) => (
            <div key={field.key}>
              <label className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase block mb-2">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  aria-label={field.label} disabled={busy}
                  value={formData[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="w-full rounded-2xl border border-[var(--life-border)] bg-[var(--life-surface-2)] p-3 font-bold text-[var(--life-text)]"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label={field.label} disabled={busy}
                  type={field.type}
                  value={formData[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: Number(e.target.value) })}
                  min={field.min}
                  max={field.max}
                  className="w-full rounded-2xl border border-[var(--life-border)] bg-[var(--life-surface-2)] p-3 font-bold text-[var(--life-text)]"
                />
              )}
            </div>
          ))}
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <motion.button
          disabled={busy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full rounded-2xl bg-[var(--life-accent)] py-3 text-black font-black flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
        >
          {busy ? 'Guardando…' : isLastStep ? (<><Check size={20} /> Completar perfil</>) : (<>Continuar <ArrowRight size={20} /></>)}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
