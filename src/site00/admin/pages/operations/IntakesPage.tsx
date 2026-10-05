/**
 * SITE 00 Admin — canonical Identity + Builder Intake Inbox.
 * Operational surface over site00_idnty_submissions + site00_bldr_intakes (via
 * api/admin/site00-intakes.ts) — see docs/site00/intake persistence infrastructure sprint.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00AdminIntakesApi } from '../../services/intakesApi';
import type { IntakeSummary, IntakeType } from '../../../../../shared/site00-intakes/types';

const TYPE_FILTERS: Array<{ id: IntakeType | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'ALL' },
  { id: 'IDENTITY', label: 'IDENTITY' },
  { id: 'BUILDER', label: 'BUILDER' },
];

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'CONVERTED', 'ARCHIVED'] as const;
const OWNER_FILTERS = ['ALL', 'AUTHENTICATED', 'GUEST'] as const;
const SORTS = [
  { id: 'newest', label: 'NEWEST' },
  { id: 'oldest', label: 'OLDEST' },
  { id: 'recently_updated', label: 'RECENTLY UPDATED' },
  { id: 'recently_submitted', label: 'RECENTLY SUBMITTED' },
] as const;

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export default function IntakesPage() {
  const navigate = useNavigate();
  const [intakeType, setIntakeType] = useState<IntakeType | 'ALL'>('ALL');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [ownerKind, setOwnerKind] = useState<(typeof OWNER_FILTERS)[number]>('ALL');
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('newest');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<IntakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    site00AdminIntakesApi
      .list({
        intakeType: intakeType === 'ALL' ? undefined : intakeType,
        status: status === 'ALL' ? undefined : status,
        ownerKind: ownerKind === 'ALL' ? undefined : ownerKind,
        sort,
        search: search.trim() || undefined,
      })
      .then((data) => {
        if (!cancelled) setItems(data.intakes ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'FAILED TO LOAD INTAKES');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [intakeType, status, ownerKind, sort, search]);

  const rows = useMemo(() => items, [items]);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ INTAKES ]</h1>
          <p className="site00-admin-page-subtitle">
            CANONICAL IDENTITY + BUILDER INTAKE INBOX — DRAFT, SUBMITTED, IN REVIEW, CONVERTED, ARCHIVED.
          </p>
        </div>
      </header>

      <div className="site00-admin-intakes-filters">
        <div className="site00-admin-period">
          {TYPE_FILTERS.map((t) => (
            <button key={t.id} type="button" className={intakeType === t.id ? 'active' : undefined} onClick={() => setIntakeType(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="site00-admin-period">
          {STATUS_FILTERS.map((s) => (
            <button key={s} type="button" className={status === s ? 'active' : undefined} onClick={() => setStatus(s)}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="site00-admin-period">
          {OWNER_FILTERS.map((o) => (
            <button key={o} type="button" className={ownerKind === o ? 'active' : undefined} onClick={() => setOwnerKind(o)}>
              {o === 'ALL' ? 'ALL' : o === 'AUTHENTICATED' ? 'SIGNED-IN' : 'GUEST'}
            </button>
          ))}
        </div>
        <div className="site00-admin-intakes-toolbar">
          <input
            type="search"
            className="site00-admin-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH REFERENCE, EMAIL, PROJECT…"
            aria-label="Search intakes"
          />
          <select
            className="site00-admin-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof SORTS)[number]['id'])}
            aria-label="Sort intakes"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="LOADING INTAKES" />
      ) : (
        <section className="site00-admin-panel">
          <AdminTable
            rows={rows}
            emptyMessage="NO INTAKES MATCH THESE FILTERS."
            onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.intake(row.intakeType, row.id))}
            columns={[
              { key: 'reference', header: 'REFERENCE', render: (row) => row.publicReference },
              { key: 'type', header: 'TYPE', render: (row) => row.intakeType },
              { key: 'status', header: 'STATUS', render: (row) => <AdminStatusBadge status={row.status} /> },
              {
                key: 'owner',
                header: 'OWNER',
                render: (row) => (row.ownerKind === 'GUEST' ? 'GUEST' : 'SIGNED-IN'),
                hideMobile: true,
              },
              { key: 'email', header: 'EMAIL', render: (row) => row.email ?? '—', hideMobile: true },
              { key: 'created', header: 'CREATED', render: (row) => formatDate(row.createdAt), hideMobile: true },
              { key: 'saved', header: 'LAST SAVED', render: (row) => formatDate(row.lastSavedAt), hideMobile: true },
              { key: 'submitted', header: 'SUBMITTED', render: (row) => formatDate(row.submittedAt) },
            ]}
          />
        </section>
      )}
    </Site00AdminShell>
  );
}
