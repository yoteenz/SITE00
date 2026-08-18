import { useEffect, useState } from 'react';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { AdminKpiCard } from '../../components/operations/AdminKpiCard';
import { site00ProductionApi } from '../../services/productionApi';

type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: string;
  projectCount: number;
  status: string;
};

type TeamPayload = {
  members: TeamMember[];
  activeProjects: number;
};

export default function TeamPage() {
  const [data, setData] = useState<TeamPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .team()
      .then((payload) => setData(payload as unknown as TeamPayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD TEAM'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ TEAM ]</h1>
          <p className="site00-admin-page-subtitle">ADMIN TEAM AND PROJECT LOAD.</p>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading team" />
      ) : data ? (
        <>
          <section className="site00-admin-kpi-row">
            <AdminKpiCard label="TEAM MEMBERS" value={data.members.length} />
            <AdminKpiCard label="ACTIVE PROJECTS" value={data.activeProjects} />
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">MEMBERS</h2>
            {data.members.length === 0 ? (
              <p className="site00-admin-empty">NO TEAM MEMBERS CONFIGURED.</p>
            ) : (
              <div className="site00-admin-kpi-row">
                {data.members.map((member) => (
                  <article key={member.id} className="site00-admin-kpi">
                    <p className="site00-admin-kpi__label">{member.role}</p>
                    <p className="site00-admin-kpi__value">{member.name}</p>
                    <p className="site00-admin-kpi__delta site00-admin-kpi__delta--muted">{member.email}</p>
                    <p className="site00-admin-kpi__delta">
                      {member.projectCount} ACTIVE PROJECT{member.projectCount === 1 ? '' : 'S'}
                    </p>
                    <AdminStatusBadge status={member.status} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </Site00AdminShell>
  );
}
