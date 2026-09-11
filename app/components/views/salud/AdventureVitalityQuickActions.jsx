import React from 'react';
import { AdventureIcon } from '../../ui/AdventureIcons';

const actions = [
  { key: 'water', label: 'Agua', icon: 'water', tone: 'water' },
  { key: 'food', label: 'Comida', icon: 'food', tone: 'food' },
  { key: 'activity', label: 'Actividad', icon: 'activity', tone: 'activity' },
  { key: 'sleep', label: 'Dormir', icon: 'sleep', tone: 'sleep' },
];

export default function AdventureVitalityQuickActions({
  handlers,
  hasReachedLimit,
  getCount,
  getLimit,
}) {
  return (
    <section className="adventure-vitality-quick-actions" aria-label="Acciones rápidas">
      <div className="adventure-vitality-section-heading">
        <span><i /> ACCIONES RÁPIDAS</span>
      </div>
      <div className="adventure-vitality-quick-grid">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={handlers[action.key]}
            disabled={hasReachedLimit(action.key)}
            className={`adventure-vitality-quick-action is-${action.tone}`}
          >
            <AdventureIcon type={action.icon} size={22} color="currentColor" />
            <span>{action.label}</span>
            <small>{getCount(action.key)}/{getLimit(action.key)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
