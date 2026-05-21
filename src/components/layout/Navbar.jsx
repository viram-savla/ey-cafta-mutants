import { useEffect, useState } from 'react';
import { Activity, Sun, Moon } from 'lucide-react';
import { ValueTicker } from '../shared/ValueTicker';
import { Badge } from '../ui/badge';

export function Navbar({ activeTab, onTabChange, hedgeValue, theme, onThemeToggle }) {
  const [sofr, setSofr] = useState(3.59);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'scenario', label: 'Scenario Engine' },
    { id: 'nigeria', label: 'Nigeria' },
    { id: 'montecarlo', label: 'CFaR Simulator' },
    { id: 'value', label: 'Value Creation' },
    { id: 'roadmap', label: 'Roadmap' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-sm" style={{ background: 'var(--amber-bg)', color: 'var(--accent-gold)', border: '1px solid var(--amber-border)' }}>
              B
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm tracking-wider" style={{ color: 'var(--accent-gold)' }}>BAML</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Risk Command Center</div>
            </div>
          </div>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="px-3 py-1.5 text-sm rounded transition-colors"
                style={{
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: activeTab === tab.id ? 'var(--bg-card-hover)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* SGX Iron Ore badge */}
            <Badge variant="gold" className="hidden lg:inline-flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--amber)' }} />
              SGX Fe62 $110
            </Badge>
            {/* SOFR badge */}
            <Badge variant="green" className="hidden sm:inline-flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
              SOFR {sofr.toFixed(2)}%
            </Badge>
            {/* Hedge ticker */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--accent-gold)' }}>
              <Activity size={12} />
              <span>Hedges: ₹</span>
              <ValueTicker value={hedgeValue} />
              <span>Cr</span>
            </div>
            {/* Timestamp */}
            <div className="hidden xl:block text-xs" style={{ color: 'var(--text-muted)' }}>{now} IST</div>
            {/* Theme toggle */}
            <button
              onClick={onThemeToggle}
              className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {/* Mobile hamburger */}
            <button className="md:hidden p-1.5 rounded" style={{ color: 'var(--text-secondary)' }} onClick={() => setMenuOpen(!menuOpen)}>
              <div className="space-y-1">
                <span className="block w-5 h-0.5" style={{ background: 'currentColor' }} />
                <span className="block w-5 h-0.5" style={{ background: 'currentColor' }} />
                <span className="block w-5 h-0.5" style={{ background: 'currentColor' }} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm rounded"
                style={{
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: activeTab === tab.id ? 'var(--bg-card-hover)' : 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
            <div className="px-3 py-2 flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--green)' }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
              SOFR {sofr.toFixed(2)}% · SGX Fe62 $110
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
