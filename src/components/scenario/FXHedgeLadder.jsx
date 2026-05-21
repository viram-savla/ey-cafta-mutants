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
    <div className="rounded-lg p-4 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          FX Hedge Ladder — USD Position
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Net long USD 140M (Exports USD 620M − Imports USD 480M) · WAHR ₹{MODEL.wahr.toFixed(2)}/USD
        </p>
      </div>

      {/* Natural netting waterfall */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[
          { label: 'USD Exports', value: `USD ${MODEL.usdExports}M`, color: '#10b981', arrow: false },
          { label: 'USD Imports', value: `USD ${MODEL.usdImports}M`, color: '#ef4444', arrow: false },
          { label: 'Net Long', value: `USD ${MODEL.netUsdPosition}M`, color: '#f59e0b', arrow: false },
        ].map(item => (
          <div key={item.label} className="p-2 rounded text-center" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-accent)' }}>
            <div style={{ color: 'var(--text-muted)' }}>{item.label}</div>
            <div className="font-mono font-bold mt-0.5" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Ladder table */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>3-Bucket Forward Ladder</div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Bucket', 'Exposure', 'Hedge %', 'Hedged', 'Open', 'Rate', 'Instrument'].map(h => (
                <th key={h} className="text-left pb-1.5 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUCKETS.map((b, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-1.5 pr-3 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{b.bucket}</td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: 'var(--text-secondary)' }}>USD {b.exposure}M</td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: '#10b981' }}>{(b.ratio * 100).toFixed(0)}%</td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: '#10b981' }}>USD {b.hedgedExposure}M</td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: b.unhedgedExposure > 20 ? '#ef4444' : 'var(--text-secondary)' }}>
                  USD {b.unhedgedExposure}M
                </td>
                <td className="py-1.5 pr-3 font-mono" style={{ color: 'var(--accent-gold)' }}>₹{b.forwardRate.toFixed(2)}</td>
                <td className="py-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>{b.instrument}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid var(--border-accent)' }}>
              <td className="pt-1.5 pr-3 font-semibold" style={{ color: 'var(--text-primary)' }}>WAHR</td>
              <td className="pt-1.5 pr-3 font-mono" style={{ color: 'var(--text-secondary)' }}>USD 140M</td>
              <td className="pt-1.5 pr-3 font-mono" style={{ color: '#10b981' }}>~53%</td>
              <td colSpan={2} />
              <td className="pt-1.5 font-mono font-bold" style={{ color: 'var(--accent-gold)' }}>₹{MODEL.wahr.toFixed(2)}</td>
              <td className="pt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Band: 83.50–85.50</td>
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
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>EUR 110M Separate Ladder (CBAM Exports)</div>
        <div className="grid grid-cols-2 gap-2">
          {EUR_LADDER.map((b, i) => (
            <div key={i} className="p-2 rounded text-xs" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-accent)' }}>
              <div className="flex justify-between">
                <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{b.bucket}</span>
                <span className="font-mono" style={{ color: '#10b981' }}>{(b.ratio * 100).toFixed(0)}% hedged</span>
              </div>
              <div className="mt-1 font-mono" style={{ color: 'var(--accent-gold)' }}>EUR/INR ₹{b.rate.toFixed(2)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{b.instrument} · EUR {b.exposure}M</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          EUR ladder managed independently from USD book · CBAM compliance drives EUR hedging timeline
        </p>
      </div>
    </div>
  );
}
