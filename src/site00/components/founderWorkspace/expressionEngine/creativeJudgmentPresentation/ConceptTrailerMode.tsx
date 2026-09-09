/**
 * P0.CJ.2 — Client-showable trailer / gift deck mode (minimal chrome).
 */

import type { ConceptPanel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  panel: ConceptPanel;
  onExit?: () => void;
};

export function ConceptTrailerMode({ panel, onExit }: Props) {
  const hero = panel.assets.find((a) => a.assetId === panel.heroVisualAssetId);
  return (
    <div className="site00-cj-trailer">
      {onExit ? (
        <button type="button" className="site00-cj-trailer__exit" onClick={onExit}>EXIT TRAILER</button>
      ) : null}
      <div className="site00-cj-trailer__hero">
        <span>{hero?.symbolicTreatment ?? panel.conceptTitle}</span>
      </div>
      <p className="site00-cj-trailer__brand">{panel.brandName}</p>
      <h1>{panel.conceptTitle}</h1>
      <p className="site00-cj-trailer__premise">{panel.oneLinePremise}</p>
      <ul className="site00-cj-trailer__beats">
        <li><strong>Tension</strong> {panel.centralTension}</li>
        <li><strong>Mechanism</strong> {panel.mechanism}</li>
        <li><strong>World</strong> {panel.world}</li>
        <li><strong>Interjection</strong> {panel.interjection}</li>
      </ul>
      <p className="site00-cj-trailer__grounding">{panel.groundingLabel} · {panel.expressionContext}</p>
    </div>
  );
}
