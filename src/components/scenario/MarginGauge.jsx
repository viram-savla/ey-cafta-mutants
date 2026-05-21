import { motion } from 'framer-motion';

const MIN_MARGIN = 0.09;
const MAX_MARGIN = 0.14;
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

function marginToAngle(margin) {
  const t = Math.max(0, Math.min(1, (margin - MIN_MARGIN) / (MAX_MARGIN - MIN_MARGIN)));
  return MIN_ANGLE + t * (MAX_ANGLE - MIN_ANGLE);
}

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
    { from: MIN_ANGLE, to: marginToAngle(0.108), color: '#ef4444' },
    { from: marginToAngle(0.108), to: marginToAngle(0.11), color: '#f59e0b' },
    { from: marginToAngle(0.11), to: MAX_ANGLE, color: '#10b981' },
  ];

  const boardFloorAngle = marginToAngle(0.11);
  const boardFloorPt = polarToXY(cx, cy, r + 12, boardFloorAngle);
  const boardFloorPtInner = polarToXY(cx, cy, r - 14, boardFloorAngle);

  const needleTip = polarToXY(cx, cy, r - 8, angle);
  const needleBase1 = polarToXY(cx, cy, 8, angle - 90);
  const needleBase2 = polarToXY(cx, cy, 8, angle + 90);

  const status = margin >= 0.11 ? 'green' : margin >= 0.108 ? 'amber' : 'red';
  const statusColor = status === 'green' ? '#10b981' : status === 'amber' ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="160" viewBox="0 0 240 180">
        {/* Background zones */}
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(cx, cy, r, z.from, z.to)}
            fill="none"
            stroke={z.color}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.4"
          />
        ))}

        {/* Active zone highlight */}
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
          stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2"
        />

        {/* Needle */}
        <motion.polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={statusColor}
          initial={false}
          animate={{ rotate: 0 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        <motion.circle cx={cx} cy={cy} r="6" fill={statusColor} />
        <circle cx={cx} cy={cy} r="3" fill="var(--bg-primary)" />

        {/* Center label */}
        <text x={cx} y={cy + 32} textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="JetBrains Mono" fill={statusColor}>
          {(margin * 100).toFixed(2)}%
        </text>
        <text x={cx} y={cy + 50} textAnchor="middle" fontSize="10" fill="#6b7280">
          EBITDA Margin (Hedged)
        </text>

        {/* Min/max labels */}
        <text x="22" y="152" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono">9%</text>
        <text x="196" y="152" fontSize="9" fill="#6b7280" fontFamily="JetBrains Mono">14%</text>
        <text x={boardFloorPt.x - 6} y={boardFloorPt.y - 4} fontSize="8" fill="#ef4444">11%</text>
      </svg>
    </div>
  );
}
