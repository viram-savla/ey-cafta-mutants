import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { KPIGrid } from './components/kpi/KPIGrid';
import { ScenarioEngine } from './components/scenario/ScenarioEngine';
import { NigeriaScreen } from './components/nigeria/NigeriaScreen';
import { MCScreen } from './components/montecarlo/MCScreen';
import { calcHedgedVsUnhedged, calcHedgeValueCrore } from './lib/calculations';

const COMBINED_DEFAULTS = { ironOreShock: 0.15, inrRate: 88, freightShock: 0.20 };

function ErrorBoundary({ children }) {
  return children;
}

const TAB_LABELS = {
  overview: 'Board Overview',
  scenario: 'Scenario Engine',
  nigeria: 'Nigeria Liquidity',
  montecarlo: 'CFaR Simulator',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cfar5th, setCfar5th] = useState(null);

  const defaultResults = useMemo(() =>
    calcHedgedVsUnhedged(COMBINED_DEFAULTS.ironOreShock, COMBINED_DEFAULTS.inrRate, COMBINED_DEFAULTS.freightShock),
    []
  );

  const hedgeValue = useMemo(() =>
    calcHedgeValueCrore(COMBINED_DEFAULTS.ironOreShock, COMBINED_DEFAULTS.inrRate, COMBINED_DEFAULTS.freightShock),
    []
  );

  const handleCfarUpdate = useCallback((p5) => setCfar5th(p5), []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} hedgeValue={hedgeValue} />

      {/* Print-only header */}
      <div className="hidden print:block p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>
          BAML Risk Command Center — Board Snapshot
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          EY CAFTA Case Championship 2026 · {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </p>
      </div>

      <main className="px-4 md:px-6 py-4 max-w-screen-xl mx-auto">
        {/* Tab header */}
        <div className="mb-4 no-print">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {TAB_LABELS[activeTab]}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              EY CAFTA 2026
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Bharat Advanced Materials Limited · Masters Union · {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
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
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="no-print mt-8 px-4 md:px-6 py-4 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>BAML Risk Command Center · EY CAFTA Case Championship 2026 — 11th Edition · Masters Union</span>
          <span className="font-mono">Excel: 10 sheets · 7,382 formulas · Monte Carlo: 1,000 paths · SOFR: 3.59% (NY Fed, 19 May 2026)</span>
        </div>
      </footer>
    </div>
  );
}
