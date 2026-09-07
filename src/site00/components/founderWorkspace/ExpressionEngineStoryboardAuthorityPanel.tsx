/**
 * Expression Engine — Entry 002 structural storyboard authority panel (B4.6).
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
    approvalState: {
      gateId: string;
      allBoardsLoveIt: boolean;
      blocksKeyframeGeneration: boolean;
    };
  };
  founderReviewSlots: Array<{
    boardKey: string;
    boardNumber: number;
    boardTitle: string;
    founderJudgment: string;
  }>;
  structuralStoryboardGate: {
    gateId: string;
    blocksKeyframeGeneration: boolean;
  };
  keyframeCompilationBlocked: { blocked: boolean; reason?: string };
  qa: { result: string };
  nextAction: string;
};

const JUDGMENT_LABELS = ['LOVE_IT', 'PROMISING_REFINE', 'NOT_FOR_ME'] as const;

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
    return <p className="site00-expr-engine-panel__meta">Loading structural storyboard authority…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data) return null;

  const { treatment, storyboardAuthority, structuralStoryboardGate } = data;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-sba">
      <h2>STORYBOARD AUTHORITY · ENTRY 002 REEL</h2>
      <p className="site00-expr-engine-panel__meta">
        {storyboardAuthority.authorityId} · Gate {structuralStoryboardGate.gateId} ·{' '}
        {storyboardAuthority.beatCount} beats · {storyboardAuthority.boardCount} structural boards
      </p>

      <BlueprintBlock title="REEL TREATMENT AUTHORITY">
        <p className="site00-expr-engine-panel__copy">{treatment.logline}</p>
        <p className="site00-expr-engine-panel__meta">{treatment.dramaticEngine}</p>
        <p className="site00-expr-engine-panel__copy">
          <strong>NDX:</strong> {treatment.characterRoles.ndx}
        </p>
        <p className="site00-expr-engine-panel__copy">
          <strong>Subject woman:</strong> {treatment.characterRoles.subjectWoman}
        </p>
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
                Board {String(board.boardNumber).padStart(2, '0')} — pending dispatch
              </div>
            )}
            <figcaption>
              <strong>Board {String(board.boardNumber).padStart(2, '0')}</strong> · {board.boardTitle}
              <span className="site00-expr-engine-panel__meta"> · {board.argumentGrammarRole}</span>
              {board.keyframeExtractionRole ? (
                <span className="site00-expr-engine-panel__meta"> · KF {board.keyframeExtractionRole}</span>
              ) : null}
              <p className="site00-expr-engine-panel__copy">{board.storyFunction}</p>
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
        QA: {data.qa.result} · Keyframes:{' '}
        {data.keyframeCompilationBlocked.blocked ? 'BLOCKED' : 'OPEN'} ·{' '}
        {structuralStoryboardGate.blocksKeyframeGeneration ? 'Awaiting all 5 LOVE_IT' : 'Gate satisfied'} ·{' '}
        {data.nextAction}
      </p>
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
