import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminLead } from '../../types/operations';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function formatCurrency(n?: number) {
  if (n == null) return '—';
  return `$${n.toLocaleString()}`;
}

type LeadDetail = {
  lead: AdminLead & { bldr_intake_id?: string; identity_id?: string; idnty_state?: string };
  intake: Record<string, unknown> | null;
  identity: Record<string, unknown> | null;
  discovery: Array<Record<string, unknown>>;
  notes: Array<Record<string, unknown>>;
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    site00ProductionApi
      .lead(id)
      .then((payload) => setData(payload as unknown as LeadDetail))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD LEAD'))
      .finally(() => setLoading(false));
  }, [id]);

  const lead = data?.lead;

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.leads}>
            ← BACK TO LEADS
          </Link>
          <h1 className="site00-admin-page-title">
            {loading ? '[ LEAD ]' : `[ ${lead?.contact_name ?? 'LEAD'} ]`}
          </h1>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading lead" />
      ) : lead ? (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">CONTACT</h2>
            <dl className="site00-admin-dl">
              <dt>NAME</dt>
              <dd>{lead.contact_name}</dd>
              <dt>EMAIL</dt>
              <dd>{lead.email}</dd>
              <dt>STATUS</dt>
              <dd>
                <AdminStatusBadge status={lead.status} />
              </dd>
              <dt>BUILD CLASS</dt>
              <dd>{lead.build_class ?? '—'}</dd>
              <dt>BUDGET</dt>
              <dd>{lead.budget_range ?? '—'}</dd>
              <dt>EST. VALUE</dt>
              <dd>{formatCurrency(lead.estimated_value ?? undefined)}</dd>
              <dt>CREATED</dt>
              <dd>{formatDate(lead.created_at)}</dd>
              {lead.last_contact_at ? (
                <>
                  <dt>LAST CONTACT</dt>
                  <dd>{formatDate(lead.last_contact_at)}</dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">SOURCE</h2>
            <dl className="site00-admin-dl">
              <dt>SOURCE</dt>
              <dd>{lead.source}</dd>
              {lead.idnty_state ? (
                <>
                  <dt>IDNTY STATE</dt>
                  <dd>{lead.idnty_state}</dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">LINKED ENTITIES</h2>
            {data?.intake ? (
              <p>
                BLDR INTAKE:{' '}
                <Link to={SITE00_ADMIN_ROUTES.bldrIntake(String(data.intake.id))}>
                  {String(data.intake.build_class)} — {String(data.intake.primary_type ?? 'INTAKE')}
                </Link>
              </p>
            ) : (
              <p className="site00-admin-empty">NO LINKED INTAKE.</p>
            )}
            {data?.identity ? (
              <p>
                IDENTITY:{' '}
                <Link to={SITE00_ADMIN_ROUTES.identity(String(data.identity.id))}>
                  {String(data.identity.display_name ?? data.identity.email)}
                </Link>
              </p>
            ) : (
              <p className="site00-admin-empty">NO LINKED IDENTITY.</p>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">DISCOVERY</h2>
            {(data?.discovery ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO DISCOVERY BOOKINGS.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.discovery ?? []).map((booking) => (
                  <li key={String(booking.id)} className="site00-admin-activity-list__item">
                    <Link to={SITE00_ADMIN_ROUTES.discoveryBooking(String(booking.id))}>
                      {formatDate(String(booking.scheduled_at))}
                    </Link>
                    <AdminStatusBadge status={String(booking.status ?? 'UPCOMING')} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
