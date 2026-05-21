import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, LabelList,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 text-xs font-mono" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {p.value > 0 ? '+' : ''}{p.value?.toFixed(1)} bps
        </p>
      ))}
    </div>
  );
};

export function WaterfallChart({ ironOreShock, inrRate, freightShock }) {
  const unhedgedBps = [
    { label: 'Base', val: 0 },
    { label: 'Iron Ore', val: -ironOreShock * 647 },
    { label: 'INR FX', val: (inrRate - 83.25) * 7.6 },
    { label: 'Freight', val: -freightShock * 139 },
  ];
  const hedgedBps = unhedgedBps.map((d, i) => ({ label: d.label, val: d.val * (i === 0 ? 1 : 0.2) }));

  const data = [
    { name: 'Base', unhedged: 0, hedged: 0 },
    { name: 'Iron Ore', unhedged: Math.round(unhedgedBps[1].val * 10) / 10, hedged: Math.round(hedgedBps[1].val * 10) / 10 },
    { name: 'INR/FX', unhedged: Math.round(unhedgedBps[2].val * 10) / 10, hedged: Math.round(unhedgedBps[2].val * 0.2 * 10) / 10 },
    { name: 'Freight', unhedged: Math.round(unhedgedBps[3].val * 10) / 10, hedged: Math.round(hedgedBps[3].val * 10) / 10 },
    {
      name: 'Combined',
      unhedged: Math.round((unhedgedBps[1].val + unhedgedBps[2].val + unhedgedBps[3].val) * 10) / 10,
      hedged: Math.round((hedgedBps[1].val + unhedgedBps[2].val * 0.2 + hedgedBps[3].val) * 10) / 10,
    },
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}bps`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
          <ReferenceLine y={0} stroke="var(--border-accent)" strokeWidth={1} />
          <ReferenceLine
            y={-60}
            stroke="var(--red)"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: 'Board Floor (11.0%)', position: 'insideTopLeft', fill: 'var(--red)', fontSize: 9 }}
          />
          <Bar dataKey="unhedged" name="Unhedged" fill="#ef4444" opacity={0.8} radius={[2, 2, 0, 0]}>
            <LabelList dataKey="unhedged" position="top" style={{ fontSize: 9, fill: '#ef4444' }} formatter={v => v !== 0 ? `${v > 0 ? '+' : ''}${v}` : ''} />
          </Bar>
          <Bar dataKey="hedged" name="Hedged" fill="#10b981" opacity={0.8} radius={[2, 2, 0, 0]}>
            <LabelList dataKey="hedged" position="top" style={{ fontSize: 9, fill: '#10b981' }} formatter={v => v !== 0 ? `${v > 0 ? '+' : ''}${v}` : ''} />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
