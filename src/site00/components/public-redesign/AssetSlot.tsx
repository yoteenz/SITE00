import type { CSSProperties, ReactNode } from 'react';
import {
  PUBLIC_REDESIGN_ASSET_URLS,
  getAssetSlot,
} from '../../authority/publicRedesignAssetSlots';

type AssetSlotProps = {
  /** Stable slot id from `publicRedesignAssetSlots.ts`. */
  slotId: string;
  className?: string;
  style?: CSSProperties;
  /** Live content (e.g. an SVG scaffold) that should sit inside the slot until an asset is injected. */
  children?: ReactNode;
};

/**
 * A named place where a Grok-fabricated asset will be injected.
 * - Renders a neutral, text-free placeholder (CSS) — never an authority screenshot crop.
 * - When `PUBLIC_REDESIGN_ASSET_URLS[slotId]` is registered, renders the real image instead.
 * - Decorative: assets never carry UI copy, so they are aria-hidden.
 */
export function AssetSlot({ slotId, className = '', style, children }: AssetSlotProps) {
  const spec = getAssetSlot(slotId);
  const url = PUBLIC_REDESIGN_ASSET_URLS[slotId];
  const fit = spec?.crop === 'contain' ? 'contain' : 'cover';

  return (
    <div
      className={`s00pr-asset-slot ${className}`.trim()}
      data-asset-slot={slotId}
      data-asset-status={url ? 'injected' : 'placeholder'}
      data-asset-type={spec?.assetType}
      style={{ ...style, ['--s00pr-slot-aspect' as string]: spec?.aspect.replace(':', ' / ') }}
      aria-hidden="true"
    >
      {url ? <img className="s00pr-asset-slot__img" src={url} alt="" style={{ objectFit: fit }} /> : null}
      {children}
    </div>
  );
}
