import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

function formatDateTime(iso?: string) {
  if (!iso) return '—';
  return new Date(iso)
    .toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    .toUpperCase();
}

type DiscoveryDetail = {
  booking: Record<string, unknown> & {
    id: string;
    contact_name: string;
    email: string;
    build_class?: string;
    status: string;
    scheduled_at: string;
    owner_email?: string;
    lead_id?: string;
    identity_id?: string;
    notes?: string;
  };
  lead: Record<string, unknown> | null;
  intake: Record<string, unknown> | null;
};

export default function DiscoveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DiscoveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    site00ProductionApi
      .discoveryDetail(id)
      .then((payload) => setData(payload as unknown as DiscoveryDetail))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD BOOKING'))
      .finally(() => setLoading(false));
  }, [id]);

  const booking = data?.booking;

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.discovery}>
            ← BACK TO DISCOVERY
          </Link>
          <h1 className="site00-admin-page-title">
            {loading ? '[ DISCOVERY ]' : `[ ${booking?.contact_name ?? 'BOOKING'} ]`}
          </h1>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading booking" />
      ) : booking ? (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">BOOKING DETAILS</h2>
            <dl className="site00-admin-dl">
              <dt>CONTACT</dt>
              <dd>{booking.contact_name}</dd>
              <dt>EMAIL</dt>
              <dd>{booking.email}</dd>
              <dt>BUILD CLASS</dt>
              <dd>{booking.build_class ?? '—'}</dd>
              <dt>STATUS</dt>
              <dd>
                <AdminStatusBadge status={booking.status} />
              </dd>
              <dt>SCHEDULED</dt>
              <dd>{formatDateTime(booking.scheduled_at)}</dd>
              <dt>OWNER</dt>
              <dd>{booking.owner_email ?? '—'}</dd>
              {booking.notes ? (
                <>
                  <dt>NOTES</dt>
                  <dd>{booking.notes}</dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">LINKED LEAD</h2>
            {data?.lead ? (
              <dl className="site00-admin-dl">
                <dt>LEAD</dt>
                <dd>
                  <Link to={SITE00_ADMIN_ROUTES.lead(String(data.lead.id))}>
                    {String(data.lead.contact_name)} — {String(data.lead.email)}
                  </Link>
                </dd>
                <dt>STATUS</dt>
                <dd>
                  <AdminStatusBadge status={String(data.lead.status ?? 'NEW')} />
                </dd>
              </dl>
            ) : (
              <p className="site00-admin-empty">NO LINKED LEAD.</p>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">LINKED INTAKE</h2>
            {data?.intake ? (
              <p>
                <Link to={SITE00_ADMIN_ROUTES.bldrIntake(String(data.intake.id))}>
                  {String(data.intake.build_class)} — {String(data.intake.primary_type ?? 'INTAKE')}
                </Link>
              </p>
            ) : (
              <p className="site00-admin-empty">NO LINKED INTAKE.</p>
            )}
            {booking.identity_id ? (
              <p>
                IDENTITY:{' '}
                <Link to={SITE00_ADMIN_ROUTES.identity(String(booking.identity_id))}>VIEW IDENTITY →</Link>
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
