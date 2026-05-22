import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Sun, Moon, Menu, X } from 'lucide-react';
import { ValueTicker } from '../shared/ValueTicker';

function LiveDot({ color }) {
  return (
    <span className="relative inline-flex w-2.5 h-2.5 items-center justify-center" aria-hidden="true">
      <span
        className="absolute inset-0 rounded-full live-ring"
        style={{ background: color }}
      />
      <span
        className="relative w-1.5 h-1.5 rounded-full pulse-dot"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
    </span>
  );
}

export function Navbar({ activeTab, onTabChange, hedgeValue, theme, onThemeToggle }) {
  const [sofr, setSofr] = useState(3.59);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    fetch('https://markets.newyorkfed.org/api/rates/sofr/last/1.json')
      .then(r => r.json())
      .then(data => {
        const rate = data?.refRates?.[0]?.percentRate;
        if (rate) setSofr(parseFloat(rate));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tabs = [
    { id: 'overview',   label: 'Overview',         short: 'Overview' },
    { id: 'scenario',   label: 'Scenario Engine',  short: 'Scenario' },
    { id: 'nigeria',    label: 'Nigeria',          short: 'Nigeria' },
    { id: 'montecarlo', label: 'CFaR Simulator',   short: 'CFaR' },
    { id: 'value',      label: 'Value Creation',   short: 'Value' },
    { id: 'roadmap',    label: 'Roadmap',          short: 'Roadmap' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: 'var(--bg-nav)',
        backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'blur(12px) saturate(140%)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-accent)' : 'var(--border)'}`,
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between" style={{ height: 'var(--nav-h)' }}>
          {/* ─── Logo + brand ─────────────────────────────── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 flex items-center justify-center font-normal text-[15px] shrink-0"
              style={{
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '-0.02em',
              }}
            >
              B
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="font-semibold text-[13.5px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                BAML
                <span className="ml-1.5 font-normal" style={{ color: 'var(--text-muted)' }}>·</span>
                <span className="ml-1.5 font-normal text-[11.5px]" style={{ color: 'var(--text-muted)' }}>Risk Command Center</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.14em] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                EY CAFTA 2026
              </div>
            </div>
          </div>

          {/* ─── Center: tabs (segmented control) ─────────── */}
          <div className="hidden md:flex flex-1 justify-center px-3">
            <div
              className="inline-flex p-1 items-center"
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '9999px',
                gap: '2px',
              }}
            >
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className="relative px-2.5 lg:px-3 py-1.5 text-[12px] lg:text-[13px] font-normal rounded-full transition-colors whitespace-nowrap"
                    style={{
                      color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0"
                        style={{
                          background: 'var(--text-primary)',
                          borderRadius: '9999px',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 lg:hidden">{tab.short}</span>
                    <span className="relative z-10 hidden lg:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Right: live data + theme toggle ──────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* SGX ticker */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: 'var(--amber-soft)',
              }}
            >
              <LiveDot color="var(--amber)" />
              <span className="font-semibold tracking-tight">SGX Fe62</span>
              <span className="tabular-nums">$110</span>
            </div>
            {/* SOFR */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono"
              style={{
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                color: 'var(--green-soft)',
              }}
            >
              <LiveDot color="var(--green)" />
              <span className="font-semibold tracking-tight">SOFR</span>
              <span className="tabular-nums">{sofr.toFixed(2)}%</span>
            </div>
            {/* Hedge ticker */}
            {hedgeValue > 0 && (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono"
                style={{
                  background: 'var(--accent-teal-bg)',
                  border: '1px solid var(--accent-teal-border)',
                  color: 'var(--accent-teal-soft)',
                }}
              >
                <Activity size={11} />
                <span className="font-semibold tracking-tight">Hedge ₹</span>
                <ValueTicker value={hedgeValue} />
                <span>Cr</span>
              </div>
            )}
            {/* Timestamp */}
            <div className="hidden 2xl:block text-[10.5px] font-mono tabular-nums" style={{ color: 'var(--text-faint)' }}>
              {now} IST
            </div>
            {/* Theme toggle */}
            <button
              onClick={onThemeToggle}
              className="p-1.5 rounded-md transition-all"
              style={{
                color: 'var(--text-muted)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'var(--border-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-md"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* ─── Mobile menu ─────────────────────────────────── */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-3 pt-1 grid grid-cols-2 gap-1.5"
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); setMenuOpen(false); }}
                  className="text-left px-3 py-2 text-[13px] rounded-md transition-colors"
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-teal-bg)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? 'var(--accent-teal-border)' : 'var(--border)'}`,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
            <div className="col-span-2 mt-1 px-3 py-2 flex items-center justify-between text-[11px] font-mono rounded-md"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
                SOFR <span className="tabular-nums" style={{ color: 'var(--green-soft)' }}>{sofr.toFixed(2)}%</span>
              </span>
              <span>SGX <span className="tabular-nums" style={{ color: 'var(--amber-soft)' }}>$110</span></span>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
