import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { AccessCredentialQr } from '../../components/access/AccessCredentialQr';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00AccessCredentialsAdminApi, type Site00AccessCredentialAdmin } from '../../../services/accessCredentialApi';
import {
  buildAccessCredentialPublicPath,
  buildAccessCredentialPublicUrl,
  formatAccessCredentialCodeDisplay,
} from '../../../config/access-credentials';

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }).toUpperCase();
}

export default function AccessCredentialDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [credential, setCredential] = useState<Site00AccessCredentialAdmin | null>(null);
  const [events, setEvents] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    site00AccessCredentialsAdminApi
      .detail(id)
      .then((data) => {
        setCredential(data.credential);
        setEvents(data.events ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD CREDENTIAL'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const runAction = async (action: 'activate' | 'revoke' | 'deactivate') => {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const fn =
        action === 'activate'
          ? site00AccessCredentialsAdminApi.activate
          : action === 'revoke'
            ? site00AccessCredentialsAdminApi.revoke
            : site00AccessCredentialsAdminApi.deactivate;
      const { credential: next } = await fn(id);
      setCredential(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ACTION FAILED');
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async () => {
    if (!credential) return;
    try {
      await navigator.clipboard.writeText(buildAccessCredentialPublicUrl(credential.credential_code));
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <Site00AdminShell>
        <div className="site00-admin-skeleton-grid" aria-busy="true" />
      </Site00AdminShell>
    );
  }

  if (!credential) {
    return (
      <Site00AdminShell>
        <p className="site00-admin-panel site00-admin-panel--error">{error ?? 'CREDENTIAL NOT FOUND'}</p>
        <Link to={SITE00_ADMIN_ROUTES.accessCredentials}>← BACK TO ACCESS CREDENTIALS</Link>
      </Site00AdminShell>
    );
  }

  const publicUrl = buildAccessCredentialPublicUrl(credential.credential_code);
  const publicPath = buildAccessCredentialPublicPath(credential.credential_code);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <p className="site00-admin-meta">
            <Link to={SITE00_ADMIN_ROUTES.accessCredentials}>← ACCESS CREDENTIALS</Link>
          </p>
          <h1 className="site00-admin-page-title">{formatAccessCredentialCodeDisplay(credential.credential_code)}</h1>
          <p className="site00-admin-page-subtitle">FOUNDER ACCESS CREDENTIAL</p>
        </div>
        <AdminStatusBadge status={credential.status} />
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      <div className="site00-admin-detail-grid">
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">PUBLIC URL</h2>
          <p className="site00-admin-mono">{publicUrl}</p>
          <p className="site00-admin-meta">PATH: {publicPath}</p>
          <div className="site00-admin-actions-row">
            <button type="button" className="site00-admin-btn" onClick={() => void copyUrl()}>
              COPY URL
            </button>
            <a href={publicPath} target="_blank" rel="noreferrer" className="site00-admin-btn">
              OPEN
            </a>
          </div>
        </section>

        <section className="site00-admin-panel site00-admin-panel--center">
          <AccessCredentialQr url={publicUrl} label="PRINT QR" />
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">DETAILS</h2>
          <dl className="site00-admin-dl">
            <dt>TYPE</dt>
            <dd>{credential.credential_type.replace(/_/g, ' ')}</dd>
            <dt>ISSUED</dt>
            <dd>{formatDateTime(credential.issued_at)}</dd>
            <dt>FIRST SCAN</dt>
            <dd>{formatDateTime(credential.first_scanned_at)}</dd>
            <dt>LAST SCAN</dt>
            <dd>{formatDateTime(credential.last_scanned_at)}</dd>
            <dt>SCAN COUNT</dt>
            <dd>{credential.scan_count}</dd>
            <dt>RECIPIENT</dt>
            <dd>{credential.recipient_name ?? '—'}</dd>
            <dt>COMPANY</dt>
            <dd>{credential.recipient_company ?? '—'}</dd>
            <dt>EMAIL</dt>
            <dd>{credential.recipient_email ?? '—'}</dd>
            <dt>LINKED USER</dt>
            <dd>{credential.assigned_user_id ?? '—'}</dd>
          </dl>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">PRIVATE NOTES</h2>
          <p>{credential.notes?.trim() || '—'}</p>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">ACTIONS</h2>
          <div className="site00-admin-actions-row">
            {credential.status !== 'ACTIVE' ? (
              <button type="button" className="site00-admin-btn site00-admin-btn--primary" disabled={busy} onClick={() => void runAction('activate')}>
                ACTIVATE
              </button>
            ) : null}
            {credential.status === 'ACTIVE' ? (
              <button type="button" className="site00-admin-btn" disabled={busy} onClick={() => void runAction('deactivate')}>
                DEACTIVATE
              </button>
            ) : null}
            {credential.status !== 'REVOKED' ? (
              <button type="button" className="site00-admin-btn site00-admin-btn--danger" disabled={busy} onClick={() => void runAction('revoke')}>
                REVOKE
              </button>
            ) : null}
          </div>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">RECENT EVENTS</h2>
          {events.length === 0 ? (
            <p className="site00-admin-meta">NO EVENTS RECORDED.</p>
          ) : (
            <ul className="site00-admin-event-list">
              {(events as Array<{ event_type: string; created_at: string }>).map((ev, i) => (
                <li key={i}>
                  <span>{ev.event_type}</span>
                  <span>{formatDateTime(ev.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Site00AdminShell>
  );
}
