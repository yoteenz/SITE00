import { useLayoutEffect, useState } from 'react';
import { resolveSite00EnterDesktopFocal } from '../config/resolveSite00EnterDesktopFocal';

const ENTER_FOCAL_MEDIA = ['(min-aspect-ratio: 21/9)', '(max-height: 799px)', '(min-height: 900px)', '(min-width: 768px)'] as const;

/** Live Enter desktop focal — inline backgroundPosition so CSS cascade cannot revert it. */
export function useSite00EnterDesktopFocal(active: boolean): string | undefined {
  const [focal, setFocal] = useState<string | undefined>(() =>
    active && typeof window !== 'undefined' ? resolveSite00EnterDesktopFocal() : undefined,
  );

  useLayoutEffect(() => {
    if (!active) {
      setFocal(undefined);
      return;
    }

    const sync = () => setFocal(resolveSite00EnterDesktopFocal());
    sync();

    const queries = ENTER_FOCAL_MEDIA.map((query) => window.matchMedia(query));
    queries.forEach((mq) => mq.addEventListener('change', sync));
    window.addEventListener('resize', sync);

    return () => {
      queries.forEach((mq) => mq.removeEventListener('change', sync));
      window.removeEventListener('resize', sync);
    };
  }, [active]);

  return focal;
}
