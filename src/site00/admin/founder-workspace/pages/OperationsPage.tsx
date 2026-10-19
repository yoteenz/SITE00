import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { foundationAdminApi, type PipelineRow } from '../../services/foundationAdminApi';
import { SITE00_ROUTES } from '../../../config/routes';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';

type TaskRow = {
  task_id: string;
  title?: string;
  status?: string;
  execution_mode?: string;
};

export function OperationsPage() {
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void foundationAdminApi
      .pipeline()
      .then((j) => {
        setRows(j.rows ?? []);
        setSelectedId(j.rows?.[0]?.artifact_id ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void foundationAdminApi
      .workbench(selectedId)
      .then((json) => {
        const list = (json as { tasks?: TaskRow[] }).tasks ?? [];
        setTasks(list);
      })
      .catch(() => setTasks([]));
  }, [selectedId]);

  return (
    <FounderWorkspacePageFrame destination="operations">
      <div className="ifw-operations">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <p className="ifw-lede">Runbook tasks from workbench API — no fabricated provider execution.</p>
        <div className="ifw-operations__grid">
          <div className="ifw-table-wrap">
            <table className="ifw-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Stage</th>
                  <th>Blocker</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.artifact_id} className={selectedId === r.artifact_id ? 'ifw-table__row--selected' : ''}>
                    <td>
                      <button type="button" className="ifw-table__select" onClick={() => setSelectedId(r.artifact_id)}>
                        {r.business_name ?? '—'}
                      </button>
                    </td>
                    <td>{r.current_stage ?? '—'}</td>
                    <td>{r.blocker ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="ifw-inspector">
            <h2 className="ifw-inspector__title">Tasks</h2>
            {!tasks.length ? <p className="ifw-muted">No tasks for selection</p> : null}
            <ul className="ifw-list">
              {tasks.map((t) => (
                <li key={t.task_id}>
                  <strong>{t.title ?? t.task_id}</strong>
                  <span className="ifw-muted">{t.status}</span>
                  <div className="ifw-actions-row">
                    <button
                      type="button"
                      className="ifw-btn ifw-btn--ghost"
                      onClick={() =>
                        openOverlay('OL-12', { artifact_id: selectedId, task: t, task_id: t.task_id })
                      }
                    >
                      Task detail
                    </button>
                    <button
                      type="button"
                      className="ifw-btn ifw-btn--ghost"
                      onClick={() =>
                        openOverlay('OL-13', {
                          artifact_id: selectedId,
                          task_id: t.task_id,
                          category: 'CLIENT',
                        })
                      }
                    >
                      Set blocker
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {selectedId ? (
              <Link className="ifw-btn ifw-btn--primary" to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', selectedId)}>
                Full workbench
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
    </FounderWorkspacePageFrame>
  );
}
