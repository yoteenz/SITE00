/**
 * P0.CJ.2V — Compact engine read block (not dominant).
 */

import { formatEngineRead, summarizeLine } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/conceptDisplayUtils.js';
import type { ConceptPanel } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  panel: ConceptPanel;
};

export function ConceptEngineRead({ panel }: Props) {
  const why = panel.failureClass ?? panel.diagnostics.risks[0] ?? 'NONE';
  return (
    <details className="site00-cj-engine-read">
      <summary>
        <span className="site00-cj-engine-read__label">ENGINE READ</span>
        <span className="site00-cj-engine-read__value">{formatEngineRead(panel.decision, panel.score)}</span>
      </summary>
      <div className="site00-cj-engine-read__body">
        <p><span>WHY</span> {summarizeLine(String(why).replace(/_/g, ' '), 96)}</p>
        <details className="site00-cj-engine-read__nested">
          <summary>DETAILS</summary>
          <p>{summarizeLine(panel.diagnostics.fullReasoning, 240)}</p>
        </details>
      </div>
    </details>
  );
}
