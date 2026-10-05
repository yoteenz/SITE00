/**
 * Optional pre-spend transparency — concise A/B/C art-direction territories (no approval gate).
 */

import type { WebExpressionTerritorySet } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptWebExpressionTerritories.js';
import { formatWebExpressionTerritoryPreviewLines } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptWebExpressionTerritories.js';

export function PageConceptWebExpressionTerritoryPreview({
  territorySet,
}: {
  territorySet: WebExpressionTerritorySet | null | undefined;
}) {
  if (!territorySet?.territories?.length) return null;

  return (
    <section className="s00-pcg__territoryPreview" data-testid="page-concept-web-expression-territory-preview">
      <header className="s00-pcg__territoryPreviewHead">
        <h4>WEB EXPRESSION · A / B / C</h4>
        <p>Creative territories assigned before GPT2 render — inspect full detail after INSPECT.</p>
      </header>
      <ul className="s00-pcg__territoryPreviewList">
        {territorySet.territories.map((t) => (
          <li key={t.territoryId} className="s00-pcg__territoryPreviewItem">
            {formatWebExpressionTerritoryPreviewLines(t).map((line, i) => (
              <span key={i} className={i === 0 ? 's00-pcg__territoryPreviewTitle' : 's00-pcg__territoryPreviewLine'}>
                {line}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
