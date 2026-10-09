import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi, type FoundationAdminListRow } from '../../services/foundationAdminApi';

export default function FoundationAdminListPage() {
  const [rows, setRows] = useState<FoundationAdminListRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const json = await foundationAdminApi.list();
    setRows(json.artifacts ?? []);
  };

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const createLeadLink = async () => {
    setCreating(true);
    try {
      const json = await foundationAdminApi.createLeadLink({
        contact_email: 'prospect@example.com',
        referral_kind: 'DIRECT',
      });
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
