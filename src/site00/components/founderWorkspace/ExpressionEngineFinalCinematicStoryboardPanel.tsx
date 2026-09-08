/**
 * Expression Engine — Entry 002 final cinematic storyboard founder review (B4.9R).
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api.js';

type PanelManifestEntry = {
  panelNumber: number;
  beatId: string;
  panelId: string;
  assetId: string;
  generationStatus: string;
  qaStatus: string;
  previewUrl: string | null;
  panelVersion: string;
};

type B49RResponse = {
  finalCinematicStoryboard: {
    storyboardId: string;
    version: string;
    status: string;
    founderJudgment: string;
    canon: boolean;
    visualAuthority: boolean;
    panelCount: number;
    storyboardStripUrl: string | null;
    structuralQaStatus: string;
    continuityQaStatus: string;
    duplicationQaStatus: string;
    authorityIds: string[];
    sourceTreatmentId: string;
    compiled: boolean;
    dispatched: boolean;
    rendered: boolean;
    assembled: boolean;
    provider: string | null;
    telemetry: {
      panelCompileCount: number;
      panelDispatchCount: number;
      panelRenderCount: number;
      panelFailureCount: number;
      panelRepairCount: number;
      assembled: boolean;
    };
    panelManifest: PanelManifestEntry[];
  } | null;
  storyboard001Historical: {
    storyboardId: string;
    status: string;
    referenceOnly: boolean;
    failureReason: string | null;
  };
  structuralQA: { result: string; renderedDistinctPanelCount: number; expectedPanelCount: number };
  continuityDomainQA: { result: string; domains: Record<string, string> };
  duplicationQA: { result: string };
  pipelineState: {
    nextAction: string;
    currentStage: string;
    activeProductionStep: string;
    finalStoryboard: { status: string; founderJudgment: string; rendered: boolean; valid: boolean };
  };
  productionEligibility: {
    finalStoryboardEligibility: string;
    keyframeEligibility: string;
    founderStoryboardApproval: string;
    approvedAuthorityCount: number;
    requiredAuthorityCount: number;
  };
  panelPipeline: {
    assembled: boolean;
    compositeUrl: string | null;
    telemetry: {
      panelCompileCount: number;
      panelDispatchCount: number;
      panelRenderCount: number;
    };
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
  const [data, setData] = useState<B49RResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [judging, setJudging] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine?phase=B49R');
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B49RResponse);
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
      setData((await res.json()) as B49RResponse);
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
        {sb.storyboardId} · v{sb.version} · {telemetry.panelRenderCount}/{sb.panelCount} panels generated
      </p>

      <div className="site00-expr-engine-fcs__stages">
        <span>COMPILED {sb.compiled ? '✓' : '—'}</span>
        <span>PANELS {telemetry.panelRenderCount}/{sb.panelCount}</span>
        <span>ASSEMBLED {sb.assembled ? '✓' : '—'}</span>
        <span>STRUCTURAL QA {sb.structuralQaStatus}</span>
        <span>CONTINUITY QA {sb.continuityQaStatus}</span>
        <span>FOUNDER REVIEW {reviewActive ? 'ACTIVE' : 'INACTIVE'}</span>
      </div>

      <p className="site00-expr-engine-panel__copy">
        <strong>{reviewActive ? 'AWAITING FOUNDER REVIEW' : sb.status}</strong>
      </p>
      <p className="site00-expr-engine-panel__meta">
        Historical 001: {data.storyboard001Historical.status} · referenceOnly ·{' '}
        {data.storyboard001Historical.failureReason}
      </p>
      <p className="site00-expr-engine-panel__meta">
        Gate {data.finalStoryboardReviewGate.gateId} · {reviewActive ? 'ACTIVE' : 'INACTIVE'} ·{' '}
        {data.productionEligibility.approvedAuthorityCount}/{data.productionEligibility.requiredAuthorityCount}{' '}
        authorities
      </p>
      <p className="site00-expr-engine-panel__copy">
        <strong>PRIMARY ACTION:</strong> {data.nextAction}
      </p>

      {sb.storyboardStripUrl ? (
        <figure className="site00-expr-engine-cvs__contact">
          <img src={sb.storyboardStripUrl} alt="Entry 002 final cinematic storyboard strip" loading="lazy" />
          <figcaption>
            Storyboard sheet · {sb.rendered ? 'RENDERED' : 'PENDING'} · assembled: {String(sb.assembled)} ·
            provider: {sb.provider ?? 'deterministic-test-panel'}
          </figcaption>
        </figure>
      ) : null}

      <div className="site00-expr-engine-fcs__panel-grid">
        {sb.panelManifest.map((panel) => (
          <button
            key={panel.panelId}
            type="button"
            className={`site00-expr-engine-fcs__panel-thumb${selectedPanel === panel.panelNumber ? ' is-selected' : ''}`}
            onClick={() => setSelectedPanel(panel.panelNumber)}
          >
            {panel.previewUrl ? (
              <img src={panel.previewUrl} alt={`Panel ${panel.panelNumber}`} loading="lazy" />
            ) : (
              <span>P{String(panel.panelNumber).padStart(2, '0')}</span>
            )}
            <span className="site00-expr-engine-fcs__panel-label">
              {panel.panelNumber}. {panel.beatId} · {panel.generationStatus}
            </span>
          </button>
        ))}
      </div>

      {selectedPanel !== null ? (
        <p className="site00-expr-engine-panel__meta">
          Panel {selectedPanel}:{' '}
          {sb.panelManifest.find((p) => p.panelNumber === selectedPanel)?.beatId} · QA{' '}
          {sb.panelManifest.find((p) => p.panelNumber === selectedPanel)?.qaStatus}
        </p>
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
