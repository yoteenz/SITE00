/**
 * C1.5 — Generic Senior Creative Judgment founder review surface.
 */

import type { SeniorCreativeJudgmentOutput } from '../../../../../shared/site00-expression-engine/senior-creative-judgment/types.js';

type BriefSummary = {
  brandName: string;
  campaignObjective: string;
};

type Props = {
  brief?: BriefSummary | null;
  judgment: SeniorCreativeJudgmentOutput | null;
  runtimeMode?: string;
  campaignResponsibility?: Record<string, string> | null;
};

export function GenericCreativeJudgmentReview({
  brief,
  judgment,
  runtimeMode,
  campaignResponsibility,
}: Props) {
  if (!judgment) return null;
  const review = judgment.seniorDirectorReview;

  return (
    <section className="site00-expr-engine-panel site00-expr-engine-senior-review">
      <header className="site00-expr-engine-panel__head">
        <h2>SENIOR CREATIVE JUDGMENT</h2>
        <span className={`site00-expr-engine-senior-review__tier site00-expr-engine-senior-review__tier--${review.qualityTier.toLowerCase()}`}>
          {review.qualityTier}
        </span>
      </header>

      {brief ? (
        <dl className="site00-expr-engine-senior-review__grid">
          <div>
            <dt>THE BRIEF</dt>
            <dd>{brief.brandName} — {brief.campaignObjective}</dd>
          </div>
        </dl>
      ) : null}

      {campaignResponsibility ? (
        <dl className="site00-expr-engine-senior-review__grid">
          <div>
            <dt>CAMPAIGN RESPONSIBILITY</dt>
            <dd>{campaignResponsibility.brandTruthToProve ?? campaignResponsibility.campaignObjective}</dd>
          </div>
        </dl>
      ) : null}

      <dl className="site00-expr-engine-senior-review__grid">
        <div>
          <dt>INITIAL WINNER</dt>
          <dd>{review.initialWinner}</dd>
        </div>
        <div>
          <dt>DIRECTOR&apos;S CHALLENGE</dt>
          <dd>{review.theChallenge}</dd>
        </div>
        <div>
          <dt>CHALLENGER</dt>
          <dd>{judgment.challenger.conceptName}</dd>
        </div>
        <div>
          <dt>FINAL DIRECTION</dt>
          <dd>{review.finalDirection}</dd>
        </div>
        <div>
          <dt>HERO MEMORY MOMENT</dt>
          <dd>{judgment.heroMemoryImage.imageDescription}</dd>
        </div>
        <div>
          <dt>RUNTIME MODE</dt>
          <dd>{runtimeMode ?? 'DETERMINISTIC_FALLBACK'}</dd>
        </div>
        <div>
          <dt>FOUNDER HANDHOLDING RISK</dt>
          <dd>{review.founderHandholdingRisk}</dd>
        </div>
      </dl>
    </section>
  );
}
