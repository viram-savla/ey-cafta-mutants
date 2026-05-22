import { motion } from 'framer-motion';
import { PRESETS } from '../../lib/constants';

const PRESET_META = {
  base:     { hint: 'Baseline assumptions', tone: 'neutral' },
  ironOre:  { hint: '+15% iron ore',         tone: 'danger' },
  inrStress:{ hint: '₹88 / USD',             tone: 'warn' },
  combined: { hint: 'All shocks combined',   tone: 'danger' },
};

const TONE = {
  neutral: { dot: 'var(--text-muted)' },
  warn:    { dot: 'var(--amber)' },
  danger:  { dot: 'var(--red)' },
};

export function ScenarioPresets({ activePreset, onSelect }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--text-faint)' }}>
          Scenario Presets
        </span>
        <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
      </div>
      <div
        className="inline-flex p-1 rounded-xl items-center w-full sm:w-auto flex-wrap"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          gap: '2px',
        }}
      >
        {Object.entries(PRESETS).map(([key, preset]) => {
          const isActive = activePreset === key;
          const meta = PRESET_META[key] || PRESET_META.base;
          const tone = TONE[meta.tone];

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="relative px-3 py-1.5 rounded-full transition-colors flex items-center gap-2 text-[12.5px] font-normal"
              style={{ color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {isActive && (
                <motion.div
                  layoutId="preset-active"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'var(--text-primary)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isActive ? 'var(--bg-primary)' : tone.dot }}
                />
                {preset.label}
                <span
                  className="hidden md:inline text-[10.5px] font-normal opacity-70"
                  style={{ color: 'inherit' }}
                >
                  · {meta.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
