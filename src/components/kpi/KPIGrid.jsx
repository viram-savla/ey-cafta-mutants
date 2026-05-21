import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KPICard } from './KPICard';
import { AlertBanner } from './AlertBanner';
import { MODEL } from '../../lib/constants';
import { getRAGStatus, calcIC } from '../../lib/calculations';
import { Printer, X, Package, TrendingDown } from 'lucide-react';

function buildKPIs(hedgedMargin, unhedgedMargin, cfar5th) {
  const ic = calcIC(MODEL.ebitda, MODEL.annualInterestInr);
  return [
    {
      id: 'ebitdaHedged',
      label: 'EBITDA Margin (Hedged)',
      value: `${(hedgedMargin * 100).toFixed(2)}%`,
      target: '≥ 11.0%',
      status: getRAGStatus('ebitdaHedged', hedgedMargin),
      tab: 'scenario',
    },
    {
      id: 'ebitdaUnhedged',
      label: 'EBITDA Margin (Unhedged)',
      value: `${(unhedgedMargin * 100).toFixed(2)}%`,
      target: '≥ 11.0%',
      status: getRAGStatus('ebitdaUnhedged', unhedgedMargin),
      tab: 'scenario',
    },
    {
      id: 'hedgeCoverage',
      label: 'Commodity Hedge Coverage',
      value: '80%',
      target: '≥ 80%',
      status: getRAGStatus('hedgeCoverage', 0.80),
      tab: 'scenario',
    },
    {
      id: 'wahr',
      label: 'FX WAHR',
      value: `${MODEL.wahr.toFixed(2)}`,
      target: '83.50–85.50',
      status: getRAGStatus('wahr', MODEL.wahr),
      tab: 'scenario',
    },
    {
      id: 'inventoryDays',
      label: 'Inventory Days',
      value: `${MODEL.inventoryDaysCurrent} days`,
      target: '≤ 55 days',
      status: getRAGStatus('inventoryDays', MODEL.inventoryDaysCurrent),
      tab: 'overview',
    },
    {
      id: 'nigeriaBuffer',
      label: 'Nigeria Buffer',
      value: `${MODEL.nigeriaBufferDays} days`,
      target: '≥ 45 days',
      status: getRAGStatus('nigeriaBuffer', MODEL.nigeriaBufferDays),
      tab: 'nigeria',
    },
    {
      id: 'ic',
      label: 'Interest Coverage',
      value: `${ic.toFixed(1)}×`,
      target: '≥ 2.0×',
      status: getRAGStatus('ic', ic),
      tab: 'overview',
    },
    {
      id: 'debtMaturity',
      label: 'Debt Maturity',
      value: `${MODEL.loanMaturityYears} years`,
      target: '≥ 3 years',
      status: getRAGStatus('debtMaturity', MODEL.loanMaturityYears),
      tab: 'overview',
    },
    {
      id: 'sofr',
      label: 'SOFR All-in Rate',
      value: `${(MODEL.allInRate * 100).toFixed(2)}%`,
      target: '< 6.0%',
      status: getRAGStatus('sofr', MODEL.allInRate),
      tab: 'overview',
    },
    {
      id: 'cfar',
      label: 'CFaR (5th %ile)',
      value: cfar5th ? `${(cfar5th * 100).toFixed(1)}%` : '~8.5%',
      target: '≥ 8.0%',
      status: getRAGStatus('cfar', cfar5th || 0.085),
      tab: 'montecarlo',
    },
  ];
}

const INVENTORY_ITEMS = [
  { label: 'DRI Buffer', current: 18, target: 12, dailyCost: MODEL.dailyRmCost, color: '#3b82f6' },
  { label: 'Iron Ore Pellets', current: 24, target: 18, dailyCost: MODEL.dailyRmCost, color: '#10b981' },
  { label: 'Coal', current: 28, target: 25, dailyCost: MODEL.dailyRmCost, color: '#f59e0b' },
  { label: 'MRO / Consumables', current: null, target: null, dailyCost: null, fixed: 24, color: '#8b5cf6' },
];

function InventoryDrilldown({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 12 }}
        className="rounded-lg p-5 w-full max-w-lg"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={16} style={{ color: '#3b82f6' }} />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Inventory Optimisation — WC Release</span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Current Days', value: `${MODEL.inventoryDaysCurrent}d`, color: 'var(--red)' },
            { label: 'Target Days', value: `${MODEL.inventoryDaysTarget}d`, color: 'var(--green)' },
            { label: 'WC Release', value: `₹${MODEL.wcRelease} Cr`, color: 'var(--accent-gold)' },
          ].map(item => (
            <div key={item.label} className="text-center p-2 rounded" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              <div className="font-mono font-bold mt-0.5" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Savings Breakdown</div>
        <div className="space-y-2">
          {INVENTORY_ITEMS.map(item => {
            const release = item.fixed ?? Math.round((item.current - item.target) * item.dailyCost);
            const reduction = item.current ? item.current - item.target : null;
            return (
              <div key={item.label} className="flex items-center gap-3 p-2 rounded text-xs"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <div className="w-2 h-6 rounded" style={{ background: item.color, opacity: 0.8 }} />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                  {reduction !== null && (
                    <div style={{ color: 'var(--text-muted)' }}>{item.current}d → {item.target}d (−{reduction} days × ₹{item.dailyCost.toFixed(1)} Cr/day)</div>
                  )}
                  {item.fixed && <div style={{ color: 'var(--text-muted)' }}>Rationalisation + standardisation</div>}
                </div>
                <div className="font-mono font-bold" style={{ color: item.color }}>₹{release} Cr</div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-3 flex items-center justify-between p-2 rounded"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--amber-border)' }}>
          <div className="flex items-center gap-2 text-xs">
            <TrendingDown size={12} style={{ color: 'var(--accent-gold)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Total WC Release (Year 1 one-time cash inflow)</span>
          </div>
          <div className="font-mono font-bold" style={{ color: 'var(--accent-gold)' }}>₹{MODEL.wcRelease} Cr</div>
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          Daily raw material cost basis: ₹{MODEL.dailyRmCost.toFixed(2)} Cr/day (Revenue ₹{MODEL.revenue} Cr ÷ 365 × RM cost ratio ~48.7%)
        </p>
      </motion.div>
    </motion.div>
  );
}

export function KPIGrid({ hedgedMargin, unhedgedMargin, cfar5th, onNavigate }) {
  const kpis = buildKPIs(hedgedMargin, unhedgedMargin, cfar5th);
  const [showInventoryDrill, setShowInventoryDrill] = useState(false);

  const handlePrint = () => window.print();

  return (
    <div>
      <AlertBanner kpis={kpis} />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Board KPI Scorecard — Live
        </h2>
        <button
          onClick={handlePrint}
          className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', color: 'var(--text-secondary)' }}
        >
          <Printer size={12} />
          Board Snapshot
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <KPICard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            target={kpi.target}
            status={kpi.status}
            delay={i * 0.05}
            onClick={kpi.id === 'inventoryDays'
              ? () => setShowInventoryDrill(true)
              : onNavigate ? () => onNavigate(kpi.tab) : undefined}
          />
        ))}
      </div>

      <AnimatePresence>
        {showInventoryDrill && <InventoryDrilldown onClose={() => setShowInventoryDrill(false)} />}
      </AnimatePresence>

      {/* Board floor compliance bar */}
      <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Board Floor Compliance</span>
          <span className="font-mono" style={{ color: 'var(--green)' }}>
            {(hedgedMargin * 100).toFixed(2)}% hedged vs 11.0% floor · +{((hedgedMargin - 0.11) * 10000).toFixed(0)}bps buffer
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-accent)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(hedgedMargin / 0.14 * 100, 100)}%`, background: 'linear-gradient(90deg, var(--green-border), var(--green))' }}
          />
          {/* Board floor tick at 11/14 = 78.6% */}
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{ left: `${0.11 / 0.14 * 100}%`, background: 'var(--red)', boxShadow: '0 0 4px var(--red)' }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>9.0%</span>
          <span style={{ color: 'var(--red)' }}>Board Floor: 11.0%</span>
          <span>14.0%</span>
        </div>
      </div>
    </div>
  );
}
