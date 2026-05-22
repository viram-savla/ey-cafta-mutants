import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ReferenceArea,
} from 'recharts';
import { calcScenario } from '../../lib/calculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../ui/chart';

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
    });
  }
  return data;
})();

const chartConfig = {
  unhedged: { label: 'Unhedged (0%)', color: '#f43f5e' },
  hedged: { label: '80% Hedged', color: '#22c55e' },
};

export function PayoffDiagram() {
  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Iron Ore Payoff Diagram</CardTitle>
          <CardDescription>
            EBITDA margin impact (bps vs 11.60% base) · INR 83.25/USD · Freight at base
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
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
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(v) => `Iron Ore: USD ${v}/t`}
                  formatter={(value, name) => [
                    `${value > 0 ? '+' : ''}${value} bps`,
                    chartConfig[name]?.label || name,
                  ]}
                />
              }
            />
            <ReferenceLine
              y={-60}
              stroke="var(--red)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: 'Board Floor (11.0%)', position: 'insideTopLeft', fill: 'var(--red)', fontSize: 9 }}
            />
            <ReferenceLine
              x={120}
              stroke="var(--text-secondary)"
              strokeDasharray="4 2"
              label={{ value: 'Case $120', position: 'insideTopRight', fill: 'var(--text-secondary)', fontSize: 8 }}
            />
            <ReferenceLine
              x={110}
              stroke="var(--amber)"
              strokeDasharray="4 2"
              label={{ value: 'SGX $110', position: 'insideTopLeft', fill: 'var(--amber)', fontSize: 8 }}
            />
            <ReferenceArea x1={120} x2={180} y1={-60} y2={0} fill="rgba(16,185,129,0.05)" />
            <Line
              dataKey="unhedged"
              stroke="var(--color-unhedged)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              dataKey="hedged"
              stroke="var(--color-hedged)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
