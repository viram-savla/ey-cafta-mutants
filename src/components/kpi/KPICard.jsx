import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RAGBadge } from '../shared/RAGBadge';
import { Sparkline } from '../shared/Sparkline';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '../ui/tooltip';

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
        transition: { type: 'spring', stiffness: 300, damping: 22 },
      } : {}}
      whileTap={onClick ? { scale: 0.97, transition: { duration: 0.08 } } : {}}
      className={`card-spotlight kpi-card-${status} relative overflow-hidden rounded-xl p-4 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        border: '1px solid var(--border)',
        borderBottom: `2px solid var(--${status})`,
        minHeight: 142,
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

      {/* value — no key, AnimatedNumber handles spring-tween between values */}
      <div
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
      </div>

      {/* target line — always visible */}
      <div
        className="flex items-center gap-1.5 mt-1.5 text-[11px]"
        style={{ color: 'var(--text-faint)' }}
      >
        <span>Target</span>
        <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{target}</span>
      </div>

      {/* Sparkline reveals on hover, sits at the bottom edge */}
      <div
        className="absolute inset-x-0 bottom-2 px-4 pointer-events-none"
        style={{
          opacity: hovering ? 1 : 0,
          transform: hovering ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity 240ms ease, transform 240ms ease',
        }}
      >
        <Sparkline
          seed={`${id || label}-${status}`}
          color={accent}
          height={18}
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
  const trimmed = (suffix || '').trim();
  // Symbol units (%, ×, /USD, /t) stay inline & same size.
  // Word units (days, years, M, Cr) get the smaller .unit-suffix treatment.
  const isWordUnit = /^[a-z]+$/i.test(trimmed);

  if (!trimmed) {
    return <>{prefix}<AnimatedNumber value={num} decimals={decimals} /></>;
  }

  if (isWordUnit) {
    return (
      <>
        {prefix}
        <AnimatedNumber value={num} decimals={decimals} />
        <span className="unit-suffix">{trimmed}</span>
      </>
    );
  }

  // Symbol unit — render inline as part of the number itself
  return (
    <>
      {prefix}
      <AnimatedNumber value={num} decimals={decimals} suffix={trimmed} />
    </>
  );
}
