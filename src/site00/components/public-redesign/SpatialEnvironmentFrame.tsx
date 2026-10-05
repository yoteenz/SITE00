import type { CSSProperties, ReactNode } from 'react';
import { AssetSlot } from './AssetSlot';

type SpatialEnvironmentFrameProps = {
  /** Environment plate slot id (Grok injects the real plate; until then a neutral luminous gradient). */
  slotId: string;
  /** Visual family tone for the neutral placeholder. */
  tone?: 'atrium' | 'daylight' | 'arch';
  /** Fraction of the viewport height the plate occupies (panel pages show it only above the panel). */
  extent?: 'full' | 'upper';
  /**
   * An EXISTING approved environment image to keep mounted until Grok registers a replacement for the
   * slot (Origin keeps its approved landmark plate). Never an authority-screenshot crop.
   */
  fallbackImageUrl?: string;
  children?: ReactNode;
};

/**
 * Full-bleed environment behind a page. Pure presentation: aria-hidden, no text, no UI.
 * Layout never depends on the plate's content — only on this frame's box.
 */
export function SpatialEnvironmentFrame({ slotId, tone = 'atrium', extent = 'full', fallbackImageUrl, children }: SpatialEnvironmentFrameProps) {
  const plateStyle: CSSProperties | undefined = fallbackImageUrl
    ? { backgroundImage: `url("${fallbackImageUrl.replace(/"/g, '\\"')}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;
  return (
    <div className={`s00pr-env s00pr-env--${tone} s00pr-env--${extent}`} aria-hidden="true" data-environment={slotId}>
      <AssetSlot slotId={slotId} className="s00pr-env__plate" style={plateStyle} />
      <div className="s00pr-env__wash" />
      {children}
    </div>
  );
}
