/**
 * Expression Engine — Entry 002 pre-storyboard visual authority panel (B4.6 follow-up).
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { expressionEngineApi } from '../../services/expressionEngineApi';

type PreStoryboardAuthority = {
  boardNumber: number;
  boardId: string;
  boardTitle: string;
  role: string;
  purpose: string;
  continuityRules: string[];
  founderJudgment: string;
  previewUrl: string | null;
};

type B46FollowUpResponse = {
  pipelineState: {
    activeGate: { gateId: string; label: string };
    nextAction: string;
    currentStage: string;
  };
  roleCorrection: {
    ndx: string;
    subjectWoman: string;
    collapsedIdentityFixed: boolean;
    deprecatedStatement: string;
  };
  preStoryboardAuthorityPack: {
    packId: string;
    authorities: PreStoryboardAuthority[];
    approvalState: { gateId: string; blocksCinematicStoryboard: boolean };
  };
  cinematicSequence: {
    sequenceId: string;
    status: string;
    visualAuthority: boolean;
  };
  finalStoryboard: { status: string };
  keyframes: string;
  video: string;
  nextAction: string;
};

const JUDGMENT_LABELS = ['LOVE_IT', 'PROMISING_REFINE', 'NOT_FOR_ME'] as const;

export function ExpressionEnginePreStoryboardAuthorityPanel() {
  const [data, setData] = useState<B46FollowUpResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    expressionEngineApi
      .phaseB46FollowUp({ dispatchFal: false })
      .then((res) => {
        if (!cancelled) setData(res as B46FollowUpResponse);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load pre-storyboard authorities');
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
    return <p className="site00-expr-engine-panel__meta">Loading pre-storyboard visual authorities…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data) return null;

  const { roleCorrection, preStoryboardAuthorityPack, pipelineState } = data;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-psa">
      <h2>PRE-STORYBOARD VISUAL AUTHORITY · ENTRY 002</h2>
      <p className="site00-expr-engine-panel__meta site00-expr-engine-panel__copy">
        <strong>ACTIVE GATE:</strong> {pipelineState.activeGate.gateId} · {pipelineState.currentStage}
      </p>
      <p className="site00-expr-engine-panel__copy">
        <strong>NEXT ACTION:</strong> {pipelineState.nextAction}
      </p>

      <Block title="ROLE CORRECTION">
        <p className="site00-expr-engine-panel__copy">
          <strong>NDX:</strong> {roleCorrection.ndx}
        </p>
        <p className="site00-expr-engine-panel__copy">
          <strong>Subject woman:</strong> {roleCorrection.subjectWoman}
        </p>
        <p className="site00-expr-engine-panel__meta">{roleCorrection.deprecatedStatement}</p>
      </Block>

      <div className="site00-expr-engine-psa__grid">
        {preStoryboardAuthorityPack.authorities.map((board) => (
          <figure key={board.boardId} className="site00-expr-engine-psa__board">
            {board.previewUrl ? (
              <img
                src={board.previewUrl}
                alt={`Authority ${String(board.boardNumber).padStart(2, '0')} — ${board.boardTitle}`}
                loading="lazy"
              />
            ) : (
              <div className="site00-expr-engine-psa__placeholder">
                Authority {String(board.boardNumber).padStart(2, '0')} — pending dispatch
              </div>
            )}
            <figcaption>
              <strong>{String(board.boardNumber).padStart(2, '0')}</strong> · {board.boardTitle}
              <p className="site00-expr-engine-panel__copy">{board.purpose}</p>
              <ul className="site00-expr-engine-list">
                {board.continuityRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <p className="site00-expr-engine-panel__meta">Judgment: {board.founderJudgment}</p>
              <ul className="site00-expr-engine-list">
                {JUDGMENT_LABELS.map((j) => (
                  <li key={j}>{j}</li>
                ))}
              </ul>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="site00-expr-engine-panel__meta">
        Final storyboard: {data.finalStoryboard.status} · Keyframes: {data.keyframes} · Video: {data.video}
      </p>
    </section>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="site00-expr-engine-block">
      <h3 className="site00-expr-engine-panel__title">{title}</h3>
      {children}
    </div>
  );
}
