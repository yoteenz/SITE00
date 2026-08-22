import type { FormedCoreDirection, VisualProofPlan } from '../../../../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';

export type FormedDirectionReviewProps = {
  directions: FormedCoreDirection[];
  visualProofPlans?: VisualProofPlan[];
  brandLoreProfileVersion?: number;
  formationVersion?: number;
  status?: string;
};

export function FormedCoreDirectionReview({
  directions,
  visualProofPlans = [],
  brandLoreProfileVersion,
  formationVersion,
  status,
}: FormedDirectionReviewProps) {
  if (!directions.length) return null;

  const planByDirection = new Map(visualProofPlans.map((p) => [p.directionId, p]));

  return (
    <section className="site00-cd__formed-formation" aria-labelledby="cd-formed-formation">
      <header className="site00-cd__formed-head">
        <p className="site00-cd__formed-kicker">NEW FORMATION</p>
        <h2 id="cd-formed-formation" className="site00-cd__section-title">
          FORMED FROM YOUR BRAND INTELLIGENCE
        </h2>
        <p className="site00-cd__formed-meta">
          {brandLoreProfileVersion != null ? `BRAND LORE VERSION ${brandLoreProfileVersion}` : null}
          {formationVersion != null ? ` · FORMATION VERSION ${formationVersion}` : null}
          {status ? ` · ${status.replace(/_/g, ' ')}` : null}
        </p>
      </header>

      <div className="site00-cd__formed-grid">
        {directions.map((direction, index) => {
          const plan = planByDirection.get(direction.directionId);
          return (
            <article key={direction.directionId} className="site00-cd__formed-card">
              <p className="site00-cd__formed-index">DIRECTION 0{index + 1}</p>
              <h3 className="site00-cd__formed-name">{direction.directionName}</h3>
              <dl className="site00-cd__formed-fields">
                <dt>BIG IDEA</dt>
                <dd>{direction.bigIdea}</dd>
                <dt>ONE-LINE THESIS</dt>
                <dd>{direction.oneLineThesis}</dd>
                <dt>WHY THIS BELONGS TO NDX BOOK</dt>
                <dd>{direction.brandConnection}</dd>
                <dt>LORE LINEAGE</dt>
                <dd>
                  <ul>{direction.loreLineage.map((line) => <li key={line}>{line}</li>)}</ul>
                </dd>
                <dt>CENTRAL METAPHOR</dt>
                <dd>{direction.visualMetaphor}</dd>
                <dt>CONCEPTUAL ANCESTOR</dt>
                <dd>{direction.conceptualAncestor || direction.culturalReference}</dd>
                <dt>GOVERNING BEHAVIOR</dt>
                <dd>{direction.governingBehavior}</dd>
                <dt>PRIMARY ARTIFACT</dt>
                <dd>{direction.primaryBrandArtifact}</dd>
                <dt>MATERIAL LANGUAGE</dt>
                <dd>{direction.materialImageryLanguage}</dd>
                <dt>IMAGERY LANGUAGE</dt>
                <dd>{direction.imageryLanguage}</dd>
                <dt>TYPOGRAPHIC ATTITUDE</dt>
                <dd>{direction.typographicAttitude}</dd>
                <dt>COLOR LOGIC</dt>
                <dd>{direction.colorLogic || direction.coreColorLogic}</dd>
                <dt>MOTION SEED</dt>
                <dd>{direction.motionSeed}</dd>
                <dt>SOCIAL EXPRESSION HYPOTHESIS</dt>
                <dd>{direction.socialExpressionHypothesis}</dd>
                <dt>RISKS</dt>
                <dd>
                  <ul>{direction.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
                </dd>
              </dl>
              {plan ? (
                <p className="site00-cd__formed-proof">VISUAL PROOF PLAN · READY FOR PRODUCTION</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
