import type { ReactNode } from 'react';
import type { SpecimenImageAsset } from '../TerritoryRendererRegistry';

export type SpecimenVisualOptions = {
  grayscale?: boolean;
  hideLabels?: boolean;
};

export function paletteFromGrayscale<T extends { primary: string; secondary: string; accent: string }>(
  on: boolean | undefined,
  colors: T,
): T {
  if (!on) return colors;
  const gray = { primary: '#1a1a1a', secondary: '#f0f0f0', accent: '#666666' } as T;
  for (const key of Object.keys(colors) as Array<keyof T>) {
    if (key !== 'primary' && key !== 'secondary' && key !== 'accent') {
      (gray as Record<string, string>)[key as string] = '#666666';
    }
  }
  return gray;
}

/**
 * Renders a HYBRID_COMPOSITION / GENERATED_ASSET image with an independently
 * authored mobile recomposition (never a proportional shrink of the desktop
 * placement) — see docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md §6. Full-bleed
 * assets (no compositeMap) simply cover the tile; assets with a compositeMap are
 * positioned via CSS custom properties scoped to this specimen's asset id, with a
 * @media override supplying the mobile map so recomposition happens in pure CSS.
 */
export function HybridAssetLayer({ asset, gs }: { asset: SpecimenImageAsset; gs?: boolean }) {
  const scopeClass = `site00-cd-hybrid-${asset.assetId}`;
  if (!asset.compositeMap) {
    return (
      <img
        src={asset.url}
        alt=""
        aria-hidden="true"
        className="site00-cd-hybrid-layer site00-cd-hybrid-layer--full-bleed"
        style={gs ? { filter: 'grayscale(1) contrast(1.05)' } : undefined}
      />
    );
  }
  const { desktop, mobile } = asset.compositeMap;
  const css = `
    .${scopeClass} {
      --x: ${desktop.xPct}%; --y: ${desktop.yPct}%; --w: ${desktop.widthPct}%;
      --rot: ${desktop.rotationDeg ?? 0}deg; --z: ${desktop.zIndex};
    }
    @media (max-width: 640px) {
      .${scopeClass} {
        --x: ${mobile.xPct}%; --y: ${mobile.yPct}%; --w: ${mobile.widthPct}%;
        --rot: ${mobile.rotationDeg ?? 0}deg; --z: ${mobile.zIndex};
      }
    }
  `;
  return (
    <>
      <style>{css}</style>
      <img
        src={asset.url}
        alt=""
        aria-hidden="true"
        className={`site00-cd-hybrid-layer ${scopeClass}`}
        style={gs ? { filter: 'grayscale(1) contrast(1.05)' } : undefined}
      />
    </>
  );
}

/** Small provenance strip — always visible so founders see GENERATED vs APPROVED, never implicit. */
export function AssetProvenanceTag({ asset, hidden }: { asset?: SpecimenImageAsset; hidden?: boolean }) {
  if (!asset || hidden) return null;
  return (
    <span className="site00-cd-hybrid-provenance">
      {asset.classification} · {asset.approvalState} · {asset.backgroundTreatment}
    </span>
  );
}

export function SpecimenFrame({
  title,
  status,
  hideLabels,
  layout = 'default',
  provenance,
  children,
}: {
  title: string;
  status: string;
  hideLabels?: boolean;
  layout?: 'default' | 'wide' | 'tall' | 'full';
  /** Truthful FAL asset provenance — only rendered when a real generated image backs this specimen. */
  provenance?: { approvalState: string; model: string; volume?: string } | null;
  children: ReactNode;
}) {
  const layoutClass =
    layout === 'wide'
      ? 'site00-cd-specimen--wide'
      : layout === 'tall'
        ? 'site00-cd-specimen--tall'
        : layout === 'full'
          ? 'site00-cd-specimen--full'
          : '';
  return (
    <figure className={`site00-cd-specimen ${provenance ? 'site00-cd-specimen--imaged' : ''} ${layoutClass}`.trim()}>
      {children}
      {hideLabels ? null : (
        <figcaption>
          {title} · {status}
          {provenance ? (
            <span className="site00-cd-specimen__provenance">
              {' '}
              · {provenance.approvalState} (FAL{provenance.volume ? ` · ${provenance.volume}` : ''})
            </span>
          ) : null}
        </figcaption>
      )}
    </figure>
  );
}
