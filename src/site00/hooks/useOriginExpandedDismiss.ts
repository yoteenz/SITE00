import { useEffect } from 'react';
import type { HomeMode } from '../state/types';

const EXPANDED_PANEL_HIT_TARGET = '.site00-home-expanded-column .site00-glass-panel';

/**
 * Desktop Origin artboard — collapse IDNTY/BLDR expanded panel when pointer down
 * occurs outside the panel surface (hero, plaza, header, nav, etc.).
 */
export function useOriginExpandedDismiss(
  homeMode: HomeMode,
  onCollapse: () => void,
  /** True on Origin desktop artboard (`/origin` ≥768px and `/origin/desktop`). */
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || homeMode === 'origin') return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      const panel = document.querySelector(EXPANDED_PANEL_HIT_TARGET);
      if (panel?.contains(target)) return;

      onCollapse();
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [homeMode, onCollapse, enabled]);
}
