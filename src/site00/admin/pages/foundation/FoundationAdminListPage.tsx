import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import {
  digitalFoundationClientIntakePath,
  foundationAdminApi,
  type FoundationAdminListRow,
} from '../../services/foundationAdminApi';

export default function FoundationAdminListPage() {
  const [rows, setRows] = useState<FoundationAdminListRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    let json = await foundationAdminApi.list();
    let artifacts = json.artifacts ?? [];
    if (import.meta.env.VITE_SITE00_CLOUD_PREVIEW === '1' && artifacts.length === 0) {
      await fetch('/api/dev/site00-digital-foundation-preview-bootstrap').catch(() => undefined);
      json = await foundationAdminApi.list();
      artifacts = json.artifacts ?? [];
    }
    setRows(artifacts);
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
        const token = json.personalized_url?.replace(/^\/foundation\//, '').split(/[?#]/)[0] ?? '';
        const intakePath = token ? digitalFoundationClientIntakePath(token) : json.personalized_url ?? '';
        window.prompt('Copy client intake link:', `${window.location.origin}${intakePath}`);
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
        <p>Founder mini console — copy client intake links (not the founder detail page).</p>
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
            <th>Links</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.artifact_id}>
              <td>{r.state}</td>
              <td>{r.payment_state}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>
                <a href={digitalFoundationClientIntakePath(r.public_token)} target="_blank" rel="noreferrer">
                  Client intake
                </a>
                {' · '}
                <Link to={SITE00_ROUTES.digitalFoundationAdminDetail.replace(':id', r.artifact_id)}>Founder</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
