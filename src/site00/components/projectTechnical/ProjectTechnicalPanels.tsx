/**
 * B5.10 — Project technical intelligence panels (reference-fidelity, uppercase UI).
 */

import { useState } from 'react';
import type { ProjectCodebaseIntelligence, ProjectDiagnosticFinding, ProjectTechnicalTabId } from '../../../../shared/site00-projects/technical/types.js';
import { translateTechnicalStatusForClient } from '../../../../shared/site00-projects/technical/clientTechnicalTranslation.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext.js';

type PanelProps = {
  intelligence: ProjectCodebaseIntelligence;
  onSync?: () => void;
  syncing?: boolean;
};

function StatusDot({ status }: { status: string }) {
  const s = status.toUpperCase();
  let cls = 'gray';
  if (/PASS|GREEN|LIVE|ACTIVE|CONNECTED|OPERATIONAL|LATEST|SYNCED/.test(s)) cls = 'green';
  else if (/WARN|AMBER|UPDATE|MISSING|NOT DEPLOYED/.test(s)) cls = 'amber';
  else if (/FAIL|BLOCK|ERROR|CRITICAL|RED/.test(s)) cls = 'red';
  else if (/PROGRESS|BLUE|IN PROGRESS/.test(s)) cls = 'blue';
  return <span className={`site00-ptech-dot site00-ptech-dot--${cls}`} aria-hidden="true" />;
}

function RepoActions({ intelligence, onSync, syncing }: PanelProps) {
  const url = intelligence.repositoryConnection.repositoryUrl;
  return (
    <div className="site00-ptech-actions">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="site00-ptech-btn site00-ptech-btn--outline">
          OPEN REPO
        </a>
      ) : null}
      <button type="button" className="site00-ptech-btn site00-ptech-btn--primary" onClick={onSync} disabled={syncing}>
        {syncing ? 'SYNCING…' : 'SYNC NOW'}
      </button>
    </div>
  );
}

export function ProjectTechnicalOverviewPanel({ intelligence, onSync, syncing }: PanelProps) {
  const { viewMode } = useProjectViewMode();
  const conn = intelligence.repositoryConnection;
  const readiness = intelligence.readinessAssessment;

  return (
    <div className="site00-ptech-panel">
      <section className="site00-ptech-hero">
        <div className="site00-ptech-hero__image" aria-hidden="true" />
        <div className="site00-ptech-hero__body">
          <p className="site00-ptech-hero__phase">{intelligence.reconciliation.declaredPhase ?? 'IN PROGRESS'}</p>
          {readiness.overallPercent != null ? (
            <p className="site00-ptech-hero__progress">{readiness.overallPercent}% COMPLETE</p>
          ) : (
            <p className="site00-ptech-hero__progress">{readiness.overall.replace(/_/g, ' ')}</p>
          )}
        </div>
      </section>

      <div className="site00-ptech-signal-grid">
        <div className="site00-ptech-signal">
          <StatusDot status={intelligence.buildState.status} />
          <strong>BUILD HEALTH</strong>
          <span>{viewMode === 'CLIENT' ? translateTechnicalStatusForClient(intelligence.buildState.status) : intelligence.buildState.status}</span>
        </div>
        <div className="site00-ptech-signal">
          <StatusDot status={intelligence.deploymentState.find((d) => d.environment === 'STAGING')?.status ?? 'UNKNOWN'} />
          <strong>DEPLOYMENT</strong>
          <span>{intelligence.deploymentState.find((d) => d.environment === 'STAGING')?.status ?? 'UNKNOWN'}</span>
        </div>
        <div className="site00-ptech-signal">
          <StatusDot status={intelligence.dependencyState.outdated.length > 0 ? 'WARNING' : 'PASS'} />
          <strong>DEPENDENCIES</strong>
          <span>{intelligence.dependencyState.outdated.length || intelligence.dependencyState.totalDependencies} TOTAL</span>
        </div>
        <div className="site00-ptech-signal">
          <StatusDot status={intelligence.blockers.length ? 'BLOCKED' : 'PASS'} />
          <strong>BLOCKERS</strong>
          <span>{intelligence.blockers.length ? `${intelligence.blockers.length} NEED YOUR EYE` : 'NONE'}</span>
        </div>
      </div>

      <section className="site00-ptech-card">
        <h2 className="site00-ptech-card__title">REPOSITORY</h2>
        <p className="site00-ptech-card__value">
          {conn.connected ? 'CONNECTED' : conn.connectionStatus.replace(/_/g, ' ')}
        </p>
        {conn.repositoryOwner && conn.repositoryName ? (
          <p className="site00-ptech-card__meta">
            {conn.repositoryOwner}/{conn.repositoryName} · {conn.defaultBranch ?? '—'}
          </p>
        ) : null}
        <RepoActions intelligence={intelligence} onSync={onSync} syncing={syncing} />
      </section>

      {intelligence.reconciliation.mismatch ? (
        <section className="site00-ptech-card site00-ptech-card--warn">
          <h2 className="site00-ptech-card__title">STATE MISMATCH</h2>
          <p>{intelligence.reconciliation.explanation}</p>
        </section>
      ) : null}
    </div>
  );
}

export function ProjectTechnicalCodebasePanel({ intelligence, onSync, syncing }: PanelProps) {
  const branch = intelligence.branchState;
  const conn = intelligence.repositoryConnection;

  if (!conn.connected) {
    return (
      <div className="site00-ptech-panel">
        <section className="site00-ptech-empty">
          <h2>REPOSITORY NOT CONNECTED</h2>
          <p>{conn.syncError ?? 'CONNECT REPOSITORY TO VIEW CODEBASE INTELLIGENCE.'}</p>
          <RepoActions intelligence={intelligence} onSync={onSync} syncing={syncing} />
        </section>
      </div>
    );
  }

  return (
    <div className="site00-ptech-panel">
      <section className="site00-ptech-card">
        <h2 className="site00-ptech-card__title">REPOSITORY</h2>
        <p className="site00-ptech-card__value">{conn.repositoryOwner}/{conn.repositoryName}</p>
        <p className="site00-ptech-card__meta">BRANCH · {branch.activeBranch ?? conn.defaultBranch}</p>
        <p className="site00-ptech-card__meta">SYNC · {branch.syncStatus}</p>
      </section>

      <div className="site00-ptech-stat-row">
        <div><strong>{branch.commitsAhead ?? '—'}</strong><span>COMMITS AHEAD</span></div>
        <div><strong>{intelligence.pullRequests.filter((p) => p.state === 'OPEN').length}</strong><span>OPEN PRS</span></div>
        <div><strong>{intelligence.issues.filter((i) => i.state === 'OPEN').length}</strong><span>OPEN ISSUES</span></div>
      </div>

      {branch.lastCommitSha ? (
        <section className="site00-ptech-card">
          <h2 className="site00-ptech-card__title">LATEST COMMIT</h2>
          <p className="site00-ptech-card__value">{branch.lastCommitSha.slice(0, 7)}</p>
          <p className="site00-ptech-card__meta">{branch.lastCommitMessage}</p>
          <p className="site00-ptech-card__meta">{branch.lastCommitAuthor} · {branch.lastCommitAt}</p>
          {intelligence.recentCommits[0]?.url ? (
            <a href={intelligence.recentCommits[0].url} target="_blank" rel="noreferrer" className="site00-ptech-link">
              VIEW ON GITHUB →
            </a>
          ) : null}
        </section>
      ) : null}

      <section className="site00-ptech-card">
        <h2 className="site00-ptech-card__title">CI / BUILD STATUS</h2>
        <ul className="site00-ptech-check-list">
          {(['buildState', 'testState', 'lintState', 'typecheckState'] as const).map((key) => {
            const check = intelligence[key];
            return (
              <li key={key}>
                <StatusDot status={check.status} />
                <span>{key.replace('State', '').toUpperCase()}</span>
                <span>{check.status}</span>
              </li>
            );
          })}
        </ul>
      </section>
      <RepoActions intelligence={intelligence} onSync={onSync} syncing={syncing} />
    </div>
  );
}

export function ProjectTechnicalDependenciesPanel({ intelligence }: PanelProps) {
  const dep = intelligence.dependencyState;
  return (
    <div className="site00-ptech-panel">
      <div className="site00-ptech-stat-row site00-ptech-stat-row--4">
        <div><strong>{dep.totalDependencies}</strong><span>TOTAL</span></div>
        <div><strong>{dep.outdated.length}</strong><span>OUTDATED</span></div>
        <div><strong>{dep.deprecated.length}</strong><span>DEPRECATED</span></div>
        <div><strong>{dep.securityAdvisories.length}</strong><span>VULNERABILITIES</span></div>
      </div>
      <section className="site00-ptech-card">
        <h2 className="site00-ptech-card__title">KEY PACKAGES</h2>
        {dep.totalDependencies === 0 ? (
          <p className="site00-ptech-empty-inline">NO DEPENDENCY SCAN — CONNECT REPOSITORY AND SYNC.</p>
        ) : dep.outdated.length ? (
          <ul className="site00-ptech-package-list">
            {dep.outdated.slice(0, 8).map((p) => (
              <li key={p.name}>
                <span className="site00-ptech-package-list__name">{p.name}</span>
                <span>{p.currentVersion}</span>
                <StatusDot status={String(p.status)} />
                <span>{p.status.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="site00-ptech-empty-inline">{dep.totalDependencies} PACKAGES SCANNED — NO OUTDATED FLAGGED</p>
        )}
      </section>
    </div>
  );
}

export function ProjectTechnicalDeploymentsPanel({ intelligence }: PanelProps) {
  return (
    <div className="site00-ptech-panel">
      {intelligence.deploymentState.map((d) => (
        <section key={d.environment} className="site00-ptech-card">
          <h2 className="site00-ptech-card__title">{d.environment}</h2>
          <p className="site00-ptech-card__value">{d.status.replace(/_/g, ' ')}</p>
          {d.completedAt ? <p className="site00-ptech-card__meta">LAST DEPLOY · {d.completedAt}</p> : null}
          {d.releaseVersion ? <p className="site00-ptech-card__meta">VERSION · {d.releaseVersion}</p> : null}
        </section>
      ))}
    </div>
  );
}

export function ProjectTechnicalEnvironmentsPanel({ intelligence }: PanelProps) {
  const [selected, setSelected] = useState(intelligence.environmentState[0]?.environmentId ?? '');
  const env = intelligence.environmentState.find((e) => e.environmentId === selected) ?? intelligence.environmentState[0];

  return (
    <div className="site00-ptech-panel">
      <div className="site00-ptech-env-tabs">
        {intelligence.environmentState.map((e) => (
          <button
            key={e.environmentId}
            type="button"
            className={`site00-ptech-env-tabs__btn${e.environmentId === env?.environmentId ? ' is-active' : ''}`}
            onClick={() => setSelected(e.environmentId)}
          >
            {e.name}
          </button>
        ))}
      </div>
      {env ? (
        <>
          <section className="site00-ptech-card">
            <h2 className="site00-ptech-card__title">HEALTH</h2>
            <p className="site00-ptech-card__value">{env.status}</p>
            {env.uptime ? <p className="site00-ptech-card__meta">UPTIME · {env.uptime}</p> : null}
            {env.responseTime ? <p className="site00-ptech-card__meta">RESPONSE · {env.responseTime}</p> : null}
            <p className="site00-ptech-card__meta">SSL · {env.sslStatus.replace(/_/g, ' ')}</p>
          </section>
          <section className="site00-ptech-card">
            <h2 className="site00-ptech-card__title">ENVIRONMENT VARIABLES</h2>
            <p className="site00-ptech-card__meta">
              CONFIGURED {env.envVarConfiguredCount} · MISSING {env.envVarMissingCount} · INVALID {env.envVarInvalidCount}
            </p>
            <ul className="site00-ptech-env-list">
              {env.envVarStatuses.map((v) => (
                <li key={v.name}>
                  <span>{v.name}</span>
                  <StatusDot status={v.status} />
                  <span>{v.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}

export function ProjectTechnicalDiagnosticsPanel({ intelligence }: PanelProps) {
  const [selected, setSelected] = useState<ProjectDiagnosticFinding | null>(null);

  if (selected) {
    return (
      <div className="site00-ptech-panel">
        <button type="button" className="site00-ptech-back" onClick={() => setSelected(null)}>
          ← DIAGNOSTICS
        </button>
        <section className="site00-ptech-card">
          <h2 className="site00-ptech-card__title">{selected.title}</h2>
          <p className="site00-ptech-card__meta">{selected.severity} · {selected.category}</p>
          <p>{selected.summary}</p>
          <p className="site00-ptech-card__meta">EVIDENCE · {selected.evidence}</p>
          <p className="site00-ptech-recommendation">{selected.recommendedAction}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="site00-ptech-panel">
      <ul className="site00-ptech-diag-list">
        {intelligence.diagnostics.length ? (
          intelligence.diagnostics.map((d) => (
            <li key={d.findingId}>
              <button type="button" className="site00-ptech-diag-list__btn" onClick={() => setSelected(d)}>
                <StatusDot status={d.severity} />
                <span>{d.category}</span>
                <span>{d.title}</span>
                <span>{d.status}</span>
              </button>
            </li>
          ))
        ) : (
          <li className="site00-ptech-empty-inline">ALL CHECKS OPERATIONAL</li>
        )}
      </ul>
    </div>
  );
}

export function ProjectTechnicalNotesPanel({ intelligence }: PanelProps) {
  const { viewMode } = useProjectViewMode();
  const notes =
    viewMode === 'CLIENT'
      ? intelligence.notes.filter((n) => n.clientVisible && !n.internalOnly)
      : intelligence.notes;

  return (
    <div className="site00-ptech-panel">
      <ul className="site00-ptech-notes-list">
        {notes.length ? (
          notes.map((n) => (
            <li key={n.noteId} className={n.pinned ? 'is-pinned' : ''}>
              <p className="site00-ptech-notes-list__type">{n.type}</p>
              <p className="site00-ptech-notes-list__title">{n.title}</p>
              <p className="site00-ptech-notes-list__body">{n.body}</p>
              <time dateTime={n.createdAt}>{n.createdAt.slice(0, 10)}</time>
            </li>
          ))
        ) : (
          <li className="site00-ptech-empty-inline">NO NOTES YET</li>
        )}
      </ul>
    </div>
  );
}

export function ProjectTechnicalMilestonesPanel({ intelligence }: PanelProps) {
  return (
    <div className="site00-ptech-panel">
      <ul className="site00-ptech-milestone-list">
        {intelligence.milestones.length ? (
          intelligence.milestones.map((m) => (
            <li key={m.milestoneId}>
              <StatusDot status={m.status} />
              <div>
                <p className="site00-ptech-milestone-list__title">{m.title}</p>
                <p className="site00-ptech-milestone-list__status">{m.status.replace(/_/g, ' ')}</p>
                {m.dependencies.length ? (
                  <p className="site00-ptech-milestone-list__deps">DEPENDS ON · {m.dependencies.join(', ')}</p>
                ) : null}
              </div>
            </li>
          ))
        ) : (
          <li className="site00-ptech-empty-inline">NO MILESTONES DEFINED</li>
        )}
      </ul>
    </div>
  );
}

export function ProjectTechnicalReadinessPanel({ intelligence }: PanelProps) {
  const r = intelligence.readinessAssessment;
  return (
    <div className="site00-ptech-panel">
      <section className="site00-ptech-readiness-hero">
        <p className="site00-ptech-readiness-hero__label">{r.overall.replace(/_/g, ' ')}</p>
        {r.overallPercent != null ? <p className="site00-ptech-readiness-hero__pct">{r.overallPercent}%</p> : null}
        {r.blockerCount ? <p className="site00-ptech-readiness-hero__blockers">{r.blockerCount} BLOCKERS</p> : null}
      </section>
      <ul className="site00-ptech-readiness-list">
        {r.domains.map((d) => (
          <li key={d.domain}>
            <StatusDot status={d.status} />
            <span>{d.domain}</span>
            <span>{d.status.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ul>
      {r.blockers.length ? (
        <section className="site00-ptech-card site00-ptech-card--warn">
          <h2 className="site00-ptech-card__title">BLOCKERS</h2>
          <ul>{r.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        </section>
      ) : null}
    </div>
  );
}

export function ProjectTechnicalPanelRouter({
  tab,
  intelligence,
  onSync,
  syncing,
}: {
  tab: ProjectTechnicalTabId;
  intelligence: ProjectCodebaseIntelligence;
  onSync?: () => void;
  syncing?: boolean;
}) {
  const props = { intelligence, onSync, syncing };
  switch (tab) {
    case 'OVERVIEW':
      return <ProjectTechnicalOverviewPanel {...props} />;
    case 'CODEBASE':
      return <ProjectTechnicalCodebasePanel {...props} />;
    case 'DEPENDENCIES':
      return <ProjectTechnicalDependenciesPanel {...props} />;
    case 'DEPLOYMENTS':
      return <ProjectTechnicalDeploymentsPanel {...props} />;
    case 'ENVIRONMENTS':
      return <ProjectTechnicalEnvironmentsPanel {...props} />;
    case 'DIAGNOSTICS':
      return <ProjectTechnicalDiagnosticsPanel {...props} />;
    case 'NOTES':
      return <ProjectTechnicalNotesPanel {...props} />;
    case 'MILESTONES':
      return <ProjectTechnicalMilestonesPanel {...props} />;
    case 'READINESS':
      return <ProjectTechnicalReadinessPanel {...props} />;
    default:
      return <ProjectTechnicalOverviewPanel {...props} />;
  }
}

export const PROJECT_TECHNICAL_SUBNAV: Array<{ id: ProjectTechnicalTabId; label: string }> = [
  { id: 'OVERVIEW', label: 'OVERVIEW' },
  { id: 'CODEBASE', label: 'CODEBASE' },
  { id: 'DEPENDENCIES', label: 'DEPENDENCIES' },
  { id: 'DEPLOYMENTS', label: 'DEPLOYMENTS' },
  { id: 'ENVIRONMENTS', label: 'ENVIRONMENTS' },
  { id: 'DIAGNOSTICS', label: 'DIAGNOSTICS' },
  { id: 'NOTES', label: 'NOTES' },
  { id: 'MILESTONES', label: 'MILESTONES' },
  { id: 'READINESS', label: 'READINESS' },
];
