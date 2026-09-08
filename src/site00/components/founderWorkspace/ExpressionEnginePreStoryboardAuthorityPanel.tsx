/**
 * Expression Engine — Entry 002 pre-storyboard visual authority panel (B4.7).
 */

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../utils/api.js';

type PreStoryboardAuthority = {
  boardNumber: number;
  boardId: string;
  boardTitle: string;
  role: string;
  purpose: string;
  continuityRules: string[];
  founderJudgment: string;
  previewUrl: string | null;
  record?: { status: string; visualAuthority: boolean; version: string };
};

type B47Response = {
  pipelineState: {
    activeGate: { gateId: string; label: string; satisfied: boolean };
    nextAction: string;
    currentStage: string;
    preStoryboardVisualAuthorities: string;
    finalStoryboard: { status: string; promotionBlocked: boolean; autoApproved: false };
  };
  gateSatisfaction: {
    satisfied: boolean;
    loveItCount: number;
    unreviewedCount: number;
    promisingCount: number;
    notForMeCount: number;
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
    approvalState: { gateId: string; blocksCinematicStoryboard: boolean; allAuthoritiesLoveIt: boolean };
  };
  founderReviewSlots: Array<{
    authorityKey: string;
    authorityId: string;
    boardNumber: number;
    boardTitle: string;
    founderJudgment: string;
    allowedJudgments: string[];
  }>;
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

const JUDGMENT_OPTIONS = ['LOVE_IT', 'PROMISING_REFINE', 'NOT_FOR_ME'] as const;

export function ExpressionEnginePreStoryboardAuthorityPanel() {
  const [data, setData] = useState<B47Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine?phase=B47');
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B47Response);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pre-storyboard authorities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setJudgment = async (slot: B47Response['founderReviewSlots'][number], judgment: string) => {
    setSavingKey(slot.authorityKey);
    try {
      const res = await apiFetch('/api/site00/expression-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_PRE_STORYBOARD_AUTHORITY_JUDGMENT',
          authorityKey: slot.authorityKey,
          authorityId: slot.authorityId,
          founderJudgment: judgment,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as B47Response);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save judgment');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return <p className="site00-expr-engine-panel__meta">Loading pre-storyboard visual authorities…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data) return null;

  const { roleCorrection, preStoryboardAuthorityPack, pipelineState, gateSatisfaction } = data;
  const gateSatisfied = gateSatisfaction.satisfied;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-psa">
      <h2>PRE-STORYBOARD VISUAL AUTHORITY · ENTRY 002</h2>
      <p className="site00-expr-engine-panel__meta site00-expr-engine-panel__copy">
        <strong>CURRENT GATE:</strong> PRE-STORYBOARD VISUAL AUTHORITY REVIEW ·{' '}
        {pipelineState.activeGate.gateId}
      </p>
      <p className="site00-expr-engine-panel__copy">
        <strong>NEXT ACTION:</strong> {pipelineState.nextAction}
      </p>

      {gateSatisfied ? (
        <p className="site00-expr-engine-panel__copy">
          <strong>PRE-STORYBOARD AUTHORITY GATE SATISFIED</strong> · FINAL CINEMATIC STORYBOARD READY
        </p>
      ) : (
        <p className="site00-expr-engine-panel__copy">
          <strong>FINAL CINEMATIC STORYBOARD</strong> BLOCKED — PRE-STORYBOARD AUTHORITIES NOT YET APPROVED
          ({gateSatisfaction.loveItCount}/5 LOVE_IT)
        </p>
      )}

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
        {preStoryboardAuthorityPack.authorities.map((board) => {
          const slot = data.founderReviewSlots.find((s) => s.boardNumber === board.boardNumber);
          return (
            <figure key={board.boardId} className="site00-expr-engine-psa__board">
              {board.previewUrl ? (
                <img
                  src={board.previewUrl}
                  alt={`Authority ${String(board.boardNumber).padStart(2, '0')} — ${board.boardTitle}`}
                  loading="lazy"
                />
              ) : (
                <div className="site00-expr-engine-psa__placeholder">
                  Authority {String(board.boardNumber).padStart(2, '0')} — visual pending
                </div>
              )}
              <figcaption>
                <strong>{String(board.boardNumber).padStart(2, '0')}</strong> · {board.boardTitle}
                <p className="site00-expr-engine-panel__copy">{board.purpose}</p>
                <ul className="site00-expr-engine-list">
                  {board.continuityRules.slice(0, 3).map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
                <p className="site00-expr-engine-panel__meta">
                  Judgment: <strong>{board.founderJudgment}</strong>
                  {board.record ? ` · v${board.record.version} · ${board.record.status}` : ''}
                </p>
                {slot && (
                  <div className="site00-expr-engine-psa__judgments">
                    {JUDGMENT_OPTIONS.map((j) => (
                      <button
                        key={j}
                        type="button"
                        className={
                          board.founderJudgment === j
                            ? 'site00-btn site00-btn--primary'
                            : 'site00-btn'
                        }
                        disabled={savingKey === slot.authorityKey}
                        onClick={() => void setJudgment(slot, j)}
                      >
                        {j.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <p className="site00-expr-engine-panel__meta">
        Final storyboard: {data.finalStoryboard.status} · Keyframes: {data.keyframes} · Video:{' '}
        {data.video}
      </p>
      <p className="site00-expr-engine-panel__meta">
        Cinematic sequence: {data.cinematicSequence.status} · reference only · not visual authority
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
