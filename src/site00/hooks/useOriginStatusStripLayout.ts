import { useEffect, useState } from 'react';

/** Pick status strip layout from artboard shell (desktop composition) vs phone viewport. */
export function useOriginStatusStripLayout(isDesktopArtboardLayout: boolean): 'desktop' | 'mobile' {
  const [mobileViewport, setMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );

  useEffect(() => {
    if (isDesktopArtboardLayout) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setMobileViewport(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [isDesktopArtboardLayout]);

  if (isDesktopArtboardLayout) return 'desktop';
  return mobileViewport ? 'mobile' : 'desktop';
}
