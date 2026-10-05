import React from 'react';
import { AdventureIcon } from '../../ui/AdventureIcons';

const stats = [
  { key: 'salud', label: 'SALUD', icon: 'health', color: 'health' },
  { key: 'energia', label: 'ENERGÍA', icon: 'energy', color: 'energy' },
  { key: 'hambre', label: 'HAMBRE', icon: 'food', color: 'hunger' },
  { key: 'sed', label: 'SED', icon: 'water', color: 'thirst' },
];

export default function AdventureVitalityStatus({ values }) {
  return (
    <div className="adventure-vitality-status" aria-label="Estado esencial de la mascota">
      {stats.map((stat) => {
        const value = Math.max(0, Math.min(100, Number(values[stat.key]) || 0));
        return (
          <div className={`adventure-vitality-status-row is-${stat.color}`} key={stat.key}>
            <span className="adventure-vitality-status-label">
              <AdventureIcon type={stat.icon} size={15} color="currentColor" />
              {stat.label}
            </span>
            <div className="adventure-vitality-status-track" aria-label={`${stat.label}: ${value}%`}>
              <span style={{ width: `${value}%` }} />
            </div>
            <b>{value}%</b>
          </div>
        );
      })}
    </div>
  );
}
