import React from 'react';
import { motion } from 'framer-motion';
import { AdventureIcon } from '../../ui/AdventureIcons';

const habitIcons = {
  pill: 'health',
  sun: 'energy',
  brain: 'focus',
  heart: 'heart'
};

function progressSegments(done, total) {
  if (!total) return Array.from({ length: 10 }, (_, index) => ({ id: index, filled: false }));
  const filled = Math.round((done / total) * 10);
  return Array.from({ length: 10 }, (_, index) => ({ id: index, filled: index < filled }));
}

function HabitRow({ habit, completed, onToggle, onDelete }) {
  const icon = habitIcons[habit.iconType] || 'habit';

  return (
    <motion.article
      layout
      className={`adventure-habit-row ${completed ? 'is-completed' : ''}`}
    >
      <button
        type="button"
        className="adventure-habit-check"
        aria-label={`${completed ? 'Desmarcar' : 'Marcar'} hábito ${habit.nombre}`}
        onClick={onToggle}
      >
        {completed && <AdventureIcon type="check" size={16} color="currentColor" />}
      </button>

      <span className="adventure-habit-icon" aria-hidden="true">
        <AdventureIcon type={icon} size={18} color="currentColor" />
      </span>

      <div className="adventure-habit-copy">
        <strong>{habit.nombre}</strong>
        <span>{habit.frecuencia || 'Diario'}</span>
      </div>

      <div className="adventure-habit-actions">
        {completed ? (
          <span className="adventure-habit-status">HECHO</span>
        ) : (
          <button type="button" className="adventure-habit-mark" onClick={onToggle}>MARCAR</button>
        )}
        <button
          type="button"
          className="adventure-habit-delete"
          aria-label={`Eliminar hábito ${habit.nombre}`}
          onClick={onDelete}
        >
          <AdventureIcon type="trash" size={15} color="currentColor" />
        </button>
      </div>
    </motion.article>
  );
}

export default function AdventureHabitsTab({
  habitos,
  saludHoy,
  updateHealthStat,
  toggleHabitCheck,
  registrarHabitoPet,
  deleteItem,
  onNewHabit,
  onOpenTracking
}) {
  const completedIds = saludHoy?.habitosChecks || [];
  const done = completedIds.length;
  const total = habitos.length;
  const remaining = Math.max(total - done, 0);

  const toggleHabit = async (habit) => {
    const wasCompleted = completedIds.includes(habit.id);
    if (await toggleHabitCheck(habit.id) && !wasCompleted) await registrarHabitoPet();
  };

  return (
    <div className="adventure-habits-view">
      <section className="adventure-habits-progress" aria-label="Progreso de hoy">
        <div className="adventure-habits-section-heading">
          <span><i /> PROGRESO DE HOY</span>
          <strong>{done} / {total}</strong>
        </div>
        <div className="adventure-habits-progress-title">
          <h2>{total ? `${Math.round((done / total) * 100)}% COMPLETADO` : 'SIN HÁBITOS AÚN'}</h2>
          <AdventureIcon type="progress" size={24} color="currentColor" />
        </div>
        <div className="adventure-habits-segments" aria-label={`${done} de ${total} hábitos completados`}>
          {progressSegments(done, total).map((segment) => <span key={segment.id} className={segment.filled ? 'is-filled' : ''} />)}
        </div>
        <div className="adventure-habits-progress-meta">
          <span>{done} hábitos completados hoy</span>
          <span>{remaining ? `RESTANTE${remaining === 1 ? '' : 'S'} ${remaining}` : 'TODO LISTO'}</span>
        </div>
      </section>

      <section className="adventure-habits-list" aria-labelledby="adventure-habits-title">
        <div className="adventure-habits-list-heading">
          <span id="adventure-habits-title"><i /> MIS HÁBITOS (HOY)</span>
          <span>{done} / {total} MARCADOS</span>
        </div>
        {total ? habitos.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            completed={completedIds.includes(habit.id)}
            onToggle={() => toggleHabit(habit)}
            onDelete={() => deleteItem('habitos', habit)}
          />
        )) : (
          <div className="adventure-habits-empty">
            <AdventureIcon type="habit" size={28} color="currentColor" />
            <strong>AÚN NO TIENES HÁBITOS</strong>
            <span>Crea uno para empezar tu seguimiento.</span>
          </div>
        )}
        <button type="button" className="adventure-new-habit" onClick={onNewHabit}>
          <AdventureIcon type="plus" size={16} color="currentColor" />
          + NUEVO HÁBITO
        </button>
      </section>

      <section className="adventure-habits-movement" aria-labelledby="adventure-movement-title">
        <div className="adventure-habits-list-heading">
          <span id="adventure-movement-title"><i /> REGISTRAR MOVIMIENTO</span>
          <strong>{saludHoy?.ejercicioMinutos || 0} MIN</strong>
        </div>
        <div className="adventure-movement-buttons">
          {[15, 30, 60].map((minutes) => (
            <button
              type="button"
              key={minutes}
              className={saludHoy?.ejercicioMinutos === minutes ? 'is-active' : ''}
              onClick={() => updateHealthStat('ejercicioMinutos', minutes)}
            >
              +{minutes} MIN
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="adventure-habits-tracking" onClick={onOpenTracking}>
        <span className="adventure-habits-tracking-icon"><AdventureIcon type="calendar" size={20} color="currentColor" /></span>
        <span><strong>SEGUIMIENTO E HISTORIAL</strong><small>Consistencia y registros anteriores</small></span>
        <span className="adventure-habits-arrow">›</span>
      </button>
    </div>
  );
}
