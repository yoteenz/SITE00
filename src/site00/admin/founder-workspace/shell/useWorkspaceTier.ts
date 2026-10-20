import { useEffect, useState } from 'react';

function match(q: string): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(q).matches : false;
}

/** Live media-query flag (SSR-safe). */
export function useMediaQuery(query: string): boolean {
  const [on, setOn] = useState(() => match(query));
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const onChange = () => setOn(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return on;
}

/** The inspector docks beside the stage only when the stage keeps ≥ 680 px (OPUS2 dock rule → viewport ≥ 1100). */
export const useInspectorDocked = () => useMediaQuery('(min-width: 1100px)');
