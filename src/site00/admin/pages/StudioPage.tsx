import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { StudioPipelineBar } from '../components/StudioPipelineBar';
import { ReadinessPanel } from '../components/ReadinessPanel';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import { site00ProductionApi } from '../services/productionApi';
import type { Site00StudioPayload } from '../types/production';

export default function Site00AdminStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Site00StudioPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectId = searchParams.get('projectId') ?? undefined;

  useEffect(() => {
    site00ProductionApi
      .studio(projectId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD STUDIO'));
  }, [projectId]);

  const project = data?.project ?? undefined;
  const projects = data?.projects ?? [];

  return (
    <Site00AdminShell approvalBadge={undefined}>
      <h1 className="site00-admin-page-title">[ STUDIO ]</h1>
      <p className="site00-admin-page-subtitle">FROM BRIEF TO BUILD. · AI PRODUCTION DIRECTOR</p>

      {error ? <p className="site00-admin-panel">{error.toUpperCase()}</p> : null}

      <div className="site00-admin-select-row">
        <label>
          PROJECT
          <select
            value={project?.id ?? ''}
            onChange={(e) => {
              const id = e.target.value;
              if (id) setSearchParams({ projectId: id });
              else setSearchParams({});
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          PHASE
          <select value={project?.current_phase ?? ''} disabled>
            <option>{project?.current_phase ?? '—'}</option>
          </select>
        </label>
        <div className="site00-admin-health">
          <span className="site00-admin-health__dot" />
          PROJECT HEALTH: {project?.project_health ?? '—'}
        </div>
        <div>PRODUCTION READINESS: {project?.production_readiness_pct ?? 0}%</div>
        <div>ENVIRONMENT (CURRENT PHASE): {data?.environmentReadiness?.current_phase_readiness_pct ?? project?.environment_readiness_pct ?? 0}%</div>
      </div>

      <StudioPipelineBar pipeline={data?.pipeline ?? undefined} />

      <div className="site00-admin-grid site00-admin-grid--2">
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">PROJECT INTELLIGENCE</h2>
          {data?.intelligence ? (
            <ul>
              <li>BUILD CLASS: {String(data.intelligence.build_class ?? '—')}</li>
              <li>INDUSTRY: {String(data.intelligence.industry ?? '—')}</li>
              <li>BRAND MATURITY: {String(data.intelligence.brand_maturity ?? '—')}</li>
            </ul>
          ) : (
            <p>INTELLIGENCE NOT GENERATED.</p>
          )}
          {project ? (
            <Link className="site00-admin-btn" to={SITE00_ADMIN_ROUTES.projectIntelligence(project.id)}>
              EDIT INTELLIGENCE →
            </Link>
          ) : null}
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">DELIVERABLE MAP</h2>
          {Object.entries(data?.deliverableMap ?? {}).map(([cat, stats]) => (
            <p key={cat}>
              {cat}: {stats.complete}/{stats.total}
            </p>
          ))}
        </section>

        <section className="site00-admin-panel site00-admin-panel--wide">
          <h2 className="site00-admin-panel__title">PRODUCTION QUEUE · READINESS</h2>
          {(data?.deliverables ?? [])
            .filter((d) =>
              ['QUEUED', 'GENERATING', 'READY', 'BRIEF_GENERATED', 'NOT_READY', 'BLOCKED'].includes(d.status) ||
              d.readiness?.overall === 'blocked' ||
              d.readiness?.overall === 'ready',
            )
            .slice(0, 6)
            .map((d) => (
              <ReadinessPanel
                key={d.id ?? d.title}
                title={d.title}
                readiness={d.readiness ?? null}
                actionHref={
                  project && d.readiness?.overall === 'ready'
                    ? SITE00_ADMIN_ROUTES.projectStudio(project.id)
                    : project && d.readiness?.blockers[0]?.action_route
                      ? d.readiness.blockers[0].action_route
                      : undefined
                }
                actionLabel={
                  d.readiness?.blockers[0]?.action_type === 'REQUEST_ACCESS' ? 'REQUEST ACCESS →' : 'GENERATE BRIEF →'
                }
              />
            ))}
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">ACTIVE GENERATIONS</h2>
          {(data?.jobs ?? [])?.map(
            (job, i) => (
              <div key={i}>
                <p>{job.metadata?.label ?? 'GENERATION JOB'} · {job.variants_requested} VARIANTS · {job.progress_pct}%</p>
                <div className="site00-admin-progress">
                  <div className="site00-admin-progress__fill" style={{ width: `${job.progress_pct}%` }} />
                </div>
              </div>
            ),
          )}
        </section>
      </div>

      <section className="site00-admin-panel">
        <h2 className="site00-admin-panel__title">AI DIRECTOR INSIGHTS</h2>
        {(data?.insights ?? [])?.map(
          (insight, i) => (
            <div key={i} className="site00-admin-action-row">
              <div>
                <p className={`site00-admin-priority--${insight.priority}`}>{insight.priority}</p>
                <p className="site00-admin-action-row__title">{insight.what}</p>
                <p className="site00-admin-action-row__reason">{insight.why}</p>
              </div>
              <span className="site00-admin-btn">{insight.action} →</span>
            </div>
          ),
        )}
      </section>
    </Site00AdminShell>
  );
}
