/**
 * B5.0 — Final storyboard workspace (artifact-first).
 */

import { useState } from 'react';
import type { B49R4PipelineResponse } from './types';

type Props = {
  data: B49R4PipelineResponse;
  onJudgment: (judgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME') => Promise<void>;
  judging: boolean;
};

export function FinalStoryboardWorkspace({ data, onJudgment, judging }: Props) {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const sb = data.finalCinematicStoryboard;
  if (!sb) return null;

  const reviewActive = data.finalStoryboardReviewGate.active;
  const manifest = data.visualAuthorityManifest;
  const boundCount = manifest?.resolvedAuthorityImageCount ?? 0;
  const requiredCount = manifest?.requiredAuthorityImageCount ?? 5;

  return (
    <section className="site00-ee-workspace site00-ee-storyboard">
      <header className="site00-ee-storyboard__header">
        <h2 className="site00-ee-storyboard__title">FINAL STORYBOARD</h2>
        <span className="site00-ee-storyboard__version">VERSION {sb.version.replace(/^v?0*/i, '').padStart(3, '0')}</span>
      </header>

      <figure className="site00-ee-storyboard__artifact">
        {sb.storyboardStripUrl ? (
          <img src={sb.storyboardStripUrl} alt="Final cinematic storyboard strip" />
        ) : (
          <div className="site00-ee-storyboard__placeholder">Storyboard artifact pending generation</div>
        )}
      </figure>

      <div className="site00-ee-storyboard__status-grid">
        <StatusChip label="VISUAL AUTHORITIES" value={`${boundCount} / ${requiredCount} BOUND`} pass={boundCount >= requiredCount} />
        <StatusChip label="REEL COHERENCE" value={sb.reelCoherenceQaStatus} pass={sb.reelCoherenceQaStatus === 'PASS'} />
        <StatusChip label="STORY STRUCTURE" value={sb.structuralQaStatus} pass={sb.structuralQaStatus === 'PASS'} />
        <StatusChip label="FOUNDER REVIEW" value={sb.founderJudgment === 'UNREVIEWED' ? 'PENDING' : sb.founderJudgment} pass={sb.founderJudgment === 'LOVE_IT'} />
      </div>

      {reviewActive ? (
        <div className="site00-ee-storyboard__judgment">
          <button type="button" className="site00-btn site00-btn--primary" disabled={judging} onClick={() => void onJudgment('LOVE_IT')}>
            LOVE IT
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => void onJudgment('PROMISING_REFINE')}>
            REVISE
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => void onJudgment('NOT_FOR_ME')}>
            NOT FOR ME
          </button>
        </div>
      ) : (
        <p className="site00-ee-storyboard__inactive">{data.nextAction}. {data.telemetryNote}</p>
      )}

      <details className="site00-ee-storyboard__inspector" open={inspectorOpen} onToggle={(e) => setInspectorOpen((e.target as HTMLDetailsElement).open)}>
        <summary>QA &amp; telemetry inspector</summary>
        <dl className="site00-ee-storyboard__dl">
          <div><dt>Storyboard ID</dt><dd>{sb.storyboardId}</dd></div>
          <div><dt>Readiness</dt><dd>{sb.readinessState}</dd></div>
          <div><dt>Continuity QA</dt><dd>{sb.continuityQaStatus}</dd></div>
          <div><dt>Visual authority fidelity</dt><dd>{sb.visualAuthorityFidelityQaStatus}</dd></div>
          <div><dt>Provider</dt><dd>{sb.provider ?? 'none'}</dd></div>
          <div><dt>Keyframes</dt><dd>{data.keyframes}</dd></div>
          <div><dt>Video</dt><dd>{data.video}</dd></div>
        </dl>
      </details>
    </section>
  );
}

function StatusChip({ label, value, pass }: { label: string; value: string; pass: boolean }) {
  return (
    <div className={`site00-ee-storyboard__chip${pass ? ' site00-ee-storyboard__chip--pass' : ''}`}>
      <span className="site00-ee-storyboard__chip-label">{label}</span>
      <span className="site00-ee-storyboard__chip-value">{value}</span>
    </div>
  );
}
