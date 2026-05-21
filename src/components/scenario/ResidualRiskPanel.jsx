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
    <div className="glass-panel-strong p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} style={{ color: 'var(--amber-soft)' }} />
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
            Residual Risk Register
          </h3>
        </div>
        <span className="text-[10.5px]" style={{ color: 'var(--text-faint)' }}>Below-the-line exposures · not in EBITDA</span>
      </div>

      {/* PAT vs EBITDA callout */}
      <div className="p-3 rounded-lg text-[11.5px] leading-relaxed" style={{
        background: 'var(--accent-teal-bg)',
        border: '1px solid var(--accent-teal-border)',
      }}>
        <div className="flex items-start gap-2.5">
          <Info size={13} style={{ color: 'var(--accent-teal-soft)', marginTop: 1, flexShrink: 0 }} />
          <div>
            <span className="font-semibold" style={{ color: 'var(--accent-teal-soft)' }}>PAT vs EBITDA Distinction: </span>
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
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--text-faint)' }}>
          Finance Cost Sensitivity · USD {MODEL.loanPrincipal}M @ SOFR + 220 bps
        </div>
        <table className="w-full text-[12px] tabular-nums">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['FX Rate', 'Finance Cost', 'vs Base', 'USD Loan MTM', 'P&L Level'].map(h => (
                <th key={h} className="text-left pb-2 pr-3 font-medium text-[10.5px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-faint)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FX_SCENARIOS.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                <td className="py-2 pr-3 font-mono font-medium" style={{ color: i === 0 ? 'var(--text-primary)' : i === 3 ? 'var(--red-soft)' : 'var(--text-secondary)' }}>
                  {s.label}
                </td>
                <td className="py-2 pr-3 font-mono" style={{ color: i === 0 ? 'var(--green-soft)' : i >= 2 ? 'var(--amber-soft)' : 'var(--text-secondary)' }}>
                  ₹{s.finCost.toFixed(1)} Cr
                </td>
                <td className="py-2 pr-3 font-mono" style={{ color: i === 0 ? 'var(--text-muted)' : 'var(--amber-soft)' }}>
                  {i === 0 ? '—' : `+₹${(s.finCost - MODEL.annualInterestInr).toFixed(1)} Cr`}
                </td>
                <td className="py-2 pr-3 font-mono" style={{ color: i === 0 ? 'var(--text-muted)' : 'var(--red-soft)' }}>
                  {i === 0 ? '—' : `−₹${s.mtm} Cr`}
                </td>
                <td className="py-2 text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
                  {i === 0 ? 'EBITDA + PAT' : 'PAT only (below EBITDA)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk cards */}
      <div className="space-y-2.5">
        {RESIDUAL_RISKS.map((risk) => {
          const meta = SEVERITY_META[risk.severity];
          const colorSoft = risk.severity === 'red' ? 'var(--red-soft)' : risk.severity === 'amber' ? 'var(--amber-soft)' : 'var(--green-soft)';
          return (
            <div key={risk.id} className="rounded-lg p-3.5" style={{
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={11} style={{ color: colorSoft }} />
                <span className="text-[12.5px] font-semibold tracking-tight" style={{ color: colorSoft }}>{risk.title}</span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded font-mono"
                  style={{ background: 'rgba(255,255,255,0.06)', color: colorSoft, border: `1px solid ${meta.border}` }}>
                  {risk.severity}
                </span>
              </div>
              <p className="text-[11.5px] mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{risk.description}</p>
              <div className="text-[11px] space-y-1 leading-relaxed">
                <div>
                  <span className="font-semibold uppercase text-[10px] tracking-[0.1em] mr-1.5" style={{ color: 'var(--text-faint)' }}>Impact</span>
                  <span style={{ color: colorSoft }}>{risk.impact}</span>
                </div>
                <div>
                  <span className="font-semibold uppercase text-[10px] tracking-[0.1em] mr-1.5" style={{ color: 'var(--text-faint)' }}>Mitigation</span>
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
