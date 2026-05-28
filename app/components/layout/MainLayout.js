import React from 'react';
import { Home, Wallet, Store, Activity, Settings, WifiOff, Sun, Moon, Flame } from 'lucide-react';

const TAB_META = {
  home: { label: 'Inicio', accent: 'var(--life-accent)' },
  finanzas: { label: 'Wallet', accent: 'var(--life-wallet)' },
  ventas: { label: 'Negocio', accent: 'var(--life-business)' },
  salud: { label: 'Salud', accent: 'var(--life-health)' },
  settings: { label: 'Perfil', accent: 'var(--life-text-dim)' },
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

  const activeMeta = TAB_META[activeTab] || TAB_META.finanzas;
  const currentTime = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  const currentDate = formatHeaderDate(now);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-3 transition-colors duration-500">
      <div className="life-grid-bg" />

      <div className="relative z-10" style={{ transform: `scale(${shellScale})`, transformOrigin: 'center center' }}>
        <div className="life-device-shell relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[55px] shadow-2xl">
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
              className="fixed left-1/2 top-10 z-[200] -translate-x-1/2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-2xl"
              style={{ background: toast.type === 'error' ? '#f43f5e' : activeMeta.accent }}
            >
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
