import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  isPositive?: boolean;
}

const AnimatedNumber = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  className = '',
  duration = 0.5,
  isPositive 
}: AnimatedNumberProps) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(prevValue.current, value, {
      duration,
      onUpdate(value) {
        node.textContent = `${prefix}${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}${suffix}`;
      },
      ease: [0.25, 0.1, 0.25, 1] // Custom easing for smooth animation
    });

    prevValue.current = value;
    return () => controls.stop();
  }, [value, prefix, suffix, duration]);

  return (
    <span
      ref={nodeRef}
      className={`tabular-nums ${className} ${
        isPositive !== undefined 
          ? isPositive 
            ? 'text-green-400' 
            : 'text-red-400'
          : ''
      }`}
    >
      {prefix}{value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}{suffix}
    </span>
  );
};

export default AnimatedNumber;
