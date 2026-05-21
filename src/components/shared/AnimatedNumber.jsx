import { useEffect, useRef } from 'react';
import { useSpring, useTransform, useMotionValue, useReducedMotion, motion } from 'framer-motion';

/**
 * AnimatedNumber — spring-tweens between values with snappy overshoot.
 *
 * Usage:
 *   <AnimatedNumber value={11.42} decimals={2} suffix="%" />
 *   <AnimatedNumber value={394}  prefix="₹" suffix=" Cr" />
 *   <AnimatedNumber value={140}  format={n => `$${n.toFixed(0)}M`} />
 *
 * On first mount, counts from 0 → target.
 * On value change, spring-tweens previous → next with slight overshoot.
 * Respects prefers-reduced-motion (snaps instantly).
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  format,
  duration = 0.7,
  className,
  style,
}) {
  const prefersReduced = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 140,
    damping: 18,
    mass: 0.9,
  });

  const display = useTransform(spring, (latest) => {
    if (format) return format(latest);
    const n = Number.isFinite(latest) ? latest : 0;
    return `${prefix}${n.toFixed(decimals)}${suffix}`;
  });

  const firstRender = useRef(true);

  useEffect(() => {
    if (prefersReduced) {
      motionValue.set(value);
      return;
    }
    if (firstRender.current) {
      // First paint: count from 0
      motionValue.set(0);
      requestAnimationFrame(() => motionValue.set(value));
      firstRender.current = false;
    } else {
      motionValue.set(value);
    }
  }, [value, motionValue, prefersReduced]);

  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  );
}
