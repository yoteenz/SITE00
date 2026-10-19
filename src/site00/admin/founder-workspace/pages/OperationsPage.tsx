import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { foundationAdminApi, type PipelineRow } from '../../services/foundationAdminApi';
import { SITE00_ROUTES } from '../../../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';

export function OperationsPage() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void foundationAdminApi
      .pipeline()
      .then((j) => setRows(j.rows ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, []);

  return (
    <FounderWorkspacePageFrame destination="operations">
      <div className="ifw-operations">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <p className="ifw-lede">Runbook tasks reflect real engine state — no fabricated registrar or DNS execution.</p>
        <div className="ifw-table-wrap">
          <table className="ifw-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Stage</th>
                <th>Next</th>
                <th>Blocker</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.artifact_id}>
                  <td>{r.business_name ?? '—'}</td>
                  <td>{r.current_stage ?? '—'}</td>
                  <td>{r.next_action ?? '—'}</td>
                  <td>{r.blocker ?? '—'}</td>
                  <td>
                    <Link to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', r.artifact_id)}>Workbench</Link>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={5} className="ifw-muted">
                    No pipeline rows
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </FounderWorkspacePageFrame>
  );
}
