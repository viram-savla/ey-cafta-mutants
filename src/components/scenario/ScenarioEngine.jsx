import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { ScenarioSlider } from './ScenarioSlider';
import { ScenarioPresets } from './ScenarioPresets';
import { MarginGauge } from './MarginGauge';
import { WaterfallChart } from './WaterfallChart';
import { SOFRCollarChart } from './SOFRCollarChart';
import { FXHedgeLadder } from './FXHedgeLadder';
import { ResidualRiskPanel } from './ResidualRiskPanel';
import { CommodityPanel } from '../commodity/CommodityPanel';
import { calcHedgedVsUnhedged, calcBreachThreshold } from '../../lib/calculations';
import { PRESETS } from '../../lib/constants';

export function ScenarioEngine({ onHedgeValueChange }) {
  const [ironOreShock, setIronOreShock] = useState(0.15);
  const [inrRate, setInrRate] = useState(88);
  const [freightShock, setFreightShock] = useState(0.20);
  const [hedgeActive, setHedgeActive] = useState(true);
  const [activePreset, setActivePreset] = useState('combined');

  const results = useMemo(() => calcHedgedVsUnhedged(ironOreShock, inrRate, freightShock), [ironOreShock, inrRate, freightShock]);
  const breachUnhedged = useMemo(() => calcBreachThreshold(inrRate, freightShock, 0), [inrRate, freightShock]);
  const breachHedged = useMemo(() => calcBreachThreshold(inrRate, freightShock, 0.80), [inrRate, freightShock]);

  const displayResult = hedgeActive ? results.hedged : results.unhedged;
  const hedgeValue = useMemo(() => Math.max(0, Math.round(results.hedgeValueCrore)), [results]);

  const handlePresetSelect = useCallback((key) => {
    const p = PRESETS[key];
    setIronOreShock(p.ironOreShock);
    setInrRate(p.inrRate);
    setFreightShock(p.freightShock);
    setActivePreset(key);
  }, []);

  const handleSliderChange = useCallback((setter) => (val) => {
    setter(val);
    setActivePreset(null);
  }, []);

  const ironOrePrice = 120 * (1 + ironOreShock);
  const freightPrice = 17.20 * (1 + freightShock);

  const breachSeverity = (threshold) => {
    if (threshold > 50) return { text: 'Robust — extreme scenario required to breach', color: 'var(--green)' };
    if (threshold > 20) return { text: 'Monitor — significant but plausible shock could breach', color: 'var(--amber)' };
    return { text: 'Vulnerable — moderate shock could breach Board floor', color: 'var(--red)' };
  };

  return (
    <div className="space-y-4">
      {/* Commodity Exposure & Payoff */}
      <CommodityPanel />

      {/* Presets */}
      <ScenarioPresets activePreset={activePreset} onSelect={handlePresetSelect} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Controls */}
        <div className="rounded-lg p-4 space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Scenario Controls
          </h3>

          <ScenarioSlider
            label="Iron Ore Price Shock"
            value={ironOreShock * 100}
            min={0} max={30} step={1}
            onChange={v => handleSliderChange(setIronOreShock)(v / 100)}
            formatValue={v => `+${v.toFixed(0)}% → USD ${(120 * (1 + v / 100)).toFixed(0)}/t`}
          />
          <ScenarioSlider
            label="INR/USD Rate"
            value={inrRate}
            min={83.25} max={92} step={0.25}
            onChange={handleSliderChange(setInrRate)}
            formatValue={v => `₹${v.toFixed(2)}/USD`}
            note={inrRate > 83.25 ? `+₹${(inrRate - 83.25).toFixed(2)} depreciation — net POSITIVE for BAML (net long USD 140M)` : null}
          />
          <ScenarioSlider
            label="Freight Shock"
            value={freightShock * 100}
            min={0} max={40} step={1}
            onChange={v => handleSliderChange(setFreightShock)(v / 100)}
            formatValue={v => `+${v.toFixed(0)}% → USD ${(17.20 * (1 + v / 100)).toFixed(2)}/t`}
          />

          {/* Hedge toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: `1px solid ${hedgeActive ? 'var(--green-border)' : 'var(--red-border)'}` }}>
            <span className="text-sm font-medium" style={{ color: hedgeActive ? 'var(--green)' : 'var(--red)' }}>
              {hedgeActive ? 'Hedges Active (80% SGX/FFA/FX)' : 'Fully Unhedged'}
            </span>
            <button onClick={() => setHedgeActive(!hedgeActive)} className="transition-colors">
              {hedgeActive
                ? <ToggleRight size={32} style={{ color: 'var(--green)' }} />
                : <ToggleLeft size={32} style={{ color: 'var(--red)' }} />}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div className="space-y-3">
          {/* Gauge */}
          <div className="rounded-lg p-3 flex justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <MarginGauge margin={displayResult.margin} />
          </div>

          {/* Unhedged vs Hedged */}
          <div className="grid grid-cols-2 gap-3">
            {/* Unhedged */}
            <div className="rounded-lg p-3" style={{
              background: 'var(--red-bg)',
              border: `1px solid ${!hedgeActive ? 'var(--red)' : 'var(--red-border)'}`,
              boxShadow: !hedgeActive ? '0 0 12px rgba(239,68,68,0.3)' : 'none',
            }}>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Unhedged</div>
              <div className="font-mono text-xl font-bold" style={{ color: '#ef4444' }}>
                {(results.unhedged.margin * 100).toFixed(2)}%
              </div>
              <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                ₹{Math.round(results.unhedged.ebitda)} Cr EBITDA
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: results.unhedged.boardFloorBreached ? '#ef4444' : '#10b981' }}>
                {results.unhedged.boardFloorBreached ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                {results.unhedged.boardFloorBreached
                  ? `BREACH −${Math.abs(results.unhedged.boardFloorBuffer).toFixed(0)}bps below floor`
                  : `COMPLIANT +${results.unhedged.boardFloorBuffer.toFixed(0)}bps`}
              </div>
            </div>

            {/* Hedged */}
            <div className="rounded-lg p-3" style={{
              background: 'var(--green-bg)',
              border: `1px solid ${hedgeActive ? 'var(--green)' : 'var(--green-border)'}`,
              boxShadow: hedgeActive ? '0 0 12px rgba(16,185,129,0.3)' : 'none',
            }}>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Hedged (80%)</div>
              <div className="font-mono text-xl font-bold" style={{ color: '#10b981' }}>
                {(results.hedged.margin * 100).toFixed(2)}%
              </div>
              <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                ₹{Math.round(results.hedged.ebitda)} Cr EBITDA
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: results.hedged.boardFloorBreached ? '#ef4444' : '#10b981' }}>
                {results.hedged.boardFloorBreached ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                {results.hedged.boardFloorBreached
                  ? `BREACH −${Math.abs(results.hedged.boardFloorBuffer).toFixed(0)}bps below floor`
                  : `COMPLIANT +${results.hedged.boardFloorBuffer.toFixed(0)}bps`}
              </div>
              {hedgeValue > 0 && (
                <div className="mt-1 text-xs font-mono" style={{ color: 'var(--accent-gold)' }}>
                  Saves ₹{hedgeValue} Cr
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Waterfall chart */}
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Margin Impact by Scenario (bps vs Base 11.60%)
        </h3>
        <WaterfallChart ironOreShock={ironOreShock} inrRate={inrRate} freightShock={freightShock} />
      </div>

      {/* SOFR Collar Chart */}
      <SOFRCollarChart />

      {/* FX Hedge Ladder */}
      <FXHedgeLadder />

      {/* Residual Risk Panel */}
      <ResidualRiskPanel />

      {/* Breach calculator */}
      <div className="rounded-lg p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          What Would It Take to Breach?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Unhedged breach', data: breachUnhedged, severity: breachSeverity(breachUnhedged.ironOreBreachPct) },
            { label: 'Hedged breach (80%)', data: breachHedged, severity: breachSeverity(breachHedged.ironOreBreachPct) },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-accent)' }}>
              <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              <div className="font-mono text-lg font-bold" style={{ color: item.severity.color }}>
                USD {item.data.ironOreBreachPrice.toFixed(0)}/t
              </div>
              <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                +{item.data.ironOreBreachPct.toFixed(1)}% from USD 120/t
              </div>
              <div className="text-xs mt-1.5" style={{ color: item.severity.color }}>
                {item.severity.text}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Computed at current INR {inrRate.toFixed(2)}/USD and freight +{(freightShock * 100).toFixed(0)}%. Breach = EBITDA margin falls below 11.0% Board floor.
        </p>
      </div>
    </div>
  );
}
