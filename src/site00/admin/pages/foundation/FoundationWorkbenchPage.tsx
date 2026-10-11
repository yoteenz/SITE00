import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi } from '../../services/foundationAdminApi';
import './foundationOperations.css';

type Task = {
  task_id: string;
  title: string;
  description?: string;
  execution_mode: string;
  status: string;
  provider_category?: string;
  blocked_reason?: string | null;
  dependency_task_ids?: string[];
  project_stage?: string;
};
type BucketKey = 'ready_to_execute' | 'in_progress' | 'waiting_on_client' | 'waiting_on_provider' | 'ready_to_verify' | 'blocked' | 'complete';
type Workbench = { buckets?: Partial<Record<BucketKey, Task[]>>; command?: Record<string, unknown> };
const GROUPS: { key: BucketKey; label: string; note: string }[] = [
  { key: 'ready_to_execute', label: 'READY', note: 'AVAILABLE TO START' },
  { key: 'in_progress', label: 'IN PROGRESS', note: 'ACTIVE EXECUTION' },
  { key: 'waiting_on_client', label: 'CLIENT', note: 'AWAITING CLIENT' },
  { key: 'waiting_on_provider', label: 'PROVIDER', note: 'AWAITING PROVIDER' },
  { key: 'ready_to_verify', label: 'VERIFY', note: 'READY FOR REVIEW' },
  { key: 'blocked', label: 'BLOCKED', note: 'REQUIRES ATTENTION' },
  { key: 'complete', label: 'COMPLETE', note: 'FINISHED' },
];
const empty: Task[] = [];
const safe = (value: unknown) => typeof value === 'string' && value.trim() ? value.replace(/_/g, ' ') : '—';

export default function FoundationWorkbenchPage() {
  const { id = '' } = useParams();
  const [view, setView] = useState<Workbench | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<BucketKey>('ready_to_execute');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    setView(null);
    setSelectedId(null);
    if (!id) {
      setError('PROJECT IDENTIFIER IS MISSING.');
      setLoading(false);
      return;
    }
    foundationAdminApi.workbench(id)
      .then((data) => { if (live) setView(data as Workbench); })
      .catch((reason) => { if (live) setError(reason instanceof Error ? reason.message : String(reason)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id]);

  const buckets = view?.buckets;
  const current = buckets?.[active] ?? empty;
  const tasks = useMemo(() => GROUPS.flatMap(({ key }) => buckets?.[key] ?? empty), [buckets]);
  const selected = tasks.find((task) => task.task_id === selectedId) ?? current[0] ?? null;
  const complete = buckets?.complete?.length ?? 0;
  const total = tasks.length;

  return (
    <main className="df-ops" aria-labelledby="df-ops-title">
      <div className="df-ops__breadcrumb">
        <Link to={SITE00_ROUTES.digitalFoundationPipeline}>FOUNDATION / PIPELINE</Link>
        <span aria-hidden="true">/</span>
        <Link to={SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', id)}>PROJECT COMMAND</Link>
        <span aria-hidden="true">/</span><span>EXECUTION</span>
      </div>
      <header className="df-ops__hero">
        <div>
          <span className="df-ops__eyebrow">SITE 00 / DIGITAL FOUNDATION / OPERATIONS</span>
          <h1 id="df-ops-title">EXECUTION<br />WORKBENCH<span className="df-ops__red">.</span></h1>
          <p className="df-ops__lede">A LIVE VIEW OF TASKS, DEPENDENCIES AND VERIFICATION. THIS SCREEN IS READ-ONLY; IT DOES NOT TRIGGER PROVIDER ACTIONS.</p>
        </div>
        <div className="df-ops__progress" aria-label={`${complete} of ${total} tasks complete`}>
          <span className="df-ops__eyebrow">EXECUTION PROGRESS</span>
          <strong>{total ? Math.round(complete / total * 100) : 0}<small>%</small></strong>
          <span>{complete} / {total} TASKS COMPLETE</span>
          <div className="df-ops__meter"><span style={{ width: `${total ? complete / total * 100 : 0}%` }} /></div>
        </div>
      </header>
      {loading && <div className="df-ops__notice" role="status">LOADING PROJECT EXECUTION…</div>}
      {error && <div className="df-ops__notice df-ops__notice--error" role="alert">{error}</div>}
      {!loading && !error && (
        <>
          <nav className="df-ops__filters" aria-label="Task status">
            {GROUPS.map(({ key, label }) => (
              <button key={key} type="button" aria-pressed={active === key}
                className={`df-ops__filter ${active === key ? 'is-active' : ''}`}
                onClick={() => { setActive(key); setSelectedId(null); }}>
                <span>{label}</span><strong>{buckets?.[key]?.length ?? 0}</strong>
              </button>
            ))}
          </nav>
          <div className="df-ops__layout">
            <section className="df-ops__list" aria-label="Execution task list">
              <div className="df-ops__section-head">
                <div><span className="df-ops__eyebrow">CURRENT WORK QUEUE</span><h2>{GROUPS.find((g) => g.key === active)?.note}</h2></div>
                <span>{current.length} {current.length === 1 ? 'TASK' : 'TASKS'}</span>
              </div>
              {current.length === 0 && <p className="df-ops__empty">NO TASKS IN THIS STATE. SELECT ANOTHER STATUS TO REVIEW THE PROJECT WORKLOAD.</p>}
              {current.map((task, index) => (
                <button type="button" className={`df-ops__task ${selected?.task_id === task.task_id ? 'is-selected' : ''}`}
                  key={task.task_id} onClick={() => setSelectedId(task.task_id)} aria-pressed={selected?.task_id === task.task_id}>
                  <span className="df-ops__task-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="df-ops__task-main">
                    <strong>{safe(task.title)}</strong>
                    <small>{safe(task.project_stage)} / {safe(task.execution_mode)}</small>
                  </span>
                  <span className="df-ops__task-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </section>
            <aside className="df-ops__inspector" aria-label="Selected task detail">
              <span className="df-ops__eyebrow">TASK INSPECTOR / {selected ? 'SELECTED' : 'NO SELECTION'}</span>
              {selected ? (
                <>
                  <h2>{safe(selected.title)}</h2>
                  <p>{selected.description?.trim() || 'NO TASK DESCRIPTION HAS BEEN RECORDED.'}</p>
                  <dl>
                    <div><dt>STATUS</dt><dd>{safe(selected.status)}</dd></div>
                    <div><dt>EXECUTION</dt><dd>{safe(selected.execution_mode)}</dd></div>
                    <div><dt>PROVIDER</dt><dd>{safe(selected.provider_category)}</dd></div>
                    <div><dt>STAGE</dt><dd>{safe(selected.project_stage)}</dd></div>
                    <div><dt>DEPENDENCIES</dt><dd>{selected.dependency_task_ids?.length ?? 0}</dd></div>
                    {selected.blocked_reason && <div><dt>BLOCKER</dt><dd>{selected.blocked_reason}</dd></div>}
                  </dl>
                  <p className="df-ops__footnote">TASK STATE IS READ FROM THE PROJECT API. NO STATUS CHANGES ARE AVAILABLE IN THIS VIEW.</p>
                </>
              ) : (
                <p className="df-ops__empty">SELECT A TASK FROM THE QUEUE TO INSPECT ITS CURRENT EXECUTION REQUIREMENTS.</p>
              )}
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
