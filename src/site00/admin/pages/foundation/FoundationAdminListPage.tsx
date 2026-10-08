import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';

type Row = {
  artifact_id: string;
  public_token: string;
  state: string;
  payment_state: string;
  created_at: string;
};

export default function FoundationAdminListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const res = await fetch('/api/admin/site00-foundation?action=list', { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Failed to load');
    setRows(json.artifacts ?? []);
  };

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const createLeadLink = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/site00-foundation', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-artifact',
          contact_email: 'prospect@example.com',
          referral_kind: 'DIRECT',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Create failed');
      await load();
      if (json.personalized_url) {
        window.prompt('Copy personalized link:', `${window.location.origin}${json.personalized_url}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="site00-admin-page">
      <header>
        <h1>Digital Foundation</h1>
        <p>Founder mini console — personalized artifact links.</p>
        <button type="button" disabled={creating} onClick={createLeadLink}>
          Create lead + link
        </button>
      </header>
      {error && <p>{error}</p>}
      <table className="site00-admin-table">
        <thead>
          <tr>
            <th>State</th>
            <th>Payment</th>
            <th>Created</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.artifact_id}>
              <td>{r.state}</td>
              <td>{r.payment_state}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>
                <Link to={SITE00_ROUTES.digitalFoundationAdminDetail.replace(':id', r.artifact_id)}>Open</Link>
                {' · '}
                <a href={`/foundation/${r.public_token}`} target="_blank" rel="noreferrer">
                  Public
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
