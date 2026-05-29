import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedAchievementBadge({ emoji, title, description, delay = 0, showConfetti = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4, type: 'spring', stiffness: 100 }}
      className={`flex flex-col items-center gap-2 p-4 rounded-[16px] bg-gradient-to-br from-[var(--life-accent-soft)] to-transparent border border-[var(--life-accent)] ${
        showConfetti ? 'animate-bounce-in' : ''
      }`}
    >
      <div className={`text-4xl ${showConfetti ? 'animate-heartbeat' : ''}`}>{emoji}</div>
      <div className="text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.08em] text-[var(--life-text)]">
          {title}
        </p>
        <p className="text-[10px] text-[var(--life-text-muted)] mt-1">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function StreakBadge({ streak, showAnimation = false }) {
  if (!streak || streak <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[color:color-mix(in_srgb,var(--life-business)_18%,transparent)] px-3 py-1.5 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[var(--life-business)] ${
        showAnimation ? 'animate-float' : ''
      }`}
    >
      <span className="text-lg">🔥</span>
      <span>{streak}D</span>
    </motion.div>
  );
}

export function MilestoneProgress({ milestone, isPro }) {
  if (!milestone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2 p-4 rounded-[16px] border border-[var(--life-border)] bg-[var(--life-surface-2)]"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[11px] font-black uppercase tracking-[0.1em] text-[var(--life-text)]">
          PRÓXIMO NIVEL: {milestone.nivel}
        </p>
        <p className="text-[10px] text-[var(--life-text-muted)]">
          {Math.round(milestone.expProgress)}%
        </p>
      </div>
      <div className="h-2 rounded-full bg-[var(--life-surface-3)] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${milestone.expProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[var(--life-accent)] to-[var(--life-accent)]"
        />
      </div>
    </motion.div>
  );
}
