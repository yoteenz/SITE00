/**
 * P0.NDX.NARRATIVE-MOMENTUM-PRECISION-AND-REVIEW-UX1 — creative-director review surface.
 */

import { useMemo, useState } from 'react';
import type { NarrativeMomentumPlan } from '../../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import '../../../styles/site00-narrative-momentum-review.css';

type Props = {
  plan: NarrativeMomentumPlan;
  grammarLibraryCount: number;
  judging: boolean;
  onJudgment: (
    action:
      | 'APPROVE_NARRATIVE'
      | 'REFINE_NARRATIVE'
      | 'CHANGE_GRAMMAR'
      | 'LOVE_IT'
      | 'PROMISING'
      | 'TOO_CLOSE'
      | 'NOT_NDXBOOK',
  ) => Promise<void>;
  onRecompile: () => Promise<void>;
};

type FormatTab = 'REEL' | 'CAROUSEL';

export function ExpressionEngineNarrativeMomentumPanel({
  plan,
  grammarLibraryCount,
  judging,
  onJudgment,
  onRecompile,
}: Props) {
  const [activeBeatId, setActiveBeatId] = useState<string | null>(plan.beats[0]?.beatId ?? null);
  const [formatTab, setFormatTab] = useState<FormatTab>('REEL');
  const [showLineage, setShowLineage] = useState(false);
  const [showGrammarLibrary, setShowGrammarLibrary] = useState(false);
  const [ignoredFlagKeys, setIgnoredFlagKeys] = useState<Set<string>>(() => new Set());

  const reel = plan.formatAdaptations.find((f) => f.format === 'REEL');
  const carousel = plan.formatAdaptations.find((f) => f.format === 'CAROUSEL');
  const issues = plan.validationIssues?.length ? plan.validationIssues : [];

  const activeBeat = useMemo(
    () => plan.beats.find((b) => b.beatId === activeBeatId) ?? plan.beats[0],
    [activeBeatId, plan.beats],
  );

  return (
    <section className="site00-nme-review" data-testid="narrative-momentum-review">
      <header>
        <h2 className="site00-nme-review__title">NARRATIVE MOMENTUM</h2>
        <p className="site00-nme-review__meta">
          {plan.layerMode === 'RETROACTIVE_AUTHORITY_LAYER' ? 'RETROACTIVE AUTHORITY · assets preserved' : 'STANDARD'}
          {showLineage ?
            <>
              {' · '}
              v{plan.version} · {plan.id} · library {grammarLibraryCount} · spend {plan.providerDispatchCount}
            </>
          : null}
        </p>
        <button type="button" className="site00-nme-review__btn" onClick={() => setShowLineage((v) => !v)}>
          {showLineage ? 'HIDE' : 'LINEAGE / TECHNICAL'}
        </button>
      </header>

      <dl className="site00-nme-review__snapshot">
        <div>
          <dt>NARRATIVE GOAL</dt>
          <dd>{plan.narrativeGoal}</dd>
        </div>
        <div>
          <dt>STARTING BELIEF</dt>
          <dd>{plan.audienceStartingBelief}</dd>
        </div>
        <div>
          <dt>DESIRED SHIFT</dt>
          <dd>{plan.audienceDesiredShift}</dd>
        </div>
      </dl>

      <article className="site00-nme-review__card">
        <h3>GRAMMAR</h3>
        <p>
          <strong>{plan.selectedGrammarId}</strong>
          {plan.alternateGrammarId ? ` · alternate ${plan.alternateGrammarId}` : ''}
        </p>
        <p className="site00-nme-review__meta">{plan.grammarReason}</p>
        <div className="site00-nme-review__grammar-actions">
          <button type="button" className="site00-nme-review__btn" onClick={() => setShowGrammarLibrary((v) => !v)}>
            {showGrammarLibrary ? 'HIDE GRAMMAR' : 'VIEW GRAMMAR'}
          </button>
          <button
            type="button"
            className="site00-nme-review__btn"
            disabled={judging}
            onClick={() => void onJudgment('CHANGE_GRAMMAR')}
          >
            CHANGE GRAMMAR
          </button>
        </div>
        {showGrammarLibrary ?
          <p className="site00-nme-review__meta">
            Library: {grammarLibraryCount} grammars · primary {plan.selectedGrammarId}
            {plan.alternateGrammarId ? ` · investigation alternate ${plan.alternateGrammarId}` : ''}
          </p>
        : null}
      </article>

      <div className="site00-nme-review__layout-split">
        <article className="site00-nme-review__card">
          <h3>BEAT MAP</h3>
          <div className="site00-nme-review__beat-map" data-testid="narrative-momentum-beats">
            {plan.beats.map((b) => (
              <div
                key={b.beatId}
                role="button"
                tabIndex={0}
                className={`site00-nme-review__beat-row${activeBeat?.beatId === b.beatId ? ' site00-nme-review__beat-row--active' : ''}`}
                onClick={() => setActiveBeatId(b.beatId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setActiveBeatId(b.beatId);
                }}
              >
                <span className="site00-nme-review__beat-num">{String(b.order).padStart(2, '0')}</span>
                <div>
                  <strong>{b.label}</strong>
                  <p className="site00-nme-review__meta">{b.whatChangesInThisBeat}</p>
                  <p className="site00-nme-review__meta">
                    {b.evidenceUsed.length ? `EVIDENCE: ${b.evidenceUsed.join(', ')}` : null}
                    {b.interpretationIntroduced.length ?
                      ` · LENS: ${b.interpretationIntroduced.join(', ')}`
                    : null}
                  </p>
                </div>
                <span className="site00-nme-review__meta">{b.tensionStage}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="site00-nme-review__card">
          <h3>TENSION CURVE</h3>
          <div className="site00-nme-review__tension-rail" data-testid="narrative-momentum-tension-curve">
            {plan.beats.map((b) => (
              <button
                key={b.beatId}
                type="button"
                className={`site00-nme-review__tension-chip${activeBeat?.beatId === b.beatId ? ' site00-nme-review__tension-chip--active' : ''}`}
                onClick={() => setActiveBeatId(b.beatId)}
              >
                {b.tensionStage}
              </button>
            ))}
          </div>
          {activeBeat ?
            <p className="site00-nme-review__meta" style={{ marginTop: '0.75rem' }}>
              Beat {activeBeat.order}: {activeBeat.tensionBefore} → {activeBeat.tensionAfter}
            </p>
          : null}
        </aside>
      </div>

      <article className="site00-nme-review__card">
        <h3>PROOF ARCHITECTURE (EVIDENCE)</h3>
        <div className="site00-nme-review__proof-grid">
          {(plan.evidence?.length ? plan.evidence : []).map((e) => (
            <div key={e.id} className="site00-nme-review__proof-card">
              <p>
                <strong>{e.proofType}</strong> · {e.strength}
              </p>
              <p
                className={
                  e.status === 'SOURCE_REQUIRED' ? 'site00-nme-review__status--required' : 'site00-nme-review__meta'
                }
              >
                SOURCE: {e.status.replace(/_/g, ' ')}
              </p>
              <p>{e.whatIsObserved}</p>
              <p className="site00-nme-review__meta">Placement: {e.placement.beatId} — {e.placement.whyNow}</p>
            </div>
          ))}
        </div>
        {plan.interpretations?.length ?
          <>
            <h3 style={{ marginTop: '1rem' }}>INTERPRETATION / NDX LENS</h3>
            <ul>
              {plan.interpretations.map((i) => (
                <li key={i.id}>
                  <strong>{i.role}</strong>: {i.claim}
                </li>
              ))}
            </ul>
          </>
        : null}
      </article>

      {plan.culturalGlitch ?
        <article className="site00-nme-review__card">
          <h3>CULTURAL GLITCH</h3>
          <p>
            <strong>PRESENT:</strong> {plan.culturalGlitch.familiarReality}
          </p>
          <p>
            <strong>ARCHIVED:</strong> {plan.culturalGlitch.receiptSource}
          </p>
          <p>
            <strong>COLLISION:</strong> {plan.culturalGlitch.glitchMoment}
          </p>
          <p className="site00-nme-review__meta">{plan.culturalGlitch.residualQuestion}</p>
        </article>
      : null}

      <article className="site00-nme-review__card">
        <h3>REFRAME</h3>
        <div className="site00-nme-review__reframe">
          <div>{plan.reframe.before}</div>
          <div className="site00-nme-review__reframe-arrow">→</div>
          <div>{plan.reframe.after}</div>
        </div>
      </article>

      <article className="site00-nme-review__card">
        <h3>OPEN LOOP</h3>
        <p>
          <strong>UNRESOLVED:</strong> {plan.openLoop.newQuestion}
        </p>
        <p className="site00-nme-review__meta">Next opportunity: {plan.nextNarrativeOpportunity}</p>
      </article>

      <div className="site00-nme-review__tabs">
        <button
          type="button"
          className={`site00-nme-review__tab${formatTab === 'REEL' ? ' site00-nme-review__tab--active' : ''}`}
          onClick={() => setFormatTab('REEL')}
        >
          REEL
        </button>
        <button
          type="button"
          className={`site00-nme-review__tab${formatTab === 'CAROUSEL' ? ' site00-nme-review__tab--active' : ''}`}
          onClick={() => setFormatTab('CAROUSEL')}
        >
          CAROUSEL
        </button>
      </div>

      {formatTab === 'REEL' && reel?.reelDetail ?
        <article className="site00-nme-review__card" data-testid="narrative-momentum-reel-tab">
          <ol>
            {reel.reelDetail.beatSequence.map((rb) => (
              <li key={rb.sourceNarrativeBeatId}>
                <strong>{rb.narrativePurpose}</strong> — {rb.screenAction}
                <span className="site00-nme-review__meta"> · knows: {rb.viewerKnowledgeState}</span>
              </li>
            ))}
          </ol>
        </article>
      : null}

      {formatTab === 'CAROUSEL' && carousel?.carouselDetail ?
        <article className="site00-nme-review__card" data-testid="narrative-momentum-carousel-tab">
          <ol>
            {carousel.carouselDetail.slideSequence.map((s) => (
              <li key={s.slideNumber}>
                Slide {s.slideNumber}: {s.purpose} — {s.contentRole} ({s.tensionStage})
              </li>
            ))}
          </ol>
        </article>
      : null}

      {issues.length ?
        <article className="site00-nme-review__card" data-testid="narrative-momentum-flags">
          <h3>FLAGS</h3>
          {issues.map((issue, idx) => {
            const key = `${issue.flagId}-${idx}`;
            if (ignoredFlagKeys.has(key)) return null;
            return (
              <div
                key={key}
                className={`site00-nme-review__flag${issue.blocking ? ' site00-nme-review__flag--blocking' : ''}`}
              >
                <p>
                  <strong>{issue.flagId}</strong> · {issue.severity}
                </p>
                <p>{issue.explanation}</p>
                <p className="site00-nme-review__meta">Affects: {issue.affectedBeatIds.join(', ')}</p>
                <p className="site00-nme-review__meta">Suggested: {issue.suggestedCorrection}</p>
                <div className="site00-nme-review__flag-actions">
                  <button
                    type="button"
                    className="site00-nme-review__btn"
                    onClick={() => setIgnoredFlagKeys((s) => new Set(s).add(key))}
                  >
                    ACKNOWLEDGE
                  </button>
                  <button
                    type="button"
                    className="site00-nme-review__btn"
                    disabled={judging}
                    onClick={() => void onJudgment('REFINE_NARRATIVE')}
                  >
                    REFINE
                  </button>
                  <button
                    type="button"
                    className="site00-nme-review__btn"
                    onClick={() => setIgnoredFlagKeys((s) => new Set(s).add(key))}
                  >
                    IGNORE FOR THIS ENTRY
                  </button>
                </div>
              </div>
            );
          })}
        </article>
      : null}

      <footer>
        <p className="site00-nme-review__meta">Status: {plan.founderStatus}</p>
        <div className="site00-nme-review__judgment" data-testid="narrative-momentum-judgment">
          <button type="button" className="site00-nme-review__btn" disabled={judging} onClick={() => void onJudgment('LOVE_IT')}>
            LOVE IT
          </button>
          <button type="button" className="site00-nme-review__btn" disabled={judging} onClick={() => void onJudgment('PROMISING')}>
            PROMISING
          </button>
          <button type="button" className="site00-nme-review__btn" disabled={judging} onClick={() => void onJudgment('TOO_CLOSE')}>
            TOO CLOSE
          </button>
          <button type="button" className="site00-nme-review__btn" disabled={judging} onClick={() => void onJudgment('NOT_NDXBOOK')}>
            NOT NDXBOOK
          </button>
        </div>
        <div className="site00-nme-review__workflow">
          <button
            type="button"
            className="site00-nme-review__btn site00-nme-review__btn--primary"
            disabled={judging}
            onClick={() => void onJudgment('APPROVE_NARRATIVE')}
          >
            APPROVE NARRATIVE
          </button>
          <button type="button" className="site00-nme-review__btn" disabled={judging} onClick={() => void onJudgment('REFINE_NARRATIVE')}>
            REFINE NARRATIVE
          </button>
          <button type="button" className="site00-nme-review__btn" disabled={judging} onClick={() => void onRecompile()}>
            RE-COMPILE
          </button>
        </div>
      </footer>
    </section>
  );
}
