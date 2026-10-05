/**
 * P0.CJ.2V — Concept hero visual / symbolic art placeholder.
 */

import { resolveConceptHeroArt } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptHeroArt.js';
import type { ConceptPanel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  panel: ConceptPanel;
  size?: 'gallery' | 'detail' | 'trailer' | 'thumb';
};

export function ConceptHeroVisual({ panel, size = 'gallery' }: Props) {
  const art = resolveConceptHeroArt(panel.id, panel.conceptTitle);
  return (
    <div
      className={`site00-cj-hero site00-cj-hero--${size} site00-cj-hero--${art.aspect} ${art.artClass}`}
      aria-label={art.pendingLabel}
    >
      <span className="site00-cj-hero__corner" aria-hidden="true" />
      <div className="site00-cj-hero__symbol">
        {art.symbolLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <span className="site00-cj-hero__pending">{art.pendingLabel}</span>
      {panel.isRealBrandDemo ? (
        <span className="site00-cj-hero__real-badge">REAL BRAND CASE</span>
      ) : null}
    </div>
  );
}
