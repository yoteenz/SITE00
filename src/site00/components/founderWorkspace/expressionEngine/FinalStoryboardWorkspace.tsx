/**
 * B5.0R2 — Final storyboard workspace (artifact-first, both source modes).
 */

import { useState } from 'react';
import type { B49R4PipelineResponse } from './types';
import { StoryboardCreatePanel } from './StoryboardCreatePanel';

type Props = {
  data: B49R4PipelineResponse;
  onJudgment: (judgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME') => Promise<void>;
  judging: boolean;
  onGenerate?: () => Promise<void>;
  onImport?: (variant: 'A' | 'B') => Promise<void>;
  generating?: boolean;
  importing?: boolean;
};

export function FinalStoryboardWorkspace({
  data,
  onJudgment,
  judging,
  onGenerate,
  onImport,
  generating,
  importing,
}: Props) {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const sb = data.finalCinematicStoryboard;

  const reviewActive = data.finalStoryboardReviewGate.active;
  const manifest = data.visualAuthorityManifest;
  const boundCount = manifest?.resolvedAuthorityImageCount ?? 0;
  const requiredCount = manifest?.requiredAuthorityImageCount ?? 5;
  const requiresFounderDecision = sb?.status === 'STORYBOARD_REQUIRES_FOUNDER_DECISION';
  const showCreatePaths =
    !reviewActive &&
    (!sb?.storyboardStripUrl || sb.status === 'PIPELINE_TEST_ONLY' || requiresFounderDecision);

  if (!sb && showCreatePaths && onGenerate && onImport) {
    return (
      <StoryboardCreatePanel
        onGenerate={() => void onGenerate()}
        onImport={(v) => void onImport(v)}
        generating={generating ?? false}
        importing={importing ?? false}
        requiresFounderDecision={requiresFounderDecision}
      />
    );
  }

  if (!sb) return null;

  const sourceLabel =
    sb.storyboardSource === 'FOUNDER_SUPPLIED' || sb.sourceArtifactOrigin === 'FOUNDER_SUPPLIED'
      ? 'FOUNDER SUPPLIED'
      : 'GENERATED';

  return (
    <section className="site00-ee-workspace site00-ee-storyboard">
      <header className="site00-ee-storyboard__header">
        <div>
          <h2 className="site00-ee-storyboard__title">FINAL STORYBOARD</h2>
          <p className="site00-ee-storyboard__source">
            SOURCE {sourceLabel} · VERSION {sb.version.replace(/^v?0*/i, '').padStart(3, '0')}
          </p>
        </div>
      </header>

      {showCreatePaths && onGenerate && onImport ? (
        <StoryboardCreatePanel
          onGenerate={() => void onGenerate()}
          onImport={(v) => void onImport(v)}
          generating={generating ?? false}
          importing={importing ?? false}
          requiresFounderDecision={requiresFounderDecision}
        />
      ) : (
        <>
          <figure className="site00-ee-storyboard__artifact">
            {sb.storyboardStripUrl ? (
              <img src={sb.storyboardStripUrl} alt="Final cinematic storyboard strip" />
            ) : (
              <div className="site00-ee-storyboard__placeholder">Storyboard artifact pending</div>
            )}
          </figure>

          <div className="site00-ee-storyboard__status-grid">
            <StatusChip label="VISUAL AUTHORITIES" value={`${boundCount} / ${requiredCount} LINKED`} pass={boundCount >= requiredCount} />
            <StatusChip label="REEL COHERENCE" value={sb.reelCoherenceQaStatus} pass={sb.reelCoherenceQaStatus === 'PASS'} />
            <StatusChip label="STORY STRUCTURE" value={sb.structuralQaStatus} pass={sb.structuralQaStatus === 'PASS'} />
            <StatusChip label="FOUNDER REVIEW" value={sb.founderJudgment === 'UNREVIEWED' ? 'UNREVIEWED' : sb.founderJudgment} pass={sb.founderJudgment === 'LOVE_IT'} />
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
          ) : null}
        </>
      )}

      <details className="site00-ee-storyboard__inspector" open={inspectorOpen} onToggle={(e) => setInspectorOpen((e.target as HTMLDetailsElement).open)}>
        <summary>QA &amp; telemetry inspector</summary>
        <dl className="site00-ee-storyboard__dl">
          <div><dt>Storyboard ID</dt><dd>{sb.storyboardId}</dd></div>
          <div><dt>Readiness</dt><dd>{sb.readinessState}</dd></div>
          <div><dt>Source</dt><dd>{sourceLabel}</dd></div>
          <div><dt>Provider dispatches</dt><dd>{data.storyboardCostGuard?.storyboardProviderDispatchCount ?? Number(sb.telemetry?.storyboardDispatchCount ?? 0)}</dd></div>
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
