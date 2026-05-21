import { motion } from 'framer-motion';
import { RAGBadge } from '../shared/RAGBadge';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '../ui/tooltip';

const STATUS_GLOW = {
  green: '0 0 0 1px rgba(16,185,129,0.35), 0 12px 32px rgba(16,185,129,0.12)',
  amber: '0 0 0 1px rgba(245,158,11,0.35), 0 12px 32px rgba(245,158,11,0.12)',
  red:   '0 0 0 1px rgba(244,63,94,0.35),  0 12px 32px rgba(244,63,94,0.14)',
};

const STATUS_COLOR = {
  green: 'var(--green)',
  amber: 'var(--amber)',
  red:   'var(--red)',
};

export function KPICard({ label, value, target, status, onClick, delay = 0, tooltip }) {
  const accent = STATUS_COLOR[status];

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.2, 0, 0.2, 1] }}
      onClick={onClick}
      whileHover={onClick ? { y: -2, boxShadow: STATUS_GLOW[status] } : {}}
      className={`relative overflow-hidden rounded-xl p-4 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'box-shadow 240ms ease, border-color 240ms ease, transform 240ms ease',
      }}
    >
      {/* top-edge accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.7,
        }}
      />

      {/* label + RAG */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <span
          className="text-[10.5px] font-medium uppercase tracking-[0.1em] leading-tight"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        <RAGBadge status={status} />
      </div>

      {/* value — Inter, tabular nums, prominent */}
      <motion.div
        key={value}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="font-semibold tracking-tight tabular-nums"
        style={{
          color: 'var(--text-primary)',
          fontSize: 24,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </motion.div>

      {/* target line */}
      <div className="flex items-center gap-1.5 mt-1.5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        <span>Target</span>
        <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{target}</span>
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
