import React from 'react';
import { Home, Wallet, Store, Activity, Settings, WifiOff, Sun, Moon, Flame, Palette } from 'lucide-react';

const TAB_META = {
  home: { label: 'Inicio', accent: 'var(--life-accent)' },
  finanzas: { label: 'Wallet', accent: 'var(--life-wallet)' },
  ventas: { label: 'Negocio', accent: 'var(--life-business)' },
  salud: { label: 'Salud', accent: 'var(--life-health)' },
  settings: { label: 'Perfil', accent: 'var(--life-text-dim)' },
};

const ACCENT_COLORS = {
  light: ['#65a30d', '#0284c7', '#e11d48', '#d97706', '#7c3aed'],
  dark: ['#bef264', '#7dd3fc', '#fb7185', '#fbbf24', '#a78bfa'],
};

function formatHeaderDate(now) {
  const day = now.toLocaleDateString('es-CO', { weekday: 'short' }).toUpperCase().replace('.', '');
  const date = now.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', '');
  return `${date} · ${day}`;
}

export default function MainLayout({
  children,
  userStats,
  isOnline,
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  toast
}) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'finanzas', icon: Wallet, label: 'Wallet' },
    { id: 'ventas', icon: Store, label: 'Negocio' },
    { id: 'salud', icon: Activity, label: 'Salud' },
    { id: 'settings', icon: Settings, label: 'Perfil' },
  ];

  const [shellScale, setShellScale] = React.useState(1);
  const [now, setNow] = React.useState(() => new Date());
  const [accentColor, setAccentColor] = React.useState(() => {
    if (typeof window === 'undefined') return darkMode ? '#bef264' : '#65a30d';
    const stored = localStorage.getItem('lifeos-accent-color');
    return stored || (darkMode ? '#bef264' : '#65a30d');
  });
  const [animationSpeed, setAnimationSpeed] = React.useState(() => {
    if (typeof window === 'undefined') return 'normal';
    return localStorage.getItem('lifeos-animation-speed') || 'normal';
  });
  const [showTweaks, setShowTweaks] = React.useState(false);

  React.useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  React.useEffect(() => {
    const computeScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = (vw - 24) / 402;
      const sy = (vh - 24) / 874;
      setShellScale(Math.min(1, sx, sy));
    };

    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lifeos-accent-color', accentColor);
    document.documentElement.style.setProperty('--life-accent', accentColor);
    document.documentElement.style.setProperty('--life-health', accentColor);
  }, [accentColor]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lifeos-animation-speed', animationSpeed);
    const speedMap = {
      slow: 1.5,
      normal: 1,
      fast: 0.6,
    };
    document.documentElement.style.setProperty('--animation-speed-multiplier', speedMap[animationSpeed] || 1);
  }, [animationSpeed]);

  const activeMeta = TAB_META[activeTab] || TAB_META.finanzas;
  const currentTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  const currentDate = formatHeaderDate(now);

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden p-3 transition-colors duration-500 anim-speed-${animationSpeed}`}>
      <div className="life-grid-bg" />

      <div className="relative z-10" style={{ transform: `scale(${shellScale})`, transformOrigin: 'center center' }}>
        <div className="life-device-shell relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[55px]" style={{
          boxShadow: `
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 25px 50px -12px rgba(0, 0, 0, 0.15),
            ${activeMeta.accent}33 0px 0px 40px
          `
        }}>
          <div className="px-6 pb-3 pt-12">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 grid-cols-2 gap-[2px] rounded-[8px] p-[3px]" style={{ background: activeMeta.accent }}>
                  <span className="rounded-[2px] bg-black/85" />
                  <span className="rounded-[2px] bg-black/85" />
                  <span className="rounded-[2px] bg-black/85" />
                  <span className="rounded-[2px] bg-black/85" />
                </div>
                <div>
                  <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[var(--life-text)]">Life OS</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--life-accent)]">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                    {userStats?.currentStreak > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:color-mix(in_srgb,var(--life-business)_18%,transparent)] px-2 py-0.5 font-mono text-[8px] font-black uppercase tracking-[0.15em] text-[var(--life-business)]">
                        <Flame size={9} className="fill-[var(--life-business)] text-[var(--life-business)]" />
                        {userStats.currentStreak}D
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--life-text-muted)]">{currentDate}</p>
                <div className="mt-0.5 flex items-center justify-end gap-2">
                  {!isOnline && <WifiOff size={12} className="text-rose-500" />}
                  <p className="font-mono text-lg font-black tracking-tight text-[var(--life-text)]">{currentTime}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-[31px] font-semibold capitalize tracking-[-0.04em] text-[var(--life-text)]">{activeMeta.label}</h1>
              <button onClick={() => setDarkMode(!darkMode)} className="life-text-dim transition-transform active:scale-90">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-32 pt-2" style={{ scrollbarWidth: 'none' }}>
            {children}
          </div>

          <div className="z-50 border-t border-[var(--life-border)] bg-[color:color-mix(in_srgb,var(--life-surface)_92%,transparent)] px-2 pb-5 pt-2 backdrop-blur-md">
            <div className="flex gap-1">
              {navItems.map((tab) => {
                const tabActive = activeTab === tab.id;
                const tabAccent = (TAB_META[tab.id] || TAB_META.finanzas).accent;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex h-[50px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[14px] transition-all"
                    style={{
                      background: tabActive ? tabAccent : 'transparent',
                      color: tabActive ? '#000' : 'var(--life-text-dim)'
                    }}
                  >
                    <tab.icon size={18} strokeWidth={2.3} />
                    <span className="text-[9px] font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {toast && (
            <div
              className={`fixed left-1/2 top-10 z-[200] -translate-x-1/2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-2xl ${
                toast.type === 'error' ? 'animate-pulse-ring' : 'bounce-in'
              }`}
              style={{ background: toast.type === 'error' ? '#f43f5e' : activeMeta.accent }}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>

      {/* Tweaks Panel */}
      <div className="fixed right-0 top-0 h-screen z-40 transition-all duration-300" style={{ transform: showTweaks ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="h-full w-64 overflow-y-auto p-4 space-y-6" style={{
          background: `color-mix(in srgb, var(--life-surface) 95%, transparent)`,
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid color-mix(in srgb, var(--life-border) 50%, transparent)`,
          boxShadow: `-20px 0 40px rgba(0, 0, 0, 0.2), inset 1px 0 1px rgba(255, 255, 255, 0.1)`
        }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-xs font-black uppercase tracking-[0.15em] text-[var(--life-text)]">Tweaks</h3>
            <button
              onClick={() => setShowTweaks(false)}
              className="text-[var(--life-text-muted)] hover:text-[var(--life-text)]"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-[var(--life-text-muted)] block mb-3">
              Tema
            </label>
            <div className="flex gap-2">
              {['light', 'dark'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setDarkMode(mode === 'dark')}
                  className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
                    (darkMode ? 'dark' : 'light') === mode
                      ? 'bg-[var(--life-accent)] text-black'
                      : 'bg-[var(--life-surface-2)] text-[var(--life-text-dim)]'
                  }`}
                >
                  {mode === 'light' ? '☀️' : '🌙'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-[var(--life-text-muted)] block mb-3">
              Acento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_COLORS[darkMode ? 'dark' : 'light'].map(color => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className="h-10 rounded-lg transition-all border-2"
                  style={{
                    background: color,
                    borderColor: accentColor === color ? 'var(--life-text)' : 'transparent'
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-[var(--life-text-muted)] block mb-3">
              Velocidad de animaciones
            </label>
            <div className="flex gap-2">
              {['slow', 'normal', 'fast'].map(speed => (
                <button
                  key={speed}
                  onClick={() => setAnimationSpeed(speed)}
                  className={`flex-1 py-2 px-2 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                    animationSpeed === speed
                      ? 'bg-[var(--life-accent)] text-black'
                      : 'bg-[var(--life-surface-2)] text-[var(--life-text-dim)]'
                  }`}
                >
                  {speed === 'slow' ? '🐢' : speed === 'normal' ? '⚡' : '🚀'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--life-border)]">
            <p className="font-mono text-[8px] text-[var(--life-text-muted)] leading-tight">
              Personaliza tu Life OS con estos tweaks. Los cambios se guardan automáticamente.
            </p>
          </div>
        </div>
        <div
          className="absolute inset-0 -z-10 opacity-50"
          onClick={() => setShowTweaks(false)}
          style={{ background: 'rgba(0,0,0,0.3)' }}
        />
      </div>

      {/* Tweaks Toggle Button */}
      <button
        onClick={() => setShowTweaks(!showTweaks)}
        className="fixed right-4 bottom-20 z-30 w-12 h-12 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{
          background: 'var(--life-accent)',
          boxShadow: `
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 0 20px var(--life-accent)99
          `
        }}
        title="Tweaks"
      >
        <Palette size={20} color="#000" strokeWidth={2} />
      </button>
    </div>
  );
}
