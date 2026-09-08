/**
 * Expression Engine — Entry 002 final cinematic storyboard founder review (B4.9).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api.js';

type B49Response = {
  finalCinematicStoryboard: {
    storyboardId: string;
    version: string;
    status: string;
    founderJudgment: string;
    canon: boolean;
    visualAuthority: boolean;
    panelCount: number;
    storyboardStripUrl: string | null;
    continuityQaStatus: string;
    authorityIds: string[];
    sourceTreatmentId: string;
    compiled: boolean;
    dispatched: boolean;
    rendered: boolean;
    provider: string | null;
  } | null;
  pipelineState: {
    nextAction: string;
    currentStage: string;
    finalStoryboard: { status: string; founderJudgment: string; rendered: boolean };
  };
  productionEligibility: {
    finalStoryboardEligibility: string;
    keyframeEligibility: string;
    founderStoryboardApproval: string;
    approvedAuthorityCount: number;
    requiredAuthorityCount: number;
  };
  continuityQA: { result: string; warnings: string[] };
  renderResult: {
    status: string;
    compiled: boolean;
    dispatched: boolean;
    rendered: boolean;
    provider: string | null;
    previewUrl: string;
  } | null;
  finalStoryboardReviewGate: {
    gateId: string;
    founderJudgment: string;
    active: boolean;
  };
  keyframes: string;
  video: string;
  nextAction: string;
  telemetryNote: string;
};

export function ExpressionEngineFinalCinematicStoryboardPanel() {
  const [data, setData] = useState<B49Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [judging, setJudging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine?phase=B49');
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B49Response);
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
      setData((await res.json()) as B49Response);
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

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-fcs">
      <h2>FINAL CINEMATIC STORYBOARD · ENTRY 002</h2>
      <p className="site00-expr-engine-panel__meta">
        {sb.storyboardId} · v{sb.version} · {sb.panelCount} panels · QA {sb.continuityQaStatus}
      </p>
      <p className="site00-expr-engine-panel__copy">
        <strong>FINAL CINEMATIC STORYBOARD</strong> · AWAITING FOUNDER REVIEW
      </p>
      <p className="site00-expr-engine-panel__meta">
        Authority sources: {data.productionEligibility.approvedAuthorityCount}/
        {data.productionEligibility.requiredAuthorityCount} · Gate {data.finalStoryboardReviewGate.gateId} ·{' '}
        {data.finalStoryboardReviewGate.active ? 'ACTIVE' : 'INACTIVE'}
      </p>
      <p className="site00-expr-engine-panel__copy">
        <strong>PRIMARY ACTION:</strong> {data.nextAction}
      </p>

      {sb.storyboardStripUrl ? (
        <figure className="site00-expr-engine-cvs__contact">
          <img src={sb.storyboardStripUrl} alt="Entry 002 final cinematic storyboard strip" loading="lazy" />
          <figcaption>
            Final storyboard strip · {sb.rendered ? 'RENDERED' : 'PENDING'} · provider:{' '}
            {sb.provider ?? 'none'} · dispatched: {String(sb.dispatched)}
          </figcaption>
        </figure>
      ) : null}

      <p className="site00-expr-engine-panel__meta">
        Founder judgment: {sb.founderJudgment} · Canon: {String(sb.canon)} · Visual authority:{' '}
        {String(sb.visualAuthority)} · Keyframes: {data.keyframes} · Video: {data.video}
      </p>

      <div className="site00-expr-engine-sb__actions">
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={judging}
          onClick={() => void submitJudgment('LOVE_IT')}
        >
          LOVE IT
        </button>
        <button type="button" className="site00-btn" disabled={judging} onClick={() => void submitJudgment('PROMISING_REFINE')}>
          PROMISING / REVISE
        </button>
        <button type="button" className="site00-btn" disabled={judging} onClick={() => void submitJudgment('NOT_FOR_ME')}>
          NOT FOR ME
        </button>
      </div>

      <p className="site00-expr-engine-panel__meta">{data.telemetryNote}</p>
    </section>
  );
}
