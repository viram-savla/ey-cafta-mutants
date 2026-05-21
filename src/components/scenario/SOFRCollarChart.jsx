import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ReferenceArea,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

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

const chartConfig = {
  rate: { label: 'SOFR Rate' },
};

export function SOFRCollarChart() {
  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>SOFR Trajectory & Collar Structure</CardTitle>
          <CardDescription>
            USD 90M collared (3.00%–4.50%) + USD 60M floating · All-in: 5.79%
          </CardDescription>
        </div>
        <div className="hidden sm:flex flex-col gap-1 text-xs font-mono text-right shrink-0">
          <span style={{ color: '#10b981' }}>● SOFR 3.59% (current)</span>
          <span style={{ color: '#ef4444' }}>— Cap 4.50%</span>
          <span style={{ color: '#3b82f6' }}>— Floor 3.00%</span>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
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
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, item) => {
                    const type = item.payload?.type;
                    const suffix = type === 'forecast' ? ' (Forecast)' : type === 'current' ? ' (Today)' : '';
                    return [`${value?.toFixed(2)}%${suffix}`, 'SOFR'];
                  }}
                />
              }
            />
            <ReferenceArea
              y1={3.0}
              y2={4.5}
              fill="#8b5cf6"
              fillOpacity={0.06}
              label={{ value: 'Collar Band', position: 'insideTopRight', fill: '#8b5cf6', fontSize: 9 }}
            />
            <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5}
              label={{ value: 'Cap 4.50%', position: 'insideTopRight', fill: '#ef4444', fontSize: 9 }} />
            <ReferenceLine y={3.0} stroke="#3b82f6" strokeDasharray="6 3" strokeWidth={1.5}
              label={{ value: 'Floor 3.00%', position: 'insideBottomRight', fill: '#3b82f6', fontSize: 9 }} />
            <ReferenceLine y={3.59} stroke="#10b981" strokeDasharray="3 2" strokeWidth={1}
              label={{ value: '3.59% Today', position: 'insideTopLeft', fill: '#10b981', fontSize: 9 }} />
            <ReferenceLine x="Now" stroke="var(--border-accent)" strokeDasharray="4 2"
              label={{ value: 'Today', position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 8 }} />
            <Line
              dataKey="rate"
              stroke="var(--text-secondary)"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const color = payload.type === 'forecast' ? '#3b82f6' : payload.type === 'current' ? '#10b981' : 'var(--text-secondary)';
                return (
                  <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy}
                    r={payload.type === 'current' ? 5 : 3}
                    fill={color} stroke={color} strokeWidth={1} />
                );
              }}
            />
          </LineChart>
        </ChartContainer>

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
      </CardContent>
    </Card>
  );
}
