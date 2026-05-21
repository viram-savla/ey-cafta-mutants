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
      className="rounded-lg overflow-hidden"
      style={{ background: commodity.bg, border: `1px solid ${commodity.border}` }}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{commodity.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{commodity.benchmark}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-xl font-bold" style={{ color: commodity.color }}>
              ${commodity.livePrice.toFixed(2)}
            </div>
            <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{commodity.unit}</div>
          </div>
        </div>

        <PriceChange casePrice={commodity.casePrice} livePrice={commodity.livePrice} color={commodity.color} />

        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Case price: </span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>${commodity.casePrice}/t</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Volume: </span>
            <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{commodity.volumeLabel}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Annual cost: </span>
            <span className="font-mono" style={{ color: commodity.color }}>₹{commodity.annualCostCr} Cr</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Hedge: </span>
            <span className="font-mono" style={{ color: '#10b981' }}>{commodity.hedgeLabel}</span>
          </div>
        </div>

        <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          {commodity.instrument} · {commodity.hedgeTenor}
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
    <div className="rounded-lg p-4 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Commodity Exposure
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Total annual commodity cost: <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>
              ₹{totalAnnualCostCr.toLocaleString('en-IN')} Cr
            </span> · Based on case prices at ₹83.25/USD
          </p>
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
            <div className="rounded-lg p-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-accent)' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Iron Ore Hedge Payoff — Margin Impact vs Price (bps)
              </h4>
              <PayoffDiagram />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
