/**
 * Expression Engine — Entry 002 final cinematic storyboard founder review (B4.9R2).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api.js';

type B49R2Response = {
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
    provider: string | null;
    telemetry: {
      storyboardCompileCount: number;
      storyboardDispatchCount: number;
      storyboardRenderCount: number;
      panelManifestCount: number;
      panelDispatchCount: number;
      panelRenderCount: number;
    };
  } | null;
  storyboard001Historical: { status: string; failureReason: string | null };
  storyboard002Historical: { status: string; failureReason: string | null };
  renderModeQA: { result: string };
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
  const [data, setData] = useState<B49R2Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [judging, setJudging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine?phase=B49R2');
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B49R2Response);
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
      setData((await res.json()) as B49R2Response);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to record judgment');
    } finally {
      setJudging(false);
    }
  };

  if (loading) {
    return <p className="site00-expr-engine-panel__meta">Loading final cinematic storyboard…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data?.finalCinematicStoryboard) return null;

  const sb = data.finalCinematicStoryboard;
  const telemetry = sb.telemetry;
  const reviewActive = data.finalStoryboardReviewGate.active;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-fcs">
      <h2>FINAL CINEMATIC STORYBOARD · ENTRY 002</h2>
      <p className="site00-expr-engine-panel__meta">
        {sb.storyboardId} · v{sb.version} · ONE STORYBOARD · {sb.panelCount} planned panels
      </p>

      <div className="site00-expr-engine-fcs__stages">
        <span>MANIFEST {telemetry.panelManifestCount}</span>
        <span>DISPATCHED {telemetry.storyboardDispatchCount}</span>
        <span>RENDERED {telemetry.storyboardRenderCount}</span>
        <span>PANEL RENDERS {telemetry.panelRenderCount} (must be 0)</span>
        <span>STRUCTURAL {sb.structuralQaStatus}</span>
        <span>CONTINUITY {sb.continuityQaStatus}</span>
        <span>RENDER MODE {sb.renderModeQaStatus}</span>
        <span>REVIEW {reviewActive ? 'ACTIVE' : 'INACTIVE'}</span>
      </div>

      <p className="site00-expr-engine-panel__copy">
        <strong>{reviewActive ? 'AWAITING FOUNDER REVIEW' : sb.status}</strong> · {sb.generationMode}
      </p>
      <p className="site00-expr-engine-panel__meta">
        001: {data.storyboard001Historical.status} · 002: {data.storyboard002Historical.status}
      </p>
      <p className="site00-expr-engine-panel__copy">
        <strong>PRIMARY ACTION:</strong> {data.nextAction}
      </p>

      {sb.storyboardStripUrl ? (
        <figure className="site00-expr-engine-cvs__contact">
          <img src={sb.storyboardStripUrl} alt="Entry 002 final cinematic storyboard" loading="lazy" />
          <figcaption>
            Single multi-panel storyboard sheet · provider: {sb.provider ?? 'deterministic'}
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
