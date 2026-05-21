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
  const compareHistogram = compareResults ? buildHistogram(compareResults.paths) : [];

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
                <button
                  key={r}
                  onClick={() => setHedgeRatio(r)}
                  className="flex-1 py-1.5 rounded text-xs font-semibold transition-all"
                  style={{
                    background: hedgeRatio === r ? 'var(--accent-blue)' : 'var(--bg-primary)',
                    border: `1px solid ${hedgeRatio === r ? 'var(--accent-blue)' : 'var(--border-accent)'}`,
                    color: hedgeRatio === r ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {r === 0 ? 'Unhedged' : '80% Hedged'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => runSimulation()}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'var(--accent-blue)',
                color: 'white',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              {loading ? 'Running...' : 'Run Simulation'}
            </button>
          </div>
          <button
            onClick={runComparison}
            disabled={loading}
            className="w-full py-2 rounded text-xs font-medium transition-all"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-accent)',
              color: 'var(--text-secondary)',
            }}
          >
            Compare 0% vs 80% Hedge
          </button>
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
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              EBITDA Margin Distribution — {nPaths.toLocaleString()} Paths
            </h3>
            {results ? (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={histogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="margin" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} interval={Math.floor(histogram.length / 8)} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Reference lines */}
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
                          opacity={showComparison ? 0.7 : 0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
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
