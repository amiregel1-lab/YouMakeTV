import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Target value to count toward. */
  value: number;
  /** Milliseconds the animation runs. */
  duration?: number;
  /** Decimal places to render. */
  decimals?: number;
  /** Rendered before the number, e.g. "$". */
  prefix?: string;
  /** Rendered after the number, e.g. "+". */
  suffix?: string;
  /** Group thousands with commas. */
  separator?: boolean;
  className?: string;
}

// easeOutExpo — fast start, gentle settle. Reads like an odometer coming to rest.
function easeOut(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animated count-up number. Starts when it first scrolls into view so the
 * "value ticking up" moment lands where the reader is actually looking.
 * Respects prefers-reduced-motion by snapping straight to the final value.
 */
export default function CountUp({
  value,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = true,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduce) {
        setDisplay(value);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setDisplay(value * easeOut(t));
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: separator,
  }).format(display);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
