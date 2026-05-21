import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { MODEL, NIGERIA_TIER1, NIGERIA_TIER2 } from '../../lib/constants';
import { calcNigeriaWithFacility } from '../../lib/calculations';
import { RAGBadge } from '../shared/RAGBadge';
import { Button } from '../ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildChartData(facilityApplied) {
  const { newBufferDays } = calcNigeriaWithFacility(MODEL.nigeriaBuffer, MODEL.nigeriaCreditFacility, MODEL.nigeriaMonthlyImport);
  return MONTHS.map((month) => ({
    month,
    days: facilityApplied ? newBufferDays : MODEL.nigeriaBufferDays,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded p-2 text-xs font-mono" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
      <p style={{ color: 'var(--text-primary)' }}>{label}: {payload[0].value.toFixed(1)} days</p>
    </div>
  );
};

export function NigeriaScreen() {
  const [facilityApplied, setFacilityApplied] = useState(false);
  const chartData = buildChartData(facilityApplied);
  const facilityResult = calcNigeriaWithFacility(MODEL.nigeriaBuffer, MODEL.nigeriaCreditFacility, MODEL.nigeriaMonthlyImport);

  const currentDays = facilityApplied ? facilityResult.newBufferDays : MODEL.nigeriaBufferDays;
  const ragStatus = currentDays >= 45 ? 'green' : currentDays >= 30 ? 'amber' : 'red';
  const gap = currentDays - MODEL.nigeriaGreenFloor;

  const tableRows = [
    { metric: 'Buffer (days)', current: `${currentDays.toFixed(2)} days`, floor: '≥ 45 days', gap: `${gap >= 0 ? '+' : ''}${gap.toFixed(2)} days`, rag: ragStatus },
    { metric: 'Buffer (USD)', current: `USD ${facilityApplied ? (MODEL.nigeriaBuffer + facilityResult.drawActual).toFixed(0) : MODEL.nigeriaBuffer}M`, floor: 'USD 60M', gap: `USD ${(facilityApplied ? (MODEL.nigeriaBuffer + facilityResult.drawActual) - 60 : MODEL.nigeriaBuffer - 60).toFixed(0)}M`, rag: (facilityApplied ? facilityResult.newBufferDays : MODEL.nigeriaBufferDays) >= 45 ? 'green' : 'amber' },
    { metric: '12-month avg', current: `${currentDays.toFixed(2)} days (flat)`, floor: '≥ 45 days', gap: facilityApplied ? 'Compliant' : 'Persistent AMBER', rag: ragStatus },
  ];

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-mono font-bold" style={{ color: ragStatus === 'green' ? 'var(--green)' : ragStatus === 'amber' ? 'var(--amber)' : 'var(--red)' }}>
                {currentDays.toFixed(1)} days
              </span>
              <RAGBadge status={ragStatus} size="md" />
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Hard-currency buffer · USD {facilityApplied ? `${(MODEL.nigeriaBuffer + facilityResult.drawActual).toFixed(0)}M` : `${MODEL.nigeriaBuffer}M`} · Policy floor: 45 days
            </div>
            {gap < 0 && !facilityApplied && (
              <div className="flex items-center gap-1 mt-1.5 text-sm" style={{ color: 'var(--amber)' }}>
                <AlertTriangle size={14} />
                {Math.abs(gap).toFixed(2)} days below policy floor
              </div>
            )}
            {facilityApplied && (
              <div className="flex items-center gap-1 mt-1.5 text-sm" style={{ color: 'var(--green)' }}>
                <CheckCircle size={14} />
                Facility active · Draw: USD {facilityResult.drawActual.toFixed(0)}M · Remaining: USD {(MODEL.nigeriaCreditFacility - facilityResult.drawActual).toFixed(0)}M · +{facilityResult.additionalCushionDays.toFixed(0)} day cushion
              </div>
            )}
          </div>
          <Button
            variant={facilityApplied ? 'outline' : 'default'}
            onClick={() => setFacilityApplied(!facilityApplied)}
            className={facilityApplied ? 'border-[var(--green-border)] text-[var(--green)] hover:bg-[var(--green-bg)]' : ''}
          >
            {facilityApplied ? 'Remove Facility' : 'Apply USD 100M Credit Facility'}
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          12-Month Hard-Currency Buffer Forecast
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}d`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceArea y1={45} y2={100} fill="#064e3b" fillOpacity={0.3} />
              <ReferenceArea y1={30} y2={45} fill="#451a03" fillOpacity={0.5} />
              <ReferenceArea y1={0} y2={30} fill="#450a0a" fillOpacity={0.4} />
              <ReferenceLine y={45} stroke="var(--amber)" strokeDasharray="6 3" label={{ value: 'Policy Floor 45d', position: 'right', fill: 'var(--amber)', fontSize: 10 }} />
              <ReferenceLine y={30} stroke="var(--red)" strokeDasharray="6 3" label={{ value: 'Danger 30d', position: 'right', fill: 'var(--red)', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="days"
                stroke={facilityApplied ? 'var(--green)' : 'var(--amber)'}
                strokeWidth={3}
                dot={false}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
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
                <TableCell style={{ color: 'var(--text-primary)' }}>{row.current}</TableCell>
                <TableCell style={{ color: 'var(--text-muted)' }}>{row.floor}</TableCell>
                <TableCell style={{ color: row.rag === 'green' ? 'var(--green)' : row.rag === 'amber' ? 'var(--amber)' : 'var(--red)' }}>{row.gap}</TableCell>
                <TableCell><RAGBadge status={row.rag} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { title: 'Tier 1: Immediate Operational Controls (Months 1–3)', items: NIGERIA_TIER1, defaultValue: 'tier-0' },
          { title: 'Tier 2: Structural Solutions (Months 3–12)', items: NIGERIA_TIER2, defaultValue: undefined },
        ].map((tier, i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <Accordion type="single" collapsible defaultValue={tier.defaultValue}>
              <AccordionItem value={`tier-${i}`} className="border-0">
                <AccordionTrigger
                  className="px-3 rounded-none"
                  style={{ background: 'var(--bg-card)' }}
                >
                  {tier.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="px-3 space-y-2" style={{ background: 'var(--bg-primary)' }}>
                    {tier.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-blue)' }} />
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
