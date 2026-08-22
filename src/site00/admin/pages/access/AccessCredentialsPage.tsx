import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00AccessCredentialsAdminApi, type Site00AccessCredentialAdmin } from '../../../services/accessCredentialApi';
import { buildAccessCredentialPublicUrl, formatAccessCredentialCodeDisplay } from '../../../config/access-credentials';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export default function AccessCredentialsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Site00AccessCredentialAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    recipientName: '',
    recipientCompany: '',
    recipientEmail: '',
    notes: '',
    activate: true,
  });

  const load = () => {
    setLoading(true);
    site00AccessCredentialsAdminApi
      .list()
      .then((data) => setItems(data.items ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD CREDENTIALS'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const { credential } = await site00AccessCredentialsAdminApi.create({
        credentialType: 'FOUNDER_ACCESS',
        recipientName: form.recipientName || undefined,
        recipientCompany: form.recipientCompany || undefined,
        recipientEmail: form.recipientEmail || undefined,
        notes: form.notes || undefined,
        activate: form.activate,
      });
      setForm({ recipientName: '', recipientCompany: '', recipientEmail: '', notes: '', activate: true });
      navigate(SITE00_ADMIN_ROUTES.accessCredential(credential.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'FAILED TO CREATE CREDENTIAL');
    } finally {
      setCreating(false);
    }
  };

  const copyUrl = async (code: string) => {
    try {
      await navigator.clipboard.writeText(buildAccessCredentialPublicUrl(code));
    } catch {
      /* ignore */
    }
  };

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ FOUNDER ACCESS ]</h1>
          <p className="site00-admin-page-subtitle">PHYSICAL-TO-DIGITAL ACCESS CREDENTIALS.</p>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      <section className="site00-admin-panel">
        <h2 className="site00-admin-panel__title">CREATE CREDENTIAL</h2>
        <div className="site00-admin-access-form">
          <label>
            RECIPIENT NAME
            <input value={form.recipientName} onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))} />
          </label>
          <label>
            COMPANY
            <input value={form.recipientCompany} onChange={(e) => setForm((f) => ({ ...f, recipientCompany: e.target.value }))} />
          </label>
          <label>
            EMAIL
            <input type="email" value={form.recipientEmail} onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))} />
          </label>
          <label className="site00-admin-access-form__full">
            NOTES
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          </label>
          <label className="site00-admin-access-form__full">
            <span>
              <input
                type="checkbox"
                checked={form.activate}
                onChange={(e) => setForm((f) => ({ ...f, activate: e.target.checked }))}
              />{' '}
              ACTIVATE IMMEDIATELY
            </span>
          </label>
        </div>
        <button type="button" className="site00-admin-btn site00-admin-btn--primary" onClick={() => void onCreate()} disabled={creating}>
          {creating ? 'CREATING…' : 'CREATE CREDENTIAL'}
        </button>
      </section>

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="LOADING CREDENTIALS" />
      ) : (
        <section className="site00-admin-panel">
          <AdminTable
            rows={items}
            emptyMessage="NO ACCESS CREDENTIALS YET."
            onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.accessCredential(row.id))}
            columns={[
              {
                key: 'code',
                header: 'CREDENTIAL',
                render: (row) => formatAccessCredentialCodeDisplay(row.credential_code),
              },
              { key: 'type', header: 'TYPE', render: (row) => row.credential_type.replace(/_/g, ' '), hideMobile: true },
              {
                key: 'status',
                header: 'STATUS',
                render: (row) => <AdminStatusBadge status={row.status} />,
              },
              { key: 'recipient', header: 'RECIPIENT', render: (row) => row.recipient_name ?? '—' },
              { key: 'scans', header: 'SCANS', render: (row) => String(row.scan_count ?? 0) },
              {
                key: 'last',
                header: 'LAST SCANNED',
                render: (row) => formatDate(row.last_scanned_at),
                hideMobile: true,
              },
              {
                key: 'user',
                header: 'LINKED USER',
                render: (row) => (row.assigned_user_id ? 'LINKED' : '—'),
                hideMobile: true,
              },
              {
                key: 'actions',
                header: 'URL',
                render: (row) => (
                  <button
                    type="button"
                    className="site00-admin-link-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyUrl(row.credential_code);
                    }}
                  >
                    COPY
                  </button>
                ),
                hideMobile: true,
              },
            ]}
          />
        </section>
      )}
    </Site00AdminShell>
  );
}
