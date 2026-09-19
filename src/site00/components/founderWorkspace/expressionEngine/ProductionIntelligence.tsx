/**
 * B5.0 / C1.0 — Production intelligence + narrative synthesis review.
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';
import type { ExpressionEngineB1Phase2Response } from '../../../../../shared/site00-expression-engine/campaignClientTypes.js';
import type { NarrativeSynthesis } from '../../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import { NarrativeSynthesisWorkspace } from './NarrativeSynthesisWorkspace';

type Props = {
  blueprint: Entry002ProductionBlueprint;
  readiness: ExpressionEngineB1Phase2Response['readiness002'];
  narrativeSynthesis?: NarrativeSynthesis | null;
  onNarrativeJudgment?: (
    j: 'LOVE_IT' | 'PUSH_FURTHER' | 'TOO_SAFE' | 'TOO_CLOSE' | 'PROMISING_REFINE' | 'NOT_FOR_ME',
  ) => void;
  narrativeJudging?: boolean;
};

export function ProductionIntelligence({
  blueprint,
  readiness,
  narrativeSynthesis,
  onNarrativeJudgment,
  narrativeJudging,
}: Props) {
  return (
    <section className="site00-ee-production-intel">
      {narrativeSynthesis ? (
        <article className="site00-ee-production-intel__block site00-ee-production-intel__block--narrative">
          <NarrativeSynthesisWorkspace
            synthesis={narrativeSynthesis}
            onJudgment={onNarrativeJudgment}
            judging={narrativeJudging}
          />
        </article>
      ) : null}

      <article className="site00-ee-production-intel__block">
        <h3>PRODUCTION PLAN</h3>
        <ul>
          {blueprint.productionPlan.tasks.slice(0, 6).map((t) => (
            <li key={t.taskId}>
              <strong>{t.format}</strong> · {t.taskClass} · <em>{t.status}</em>
            </li>
          ))}
        </ul>
      </article>

      <article className="site00-ee-production-intel__block">
        <h3>AUDIO</h3>
        <p>{blueprint.audioPlan.status} · {blueprint.audioPlan.requiredForFormats.join(', ')}</p>
        <ul>
          {blueprint.audioPlan.layers.map((l) => (
            <li key={l.layerId}>{l.type} — {l.purpose}</li>
          ))}
        </ul>
      </article>

      <article className="site00-ee-production-intel__block site00-ee-production-intel__routing">
        <h3>PROVIDER ROUTING</h3>
        <ul>
          {blueprint.providerRouting.map((r) => (
            <li key={`${r.taskClass}-${r.format}`}>
              <strong>{r.taskClass}</strong> → {r.recommendedProvider} / {r.recommendedModel}
            </li>
          ))}
        </ul>
      </article>

      <article className="site00-ee-production-intel__block">
        <h3>READINESS</h3>
        <p>{readiness.ready ? 'READY' : 'NOT READY'}</p>
        {readiness.blockers.length ? (
          <ul>
            {readiness.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : (
          <p>No blockers.</p>
        )}
      </article>
    </section>
  );
}
