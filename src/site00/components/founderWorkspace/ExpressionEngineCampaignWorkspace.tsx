/**
 * Expression Engine — full campaign production blueprint workspace.
 * B5.0 — Entry 002 uses visual creative-production workspace.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type {
  ExpressionEngineB1Phase1Response,
} from '../../../../shared/site00-expression-engine/campaignClientTypes.js';
import { site00ProjectContentOperationsCampaignBoardPath } from '../../config/routes';
import { expressionEngineApi } from '../../services/expressionEngineApi';
import { InlineMeta, QuietAction, WorkspaceField } from './WorkspaceCompositionPrimitives';
import { ExpressionEngineEntry002Workspace } from './expressionEngine/ExpressionEngineEntry002Workspace';
import { ExpressionEngineReferenceMobileWorkspace } from './expressionEngine/ExpressionEngineReferenceMobileWorkspace';

type EntryTab = '002' | '001';

type Props = {
  projectSlug: string;
  /** Reference-fidelity mobile layout (founder design authority). */
  layout?: 'studio' | 'reference-mobile';
};

export function ExpressionEngineCampaignWorkspace({ projectSlug, layout = 'studio' }: Props) {
  const [entryTab, setEntryTab] = useState<EntryTab>('002');
  const isReferenceMobile = layout === 'reference-mobile';

  return (
    <div className={`site00-expr-engine-workspace site00-expr-engine-workspace--b50${isReferenceMobile ? ' site00-expr-engine-workspace--ref-mobile' : ''}`}>
      {!isReferenceMobile ? (
        <nav className="site00-expr-engine-workspace__tabs">
          <button
            type="button"
            className={entryTab === '002' ? 'active' : ''}
            onClick={() => setEntryTab('002')}
          >
            ENTRY 002
          </button>
          <button
            type="button"
            className={entryTab === '001' ? 'active' : ''}
            onClick={() => setEntryTab('001')}
          >
            ENTRY 001
          </button>
        </nav>
      ) : null}

      {entryTab === '002' ? (
        isReferenceMobile ? (
          <ExpressionEngineReferenceMobileWorkspace projectSlug={projectSlug} />
        ) : (
          <ExpressionEngineEntry002Workspace projectSlug={projectSlug} />
        )
      ) : (
        <Entry001LegacyWorkspace projectSlug={projectSlug} />
      )}
    </div>
  );
}

function Entry001LegacyWorkspace({ projectSlug }: { projectSlug: string }) {
  const [phase1, setPhase1] = useState<ExpressionEngineB1Phase1Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<'overview' | 'readiness'>('overview');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    expressionEngineApi
      .phase1()
      .then((p1) => {
        if (!cancelled) setPhase1(p1);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load Expression Engine');
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
    return <p className="site00-expr-engine-panel__meta">Loading Expression Engine blueprint…</p>;
  }

  if (error || !phase1) {
    return <p className="site00-expr-engine-panel__meta">{error ?? 'Failed to load'}</p>;
  }

  return (
    <>
      <nav className="site00-expr-engine-workspace__sections">
        <button
          type="button"
          className={section === 'overview' ? 'site00-btn site00-btn--primary' : 'site00-btn'}
          onClick={() => setSection('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={section === 'readiness' ? 'site00-btn site00-btn--primary' : 'site00-btn'}
          onClick={() => setSection('readiness')}
        >
          Readiness
        </button>
      </nav>
      <WorkspaceField>
        {section === 'overview' ? (
          <>
            <h2 className="site00-expr-engine-panel__title">ENTRY 001 — {phase1.entry001.title}</h2>
            <InlineMeta label="Status" value={phase1.entry001.status} />
            <InlineMeta label="TikTok plan" value={phase1.entry001.tiktokPlan.adaptationDecision} />
            <InlineMeta label="X expression" value={phase1.entry001.xExpression.status} />
            <p className="site00-expr-engine-panel__copy">{phase1.entry001.tiktokPlan.adaptationRationale}</p>
          </>
        ) : (
          <ReadinessBlock readiness={phase1.readiness001} />
        )}
      </WorkspaceField>
      <div className="site00-expr-engine-workspace__footer">
        <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fws-ingest-link">
          ← CAMPAIGN BOARD
        </Link>
        <QuietAction
          onClick={() => {
            void navigator.clipboard.writeText(JSON.stringify(phase1, null, 2));
          }}
        >
          COPY JSON →
        </QuietAction>
      </div>
    </>
  );
}

function ReadinessBlock({ readiness }: { readiness: { ready: boolean; blockers: string[]; checks: Array<{ check: string; passed: boolean }> } }) {
  return (
    <BlueprintBlock title="READINESS">
      <InlineMeta label="Ready" value={readiness.ready ? 'YES' : 'NO'} />
      {readiness.blockers.length ? (
        <>
          <p className="site00-expr-engine-panel__meta">Blockers</p>
          <ul className="site00-expr-engine-list">
            {readiness.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="site00-expr-engine-panel__copy">No blockers.</p>
      )}
    </BlueprintBlock>
  );
}

function BlueprintBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
