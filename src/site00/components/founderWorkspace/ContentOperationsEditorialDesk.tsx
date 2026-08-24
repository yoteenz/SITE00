/**
 * NDXBOOK Content Operations — editorial desk (Layer 1 operate surface).
 */

import { Link } from 'react-router-dom';
import type { ContentOperationsRun, SocialContentPackage } from '../../../../shared/site00-brand-lore/contentOperations/types';
import { attentionRequiresFounder } from '../../../../shared/site00-studio-world-production/founderWorkspace/attentionHierarchy.js';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPerformancePath,
} from '../../config/routes';
import {
  CreativeAssetCard,
  FounderEmptyState,
  FounderWorkspacePanel,
  OperationalPulse,
} from './FounderWorkspaceShell';
import { WorkspaceLoadingState } from './WorkspaceLoadingState';

type Props = {
  projectSlug: string;
  run: ContentOperationsRun | null;
  loading: boolean;
  busy: boolean;
  onPrepare: () => void;
  onCompile: () => void;
  onDiscover: () => void;
  onProposeSlate: () => void;
  onApproveSlate: () => void;
  onApprovePackage: (packageId: string) => void;
};

function humanStatus(status: string): string {
  switch (status) {
    case 'FOUNDER_REVIEW':
      return 'READY FOR REVIEW';
    case 'GENERATING':
      return 'GENERATING';
    case 'APPROVED':
    case 'SCHEDULED':
      return 'LOCKED';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'FORMULATED':
      return 'IN PRODUCTION';
    case 'DRAFT':
      return 'DEVELOPING';
    default:
      return status.replace(/_/g, ' ');
  }
}

function packageAttention(status: SocialContentPackage['status']) {
  if (status === 'FOUNDER_REVIEW') return 'READY_TO_REVIEW' as const;
  if (status === 'GENERATING' || status === 'FORMULATED') return 'DEVELOPING' as const;
  if (status === 'APPROVED' || status === 'SCHEDULED' || status === 'PUBLISHED') return 'ARCHIVED' as const;
  return 'MOVING_WITHOUT_YOU' as const;
}

export function ContentOperationsEditorialDesk({
  projectSlug,
  run,
  loading,
  busy,
  onPrepare,
  onCompile,
  onDiscover,
  onProposeSlate,
  onApproveSlate,
  onApprovePackage,
}: Props) {
  const packages = run?.contentPackages ?? [];
  const opportunities = run?.opportunities ?? [];
  const needsReview = packages.filter((p) => packageAttention(p.status) === 'READY_TO_REVIEW');
  const inProduction = packages.filter((p) => p.status === 'FORMULATED' || p.status === 'GENERATING');
  const developing = packages.filter((p) => p.status === 'DRAFT');
  const fromAudience = run?.audienceResponses?.length ?? 0;

  const pulseMetrics = [
    { label: 'BEING MADE', value: inProduction.length + developing.length },
    { label: 'NEED YOUR EYE', value: needsReview.length },
    { label: 'DEVELOPING', value: developing.length },
    { label: 'FROM AUDIENCE', value: fromAudience },
  ];

  if (loading) {
    return (
      <WorkspaceLoadingState
        label="Loading editorial desk…"
        preserveGeometry
        rows={4}
      />
    );
  }

  return (
    <div className="site00-fws-editorial-desk" data-visual-reconstruction="content-operations">
      <OperationalPulse
        metrics={pulseMetrics}
        primaryAction={
          needsReview.length > 0
            ? {
                label: 'REVIEW NEEDS ME →',
                href: site00ProjectContentOperationsCampaignBoardPath(projectSlug),
              }
            : undefined
        }
      />

      {!run && (
        <FounderWorkspacePanel title="GET STARTED">
          <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onPrepare}>
            PREPARE + AUDIT
          </button>
        </FounderWorkspacePanel>
      )}

      {run && !run.operationsSystem && (
        <FounderWorkspacePanel title="COMPILE">
          <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onCompile}>
            COMPILE CONTENT OPERATIONS
          </button>
        </FounderWorkspacePanel>
      )}

      {run?.operationsSystem && !run.opportunities.length && (
        <FounderWorkspacePanel title="DISCOVER">
          <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onDiscover}>
            DISCOVER OPPORTUNITIES
          </button>
        </FounderWorkspacePanel>
      )}

      {run?.opportunities.length && !run.activeSlate && (
        <FounderWorkspacePanel title="SLATE">
          <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onProposeSlate}>
            PROPOSE WEEKLY SLATE
          </button>
        </FounderWorkspacePanel>
      )}

      {run?.activeSlate?.status === 'PROPOSED' && (
        <FounderWorkspacePanel title="APPROVE SLATE">
          <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={onApproveSlate}>
            APPROVE SLATE
          </button>
        </FounderWorkspacePanel>
      )}

      <FounderWorkspacePanel title="IN PRODUCTION">
        {packages.length === 0 ? (
          <FounderEmptyState
            title="NOTHING IN PRODUCTION YET"
            body="Approve the weekly slate to begin making Pages, Margins, and motion pieces."
          />
        ) : (
          <div className="site00-fws-production-grid">
            {packages.map((p) => (
              <CreativeAssetCard
                key={p.id}
                title={p.altText ?? p.id}
                previewUrl={null}
                format={`${p.channel} · ${p.format}`}
                statusLabel={humanStatus(p.status)}
                onReview={
                  attentionRequiresFounder(packageAttention(p.status))
                    ? () => onApprovePackage(p.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </FounderWorkspacePanel>

      <FounderWorkspacePanel title="ON NDX'S RADAR">
        {opportunities.length === 0 ? (
          <FounderEmptyState
            title="NOT ENOUGH SIGNAL YET"
            body="NDX is watching. Nothing deserves promotion to a pattern yet."
          />
        ) : (
          <ul className="site00-fws-radar-list">
            {opportunities.slice(0, 6).map((o) => (
              <li key={o.id} className="site00-fws-radar-item">
                <span className="site00-fws-radar-item__signal">{o.subject}</span>
                <span className="site00-fws-radar-item__hint">
                  {o.rank?.whyHighPriority[0]?.slice(0, 40) ?? 'Pattern forming'} →
                </span>
              </li>
            ))}
          </ul>
        )}
      </FounderWorkspacePanel>
    </div>
  );
}

export function ContentOperationsInspectContent({ run }: { run: ContentOperationsRun | null }) {
  if (!run) return <p>No content operations run loaded.</p>;
  return (
    <>
      <dl>
        <dt>STATUS</dt>
        <dd>{run.status}</dd>
        <dt>OPERATING MODE</dt>
        <dd>{run.operationsSystem?.operatingMode ?? '—'}</dd>
        <dt>OPPORTUNITIES</dt>
        <dd>{run.opportunities.length}</dd>
        <dt>PACKAGES</dt>
        <dd>{run.contentPackages.length}</dd>
      </dl>
      {run.opportunities.length > 0 && (
        <>
          <h3>RAW OPPORTUNITY SCORES</h3>
          <ul>
            {run.opportunities.map((o) => (
              <li key={o.id}>
                {o.subject} — score {(o.rank?.compositeScore ?? 0).toFixed(2)} — {o.characterFit}
              </li>
            ))}
          </ul>
        </>
      )}
      {run.activeSlate && (
        <>
          <h3>WEEKLY SLATE</h3>
          <p>
            {run.activeSlate.contentCandidates.length} candidates · est. $
            {run.activeSlate.productionCostEstimate.toFixed(2)}
          </p>
          <p>Topics: {Object.keys(run.activeSlate.topicBalance).join(', ')}</p>
        </>
      )}
      <p>
        <Link to={site00ProjectContentOperationsPerformancePath('ndxbook')}>Performance + Learning →</Link>
      </p>
    </>
  );
}
