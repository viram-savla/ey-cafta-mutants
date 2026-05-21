import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, CheckCircle2, AlertTriangle, Clock, ChevronDown } from 'lucide-react';

const MONTHS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];

// Each workstream: name, owner, bars: [{start, end, phase, label}]
// start/end are 0-indexed (0=M1, 11=M12)
// phase: 1=Foundation(red), 2=Execution(amber), 3=Scale(green)
const WORKSTREAMS = [
  {
    id: 'rcc',
    name: 'Risk Command Center',
    owner: 'CFO + IT',
    deliverable: '10-tab Excel + live feeds; Board KPI dashboard live',
    successCriteria: 'All 9 KPIs RAG-tracked; CFO sign-off M3',
    bars: [
      { start: 0, end: 2, phase: 1, label: 'Design + data feeds' },
      { start: 3, end: 5, phase: 2, label: 'Deploy + test' },
      { start: 6, end: 11, phase: 3, label: 'Institutionalise + Board cadence' },
    ],
  },
  {
    id: 'commodity',
    name: 'Commodity Hedging',
    owner: 'Treasury',
    deliverable: 'SGX iron ore futures; FFA freight collars executed',
    successCriteria: '≥80% coverage 0–3M; first hedge executed M3',
    bars: [
      { start: 0, end: 1, phase: 1, label: 'Policy + counterparty' },
      { start: 2, end: 5, phase: 2, label: '0–3M forwards; 3–6M collars' },
      { start: 6, end: 11, phase: 3, label: 'Rolling 12M programme; >80% coverage' },
    ],
  },
  {
    id: 'fxusd',
    name: 'FX Hedge Ladder (USD)',
    owner: 'Treasury',
    deliverable: 'USD 140M net long · 3-bucket ladder · WAHR 84.81',
    successCriteria: 'WAHR within 83.50–85.50 band; ladder reviewed monthly',
    bars: [
      { start: 0, end: 1, phase: 1, label: 'Benchmark; WAHR model' },
      { start: 2, end: 4, phase: 2, label: 'Execute: 0–3M forward + 3–6M collar' },
      { start: 5, end: 11, phase: 3, label: '6–12M participating; monthly roll' },
    ],
  },
  {
    id: 'sofr',
    name: 'SOFR Collar (USD Debt)',
    owner: 'Treasury + Legal',
    deliverable: 'USD 90M collar: 3.00%–4.50%; USD 60M floating',
    successCriteria: 'Collar executed; all-in rate <5.79% confirmed',
    bars: [
      { start: 0, end: 1, phase: 1, label: 'Review existing ISDA; quote collar' },
      { start: 2, end: 2, phase: 2, label: 'Execute USD 90M collar' },
      { start: 3, end: 11, phase: 3, label: 'Monitor; quarterly mark-to-market' },
    ],
  },
  {
    id: 'nigeria',
    name: 'Nigeria Liquidity',
    owner: 'CFO + Nigeria MD',
    deliverable: 'Buffer ≥45 days; USD 100M credit facility; multi-bank',
    successCriteria: 'Buffer ≥30 days M3; ≥45 days M6; facility drawn-down ready',
    bars: [
      { start: 0, end: 2, phase: 1, label: 'Tier-1 controls; multi-bank; daily sweep' },
      { start: 3, end: 5, phase: 2, label: 'Credit facility docs; Mauritius billing' },
      { start: 6, end: 11, phase: 3, label: 'Facility operational; NOTAP registered' },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Optimisation',
    owner: 'Supply Chain + Finance',
    deliverable: '71 → 55 inventory days; ₹394 Cr WC release',
    successCriteria: '≤65 days M6; ≤55 days M9; ₹200 Cr released M6',
    bars: [
      { start: 0, end: 2, phase: 1, label: 'SKU audit; safety-stock model' },
      { start: 3, end: 7, phase: 2, label: 'Deploy: DRI 18→12d, pellets 24→18d' },
      { start: 8, end: 11, phase: 3, label: '55-day target; quarterly review' },
    ],
  },
  {
    id: 'contracting',
    name: 'Smarter Contracting',
    owner: 'Procurement',
    deliverable: '60% iron ore on quarterly index-reset; FFA overlay',
    successCriteria: '≥30% renegotiated M6; ₹46–74 Cr savings run-rate M6',
    bars: [
      { start: 1, end: 3, phase: 1, label: 'Contract audit; benchmark MB 65%Fe' },
      { start: 4, end: 7, phase: 2, label: 'Renegotiate top-5 suppliers' },
      { start: 8, end: 11, phase: 3, label: 'Quarterly reset live; >60% indexed' },
    ],
  },
  {
    id: 'cbam',
    name: 'CBAM / Green Steel',
    owner: 'Legal + Export Sales',
    deliverable: 'EU CBAM compliance; carbon certificate; premium pricing',
    successCriteria: 'Registration M6; first certified shipment Q4',
    bars: [
      { start: 2, end: 5, phase: 1, label: 'EU CBAM registration + carbon audit' },
      { start: 6, end: 11, phase: 2, label: 'Certification process; offtaker outreach' },
    ],
  },
];

const PHASE_META = {
  1: { num: '01', label: 'Foundation & Stabilisation', color: 'var(--red-soft)',   colorRaw: '#fb7185', bg: 'rgba(244,63,94,0.10)',  bgStrong: 'rgba(244,63,94,0.18)', border: 'rgba(244,63,94,0.4)',   range: 'M1–M3' },
  2: { num: '02', label: 'Execution',                  color: 'var(--amber-soft)', colorRaw: '#fbbf24', bg: 'rgba(245,158,11,0.10)',  bgStrong: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.4)',  range: 'M4–M6' },
  3: { num: '03', label: 'Scale & Institutionalise',   color: 'var(--green-soft)', colorRaw: '#34d399', bg: 'rgba(16,185,129,0.10)',  bgStrong: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.4)',  range: 'M7–M12' },
};

const SUCCESS_CRITERIA_PHASE2 = 'Phase Gate M6: ROI >15% vs implementation cost; ≥30% of contracts renegotiated; Nigeria buffer ≥45 days; RCC live with CFO sign-off';

function GanttRow({ ws, index }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.045, duration: 0.32, ease: [0.2, 0, 0.2, 1] }}
        className="grid gap-3 items-center py-2.5"
        style={{ gridTemplateColumns: 'minmax(180px, 220px) 1fr', borderBottom: '1px solid var(--border)' }}
      >
        {/* Name column */}
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="text-left pr-2 flex items-start gap-1.5 group"
        >
          <ChevronDown
            size={11}
            className="mt-1 shrink-0 transition-transform"
            style={{
              color: 'var(--text-faint)',
              transform: showDetail ? 'rotate(0deg)' : 'rotate(-90deg)',
            }}
          />
          <div className="min-w-0">
            <div className="text-[12px] font-medium leading-tight group-hover:text-[var(--text-primary)] transition-colors"
              style={{ color: 'var(--text-primary)' }}>
              {ws.name}
            </div>
            <div className="text-[10.5px] mt-0.5 leading-tight truncate" style={{ color: 'var(--text-muted)' }}>
              {ws.owner}
            </div>
          </div>
        </button>

        {/* Bar column */}
        <div className="relative" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3px', minHeight: '28px' }}>
          {MONTHS.map((_, m) => {
            const bar = ws.bars.find(b => m >= b.start && m <= b.end);
            const isStart = bar && m === bar.start;
            const isEnd = bar && m === bar.end;
            const meta = bar ? PHASE_META[bar.phase] : null;
            const span = bar ? (bar.end - bar.start + 1) : 1;
            return (
              <div
                key={m}
                className="h-6 flex items-center text-[10px] relative"
                style={{
                  background: meta ? meta.bgStrong : 'rgba(255,255,255,0.025)',
                  borderTop: meta ? `1px solid ${meta.border}` : '1px solid rgba(255,255,255,0.04)',
                  borderBottom: meta ? `1px solid ${meta.border}` : '1px solid rgba(255,255,255,0.04)',
                  borderLeft: isStart ? `2px solid ${meta.colorRaw}` : meta ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  borderRight: isEnd ? `2px solid ${meta.colorRaw}` : meta ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : '0',
                  boxShadow: meta ? `inset 0 1px 0 ${meta.border}` : 'none',
                }}
                title={bar?.label || ''}
              >
                {isStart && bar.label && (
                  <span
                    className="absolute left-2 font-medium tabular-nums whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{
                      color: meta.color,
                      fontSize: 10,
                      maxWidth: `calc(${span * 100}% - 16px)`,
                    }}
                  >
                    {bar.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Detail row */}
      {showDetail && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid gap-3 px-3 py-3 mb-1 rounded-lg"
          style={{
            gridTemplateColumns: 'minmax(180px, 220px) 1fr',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid var(--border)',
          }}
        >
          <div />
          <div className="space-y-1.5 text-[11.5px] leading-relaxed">
            <div>
              <span className="font-semibold text-[10.5px] uppercase tracking-[0.12em] mr-2" style={{ color: 'var(--text-faint)' }}>Deliverable</span>
              <span style={{ color: 'var(--text-secondary)' }}>{ws.deliverable}</span>
            </div>
            <div>
              <span className="font-semibold text-[10.5px] uppercase tracking-[0.12em] mr-2" style={{ color: 'var(--text-faint)' }}>Success Criteria</span>
              <span style={{ color: 'var(--text-secondary)' }}>{ws.successCriteria}</span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export function RoadmapScreen() {
  return (
    <div className="space-y-4">
      {/* ─── Phase timeline with connecting line ─────────────── */}
      <div className="glass-panel-strong p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
            12-Month Implementation Phases
          </h3>
          <span className="text-[10.5px]" style={{ color: 'var(--text-faint)' }}>3 phases · 8 workstreams</span>
        </div>
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* connecting line */}
          <div
            className="hidden sm:block absolute top-[18px] left-[8%] right-[8%] h-px"
            style={{ background: 'linear-gradient(90deg, rgba(244,63,94,0.35), rgba(245,158,11,0.35), rgba(16,185,129,0.35))' }}
          />
          {[1, 2, 3].map(p => {
            const meta = PHASE_META[p];
            return (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: p * 0.08, duration: 0.4 }}
                className="relative"
              >
                {/* timeline dot */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="relative w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: meta.bgStrong,
                      border: `1px solid ${meta.border}`,
                      boxShadow: `0 0 0 4px var(--bg-primary), 0 4px 12px ${meta.border}`,
                    }}
                  >
                    <span className="font-mono tabular-nums font-semibold text-[12px]" style={{ color: meta.color }}>
                      {meta.num}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] font-mono tabular-nums" style={{ color: meta.color }}>
                      {meta.range}
                    </div>
                    <div className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {meta.label}
                    </div>
                  </div>
                </div>
                {p === 2 && (
                  <div
                    className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium ml-11"
                    style={{
                      background: meta.bgStrong,
                      border: `1px solid ${meta.border}`,
                      color: meta.color,
                    }}
                  >
                    <Flag size={9} />
                    <span>Phase Gate · ROI &gt; 15%</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Gantt ───────────────────────────────────────────── */}
      <div className="glass-panel-strong p-5 overflow-x-auto">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
            Workstream Gantt
          </h3>
          <div className="hidden md:flex items-center gap-3 text-[10.5px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(244,63,94,0.4)' }} />
              <span style={{ color: 'var(--red-soft)' }}>Foundation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(245,158,11,0.4)' }} />
              <span style={{ color: 'var(--amber-soft)' }}>Execution</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(16,185,129,0.4)' }} />
              <span style={{ color: 'var(--green-soft)' }}>Scale</span>
            </span>
          </div>
        </div>

        {/* Month header */}
        <div className="grid gap-3 mb-2 pb-2" style={{ gridTemplateColumns: 'minmax(180px, 220px) 1fr', borderBottom: '1px solid var(--border)' }}>
          <div className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--text-faint)' }}>Workstream</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3px' }}>
            {MONTHS.map((m, i) => {
              const phase = i < 3 ? 1 : i < 6 ? 2 : 3;
              const color = PHASE_META[phase].color;
              return (
                <div key={m} className="text-center text-[10.5px] font-mono tabular-nums font-medium" style={{ color }}>
                  {m}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        <div className="relative">
          {WORKSTREAMS.map((ws, i) => <GanttRow key={ws.id} ws={ws} index={i} />)}
        </div>

        {/* Phase gate marker */}
        <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: 'minmax(180px, 220px) 1fr' }}>
          <div />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3px' }}>
            {MONTHS.map((_, i) => (
              <div key={i} className="flex justify-center">
                {i === 5 && (
                  <div className="flex flex-col items-center -mt-1">
                    <div className="w-px h-3" style={{ background: 'var(--amber-soft)' }} />
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)' }}>
                      <Flag size={9} style={{ color: 'var(--amber-soft)' }} />
                    </div>
                    <div className="text-[9px] mt-0.5 uppercase tracking-[0.1em] font-mono whitespace-nowrap" style={{ color: 'var(--amber-soft)' }}>
                      Gate
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── M6 Phase Gate criteria — status card grid ──────── */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
          border: '1px solid var(--amber-border)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="p-2 rounded-lg shrink-0"
            style={{
              background: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)',
            }}
          >
            <Flag size={14} style={{ color: 'var(--amber-soft)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--amber-soft)' }}>
              M6 Phase Gate · Hard Stop Criteria
            </div>
            <p className="text-[11.5px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              All four criteria must be met before proceeding to Phase 3 (Scale & Institutionalise).
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { label: 'ROI vs cost',          value: '> 15%',          icon: CheckCircle2 },
            { label: 'Contracts renegotiated', value: '≥ 30%',         icon: CheckCircle2 },
            { label: 'Nigeria buffer',       value: '≥ 45 days',      icon: CheckCircle2 },
            { label: 'RCC status',           value: 'CFO sign-off',   icon: CheckCircle2 },
          ].map(item => (
            <div key={item.label} className="glass-panel-subtle p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <item.icon size={11} style={{ color: 'var(--amber-soft)' }} />
                <span className="text-[10px] uppercase tracking-[0.1em] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
              </div>
              <div className="font-mono tabular-nums font-semibold text-[13.5px]" style={{ color: 'var(--amber-soft)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Workstream Summary table ────────────────────────── */}
      <div className="glass-panel-strong p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
            Workstream Summary
          </h3>
          <span className="text-[10.5px]" style={{ color: 'var(--text-faint)' }}>{WORKSTREAMS.length} workstreams</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Workstream', 'Owner', 'M6 Deliverable', 'M12 Target'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-[10px] font-medium uppercase tracking-[0.1em]"
                    style={{ color: 'var(--text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKSTREAMS.map((ws) => (
                <tr key={ws.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>{ws.name}</td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{ws.owner}</td>
                  <td className="py-2.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{ws.successCriteria.split(';')[0]}</td>
                  <td className="py-2.5" style={{ color: 'var(--green-soft)' }}>{ws.deliverable.split(';')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
