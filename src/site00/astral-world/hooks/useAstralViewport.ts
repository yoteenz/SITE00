import { useEffect, useState } from 'react';

const MOBILE_MAX = 1023;

/** Matches astral-world.css mobile breakpoint for hotspot + layout parity */
export function useAstralViewport(): { isMobile: boolean; isDesktop: boolean } {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return { isMobile, isDesktop: !isMobile };
}
