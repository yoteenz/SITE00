/**
 * C1.4 — Senior Director Review presentation for founder.
 */

import type { Entry003C14Package } from '../../../../../shared/site00-expression-engine/entry-003/types.js';

type Props = {
  pkg: Entry003C14Package | null;
};

export function Entry003SeniorDirectorReview({ pkg }: Props) {
  if (!pkg?.seniorCreativeJudgment) {
    return null;
  }

  const scj = pkg.seniorCreativeJudgment;
  const review = scj.seniorDirectorReview;

  return (
    <section className="site00-expr-engine-panel site00-expr-engine-senior-review">
      <header className="site00-expr-engine-panel__head">
        <h2>SENIOR DIRECTOR REVIEW</h2>
        <span className={`site00-expr-engine-senior-review__tier site00-expr-engine-senior-review__tier--${review.qualityTier.toLowerCase()}`}>
          {review.qualityTier}
        </span>
      </header>

      <dl className="site00-expr-engine-senior-review__grid">
        <div>
          <dt>THE FIRST ANSWER</dt>
          <dd>{review.initialWinner}</dd>
        </div>
        <div>
          <dt>THE CHALLENGE</dt>
          <dd>{review.theChallenge}</dd>
        </div>
        <div>
          <dt>THE DEEPER IDEA</dt>
          <dd>{review.deeperIdea}</dd>
        </div>
        <div>
          <dt>THE FINAL DIRECTION</dt>
          <dd>{review.finalDirection}</dd>
        </div>
        <div>
          <dt>WHY IT SURVIVED</dt>
          <dd>
            <ul>
              {review.whyItSurvived.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>CAMPAIGN FIT</dt>
          <dd>{review.campaignFit}</dd>
        </div>
        <div>
          <dt>FOUNDER HANDHOLDING RISK</dt>
          <dd>{review.founderHandholdingRisk}</dd>
        </div>
        <div>
          <dt>CONFIDENCE</dt>
          <dd>{review.confidence}</dd>
        </div>
      </dl>

      <details className="site00-expr-engine-senior-review__details">
        <summary>ARTIFACT NECESSITY · {scj.artifactNecessity.outcome.replace(/_/g, ' ')}</summary>
        <p>{scj.artifactNecessity.rationale}</p>
      </details>

      <details className="site00-expr-engine-senior-review__details">
        <summary>HERO MEMORY IMAGE</summary>
        <p>{scj.heroMemoryImage.imageDescription}</p>
      </details>

      <details className="site00-expr-engine-senior-review__details">
        <summary>CAMERA DISCOVERY · {scj.cameraDiscovery.function.replace(/_/g, ' ')}</summary>
        <p>{scj.cameraDiscovery.whatCameraLearns}</p>
      </details>
    </section>
  );
}
