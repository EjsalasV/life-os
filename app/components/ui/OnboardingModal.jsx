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
    pesoObjetivo: 75
  });

  const steps = [
    {
      title: '📏 Datos Físicos',
      fields: [
        { key: 'peso', label: 'Peso (kg)', type: 'number', min: 30, max: 300 },
        { key: 'altura', label: 'Altura (cm)', type: 'number', min: 140, max: 220 },
        { key: 'edad', label: 'Edad', type: 'number', min: 13, max: 120 }
      ]
    },
    {
      title: '👥 Perfil',
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
        role="dialog" aria-modal="true" aria-label="Configurar perfil físico"
        className="max-h-[90dvh] overflow-y-auto bg-white dark:bg-gray-800 p-8 rounded-[40px] max-w-md w-full mx-4 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{currentStep.title}</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase">Paso {step + 1} de {steps.length}</p>
          <div className="mt-3 flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
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
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold"
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
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold"
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
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
        >
          {busy ? 'Guardando…' : isLastStep ? (<><Check size={20} /> Completar</>) : (<>Siguiente <ArrowRight size={20} /></>)}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
