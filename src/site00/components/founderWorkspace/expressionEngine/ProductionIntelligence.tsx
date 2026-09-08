/**
 * B5.0 — Production intelligence drawer (plan, audio, routing, readiness).
 */

import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';
import type { ExpressionEngineB1Phase2Response } from '../../../../../shared/site00-expression-engine/campaignClientTypes.js';

type Props = {
  blueprint: Entry002ProductionBlueprint;
  readiness: ExpressionEngineB1Phase2Response['readiness002'];
};

export function ProductionIntelligence({ blueprint, readiness }: Props) {
  return (
    <section className="site00-ee-production-intel">
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
