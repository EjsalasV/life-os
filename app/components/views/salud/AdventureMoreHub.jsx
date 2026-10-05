import React, { useMemo, useState } from 'react';
import { AdventureIcon } from '../../ui/AdventureIcons';
import PremiumLock from '../../ui/PremiumLock';
import IACoachTab from '../IACoachTab';
import HerramientasTab from '../HerramientasTab';
import { getTodayKey } from '@/app/utils/helpers';

const periods = [
  { id: 'today', label: 'HOY' },
  { id: '7', label: '7 DÍAS' },
  { id: '30', label: '30 DÍAS' }
];

const tools = [
  { id: 'ayuno', label: 'AYUNO', icon: 'focus' },
  { id: 'imc', label: 'IMC', icon: 'progress' },
  { id: 'tdee', label: 'TDEE', icon: 'energy' },
  { id: 'cronometro', label: 'CRONÓMETRO', icon: 'activity' },
  { id: 'progreso', label: 'PROGRESO', icon: 'target' }
];

function dateValue(entry) {
  if (!entry?.fecha) return null;
  const value = new Date(`${entry.fecha}T12:00:00`).getTime();
  return Number.isNaN(value) ? null : value;
}

function isInPeriod(entry, period) {
  if (period === 'today') return entry?.fecha === getTodayKey();
  const value = dateValue(entry);
  if (!value) return false;
  const days = Number(period);
  return Date.now() - value <= days * 86400000;
}

function HistoryRow({ entry }) {
  return (
    <article className="adventure-more-history-row">
      <span className="adventure-more-history-icon"><AdventureIcon type="calendar" size={17} color="currentColor" /></span>
      <div>
        <strong>{entry.fecha === getTodayKey() ? 'HOY' : entry.fecha}</strong>
        <span>{entry.bateria ?? 0}% ENERGÍA · {entry.agua ?? 0} VASOS · {entry.habitosChecks?.length || 0} HÁBITOS</span>
      </div>
    </article>
  );
}

function HistoryPanel({ entries, isPro, onBack }) {
  return (
    <div className="adventure-more-subview">
      <button type="button" className="adventure-more-back" onClick={onBack}>‹ MÁS</button>
      <div className="adventure-more-subview-heading"><span><i /> HISTORIAL COMPLETO</span><AdventureIcon type="calendar" size={22} color="currentColor" /></div>
      <PremiumLock isPro={isPro} text="Historial de Salud PRO">
        <div className="adventure-more-history-list">
          {entries.length ? entries.map((entry) => <HistoryRow key={entry.id || entry.fecha} entry={entry} />) : <div className="adventure-more-empty">SIN REGISTROS PREVIOS</div>}
        </div>
      </PremiumLock>
    </div>
  );
}

export default function AdventureMoreHub({
  user,
  saludHoy,
  historialSalud,
  isPro,
  predecirBateriaManana,
  analizarCompatibilidad,
  setModalOpen
}) {
  const [period, setPeriod] = useState('7');
  const [subview, setSubview] = useState(null);
  const filteredHistory = useMemo(
    () => (historialSalud || []).filter((entry) => isInPeriod(entry, period)),
    [historialSalud, period]
  );

  if (subview === 'analysis') {
    return <div className="adventure-more-subview"><button type="button" className="adventure-more-back" onClick={() => setSubview(null)}>‹ MÁS</button><div className="adventure-more-subview-heading"><span><i /> ANÁLISIS DE SALUD</span><AdventureIcon type="energy" size={22} color="currentColor" /></div><IACoachTab saludHoy={saludHoy} predecirBateriaManana={predecirBateriaManana} historialSalud={historialSalud} analizarCompatibilidad={analizarCompatibilidad} isPro={isPro} setModalOpen={setModalOpen} /></div>;
  }
  if (subview === 'history') return <HistoryPanel entries={historialSalud || []} isPro={isPro} onBack={() => setSubview(null)} />;
  if (tools.some((tool) => tool.id === subview)) {
    return <div className="adventure-more-subview"><button type="button" className="adventure-more-back" onClick={() => setSubview(null)}>‹ MÁS</button><div className="adventure-more-subview-heading"><span><i /> HERRAMIENTAS</span><AdventureIcon type="focus" size={22} color="currentColor" /></div><HerramientasTab user={user} adventure initialTab={subview} /></div>;
  }

  return (
    <div className="adventure-more-hub">
      <section className="adventure-more-analysis">
        <div className="adventure-more-section-heading"><span><i /> ANÁLISIS DE SALUD</span><span className="adventure-more-badge">COACH IA</span></div>
        <div className="adventure-more-analysis-body">
          <div><strong>{saludHoy?.consejosIA?.length ? 'NUEVO ANÁLISIS DISPONIBLE' : 'ANÁLISIS DE SALUD'}</strong><span>{saludHoy?.consejosIA?.length ? 'Revisa tus recomendaciones basadas en tus registros.' : 'Registra datos para obtener un análisis personalizado.'}</span></div>
          <button type="button" className="adventure-more-primary" onClick={() => setSubview('analysis')}>VER ANÁLISIS ›</button>
        </div>
      </section>

      <section className="adventure-more-history">
        <div className="adventure-more-section-heading"><span><i /> HISTORIAL RECIENTE</span><div className="adventure-more-periods">{periods.map((item) => <button type="button" key={item.id} className={period === item.id ? 'is-active' : ''} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div></div>
        <div className="adventure-more-history-list">
          {filteredHistory.slice(0, 3).map((entry) => <HistoryRow key={entry.id || entry.fecha} entry={entry} />)}
          {!filteredHistory.length && <div className="adventure-more-empty">SIN REGISTROS EN ESTE PERIODO</div>}
        </div>
        <button type="button" className="adventure-more-history-link" onClick={() => setSubview('history')}>VER HISTORIAL COMPLETO <span>›</span></button>
      </section>

      <section className="adventure-more-tools">
        <div className="adventure-more-section-heading"><span><i /> HERRAMIENTAS</span><span className="adventure-more-caption">ACCESOS RÁPIDOS</span></div>
        <div className="adventure-more-tools-grid">{tools.map((tool) => <button type="button" key={tool.id} onClick={() => setSubview(tool.id)}><span><AdventureIcon type={tool.icon} size={19} color="currentColor" /></span><strong>{tool.label}</strong><b>›</b></button>)}</div>
      </section>
    </div>
  );
}
