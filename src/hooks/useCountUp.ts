// ============================================================
// useCountUp — eases a displayed number toward its target value
// ============================================================
import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target || prefersReducedMotion()) {
      fromRef.current = target;
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // rAF is throttled in background tabs — guarantee we land on the target
    const settle = setTimeout(() => {
      cancelAnimationFrame(frame);
      fromRef.current = target;
      setValue(target);
    }, duration + 100);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [target, duration]);

  return Math.round(value);
}
