import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <h1 className="site00-admin-page-title">[ PROJECTS ]</h1>
      <p className="site00-admin-page-subtitle">WHAT ARE WE WORKING ON?</p>

      {error ? <p className="site00-admin-panel">{error.toUpperCase()}</p> : null}

      <table className="site00-admin-table">
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
              <td>
                {String(p.build_class)} {p.build_type ? `— ${String(p.build_type)}` : ''}
              </td>
              <td>{String(p.current_phase)}</td>
              <td>{String(p.project_health)}</td>
              <td>{String(p.payment_state)}</td>
              <td>{String(p.production_readiness_pct)}%</td>
              <td>
                <Link className="site00-admin-btn site00-admin-btn--primary" to={SITE00_ADMIN_ROUTES.project(String(p.id))}>
                  OPEN →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Site00AdminShell>
  );
}
