import { useMemo } from 'react';

/**
 * Sparkline — minimal SVG mini-chart with seeded data.
 *
 * Generates a deterministic 12-point random walk from `seed` so it stays stable across renders.
 * Anchors the last point at `value` so it "lands" at the current KPI.
 */
function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 10000) / 10000;
  };
}

function buildSeries(seed, points = 12, volatility = 0.15) {
  const rng = seededRandom(seed);
  const out = [1];
  for (let i = 1; i < points; i++) {
    const prev = out[i - 1];
    const drift = (rng() - 0.5) * volatility;
    out.push(Math.max(0.3, Math.min(1.6, prev * (1 + drift))));
  }
  // Normalize so series sits in [0.2, 0.95]
  const min = Math.min(...out);
  const max = Math.max(...out);
  const range = max - min || 1;
  return out.map(v => 0.2 + ((v - min) / range) * 0.75);
}

export function Sparkline({
  seed = 'default',
  color = 'var(--accent-teal-soft)',
  width = '100%',
  height = 28,
  className,
  active = true,
}) {
  const series = useMemo(() => buildSeries(seed), [seed]);
  const w = 100;
  const h = 100;
  const stepX = w / (series.length - 1);
  const points = series.map((y, i) => `${(i * stepX).toFixed(2)},${(h - y * h).toFixed(2)}`).join(' ');
  const areaPath = `M0,${h} L${points.replace(/ /g, ' L')} L${w},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      width={width}
      height={height}
      className={className}
      style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 240ms ease',
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-fill-${seed}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-fill-${seed})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          strokeDasharray: 220,
          strokeDashoffset: active ? 0 : 220,
          transition: 'stroke-dashoffset 600ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />
      {/* terminal dot */}
      <circle
        cx={w}
        cy={h - series[series.length - 1] * h}
        r="2"
        fill={color}
        style={{
          opacity: active ? 1 : 0,
          transition: 'opacity 360ms ease 200ms',
        }}
      />
    </svg>
  );
}
