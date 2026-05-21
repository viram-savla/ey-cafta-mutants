import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

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
  1: { label: 'Phase 1: Foundation & Stabilisation', color: '#ef4444', bg: 'rgba(239,68,68,0.25)', border: '#dc2626', range: 'M1–M3' },
  2: { label: 'Phase 2: Execution', color: '#f59e0b', bg: 'rgba(245,158,11,0.25)', border: '#d97706', range: 'M4–M6' },
  3: { label: 'Phase 3: Scale & Institutionalise', color: '#10b981', bg: 'rgba(16,185,129,0.25)', border: '#059669', range: 'M7–M12' },
};

const SUCCESS_CRITERIA_PHASE2 = 'Phase Gate M6: ROI >15% vs implementation cost; ≥30% of contracts renegotiated; Nigeria buffer ≥45 days; RCC live with CFO sign-off';

function GanttRow({ ws, index }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06 }}
        className="grid gap-2 items-center py-2 border-b"
        style={{ gridTemplateColumns: '200px 1fr', borderColor: 'var(--border)' }}
      >
        {/* Name column */}
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="text-left pr-2"
        >
          <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{ws.name}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ws.owner}</div>
        </button>

        {/* Bar column — 12 equal cells */}
        <div className="relative" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px', minHeight: '28px' }}>
          {MONTHS.map((_, m) => {
            const bar = ws.bars.find(b => m >= b.start && m <= b.end);
            const isStart = bar && m === bar.start;
            const isEnd = bar && m === bar.end;
            const meta = bar ? PHASE_META[bar.phase] : null;
            return (
              <div
                key={m}
                className="h-7 flex items-center justify-center text-xs relative"
                style={{
                  background: meta ? meta.bg : 'var(--bg-card)',
                  borderTop: meta ? `1px solid ${meta.border}` : '1px solid var(--border)',
                  borderBottom: meta ? `1px solid ${meta.border}` : '1px solid var(--border)',
                  borderLeft: isStart ? `2px solid ${meta.color}` : meta ? 'none' : '1px solid var(--border)',
                  borderRight: isEnd ? `2px solid ${meta.color}` : meta ? 'none' : '1px solid var(--border)',
                  borderRadius: isStart ? '3px 0 0 3px' : isEnd ? '0 3px 3px 0' : '0',
                }}
                title={bar?.label || ''}
              >
                {isStart && bar.label && (
                  <span
                    className="absolute left-1 text-xs font-medium whitespace-nowrap overflow-hidden"
                    style={{ color: meta.color, fontSize: 8, maxWidth: `${(bar.end - bar.start + 1) * 100}%` }}
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
          className="pl-2 py-2 border-b text-xs space-y-1"
          style={{ borderColor: 'var(--border)', gridColumn: '1 / -1' }}
        >
          <div style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Deliverable: </span>
            {ws.deliverable}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Success Criteria: </span>
            {ws.successCriteria}
          </div>
        </motion.div>
      )}
    </>
  );
}

export function RoadmapScreen() {
  return (
    <div className="space-y-4">
      {/* Phase legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map(p => {
          const meta = PHASE_META[p];
          return (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: p * 0.1 }}
              className="rounded-lg p-3"
              style={{
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: meta.color }} />
                <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.range}</span>
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{meta.label}</div>
              {p === 2 && (
                <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: meta.color }}>
                  <Flag size={10} />
                  <span>Phase Gate at M6 (ROI &gt;15%)</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Gantt chart */}
      <div className="rounded-xl p-4 overflow-x-auto" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
          12-Month Implementation Gantt
        </h3>

        {/* Month header */}
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '200px 1fr' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Workstream / Owner</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px' }}>
            {MONTHS.map((m, i) => (
              <div key={m} className="text-center text-xs font-mono" style={{
                color: i < 3 ? '#ef4444' : i < 6 ? '#f59e0b' : '#10b981',
              }}>
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Phase background bands */}
        <div className="relative">
          {WORKSTREAMS.map((ws, i) => <GanttRow key={ws.id} ws={ws} index={i} />)}
        </div>

        {/* Phase gate marker */}
        <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: '200px 1fr' }}>
          <div />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px' }}>
            {MONTHS.map((_, i) => (
              <div key={i} className="text-center">
                {i === 5 && (
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4" style={{ background: '#f59e0b' }} />
                    <Flag size={10} style={{ color: '#f59e0b' }} />
                    <div className="text-xs whitespace-nowrap" style={{ color: '#f59e0b', fontSize: 8 }}>Phase Gate</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Gate criteria */}
      <div className="rounded-xl p-4" style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid var(--amber-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <div className="flex items-center gap-2 mb-2">
          <Flag size={14} style={{ color: 'var(--amber)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>M6 Phase Gate — Hard Stop Criteria</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{SUCCESS_CRITERIA_PHASE2}</p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'ROI threshold', value: '>15%', icon: CheckCircle },
            { label: 'Contracts renegotiated', value: '≥30%', icon: CheckCircle },
            { label: 'Nigeria buffer', value: '≥45 days', icon: CheckCircle },
            { label: 'RCC status', value: 'CFO sign-off', icon: CheckCircle },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <item.icon size={12} style={{ color: 'var(--amber)', shrink: 0 }} />
              <div>
                <div style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                <div className="font-mono font-semibold" style={{ color: 'var(--amber)' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owner summary table */}
      <div className="rounded-xl p-4" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Workstream Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Workstream', 'Owner', 'M6 Deliverable', 'M12 Target'].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKSTREAMS.map((ws, i) => (
                <tr key={ws.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>{ws.name}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{ws.owner}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-secondary)' }}>{ws.successCriteria.split(';')[0]}</td>
                  <td className="py-2" style={{ color: 'var(--green)' }}>{ws.deliverable.split(';')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
