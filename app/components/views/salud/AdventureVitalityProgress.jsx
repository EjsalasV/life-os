import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, Trophy } from 'lucide-react';
import { AdventureIcon } from '../../ui/AdventureIcons';

export default function AdventureVitalityProgress({
  pet,
  milestone,
  nextReward,
  achievements,
  expanded,
  onToggle,
}) {
  const progress = milestone?.expProgress ?? 0;

  return (
    <section className="adventure-vitality-progress" aria-label="Progreso del compañero">
      <button type="button" className="adventure-vitality-progress-toggle" onClick={onToggle} aria-expanded={expanded}>
        <span><i /><span>PROGRESO DEL COMPAÑERO</span></span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <div className="adventure-vitality-progress-summary">
        <div>
          <strong>NIVEL {pet.nivel}</strong>
          <small>{pet.experiencia} XP</small>
        </div>
        <div className="adventure-vitality-progress-track" aria-label={`${progress.toFixed(0)}% de progreso`}>
          <motion.span animate={{ width: `${Math.min(100, progress)}%` }} transition={{ duration: 0.5 }} />
        </div>
        <small>{progress.toFixed(0)}%</small>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="adventure-vitality-progress-details"
          >
            <div className="adventure-vitality-progress-detail-row">
              <span><Star size={14} /> Experiencia completa</span>
              <b>{pet.experiencia} XP</b>
            </div>
            {achievements.length > 0 && (
              <div className="adventure-vitality-achievements">
                <span><Trophy size={14} /> Logros ({achievements.length})</span>
                <div>
                  {achievements.map((achievement) => (
                    <span key={achievement.id} title={`${achievement.title}: ${achievement.desc}`}>
                      <AdventureIcon type="star" size={16} color="currentColor" />
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="adventure-vitality-reward">
              <small>SIGUIENTE RECOMPENSA · NIVEL {nextReward.level}</small>
              <strong>{nextReward.label}</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
