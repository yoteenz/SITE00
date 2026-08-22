import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import { site00ProductionApi } from '../services/productionApi';

export default function Site00AdminProjectsPage() {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .projects()
      .then((data) => setProjects(data.projects as Array<Record<string, unknown>>))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD PROJECTS'));
  }, []);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / CONTROL"
        title="PROJECTS / PIPELINE"
        subtitle="ALL ACTIVE ENGAGEMENTS"
      />

      {error ? <p className="site00-admin-panel">{error.toUpperCase()}</p> : null}

      {projects.length === 0 && !error ? (
        <p className="site00-control-empty">NO ACTIVE PROJECTS</p>
      ) : (
        <>
          <div className="site00-control-projects-desktop">
            <table className="site00-admin-table site00-control-table">
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>BUILD CLASS</th>
                  <th>PHASE</th>
                  <th>HEALTH</th>
                  <th>PAYMENT</th>
                  <th>READINESS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={String(p.id)}>
                    <td>{String(p.name)}</td>
                    <td>{String(p.build_class)} {p.build_type ? `— ${String(p.build_type)}` : ''}</td>
                    <td>{String(p.current_phase)}</td>
                    <td>{String(p.project_health)}</td>
                    <td>{String(p.payment_state)}</td>
                    <td>{String(p.production_readiness_pct)}%</td>
                    <td>
                      <Link className="site00-control-cta" to={SITE00_ADMIN_ROUTES.project(String(p.id))}>
                        MISSION CONTROL →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="site00-control-projects-mobile">
            {projects.map((p) => (
              <li key={String(p.id)} className="site00-control-project-card">
                <Link to={SITE00_ADMIN_ROUTES.project(String(p.id))} className="site00-control-project-card__link">
                  <p className="site00-control-project-card__name">{String(p.name)}</p>
                  <p className="site00-control-project-card__meta">
                    {String(p.build_class)} · {String(p.current_phase)} · {String(p.production_readiness_pct)}%
                  </p>
                  <span className="site00-control-cta">ENTER MISSION CONTROL →</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Site00AdminShell>
  );
}
