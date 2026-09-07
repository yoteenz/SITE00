/**
 * Expression Engine — Entry 002 cinematic visual sequence review panel (B4.5).
 */

import { useEffect, useState } from 'react';
import { expressionEngineApi } from '../../services/expressionEngineApi';

type CinematicFrame = {
  frameNumber: number;
  frameId: string;
  argumentBeat: string;
  shotPurpose: string;
  previewUrl: string | null;
  keyframeExtractionCandidate: boolean;
};

type B45Response = {
  cinematicSequence: {
    sequenceId: string;
    frameCount: number;
    visualStyle: string;
    contactSheetUrl: string | null;
    frames: CinematicFrame[];
    founderJudgment: string;
    gateId: string;
  };
  blockingStoryboard: {
    type: string;
    status: string;
    visualAuthority: boolean;
  };
  cinematicSequenceGate: {
    gateId: string;
    founderJudgment: string;
    blocksKeyframeGeneration: boolean;
  };
  keyframeGenerationBlocked: boolean;
  qa: { result: string };
  nextAction: string;
};

export function ExpressionEngineCinematicSequencePanel() {
  const [data, setData] = useState<B45Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    expressionEngineApi
      .phaseB45({ dispatchFal: false })
      .then((res) => {
        if (!cancelled) setData(res as B45Response);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load cinematic sequence');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="site00-expr-engine-panel__meta">Loading cinematic visual sequence…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data) return null;

  const { cinematicSequence } = data;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-cvs">
      <h2>CINEMATIC VISUAL SEQUENCE · ENTRY 002 REEL</h2>
      <p className="site00-expr-engine-panel__meta">
        {cinematicSequence.sequenceId} · {cinematicSequence.visualStyle} · Gate{' '}
        {cinematicSequence.gateId} · {cinematicSequence.founderJudgment}
      </p>
      <p className="site00-expr-engine-panel__copy">
        PRE_AUTHORITY_EXPERIMENT reference only — not visual authority. Active gate is Pre-Storyboard
        Authority (GATE_0B_PRE_STORYBOARD_AUTHORITY).
      </p>
      {cinematicSequence.contactSheetUrl ? (
        <figure className="site00-expr-engine-cvs__contact">
          <img
            src={cinematicSequence.contactSheetUrl}
            alt="Entry 002 cinematic visual sequence contact sheet"
            loading="lazy"
          />
          <figcaption>Contact sheet</figcaption>
        </figure>
      ) : null}
      <div className="site00-expr-engine-cvs__grid">
        {cinematicSequence.frames.map((frame) => (
          <figure key={frame.frameId} className="site00-expr-engine-cvs__frame">
            {frame.previewUrl ? (
              <img
                src={frame.previewUrl}
                alt={`Frame ${String(frame.frameNumber).padStart(2, '0')} — ${frame.shotPurpose}`}
                loading="lazy"
              />
            ) : (
              <div className="site00-expr-engine-cvs__placeholder">
                Frame {String(frame.frameNumber).padStart(2, '0')} — pending dispatch
              </div>
            )}
            <figcaption>
              <strong>{String(frame.frameNumber).padStart(2, '0')}</strong> · {frame.argumentBeat}
              {frame.keyframeExtractionCandidate ? ' · KF candidate' : ''}
              <span className="site00-expr-engine-panel__meta"> — {frame.shotPurpose}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="site00-expr-engine-panel__meta">
        Reference only · Keyframes: BLOCKED · {data.nextAction}
      </p>
    </section>
  );
}
