import { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { DfaCta, DfaIcon, DfaNote, DfaPill, DfaShell, DfaStatus, type DfaGlyph, type DfaTone } from '../../../foundation-authority/DfAuthority';
import { foundationAdminApi } from '../../services/foundationAdminApi';
import { foundationOpsMenu, opsLabel } from './foundationOpsMenu';
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
const GROUPS: { key: BucketKey; label: string; param: string }[] = [
  { key: 'ready_to_execute', label: 'READY', param: 'ready' },
  { key: 'in_progress', label: 'IN PROGRESS', param: 'in-progress' },
  { key: 'waiting_on_client', label: 'CLIENT', param: 'client' },
  { key: 'waiting_on_provider', label: 'PROVIDER', param: 'provider' },
  { key: 'ready_to_verify', label: 'VERIFY', param: 'verify' },
  { key: 'blocked', label: 'BLOCKED', param: 'blocked' },
  { key: 'complete', label: 'COMPLETE', param: 'complete' },
];
const empty: Task[] = [];
const OK_STATUS = new Set(['READY', 'COMPLETE', 'VERIFIED', 'PASS']);

function taskGlyph(task: Task): DfaGlyph {
  const t = `${task.title} ${task.project_stage ?? ''}`.toLowerCase();
  if (/security|dmarc|dkim|spf|2fa/.test(t)) return 'shield';
  if (/mail|alias|signature/.test(t)) return 'envelope';
  if (/domain|dns|registrar/.test(t)) return 'globe';
  return 'document';
}
const taskTone = (status: string): DfaTone => (OK_STATUS.has(status) ? 'ok' : 'alert');

export default function FoundationWorkbenchPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const initial = GROUPS.find((g) => g.param === params.get('queue'))?.key ?? 'ready_to_execute';
  const [view, setView] = useState<Workbench | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<BucketKey>(initial);
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
  const complete = buckets?.complete?.length ?? 0;
  const stageTask = buckets?.in_progress?.[0] ?? buckets?.ready_to_execute?.[0] ?? buckets?.waiting_on_client?.[0] ?? tasks[0];

  return (
    <DfaShell code="15" kicker="EXECUTION WORKBENCH" title={['RUN THE FOUNDATION']}
      lede="EXECUTE EACH TASK AND VERIFY THE RESULT." plate="d03" shard="d03" footCode="D03" authority="desktop"
      menu={foundationOpsMenu('workbench', id)}>
      <div className="dfo dfo--workbench">
        {loading && <DfaStatus kind="loading">LOADING PROJECT EXECUTION…</DfaStatus>}
        {error && <DfaStatus kind="error">{error}</DfaStatus>}
        {!loading && !error && (
          <>
            <div className="dfo-stage">
              <span className="dfo-stage__icon"><DfaIcon name="globe" /></span>
              <div className="dfo-stage__name">
                <small>CURRENT STAGE</small>
                <strong>{stageTask ? opsLabel(stageTask.project_stage) : 'NO TASKS YET'}</strong>
              </div>
              <div className="dfo-stage__progress" aria-label={`${complete} of ${tasks.length} tasks complete`}>
                <strong>{complete} / {tasks.length}</strong><small>TASKS COMPLETE</small>
              </div>
            </div>
            <div className="dfo-head">
              <p className="dfa-label">EXECUTION TASKS</p>
              <nav className="dfo-tabs" aria-label="Task status">
                {GROUPS.map(({ key, label }) => (
                  <button key={key} type="button" aria-pressed={active === key} className={active === key ? 'is-active' : ''}
                    onClick={() => { setActive(key); setSelectedId(null); }}>
                    {label} <b>{buckets?.[key]?.length ?? 0}</b>
                  </button>
                ))}
              </nav>
            </div>
            {current.length === 0 && <DfaStatus kind="empty">NO TASKS IN THIS STATE. SELECT ANOTHER STATUS TO REVIEW THE PROJECT WORKLOAD.</DfaStatus>}
            {current.length > 0 && (
              <div className="dfa-rows dfa-rows--ruled dfo-task-rows" aria-label="Execution task list">
                {current.map((task) => {
                  const open = selectedId === task.task_id;
                  return (
                    <Fragment key={task.task_id}>
                      <button type="button" className={`dfa-row${open ? ' is-selected' : ''}`} aria-expanded={open}
                        aria-controls={`dfo-task-${task.task_id}`} onClick={() => setSelectedId(open ? null : task.task_id)}>
                        <span className="dfa-row__icon"><DfaIcon name={taskGlyph(task)} className="dfa-ico" /></span>
                        <span className="dfa-row__main"><strong>{task.title.toUpperCase()}</strong></span>
                        <span className="dfa-row__side"><DfaPill tone={taskTone(task.status)}>{opsLabel(task.status)}</DfaPill></span>
                        <span className="dfa-row__chev"><DfaIcon name="chevron" className={`dfa-chev${open ? ' is-open' : ''}`} /></span>
                      </button>
                      {open && (
                        <div className="dfo-inspect" id={`dfo-task-${task.task_id}`} role="region" aria-label={`${task.title} detail`}>
                          <p>{task.description?.trim() ? task.description.toUpperCase() : 'NO TASK DESCRIPTION HAS BEEN RECORDED.'}</p>
                          <dl>
                            <div><dt>STATUS</dt><dd>{opsLabel(task.status)}</dd></div>
                            <div><dt>EXECUTION</dt><dd>{opsLabel(task.execution_mode)}</dd></div>
                            <div><dt>PROVIDER</dt><dd>{opsLabel(task.provider_category)}</dd></div>
                            <div><dt>STAGE</dt><dd>{opsLabel(task.project_stage)}</dd></div>
                            <div><dt>DEPENDENCIES</dt><dd>{task.dependency_task_ids?.length ?? 0}</dd></div>
                            {task.blocked_reason && <div><dt>BLOCKER</dt><dd>{task.blocked_reason.toUpperCase()}</dd></div>}
                          </dl>
                        </div>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <div className="dfo-cta dfo-cta--full">
        <DfaCta to={id ? SITE00_ROUTES.digitalFoundationProjectCommand.replace(':id', encodeURIComponent(id)) : undefined} disabled={!id}>VIEW RUNBOOK</DfaCta>
      </div>
      <DfaNote>TASK STATE IS READ FROM THE PROJECT API. NO STATUS CHANGES ARE AVAILABLE IN THIS VIEW.</DfaNote>
    </DfaShell>
  );
}
