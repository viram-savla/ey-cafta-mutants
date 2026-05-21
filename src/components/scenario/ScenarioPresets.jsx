import { PRESETS } from '../../lib/constants';

export function ScenarioPresets({ activePreset, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(PRESETS).map(([key, preset]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
          style={{
            background: activePreset === key ? 'var(--accent-blue)' : 'var(--bg-card)',
            border: `1px solid ${activePreset === key ? 'var(--accent-blue)' : 'var(--border-accent)'}`,
            color: activePreset === key ? 'white' : 'var(--text-secondary)',
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
