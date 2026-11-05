/**
 * One micro-asset slot. Renders the founder's art for a registry ID when it is available, otherwise the fallback (the
 * existing line glyph), so a missing or pending batch never leaves a hole and never borrows unrelated art. Always
 * decorative: the control's name stays live text.
 */
import type { ReactNode } from 'react';
import { microAssetSrc, type MicroAssetId } from './microAssets';

export function MicroIcon({ id, fallback, className = '' }: { id?: MicroAssetId | null; fallback: ReactNode; className?: string }) {
  const src = microAssetSrc(id);
  if (!src) return <>{fallback}</>;
  return <img className={`f05-micro ${className}`} src={src} alt="" aria-hidden draggable={false} data-micro-asset={id ?? undefined} />;
}
