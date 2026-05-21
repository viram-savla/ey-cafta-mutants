import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts';

// Approximate SOFR trajectory (quarterly data)
const SOFR_DATA = [
  { period: 'Q1\'23', rate: 4.55, type: 'actual' },
  { period: 'Q2\'23', rate: 5.05, type: 'actual' },
  { period: 'Q3\'23', rate: 5.30, type: 'actual' },
  { period: 'Q4\'23', rate: 5.30, type: 'actual' },
  { period: 'Q1\'24', rate: 5.30, type: 'actual' },
  { period: 'Q2\'24', rate: 5.30, type: 'actual' },
  { period: 'Q3\'24', rate: 5.20, type: 'actual' },
  { period: 'Q4\'24', rate: 4.60, type: 'actual' },
  { period: 'Q1\'25', rate: 4.30, type: 'actual' },
  { period: 'Q2\'25', rate: 4.05, type: 'actual' },
  { period: 'Q3\'25', rate: 3.90, type: 'actual' },
  { period: 'Q4\'25', rate: 3.70, type: 'actual' },
  { period: 'Now', rate: 3.59, type: 'current' },
  { period: 'Q3\'26F', rate: 3.35, type: 'forecast' },
  { period: 'Q4\'26F', rate: 3.20, type: 'forecast' },
  { period: 'Q1\'27F', rate: 3.00, type: 'forecast' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded p-2 text-xs font-mono" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
      <p style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ color: d.payload.type === 'forecast' ? '#3b82f6' : d.payload.type === 'current' ? '#10b981' : 'var(--text-primary)' }}>
        SOFR: {d.value?.toFixed(2)}%
      </p>
      {d.payload.type === 'forecast' && <p style={{ color: 'var(--text-muted)' }}>Forecast</p>}
      {d.value >= 3.0 && d.value <= 4.5 && <p style={{ color: '#8b5cf6' }}>Within collar band</p>}
    </div>
  );
};

export function SOFRCollarChart() {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            SOFR Trajectory & Collar Structure
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            USD 90M collared (3.00%–4.50%) + USD 60M floating · All-in: 5.79%
          </p>
        </div>
        <div className="flex flex-col gap-1 text-xs font-mono text-right">
          <span style={{ color: '#10b981' }}>● SOFR 3.59% (current)</span>
          <span style={{ color: '#ef4444' }}>— Cap 4.50%</span>
          <span style={{ color: '#3b82f6' }}>— Floor 3.00%</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={SOFR_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[2.5, 5.8]}
              tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v.toFixed(1)}%`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Collar inactive band */}
            <ReferenceArea
              y1={3.0}
              y2={4.5}
              fill="#8b5cf6"
              fillOpacity={0.06}
              label={{ value: 'Collar Band', position: 'insideTopRight', fill: '#8b5cf6', fontSize: 9 }}
            />

            {/* Cap line */}
            <ReferenceLine
              y={4.5}
              stroke="#ef4444"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: 'Cap 4.50%', position: 'insideTopRight', fill: '#ef4444', fontSize: 9 }}
            />

            {/* Floor line */}
            <ReferenceLine
              y={3.0}
              stroke="#3b82f6"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: 'Floor 3.00%', position: 'insideBottomRight', fill: '#3b82f6', fontSize: 9 }}
            />

            {/* Current SOFR */}
            <ReferenceLine
              y={3.59}
              stroke="#10b981"
              strokeDasharray="3 2"
              strokeWidth={1}
              label={{ value: '3.59% Today', position: 'insideTopLeft', fill: '#10b981', fontSize: 9 }}
            />

            {/* Forecast split at "Now" */}
            <ReferenceLine
              x="Now"
              stroke="var(--border-accent)"
              strokeDasharray="4 2"
              label={{ value: 'Today', position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 8 }}
            />

            <Line
              dataKey="rate"
              stroke="var(--text-secondary)"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const color = payload.type === 'forecast' ? '#3b82f6' : payload.type === 'current' ? '#10b981' : 'var(--text-secondary)';
                return (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={payload.type === 'current' ? 5 : 3}
                    fill={color}
                    stroke={color}
                    strokeWidth={1}
                  />
                );
              }}
              strokeDasharray={(d) => undefined}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Collared (USD 90M)', value: '3.00–4.50%', note: '60% of USD 150M loan', color: '#8b5cf6' },
          { label: 'Floating (USD 60M)', value: 'SOFR + 220bps', note: 'Currently 5.79%', color: '#f59e0b' },
          { label: 'Current SOFR', value: '3.59%', note: 'Below cap — collar inactive', color: '#10b981' },
        ].map(item => (
          <div key={item.label} className="p-2 rounded text-xs" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-accent)' }}>
            <div style={{ color: 'var(--text-muted)' }}>{item.label}</div>
            <div className="font-mono font-bold mt-0.5" style={{ color: item.color }}>{item.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{item.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
