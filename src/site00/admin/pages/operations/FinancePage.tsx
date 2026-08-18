import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { AdminKpiCard } from '../../components/operations/AdminKpiCard';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminInvoice } from '../../types/operations';

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

type FinancePayload = {
  invoices: AdminInvoice[];
  summary: { paid: number; outstanding: number; overdue: number; upcoming: number };
};

export default function FinancePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<FinancePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .finance()
      .then((payload) => setData(payload as unknown as FinancePayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD FINANCE'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ FINANCE ]</h1>
          <p className="site00-admin-page-subtitle">REVENUE AND INVOICE TRACKING.</p>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading finance" />
      ) : data ? (
        <>
          <section className="site00-admin-kpi-row">
            <AdminKpiCard label="PAID" value={formatCurrency(data.summary.paid)} />
            <AdminKpiCard label="OUTSTANDING" value={formatCurrency(data.summary.outstanding)} />
            <AdminKpiCard label="OVERDUE" value={formatCurrency(data.summary.overdue)} />
            <AdminKpiCard label="UPCOMING" value={formatCurrency(data.summary.upcoming)} />
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">INVOICES</h2>
            <AdminTable
              rows={data.invoices}
              emptyMessage="NO INVOICES FOUND."
              onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.invoice(row.id))}
              columns={[
                { key: 'number', header: 'INVOICE', render: (row) => row.invoice_number },
                { key: 'client', header: 'CLIENT', render: (row) => row.client_name },
                {
                  key: 'project',
                  header: 'PROJECT',
                  render: (row) => row.site00_projects?.name ?? '—',
                  hideMobile: true,
                },
                { key: 'amount', header: 'AMOUNT', render: (row) => formatCurrency(row.amount) },
                {
                  key: 'status',
                  header: 'STATUS',
                  render: (row) => <AdminStatusBadge status={row.status} />,
                },
                { key: 'due', header: 'DUE', render: (row) => formatDate(row.due_date ?? undefined), hideMobile: true },
              ]}
            />
          </section>
        </>
      ) : null}
    </Site00AdminShell>
  );
}
