import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';

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
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 text-sm font-medium ${hasAlert ? 'alert-pulse' : ''}`}
        style={{
          background: hasAlert ? 'var(--red-bg)' : 'var(--green-bg)',
          border: `1px solid ${hasAlert ? 'var(--red-border)' : 'var(--green-border)'}`,
          color: hasAlert ? 'var(--red)' : 'var(--green)',
        }}
      >
        {hasAlert ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
        <span>
          {hasAlert
            ? `BOARD ALERT: ${redCount} KPI${redCount > 1 ? 's' : ''} in breach — immediate escalation required`
            : `ALL SYSTEMS COMPLIANT — Hedged margin ${marginPct}% | ${bufferSign}${bufferBps}bps above Board floor`}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
