/**
 * Expression Engine — Entry 002 blocking storyboard review panel (B4.4).
 * Renders the 10-panel director blocking strip + individual panels from ?phase=B44.
 */

import { useCallback, useEffect, useState } from 'react';
import { expressionEngineApi } from '../../services/expressionEngineApi';

type StoryboardPanel = {
  panelNumber: number;
  panelId: string;
  argumentBeat: string;
  shotPurpose: string;
  visualDescription: string;
  previewUrl: string | null;
  keyframeExtractionCandidate: boolean;
};

type B44Response = {
  storyboard: {
    storyboardId: string;
    panelCount: number;
    argumentArc: string[];
    panels: StoryboardPanel[];
    storyboardStripUrl: string | null;
    founderJudgment: string;
    canonState: string;
    gateId: string;
  };
  storyboardGate: {
    gateId: string;
    founderJudgment: string;
    blocksKeyframeGeneration: boolean;
    unlockActions: Record<string, string>;
  };
  qa: { result: string };
  keyframeGenerationBlocked: boolean;
  nextAction: string;
};

export function ExpressionEngineStoryboardReviewPanel() {
  const [data, setData] = useState<B44Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (options?: { dispatchFal?: boolean }) => {
    setError(null);
    const res = (await expressionEngineApi.phaseB44({
      dispatchFal: options?.dispatchFal,
      panelsOnly: true,
    })) as B44Response;
    setData(res);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load storyboard');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load({ dispatchFal: true })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to refresh storyboard');
      })
      .finally(() => setRefreshing(false));
  };

  if (loading) {
    return <p className="site00-expr-engine-panel__meta">Loading blocking storyboard…</p>;
  }

  if (error) {
    return (
      <>
        <p className="site00-expr-engine-panel__meta">{error}</p>
        <button type="button" className="site00-btn" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Retrying…' : 'Retry load'}
        </button>
      </>
    );
  }

  if (!data) return null;

  const { storyboard, storyboardGate } = data;
  const panelsWithImages = storyboard.panels.filter((p) => p.previewUrl).length;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-cvs site00-expr-engine-sb">
      <h2>BLOCKING STORYBOARD · ENTRY 002 REEL</h2>
      <p className="site00-expr-engine-panel__meta">
        {storyboard.storyboardId} · {storyboard.panelCount} panels · Gate {storyboard.gateId} ·{' '}
        {storyboard.founderJudgment} · {storyboard.canonState}
      </p>
      <p className="site00-expr-engine-panel__copy">
        B4.4 director blocking storyboard — sketch panels for shot order and narrative progression.
        Reference only after B4.5; visual authority lives in the Cinematic Sequence tab.
      </p>
      <p className="site00-expr-engine-panel__meta">
        Argument arc: {storyboard.argumentArc.join(' → ')} · Panels rendered: {panelsWithImages}/
        {storyboard.panelCount}
      </p>
      <div className="site00-expr-engine-sb__actions">
        <button type="button" className="site00-btn site00-btn--primary" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Generating…' : 'Generate / refresh panels'}
        </button>
      </div>
      {storyboard.storyboardStripUrl ? (
        <figure className="site00-expr-engine-cvs__contact">
          <img
            src={storyboard.storyboardStripUrl}
            alt="Entry 002 blocking storyboard strip"
            loading="lazy"
          />
          <figcaption>Storyboard strip</figcaption>
        </figure>
      ) : null}
      <div className="site00-expr-engine-cvs__grid">
        {storyboard.panels.map((panel) => (
          <figure key={panel.panelId} className="site00-expr-engine-cvs__frame">
            {panel.previewUrl ? (
              <a href={panel.previewUrl} target="_blank" rel="noreferrer">
                <img
                  src={panel.previewUrl}
                  alt={`Panel ${String(panel.panelNumber).padStart(2, '0')} — ${panel.shotPurpose}`}
                  loading="lazy"
                />
              </a>
            ) : (
              <div className="site00-expr-engine-cvs__placeholder">
                Panel {String(panel.panelNumber).padStart(2, '0')} — pending dispatch
              </div>
            )}
            <figcaption>
              <strong>{String(panel.panelNumber).padStart(2, '0')}</strong> · {panel.argumentBeat}
              {panel.keyframeExtractionCandidate ? ' · KF candidate' : ''}
              <span className="site00-expr-engine-panel__meta"> — {panel.shotPurpose}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <details className="site00-expr-engine-sb__details">
        <summary>Panel descriptions</summary>
        <ul className="site00-expr-engine-list">
          {storyboard.panels.map((panel) => (
            <li key={panel.panelId}>
              <strong>{String(panel.panelNumber).padStart(2, '0')}</strong> — {panel.visualDescription}
            </li>
          ))}
        </ul>
      </details>
      <p className="site00-expr-engine-panel__meta">
        QA: {data.qa.result} · Keyframes: {data.keyframeGenerationBlocked ? 'BLOCKED' : 'OPEN'} · Gate:{' '}
        {storyboardGate.founderJudgment} · {data.nextAction}
      </p>
    </section>
  );
}
