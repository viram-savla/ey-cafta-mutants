import { motion } from 'framer-motion';

const MIN_MARGIN = 0.09;
const MAX_MARGIN = 0.14;
// Gauge spans from -135° (left end) to +135° (right end), measured from 12 o'clock
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

function marginToAngle(margin) {
  const t = Math.max(0, Math.min(1, (margin - MIN_MARGIN) / (MAX_MARGIN - MIN_MARGIN)));
  return MIN_ANGLE + t * (MAX_ANGLE - MIN_ANGLE);
}

// polarToXY uses 0° = "up" (12 o'clock), positive = clockwise
function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToXY(cx, cy, r, startAngle);
  const end = polarToXY(cx, cy, r, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function MarginGauge({ margin }) {
  const cx = 120, cy = 120, r = 85;
  const angle = marginToAngle(margin);

  const zones = [
    { from: MIN_ANGLE, to: marginToAngle(0.108), color: '#f43f5e' },
    { from: marginToAngle(0.108), to: marginToAngle(0.11), color: '#ff7a17' },
    { from: marginToAngle(0.11), to: MAX_ANGLE, color: '#22c55e' },
  ];

  const boardFloorAngle = marginToAngle(0.11);
  const boardFloorPt = polarToXY(cx, cy, r + 12, boardFloorAngle);
  const boardFloorPtInner = polarToXY(cx, cy, r - 14, boardFloorAngle);

  const status = margin >= 0.11 ? 'green' : margin >= 0.108 ? 'amber' : 'red';
  const statusColor = status === 'green' ? '#22c55e' : status === 'amber' ? '#ff7a17' : '#f43f5e';

  // Needle is drawn pointing straight up (north = 0°).
  // Framer Motion rotates it to `angle` degrees clockwise from north,
  // pivoting around (cx, cy). This produces a smooth spring animation.
  const needleLength = r - 8;
  const needleBaseHalf = 8;

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="160" viewBox="0 0 240 180" overflow="visible">
        {/* Track */}
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(cx, cy, r, z.from, z.to)}
            fill="none"
            stroke={z.color}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.35"
          />
        ))}

        {/* Active fill up to current margin */}
        <path
          d={arcPath(cx, cy, r, MIN_ANGLE, angle)}
          fill="none"
          stroke={statusColor}
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Board floor tick */}
        <line
          x1={boardFloorPtInner.x} y1={boardFloorPtInner.y}
          x2={boardFloorPt.x} y2={boardFloorPt.y}
          stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2"
        />
        <text
          x={boardFloorPt.x - 6}
          y={boardFloorPt.y - 4}
          fontSize="8"
          fill="#f43f5e"
          textAnchor="middle"
        >
          11%
        </text>

        {/* Needle — drawn pointing north, rotated to `angle` via spring */}
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ rotate: MIN_ANGLE }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 55, damping: 14 }}
        >
          <polygon
            points={`${cx},${cy - needleLength} ${cx - needleBaseHalf},${cy} ${cx + needleBaseHalf},${cy}`}
            fill={statusColor}
          />
        </motion.g>

        {/* Pivot cap */}
        <circle cx={cx} cy={cy} r="6" fill={statusColor} />
        <circle cx={cx} cy={cy} r="3" fill="var(--bg-primary)" />

        {/* Center readout */}
        <text x={cx} y={cy + 32} textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill={statusColor}>
          {(margin * 100).toFixed(2)}%
        </text>
        <text x={cx} y={cy + 50} textAnchor="middle" fontSize="10" fill="#6b7280">
          EBITDA Margin (Hedged)
        </text>

        {/* Min / max labels */}
        <text x="22" y="152" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono, monospace">9%</text>
        <text x="196" y="152" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono, monospace">14%</text>
      </svg>
    </div>
  );
}
