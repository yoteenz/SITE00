import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import { site00ProductionApi } from '../services/productionApi';
import type { Site00ApprovalsPayload } from '../types/production';

const FILTERS = ['ALL', 'STRATEGY', 'IDENTITY', 'DESIGN', 'COPY', 'CONTENT', 'BUILD'] as const;

export default function Site00AdminApprovalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'ALL';
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .approvals(category)
      .then((data: Site00ApprovalsPayload) => {
        setItems(data.items as Array<Record<string, unknown>>);
        setTotal(data.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD APPROVALS'));
  }, [category]);

  return (
    <Site00AdminShell approvalBadge={total || undefined}>
      <h1 className="site00-admin-page-title">[ APPROVALS ]</h1>
      <p className="site00-admin-page-subtitle">WHAT NEEDS YOUR DECISION. · {total} ITEMS WAITING</p>

      {error ? <p className="site00-admin-panel">{error.toUpperCase()}</p> : null}

      <div className="site00-admin-project-tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={category === f ? 'active' : ''}
            onClick={() => setSearchParams(f === 'ALL' ? {} : { category: f })}
          >
            {f}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <section className="site00-admin-panel">
          <p>NO APPROVALS WAITING — EVERYTHING IS CAUGHT UP.</p>
        </section>
      ) : (
        <table className="site00-admin-table">
          <thead>
            <tr>
              <th>ITEM</th>
              <th>PROJECT</th>
              <th>TYPE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const project = item.site00_projects as { name: string; slug: string; id?: string } | undefined;
              return (
                <tr key={String(item.id)}>
                  <td>{String(item.title)}</td>
                  <td>{project?.name ?? '—'}</td>
                  <td>{String(item.category)}</td>
                  <td className={`site00-admin-priority--${String(item.priority)}`}>{String(item.priority)}</td>
                  <td>{String(item.status)}</td>
                  <td>
                    {project?.id ? (
                      <Link className="site00-admin-btn site00-admin-btn--primary" to={SITE00_ADMIN_ROUTES.projectApprovals(project.id)}>
                        REVIEW →
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Site00AdminShell>
  );
}
