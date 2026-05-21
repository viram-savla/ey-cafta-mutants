import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts';
import { calcScenario } from '../../lib/calculations';

// Pre-computed once at module load — no recalc needed per render
const PAYOFF_DATA = (() => {
  const data = [];
  for (let price = 80; price <= 180; price += 5) {
    const shock = (price - 120) / 120;
    const u = calcScenario({ ironOreShock: shock, inrRate: 83.25, freightShock: 0, hedgeRatio: 0 });
    const h = calcScenario({ ironOreShock: shock, inrRate: 83.25, freightShock: 0, hedgeRatio: 0.80 });
    data.push({
      price,
      unhedged: Math.round((u.margin - 0.116) * 10000 * 10) / 10,
      hedged: Math.round((h.margin - 0.116) * 10000 * 10) / 10,
      hedgeValue: Math.round((h.margin - u.margin) * 10000 * 10) / 10,
    });
  }
  return data;
})();

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded p-2 text-xs font-mono space-y-1"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Iron Ore: USD {label}/t</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.stroke }}>
          {p.name}: {p.value > 0 ? '+' : ''}{p.value} bps
        </p>
      ))}
      {payload.length === 2 && (
        <p style={{ color: 'var(--accent-gold)' }}>
          Hedge saving: +{(payload[1].value - payload[0].value).toFixed(1)} bps
        </p>
      )}
    </div>
  );
};

export function PayoffDiagram() {
  return (
    <div>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        EBITDA margin impact (bps vs 11.60% base) as iron ore price varies · INR 83.25/USD · Freight at base
      </p>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={PAYOFF_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="price"
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v}`}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}bps`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10, color: 'var(--text-secondary)', paddingTop: 4 }}
              formatter={(v) => v === 'unhedged' ? 'Unhedged (0%)' : '80% Hedged'}
            />

            {/* Board floor at −60bps */}
            <ReferenceLine
              y={-60}
              stroke="var(--red)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: 'Board Floor (11.0%)', position: 'insideTopLeft', fill: 'var(--red)', fontSize: 9 }}
            />

            {/* Base case price USD 120 */}
            <ReferenceLine
              x={120}
              stroke="var(--text-secondary)"
              strokeDasharray="4 2"
              label={{ value: 'Case $120', position: 'insideTopRight', fill: 'var(--text-secondary)', fontSize: 8 }}
            />

            {/* Live SGX spot USD 110 */}
            <ReferenceLine
              x={110}
              stroke="var(--amber)"
              strokeDasharray="4 2"
              label={{ value: 'SGX $110', position: 'insideTopLeft', fill: 'var(--amber)', fontSize: 8 }}
            />

            {/* Hedge value area between curves */}
            <ReferenceArea
              x1={120} x2={180}
              y1={-60} y2={0}
              fill="rgba(16,185,129,0.05)"
            />

            <Line
              dataKey="unhedged"
              name="unhedged"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#ef4444' }}
            />
            <Line
              dataKey="hedged"
              name="hedged"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
