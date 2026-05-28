"use client";

import React from 'react';

/**
 * Life OS Design Primitives
 * Reusable components from the prototype
 */

// Card Component
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-[22px] border border-[var(--life-border)] bg-[var(--life-surface)] p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Money Component - Displays formatted currency
export function Money({ value, size = 24, color = 'var(--life-accent)' }) {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono-ui)',
        fontSize: `${size}px`,
        fontWeight: 700,
        color,
        letterSpacing: '-0.5px',
      }}
    >
      ${formatted}
    </span>
  );
}

// ProgressBar Component
export function ProgressBar({ value = 0, max = 100, color = 'var(--life-accent)', size = 'md', showLabel = true }) {
  const percentage = (value / max) * 100;
  const heightMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="space-y-1">
      <div className={`w-full bg-[var(--life-surface-2)] rounded-full overflow-hidden ${heightMap[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, percentage)}%`,
            background: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] text-[var(--life-text-muted)] font-mono">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

// SectionLabel Component
export function SectionLabel({ children, className = '' }) {
  return (
    <label className={`block font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[var(--life-text-muted)] mb-3 ${className}`}>
      {children}
    </label>
  );
}

// IconButton Component
export function IconBtn({ icon: Icon, label = '', onClick, size = 20, color = 'var(--life-accent)' }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity active:scale-90"
      title={label}
    >
      <Icon size={size} color={color} strokeWidth={2} />
      {label && <span className="text-[10px] font-mono text-[var(--life-text-dim)]">{label}</span>}
    </button>
  );
}

// SparkLine Component - Mini trend line chart
export function SparkLine({ data = [], color = 'var(--life-accent)', width = 88, height = 36 }) {
  if (!data || data.length === 0) {
    return <div style={{ width, height, background: 'var(--life-surface-2)', borderRadius: 8 }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Create SVG path
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = `M${points.join(' L')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="spark-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${pathD} L${width},${height} L0,${height} Z`} fill="url(#spark-gradient)" />
    </svg>
  );
}

// Pill Component - Small badge/chip
export function Pill({ label, color = 'var(--life-accent)', variant = 'solid' }) {
  const isOutline = variant === 'outline';

  return (
    <span
      className="inline-block px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{
        background: isOutline ? `${color}22` : color,
        color: isOutline ? color : '#000',
        border: isOutline ? `1px solid ${color}` : 'none',
      }}
    >
      {label}
    </span>
  );
}

// StatBox Component - Display metric + label
export function StatBox({ label, value, icon: Icon = null, color = 'var(--life-accent)' }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} color={color} />}
        <span className="text-[9px] text-[var(--life-text-muted)] font-mono uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>
      <div className="text-[18px] font-black font-mono text-[var(--life-text)]">
        {value}
      </div>
    </div>
  );
}

export default {
  Card,
  Money,
  ProgressBar,
  SectionLabel,
  IconBtn,
  SparkLine,
  Pill,
  StatBox,
};
