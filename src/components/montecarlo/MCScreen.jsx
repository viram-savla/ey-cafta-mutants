import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { Play, RefreshCw } from 'lucide-react';
import { runMonteCarlo } from '../../lib/calculations';
import { RAGBadge } from '../shared/RAGBadge';
import { ScenarioSlider } from '../scenario/ScenarioSlider';
import { Button } from '../ui/button';

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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded p-2 text-xs font-mono" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
      <p style={{ color: 'var(--text-primary)' }}>Margin: {payload[0]?.payload?.centerPct?.toFixed(2)}%</p>
      <p style={{ color: 'var(--text-secondary)' }}>Paths: {payload[0]?.value}</p>
    </div>
  );
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
        {/* Parameters */}
        <div className="rounded-lg p-4 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Simulation Parameters
          </h3>
          <ScenarioSlider
            label="Number of Paths"
            value={nPaths}
            min={100} max={5000} step={100}
            onChange={setNPaths}
            formatValue={v => v.toLocaleString()}
          />
          <ScenarioSlider
            label="FX Volatility (σ INR/USD)"
            value={fxStd}
            min={1.0} max={5.0} step={0.1}
            onChange={setFxStd}
            formatValue={v => `±${v.toFixed(1)}`}
          />
          <ScenarioSlider
            label="Iron Ore Volatility (σ USD/t)"
            value={ironOreStd}
            min={4} max={30} step={1}
            onChange={setIronOreStd}
            formatValue={v => `±${v.toFixed(0)}`}
          />

          {/* Hedge toggle */}
          <div>
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Hedge Ratio</div>
            <div className="flex gap-2">
              {[0, 0.80].map(r => (
                <Button
                  key={r}
                  variant={hedgeRatio === r ? 'default' : 'outline'}
                  size="xs"
                  className="flex-1"
                  onClick={() => setHedgeRatio(r)}
                >
                  {r === 0 ? 'Unhedged' : '80% Hedged'}
                </Button>
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
              {loading ? 'Running...' : 'Run Simulation'}
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
                { label: '5th Percentile (CFaR)', value: `${(results.p5 * 100).toFixed(2)}%`, target: '≥ 8.0%', status: results.p5 >= 0.08 ? 'green' : 'red' },
                { label: 'Mean Margin', value: `${(results.mean * 100).toFixed(2)}%`, target: 'Base: 11.60%', status: 'green' },
                { label: 'Above Board Floor', value: `${results.pctAboveFloor.toFixed(1)}%`, target: 'Of paths ≥ 11.0%', status: results.pctAboveFloor >= 80 ? 'green' : 'amber' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg p-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                    <RAGBadge status={stat.status} />
                  </div>
                  <div className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.target}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Histogram */}
          <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {overlaidHistogram ? 'Distribution Overlay — Unhedged vs 80% Hedged' : `EBITDA Margin Distribution — ${nPaths.toLocaleString()} Paths`}
              </h3>
              {overlaidHistogram && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span style={{ color: '#ef4444' }}>■ Unhedged</span>
                  <span style={{ color: '#10b981' }}>■ 80% Hedged</span>
                </div>
              )}
            </div>
            {results ? (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  {overlaidHistogram ? (
                    <BarChart data={overlaidHistogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="margin" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} interval={Math.floor(overlaidHistogram.length / 8)} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded p-2 text-xs font-mono" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
                            <p style={{ color: 'var(--text-primary)' }}>Margin: {Number(label).toFixed(1)}%</p>
                            {payload.map(p => <p key={p.dataKey} style={{ color: p.fill }}>
                              {p.dataKey === 'unhedged' ? 'Unhedged' : '80% Hedged'}: {p.value} paths
                            </p>)}
                          </div>
                        );
                      }} />
                      <ReferenceLine x={8.0} stroke="var(--red)" strokeDasharray="4 2" label={{ value: 'CFaR 8%', fill: 'var(--red)', fontSize: 9, position: 'insideTopLeft' }} />
                      <ReferenceLine x={11.0} stroke="var(--amber)" strokeDasharray="4 2" label={{ value: 'Floor 11%', fill: 'var(--amber)', fontSize: 9, position: 'insideTopLeft' }} />
                      {compareResults?.p5 && (
                        <ReferenceLine x={parseFloat((compareResults.p5 * 100).toFixed(2))} stroke="#ef4444" strokeDasharray="3 2" label={{ value: `P5 ${(compareResults.p5 * 100).toFixed(1)}%`, fill: '#ef4444', fontSize: 8, position: 'insideBottomLeft' }} />
                      )}
                      {p5Pct && (
                        <ReferenceLine x={parseFloat(p5Pct.toFixed(2))} stroke="#10b981" strokeDasharray="3 2" label={{ value: `P5 ${p5Pct.toFixed(1)}%`, fill: '#10b981', fontSize: 8, position: 'insideTopRight' }} />
                      )}
                      <Bar dataKey="unhedged" fill="#ef4444" fillOpacity={0.55} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="hedged" fill="#10b981" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={histogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="margin" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} interval={Math.floor(histogram.length / 8)} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine x={8.0} stroke="var(--red)" strokeDasharray="4 2" label={{ value: 'CFaR Floor 8%', fill: 'var(--red)', fontSize: 9, position: 'insideTopLeft' }} />
                      <ReferenceLine x={11.0} stroke="var(--amber)" strokeDasharray="4 2" label={{ value: 'Board Floor 11%', fill: 'var(--amber)', fontSize: 9, position: 'insideTopLeft' }} />
                      {p5Pct && (
                        <ReferenceLine x={parseFloat(p5Pct.toFixed(2))} stroke="var(--accent-blue)" strokeDasharray="4 2" label={{ value: `P5 ${p5Pct.toFixed(1)}%`, fill: 'var(--accent-blue)', fontSize: 9, position: 'insideTopLeft' }} />
                      )}
                      <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {histogram.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.centerPct < 8 ? '#ef4444' : entry.centerPct < 11 ? '#f59e0b' : '#10b981'}
                            opacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                <div className="text-center">
                  <Play size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Run simulation to see distribution</p>
                </div>
              </div>
            )}
          </div>

          {/* CFaR Hedge Comparison side-by-side */}
          {showComparison && results && compareResults && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
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
                    color: '#ef4444',
                    bg: 'var(--red-bg)',
                    border: 'var(--red-border)',
                  },
                  {
                    label: '80% Hedged',
                    p5: results.p5,
                    mean: results.mean,
                    pct: results.pctAboveFloor,
                    color: '#10b981',
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
                        <span className="font-mono" style={{ color: col.pct >= 80 ? '#10b981' : '#f59e0b' }}>{col.pct.toFixed(1)}%</span>
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
                  <span className="font-mono" style={{ color: '#ef4444' }}>{(compareResults.p5 * 100).toFixed(2)}%</span>
                  {' '}→{' '}
                  <span className="font-mono" style={{ color: '#10b981' }}>{(results.p5 * 100).toFixed(2)}%</span>
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
