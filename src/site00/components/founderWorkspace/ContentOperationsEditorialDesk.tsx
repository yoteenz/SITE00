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
import {
  getOpportunitySpokenPremise,
  getOpportunityTopicMetadata,
} from '../../../../shared/site00-brand-lore/founderWorkspace/contentOperationsDeskAdapter';
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

  const workspaceZones = run?.workspaceZones ?? [];
  const contentSeeds = run?.contentSeeds ?? [];

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

      <FounderWorkspacePanel title="TODAY AT NDX">
        {contentSeeds.length === 0 ? (
          <FounderEmptyState
            title="NOTHING IN MOTION YET"
            body="Discover opportunities to see NDX's thoughts, rabbit holes, and ready Pages."
          />
        ) : (
          <div className="site00-fws-workspace-zones">
            {workspaceZones.map((zone) => (
              <div key={zone.zoneId} className="site00-fws-workspace-zone">
                <h4 className="site00-fws-workspace-zone__label">{zone.label}</h4>
                {zone.seedIds.length === 0 ? (
                  <p className="site00-fws-workspace-zone__empty">—</p>
                ) : (
                  <ul className="site00-fws-radar-list">
                    {zone.seedIds.slice(0, 3).map((seedId) => {
                      const seed = contentSeeds.find((s) => s.seedId === seedId);
                      if (!seed) return null;
                      return (
                        <li key={seedId} className="site00-fws-radar-item">
                          <span className="site00-fws-radar-item__signal">{seed.premise.spokenPremise}</span>
                          <span className="site00-fws-radar-item__hint">
                            {seed.topicMetadata.slice(0, 2).join(' · ')} · {seed.characterBeat.replace(/_/g, ' ')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </FounderWorkspacePanel>

      <FounderWorkspacePanel title="OPPORTUNITIES">
        {opportunities.length === 0 ? (
          <FounderEmptyState
            title="NOT ENOUGH SIGNAL YET"
            body="NDX is watching. Nothing deserves promotion to a pattern yet."
          />
        ) : (
          <ul className="site00-fws-radar-list">
            {opportunities.slice(0, 8).map((o) => (
              <li key={o.id} className="site00-fws-radar-item site00-fws-radar-item--premise-first">
                <span className="site00-fws-radar-item__signal">{getOpportunitySpokenPremise(o)}</span>
                <span className="site00-fws-radar-item__hint">
                  {getOpportunityTopicMetadata(o)}
                  {o.characterFirst ? ` · ${o.characterFirst.formulation.thoughtArcSummary}` : ''}
                  {o.characterFirst ? ` · ${o.characterFirst.formulation.surfaceRecommendation.join(' + ')}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </FounderWorkspacePanel>

      {run?.activeSlate?.premiseFirstEntries && run.activeSlate.premiseFirstEntries.length > 0 && (
        <FounderWorkspacePanel title="THIS WEEK">
          <ol className="site00-fws-weekly-slate">
            {run.activeSlate.premiseFirstEntries.map((entry) => (
              <li key={entry.opportunityId} className="site00-fws-weekly-slate__item">
                <span className="site00-fws-weekly-slate__rank">{String(entry.rank).padStart(2, '0')}</span>
                <span className="site00-fws-weekly-slate__premise">{entry.spokenPremise}</span>
                <span className="site00-fws-weekly-slate__meta">{entry.topicMetadata}</span>
              </li>
            ))}
          </ol>
        </FounderWorkspacePanel>
      )}

      {/* legacy radar removed — premise-first opportunities panel above */}
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
                {getOpportunitySpokenPremise(o)} ({o.subject}) — score {(o.rank?.compositeScore ?? 0).toFixed(2)} — {o.characterFit}
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
          <p>Premises: {run.activeSlate.premiseFirstEntries?.map((e) => e.spokenPremise).join(' · ') ?? Object.keys(run.activeSlate.topicBalance).join(', ')}</p>
        </>
      )}
      <p>
        <Link to={site00ProjectContentOperationsPerformancePath('ndxbook')}>Performance + Learning →</Link>
      </p>
    </>
  );
}
