import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Cell, LabelList,
} from 'recharts';
import { TrendingUp, Package, Layers, Shield, Leaf } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { AnimatedNumber } from '../shared/AnimatedNumber';

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
    color: '#22c55e',
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
    color: '#a0c3ec',
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
    color: '#ff7a17',
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
    color: '#7c3aed',
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
  { name: 'Smarter\nContracting', low: Math.round(pvAnnuity(92)), high: Math.round(pvAnnuity(148)), color: '#22c55e' },
  { name: 'Inventory\nOptimisation', low: 394, high: 394, color: '#a0c3ec' },
  { name: 'Landed Cost\nIntegration', low: Math.round(pvAnnuity(37)), high: Math.round(pvAnnuity(55)), color: '#ff7a17' },
  { name: 'CBAM\nPremium', low: Math.round(pvAnnuity(27)), high: Math.round(pvAnnuity(33)), color: '#06b6d4' },
];

function LeverCard({ lever, index }) {
  const Icon = lever.icon;
  const speedColor = lever.speedLabel === 'Fast' ? 'var(--green-soft)' : lever.speedLabel === 'Medium' ? 'var(--amber-soft)' : 'var(--red-soft)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 110, damping: 18, mass: 0.9, delay: index * 0.05 }}
      className="rounded-xl overflow-hidden lift-on-hover"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* lever-coloured accent strip */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${lever.color}, transparent)`, opacity: 0.8 }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="mt-0.5 p-2 rounded-lg shrink-0"
              style={{
                background: `linear-gradient(135deg, ${lever.color}25, ${lever.color}10)`,
                border: `1px solid ${lever.color}40`,
                boxShadow: `0 4px 12px ${lever.color}15`,
              }}
            >
              <Icon size={16} style={{ color: lever.color }} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[13.5px] tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                {lever.title}
              </div>
              <div className="text-[11.5px] mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {lever.subtitle}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            {lever.type === 'annual' && (
              <div className="font-mono tabular-nums font-semibold text-[14px] tracking-tight" style={{ color: lever.color, letterSpacing: '-0.01em' }}>
                ₹{lever.annualLow}–{lever.annualHigh}<span className="text-[10px] font-normal ml-0.5 opacity-70">Cr/yr</span>
              </div>
            )}
            {lever.type === 'one-time' && (
              <div className="font-mono tabular-nums font-semibold text-[14px] tracking-tight" style={{ color: lever.color, letterSpacing: '-0.01em' }}>
                ₹{lever.oneTime}<span className="text-[10px] font-normal ml-0.5 opacity-70">Cr</span>
              </div>
            )}
            {lever.type === 'enabler' && (
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md"
                style={{
                  background: `${lever.color}20`,
                  color: lever.color,
                  border: `1px solid ${lever.color}40`,
                }}
              >
                Enabler
              </div>
            )}
            <div className="text-[10.5px] mt-1 text-right tabular-nums" style={{ color: 'var(--text-faint)' }}>
              {lever.type === 'annual' && `5-yr NPV ₹${lever.npvLow}–${lever.npvHigh} Cr`}
              {lever.type === 'one-time' && 'one-time WC release'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3.5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1.5 text-[10.5px]">
            <span className="uppercase tracking-[0.1em]" style={{ color: 'var(--text-faint)' }}>Speed</span>
            <span className="font-medium" style={{ color: speedColor }}>{lever.speedLabel}</span>
          </div>
          <span className="w-px h-3" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-1.5 text-[10.5px] min-w-0">
            <span className="uppercase tracking-[0.1em] shrink-0" style={{ color: 'var(--text-faint)' }}>Owner</span>
            <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{lever.owner}</span>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="actions" className="border-0">
          <AccordionTrigger
            className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] rounded-none hover:no-underline font-medium"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.025)',
            }}
          >
            Key actions
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <ul className="space-y-1.5">
              {lever.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-[11.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full" style={{ background: lever.color }} />
                  {a}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

function Quadrant2x2() {
  const dots = [
    { label: 'Contracting', x: 82, y: 88, color: '#22c55e' },
    { label: 'Inventory', x: 40, y: 92, color: '#20b2aa' },
    { label: 'Landed Cost', x: 55, y: 52, color: '#ff7a17' },
    { label: 'RCC', x: 80, y: 68, color: '#7c3aed' },
    { label: 'CBAM', x: 22, y: 38, color: '#06b6d4' },
  ];

  return (
    <div className="glass-panel-strong p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
          Lever Map · Speed × Magnitude
        </h3>
        <span className="text-[10.5px]" style={{ color: 'var(--text-faint)' }}>5 levers · prioritise top-right</span>
      </div>
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

const npvChartConfig = {
  npvMid: { label: '5-yr NPV (₹ Cr)' },
};

function NPVBarChart() {
  const data = NPV_BAR_DATA.map(d => ({
    name: d.name.replace('\n', ' '),
    npvMid: Math.round((d.low + d.high) / 2),
    color: d.color,
  }));

  return (
    <ChartContainer config={npvChartConfig} className="aspect-auto h-[180px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value, name, item) => [`₹${value} Cr`, '5-yr NPV']}
            />
          }
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
    </ChartContainer>
  );
}

export function ValueCreationScreen() {
  return (
    <div className="space-y-4">
      {/* Header KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total 5-yr NPV',  numeric: TOTAL_NPV_HIGH, prefix: '₹', suffix: ` Cr`,    display: `₹${TOTAL_NPV_LOW}–${TOTAL_NPV_HIGH} Cr`,   sub: 'at 15% CoC',                   color: 'var(--accent-teal-soft)' },
          { label: 'Annual Cash Flow', display: '₹129–203 Cr/yr', sub: 'Contracting + Landed Cost',   color: 'var(--green-soft)' },
          { label: 'WC Release (Y1)',  numeric: 394, prefix: '₹', suffix: ' Cr', sub: '71 → 55 inventory days',      color: '#a0c3ec' },
          { label: 'CBAM Premium',     display: '~₹30 Cr/yr',  sub: 'EUR 110M exports · post-2026',  color: '#22d3ee' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: i * 0.05 }}
            className="glass-panel-subtle p-3.5 lift-on-hover"
          >
            <div className="text-[10.5px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--text-faint)' }}>{kpi.label}</div>
            <div className="font-semibold tabular-nums mt-1.5" style={{ color: kpi.color, fontSize: 19, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              {kpi.numeric != null ? (
                <>
                  {kpi.prefix}<AnimatedNumber value={kpi.numeric} decimals={0} />{kpi.suffix && <span className="unit-suffix">{kpi.suffix.trim()}</span>}
                </>
              ) : kpi.display}
            </div>
            <div className="text-[10.5px] mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</div>
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
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>5-Year NPV by Lever (₹ Cr, 15% CoC)</CardTitle>
              <CardDescription>Mid-point estimates · Inventory = one-time WC release (not discounted further)</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <NPVBarChart />
            <div className="mt-3 p-2 rounded-lg text-xs" style={{
              background: 'rgba(32, 178, 170, 0.1)',
              border: '1px solid rgba(32, 178, 170, 0.3)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}>
              <span style={{ color: 'var(--accent-teal)' }} className="font-semibold">Total: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                PV(₹129–203 Cr annuity, 5yr, 15%) + ₹394 Cr = <span className="font-mono" style={{ color: 'var(--accent-teal)' }}>₹826–1,075 Cr</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footnote */}
      <div className="p-3 rounded-lg text-xs" style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'var(--text-muted)',
      }}>
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Assumptions: </span>
        15% cost of capital · 5-year horizon · Annual savings realised from Year 1 post-implementation ·
        Inventory WC release treated as Year-1 cash inflow · CBAM not included in base NPV (regulatory timeline TBD) ·
        All figures in INR Crore · Base FX: ₹83.25/USD
      </div>
    </div>
  );
}
