/**
 * P0.NDX.NARRATIVE-MOMENTUM-ENGINE1 — founder narrative architecture review.
 */

import type { NarrativeMomentumPlan } from '../../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import { QuietAction } from '../WorkspaceCompositionPrimitives';

type Props = {
  plan: NarrativeMomentumPlan;
  grammarLibraryCount: number;
  judging: boolean;
  onJudgment: (
    action: 'APPROVE_NARRATIVE' | 'REFINE_NARRATIVE' | 'LOVE_IT' | 'PROMISING' | 'TOO_CLOSE' | 'NOT_NDXBOOK',
  ) => Promise<void>;
  onRecompile: () => Promise<void>;
};

export function ExpressionEngineNarrativeMomentumPanel({
  plan,
  grammarLibraryCount,
  judging,
  onJudgment,
  onRecompile,
}: Props) {
  const reel = plan.formatAdaptations.find((f) => f.format === 'REEL');

  return (
    <section className="site00-expr-engine-panel" data-testid="narrative-momentum-review">
      <header className="site00-expr-engine-panel__head">
        <h2 className="site00-expr-engine-panel__title">NARRATIVE MOMENTUM</h2>
        <p className="site00-expr-engine-panel__meta">
          {plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' ?
            'RETROACTIVE AUTHORITY LAYER — approved visual assets preserved'
          : 'STANDARD PIPELINE LAYER'}
          {' · '}
          Grammar library: {grammarLibraryCount}
          {' · '}
          Provider spend: {plan.providerDispatchCount}
        </p>
      </header>

      <div className="site00-expr-engine-panel__grid">
        <div>
          <h3>NARRATIVE GOAL</h3>
          <p>{plan.narrativeGoal}</p>
        </div>
        <div>
          <h3>STARTING BELIEF</h3>
          <p>{plan.audienceStartingBelief}</p>
        </div>
        <div>
          <h3>DESIRED SHIFT</h3>
          <p>{plan.audienceDesiredShift}</p>
        </div>
        <div>
          <h3>SELECTED GRAMMAR</h3>
          <p>
            {plan.selectedGrammarId}
            {plan.alternateGrammarId ? ` · alternate: ${plan.alternateGrammarId}` : ''}
          </p>
          <p className="site00-expr-engine-panel__meta">{plan.grammarReason}</p>
        </div>
      </div>

      <h3>BEAT MAP</h3>
      <ol className="site00-expr-engine-panel__list" data-testid="narrative-momentum-beats">
        {plan.beats.map((b) => (
          <li key={b.beatId}>
            <strong>{b.label}</strong> — {b.whatChangesInThisBeat}
            <span className="site00-expr-engine-panel__meta">
              {' '}
              · tension {b.tensionStage} · {b.shotFunction}
            </span>
          </li>
        ))}
      </ol>

      <h3>PROOF ARCHITECTURE</h3>
      <ul className="site00-expr-engine-panel__list">
        {plan.proofArchitecture.objects.map((p) => (
          <li key={p.proofId}>
            {p.proofType} ({p.strength}): {p.whatItProves}
          </li>
        ))}
      </ul>
      <p className="site00-expr-engine-panel__meta">Placement: {plan.proofArchitecture.placementPlan.strategy}</p>

      {plan.culturalGlitch ?
        <>
          <h3>CULTURAL GLITCH</h3>
          <p>{plan.culturalGlitch.glitchMoment}</p>
          <p className="site00-expr-engine-panel__meta">{plan.culturalGlitch.residualQuestion}</p>
        </>
      : null}

      <h3>REFRAME</h3>
      <p>
        <strong>BEFORE:</strong> {plan.reframe.before}
      </p>
      <p>
        <strong>AFTER:</strong> {plan.reframe.after}
      </p>

      <h3>OPEN LOOP</h3>
      <p>{plan.openLoop.newQuestion}</p>
      <p className="site00-expr-engine-panel__meta">Next: {plan.nextNarrativeOpportunity}</p>

      {reel?.reelArchitecture ?
        <>
          <h3>REEL ADAPTATION</h3>
          <ul className="site00-expr-engine-panel__list">
            <li>Opening: {reel.reelArchitecture.openingMoment}</li>
            <li>Midpoint: {reel.reelArchitecture.midpointTurn}</li>
            <li>Reframe: {reel.reelArchitecture.reframe}</li>
            <li>Open loop: {reel.reelArchitecture.openLoop}</li>
          </ul>
        </>
      : null}

      {plan.validationFlags.length ?
        <p className="site00-expr-engine-panel__warn" data-testid="narrative-momentum-flags">
          Flags: {plan.validationFlags.join(', ')}
        </p>
      : null}

      <p className="site00-expr-engine-panel__meta">Status: {plan.founderStatus}</p>

      <div className="site00-expr-engine-panel__actions">
        <QuietAction disabled={judging} onClick={() => void onJudgment('LOVE_IT')}>
          LOVE IT
        </QuietAction>
        <QuietAction disabled={judging} onClick={() => void onJudgment('APPROVE_NARRATIVE')}>
          APPROVE NARRATIVE
        </QuietAction>
        <QuietAction disabled={judging} onClick={() => void onJudgment('PROMISING')}>
          PROMISING
        </QuietAction>
        <QuietAction disabled={judging} onClick={() => void onJudgment('TOO_CLOSE')}>
          TOO CLOSE
        </QuietAction>
        <QuietAction disabled={judging} onClick={() => void onJudgment('NOT_NDXBOOK')}>
          NOT NDXBOOK
        </QuietAction>
        <QuietAction disabled={judging} onClick={() => void onJudgment('REFINE_NARRATIVE')}>
          REFINE NARRATIVE
        </QuietAction>
        <QuietAction disabled={judging} onClick={() => void onRecompile()}>
          RE-COMPILE
        </QuietAction>
      </div>
    </section>
  );
}
