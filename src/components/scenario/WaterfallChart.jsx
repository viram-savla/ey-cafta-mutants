import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  ReferenceLine, LabelList,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../ui/chart';

const chartConfig = {
  unhedged: { label: 'Unhedged', color: '#ef4444' },
  hedged: { label: 'Hedged', color: '#10b981' },
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
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>EBITDA Impact Waterfall</CardTitle>
          <CardDescription>Basis-point margin impact per risk factor · Unhedged vs Hedged</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <ComposedChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}bps`} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => [
                    `${value > 0 ? '+' : ''}${value?.toFixed(1)} bps`,
                    chartConfig[name]?.label || name,
                  ]}
                />
              }
            />
            <ReferenceLine y={0} stroke="var(--border-accent)" strokeWidth={1} />
            <ReferenceLine
              y={-60}
              stroke="var(--red)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: 'Board Floor (11.0%)', position: 'insideTopLeft', fill: 'var(--red)', fontSize: 9 }}
            />
            <Bar dataKey="unhedged" name="unhedged" fill="var(--color-unhedged)" opacity={0.8} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="unhedged" position="top" style={{ fontSize: 9, fill: '#ef4444' }} formatter={v => v !== 0 ? `${v > 0 ? '+' : ''}${v}` : ''} />
            </Bar>
            <Bar dataKey="hedged" name="hedged" fill="var(--color-hedged)" opacity={0.8} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="hedged" position="top" style={{ fontSize: 9, fill: '#10b981' }} formatter={v => v !== 0 ? `${v > 0 ? '+' : ''}${v}` : ''} />
            </Bar>
            <ChartLegend content={<ChartLegendContent />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
