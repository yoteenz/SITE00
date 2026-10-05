/**
 * Expression Engine — Entry 002 final reel storyboard founder review (B4.9R4).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api.js';

type B49R4Response = {
  finalCinematicStoryboard: {
    storyboardId: string;
    version: string;
    status: string;
    readinessState: string;
    generationMode: string;
    founderJudgment: string;
    panelCount: number;
    storyboardStripUrl: string | null;
    structuralQaStatus: string;
    continuityQaStatus: string;
    renderModeQaStatus: string;
    reelCoherenceQaStatus: string;
    boardTypeQaStatus: string;
    visualAuthorityFidelityQaStatus: string;
    provider: string | null;
    telemetry: {
      reelConceptionCompileCount?: number;
      narrativeBeatCount?: number;
      selectedStoryboardMomentCount?: number;
      storyboardDispatchCount: number;
      storyboardRenderCount: number;
      panelRenderCount: number;
      requiredAuthorityImageCount?: number;
      resolvedAuthorityImageCount?: number;
      providerAuthorityImageInputCount?: number;
      authorityImageIdsSentToProvider?: string[];
    };
  } | null;
  storyboard001Historical: { status: string; failureReason: string | null };
  storyboard002Historical: { status: string; failureReason: string | null };
  storyboard003Historical?: { status: string; failureReason: string | null };
  storyboard004Historical?: { status: string; failureReason: string | null };
  visualAuthorityManifest?: {
    requiredAuthorityImageCount: number;
    resolvedAuthorityImageCount: number;
    validated: boolean;
  };
  reelVisualConception?: { selectedMomentCount: number; narrativeBeatCount: number };
  visualAuthorityFidelityQA?: { result: string; executed: boolean };
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
  const [data, setData] = useState<B49R4Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [judging, setJudging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine?phase=B49R4');
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B49R4Response);
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
      setData((await res.json()) as B49R4Response);
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
  const manifest = data.visualAuthorityManifest;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-fcs">
      <h2>FINAL REEL STORYBOARD · ENTRY 002</h2>
      <p className="site00-expr-engine-panel__meta">
        {sb.storyboardId} · v{sb.version} · ONE REEL · {momentCount} selected stills ·{' '}
        {data.reelVisualConception?.narrativeBeatCount ?? 16} narrative beats · {sb.readinessState}
      </p>

      <div className="site00-expr-engine-fcs__stages">
        <span>REEL CONCEPTION {telemetry.reelConceptionCompileCount ?? 1}</span>
        <span>MOMENTS {momentCount}</span>
        <span>AUTHORITY IMAGES {telemetry.providerAuthorityImageInputCount ?? 0}/5</span>
        <span>DISPATCHED {telemetry.storyboardDispatchCount}</span>
        <span>RENDERED {telemetry.storyboardRenderCount}</span>
        <span>PANEL RENDERS {telemetry.panelRenderCount} (must be 0)</span>
        <span>STRUCTURAL {sb.structuralQaStatus}</span>
        <span>REEL COHERENCE {sb.reelCoherenceQaStatus}</span>
        <span>VISUAL AUTHORITY {sb.visualAuthorityFidelityQaStatus}</span>
      </div>

      {manifest ? (
        <p className="site00-expr-engine-panel__meta">
          Authority assets resolved {manifest.resolvedAuthorityImageCount}/{manifest.requiredAuthorityImageCount}
          {manifest.validated ? ' · manifest validated' : ' · manifest incomplete'}
        </p>
      ) : null}

      {sb.storyboardStripUrl ? (
        <img
          src={sb.storyboardStripUrl}
          alt="Final cinematic storyboard strip"
          className="site00-expr-engine-fcs__strip"
        />
      ) : null}

      {reviewActive ? (
        <div className="site00-expr-engine-fcs__judgment">
          <button type="button" disabled={judging} onClick={() => void submitJudgment('LOVE_IT')}>
            LOVE IT
          </button>
          <button type="button" disabled={judging} onClick={() => void submitJudgment('PROMISING_REFINE')}>
            PROMISING · REFINE
          </button>
          <button type="button" disabled={judging} onClick={() => void submitJudgment('NOT_FOR_ME')}>
            NOT FOR ME
          </button>
        </div>
      ) : (
        <p className="site00-expr-engine-panel__meta">
          Founder review inactive — {data.nextAction}. {data.telemetryNote}
        </p>
      )}

      <p className="site00-expr-engine-panel__meta">
        Keyframes: {data.keyframes} · Video: {data.video}
      </p>
    </section>
  );
}
