import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { StudioPipelineBar } from '../components/StudioPipelineBar';
import { PROJECT_WORKSPACE_TABS } from '../config/nav';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import { site00StudioPath } from '../../config/routes';
import { site00ProductionApi } from '../services/productionApi';
import type { Site00ProjectWorkspacePayload } from '../types/production';

function projectNumber(project: { id: string; metadata?: Record<string, unknown> | null }): string {
  const meta = project.metadata ?? {};
  if (typeof meta.project_number === 'string' && meta.project_number.trim()) {
    return meta.project_number.trim().toUpperCase();
  }
  return `00-${project.id.replace(/-/g, '').slice(0, 3).toUpperCase()}`;
}

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
  const slug = project?.slug ? String(project.slug) : '';

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / CONTROL"
        title="PROJECT MISSION CONTROL"
        subtitle={
          project
            ? `PROJECT ${projectNumber(project as { id: string; metadata?: Record<string, unknown> })} · ${String(project.name).toUpperCase()}`
            : undefined
        }
      />

      {project ? (
        <p className="site00-control-page-header__subtitle">
          {String(project.build_class ?? '')} · {String(project.current_phase ?? '')} · {String(project.project_health ?? '')}
        </p>
      ) : null}

      <div className="site00-control-mission-actions">
        {slug ? (
          <a href={site00StudioPath(slug)} target="_blank" rel="noopener noreferrer">
            VIEW AS CLIENT ↗
          </a>
        ) : null}
        <Link to={SITE00_ADMIN_ROUTES.projectApprovals(projectId)}>REVIEWS</Link>
        <Link to={SITE00_ADMIN_ROUTES.projectAccess(projectId)}>REQUEST INPUT</Link>
        <Link to={SITE00_ADMIN_ROUTES.projectActivity(projectId)}>ACTIVITY</Link>
      </div>

      <nav className="site00-admin-project-tabs" aria-label="PROJECT WORKSPACE TABS">
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
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">STUDIO SUMMARY — {summary.complete} OF {summary.total} DELIVERABLES COMPLETE</h2>
              <p className="site00-control-empty" style={{ textTransform: 'none' }}>
                COMPLETE: {summary.complete} · IN PROGRESS: {summary.inProgress} · QUEUED: {summary.queued} · BLOCKED: {summary.blocked}
              </p>
            </section>
          ) : null}
        </>
      )}

      {apiSection === 'overview' && (
        <div className="site00-admin-grid site00-admin-grid--2">
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">NEXT BEST ACTION</h2>
            {(data?.nextActions ?? [])?.map((a, i) => (
              <div key={i} className="site00-admin-action-row">
                <div>
                  <p className="site00-admin-action-row__title">{a.title}</p>
                  <p className="site00-admin-action-row__reason">{a.reason}</p>
                </div>
                <Link className="site00-control-cta" to={a.destination}>GO →</Link>
              </div>
            ))}
            {(data?.nextActions ?? []).length === 0 ? <p className="site00-control-empty">NO PENDING OPERATOR ACTIONS</p> : null}
          </section>
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">RECENT ACTIVITY</h2>
            {(data?.activity ?? [])?.slice(0, 5).map((ev, i) => (
              <p key={i} className="site00-control-empty" style={{ textTransform: 'none' }}>{ev.summary}</p>
            ))}
            {(data?.activity ?? []).length === 0 ? <p className="site00-control-empty">NO ACTIVITY YET</p> : null}
          </section>
        </div>
      )}

      {apiSection === 'intelligence' && (
        <section className="site00-control-panel">
          <h2 className="site00-control-panel__title">PROJECT INTELLIGENCE</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 10, textTransform: 'none' }}>{JSON.stringify(data?.intelligence, null, 2)}</pre>
        </section>
      )}

      {apiSection === 'deliverables' && (
        <section className="site00-control-panel">
          <h2 className="site00-control-panel__title">DELIVERABLE MAP</h2>
          {(data?.deliverables ?? [])?.map((d) => (
            <p key={d.title} style={{ textTransform: 'none' }}>
              [{d.category}] {d.title} — {d.status}
            </p>
          ))}
        </section>
      )}

      {apiSection === 'access' && (
        <section className="site00-control-panel">
          <h2 className="site00-control-panel__title">ACCESS · INFRASTRUCTURE</h2>
          <p className="site00-control-empty" style={{ textTransform: 'none' }}>
            CURRENT PHASE READINESS: {data?.environmentReadiness?.current_phase_readiness_pct ?? String(project?.environment_readiness_pct ?? 0)}%
          </p>
          {(data?.access ?? [])?.map((row, i) => {
            const svc = row.site00_service_catalog;
            const name = row.display_name ?? svc?.display_name ?? 'SERVICE';
            return (
              <div key={i} className="site00-admin-action-row site00-admin-access-row">
                <div>
                  <p className="site00-admin-action-row__title">{name}</p>
                  <p className="site00-admin-action-row__reason" style={{ textTransform: 'none' }}>
                    {String(row.effective_state ?? '—').replace(/_/g, ' ')} · {String(row.required_phase)}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {apiSection === 'approvals' && (
        <section className="site00-control-panel">
          <h2 className="site00-control-panel__title">INTERNAL / CLIENT REVIEWS</h2>
          {(data?.approvals ?? [])?.map((a) => (
            <p key={a.title} style={{ textTransform: 'none' }}>
              {a.title} · {a.category} · {a.status}
            </p>
          ))}
          {(data?.approvals ?? []).length === 0 ? <p className="site00-control-empty">NO REVIEWS IN QUEUE</p> : null}
        </section>
      )}

      {apiSection === 'activity' && (
        <section className="site00-control-panel">
          <h2 className="site00-control-panel__title">ACTIVITY LEDGER</h2>
          {(data?.activity ?? [])?.map((ev, i) => (
            <p key={i} style={{ textTransform: 'none' }}>[{ev.actor_type}] {ev.summary}</p>
          ))}
        </section>
      )}
    </Site00AdminShell>
  );
}
