import React from 'react';
import { AdventureIcon } from '../../ui/AdventureIcons';

export default function AdventureVitalityToday({ agua, movimiento, habitosDone, habitosTotal }) {
  const tiles = [
    { label: 'AGUA', value: agua, suffix: '', detail: 'vasos', icon: 'water', tone: 'water' },
    { label: 'MOV.', value: movimiento, suffix: ' MIN', detail: 'registrado hoy', icon: 'activity', tone: 'activity' },
    { label: 'HÁBITOS', value: `${habitosDone} / ${habitosTotal}`, suffix: '', detail: 'completados', icon: 'habit', tone: 'habits' }
  ];

  return (
    <section className="adventure-vitality-today" aria-label="Resumen diario real">
      <div className="adventure-vitality-section-heading">
        <span><i /> HOY</span>
        <small>RESUMEN DIARIO</small>
      </div>
      <div className="adventure-vitality-today-grid">
        {tiles.map((tile) => (
          <article className={`adventure-vitality-tile is-${tile.tone}`} key={tile.label}>
            <div className="adventure-vitality-tile-heading">
              <strong>{tile.label}</strong>
              <span className="adventure-vitality-tile-icon"><AdventureIcon type={tile.icon} size={18} color="currentColor" /></span>
            </div>
            <b>{tile.value}{tile.suffix}</b>
            <small>{tile.detail}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
