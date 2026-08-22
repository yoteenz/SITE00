import { useEffect, useState } from 'react';

const MOBILE_MAX_PX = 767;

/** Matches SITE 00 mobile shell breakpoint (LocationsPage, ecosystem mobile). */
export function useSite00MobileViewport(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`).matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_PX}px)`);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return mobile;
}

export const SITE00_MOBILE_VIEWPORT_MAX_PX = MOBILE_MAX_PX;
