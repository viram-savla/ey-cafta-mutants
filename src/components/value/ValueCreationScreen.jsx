import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { TrendingUp, Package, Layers, Shield, Leaf, ChevronDown, ChevronUp } from 'lucide-react';

const DISCOUNT_RATE = 0.15;
const NPV_YEARS = 5;
const pvAnnuity = (cf) => cf * (1 - Math.pow(1 + DISCOUNT_RATE, -NPV_YEARS)) / DISCOUNT_RATE;

const LEVERS = [
  {
    id: 'contracting',
    icon: TrendingUp,
    title: 'Smarter Contracting',
    subtitle: 'Index-linked pricing with quarterly resets + FFA collar overlay',
    annualLow: 92,
    annualHigh: 148,
    type: 'annual',
    color: '#10b981',
    borderColor: '#059669',
    bg: 'rgba(6,78,59,0.4)',
    speedLabel: 'Fast',
    speedScore: 85,
    magnitudeScore: 90,
    owner: 'Procurement + Treasury',
    actions: [
      '60% of iron ore contracts → quarterly index reset (MB 65% Fe CFR China)',
      'FFA collar: 0–3M forward at USD 122/t, 3–6M zero-cost collar',
      'Benchmark all contracts vs Platts C5 Baltic quarterly average',
    ],
    npvLow: Math.round(pvAnnuity(92)),
    npvHigh: Math.round(pvAnnuity(148)),
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Inventory Optimisation',
    subtitle: '71 → 55 days inventory · ₹394 Cr WC release (Year 1)',
    annualLow: null,
    annualHigh: null,
    oneTime: 394,
    type: 'one-time',
    color: '#3b82f6',
    borderColor: '#2563eb',
    bg: 'rgba(29,78,216,0.15)',
    speedLabel: 'Medium',
    speedScore: 45,
    magnitudeScore: 95,
    owner: 'Supply Chain + Finance',
    actions: [
      'DRI buffer: 18 → 12 days (−6 days × ₹24.64 Cr/day = ₹148 Cr release)',
      'Pellet stock: 24 → 18 days (−6 days × ₹24.64 Cr/day = ₹148 Cr release)',
      'Coal buffer: 28 → 25 days (−3 days × ₹24.64 Cr/day = ₹74 Cr release)',
      'MRO + consumables rationalisation: ~₹24 Cr release',
    ],
    npvLow: 394,
    npvHigh: 394,
  },
  {
    id: 'landedcost',
    icon: Layers,
    title: 'Landed Cost Integration',
    subtitle: 'Real-time C5 freight + FX blended into procurement bids',
    annualLow: 37,
    annualHigh: 55,
    type: 'annual',
    color: '#f59e0b',
    borderColor: '#d97706',
    bg: 'rgba(69,26,3,0.5)',
    speedLabel: 'Medium',
    speedScore: 55,
    magnitudeScore: 55,
    owner: 'Treasury + Procurement',
    actions: [
      'Baltic Exchange C5 API integrated into bid evaluation model',
      'Real-time INR/USD blended into per-tonne landed cost',
      'Benchmark: avoid procurement at peak freight (currently USD 17.20/t vs USD 15/t C5)',
      'Estimated 2–3% procurement cost saving = ₹37–55 Cr on ₹1,850 Cr import base',
    ],
    npvLow: Math.round(pvAnnuity(37)),
    npvHigh: Math.round(pvAnnuity(55)),
  },
  {
    id: 'rcc',
    icon: Shield,
    title: 'Risk Command Center',
    subtitle: 'Infrastructure lever — enables all other value levers',
    annualLow: null,
    annualHigh: null,
    type: 'enabler',
    color: '#8b5cf6',
    borderColor: '#7c3aed',
    bg: 'rgba(76,29,149,0.25)',
    speedLabel: 'Fast',
    speedScore: 80,
    magnitudeScore: 70,
    owner: 'CFO + IT + Risk',
    actions: [
      '10-tab Excel + live API feeds (Bloomberg/CME/NY Fed)',
      'Board KPI scorecard: 9 metrics, RAG status, live SOFR + FX',
      'Monte Carlo 1,000-path CFaR simulator',
      'Nigeria buffer tracker + tier-1/tier-2 playbook',
    ],
    npvLow: 0,
    npvHigh: 0,
  },
  {
    id: 'cbam',
    icon: Leaf,
    title: 'CBAM Green Steel Premium',
    subtitle: 'EUR 110M exports · EU carbon certificate compliance',
    annualLow: 27,
    annualHigh: 33,
    type: 'annual',
    color: '#06b6d4',
    borderColor: '#0891b2',
    bg: 'rgba(8,145,178,0.12)',
    speedLabel: 'Slow',
    speedScore: 25,
    magnitudeScore: 40,
    owner: 'Legal + Export Sales',
    actions: [
      'EU CBAM registration + embedded carbon certification for steel exports',
      'Premium tier pricing with European offtakers: EUR 2.5–3.0/t uplift',
      'Offsets ~₹30 Cr/year against CBAM levy obligation post-2026',
      'Timeline: 18–24 months to first certified shipment',
    ],
    npvLow: Math.round(pvAnnuity(27)),
    npvHigh: Math.round(pvAnnuity(33)),
  },
];

const TOTAL_NPV_LOW = 826;
const TOTAL_NPV_HIGH = 1075;

const NPV_BAR_DATA = [
  { name: 'Smarter\nContracting', low: Math.round(pvAnnuity(92)), high: Math.round(pvAnnuity(148)), color: '#10b981' },
  { name: 'Inventory\nOptimisation', low: 394, high: 394, color: '#3b82f6' },
  { name: 'Landed Cost\nIntegration', low: Math.round(pvAnnuity(37)), high: Math.round(pvAnnuity(55)), color: '#f59e0b' },
  { name: 'CBAM\nPremium', low: Math.round(pvAnnuity(27)), high: Math.round(pvAnnuity(33)), color: '#06b6d4' },
];

function LeverCard({ lever, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = lever.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-lg overflow-hidden"
      style={{ background: lever.bg, border: `1px solid ${lever.borderColor}` }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded" style={{ background: 'var(--bg-primary)' }}>
              <Icon size={16} style={{ color: lever.color }} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{lever.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{lever.subtitle}</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            {lever.type === 'annual' && (
              <div className="font-mono text-sm font-bold" style={{ color: lever.color }}>
                ₹{lever.annualLow}–{lever.annualHigh} Cr/yr
              </div>
            )}
            {lever.type === 'one-time' && (
              <div className="font-mono text-sm font-bold" style={{ color: lever.color }}>
                ₹{lever.oneTime} Cr
              </div>
            )}
            {lever.type === 'enabler' && (
              <div className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--bg-primary)', color: lever.color, border: `1px solid ${lever.borderColor}` }}>
                ENABLER
              </div>
            )}
            <div className="text-xs mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>
              {lever.type === 'annual' && `5-yr NPV ₹${lever.npvLow}–${lever.npvHigh} Cr`}
              {lever.type === 'one-time' && 'One-time WC release'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Speed: </span>
            <span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{
              background: 'var(--bg-primary)',
              color: lever.speedLabel === 'Fast' ? 'var(--green)' : lever.speedLabel === 'Medium' ? 'var(--amber)' : 'var(--red)',
            }}>
              {lever.speedLabel}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Owner: </span>{lever.owner}
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors"
        style={{ borderTop: `1px solid ${lever.borderColor}`, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)' }}
      >
        <span>Key actions</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-3"
        >
          <ul className="mt-2 space-y-1">
            {lever.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: lever.color }}>›</span>
                {a}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

function Quadrant2x2() {
  const dots = [
    { label: 'Contracting', x: 82, y: 88, color: '#10b981' },
    { label: 'Inventory', x: 40, y: 92, color: '#3b82f6' },
    { label: 'Landed Cost', x: 55, y: 52, color: '#f59e0b' },
    { label: 'RCC', x: 80, y: 68, color: '#8b5cf6' },
    { label: 'CBAM', x: 22, y: 38, color: '#06b6d4' },
  ];

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
        2×2: Speed vs Value Magnitude
      </h3>
      <div className="relative" style={{ height: 240 }}>
        {/* Quadrant labels */}
        <div className="absolute inset-0" style={{ borderLeft: '1px solid var(--border-accent)', borderBottom: '1px solid var(--border-accent)' }}>
          <div className="absolute top-2 right-2 text-xs" style={{ color: 'var(--green)', opacity: 0.6 }}>Fast + High → Priority</div>
          <div className="absolute top-2 left-2 text-xs" style={{ color: 'var(--amber)', opacity: 0.6 }}>High magnitude, slower</div>
          <div className="absolute bottom-2 right-2 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Quick wins</div>
          <div className="absolute bottom-2 left-2 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Strategic / long-term</div>
          {/* Midline */}
          <div className="absolute left-0 right-0" style={{ top: '50%', borderTop: '1px dashed var(--border-accent)' }} />
          <div className="absolute top-0 bottom-0" style={{ left: '50%', borderLeft: '1px dashed var(--border-accent)' }} />
        </div>

        {/* Axis labels */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Slow</span>
          <span>Implementation Speed →</span>
          <span>Fast</span>
        </div>
        <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>High</span>
          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>← Magnitude</span>
          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Low</span>
        </div>

        {/* Dots */}
        {dots.map((dot) => (
          <div
            key={dot.label}
            className="absolute flex flex-col items-center"
            style={{ left: `${dot.x}%`, top: `${100 - dot.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: dot.color, boxShadow: `0 0 8px ${dot.color}80` }}
            />
            <div className="mt-1 text-xs font-medium whitespace-nowrap" style={{ color: dot.color }}>
              {dot.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NPVBarChart() {
  const data = NPV_BAR_DATA.map(d => ({
    name: d.name.replace('\n', ' '),
    npvMid: Math.round((d.low + d.high) / 2),
    color: d.color,
  }));

  const CustomLabel = (props) => {
    const { x, y, width, value, color } = props;
    return (
      <text x={x + width / 2} y={y - 4} textAnchor="middle" fill={color} fontSize={10} fontFamily="monospace">
        ₹{value}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0];
              return (
                <div className="rounded p-2 text-xs font-mono" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
                  <p style={{ color: 'var(--text-primary)' }}>{d.payload.name}</p>
                  <p style={{ color: d.payload.color }}>5-yr NPV: ₹{d.value} Cr</p>
                </div>
              );
            }}
          />
          <Bar dataKey="npvMid" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.8} />
            ))}
            <LabelList
              content={(props) => {
                const { x, y, width, value, index } = props;
                return (
                  <text x={x + width / 2} y={y - 4} textAnchor="middle"
                    fill={data[index]?.color} fontSize={9} fontFamily="monospace">
                    ₹{value}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ValueCreationScreen() {
  return (
    <div className="space-y-4">
      {/* Header KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total 5-yr NPV', value: `₹${TOTAL_NPV_LOW}–${TOTAL_NPV_HIGH} Cr`, sub: 'at 15% CoC', color: 'var(--accent-gold)' },
          { label: 'Annual Cash Flow', value: '₹129–203 Cr/yr', sub: 'Contracting + Landed Cost', color: 'var(--green)' },
          { label: 'WC Release (Y1)', value: '₹394 Cr', sub: '71 → 55 inventory days', color: '#3b82f6' },
          { label: 'CBAM Premium', value: '~₹30 Cr/yr', sub: 'EUR 110M exports, post-2026', color: '#06b6d4' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg p-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
            <div className="font-mono text-lg font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Lever cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LEVERS.map((lever, i) => (
          <LeverCard key={lever.id} lever={lever} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2x2 quadrant */}
        <Quadrant2x2 />

        {/* NPV bar chart */}
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
            5-Year NPV by Lever (₹ Cr, 15% CoC)
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Mid-point estimates · Inventory = one-time WC release (not discounted further)
          </p>
          <NPVBarChart />
          <div className="mt-3 p-2 rounded text-xs" style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)' }}>
            <span style={{ color: 'var(--amber)' }} className="font-semibold">Total: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              PV(₹129–203 Cr annuity, 5yr, 15%) + ₹394 Cr = <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>₹826–1,075 Cr</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <div className="p-3 rounded-lg text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Assumptions: </span>
        15% cost of capital · 5-year horizon · Annual savings realised from Year 1 post-implementation ·
        Inventory WC release treated as Year-1 cash inflow · CBAM not included in base NPV (regulatory timeline TBD) ·
        All figures in INR Crore · Base FX: ₹83.25/USD
      </div>
    </div>
  );
}
