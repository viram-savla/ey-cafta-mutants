import { KPICard } from './KPICard';
import { AlertBanner } from './AlertBanner';
import { MODEL } from '../../lib/constants';
import { getRAGStatus, calcIC } from '../../lib/calculations';
import { Printer } from 'lucide-react';

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

export function KPIGrid({ hedgedMargin, unhedgedMargin, cfar5th, onNavigate }) {
  const kpis = buildKPIs(hedgedMargin, unhedgedMargin, cfar5th);

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
            onClick={onNavigate ? () => onNavigate(kpi.tab) : undefined}
          />
        ))}
      </div>

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
