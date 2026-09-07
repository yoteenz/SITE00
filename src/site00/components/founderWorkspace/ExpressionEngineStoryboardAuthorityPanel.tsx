/**
 * Expression Engine — Entry 002 structural storyboard planning panel (B4.6).
 * Planning / narrative structure only — NOT the active visual gate.
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { expressionEngineApi } from '../../services/expressionEngineApi';

type StructuralBoard = {
  boardNumber: number;
  boardId: string;
  boardTitle: string;
  storyFunction: string;
  argumentGrammarRole: string;
  visualDescription: string;
  founderJudgment: string;
  previewUrl: string | null;
  keyframeExtractionRole: string | null;
};

type B46Response = {
  pipelineState: {
    nextAction: string;
    activeGate: { gateId: string };
    structuralStoryboard: {
      role: string;
      status: string;
      activeGate: boolean;
    };
  };
  treatment: {
    treatmentId: string;
    logline: string;
    dramaticEngine: string;
    coreStory: string;
    characterRoles: { ndx: string; subjectWoman: string };
  };
  storyboardAuthority: {
    authorityId: string;
    beatCount: number;
    boardCount: number;
    boards: StructuralBoard[];
    role?: string;
    status?: string;
    activeGate?: boolean;
  };
  qa: { result: string };
};

export function ExpressionEngineStoryboardAuthorityPanel() {
  const [data, setData] = useState<B46Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    expressionEngineApi
      .phaseB46({ dispatchFal: false })
      .then((res) => {
        if (!cancelled) setData(res as B46Response);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load storyboard authority');
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
    return <p className="site00-expr-engine-panel__meta">Loading structural storyboard planning…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data) return null;

  const { treatment, storyboardAuthority, pipelineState } = data;
  const planning = pipelineState.structuralStoryboard;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-sba">
      <h2>STORYBOARD PLANNING · ENTRY 002 REEL</h2>
      <p className="site00-expr-engine-panel__meta">
        {storyboardAuthority.authorityId} · {planning.role} · {planning.status}
      </p>
      <p className="site00-expr-engine-panel__copy">
        These five structural boards are <strong>planning / narrative structure</strong> — not the active
        visual gate. Active gate: {pipelineState.activeGate.gateId}. Go to{' '}
        <strong>Pre-Storyboard Authority</strong> tab for founder review.
      </p>
      <p className="site00-expr-engine-panel__meta">
        <strong>NEXT ACTION (active):</strong> {pipelineState.nextAction}
      </p>

      <BlueprintBlock title="REEL TREATMENT AUTHORITY">
        <p className="site00-expr-engine-panel__copy">{treatment.logline}</p>
        <p className="site00-expr-engine-panel__meta">{treatment.dramaticEngine}</p>
      </BlueprintBlock>

      <div className="site00-expr-engine-sba__grid">
        {storyboardAuthority.boards.map((board) => (
          <figure key={board.boardId} className="site00-expr-engine-sba__board">
            {board.previewUrl ? (
              <img
                src={board.previewUrl}
                alt={`Board ${String(board.boardNumber).padStart(2, '0')} — ${board.boardTitle}`}
                loading="lazy"
              />
            ) : (
              <div className="site00-expr-engine-sba__placeholder">
                Board {String(board.boardNumber).padStart(2, '0')} — planning reference
              </div>
            )}
            <figcaption>
              <strong>Board {String(board.boardNumber).padStart(2, '0')}</strong> · {board.boardTitle}
              <span className="site00-expr-engine-panel__meta"> · {board.argumentGrammarRole}</span>
              <p className="site00-expr-engine-panel__copy">{board.storyFunction}</p>
              <p className="site00-expr-engine-panel__meta">Planning reference — not active founder gate</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="site00-expr-engine-panel__meta">QA: {data.qa.result} · Inactive until pre-storyboard authorities approved</p>
    </section>
  );
}

function BlueprintBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="site00-expr-engine-block">
      <h3 className="site00-expr-engine-panel__title">{title}</h3>
      {children}
    </div>
  );
}
