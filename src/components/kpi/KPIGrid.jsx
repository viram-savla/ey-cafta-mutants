import { useState } from 'react';
import { motion } from 'framer-motion';
import { KPICard } from './KPICard';
import { AlertBanner } from './AlertBanner';
import { MODEL } from '../../lib/constants';
import { getRAGStatus, calcIC } from '../../lib/calculations';
import { Printer, Package, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../ui/dialog';

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
      tooltip: `EBITDA ÷ Revenue at 80% hedge ratio · Combined shock: ₹${Math.round(hedgedMargin * MODEL.revenue)} Cr ÷ ₹${MODEL.revenue} Cr`,
    },
    {
      id: 'ebitdaUnhedged',
      label: 'EBITDA Margin (Unhedged)',
      value: `${(unhedgedMargin * 100).toFixed(2)}%`,
      target: '≥ 11.0%',
      status: getRAGStatus('ebitdaUnhedged', unhedgedMargin),
      tab: 'scenario',
      tooltip: `EBITDA ÷ Revenue at 0% hedge · ${unhedgedMargin < 0.11 ? `Board floor BREACH by ${((0.11 - unhedgedMargin) * 10000).toFixed(0)}bps` : `+${((unhedgedMargin - 0.11) * 10000).toFixed(0)}bps above floor`}`,
    },
    {
      id: 'hedgeCoverage',
      label: 'Commodity Hedge Coverage',
      value: '80%',
      target: '≥ 80%',
      status: getRAGStatus('hedgeCoverage', 0.80),
      tab: 'scenario',
      tooltip: '0–3M: 80% via SGX Futures · 3–6M: 50% via FFA Collar · 6–12M: 20% via Participating Forward',
    },
    {
      id: 'wahr',
      label: 'FX WAHR',
      value: `₹${MODEL.wahr.toFixed(2)}/USD`,
      target: '83.50–85.50',
      status: getRAGStatus('wahr', MODEL.wahr),
      tab: 'scenario',
      tooltip: `Weighted Average Hedge Rate across USD 140M net-long position · 3-bucket ladder · Band: ₹${MODEL.wahRangeLow}–${MODEL.wahRangeHigh}`,
    },
    {
      id: 'inventoryDays',
      label: 'Inventory Days',
      value: `${MODEL.inventoryDaysCurrent} days`,
      target: '≤ 55 days',
      status: getRAGStatus('inventoryDays', MODEL.inventoryDaysCurrent),
      tab: 'overview',
      tooltip: `Current ${MODEL.inventoryDaysCurrent}d vs target ${MODEL.inventoryDaysTarget}d · Click to see ₹${MODEL.wcRelease} Cr WC release breakdown`,
    },
    {
      id: 'nigeriaBuffer',
      label: 'Nigeria Buffer',
      value: `${MODEL.nigeriaBufferDays} days`,
      target: '≥ 45 days',
      status: getRAGStatus('nigeriaBuffer', MODEL.nigeriaBufferDays),
      tab: 'nigeria',
      tooltip: `USD ${MODEL.nigeriaBuffer}M ÷ USD ${MODEL.nigeriaMonthlyImport}M/month × 30 = ${MODEL.nigeriaBufferDays} days · Policy floor: ${MODEL.nigeriaGreenFloor} days`,
    },
    {
      id: 'ic',
      label: 'Interest Coverage',
      value: `${ic.toFixed(1)}×`,
      target: '≥ 2.0×',
      status: getRAGStatus('ic', ic),
      tab: 'overview',
      tooltip: `EBITDA ÷ Annual Interest = ₹${MODEL.ebitda} Cr ÷ ₹${MODEL.annualInterestInr} Cr = ${ic.toFixed(1)}×`,
    },
    {
      id: 'debtMaturity',
      label: 'Debt Maturity',
      value: `${MODEL.loanMaturityYears} years`,
      target: '≥ 3 years',
      status: getRAGStatus('debtMaturity', MODEL.loanMaturityYears),
      tab: 'overview',
      tooltip: `USD ${MODEL.loanPrincipal}M term loan · SOFR+${(MODEL.creditSpread * 100).toFixed(0)}bps · Matures in ${MODEL.loanMaturityYears} years`,
    },
    {
      id: 'sofr',
      label: 'SOFR All-in Rate',
      value: `${(MODEL.allInRate * 100).toFixed(2)}%`,
      target: '< 6.0%',
      status: getRAGStatus('sofr', MODEL.allInRate),
      tab: 'overview',
      tooltip: `SOFR ${(MODEL.sofr * 100).toFixed(2)}% + Spread ${(MODEL.creditSpread * 100).toFixed(0)}bps = ${(MODEL.allInRate * 100).toFixed(2)}% · USD ${MODEL.collarNotional}M collared at ${(MODEL.collarFloor * 100).toFixed(0)}–${(MODEL.collarCap * 100).toFixed(0)}%`,
    },
    {
      id: 'cfar',
      label: 'CFaR (5th %ile)',
      value: cfar5th ? `${(cfar5th * 100).toFixed(1)}%` : '~8.5%',
      target: '≥ 8.0%',
      status: getRAGStatus('cfar', cfar5th || 0.085),
      tab: 'montecarlo',
      tooltip: '5th percentile EBITDA margin across 1,000 Monte Carlo paths (FX + iron ore + freight) · Run CFaR Simulator to update',
    },
  ];
}

const INVENTORY_ITEMS = [
  { label: 'DRI Buffer', current: 18, target: 12, dailyCost: MODEL.dailyRmCost, color: '#3b82f6' },
  { label: 'Iron Ore Pellets', current: 24, target: 18, dailyCost: MODEL.dailyRmCost, color: '#10b981' },
  { label: 'Coal', current: 28, target: 25, dailyCost: MODEL.dailyRmCost, color: '#f59e0b' },
  { label: 'MRO / Consumables', current: null, target: null, dailyCost: null, fixed: 24, color: '#8b5cf6' },
];

export function KPIGrid({ hedgedMargin, unhedgedMargin, cfar5th, onNavigate }) {
  const kpis = buildKPIs(hedgedMargin, unhedgedMargin, cfar5th);
  const [showInventoryDrill, setShowInventoryDrill] = useState(false);

  const progressValue = Math.min((hedgedMargin / 0.14) * 100, 100);
  const floorPct = (0.11 / 0.14) * 100; // tick position at 78.6%

  return (
    <div>
      <AlertBanner kpis={kpis} hedgedMargin={hedgedMargin} />

      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Board KPI Scorecard
          </h2>
          <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em]"
               style={{ color: 'var(--text-faint)' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
            Live · {kpis.filter(k => k.status === 'green').length}/{kpis.length} Green
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="no-print gap-1.5"
        >
          <Printer size={12} />
          Board Snapshot
        </Button>
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
            tooltip={kpi.tooltip}
            onClick={kpi.id === 'inventoryDays'
              ? () => setShowInventoryDrill(true)
              : onNavigate ? () => onNavigate(kpi.tab) : undefined}
          />
        ))}
      </div>

      {/* Inventory drill-down — shadcn Dialog */}
      <Dialog open={showInventoryDrill} onOpenChange={setShowInventoryDrill}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package size={15} style={{ color: '#3b82f6' }} />
              Inventory Optimisation — WC Release
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Current Days', value: `${MODEL.inventoryDaysCurrent}d`, color: 'var(--red)' },
              { label: 'Target Days', value: `${MODEL.inventoryDaysTarget}d`, color: 'var(--green)' },
              { label: 'WC Release', value: `₹${MODEL.wcRelease} Cr`, color: 'var(--accent-teal)' },
            ].map(item => (
              <div key={item.label} className="text-center p-2 rounded-lg" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                <div className="font-mono font-bold mt-0.5" style={{ color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Savings Breakdown</div>
          <div className="space-y-2">
            {INVENTORY_ITEMS.map(item => {
              const release = item.fixed ?? Math.round((item.current - item.target) * item.dailyCost);
              const reduction = item.current ? item.current - item.target : null;
              return (
                <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg text-xs"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}>
                  <div className="w-2 h-6 rounded shrink-0" style={{ background: item.color, opacity: 0.8 }} />
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                    {reduction !== null && (
                      <div style={{ color: 'var(--text-muted)' }}>{item.current}d → {item.target}d (−{reduction}d × ₹{item.dailyCost.toFixed(1)} Cr/day)</div>
                    )}
                    {item.fixed && <div style={{ color: 'var(--text-muted)' }}>Rationalisation + standardisation</div>}
                  </div>
                  <div className="font-mono font-bold shrink-0" style={{ color: item.color }}>₹{release} Cr</div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between p-2 rounded-lg"
            style={{
              background: 'rgba(32, 178, 170, 0.1)',
              border: '1px solid rgba(32, 178, 170, 0.3)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}>
            <div className="flex items-center gap-2 text-xs">
              <TrendingDown size={12} style={{ color: 'var(--accent-teal)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Total WC Release (Year 1 one-time)</span>
            </div>
            <div className="font-mono font-bold" style={{ color: 'var(--accent-teal)' }}>₹{MODEL.wcRelease} Cr</div>
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Daily RM cost: ₹{MODEL.dailyRmCost.toFixed(2)} Cr/day · Revenue ₹{MODEL.revenue} Cr ÷ 365 × ~48.7% RM ratio
          </p>
        </DialogContent>
      </Dialog>

      {/* Board Floor Compliance — Bloomberg-style indicator */}
      <div className="mt-5 glass-panel-strong p-4">
        <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
          <div className="flex items-baseline gap-3">
            <span className="text-[12px] uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--text-muted)' }}>
              Board Floor Compliance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-[16px] tabular-nums tracking-tight"
                    style={{ color: 'var(--text-primary)' }}>
                {(hedgedMargin * 100).toFixed(2)}%
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>hedged margin</span>
            </div>
          </div>
          <div
            className="text-[11px] font-medium px-2.5 py-1 rounded-md font-mono tabular-nums"
            style={{
              background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              color: 'var(--green-soft)',
            }}
          >
            +{((hedgedMargin - 0.11) * 10000).toFixed(0)} bps buffer
          </div>
        </div>

        {/* Track */}
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {/* Floor zone (0–11%) — subtle red */}
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{
              width: `${floorPct}%`,
              background: 'linear-gradient(90deg, rgba(244,63,94,0.10), rgba(244,63,94,0.06))',
            }}
          />
          {/* Filled value */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0.2, 1] }}
            className="absolute top-0 bottom-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--green-border), var(--green-soft))',
              boxShadow: '0 0 12px rgba(16,185,129,0.4)',
            }}
          />
          {/* Floor tick */}
          <div
            className="absolute -top-1 -bottom-1 w-[2px] rounded-full"
            style={{
              left: `calc(${floorPct}% - 1px)`,
              background: 'var(--red)',
              boxShadow: '0 0 6px rgba(244,63,94,0.6)',
            }}
          />
        </div>

        {/* Scale labels */}
        <div className="relative mt-2" style={{ height: 14 }}>
          <span className="absolute left-0 text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-faint)' }}>9.0%</span>
          <span
            className="absolute text-[10px] font-mono tabular-nums font-semibold whitespace-nowrap"
            style={{
              left: `${floorPct}%`,
              transform: 'translateX(-50%)',
              color: 'var(--red-soft)',
            }}
          >
            ↑ Floor 11.0%
          </span>
          <span className="absolute right-0 text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-faint)' }}>14.0%</span>
        </div>
      </div>
    </div>
  );
}
