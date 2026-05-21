import { Slider } from '../ui/slider';

export function ScenarioSlider({ label, value, min, max, step, onChange, formatValue, note, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12px] font-medium tracking-tight" style={{ color: 'var(--text-secondary)' }}>{label}</div>
          {hint && (
            <div className="text-[10.5px] mt-0.5 leading-tight" style={{ color: 'var(--text-faint)' }}>{hint}</div>
          )}
        </div>
        <div
          className="text-[12px] font-mono tabular-nums font-semibold px-2 py-1 rounded-md shrink-0"
          style={{
            color: 'var(--text-primary)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
          }}
        >
          {formatValue(value)}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      {note && (
        <p className="text-[10.5px] mt-1 leading-snug flex items-center gap-1.5" style={{ color: 'var(--accent-teal-soft)' }}>
          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-teal)' }} />
          {note}
        </p>
      )}
    </div>
  );
}
