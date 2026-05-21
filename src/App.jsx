import { useState, useCallback, useMemo, Component, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { KPIGrid } from './components/kpi/KPIGrid';
import { ScenarioEngine } from './components/scenario/ScenarioEngine';
import { NigeriaScreen } from './components/nigeria/NigeriaScreen';
import { MCScreen } from './components/montecarlo/MCScreen';
import { ValueCreationScreen } from './components/value/ValueCreationScreen';
import { RoadmapScreen } from './components/roadmap/RoadmapScreen';
import { calcHedgedVsUnhedged, calcHedgeValueCrore } from './lib/calculations';

const COMBINED_DEFAULTS = { ironOreShock: 0.15, inrRate: 88, freightShock: 0.20 };

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[BAML RCC] Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-lg p-6 text-center"
          style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)' }}
        >
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--red)' }}>
            Component Error
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            {this.state.error?.message || 'An unexpected error occurred in this panel.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{ background: 'var(--red-border)', color: 'white' }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TAB_META = {
  overview:   { title: 'Board Overview',          sub: 'Live KPI scorecard · RAG-tracked across 10 metrics' },
  scenario:   { title: 'Scenario Engine',         sub: 'Real-time stress testing across iron ore, FX, and freight' },
  nigeria:    { title: 'Nigeria Liquidity',       sub: 'Hard-currency buffer monitoring · 12-month forecast' },
  montecarlo: { title: 'CFaR Simulator',          sub: 'Monte Carlo cash-flow at risk · 5th percentile floor' },
  value:      { title: 'Value Creation',          sub: 'Five-lever NPV analysis at 15% cost of capital' },
  roadmap:    { title: '12-Month Roadmap',        sub: 'Workstream Gantt across 3 phases with M6 phase gate' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cfar5th, setCfar5th] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const defaultResults = useMemo(() =>
    calcHedgedVsUnhedged(COMBINED_DEFAULTS.ironOreShock, COMBINED_DEFAULTS.inrRate, COMBINED_DEFAULTS.freightShock),
    []
  );

  const hedgeValue = useMemo(() =>
    calcHedgeValueCrore(COMBINED_DEFAULTS.ironOreShock, COMBINED_DEFAULTS.inrRate, COMBINED_DEFAULTS.freightShock),
    []
  );

  const handleCfarUpdate = useCallback((p5) => setCfar5th(p5), []);

  const meta = TAB_META[activeTab];

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} hedgeValue={hedgeValue} theme={theme} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />

      {/* Print-only header */}
      <div className="hidden print:block p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-teal-soft)' }}>
          BAML Risk Command Center — Board Snapshot
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          EY CAFTA Case Championship 2026 · {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </p>
      </div>

      <main className="px-4 lg:px-6 py-5 max-w-[1600px] mx-auto">
        {/* Tab header */}
        <div className="mb-5 no-print flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] font-semibold tracking-tight leading-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {meta.title}
              </h1>
              <span className="text-[10.5px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-md"
                style={{ background: 'var(--accent-teal-bg)', color: 'var(--accent-teal-soft)', border: '1px solid var(--accent-teal-border)' }}>
                EY CAFTA 2026
              </span>
            </div>
            <p className="text-[12px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {meta.sub}
            </p>
          </div>
          <div className="text-right text-[11px] hidden md:block leading-tight">
            <div style={{ color: 'var(--text-secondary)' }}>Bharat Advanced Materials Limited</div>
            <div className="font-mono tabular-nums mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Masters Union · {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.998 }}
            transition={{ type: 'spring', stiffness: 90, damping: 22, mass: 0.85 }}
          >
            {activeTab === 'overview' && (
              <ErrorBoundary>
                <KPIGrid
                  hedgedMargin={defaultResults.hedged.margin}
                  unhedgedMargin={defaultResults.unhedged.margin}
                  cfar5th={cfar5th}
                  onNavigate={setActiveTab}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'scenario' && (
              <ErrorBoundary>
                <ScenarioEngine onHedgeValueChange={() => {}} />
              </ErrorBoundary>
            )}

            {activeTab === 'nigeria' && (
              <ErrorBoundary>
                <NigeriaScreen />
              </ErrorBoundary>
            )}

            {activeTab === 'montecarlo' && (
              <ErrorBoundary>
                <MCScreen onCfarUpdate={handleCfarUpdate} />
              </ErrorBoundary>
            )}

            {activeTab === 'value' && (
              <ErrorBoundary>
                <ValueCreationScreen />
              </ErrorBoundary>
            )}

            {activeTab === 'roadmap' && (
              <ErrorBoundary>
                <RoadmapScreen />
              </ErrorBoundary>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="no-print mt-10 px-4 lg:px-6 py-5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center font-bold text-[11px]"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-teal), #0d9488)',
                    color: '#fff',
                  }}
                >B</div>
                <span className="text-[12.5px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  BAML Risk Command Center
                </span>
              </div>
              <p className="text-[11px] leading-relaxed max-w-md" style={{ color: 'var(--text-muted)' }}>
                Bharat Advanced Materials Limited · EY CAFTA Case Championship 2026 — 11th Edition · Masters Union
              </p>
            </div>
            <div className="text-[10.5px] font-mono tabular-nums leading-relaxed text-right hidden md:block" style={{ color: 'var(--text-faint)' }}>
              <div>10 sheets · 7,382 formulas · 1,000 MC paths</div>
              <div>SOFR 3.59% (NY Fed, 19 May 2026)</div>
              <div className="mt-1" style={{ color: 'var(--text-muted)' }}>Live · Tabular · Tabular nums</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
