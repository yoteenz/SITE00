import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FounderWorkspaceShell,
  PerformanceLearningRoom,
  InspectorKeyValue,
} from '../components/founderWorkspace';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import type { ContentOperationsRun } from '../../../shared/site00-brand-lore/contentOperations/types';
import {
  buildAudienceSignals,
  buildContentThatHit,
  buildLearningSignals,
  buildPerformanceSummary,
} from '../../../shared/site00-brand-lore/founderWorkspace/performanceLearningAdapter';
import '../styles/site00-founder-workspace.css';

export default function ProjectContentOperationsPerformancePage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<ContentOperationsRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

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

  const summary = useMemo(() => buildPerformanceSummary(run), [run]);
  const contentThatHit = useMemo(() => buildContentThatHit(run), [run]);
  const audienceSignals = useMemo(() => buildAudienceSignals(run), [run]);
  const learningSignals = useMemo(() => buildLearningSignals(run), [run]);
  const learning = run?.performanceLearning ?? [];

  if (projectSlug !== 'ndxbook') {
    return <p>Performance review is NDXBOOK-only.</p>;
  }

  const inspectContent = (
    <>
      <InspectorKeyValue
        data={{
          performanceRecords: run?.performanceRecords.length ?? 0,
          audienceResponses: run?.audienceResponses.length ?? 0,
          learningEntries: learning.length,
        }}
      />
      <details className="site00-fws-review__inspect">
        <summary>RAW METRICS</summary>
        <ul>
          {run?.performanceRecords.map((r) => (
            <li key={r.recordId}>
              Package {r.contentPackageId}: impressions {r.impressions ?? 'N/A'} · saves {r.saves ?? 'N/A'}
            </li>
          )) ?? <li>No records.</li>}
        </ul>
      </details>
      <details className="site00-fws-review__inspect">
        <summary>WHAT NOT TO CONCLUDE</summary>
        <ul>
          <li>PERFORMANCE ≠ CHARACTER AUTHORITY</li>
          <li>One viral post does not rewrite editorial strategy</li>
          <li>Do not increase snark because snark performed</li>
        </ul>
      </details>
    </>
  );

  return (
    <FounderWorkspaceShell
      projectSlug={projectSlug}
      workspaceTitle="PERFORMANCE + LEARNING"
      inspectTitle="PERFORMANCE — RAW DATA"
      inspectContent={inspectContent}
    >
      <div className="site00-fws-desk">
        <header className="site00-fws-desk__hero">
          <p className="site00-fws-campaign__kicker">OBSERVATION ROOM</p>
          <h1 className="site00-fws-campaign__title">WHAT NDX IS LEARNING</h1>
        </header>

        {loading ? (
          <p className="site00-fws-empty">Loading performance data…</p>
        ) : (
          <PerformanceLearningRoom
            summary={summary}
            contentThatHit={contentThatHit}
            audienceSignals={audienceSignals}
            learningSignals={learningSignals}
            learningActions={
              <>
                {learning.map((l) =>
                  !l.founderAccepted ? (
                    <button
                      key={l.learningId}
                      type="button"
                      className="site00-fws-btn site00-fws-btn--primary"
                      disabled={busy}
                      style={{ marginTop: '0.75rem' }}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          const result = await site00ProjectsApi.contentOperationsAcceptLearning(projectSlug, l.learningId);
                          setRun((result.run as ContentOperationsRun) ?? null);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      FOUNDER ACCEPTS LEARNING — {l.observedPatterns[0]?.slice(0, 40) ?? l.learningId}
                    </button>
                  ) : null,
                )}
                {run?.contentPackages.some((p) => p.status === 'APPROVED') ? (
                  <details className="site00-fws-review__inspect" style={{ marginTop: '1rem' }}>
                    <summary>RECORD PERFORMANCE (MANUAL)</summary>
                    {run.contentPackages.filter((p) => p.status === 'APPROVED').map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="site00-fws-btn"
                        disabled={busy}
                        style={{ margin: '4px' }}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            const result = await site00ProjectsApi.contentOperationsRecordPerformance(projectSlug, p.id, {
                              impressions: 1200,
                              saves: 45,
                              likes: 89,
                            });
                            setRun((result.run as ContentOperationsRun) ?? null);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        INGEST METRICS — {p.altText}
                      </button>
                    ))}
                  </details>
                ) : null}
              </>
            }
          />
        )}
      </div>
    </FounderWorkspaceShell>
  );
}
