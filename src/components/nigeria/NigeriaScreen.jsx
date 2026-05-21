import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ReferenceArea,
} from 'recharts';
import { AlertTriangle, CheckCircle2, TrendingUp, Banknote, Globe2 } from 'lucide-react';
import { MODEL, NIGERIA_TIER1, NIGERIA_TIER2 } from '../../lib/constants';
import { calcNigeriaWithFacility } from '../../lib/calculations';
import { RAGBadge } from '../shared/RAGBadge';
import { Button } from '../ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { AnimatedNumber } from '../shared/AnimatedNumber';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartConfig = {
  days: { label: 'Buffer Days' },
};

function buildChartData(facilityApplied) {
  const { newBufferDays } = calcNigeriaWithFacility(MODEL.nigeriaBuffer, MODEL.nigeriaCreditFacility, MODEL.nigeriaMonthlyImport);
  return MONTHS.map((month) => ({
    month,
    days: facilityApplied ? newBufferDays : MODEL.nigeriaBufferDays,
  }));
}

export function NigeriaScreen() {
  const [facilityApplied, setFacilityApplied] = useState(false);
  const chartData = buildChartData(facilityApplied);
  const facilityResult = calcNigeriaWithFacility(MODEL.nigeriaBuffer, MODEL.nigeriaCreditFacility, MODEL.nigeriaMonthlyImport);

  const currentDays = facilityApplied ? facilityResult.newBufferDays : MODEL.nigeriaBufferDays;
  const ragStatus = currentDays >= 45 ? 'green' : currentDays >= 30 ? 'amber' : 'red';
  const ragColor = ragStatus === 'green' ? 'var(--green-soft)' : ragStatus === 'amber' ? 'var(--amber-soft)' : 'var(--red-soft)';
  const gap = currentDays - MODEL.nigeriaGreenFloor;
  const usdBuffer = facilityApplied ? (MODEL.nigeriaBuffer + facilityResult.drawActual) : MODEL.nigeriaBuffer;

  const tableRows = [
    { metric: 'Buffer (days)', current: `${currentDays.toFixed(2)} days`, floor: '≥ 45 days', gap: `${gap >= 0 ? '+' : ''}${gap.toFixed(2)} days`, rag: ragStatus },
    { metric: 'Buffer (USD)', current: `USD ${usdBuffer.toFixed(0)}M`, floor: 'USD 60M', gap: `USD ${(usdBuffer - 60).toFixed(0)}M`, rag: currentDays >= 45 ? 'green' : 'amber' },
    { metric: '12-month avg', current: `${currentDays.toFixed(2)} days (flat)`, floor: '≥ 45 days', gap: facilityApplied ? 'Compliant' : 'Persistent AMBER', rag: ragStatus },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Status hero ───────────────────────────────────── */}
      <div className="glass-panel-strong p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-faint)' }}>
              <Globe2 size={11} />
              Nigeria Liquidity · Hard-Currency Buffer
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className="font-semibold tabular-nums"
                style={{ color: ragColor, fontSize: 38, letterSpacing: '-0.035em', lineHeight: 1 }}
              >
                <AnimatedNumber value={currentDays} decimals={1} />
              </span>
              <span className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>days of cover</span>
              <RAGBadge status={ragStatus} size="md" />
            </div>
            <div className="text-[12px] mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-mono tabular-nums">USD {usdBuffer.toFixed(0)}M</span> reserves · monthly import
              {' '}<span className="font-mono tabular-nums">USD {MODEL.nigeriaMonthlyImport}M</span> · policy floor
              {' '}<span className="font-mono tabular-nums" style={{ color: 'var(--amber-soft)' }}>45 days</span>
            </div>
            {gap < 0 && !facilityApplied && (
              <div className="flex items-center gap-1.5 mt-3 text-[12px] px-2.5 py-1 rounded-md w-fit"
                style={{ color: 'var(--amber-soft)', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)' }}>
                <AlertTriangle size={12} />
                <span className="font-mono tabular-nums">{Math.abs(gap).toFixed(2)} days</span>
                <span>below policy floor</span>
              </div>
            )}
            {facilityApplied && (
              <div className="flex items-center gap-1.5 mt-3 text-[12px] px-2.5 py-1 rounded-md w-fit"
                style={{ color: 'var(--green-soft)', background: 'var(--green-bg)', border: '1px solid var(--green-border)' }}>
                <CheckCircle2 size={12} />
                <span>Facility active · draw <span className="font-mono tabular-nums">USD {facilityResult.drawActual.toFixed(0)}M</span></span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span className="font-mono tabular-nums">+{facilityResult.additionalCushionDays.toFixed(0)} day cushion</span>
              </div>
            )}
          </div>
          <Button
            variant={facilityApplied ? 'outline' : 'default'}
            onClick={() => setFacilityApplied(!facilityApplied)}
            className={facilityApplied ? 'border-[var(--green-border)] text-[var(--green-soft)] hover:bg-[var(--green-bg)]' : ''}
          >
            <Banknote size={14} />
            {facilityApplied ? 'Remove Facility' : 'Apply USD 100M Credit Facility'}
          </Button>
        </div>

        {/* Quick stats row */}
        <div className="mt-5 pt-5 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Monthly import', value: `$${MODEL.nigeriaMonthlyImport}M`, hint: 'avg burn rate' },
            { label: 'Reserves', value: `$${MODEL.nigeriaBuffer}M`, hint: 'current pool' },
            { label: 'Credit facility', value: `$${MODEL.nigeriaCreditFacility}M`, hint: facilityApplied ? `${facilityResult.drawActual.toFixed(0)}M drawn` : 'committed standby' },
            { label: 'Days of cover', value: `${currentDays.toFixed(1)}d`, hint: ragStatus === 'green' ? 'compliant' : `${Math.abs(gap).toFixed(0)}d gap` },
          ].map((s) => (
            <div key={s.label} className="leading-tight">
              <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
              <div className="font-semibold tabular-nums tracking-tight mt-1" style={{ color: 'var(--text-primary)', fontSize: 16, letterSpacing: '-0.015em' }}>
                {s.value}
              </div>
              <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Chart ─────────────────────────────────────────── */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-[14px] tracking-tight">12-Month Hard-Currency Buffer Forecast</CardTitle>
            <CardDescription className="text-[11.5px]">Policy floor 45 days · Danger threshold 30 days</CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-mono">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(16,185,129,0.4)' }} /><span style={{ color: 'var(--green-soft)' }}>≥45d</span></span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(245,158,11,0.4)' }} /><span style={{ color: 'var(--amber-soft)' }}>30–45d</span></span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(244,63,94,0.4)' }} /><span style={{ color: 'var(--red-soft)' }}>&lt;30d</span></span>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <LineChart data={chartData} margin={{ top: 8, right: 90, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}d`} width={36} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => [`${value.toFixed(1)} days`, 'Buffer']}
                  />
                }
              />
              <ReferenceArea y1={45} y2={100} fill="#10b981" fillOpacity={0.06} />
              <ReferenceArea y1={30} y2={45} fill="#f59e0b" fillOpacity={0.08} />
              <ReferenceArea y1={0} y2={30} fill="#f43f5e" fillOpacity={0.10} />
              <ReferenceLine
                y={45}
                stroke="var(--amber-soft)"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: 'Policy Floor — 45d', position: 'right', fill: 'var(--amber-soft)', fontSize: 10.5, offset: 6 }}
              />
              <ReferenceLine
                y={30}
                stroke="var(--red-soft)"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: 'Danger — 30d', position: 'right', fill: 'var(--red-soft)', fontSize: 10.5, offset: 6 }}
              />
              <Line
                type="monotone"
                dataKey="days"
                stroke={facilityApplied ? 'var(--green-soft)' : 'var(--amber-soft)'}
                strokeWidth={2.5}
                dot={{ r: 3, fill: facilityApplied ? 'var(--green-soft)' : 'var(--amber-soft)', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--bg-primary)' }}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ─── Status table ──────────────────────────────────── */}
      <div className="glass-panel-strong overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <TrendingUp size={13} style={{ color: 'var(--accent-teal-soft)' }} />
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
            Compliance Snapshot
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {['Metric', 'Current', 'Policy Floor', 'Gap', 'RAG'].map(h => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((row, i) => (
              <TableRow key={i}>
                <TableCell style={{ color: 'var(--text-secondary)' }}>{row.metric}</TableCell>
                <TableCell className="tabular-nums font-medium" style={{ color: 'var(--text-primary)' }}>{row.current}</TableCell>
                <TableCell className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{row.floor}</TableCell>
                <TableCell className="tabular-nums" style={{ color: row.rag === 'green' ? 'var(--green-soft)' : row.rag === 'amber' ? 'var(--amber-soft)' : 'var(--red-soft)' }}>{row.gap}</TableCell>
                <TableCell><RAGBadge status={row.rag} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ─── Tier playbook ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { title: 'Tier 1', subtitle: 'Immediate Operational Controls', range: 'Months 1–3', items: NIGERIA_TIER1, defaultValue: 'tier-0', accent: 'var(--accent-teal-soft)' },
          { title: 'Tier 2', subtitle: 'Structural Solutions', range: 'Months 3–12', items: NIGERIA_TIER2, defaultValue: undefined, accent: 'var(--accent-violet)' },
        ].map((tier, i) => (
          <div key={i} className="glass-panel overflow-hidden">
            <Accordion type="single" collapsible defaultValue={tier.defaultValue}>
              <AccordionItem value={`tier-${i}`} className="border-0">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2.5 text-left">
                    <span
                      className="text-[10.5px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md font-mono"
                      style={{ color: tier.accent, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                    >
                      {tier.title}
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{tier.subtitle}</span>
                    <span className="text-[10.5px] font-mono" style={{ color: 'var(--text-faint)' }}>· {tier.range}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="px-4 pb-3 space-y-2">
                    {tier.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full" style={{ background: tier.accent }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
