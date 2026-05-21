import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { PayoffDiagram } from './PayoffDiagram';
import { MODEL } from '../../lib/constants';
import { Button } from '../ui/button';

const COMMODITIES = [
  {
    id: 'ironOre',
    name: 'Iron Ore (DR Grade)',
    benchmark: 'MB 65% Fe CFR China / SGX Fe62',
    casePrice: MODEL.ironOrePrice,
    livePrice: MODEL.ironOrePriceLive,
    unit: 'USD/t',
    volumeLabel: '1.2M t/yr',
    annualCostCr: Math.round(MODEL.ironOrePrice * MODEL.ironOreVolume * MODEL.usdInrBase / 1e7),
    hedgeLabel: '80% / 50% / 20%',
    hedgeTenor: '0–3M / 3–6M / 6–12M',
    instrument: 'SGX Futures + FFA Collar',
    color: '#ef4444',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
    hasPayoff: true,
  },
  {
    id: 'coal',
    name: 'Coking Coal (HCC)',
    benchmark: 'PLV Hard Coking Coal FOB Australia',
    casePrice: MODEL.coalPrice,
    livePrice: 218,
    unit: 'USD/t',
    volumeLabel: '0.6M t/yr',
    annualCostCr: Math.round(MODEL.coalPrice * MODEL.coalVolume * MODEL.usdInrBase / 1e7),
    hedgeLabel: 'Not hedged',
    hedgeTenor: 'Spot procurement',
    instrument: 'Recommend zero-cost collar',
    color: '#8b5cf6',
    bg: 'rgba(76,29,149,0.2)',
    border: '#7c3aed',
    hasPayoff: false,
  },
  {
    id: 'freight',
    name: 'Capesize Freight',
    benchmark: 'Baltic C5 Australia→China',
    casePrice: MODEL.freightRate,
    livePrice: MODEL.freightRateC5,
    unit: 'USD/t',
    volumeLabel: '1.8M t/yr',
    annualCostCr: Math.round(MODEL.freightRate * MODEL.totalBulkVolume * MODEL.usdInrBase / 1e7),
    hedgeLabel: '0–3M FFA only',
    hedgeTenor: 'Near-term coverage',
    instrument: 'Baltic C5 FFA Forward',
    color: '#f59e0b',
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    hasPayoff: false,
  },
];

function PriceChange({ casePrice, livePrice, color }) {
  const diff = livePrice - casePrice;
  const pct = ((diff / casePrice) * 100).toFixed(1);
  const isUp = diff > 0;
  const isFlat = diff === 0;

  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  const changeColor = isFlat ? 'var(--text-muted)' : isUp ? '#ef4444' : '#10b981';

  return (
    <div className="flex items-center gap-1 text-xs font-mono" style={{ color: changeColor }}>
      <Icon size={11} />
      <span>{isUp ? '+' : ''}{diff.toFixed(2)} ({isUp ? '+' : ''}{pct}%) vs case</span>
    </div>
  );
}

function CommodityCard({ commodity, expanded, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden lift-on-hover"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* top accent bar in commodity color */}
      <div
        className="h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${commodity.color}, transparent)`, opacity: 0.7 }}
      />
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <div className="font-semibold text-[13px] tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              {commodity.name}
            </div>
            <div className="text-[10.5px] mt-1 leading-tight" style={{ color: 'var(--text-faint)' }}>
              {commodity.benchmark}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-semibold tabular-nums tracking-tight" style={{ color: commodity.color, fontSize: 19, letterSpacing: '-0.02em' }}>
              ${commodity.livePrice.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.1em] mt-0.5" style={{ color: 'var(--text-faint)' }}>{commodity.unit}</div>
          </div>
        </div>

        <PriceChange casePrice={commodity.casePrice} livePrice={commodity.livePrice} color={commodity.color} />

        <div className="mt-2.5 pt-2.5 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px]" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Case</span>
            <span className="font-mono tabular-nums font-medium" style={{ color: 'var(--text-secondary)' }}>${commodity.casePrice}/t</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Volume</span>
            <span className="font-mono tabular-nums font-medium" style={{ color: 'var(--text-secondary)' }}>{commodity.volumeLabel}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Annual</span>
            <span className="font-mono tabular-nums font-medium" style={{ color: commodity.color }}>₹{commodity.annualCostCr} Cr</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Hedge</span>
            <span className="font-mono tabular-nums font-medium" style={{ color: commodity.hedgeLabel === 'Not hedged' ? 'var(--amber-soft)' : 'var(--green-soft)' }}>
              {commodity.hedgeLabel}
            </span>
          </div>
        </div>

        <div className="mt-2.5 text-[10.5px] leading-snug" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{commodity.instrument}</span>
          {' · '}{commodity.hedgeTenor}
        </div>
      </div>

      {commodity.hasPayoff && (
        <Button
          variant="ghost"
          size="xs"
          onClick={onToggle}
          className="w-full justify-between rounded-none"
          style={{ borderTop: `1px solid ${commodity.border}`, color: commodity.color, background: 'rgba(0,0,0,0.2)' }}
        >
          <span>Hedge Payoff Diagram</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </Button>
      )}
    </motion.div>
  );
}

export function CommodityPanel() {
  const [payoffOpen, setPayoffOpen] = useState(false);

  const totalAnnualCostCr = COMMODITIES.reduce((s, c) => s + c.annualCostCr, 0);

  return (
    <div className="glass-panel-strong p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
            Commodity Exposure
          </h3>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>
            Based on case prices at <span className="font-mono tabular-nums">₹83.25/USD</span>
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-right"
          style={{
            background: 'var(--accent-teal-bg)',
            border: '1px solid var(--accent-teal-border)',
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Annual Cost</div>
          <div className="font-mono tabular-nums font-semibold text-[15px]" style={{ color: 'var(--accent-teal-soft)' }}>
            ₹{totalAnnualCostCr.toLocaleString('en-IN')} Cr
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {COMMODITIES.map(c => (
          <CommodityCard
            key={c.id}
            commodity={c}
            expanded={payoffOpen && c.hasPayoff}
            onToggle={() => setPayoffOpen(o => !o)}
          />
        ))}
      </div>

      <AnimatePresence>
        {payoffOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="glass-panel-subtle p-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-secondary)' }}>
                Iron Ore Hedge Payoff · Margin Impact vs Price
              </h4>
              <PayoffDiagram />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
