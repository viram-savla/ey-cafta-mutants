import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export function AlertBanner({ kpis }) {
  const redCount = kpis.filter(k => k.status === 'red').length;
  const hasAlert = redCount > 0;

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
            : `ALL SYSTEMS COMPLIANT — Hedged margin 11.42% | +42bps above Board floor`}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
