"use client";

import React from 'react';

/**
 * iOS Frame Component - Simulates iPhone 15 Pro frame
 * Optional visual wrapper for Life OS app
 * 
 * Usage:
 * <IOSFrame dark={darkMode}>
 *   <YourContent />
 * </IOSFrame>
 */
export function IOSFrame({ children, dark = true }) {
  return (
    <div className="relative" style={{ width: '390px', aspectRatio: '390 / 844' }}>
      {/* Outer frame shadow */}
      <div className="absolute inset-0 rounded-[55px] shadow-2xl" style={{ background: dark ? '#000' : '#fff' }} />

      {/* Notch */}
      <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 w-40 h-7 bg-black rounded-b-[28px]" />

      {/* Status bar indicators (left side) */}
      <div className="absolute left-4 top-3 z-20 text-white text-[10px] font-bold font-mono space-y-0.5">
        <div>●●●●●</div>
      </div>

      {/* Status bar indicators (right side) */}
      <div className="absolute right-4 top-3 z-20 text-white text-[9px] font-bold font-mono">
        <div>100%</div>
      </div>

      {/* Screen content */}
      <div className="absolute inset-[7px] rounded-[48px] overflow-hidden bg-[var(--life-surface)]" style={{ background: dark ? '#08090b' : '#f5f5f1' }}>
        {children}
      </div>

      {/* Home indicator */}
      <div className="absolute left-1/2 bottom-2 z-20 -translate-x-1/2 w-32 h-1 bg-black rounded-full" />

      {/* Side buttons decoration */}
      <div className="absolute -right-1 top-24 w-1 h-12 bg-gray-600 rounded-l-lg opacity-50" />
      <div className="absolute -left-1 top-32 w-1 h-8 bg-gray-600 rounded-r-lg opacity-50" />
      <div className="absolute -left-1 top-44 w-1 h-8 bg-gray-600 rounded-r-lg opacity-50" />
    </div>
  );
}

export default IOSFrame;
