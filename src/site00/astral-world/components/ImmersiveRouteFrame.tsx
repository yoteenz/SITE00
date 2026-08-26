import type { ReactNode } from 'react';

/**
 * FT5 — Unified immersive route wrapper (mobile + desktop scene-first).
 * Replaces split aw-mobile-only / aw-desktop-only panel layouts.
 */
export function ImmersiveRouteFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`aw-route-scene aw-route-scene--immersive ${className}`.trim()}>
      {children}
    </div>
  );
}
