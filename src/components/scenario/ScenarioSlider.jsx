import { useEffect, useRef, useState } from 'react';
import { Slider } from '../ui/slider';

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function snap(n, step, min) { return Math.round((n - min) / step) * step + min; }

export function ScenarioSlider({ label, value, min, max, step, onChange, formatValue, note, hint }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commit() {
    const parsed = parseFloat(draft);
    if (Number.isFinite(parsed)) {
      const next = clamp(snap(parsed, step, min), min, max);
      onChange(next);
    }
    setEditing(false);
  }

  function startEdit() {
    setDraft(String(value));
    setEditing(true);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12px] font-medium tracking-tight" style={{ color: 'var(--text-secondary)' }}>{label}</div>
          {hint && (
            <div className="text-[10.5px] mt-0.5 leading-tight" style={{ color: 'var(--text-faint)' }}>{hint}</div>
          )}
        </div>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); commit(); }
              else if (e.key === 'Escape') { e.preventDefault(); setEditing(false); }
            }}
            className="text-[12px] font-mono tabular-nums font-semibold px-2 py-1 rounded-md shrink-0 w-[88px] text-right outline-none"
            style={{
              color: 'var(--text-primary)',
              background: 'rgba(20,184,166,0.08)',
              border: '1px solid var(--accent-teal-border)',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title="Click to enter exact value"
            className="text-[12px] font-mono tabular-nums font-semibold px-2 py-1 rounded-md shrink-0 cursor-text hover:border-[var(--accent-teal-border)] transition-colors"
            style={{
              color: 'var(--text-primary)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
            }}
          >
            {formatValue(value)}
          </button>
        )}
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        formatBubble={formatValue}
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
