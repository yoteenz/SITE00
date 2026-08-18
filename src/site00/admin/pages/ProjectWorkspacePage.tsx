import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { StudioPipelineBar } from '../components/StudioPipelineBar';
import { PROJECT_WORKSPACE_TABS } from '../config/nav';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import { site00ProductionApi } from '../services/productionApi';
import type { Site00ProjectWorkspacePayload } from '../types/production';

export default function Site00AdminProjectWorkspacePage() {
  const { projectId = '' } = useParams();
  const { pathname } = useLocation();
  const section = pathname.split('/').pop() ?? 'overview';
  const apiSection = ['intelligence', 'studio', 'approvals', 'deliverables', 'access', 'activity'].includes(section)
    ? section
    : 'overview';

  const [data, setData] = useState<Site00ProjectWorkspacePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    site00ProductionApi
      .project(projectId, apiSection)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD PROJECT'));
  }, [projectId, apiSection]);

  const project = data?.project;
  const summary = data?.studioSummary;

  return (
    <Site00AdminShell>
      <h1 className="site00-admin-page-title">{String(project?.name ?? 'PROJECT')}</h1>
      <p className="site00-admin-page-subtitle">
        {String(project?.build_class ?? '')} · {String(project?.current_phase ?? '')} · {String(project?.project_health ?? '')}
      </p>

      <nav className="site00-admin-project-tabs" aria-label="Project workspace tabs">
        {PROJECT_WORKSPACE_TABS.map((tab) => {
          const href =
            tab.id === 'overview'
              ? SITE00_ADMIN_ROUTES.project(projectId)
              : `${SITE00_ADMIN_ROUTES.project(projectId)}${tab.suffix}`;
          const active = pathname === href || (tab.id !== 'overview' && pathname.endsWith(tab.suffix));
          return (
            <Link key={tab.id} to={href} className={active ? 'active' : ''}>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {error ? <p className="site00-admin-panel">{error.toUpperCase()}</p> : null}

      {(apiSection === 'overview' || apiSection === 'studio') && (
        <>
          <StudioPipelineBar pipeline={undefined} />
          {summary ? (
            <section className="site00-admin-panel">
              <h2 className="site00-admin-panel__title">STUDIO SUMMARY — {summary.complete} OF {summary.total} DELIVERABLES COMPLETE</h2>
              <p>
                COMPLETE: {summary.complete} · IN PROGRESS: {summary.inProgress} · QUEUED: {summary.queued} · BLOCKED:{' '}
                {summary.blocked}
              </p>
            </section>
          ) : null}
        </>
      )}

      {apiSection === 'overview' && (
        <div className="site00-admin-grid site00-admin-grid--2">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">NEXT BEST ACTION</h2>
            {(data?.nextActions ?? [])?.map((a, i) => (
              <div key={i} className="site00-admin-action-row">
                <div>
                  <p className="site00-admin-action-row__title">{a.title}</p>
                  <p className="site00-admin-action-row__reason">{a.reason}</p>
                </div>
                <Link className="site00-admin-btn" to={a.destination}>
                  GO →
                </Link>
              </div>
            ))}
          </section>
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">RECENT ACTIVITY</h2>
            {(data?.activity ?? [])?.slice(0, 5).map((ev, i) => (
              <p key={i}>{ev.summary}</p>
            ))}
          </section>
        </div>
      )}

      {apiSection === 'intelligence' && (
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">PROJECT INTELLIGENCE</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 10 }}>{JSON.stringify(data?.intelligence, null, 2)}</pre>
        </section>
      )}

      {apiSection === 'deliverables' && (
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">DELIVERABLE MAP</h2>
          {(data?.deliverables ?? [])?.map((d) => (
            <p key={d.title}>
              [{d.category}] {d.title} — {d.status}
            </p>
          ))}
        </section>
      )}

      {apiSection === 'access' && (
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">[ ACCESS ] INFRASTRUCTURE & PERMISSIONS</h2>
          <p className="site00-admin-page-subtitle">
            CURRENT PHASE READINESS: {data?.environmentReadiness?.current_phase_readiness_pct ?? String(project?.environment_readiness_pct ?? 0)}%
            · {data?.environmentReadiness?.current_phase_ready_count ?? 0} OF{' '}
            {data?.environmentReadiness?.current_phase_required_count ?? 0} REQUIRED NOW
          </p>
          {(data?.access ?? [])?.map((row, i) => {
            const svc = row.site00_service_catalog;
            const name = row.display_name ?? svc?.display_name ?? 'SERVICE';
            return (
              <div key={i} className="site00-admin-action-row site00-admin-access-row">
                <div>
                  <p className="site00-admin-action-row__title">{name}</p>
                  <p className="site00-admin-action-row__reason">
                    {String(row.effective_state ?? '—').replace(/_/g, ' ')} · PHASE:{' '}
                    {String(row.required_phase)} · {String(row.owner_type)} OWNED
                  </p>
                  <p className="site00-admin-action-row__reason">
                    CURRENTLY REQUIRED: {row.currently_required ? 'YES' : 'NO'}
                  </p>
                  <p className="site00-admin-action-row__reason">
                    BLOCKS: {row.blocks_label ?? (row.blocks?.length ? row.blocks.join(', ') : 'NOTHING YET')}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {apiSection === 'approvals' && (
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">PROJECT APPROVALS</h2>
          {(data?.approvals ?? [])?.map((a) => (
            <p key={a.title}>
              {a.title} · {a.category} · {a.status}
            </p>
          ))}
        </section>
      )}

      {apiSection === 'activity' && (
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">ACTIVITY LOG</h2>
          {(data?.activity ?? [])?.map((ev, i) => (
            <p key={i}>
              [{ev.actor_type}] {ev.summary}
            </p>
          ))}
        </section>
      )}
    </Site00AdminShell>
  );
}
