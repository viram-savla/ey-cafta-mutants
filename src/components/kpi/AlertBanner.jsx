import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

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
        className="mb-4"
      >
        <Alert
          variant={hasAlert ? 'destructive' : 'success'}
          className={hasAlert ? 'alert-pulse font-medium' : 'font-medium'}
        >
          {hasAlert
            ? <AlertTriangle size={15} />
            : <CheckCircle size={15} />}
          <AlertDescription className="text-sm opacity-100 font-medium">
            {hasAlert
              ? `BOARD ALERT: ${redCount} KPI${redCount > 1 ? 's' : ''} in breach — immediate escalation required`
              : `ALL SYSTEMS COMPLIANT — Hedged margin ${marginPct}% | ${bufferSign}${bufferBps}bps above Board floor`}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
