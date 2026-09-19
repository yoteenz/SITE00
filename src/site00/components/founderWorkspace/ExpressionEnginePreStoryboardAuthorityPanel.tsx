/**
 * Expression Engine — Entry 002 pre-storyboard visual authority panel (B4.8).
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
  record?: { status: string; visualAuthority: boolean; version: string; approvedAt?: string | null };
};

type PreStoryboardResponse = {
  pipelineState: {
    activeGate: { gateId: string; label: string; satisfied: boolean; gateStatus: string };
    nextAction: string;
    currentStage: string;
    activeProductionStep: string;
    preStoryboardVisualAuthorities: string;
    founderPreStoryboardAuthorityApproval: string;
    finalStoryboard: { status: string; promotionBlocked: boolean; approved: boolean };
  };
  productionEligibility: {
    preStoryboardAuthorityGate: string;
    requiredAuthorityCount: number;
    approvedAuthorityCount: number;
    finalStoryboardEligibility: string;
    keyframeEligibility: string;
    videoEligibility: string;
  };
  gateSatisfaction: {
    satisfied: boolean;
    loveItCount: number;
  };
  preStoryboardAuthorityPack: {
    authorities: PreStoryboardAuthority[];
    approvalState: { allAuthoritiesLoveIt: boolean };
  };
  preStoryboardGate: { gateStatus: string };
  finalStoryboardRecord: { status: string; approved: boolean; rendered: boolean } | null;
  cinematicSequence: { status: string; visualAuthority: boolean };
  keyframes: string;
  video: string;
  nextAction: string;
};

export function ExpressionEnginePreStoryboardAuthorityPanel() {
  const [data, setData] = useState<PreStoryboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/site00/expression-engine?phase=B48');
      if (!res.ok) throw new Error(await res.text());
      setData((await res.json()) as PreStoryboardResponse);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pre-storyboard authorities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="site00-expr-engine-panel__meta">Loading pre-storyboard visual authorities…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  if (!data) return null;

  const gateSatisfied = data.gateSatisfaction.satisfied;
  const { preStoryboardAuthorityPack, pipelineState, productionEligibility } = data;

  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block site00-expr-engine-psa">
      <h2>PRE-STORYBOARD VISUAL AUTHORITY · ENTRY 002</h2>

      {gateSatisfied ? (
        <>
          <p className="site00-expr-engine-panel__copy">
            <strong>PRE-STORYBOARD VISUAL AUTHORITIES</strong> · 5 / 5 APPROVED
          </p>
          <p className="site00-expr-engine-panel__meta">
            GATE: {data.preStoryboardGate.gateStatus} · {productionEligibility.approvedAuthorityCount}/
            {productionEligibility.requiredAuthorityCount} LOVE_IT
          </p>
          <p className="site00-expr-engine-panel__copy">
            <strong>FINAL CINEMATIC STORYBOARD</strong> · READY
          </p>
          <p className="site00-expr-engine-panel__copy">
            <strong>PRIMARY ACTION:</strong> {pipelineState.nextAction}
          </p>
        </>
      ) : (
        <>
          <p className="site00-expr-engine-panel__meta">
            <strong>CURRENT GATE:</strong> PRE-STORYBOARD VISUAL AUTHORITY REVIEW
          </p>
          <p className="site00-expr-engine-panel__copy">
            <strong>FINAL CINEMATIC STORYBOARD</strong> BLOCKED — PRE-STORYBOARD AUTHORITIES NOT YET APPROVED
          </p>
        </>
      )}

      <Block title="APPROVED AUTHORITIES">
        <ul className="site00-expr-engine-list">
          {preStoryboardAuthorityPack.authorities.map((board) => (
            <li key={board.boardId}>
              {String(board.boardNumber).padStart(2, '0')} {board.boardTitle} —{' '}
              <strong>{board.founderJudgment}</strong>
              {board.record?.version ? ` · v${board.record.version}` : ''}
            </li>
          ))}
        </ul>
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
                Authority {String(board.boardNumber).padStart(2, '0')}
              </div>
            )}
            <figcaption>
              <strong>{String(board.boardNumber).padStart(2, '0')}</strong> · {board.boardTitle}
              <p className="site00-expr-engine-panel__meta">
                {board.founderJudgment}
                {board.record?.status ? ` · ${board.record.status}` : ''}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="site00-expr-engine-panel__meta">
        Final storyboard: {pipelineState.finalStoryboard.status} · Keyframes: {data.keyframes} · Video:{' '}
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
