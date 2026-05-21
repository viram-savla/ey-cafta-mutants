import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Shield, ShieldOff, Zap } from 'lucide-react';
import { ScenarioSlider } from './ScenarioSlider';
import { ScenarioPresets } from './ScenarioPresets';
import { MarginGauge } from './MarginGauge';
import { WaterfallChart } from './WaterfallChart';
import { SOFRCollarChart } from './SOFRCollarChart';
import { FXHedgeLadder } from './FXHedgeLadder';
import { ResidualRiskPanel } from './ResidualRiskPanel';
import { CommodityPanel } from '../commodity/CommodityPanel';
import { Switch } from '../ui/switch';
import { calcHedgedVsUnhedged, calcBreachThreshold } from '../../lib/calculations';
import { PRESETS } from '../../lib/constants';

function SectionHeader({ children, hint }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </h3>
      {hint && (
        <span className="text-[10.5px]" style={{ color: 'var(--text-faint)' }}>{hint}</span>
      )}
    </div>
  );
}

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

  const breachSeverity = (threshold) => {
    if (threshold > 50) return { text: 'Robust — extreme scenario required to breach', color: 'var(--green-soft)' };
    if (threshold > 20) return { text: 'Monitor — significant but plausible shock could breach', color: 'var(--amber-soft)' };
    return { text: 'Vulnerable — moderate shock could breach Board floor', color: 'var(--red-soft)' };
  };

  return (
    <div className="space-y-4">
      {/* Commodity Exposure & Payoff */}
      <CommodityPanel />

      {/* Presets */}
      <ScenarioPresets activePreset={activePreset} onSelect={handlePresetSelect} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── Controls ─────────────────────────────────────── */}
        <div className="glass-panel-strong p-5 space-y-5">
          <SectionHeader hint="Drag sliders to model shocks">Scenario Controls</SectionHeader>

          <ScenarioSlider
            label="Iron Ore Price Shock"
            hint="vs case price USD 120/t (SGX Fe62 benchmark)"
            value={ironOreShock * 100}
            min={0} max={30} step={1}
            onChange={v => handleSliderChange(setIronOreShock)(v / 100)}
            formatValue={v => `+${v.toFixed(0)}% → $${(120 * (1 + v / 100)).toFixed(0)}/t`}
          />
          <ScenarioSlider
            label="INR / USD Rate"
            hint="Net long USD 140M — depreciation is positive"
            value={inrRate}
            min={83.25} max={92} step={0.25}
            onChange={handleSliderChange(setInrRate)}
            formatValue={v => `₹${v.toFixed(2)} / $`}
            note={inrRate > 83.25 ? `+₹${(inrRate - 83.25).toFixed(2)} depreciation — positive for BAML` : null}
          />
          <ScenarioSlider
            label="Freight Shock"
            hint="Baltic C5 Australia→China, case USD 17.20/t"
            value={freightShock * 100}
            min={0} max={40} step={1}
            onChange={v => handleSliderChange(setFreightShock)(v / 100)}
            formatValue={v => `+${v.toFixed(0)}% → $${(17.20 * (1 + v / 100)).toFixed(2)}/t`}
          />

          {/* Hedge toggle — proper segmented look */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{
              background: hedgeActive ? 'var(--green-bg)' : 'var(--red-bg)',
              border: `1px solid ${hedgeActive ? 'var(--green-border)' : 'var(--red-border)'}`,
              transition: 'all 240ms ease',
            }}
          >
            <div className="flex items-center gap-2.5">
              {hedgeActive
                ? <Shield size={15} style={{ color: 'var(--green-soft)' }} />
                : <ShieldOff size={15} style={{ color: 'var(--red-soft)' }} />}
              <div className="leading-tight">
                <div className="text-[12.5px] font-semibold" style={{ color: hedgeActive ? 'var(--green-soft)' : 'var(--red-soft)' }}>
                  {hedgeActive ? 'Hedges Active' : 'Fully Unhedged'}
                </div>
                <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {hedgeActive ? '80% SGX / FFA / FX coverage' : 'All exposure open'}
                </div>
              </div>
            </div>
            <Switch checked={hedgeActive} onCheckedChange={setHedgeActive} />
          </div>
        </div>

        {/* ─── Results ─────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Gauge */}
          <div className="glass-panel-strong p-4">
            <SectionHeader hint="Live margin">EBITDA Margin · Current Scenario</SectionHeader>
            <div className="flex justify-center">
              <MarginGauge margin={displayResult.margin} />
            </div>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-3">
            {/* Unhedged */}
            <motion.div
              animate={{
                boxShadow: !hedgeActive
                  ? '0 0 0 1px var(--red-border), 0 8px 24px rgba(244,63,94,0.18)'
                  : '0 4px 12px rgba(0,0,0,0.2)',
              }}
              className="rounded-xl p-3.5"
              style={{
                background: 'linear-gradient(180deg, rgba(244,63,94,0.10), rgba(244,63,94,0.03))',
                border: '1px solid var(--red-border)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldOff size={11} style={{ color: 'var(--red-soft)' }} />
                <span className="text-[10.5px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Unhedged · 0%</span>
              </div>
              <div className="font-semibold tabular-nums tracking-tight" style={{ color: 'var(--red-soft)', fontSize: 22, letterSpacing: '-0.02em' }}>
                {(results.unhedged.margin * 100).toFixed(2)}%
              </div>
              <div className="text-[11px] font-mono tabular-nums mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                ₹{Math.round(results.unhedged.ebitda)} Cr EBITDA
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10.5px] font-medium"
                   style={{ color: results.unhedged.boardFloorBreached ? 'var(--red-soft)' : 'var(--green-soft)' }}>
                {results.unhedged.boardFloorBreached ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                <span className="tabular-nums">
                  {results.unhedged.boardFloorBreached
                    ? `BREACH −${Math.abs(results.unhedged.boardFloorBuffer).toFixed(0)} bps`
                    : `+${results.unhedged.boardFloorBuffer.toFixed(0)} bps buffer`}
                </span>
              </div>
            </motion.div>

            {/* Hedged */}
            <motion.div
              animate={{
                boxShadow: hedgeActive
                  ? '0 0 0 1px var(--green-border), 0 8px 24px rgba(16,185,129,0.18)'
                  : '0 4px 12px rgba(0,0,0,0.2)',
              }}
              className="rounded-xl p-3.5"
              style={{
                background: 'linear-gradient(180deg, rgba(16,185,129,0.10), rgba(16,185,129,0.03))',
                border: '1px solid var(--green-border)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Shield size={11} style={{ color: 'var(--green-soft)' }} />
                <span className="text-[10.5px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Hedged · 80%</span>
              </div>
              <div className="font-semibold tabular-nums tracking-tight" style={{ color: 'var(--green-soft)', fontSize: 22, letterSpacing: '-0.02em' }}>
                {(results.hedged.margin * 100).toFixed(2)}%
              </div>
              <div className="text-[11px] font-mono tabular-nums mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                ₹{Math.round(results.hedged.ebitda)} Cr EBITDA
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10.5px] font-medium"
                   style={{ color: results.hedged.boardFloorBreached ? 'var(--red-soft)' : 'var(--green-soft)' }}>
                {results.hedged.boardFloorBreached ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                <span className="tabular-nums">
                  {results.hedged.boardFloorBreached
                    ? `BREACH −${Math.abs(results.hedged.boardFloorBuffer).toFixed(0)} bps`
                    : `+${results.hedged.boardFloorBuffer.toFixed(0)} bps buffer`}
                </span>
              </div>
              {hedgeValue > 0 && (
                <div className="mt-2 pt-2 flex items-center gap-1.5 text-[10.5px] font-mono"
                     style={{ color: 'var(--accent-teal-soft)', borderTop: '1px solid rgba(16,185,129,0.18)' }}>
                  <Zap size={10} />
                  <span className="tabular-nums">Hedge saves ₹{hedgeValue} Cr</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Waterfall chart */}
      <div className="glass-panel-strong p-5">
        <SectionHeader hint="Basis points · base 11.60%">Margin Impact by Scenario</SectionHeader>
        <WaterfallChart ironOreShock={ironOreShock} inrRate={inrRate} freightShock={freightShock} />
      </div>

      {/* SOFR Collar Chart */}
      <SOFRCollarChart />

      {/* FX Hedge Ladder */}
      <FXHedgeLadder />

      {/* Residual Risk Panel */}
      <ResidualRiskPanel />

      {/* Breach calculator */}
      <div className="glass-panel-strong p-5 space-y-3">
        <SectionHeader hint="Sensitivity to commodity shock">What Would It Take to Breach?</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Unhedged breach', data: breachUnhedged, severity: breachSeverity(breachUnhedged.ironOreBreachPct) },
            { label: 'Hedged breach (80%)', data: breachHedged, severity: breachSeverity(breachHedged.ironOreBreachPct) },
          ].map((item) => (
            <div key={item.label} className="glass-panel-subtle p-3.5">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              <div className="font-semibold tabular-nums tracking-tight" style={{ color: item.severity.color, fontSize: 19, letterSpacing: '-0.02em' }}>
                ${item.data.ironOreBreachPrice.toFixed(0)}<span className="text-[12px] font-normal ml-0.5">/t</span>
              </div>
              <div className="text-[11px] font-mono tabular-nums mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                +{item.data.ironOreBreachPct.toFixed(1)}% from $120/t case
              </div>
              <div className="text-[11px] mt-2 leading-snug" style={{ color: item.severity.color }}>
                {item.severity.text}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-faint)' }}>
          Computed at INR <span className="font-mono tabular-nums">{inrRate.toFixed(2)}</span>/USD and freight
          {' '}<span className="font-mono tabular-nums">+{(freightShock * 100).toFixed(0)}%</span>.
          Breach = EBITDA margin falls below 11.00% Board floor.
        </p>
      </div>
    </div>
  );
}
