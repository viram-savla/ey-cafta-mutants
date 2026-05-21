import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Cell, ReferenceLine, LabelList,
} from 'recharts';
import { MODEL } from '../../lib/constants';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

const LADDER_COLORS = { hedged: '#10b981', unhedged: '#ef4444' };

const BUCKETS = MODEL.fxLadder.map(b => ({
  ...b,
  hedgedExposure: Math.round(b.exposure * b.ratio),
  unhedgedExposure: Math.round(b.exposure * (1 - b.ratio)),
}));

const EUR_LADDER = [
  { bucket: '0–6M', exposure: 55, ratio: 0.70, rate: 89.50, instrument: 'Forward (EUR/INR)' },
  { bucket: '6–12M', exposure: 55, ratio: 0.40, rate: 90.20, instrument: 'Zero-cost collar' },
];

export function FXHedgeLadder() {
  const barData = BUCKETS.map(b => ({
    name: b.bucket,
    hedged: b.hedgedExposure,
    unhedged: b.unhedgedExposure,
    rate: b.forwardRate,
    instrument: b.instrument,
  }));

  const fxChartConfig = {
    hedged: { label: 'Hedged', color: '#10b981' },
    unhedged: { label: 'Open Exposure', color: '#ef4444' },
  };

  return (
    <div className="glass-panel-strong p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
            FX Hedge Ladder · USD Position
          </h3>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>
            Net long <span className="font-mono tabular-nums">$140M</span>
            {' '}<span style={{ color: 'var(--text-muted)' }}>(exports <span className="font-mono tabular-nums">$620M</span> − imports <span className="font-mono tabular-nums">$480M</span>)</span>
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-md text-[11px]"
          style={{ background: 'var(--accent-teal-bg)', border: '1px solid var(--accent-teal-border)' }}>
          <span style={{ color: 'var(--text-muted)' }}>WAHR</span>
          {' '}<span className="font-mono tabular-nums font-semibold" style={{ color: 'var(--accent-teal-soft)' }}>₹{MODEL.wahr.toFixed(2)}/$</span>
        </div>
      </div>

      {/* Natural netting waterfall */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'USD Exports', value: `$${MODEL.usdExports}M`,        color: 'var(--green-soft)' },
          { label: 'USD Imports', value: `$${MODEL.usdImports}M`,        color: 'var(--red-soft)' },
          { label: 'Net Long',     value: `$${MODEL.netUsdPosition}M`,    color: 'var(--accent-teal-soft)' },
        ].map(item => (
          <div key={item.label} className="glass-panel-subtle p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-faint)' }}>{item.label}</div>
            <div className="font-mono tabular-nums font-semibold text-[14px] mt-1" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Ladder table */}
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] mb-2.5" style={{ color: 'var(--text-faint)' }}>
          3-Bucket Forward Ladder
        </div>
        <table className="w-full text-[12px] tabular-nums">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Bucket', 'Exposure', 'Hedge %', 'Hedged', 'Open', 'Rate', 'Instrument'].map(h => (
                <th key={h} className="text-left pb-2 pr-3 font-medium text-[10.5px] uppercase tracking-[0.1em]"
                  style={{ color: 'var(--text-faint)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUCKETS.map((b, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                <td className="py-2 pr-3 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{b.bucket}</td>
                <td className="py-2 pr-3 font-mono" style={{ color: 'var(--text-secondary)' }}>${b.exposure}M</td>
                <td className="py-2 pr-3 font-mono" style={{ color: 'var(--green-soft)' }}>{(b.ratio * 100).toFixed(0)}%</td>
                <td className="py-2 pr-3 font-mono" style={{ color: 'var(--green-soft)' }}>${b.hedgedExposure}M</td>
                <td className="py-2 pr-3 font-mono" style={{ color: b.unhedgedExposure > 20 ? 'var(--red-soft)' : 'var(--text-secondary)' }}>
                  ${b.unhedgedExposure}M
                </td>
                <td className="py-2 pr-3 font-mono" style={{ color: 'var(--accent-teal-soft)' }}>₹{b.forwardRate.toFixed(2)}</td>
                <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{b.instrument}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--border-accent)' }}>
              <td className="pt-2 pr-3 font-semibold" style={{ color: 'var(--text-primary)' }}>WAHR</td>
              <td className="pt-2 pr-3 font-mono" style={{ color: 'var(--text-secondary)' }}>$140M</td>
              <td className="pt-2 pr-3 font-mono" style={{ color: 'var(--green-soft)' }}>~53%</td>
              <td colSpan={2} />
              <td className="pt-2 font-mono font-semibold" style={{ color: 'var(--accent-teal-soft)' }}>₹{MODEL.wahr.toFixed(2)}</td>
              <td className="pt-2 text-[10.5px]" style={{ color: 'var(--text-muted)' }}>Band 83.50–85.50</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bar chart */}
      <ChartContainer config={fxChartConfig} className="h-[140px] w-full">
        <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={(value, name, item) => {
                  const bucket = BUCKETS.find(b => b.bucket === item.payload?.name);
                  const label = name === 'hedged' ? 'Hedged' : 'Open';
                  return [`USD ${value}M`, label];
                }}
              />
            }
          />
          <Bar dataKey="hedged" stackId="a" fill="var(--color-hedged)" fillOpacity={0.8} name="hedged">
            <LabelList dataKey="hedged" position="inside" style={{ fill: 'white', fontSize: 9 }} formatter={v => `$${v}M`} />
          </Bar>
          <Bar dataKey="unhedged" stackId="a" fill="var(--color-unhedged)" fillOpacity={0.7} radius={[2, 2, 0, 0]} name="unhedged">
            <LabelList dataKey="unhedged" position="inside" style={{ fill: 'white', fontSize: 9 }} formatter={v => `$${v}M`} />
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* EUR ladder */}
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] mb-2.5" style={{ color: 'var(--text-faint)' }}>
          EUR 110M Separate Ladder · CBAM Exports
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {EUR_LADDER.map((b, i) => (
            <div key={i} className="glass-panel-subtle p-3">
              <div className="flex justify-between items-center">
                <span className="font-mono tabular-nums font-semibold text-[12px]" style={{ color: 'var(--text-primary)' }}>{b.bucket}</span>
                <span className="font-mono tabular-nums text-[10.5px] px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--green-bg)', color: 'var(--green-soft)', border: '1px solid var(--green-border)' }}>
                  {(b.ratio * 100).toFixed(0)}% hedged
                </span>
              </div>
              <div className="mt-1.5 font-mono tabular-nums text-[12px]" style={{ color: 'var(--accent-teal-soft)' }}>EUR/INR ₹{b.rate.toFixed(2)}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.instrument} · EUR {b.exposure}M</div>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-[10.5px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          EUR ladder managed independently from USD book · CBAM compliance drives EUR hedging timeline
        </p>
      </div>
    </div>
  );
}
