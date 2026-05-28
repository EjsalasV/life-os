/**
 * Life OS Design System Tokens
 * Centralized design values for the entire application
 */

export const TOKENS_DARK = {
  mode: 'dark',
  // Surfaces
  bg: '#08090b',
  bgElev: '#101216',
  bgElev2: '#171a20',
  bgElev3: '#1f232b',
  surface: '#101216',
  surface2: '#171a20',
  surface3: '#1f232b',
  
  // Text
  text: '#f6f7f9',
  textDim: '#9097a3',
  textMute: '#5a606b',
  
  // Borders
  border: '#23262d',
  borderSoft: '#1a1d23',
  
  // Accent colors
  lime: '#bef264',
  limeDeep: '#a3e635',
  limeGlow: 'rgba(190,242,100,0.18)',
  cyan: '#7dd3fc',
  amber: '#fbbf24',
  pink: '#fb7185',
  red: '#f87171',
  
  // Module colors
  wallet: '#7dd3fc',
  business: '#fbbf24',
  health: '#bef264',
  
  // Background gradients
  appBg: 'radial-gradient(ellipse at top, #0a0d10 0%, #050608 60%, #000 100%)',
} as const;

export const TOKENS_LIGHT = {
  mode: 'light',
  // Surfaces
  bg: '#f5f5f1',
  bgElev: '#ffffff',
  bgElev2: '#f0efea',
  bgElev3: '#e6e5df',
  surface: '#ffffff',
  surface2: '#f0efea',
  surface3: '#e6e5df',
  
  // Text
  text: '#0e0f12',
  textDim: '#5c6068',
  textMute: '#8a8e95',
  
  // Borders
  border: '#d8d6cf',
  borderSoft: '#e9e7e1',
  
  // Accent colors
  lime: '#65a30d',
  limeDeep: '#4d7c0f',
  limeGlow: 'rgba(101,163,13,0.18)',
  cyan: '#0284c7',
  amber: '#d97706',
  pink: '#e11d48',
  red: '#dc2626',
  
  // Module colors
  wallet: '#0284c7',
  business: '#d97706',
  health: '#65a30d',
  
  // Background gradients
  appBg: 'radial-gradient(ellipse at top, #fafaf6 0%, #ebeae3 60%, #d9d7cf 100%)',
} as const;

export const FONTS = {
  ui: '"Geist", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  pixel: '"Silkscreen", "VT323", monospace',
  pixelSoft: '"Pixelify Sans", "VT323", monospace',
} as const;

// Accent color palettes for theme switching
export const ACCENT_DARK = [
  '#bef264', // lime
  '#7dd3fc', // cyan
  '#fb7185', // pink
  '#fbbf24', // amber
  '#a78bfa', // purple
] as const;

export const ACCENT_LIGHT = [
  '#65a30d', // lime
  '#0284c7', // cyan
  '#e11d48', // pink
  '#d97706', // amber
  '#7c3aed', // purple
] as const;

export type ThemeMode = 'light' | 'dark';
export type TokensType = typeof TOKENS_DARK | typeof TOKENS_LIGHT;

export function getTheme(mode: ThemeMode): TokensType {
  return mode === 'light' ? TOKENS_LIGHT : TOKENS_DARK;
}

export function getAccentColors(mode: ThemeMode): readonly string[] {
  return mode === 'light' ? ACCENT_LIGHT : ACCENT_DARK;
}
