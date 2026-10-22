import { useCallback, useEffect, useMemo, useState } from 'react';
import { foundationAdminApi, type PipelineRow } from '../../services/foundationAdminApi';
import { SITE00_ROUTES } from '../../../config/routes';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../config/routes';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useInspectorDocked } from '../shell/useWorkspaceTier';
import { TaskInspector } from '../inspectors/Inspectors';
import { DONE, STAGES, TASK_KIND, WAIT, flattenTasks, human, stageIndex, type OpsTask, type Workbench } from '../data/opsTasks';
import {
  WsBanner,
  WsButton,
  WsCheckGlyph,
  WsChip,
  WsEmpty,
  WsIdent,
  WsLinkButton,
  WsMode,
  WsPanel,
  WsPlate,
  WsSegCtl,
  WsSegments,
  WsSkel,
  WsStatus,
  WsTechDetail,
  type WsKind,
} from '../shell/wsKit';

export function StageRail({ cur }: { cur: number }) {
  return (
    <ol className="stages" style={{ margin: 0, padding: 0, listStyle: 'none' }} aria-label={cur >= 0 ? `STAGES · ${cur + 1} OF 7` : 'STAGES · NOT STARTED'}>
      {STAGES.map((l, i) => (
        <li key={l} className={`stg ${i < cur ? 'stg--done' : i === cur ? 'stg--cur' : ''}`.trim()} aria-current={i === cur ? 'step' : undefined} title={l}>
          <b>{String(i + 1).padStart(2, '0')}</b>
          <span>{l}</span>
        </li>
      ))}
    </ol>
  );
}

type Filter = 'ACTIVE' | 'BLOCKED' | 'VERIFY' | 'ALL';
type TaskView = 'ALL' | 'OPEN' | 'DONE';

/**
 * 04 OPERATIONS — OPUS2 D-10 · TP-07 · TL-07: runbooks | runbook (stage rail + task table) | gate · client actions · verification.
 * Execution modes AUTOMATED / ASSISTED / CLIENT ACTION / EXTERNAL MANUAL / VERIFICATION are shown exactly as recorded.
 * Triggers kept: OL-12 task detail · OL-13 set blocker · full workbench link.
 */
export function OperationsPage() {
  const docked = useInspectorDocked();
  const { openOverlay, open } = useFounderWorkspaceOverlay();
  const [rows, setRows] = useState<PipelineRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [taskView, setTaskView] = useState<TaskView>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wb, setWb] = useState<Workbench | null>(null);
  const [wbError, setWbError] = useState<string | null>(null);
  const [gate, setGate] = useState<{ ok?: boolean; reasons?: string[] } | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    void foundationAdminApi
      .pipeline()
      .then((j) => setRows(j.rows ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, []);
  useEffect(load, [load]);

  const blocked = (rows ?? []).filter((r) => r.blocker);
  const verifying = (rows ?? []).filter((r) => stageIndex(r.current_stage) === 5);
  // A runbook exists once a foundation is paid or has a project stage; ALL also lists the unpaid pipeline.
  const active = (rows ?? []).filter((r) => r.payment_state === 'PAID' || stageIndex(r.current_stage) >= 0);
  const visible = filter === 'BLOCKED' ? blocked : filter === 'VERIFY' ? verifying : filter === 'ACTIVE' ? active : rows ?? [];
  const current = visible.find((r) => r.artifact_id === selectedId) ?? visible[0] ?? null;

  const loadWb = useCallback((id: string) => {
    setWb(null);
    setWbError(null);
    setGate(null);
    void foundationAdminApi
      .workbench(id)
      .then((j) => setWb(j as Workbench))
      .catch((e) => setWbError(e instanceof Error ? e.message : 'Workbench failed'));
    void foundationAdminApi
      .completionGate(id)
      .then((g) => setGate(g as { ok?: boolean; reasons?: string[] }))
      .catch(() => setGate(null));
  }, []);

  useEffect(() => {
    if (current) loadWb(current.artifact_id);
  }, [current?.artifact_id, loadWb]); // eslint-disable-line react-hooks/exhaustive-deps

  // Server truth after OL-12 / OL-13 close.
  const [wasOpen, setWasOpen] = useState(false);
  useEffect(() => {
    if (open) setWasOpen(true);
    else if (wasOpen) {
      setWasOpen(false);
      if (current) loadWb(current.artifact_id);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const tasks = useMemo(() => flattenTasks(wb), [wb]);
  const shownTasks = taskView === 'OPEN' ? tasks.filter((t) => !DONE.has(String(t.status))) : taskView === 'DONE' ? tasks.filter((t) => DONE.has(String(t.status))) : tasks;
  const task = tasks.find((t) => t.task_id === taskId) ?? null;
  const verification = tasks.filter((t) => t.execution_mode === 'VERIFICATION');
  const clientOwes = wb?.command?.what_client_owes ?? [];
  const cur = stageIndex(current?.current_stage);
  const doneCount = tasks.filter((t) => DONE.has(String(t.status))).length;

  const openTask = (t: OpsTask) => {
    if (!current) return;
    setTaskId(t.task_id);
    if (!docked) openOverlay('OL-12', { artifact_id: current.artifact_id, task: t, task_id: t.task_id, business_name: current.business_name });
  };

  const subtitle = rows === null && !error ? 'LOADING RUNBOOKS…' : error && !rows ? 'RUNBOOKS COULD NOT LOAD' : `${active.length} ACTIVE RUNBOOKS · ${blocked.length} BLOCKED · ${verifying.length} IN VERIFICATION`;

  const inspector =
    docked && task && current ? (
      <TaskInspector
        task={task}
        stage={STAGES[stageIndex(task.project_stage)] ?? human(task.project_stage)}
        onClose={() => setTaskId(null)}
        onStart={() => openOverlay('OL-12', { artifact_id: current.artifact_id, task, task_id: task.task_id, business_name: current.business_name })}
        onBlock={() => openOverlay('OL-13', { artifact_id: current.artifact_id, task_id: task.task_id, task_title: task.title, category: 'CLIENT_AUTH_REQUIRED' })}
      />
    ) : null;

  let body;
  if (error && !rows) {
    body = (
      <>
        <WsBanner tone="red" icon="warning">
          RUNBOOKS COULD NOT LOAD · THE PIPELINE REQUEST FAILED. NOTHING WAS CHANGED.
        </WsBanner>
        <div className="ws-btn-row" style={{ marginTop: 12 }}>
          <WsButton icon="retry" onClick={load}>
            RETRY
          </WsButton>
        </div>
        <WsTechDetail action="pipeline" message={error} open onOpen={() => openOverlay('OL-20', { action: 'pipeline', message: error, status: 'REQUEST FAILED' })} />
      </>
    );
  } else if (rows === null) {
    body = (
      <div className="ops" aria-busy="true">
        <div className="ws-panel" style={{ padding: 16 }}>
          <WsSkel w="70%" />
        </div>
      </div>
    );
  } else if (!rows.length) {
    body = (
      <WsEmpty label="NO RUNBOOKS" title="NO FOUNDATION IS IN SETUP">
        A RUNBOOK IS GENERATED WHEN A FOUNDATION IS PAID. NOTHING IS EXECUTED AGAINST PROVIDERS FROM THIS PAGE.
      </WsEmpty>
    );
  } else {
    body = (
      <div className="ops">
        <section className="ops__proj" aria-label="RUNBOOKS">
          <div className="ws-sechead">
            <h2 className="ws-h3">RUNBOOKS</h2>
            <span className="ws-meta">{visible.length} SHOWN</span>
          </div>
          <div className="proj-list ws-panel" style={{ borderBottom: 0 }}>
            {visible.map((r) => {
              const k: WsKind = r.blocker ? 'blocked' : r.payment_state === 'PAID' ? 'work' : 'client';
              const si = stageIndex(r.current_stage);
              const name = (r.business_name ?? `FOUNDATION ${r.artifact_id.slice(0, 6)}`).toUpperCase();
              return (
                <button
                  key={r.artifact_id}
                  type="button"
                  className={`proj ${r.artifact_id === current?.artifact_id ? 'proj--sel' : ''}`.trim()}
                  aria-pressed={r.artifact_id === current?.artifact_id}
                  onClick={() => {
                    setSelectedId(r.artifact_id);
                    setTaskId(null);
                  }}
                >
                  <WsPlate name={name} attn={k === 'blocked'} size="sm" />
                  <span className="ws-who">
                    <b>{name}</b>
                    <span>{si >= 0 ? `${String(si + 1).padStart(2, '0')} ${STAGES[si]}` : r.payment_state === 'PAID' ? 'RUNBOOK NOT STARTED' : `NOT PAID · ${human(r.payment_state)}`}</span>
                  </span>
                  <WsStatus kind={k}>{k === 'blocked' ? 'BLOCKED' : k === 'client' ? 'CLIENT' : 'SITE 00'}</WsStatus>
                  <WsSegments phase={r.payment_state === 'PAID' ? (si >= 5 ? 6 : 5) : 4} kind={k} />
                </button>
              );
            })}
            {!visible.length ? (
              <p className="ws-meta" style={{ margin: 0, padding: 14 }}>
                NOTHING IN THIS FILTER.
              </p>
            ) : null}
          </div>
        </section>

        <section className="ops__main" aria-label="RUNBOOK">
          {current ? (
            <>
              <div className="ws-panel">
                <div className="ws-panel__h">
                  <WsIdent
                    name={(current.business_name ?? 'FOUNDATION').toUpperCase()}
                    sub={wb ? `${doneCount} OF ${tasks.length} TASKS DONE${wb.command?.current_forecast?.current_max_days ? ` · PROJECTED ${wb.command.current_forecast.current_min_days}–${wb.command.current_forecast.current_max_days} DAYS` : ''}` : 'LOADING RUNBOOK…'}
                  />
                  <span className="ws-btn-row" style={{ gap: 6 }}>
                    {current.blocker ? <WsChip kind="req">BLOCKED</WsChip> : null}
                    <WsLinkButton tone="ghost" size="xs" icon="external" to={SITE00_ROUTES.digitalFoundationWorkbench.replace(':id', current.artifact_id)}>
                      FULL WORKBENCH
                    </WsLinkButton>
                  </span>
                </div>
                <div className="ws-panel__b">
                  <StageRail cur={cur} />
                  {current.blocker ? (
                    <div style={{ marginTop: 12 }}>
                      <WsBanner tone="red" icon="blocked">
                        {current.blocker.toUpperCase()}
                      </WsBanner>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="ws-panel" style={{ marginTop: 'var(--ws-gap)' }}>
                <div className="ws-panel__h">
                  <h3 className="ws-h3">{cur >= 0 ? `${String(cur + 1).padStart(2, '0')} ${STAGES[cur]}` : 'TASKS'}</h3>
                  <WsSegCtl
                    label="TASK VIEW"
                    value={taskView}
                    onChange={setTaskView}
                    items={[
                      { id: 'ALL', label: `ALL · ${tasks.length}` },
                      { id: 'OPEN', label: `OPEN · ${tasks.length - doneCount}` },
                      { id: 'DONE', label: `DONE · ${doneCount}` },
                    ]}
                  />
                </div>
                {wbError ? (
                  <div className="ws-panel__b">
                    <WsBanner tone="red" icon="warning">
                      THE WORKBENCH COULD NOT LOAD · <span className="ws-data">{wbError}</span>
                    </WsBanner>
                  </div>
                ) : !wb ? (
                  <div className="ws-panel__b">
                    <WsSkel w="80%" />
                  </div>
                ) : shownTasks.length ? (
                  <div role="table" aria-label="TASKS">
                    {shownTasks.map((t) => {
                      const st = String(t.status ?? 'UNKNOWN');
                      const box = DONE.has(st) && st !== 'SKIPPED' ? 'done' : WAIT.has(st) ? 'wait' : '';
                      return (
                        <div
                          key={t.task_id}
                          className={`task ${t.task_id === taskId ? 'task--sel' : ''}`.trim()}
                          role="row"
                          tabIndex={0}
                          aria-selected={t.task_id === taskId}
                          onClick={() => openTask(t)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openTask(t);
                            }
                          }}
                        >
                          <span className={`task__box ${box ? `task__box--${box}` : ''}`.trim()} aria-hidden="true">
                            {box === 'done' ? <WsCheckGlyph /> : null}
                          </span>
                          <span className="task__t">
                            <b>{(t.title ?? t.task_id).toUpperCase()}</b>
                            <span>
                              {t.task_type ?? '—'}
                              {t.dependency_task_ids?.length ? ` · DEPENDS ON ${t.dependency_task_ids.length}` : ''}
                            </span>
                          </span>
                          <span className="task__s">
                            {t.execution_mode ? <WsMode mode={t.execution_mode} /> : null}
                            <WsStatus kind={TASK_KIND[st] ?? 'idle'}>{human(st)}</WsStatus>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ws-panel__b">
                    <p className="ws-meta" style={{ margin: 0 }}>
                      {tasks.length ? 'NO TASK IN THIS VIEW.' : 'NO RUNBOOK TASKS YET · THE RUNBOOK IS GENERATED AFTER VERIFIED PAYMENT.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </section>

        <aside className="ops__side">
          <WsPanel title="COMPLETION GATE" right={gate ? <WsChip kind={gate.ok ? 'ok' : 'req'}>{gate.ok ? 'CLEAR' : `${gate.reasons?.length ?? 0} REASONS`}</WsChip> : <WsChip kind="unver">NOT LOADED</WsChip>}>
            {gate?.reasons?.length ? (
              gate.reasons.map((t) => (
                <div key={t} className="ws-act" style={{ gridTemplateColumns: '10px minmax(0,1fr)', padding: '7px 0' }}>
                  <span className="ws-mk ws-mk--blocked" aria-hidden="true" />
                  <p className="ws-data" style={{ textTransform: 'uppercase' }}>
                    {t}
                  </p>
                </div>
              ))
            ) : (
              <p className="ws-meta" style={{ margin: 0 }}>
                {gate?.ok ? 'EVERY COMPLETION REASON IS CLEAR.' : 'NO GATE DATA FOR THIS RUNBOOK.'}
              </p>
            )}
          </WsPanel>
          <WsPanel title="CLIENT ACTIONS" right={<span className="ws-meta">{clientOwes.length} OPEN</span>}>
            {clientOwes.length ? (
              clientOwes.map((c) => (
                <div key={c} style={{ padding: '4px 0' }}>
                  <WsStatus kind="client">{c.toUpperCase()}</WsStatus>
                </div>
              ))
            ) : (
              <p className="ws-meta" style={{ margin: 0 }}>
                NOTHING IS WAITING ON THE CLIENT.
              </p>
            )}
          </WsPanel>
          <WsPanel title="VERIFICATION" right={<span className="ws-meta">{verification.filter((t) => t.status === 'VERIFIED' || t.status === 'COMPLETE').length} OF {verification.length}</span>}>
            {verification.length ? (
              verification.map((t) => (
                <div key={t.task_id} className="ifw-check-row">
                  <span className="ws-meta">{(t.title ?? t.task_id).toUpperCase()}</span>
                  <WsChip kind={t.status === 'VERIFIED' || t.status === 'COMPLETE' ? 'ok' : t.status === 'FAILED' ? 'fail' : 'unver'}>{t.status === 'VERIFIED' || t.status === 'COMPLETE' ? 'PASS' : t.status === 'FAILED' ? 'FAIL' : 'NOT RUN'}</WsChip>
                </div>
              ))
            ) : (
              <p className="ws-meta" style={{ margin: 0 }}>
                NO VERIFICATION TASKS RECORDED.
              </p>
            )}
          </WsPanel>
          {current ? (
            <WsLinkButton tone="out" size="sm" icon="external" to={IDNTY_FOUNDER_WORKSPACE_ROUTES.client(current.artifact_id)}>
              OPEN FOUNDATION RECORD
            </WsLinkButton>
          ) : null}
        </aside>
      </div>
    );
  }

  return (
    <FounderWorkspacePageFrame
      destination="operations"
      subtitle={subtitle}
      inspector={inspector}
      onInspectorClose={() => setTaskId(null)}
      actions={
        rows?.length ? (
          <WsSegCtl
            label="RUNBOOK FILTER"
            value={filter}
            onChange={(f) => {
              setFilter(f);
              setTaskId(null);
            }}
            items={[
              { id: 'ACTIVE', label: `ACTIVE · ${active.length}` },
              { id: 'BLOCKED', label: `BLOCKED · ${blocked.length}` },
              { id: 'VERIFY', label: `VERIFY · ${verifying.length}` },
              { id: 'ALL', label: `ALL · ${rows.length}` },
            ]}
          />
        ) : null
      }
    >
      {body}
    </FounderWorkspacePageFrame>
  );
}

