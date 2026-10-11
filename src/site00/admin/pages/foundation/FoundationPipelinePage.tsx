import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi, type PipelineRow } from '../../services/foundationAdminApi';

export default function FoundationPipelinePage() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    foundationAdminApi
      .pipeline()
      .then((j) => setRows(j.rows ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div className="site00-admin-page">
      <header>
        <h1>Foundation pipeline (P13)</h1>
        <p>
          <Link to={SITE00_ROUTES.digitalFoundationAdmin}>← All artifacts</Link>
        </p>
      </header>
      {error && <p>{error}</p>}
      <table className="site00-admin-table">
        <thead>
          <tr>
            <th>Business</th>
            <th>Payment</th>
            <th>Stage</th>
            <th>Next action</th>
            <th>Blocker</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.artifact_id}>
              <td>{r.business_name ?? '—'}</td>
              <td>{r.payment_state}</td>
              <td>{r.current_stage ?? '—'}</td>
              <td>{r.next_action ?? '—'}</td>
              <td>{r.blocker ?? '—'}</td>
              <td>
                <Link to={SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', r.artifact_id)}>Command</Link>
                {' · '}
                <Link to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', r.artifact_id)}>Workbench</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
