import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ReferenceLine, Cell,
} from 'recharts';
import { Play, RefreshCw } from 'lucide-react';
import { runMonteCarlo } from '../../lib/calculations';
import { RAGBadge } from '../shared/RAGBadge';
import { ScenarioSlider } from '../scenario/ScenarioSlider';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { AnimatedNumber } from '../shared/AnimatedNumber';

function buildHistogram(paths, binWidth = 0.005) {
  if (!paths.length) return [];
  const min = Math.floor(Math.min(...paths) / binWidth) * binWidth;
  const max = Math.ceil(Math.max(...paths) / binWidth) * binWidth;
  const bins = [];
  for (let v = min; v <= max; v += binWidth) {
    const count = paths.filter(p => p >= v && p < v + binWidth).length;
    bins.push({ margin: v * 100, count, centerPct: (v + binWidth / 2) * 100 });
  }
  return bins;
}

// Build aligned bins for two distributions on the same x-axis
function buildOverlaidHistogram(hedgedPaths, unhedgedPaths, binWidth = 0.005) {
  if (!hedgedPaths.length || !unhedgedPaths.length) return [];
  const allPaths = [...hedgedPaths, ...unhedgedPaths];
  const min = Math.floor(Math.min(...allPaths) / binWidth) * binWidth;
  const max = Math.ceil(Math.max(...allPaths) / binWidth) * binWidth;
  const bins = [];
  for (let v = min; v <= max; v += binWidth) {
    const hedged = hedgedPaths.filter(p => p >= v && p < v + binWidth).length;
    const unhedged = unhedgedPaths.filter(p => p >= v && p < v + binWidth).length;
    bins.push({
      margin: v * 100,
      centerPct: (v + binWidth / 2) * 100,
      hedged,
      unhedged,
    });
  }
  return bins;
}

const singleChartConfig = {
  count: { label: 'Paths' },
};
const overlaidChartConfig = {
  unhedged: { label: 'Unhedged', color: '#f43f5e' },
  hedged: { label: '80% Hedged', color: '#22c55e' },
};

export function MCScreen({ onCfarUpdate }) {
  const [nPaths, setNPaths] = useState(1000);
  const [fxStd, setFxStd] = useState(4.0);
  const [ironOreStd, setIronOreStd] = useState(20);
  const [hedgeRatio, setHedgeRatio] = useState(0.80);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compareResults, setCompareResults] = useState(null);

  const runSimulation = useCallback((ratio = hedgeRatio) => {
    setLoading(true);
    setTimeout(() => {
      const res = runMonteCarlo(nPaths, fxStd, ironOreStd, ratio);
      setResults(res);
      if (onCfarUpdate) onCfarUpdate(res.p5);
      setLoading(false);
    }, 300);
  }, [nPaths, fxStd, ironOreStd, hedgeRatio, onCfarUpdate]);

  // Auto-run on mount so the page lands with results visible — no empty state.
  useEffect(() => {
    const res = runMonteCarlo(nPaths, fxStd, ironOreStd, hedgeRatio);
    setResults(res);
    if (onCfarUpdate) onCfarUpdate(res.p5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runComparison = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const res80 = runMonteCarlo(nPaths, fxStd, ironOreStd, 0.80);
      const res0 = runMonteCarlo(nPaths, fxStd, ironOreStd, 0);
      setResults(res80);
      setCompareResults(res0);
      setShowComparison(true);
      if (onCfarUpdate) onCfarUpdate(res80.p5);
      setLoading(false);
    }, 400);
  }, [nPaths, fxStd, ironOreStd, onCfarUpdate]);

  const histogram = results ? buildHistogram(results.paths) : [];
  const overlaidHistogram = (showComparison && results && compareResults)
    ? buildOverlaidHistogram(results.paths, compareResults.paths)
    : null;

  const p5Pct = results ? results.p5 * 100 : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ─── Parameters panel ─────────────────────────────── */}
        <div className="glass-panel-strong p-5 space-y-5">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
              Simulation Parameters
            </h3>
            <span className="text-[10.5px]" style={{ color: 'var(--text-faint)' }}>Monte Carlo · 1k+ paths</span>
          </div>

          <ScenarioSlider
            label="Number of Paths"
            hint="More paths = smoother distribution"
            value={nPaths}
            min={100} max={5000} step={100}
            onChange={setNPaths}
            formatValue={v => v.toLocaleString()}
          />
          <ScenarioSlider
            label="FX Volatility"
            hint="σ INR/USD — historical: ±3.5"
            value={fxStd}
            min={1.0} max={5.0} step={0.1}
            onChange={setFxStd}
            formatValue={v => `±${v.toFixed(1)}`}
          />
          <ScenarioSlider
            label="Iron Ore Volatility"
            hint="σ USD/t — historical: ±18"
            value={ironOreStd}
            min={4} max={30} step={1}
            onChange={setIronOreStd}
            formatValue={v => `±${v.toFixed(0)}`}
          />

          {/* Hedge segmented control */}
          <div>
            <div className="text-[12px] font-medium tracking-tight mb-2" style={{ color: 'var(--text-secondary)' }}>
              Hedge Ratio
            </div>
            <div className="segmented w-full" style={{ display: 'flex' }}>
              {[
                { v: 0,    label: 'Unhedged',    sub: '0% coverage' },
                { v: 0.80, label: '80% Hedged',  sub: 'SGX / FFA / FX' },
              ].map(opt => (
                <button
                  key={opt.v}
                  data-active={hedgeRatio === opt.v}
                  onClick={() => setHedgeRatio(opt.v)}
                  style={{ flex: 1, padding: '8px 12px', textAlign: 'center' }}
                >
                  <div className="text-[12px] font-semibold leading-tight">{opt.label}</div>
                  <div className="text-[10px] mt-0.5 opacity-70 font-normal">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => runSimulation()}
              disabled={loading}
              className="flex-1"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {loading ? 'Running…' : 'Run Simulation'}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runComparison}
            disabled={loading}
            className="w-full"
          >
            Compare 0% vs 80% Hedge
          </Button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-3">
          {results && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: '5th Percentile (CFaR)',  raw: results.p5 * 100,           decimals: 2, suffix: '%', target: '≥ 8.0%',            status: results.p5 >= 0.08 ? 'green' : 'red' },
                { label: 'Mean Margin',            raw: results.mean * 100,         decimals: 2, suffix: '%', target: 'Base: 11.60%',     status: 'green' },
                { label: 'Above Board Floor',      raw: results.pctAboveFloor,      decimals: 1, suffix: '%', target: 'Of paths ≥ 11.0%', status: results.pctAboveFloor >= 80 ? 'green' : 'amber' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20, delay: i * 0.04 }}
                  className="glass-panel-subtle p-3.5"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <span className="text-[10.5px] font-medium uppercase tracking-[0.1em] leading-tight" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                    <RAGBadge status={stat.status} />
                  </div>
                  <div className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)', fontSize: 22, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                    <AnimatedNumber value={stat.raw} decimals={stat.decimals} suffix={stat.suffix} />
                  </div>
                  <div className="text-[11px] mt-0.5 font-mono tabular-nums" style={{ color: 'var(--text-faint)' }}>{stat.target}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Histogram */}
          <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>
                  {overlaidHistogram ? 'Distribution Overlay — Unhedged vs 80% Hedged' : `EBITDA Margin Distribution`}
                </CardTitle>
                <CardDescription>
                  {overlaidHistogram ? 'Path-level comparison of hedge benefit' : `${nPaths.toLocaleString()} simulated paths · P5 = CFaR floor`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              {results ? (
                <ChartContainer
                  config={overlaidHistogram ? overlaidChartConfig : singleChartConfig}
                  className="aspect-auto h-[220px] w-full"
                >
                  {overlaidHistogram ? (
                    <BarChart data={overlaidHistogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="margin" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} interval={Math.floor(overlaidHistogram.length / 8)} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            labelFormatter={(v) => `Margin: ${Number(v).toFixed(1)}%`}
                            formatter={(value, name) => [
                              `${value} paths`,
                              overlaidChartConfig[name]?.label || name,
                            ]}
                          />
                        }
                      />
                      <ReferenceLine x={8.0} stroke="var(--red)" strokeDasharray="4 2" label={{ value: 'CFaR 8%', fill: 'var(--red)', fontSize: 9, position: 'insideTopLeft' }} />
                      <ReferenceLine x={11.0} stroke="var(--amber)" strokeDasharray="4 2" label={{ value: 'Floor 11%', fill: 'var(--amber)', fontSize: 9, position: 'insideTopLeft' }} />
                      {compareResults?.p5 && (
                        <ReferenceLine x={parseFloat((compareResults.p5 * 100).toFixed(2))} stroke="#f43f5e" strokeDasharray="3 2" label={{ value: `P5 ${(compareResults.p5 * 100).toFixed(1)}%`, fill: '#f43f5e', fontSize: 8, position: 'insideBottomLeft' }} />
                      )}
                      {p5Pct && (
                        <ReferenceLine x={parseFloat(p5Pct.toFixed(2))} stroke="#22c55e" strokeDasharray="3 2" label={{ value: `P5 ${p5Pct.toFixed(1)}%`, fill: '#22c55e', fontSize: 8, position: 'insideTopRight' }} />
                      )}
                      <Bar dataKey="unhedged" fill="var(--color-unhedged)" fillOpacity={0.55} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="hedged" fill="var(--color-hedged)" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={histogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="margin" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} interval={Math.floor(histogram.length / 8)} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            labelFormatter={(v) => `Margin: ${Number(v).toFixed(2)}%`}
                            formatter={(value) => [`${value} paths`, 'Count']}
                          />
                        }
                      />
                      <ReferenceLine x={8.0} stroke="var(--red)" strokeDasharray="4 2" label={{ value: 'CFaR Floor 8%', fill: 'var(--red)', fontSize: 9, position: 'insideTopLeft' }} />
                      <ReferenceLine x={11.0} stroke="var(--amber)" strokeDasharray="4 2" label={{ value: 'Board Floor 11%', fill: 'var(--amber)', fontSize: 9, position: 'insideTopLeft' }} />
                      {p5Pct && (
                        <ReferenceLine x={parseFloat(p5Pct.toFixed(2))} stroke="var(--accent-teal)" strokeDasharray="4 2" label={{ value: `P5 ${p5Pct.toFixed(1)}%`, fill: 'var(--accent-teal)', fontSize: 9, position: 'insideTopLeft' }} />
                      )}
                      <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {histogram.map((entry, i) => (
                          <Cell key={i} fill={entry.centerPct < 8 ? '#f43f5e' : entry.centerPct < 11 ? '#ff7a17' : '#22c55e'} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ChartContainer>
              ) : (
                <div className="h-48 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                  <div className="text-center">
                    <Play size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Run simulation to see distribution</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CFaR Hedge Comparison side-by-side */}
          {showComparison && results && compareResults && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-strong p-5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                CFaR Comparison: Unhedged vs 80% Hedged
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  {
                    label: 'Unhedged (0%)',
                    p5: compareResults.p5,
                    mean: compareResults.mean,
                    pct: compareResults.pctAboveFloor,
                    color: '#f43f5e',
                    bg: 'var(--red-bg)',
                    border: 'var(--red-border)',
                  },
                  {
                    label: '80% Hedged',
                    p5: results.p5,
                    mean: results.mean,
                    pct: results.pctAboveFloor,
                    color: '#22c55e',
                    bg: 'var(--green-bg)',
                    border: 'var(--green-border)',
                  },
                ].map((col) => (
                  <div key={col.label} className="rounded p-3" style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: col.color }}>{col.label}</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>P5 (CFaR)</span>
                        <span className="font-mono font-bold" style={{ color: col.color }}>{(col.p5 * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Mean</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{(col.mean * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Above floor</span>
                        <span className="font-mono" style={{ color: col.pct >= 80 ? '#22c55e' : '#ff7a17' }}>{col.pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Improvement summary */}
              <div className="p-2 rounded text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid var(--amber-border)' }}>
                <span style={{ color: 'var(--amber)' }} className="font-semibold">Hedge benefit: </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  P5 improves from{' '}
                  <span className="font-mono" style={{ color: '#f43f5e' }}>{(compareResults.p5 * 100).toFixed(2)}%</span>
                  {' '}→{' '}
                  <span className="font-mono" style={{ color: '#22c55e' }}>{(results.p5 * 100).toFixed(2)}%</span>
                  {' '}(+{((results.p5 - compareResults.p5) * 10000).toFixed(0)}bps).{' '}
                  This is the margin predictability value of 80% hedging — compressing the left tail without
                  capping the upside beyond hedge-adjusted outcomes.
                </span>
              </div>
            </motion.div>
          )}

          {/* Interpretation */}
          {results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg p-4 text-sm"
              style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--text-secondary)' }}
            >
              <p style={{ color: 'var(--green)' }} className="font-semibold mb-1">CFaR Interpretation</p>
              <p>
                The 5th percentile EBITDA margin across {nPaths.toLocaleString()} simulated paths is{' '}
                <span className="font-mono font-bold" style={{ color: results.p5 >= 0.08 ? 'var(--green)' : 'var(--red)' }}>
                  {(results.p5 * 100).toFixed(2)}%
                </span>
                {' '}—{' '}
                {results.p5 >= 0.08 ? 'comfortably above' : 'BELOW'} the 8.0% CFaR floor.
                With {hedgeRatio === 0.80 ? '80% hedging' : 'no hedging'}, the left tail is{' '}
                {hedgeRatio === 0.80 ? 'compressed — fewer than 5% of scenarios breach the floor.' : 'exposed — significant breach probability observed.'}
                {' '}This is what ±20bps EBITDA margin predictability looks like.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
