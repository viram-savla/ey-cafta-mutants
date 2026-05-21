import { Slider } from '../ui/slider';

export function ScenarioSlider({ label, value, min, max, step, onChange, formatValue, note }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{formatValue(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      {note && (
        <p className="text-xs" style={{ color: 'var(--accent-teal)' }}>{note}</p>
      )}
    </div>
  );
}
