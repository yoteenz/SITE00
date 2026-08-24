/**
 * Performance + Learning — observation room operate layer.
 */

import type { ContentOperationsRun } from '../../../../shared/site00-brand-lore/contentOperations/types';
import { CreativeAssetCard, FounderEmptyState, FounderWorkspacePanel } from './FounderWorkspaceShell';

type Props = {
  run: ContentOperationsRun | null;
  loading: boolean;
  busy: boolean;
  onAcceptLearning: (learningId: string) => void;
};

export function PerformanceLearningRoom({ run, loading, busy, onAcceptLearning }: Props) {
  if (loading) {
    return <p className="site00-fws-empty">Loading performance data…</p>;
  }

  const published = run?.contentPackages.filter((p) => p.status === 'APPROVED' || p.status === 'PUBLISHED') ?? [];
  const records = run?.performanceRecords ?? [];
  const learning = run?.performanceLearning ?? [];
  const audience = run?.audienceResponses ?? [];

  const totalImpressions = records.reduce((sum, r) => sum + (r.impressions ?? 0), 0);
  const totalSaves = records.reduce((sum, r) => sum + (r.saves ?? 0), 0);

  return (
    <>
      <div className="site00-fws-pulse" style={{ marginBottom: 16 }}>
        <div className="site00-fws-pulse__metrics">
          <div className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{totalImpressions > 0 ? `${Math.round(totalImpressions / 1000)}K` : '—'}</span>
            <span className="site00-fws-pulse__label">REACH</span>
          </div>
          <div className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{totalSaves || '—'}</span>
            <span className="site00-fws-pulse__label">SAVES</span>
          </div>
          <div className="site00-fws-pulse__metric">
            <span className="site00-fws-pulse__value">{published.length}</span>
            <span className="site00-fws-pulse__label">PUBLISHED</span>
          </div>
        </div>
      </div>

      <FounderWorkspacePanel title="CONTENT THAT HIT">
        {published.length === 0 ? (
          <FounderEmptyState title="NOTHING PUBLISHED YET" body="Approve and publish manually first — performance links to the creative that caused it." />
        ) : (
          <div className="site00-fws-lane__body" style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
            {published.slice(0, 6).map((p) => (
              <CreativeAssetCard
                key={p.id}
                title={p.altText ?? p.id}
                previewUrl={null}
                format={p.channel}
                statusLabel={p.status.replace(/_/g, ' ')}
              />
            ))}
          </div>
        )}
      </FounderWorkspacePanel>

      <FounderWorkspacePanel title="AUDIENCE SIGNALS">
        {audience.length === 0 ? (
          <FounderEmptyState title="NO AUDIENCE EVIDENCE YET" body="Responses will translate into learnable observations when ingested." />
        ) : (
          <ul className="site00-fws-signal-list">
            {audience.slice(0, 8).map((a) => (
              <li key={a.evidenceId} className="site00-fws-signal-list__item">
                <strong>{a.text.slice(0, 72)}</strong>
                <span>{a.classifications.join(' · ')}</span>
              </li>
            ))}
          </ul>
        )}
      </FounderWorkspacePanel>

      <FounderWorkspacePanel title="WHAT NDX SHOULD LEARN">
        {learning.length === 0 ? (
          <FounderEmptyState title="NO LEARNING SYNTHESIS YET" body="Record performance and audience evidence to build observations." />
        ) : (
          learning.map((l) => (
            <div key={l.learningId} className="site00-fws-panel" style={{ marginBottom: 12, padding: 12 }}>
              <p style={{ fontSize: 12, margin: '0 0 8px' }}>
                Confidence: {l.confidence} (n={l.sampleSize})
              </p>
              <p style={{ margin: '0 0 8px' }}>{l.observedPatterns.join(' · ')}</p>
              {!l.founderAccepted ? (
                <button type="button" className="site00-fws-pulse__cta" disabled={busy} onClick={() => onAcceptLearning(l.learningId)}>
                  FOUNDER ACCEPTS LEARNING →
                </button>
              ) : (
                <span className="site00-fws-asset__status">ACCEPTED</span>
              )}
            </div>
          ))
        )}
      </FounderWorkspacePanel>
    </>
  );
}

export function PerformanceLearningInspectContent({ run }: { run: ContentOperationsRun | null }) {
  return (
    <>
      <section className="site00-experiment-g__panel">
        <h2>RAW METRICS</h2>
        <ul>
          {run?.performanceRecords.map((r) => (
            <li key={r.recordId}>
              Package {r.contentPackageId}: impressions {r.impressions ?? 'N/A'} · saves {r.saves ?? 'N/A'} · likes{' '}
              {r.likes ?? 'N/A'}
            </li>
          )) ?? <li>No records</li>}
        </ul>
      </section>
      <section className="site00-experiment-g__panel">
        <h2>WHAT NOT TO CONCLUDE</h2>
        <ul>
          <li>PERFORMANCE ≠ CHARACTER AUTHORITY</li>
          <li>One viral post does not rewrite editorial strategy</li>
          <li>Do not increase snark because snark performed</li>
        </ul>
      </section>
    </>
  );
}
