import { motion } from 'framer-motion';
import { RAGBadge } from '../shared/RAGBadge';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '../ui/tooltip';

export function KPICard({ label, value, target, status, onClick, delay = 0, tooltip }) {
  const borderClass = `border-rag-${status}`;

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      onClick={onClick}
      className={`rounded-lg p-4 transition-all duration-300 ${borderClass} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      whileHover={onClick
        ? {
            boxShadow:
              status === 'green' ? '0 0 16px rgba(16,185,129,0.25)'
              : status === 'amber' ? '0 0 16px rgba(245,158,11,0.25)'
              : '0 0 16px rgba(239,68,68,0.25)',
            y: -1,
          }
        : {}}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <RAGBadge status={status} />
      </div>
      <motion.div
        key={value}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="font-mono text-2xl font-bold mt-1 mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </motion.div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Target: {target}
      </div>
    </motion.div>
  );

  if (!tooltip) return card;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {tooltip}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
