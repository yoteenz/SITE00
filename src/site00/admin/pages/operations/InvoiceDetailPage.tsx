import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

function formatCurrency(n?: number) {
  if (n == null) return '—';
  return `$${Number(n).toLocaleString()}`;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

type LineItem = { label: string; amount: number };

type InvoiceDetail = {
  invoice: Record<string, unknown> & {
    id: string;
    invoice_number: string;
    client_name: string;
    client_email?: string;
    amount: number;
    tax_amount?: number;
    status: string;
    due_date?: string;
    paid_at?: string;
    line_items?: LineItem[];
    site00_projects?: { id: string; name: string; slug: string } | null;
    site00_identities?: { id: string; display_name?: string; email: string } | null;
  };
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    site00ProductionApi
      .invoice(id)
      .then((payload) => setData(payload as unknown as InvoiceDetail))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD INVOICE'))
      .finally(() => setLoading(false));
  }, [id]);

  const invoice = data?.invoice;
  const lineItems = (invoice?.line_items ?? []) as LineItem[];

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.finance}>
            ← BACK TO FINANCE
          </Link>
          <h1 className="site00-admin-page-title">
            {loading ? '[ INVOICE ]' : `[ ${invoice?.invoice_number ?? 'INVOICE'} ]`}
          </h1>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading invoice" />
      ) : invoice ? (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">SUMMARY</h2>
            <dl className="site00-admin-dl">
              <dt>STATUS</dt>
              <dd>
                <AdminStatusBadge status={invoice.status} />
              </dd>
              <dt>CLIENT</dt>
              <dd>{invoice.client_name}</dd>
              <dt>EMAIL</dt>
              <dd>{invoice.client_email ?? '—'}</dd>
              <dt>AMOUNT</dt>
              <dd>{formatCurrency(Number(invoice.amount))}</dd>
              {invoice.tax_amount != null ? (
                <>
                  <dt>TAX</dt>
                  <dd>{formatCurrency(Number(invoice.tax_amount))}</dd>
                </>
              ) : null}
              <dt>DUE DATE</dt>
              <dd>{formatDate(invoice.due_date)}</dd>
              {invoice.paid_at ? (
                <>
                  <dt>PAID</dt>
                  <dd>{formatDate(invoice.paid_at)}</dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">LINE ITEMS</h2>
            {lineItems.length === 0 ? (
              <p className="site00-admin-empty">NO LINE ITEMS.</p>
            ) : (
              <div className="site00-admin-table-wrap">
                <table className="site00-admin-table">
                  <thead>
                    <tr>
                      <th>DESCRIPTION</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={i}>
                        <td>{item.label}</td>
                        <td>{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">LINKS</h2>
            {invoice.site00_projects ? (
              <p>
                PROJECT:{' '}
                <Link to={SITE00_ADMIN_ROUTES.project(invoice.site00_projects.id)}>{invoice.site00_projects.name}</Link>
              </p>
            ) : (
              <p className="site00-admin-empty">NO LINKED PROJECT.</p>
            )}
            {invoice.site00_identities ? (
              <p>
                CLIENT:{' '}
                <Link to={SITE00_ADMIN_ROUTES.identity(invoice.site00_identities.id)}>
                  {invoice.site00_identities.display_name ?? invoice.site00_identities.email}
                </Link>
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
