import { useEffect, useRef, useState } from 'react';

export function ValueTicker({ value, prefix = '', suffix = '', className = '' }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    const raf = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    prevRef.current = end;
  }, [value]);

  return (
    <span className={className}>
      {prefix}{displayed.toLocaleString('en-IN')}{suffix}
    </span>
  );
}
