import { AlertTriangle, Info } from 'lucide-react';
import { MODEL } from '../../lib/constants';

const finCostAtRate = (rate) => {
  const usdLoan = MODEL.loanPrincipal;
  const allIn = MODEL.sofr + MODEL.creditSpread;
  const interest = usdLoan * allIn * rate;
  return Math.round(interest * 10) / 10;
};

const FX_SCENARIOS = [
  { label: 'Base (₹83.25)', rate: 83.25, finCost: MODEL.annualInterestInr, mtm: 0 },
  { label: '₹85 Stress', rate: 85.0, finCost: Math.round(MODEL.loanPrincipal * MODEL.allInRate * 85 * 10) / 10, mtm: Math.round((85 - 83.25) * MODEL.loanPrincipal * 0.5) },
  { label: '₹88 Adverse', rate: 88.0, finCost: Math.round(MODEL.loanPrincipal * MODEL.allInRate * 88 * 10) / 10, mtm: Math.round((88 - 83.25) * MODEL.loanPrincipal * 0.5) },
  { label: '₹92 Tail', rate: 92.0, finCost: Math.round(MODEL.loanPrincipal * MODEL.allInRate * 92 * 10) / 10, mtm: Math.round((92 - 83.25) * MODEL.loanPrincipal * 0.5) },
];

const RESIDUAL_RISKS = [
  {
    id: 'basis',
    title: 'Commodity Basis Risk',
    severity: 'amber',
    description: 'SGX iron ore futures reference MB 65% Fe fines CFR China. BAML procures DR-grade (higher quality) with a typical ±USD 5–10/t premium over benchmark.',
    impact: '±5–10 bps EBITDA margin · Not perfectly offsettable by standard hedges',
    mitigation: 'Quarterly basis adjustment in hedge ratio; direct DR-grade forward contracts when available',
  },
  {
    id: 'nigeria',
    title: 'Nigeria Convertibility / FX Risk',
    severity: 'red',
    description: 'CBN-managed NGN/USD rate. No liquid derivative market exists for NGN. BAML cannot hedge this exposure via standard financial instruments.',
    impact: 'Up to USD 40M/month import settlement risk · NGN devaluation affects subsidiary P&L',
    mitigation: 'Operational: multi-bank, offshore billing (Mauritius), USD intercompany loan structure. No financial hedge available.',
  },
  {
    id: 'translation',
    title: 'USD Loan Translation (MTM)',
    severity: 'amber',
    description: `USD ${MODEL.loanPrincipal}M loan reported in INR at spot. INR depreciation creates unrealised MTM loss in P&L below EBITDA line (below operating profit).`,
    impact: 'At ₹88/USD: ~₹71 Cr unrealised MTM loss (vs ₹83.25 base) · Affects PAT, not EBITDA',
    mitigation: 'Collar structure limits upside exposure; note EBITDA hedge coverage does NOT cover this P&L line',
  },
  {
    id: 'freight',
    title: 'Freight Spike (C5 Baltic)',
    severity: 'amber',
    description: 'Cape freight rate (C5) currently USD 15/t (below case USD 17.20/t). Can spike to USD 36.90/t (C3 2023 levels). FFAs hedge route but not all-in landed cost.',
    impact: 'USD 36.90/t vs USD 17.20/t = USD 19.70/t shock × 1.8M tonnes = USD 35.5M = ~₹296 Cr on unhedged freight',
    mitigation: '0–3M freight FFA forward; C5 API integrated into procurement for timing arbitrage',
  },
];

const SEVERITY_META = {
  red: { color: 'var(--red)', bg: 'var(--red-bg)', border: 'var(--red-border)' },
  amber: { color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' },
  green: { color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' },
};

export function ResidualRiskPanel() {
  return (
    <div className="rounded-xl p-4 space-y-4" style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    }}>
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} style={{ color: 'var(--amber)' }} />
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Residual Risk Register
        </h3>
      </div>

      {/* PAT vs EBITDA callout */}
      <div className="p-3 rounded-lg text-xs" style={{
        background: 'rgba(32, 178, 170, 0.1)',
        border: '1px solid rgba(32, 178, 170, 0.3)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}>
        <div className="flex items-start gap-2">
          <Info size={12} style={{ color: 'var(--accent-teal)', marginTop: 1, shrink: 0 }} />
          <div>
            <span className="font-semibold" style={{ color: 'var(--accent-teal)' }}>PAT vs EBITDA Distinction: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Hedges protect EBITDA margin (operating level). Finance costs, FX translation MTM on USD debt, and
              tax implications flow below EBITDA to PAT. A 71bps EBITDA hedge benefit does not translate 1:1 to PAT
              improvement — the USD loan MTM at ₹88/USD creates ~₹71 Cr PAT headwind not captured in EBITDA metrics.
            </span>
          </div>
        </div>
      </div>

      {/* Finance cost table */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Finance Cost Sensitivity (USD {MODEL.loanPrincipal}M @ SOFR+220bps)</div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['FX Rate', 'Finance Cost (₹ Cr)', 'vs Base', 'USD Loan MTM (₹ Cr)', 'P&L Level'].map(h => (
                <th key={h} className="text-left pb-1.5 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FX_SCENARIOS.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-1.5 pr-3 font-mono" style={{ color: i === 0 ? 'var(--text-primary)' : i === 3 ? '#ef4444' : 'var(--text-secondary)' }}>
                  {s.label}
                </td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: i === 0 ? '#10b981' : i >= 2 ? '#f59e0b' : 'var(--text-secondary)' }}>
                  ₹{s.finCost.toFixed(1)} Cr
                </td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: i === 0 ? 'var(--text-muted)' : '#f59e0b' }}>
                  {i === 0 ? '—' : `+₹${(s.finCost - MODEL.annualInterestInr).toFixed(1)} Cr`}
                </td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: i === 0 ? 'var(--text-muted)' : '#ef4444' }}>
                  {i === 0 ? '—' : `−₹${s.mtm} Cr`}
                </td>
                <td className="py-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {i === 0 ? 'EBITDA + PAT' : 'PAT only (below EBITDA)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk cards */}
      <div className="space-y-2">
        {RESIDUAL_RISKS.map((risk) => {
          const meta = SEVERITY_META[risk.severity];
          return (
            <div key={risk.id} className="rounded p-3" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={11} style={{ color: meta.color }} />
                <span className="text-xs font-semibold" style={{ color: meta.color }}>{risk.title}</span>
              </div>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>{risk.description}</p>
              <div className="text-xs space-y-0.5">
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Impact: </span>
                  <span style={{ color: meta.color }}>{risk.impact}</span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Mitigation: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{risk.mitigation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
