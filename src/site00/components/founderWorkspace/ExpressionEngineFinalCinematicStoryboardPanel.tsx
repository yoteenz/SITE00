/**
 * Expression Engine — Entry 002 final reel storyboard founder review (B4.9R3).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api.js';

type B49R3Response = {
  finalCinematicStoryboard: {
    storyboardId: string;
    version: string;
    status: string;
    generationMode: string;
    founderJudgment: string;
    panelCount: number;
    storyboardStripUrl: string | null;
    structuralQaStatus: string;
    continuityQaStatus: string;
    renderModeQaStatus: string;
    reelCoherenceQaStatus: string;
    boardTypeQaStatus: string;
    provider: string | null;
    telemetry: {
      reelConceptionCompileCount?: number;
      narrativeBeatCount?: number;
      selectedStoryboardMomentCount?: number;
      storyboardDispatchCount: number;
      storyboardRenderCount: number;
      panelRenderCount: number;
    };
  } | null;
  storyboard001Historical: { status: string; failureReason: string | null };
  storyboard002Historical: { status: string; failureReason: string | null };
  storyboard003Historical?: { status: string; failureReason: string | null };
  reelVisualConception?: { selectedMomentCount: number; narrativeBeatCount: number };
  reelCoherenceQA?: { result: string };
  boardTypeQA?: { result: string };
  productionEligibility: {
    founderStoryboardApproval: string;
    keyframeEligibility: string;
  };
  finalStoryboardReviewGate: { active: boolean; gateId: string };
  keyframes: string;
  video: string;
  nextAction: string;
  telemetryNote: string;
};

export function ExpressionEngineFinalCinematicStoryboardPanel() {
  const [data, setData] = useState<B49R3Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [judging, setJudging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine?phase=B49R3');
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B49R3Response);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load final cinematic storyboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submitJudgment = async (founderJudgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME') => {
    setJudging(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_FINAL_CINEMATIC_STORYBOARD_JUDGMENT', founderJudgment }),
      });
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B49R3Response);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to record judgment');
    } finally {
      setJudging(false);
    }
  };

  if (loading) {
    return <p className="site00-expr-engine-panel__meta">Loading final reel storyboard…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data?.finalCinematicStoryboard) return null;

  const sb = data.finalCinematicStoryboard;
  const telemetry = sb.telemetry;
  const reviewActive = data.finalStoryboardReviewGate.active;
  const momentCount = telemetry.selectedStoryboardMomentCount ?? sb.panelCount;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-fcs">
      <h2>FINAL REEL STORYBOARD · ENTRY 002</h2>
      <p className="site00-expr-engine-panel__meta">
        {sb.storyboardId} · v{sb.version} · ONE REEL · {momentCount} selected stills ·{' '}
        {data.reelVisualConception?.narrativeBeatCount ?? 16} narrative beats
      </p>

      <div className="site00-expr-engine-fcs__stages">
        <span>REEL CONCEPTION {telemetry.reelConceptionCompileCount ?? 1}</span>
        <span>MOMENTS {momentCount}</span>
        <span>DISPATCHED {telemetry.storyboardDispatchCount}</span>
        <span>RENDERED {telemetry.storyboardRenderCount}</span>
        <span>PANEL RENDERS {telemetry.panelRenderCount} (must be 0)</span>
        <span>STRUCTURAL {sb.structuralQaStatus}</span>
        <span>REEL COHERENCE {sb.reelCoherenceQaStatus}</span>
        <span>BOARD TYPE {sb.boardTypeQaStatus}</span>
        <span>REVIEW {reviewActive ? 'ACTIVE' : 'INACTIVE'}</span>
      </div>

      <p className="site00-expr-engine-panel__copy">
        <strong>{reviewActive ? 'AWAITING FOUNDER REVIEW' : sb.status}</strong> · {sb.generationMode}
      </p>
      <p className="site00-expr-engine-panel__meta">
        001: {data.storyboard001Historical.status} · 002: {data.storyboard002Historical.status}
        {data.storyboard003Historical ? ` · 003: ${data.storyboard003Historical.status}` : ''}
      </p>
      <p className="site00-expr-engine-panel__copy">
        <strong>PRIMARY ACTION:</strong> {data.nextAction}
      </p>

      {sb.storyboardStripUrl ? (
        <figure className="site00-expr-engine-cvs__contact">
          <img src={sb.storyboardStripUrl} alt="Entry 002 final reel storyboard" loading="lazy" />
          <figcaption>
            Nine sequential stills from one imagined reel · provider: {sb.provider ?? 'deterministic'}
          </figcaption>
        </figure>
      ) : null}

      <p className="site00-expr-engine-panel__meta">
        Founder judgment: {sb.founderJudgment} · Keyframes: {data.keyframes} · Video: {data.video}
      </p>

      {reviewActive ? (
        <div className="site00-expr-engine-sb__actions">
          <button
            type="button"
            className="site00-btn site00-btn--primary"
            disabled={judging}
            onClick={() => void submitJudgment('LOVE_IT')}
          >
            LOVE IT
          </button>
          <button
            type="button"
            className="site00-btn"
            disabled={judging}
            onClick={() => void submitJudgment('PROMISING_REFINE')}
          >
            PROMISING / REVISE
          </button>
          <button
            type="button"
            className="site00-btn"
            disabled={judging}
            onClick={() => void submitJudgment('NOT_FOR_ME')}
          >
            NOT FOR ME
          </button>
        </div>
      ) : null}

      <p className="site00-expr-engine-panel__meta">{data.telemetryNote}</p>
    </section>
  );
}
