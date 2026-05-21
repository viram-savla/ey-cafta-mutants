import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RAGBadge } from '../shared/RAGBadge';
import { Sparkline } from '../shared/Sparkline';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '../ui/tooltip';

const STATUS_HOVER_SHADOW = {
  green: 'var(--shadow-status-green-hover)',
  amber: 'var(--shadow-status-amber-hover)',
  red:   'var(--shadow-status-red-hover)',
};

const STATUS_RESTING_SHADOW = {
  green: 'var(--shadow-status-green)',
  amber: 'var(--shadow-status-amber)',
  red:   'var(--shadow-status-red)',
};

const STATUS_COLOR = {
  green: 'var(--green-soft)',
  amber: 'var(--amber-soft)',
  red:   'var(--red-soft)',
};

// Parse a numeric prefix out of the value string so we can animate it
function parseNumeric(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^([₹$]?)\s*(-?\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return null;
  const [, prefix, num, suffix] = match;
  return { prefix, num: parseFloat(num), suffix, decimals: (num.split('.')[1] || '').length };
}

export function KPICard({ id, label, value, target, status, onClick, delay = 0, tooltip }) {
  const accent = STATUS_COLOR[status];
  const cardRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const numeric = parseNumeric(value);

  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    cardRef.current.style.setProperty('--mx', `${mx}%`);
    cardRef.current.style.setProperty('--my', `${my}%`);
  }

  const card = (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 110, damping: 18, mass: 0.9, delay }}
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={handleMouseMove}
      whileHover={onClick ? {
        y: -3,
        boxShadow: STATUS_HOVER_SHADOW[status],
        transition: { type: 'spring', stiffness: 300, damping: 22 },
      } : {}}
      whileTap={onClick ? { scale: 0.97, transition: { duration: 0.08 } } : {}}
      className={`card-spotlight relative overflow-hidden rounded-xl p-4 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        border: '1px solid var(--border)',
        borderBottom: `2px solid var(--${status})`,
        boxShadow: STATUS_RESTING_SHADOW[status],
        minHeight: 130,
      }}
    >
      {/* top-edge accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, var(--${status}), transparent)`,
          opacity: 0.8,
        }}
      />

      {/* label + RAG */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <span
          className="font-medium leading-tight"
          style={{
            color: 'var(--text-muted)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <RAGBadge status={status} />
      </div>

      {/* value */}
      <motion.div
        key={value}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="tabular-nums"
        style={{
          color: 'var(--text-primary)',
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
        }}
      >
        {numeric ? (
          <AnimatedKPI {...numeric} />
        ) : value}
      </motion.div>

      {/* target line */}
      <div className="flex items-center gap-1.5 mt-1.5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        <span>Target</span>
        <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{target}</span>
      </div>

      {/* Sparkline on hover */}
      <div
        className="absolute inset-x-0 bottom-0 px-3 pb-2 pointer-events-none"
        style={{ opacity: hovering ? 1 : 0, transition: 'opacity 220ms ease' }}
      >
        <Sparkline
          seed={`${id || label}-${status}`}
          color={accent}
          height={22}
          active={hovering}
        />
      </div>
    </motion.div>
  );

  if (!tooltip) return card;

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {tooltip}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AnimatedKPI({ prefix, num, suffix, decimals }) {
  return (
    <>
      {prefix}
      <AnimatedNumber value={num} decimals={decimals} />
      {suffix && <span className="unit-suffix">{suffix.trim()}</span>}
    </>
  );
}
