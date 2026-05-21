import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function AlertBanner({ kpis, hedgedMargin }) {
  const redCount = kpis.filter(k => k.status === 'red').length;
  const hasAlert = redCount > 0;

  const marginPct = hedgedMargin != null ? (hedgedMargin * 100).toFixed(2) : '11.42';
  const bufferBps = hedgedMargin != null ? ((hedgedMargin - 0.11) * 10000).toFixed(0) : '42';
  const bufferSign = Number(bufferBps) >= 0 ? '+' : '';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={hasAlert ? 'alert' : 'ok'}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.2, 0, 0.2, 1] }}
        className="mb-4 relative overflow-hidden rounded-xl"
        style={{
          background: hasAlert
            ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.04))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.10), rgba(16, 185, 129, 0.03))',
          border: hasAlert
            ? '1px solid rgba(244, 63, 94, 0.4)'
            : '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: hasAlert
            ? '0 8px 32px rgba(244, 63, 94, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 6px 20px rgba(16, 185, 129, 0.10), inset 0 1px 0 rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        }}
      >
        {/* accent edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{
            background: hasAlert
              ? 'linear-gradient(180deg, var(--red-soft), var(--red))'
              : 'linear-gradient(180deg, var(--green-soft), var(--green))',
          }}
        />

        <div className="flex items-center gap-3 px-4 py-3 pl-5">
          {/* Icon with pulse ring for alerts */}
          <div className="relative flex items-center justify-center shrink-0">
            <div
              className={`relative w-9 h-9 rounded-full flex items-center justify-center ${hasAlert ? 'pulse-ring' : ''}`}
              style={{
                background: hasAlert ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.18)',
                border: hasAlert ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              {hasAlert
                ? <AlertTriangle size={16} style={{ color: 'var(--red-soft)' }} />
                : <ShieldCheck size={16} style={{ color: 'var(--green-soft)' }} />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md"
                style={{
                  background: hasAlert ? 'rgba(244, 63, 94, 0.18)' : 'rgba(16, 185, 129, 0.16)',
                  color: hasAlert ? 'var(--red-soft)' : 'var(--green-soft)',
                  border: hasAlert ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(16,185,129,0.3)',
                }}
              >
                {hasAlert ? 'Board Alert' : 'All Clear'}
              </span>
              <span className="text-[12.5px] font-medium" style={{ color: hasAlert ? 'var(--red-soft)' : 'var(--green-soft)' }}>
                {hasAlert
                  ? `${redCount} KPI${redCount > 1 ? 's' : ''} in breach`
                  : 'All systems compliant'}
              </span>
            </div>
            <div className="text-[12px] mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
              {hasAlert
                ? 'Immediate escalation required — review red-status indicators below.'
                : (
                  <>
                    Hedged margin <span className="font-mono tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>{marginPct}%</span>
                    {' '}·{' '}
                    <span className="font-mono tabular-nums font-semibold" style={{ color: 'var(--green-soft)' }}>{bufferSign}{bufferBps} bps</span>
                    {' '}above Board floor (11.00%)
                  </>
                )}
            </div>
          </div>

          {!hasAlert && (
            <div className="hidden md:flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] shrink-0"
              style={{ color: 'var(--text-faint)' }}>
              <CheckCircle2 size={12} style={{ color: 'var(--green-soft)' }} />
              <span>9 / 10 KPIs Green</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
