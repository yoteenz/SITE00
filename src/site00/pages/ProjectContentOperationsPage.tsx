import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { ContentOperationsRun } from '../../../shared/site00-brand-lore/contentOperations/types';
import {
  FounderWorkspaceShell,
  OperationalPulsePanel,
  CreativeAssetCard,
  EditorialLeadList,
  AssetReviewWorkspace,
  InspectorKeyValue,
} from '../components/founderWorkspace';
import {
  buildContentOpsOperationalPulse,
  buildWeeklyRangeSummary,
  contentPackageToAssetPresentation,
  opportunityToEditorialLead,
} from '../../../shared/site00-brand-lore/founderWorkspace/contentOperationsDeskAdapter';
import '../styles/site00-founder-workspace.css';

export default function ProjectContentOperationsPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<ContentOperationsRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reviewPkgId, setReviewPkgId] = useState<string | null>(null);
  const [inspectLeadId, setInspectLeadId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.contentOperationsGet(projectSlug);
      setRun((result.run as ContentOperationsRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const act = async (fn: () => Promise<{ run: Record<string, unknown> }>) => {
    setBusy(true);
    try {
      const result = await fn();
      setRun((result.run as ContentOperationsRun) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const pulse = useMemo(() => buildContentOpsOperationalPulse(run, projectSlug), [run, projectSlug]);
  const assets = useMemo(
    () => (run?.contentPackages ?? []).map(contentPackageToAssetPresentation),
    [run?.contentPackages],
  );
  const leads = useMemo(
    () => (run?.opportunities ?? []).slice(0, 8).map(opportunityToEditorialLead),
    [run?.opportunities],
  );
  const range = useMemo(() => buildWeeklyRangeSummary(run), [run]);
  const reviewAsset = assets.find((a) => a.id === reviewPkgId) ?? null;
  const inspectLead = run?.opportunities.find((o) => o.id === inspectLeadId);

  const needEyeBadge = pulse.counts.needYourEye;

  if (projectSlug !== 'ndxbook') {
    return <p>Content Operations is NDXBOOK-only.</p>;
  }

  const inspectContent = (
    <>
      <InspectorKeyValue
        data={{
          status: run?.status ?? 'NOT_STARTED',
          operatingMode: run?.operationsSystem?.operatingMode ?? 'ASSISTED_AUTONOMY',
          opportunityCount: run?.opportunities.length ?? 0,
          packageCount: run?.contentPackages.length ?? 0,
          slateStatus: run?.activeSlate?.status ?? '—',
          marketTest: run?.marketTest01?.status ?? '—',
        }}
      />
      {inspectLead ? (
        <>
          <h3 className="site00-fws-section__title">OPPORTUNITY INSPECT</h3>
          <InspectorKeyValue
            data={{
              subject: inspectLead.subject,
              score: inspectLead.rank?.compositeScore,
              characterFit: inspectLead.characterFit,
              why: inspectLead.rank?.whyHighPriority?.join('; '),
              source: inspectLead.sourceType,
            }}
          />
        </>
      ) : null}
    </>
  );

  return (
    <FounderWorkspaceShell
      projectSlug={projectSlug}
      workspaceTitle="CONTENT OPERATIONS"
      inspectTitle="CONTENT OPERATIONS — SYSTEM"
      inspectContent={inspectContent}
      navBadges={{ REVIEW: needEyeBadge }}
    >
      {loading ? (
        <p className="site00-fws-empty">Loading editorial desk…</p>
      ) : (
        <>
          <OperationalPulsePanel
            pulse={pulse}
            onPrimaryAction={
              run?.activeSlate?.status === 'PROPOSED'
                ? () => void act(() => site00ProjectsApi.contentOperationsApproveSlate(projectSlug, 'APPROVE_SLATE'))
                : needEyeBadge > 0
                  ? () => document.getElementById('in-production')?.scrollIntoView({ behavior: 'smooth' })
                  : undefined
            }
          />

          {/* Bootstrap actions — only when pipeline incomplete */}
          {!run && (
            <section className="site00-fws-section">
              <div className="site00-fws-actions">
                <button type="button" className="site00-fws-btn site00-fws-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsPrepare(projectSlug))}>
                  PREPARE + AUDIT
                </button>
              </div>
            </section>
          )}
          {run && !run.operationsSystem && (
            <section className="site00-fws-section">
              <div className="site00-fws-actions">
                <button type="button" className="site00-fws-btn site00-fws-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsCompile(projectSlug))}>
                  COMPILE CONTENT OPERATIONS
                </button>
              </div>
            </section>
          )}
          {run?.operationsSystem && !run.opportunities.length && (
            <section className="site00-fws-section">
              <div className="site00-fws-actions">
                <button type="button" className="site00-fws-btn site00-fws-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsDiscoverOpportunities(projectSlug))}>
                  DISCOVER OPPORTUNITIES
                </button>
              </div>
            </section>
          )}
          {run?.opportunities.length && !run.activeSlate && (
            <section className="site00-fws-section">
              <div className="site00-fws-actions">
                <button type="button" className="site00-fws-btn site00-fws-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsProposeSlate(projectSlug))}>
                  PROPOSE WEEKLY SLATE
                </button>
              </div>
            </section>
          )}
          {run?.activeSlate?.status === 'PROPOSED' && (
            <section className="site00-fws-section" id="approve-slate">
              <p className="site00-fws-empty">
                {run.activeSlate.contentCandidates.length} candidates ready — tap REVIEW NEEDS ME or approve below.
              </p>
              <div className="site00-fws-actions">
                <button type="button" className="site00-fws-btn site00-fws-btn--primary" disabled={busy} onClick={() => void act(() => site00ProjectsApi.contentOperationsApproveSlate(projectSlug, 'APPROVE_SLATE'))}>
                  APPROVE SLATE
                </button>
              </div>
            </section>
          )}

          <section className="site00-fws-section" id="in-production">
            <h2 className="site00-fws-section__title">IN PRODUCTION</h2>
            {assets.length ? (
              <div className="site00-fws-section__grid">
                {assets.map((asset) => (
                  <CreativeAssetCard
                    key={asset.id}
                    asset={asset}
                    size="md"
                    onReview={() => setReviewPkgId(asset.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="site00-fws-empty">
                {run?.activeSlate?.status === 'APPROVED'
                  ? 'Packages loading — refresh if empty.'
                  : 'Approve the weekly slate to begin production.'}
              </p>
            )}
          </section>

          <section className="site00-fws-section">
            <h2 className="site00-fws-section__title">ON NDX&apos;S RADAR</h2>
            <EditorialLeadList leads={leads} onInspectLead={(lead) => setInspectLeadId(lead.id)} />
          </section>

          {range ? (
            <section className="site00-fws-section">
              <h2 className="site00-fws-section__title">THIS WEEK&apos;S RANGE</h2>
              <p className="site00-fws-empty" style={{ border: 'none', padding: 0 }}>
                {range.candidateCount} candidates · est. ${run?.activeSlate?.productionCostEstimate.toFixed(2) ?? '0.00'}
              </p>
              <div className="site00-fws-range-tags">
                {range.topics.map((t) => (
                  <span key={t} className="site00-fws-range-tag">{t}</span>
                ))}
              </div>
            </section>
          ) : null}

          {run?.publishingHandoffs.length ? (
            <section className="site00-fws-section">
              <h2 className="site00-fws-section__title">READY FOR MANUAL PUBLISH</h2>
              <ul className="site00-fws-lead-list">
                {run.publishingHandoffs.map((h) => (
                  <li key={h.handoffId} className="site00-fws-lead">
                    <span>{h.channel}</span>
                    <span>{h.status}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <AssetReviewWorkspace
        open={Boolean(reviewPkgId)}
        asset={reviewAsset}
        onClose={() => setReviewPkgId(null)}
        understand={
          reviewAsset?.subtitle ? <p>{reviewAsset.subtitle}</p> : null
        }
        inspect={
          reviewPkgId ? (
            <InspectorKeyValue
              data={
                (run?.contentPackages.find((p) => p.id === reviewPkgId) as unknown as Record<string, unknown>) ?? {}
              }
            />
          ) : null
        }
        actions={
          reviewPkgId ? (
            <>
              <button
                type="button"
                className="site00-fws-btn site00-fws-btn--primary"
                disabled={busy}
                onClick={() =>
                  void act(() => site00ProjectsApi.contentOperationsApprovePackage(projectSlug, reviewPkgId)).then(
                    () => setReviewPkgId(null),
                  )
                }
              >
                APPROVE FOR PUBLISH
              </button>
            </>
          ) : null
        }
      />
    </FounderWorkspaceShell>
  );
}
