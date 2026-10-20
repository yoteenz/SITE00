/**
 * Founder boards 13–15C on the Digital Foundation chamber. Presentation over the operations read models;
 * the only mutations are the real `start-task` and `complete-task` operations passed in by the page.
 */
import { useState, type ReactNode } from 'react';
import type { PipelineRow } from '../../../../../../shared/site00-digital-foundation/operations/contracts/p13Pipeline.js';
import type { ProjectCommandSnapshot } from '../../../../../../shared/site00-digital-foundation/operations/contracts/p14ProjectCommand.js';
import type { FounderRunbookView } from '../../../../../../shared/site00-digital-foundation/operations/contracts/p15RunbookView.js';
import type { DigitalFoundationExecutionTask } from '../../../../../../shared/site00-digital-foundation/operations/types.js';
import { foundationCreditDisplay } from '../../../../../../shared/site00-digital-foundation/creditPresentation.js';
import {
  DfBackLink,
  DfBoardList,
  DfBoardRow,
  DfDecisionLine,
  DfHonestNote,
  DfIdCard,
  DfKv,
  DfMachine,
  DfMeter,
  DfPanel,
  DfPill,
  DfStatGrid,
  DfStrip,
  DfTabs,
  type DfKvRow,
  type DfPillTone,
} from '../../../../foundation-client/boardKit';
import { FoundationDfRoot } from '../../../../foundation-client/FoundationDfRoot';
import { DfIcon } from '../../../../foundation-client/icons';
import { formatMoney } from '../../../../foundation-client/model';
import { FOUNDATION_BUILD_PATHS } from '../../../../foundation-client/parents/FoundationMilestone';
import { DF_REVIEW_INERT_MESSAGE, useDfReviewInert } from '../../../../foundation-client/reviewInert';
import { DfCta, DfDrawer, DfHeadline, DfLede, DfRail, DfTrust } from '../../../../foundation-client/shell';
import {
  EXECUTION_MODES,
  MODE_ICON,
  MODE_LABEL,
  MODE_LONG_LABEL,
  currentStage,
  dependencyLabel,
  dependents,
  forecastLine,
  founderAttention,
  humanize,
  isDone,
  latestResult,
  modeCounts,
  modeTone,
  nextTask,
  orderedTasks,
  pipelineRowIcon,
  pipelineRowStatus,
  pipelineRowSub,
  pipelineStats,
  providersLine,
  ruleStatus,
  ruleTone,
  rulesForTask,
  runbookCounts,
  runbookScopeTitle,
  runbookStats,
  scopeLine,
  stageName,
  stagePurpose,
  taskAction,
  taskIcon,
  taskNumbers,
  taskStatusLabel,
  taskStatusTone,
  verificationSummary,
  workbenchTasks,
  type PipelineAttention,
} from './founderBoardModel';

export type FounderBoardId = '13' | '14' | '15' | '15A' | '15B' | '15C';

const BOARD_LABEL: Record<FounderBoardId, string> = {
  '13': 'FOUNDATION PIPELINE',
  '14': 'PROJECT COMMAND',
  '15': 'EXECUTION WORKBENCH',
  '15A': 'RUNBOOK',
  '15B': 'RUNBOOK DETAIL',
  '15C': 'RUNBOOK TASK DETAIL',
};

export type FounderBoardNav = {
  /** Boards reachable from the founder menu for the current project. */
  available: FounderBoardId[];
  onNavigate: (board: FounderBoardId) => void;
};

function FounderBoardShell({ board, nav, children }: { board: FounderBoardId; nav?: FounderBoardNav; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <FoundationDfRoot
        object="crown"
        state={`FOUNDER_${board}`}
        screenClassName="df-screen--board"
        footerCode={`0${board}`}
        onMenu={nav ? () => setMenuOpen((o) => !o) : undefined}
        menuOpen={menuOpen}
      >
        {children}
      </FoundationDfRoot>
      {nav && (
        <DfDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
          <nav className="df-drawer__nav" aria-label="FOUNDER">
            <ol className="df-drawer__steps">
              {(Object.keys(BOARD_LABEL) as FounderBoardId[]).map((id) => {
                const enabled = nav.available.includes(id);
                const current = id === board;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`df-drawer__step df-drawer__step--${current ? 'current' : enabled ? 'done' : 'locked'}`}
                      aria-disabled={enabled ? undefined : true}
                      aria-current={current ? 'page' : undefined}
                      onClick={() => {
                        if (!enabled) return;
                        setMenuOpen(false);
                        nav.onNavigate(id);
                      }}
                    >
                      <span className="df-drawer__index">{id}</span>
                      <span className="df-drawer__connector" aria-hidden="true" />
                      <span className="df-drawer__label">{BOARD_LABEL[id]}</span>
                      <DfIcon name={enabled ? 'arrow' : 'lock'} className="df-drawer__glyph" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </DfDrawer>
      )}
    </>
  );
}

function businessOf(snapshot: ProjectCommandSnapshot): string {
  return (snapshot.artifact.intake.business_name || snapshot.lead.business_name || 'UNNAMED PROJECT').toUpperCase();
}

function TaskPills({ task }: { task: DigitalFoundationExecutionTask }) {
  return (
    <span className="df-brow__pills">
      <DfPill tone={modeTone(task.execution_mode)}>{MODE_LABEL[task.execution_mode]}</DfPill>
      <DfPill tone={taskStatusTone(task.status)}>{taskStatusLabel(task.status)}</DfPill>
    </span>
  );
}

// ─── 13 · Foundation pipeline ───────────────────────────────────────────────────────────────────

export function FounderPipelineBoard({
  rows,
  attention,
  onOpenProject,
  nav,
}: {
  rows: PipelineRow[];
  attention: PipelineAttention;
  onOpenProject: (artifactId: string) => void;
  nav?: FounderBoardNav;
}) {
  const items = founderAttention(attention);
  const focus = items[0]?.row ?? rows[0] ?? null;
  return (
    <FounderBoardShell board="13" nav={nav}>
      <DfRail index="13" label="FOUNDATION PIPELINE" />
      <DfHeadline lines={['FOUNDATION', 'PIPELINE']} />
      <DfLede>
        PORTFOLIO-LEVEL VISIBILITY FOR DIGITAL FOUNDATION PROJECTS. TRACK LEADS, PROGRESS, PAYMENTS AND WHAT NEEDS YOUR ATTENTION.
      </DfLede>
      <DfPanel>
        <DfStatGrid items={pipelineStats(rows, attention)} wide />
      </DfPanel>
      <DfPanel label="PROJECTS (RECENT ACTIVITY)" aside={rows.length ? String(rows.length) : undefined}>
        {rows.length ? (
          <DfBoardList label="PROJECTS">
            {rows.map((r) => {
              const status = pipelineRowStatus(r);
              return (
                <DfBoardRow
                  key={r.artifact_id}
                  rowId={r.artifact_id}
                  icon={pipelineRowIcon(r)}
                  title={(r.business_name ?? 'UNNAMED PROJECT').toUpperCase()}
                  sub={pipelineRowSub(r)}
                  aside={<DfPill tone={status.tone}>{status.label}</DfPill>}
                  onOpen={() => onOpenProject(r.artifact_id)}
                />
              );
            })}
          </DfBoardList>
        ) : (
          <p className="df-panel__body df-section__note">NO FOUNDATION PROJECTS YET.</p>
        )}
      </DfPanel>
      <DfPanel label="FOUNDER ATTENTION">
        {items.length ? (
          <DfBoardList>
            {items.map((a) => (
              <DfBoardRow
                key={a.row.artifact_id}
                rowId={`attention-${a.row.artifact_id}`}
                icon={a.icon}
                iconTone={a.icon === 'clock' ? undefined : 'danger'}
                title={(a.row.business_name ?? 'UNNAMED PROJECT').toUpperCase()}
                sub={a.reason}
                onOpen={() => onOpenProject(a.row.artifact_id)}
              />
            ))}
          </DfBoardList>
        ) : (
          <p className="df-panel__body df-section__note">NOTHING NEEDS YOU RIGHT NOW.</p>
        )}
      </DfPanel>
      <div className="df-actions">
        <DfCta
          label="VIEW PROJECT COMMAND"
          action="view-project-command"
          disabled={!focus}
          onClick={() => focus && onOpenProject(focus.artifact_id)}
        />
      </div>
      <DfTrust text="PORTFOLIO DATA IS SECURE." />
    </FounderBoardShell>
  );
}

// ─── 14 · Project command ───────────────────────────────────────────────────────────────────────

const CREDIT_TONE: Record<string, DfPillTone> = {
  AVAILABLE: 'ok',
  PENDING_VERIFICATION: 'info',
  REDEEMED: 'muted',
  EXPIRED: 'muted',
  NOT_ELIGIBLE: 'muted',
};

export function FounderProjectCommandBoard({
  snapshot,
  runbook,
  onWorkbench,
  onRunbook,
  onBack,
  nav,
}: {
  snapshot: ProjectCommandSnapshot;
  runbook: FounderRunbookView;
  onWorkbench: () => void;
  onRunbook: () => void;
  onBack?: () => void;
  nav?: FounderBoardNav;
}) {
  const business = businessOf(snapshot);
  const tasks = runbook.tasks;
  const stage = currentStage(tasks);
  const forecast = forecastLine(snapshot.forecast);
  const openActions = snapshot.client_actions.filter((c) => c.status === 'OPEN');
  const approvalsDone = snapshot.approvals.filter((a) => a.status === 'APPROVED').length;
  const approvalsOpen = snapshot.approvals.filter((a) => a.status === 'REQUESTED').length;
  const verification = verificationSummary(runbook);
  const providers = providersLine(tasks);
  const paid = snapshot.artifact.payment_state === 'PAID';
  const credit = foundationCreditDisplay({ completion_state: snapshot.artifact.completion_state, credit: runbook.credit });
  const rec = FOUNDATION_BUILD_PATHS.find((p) => p.id === snapshot.artifact.build_recommendation) ?? null;
  return (
    <FounderBoardShell board="14" nav={nav}>
      {onBack && <DfBackLink label="FOUNDATION PIPELINE" onClick={onBack} />}
      <DfRail index="14" label="PROJECT COMMAND" />
      <DfHeadline lines={['PROJECT', 'COMMAND']} />
      <DfLede>SINGLE-PROJECT COMMAND CENTER. EVERYTHING YOU NEED TO DELIVER THE DIGITAL FOUNDATION FOR {business}.</DfLede>
      <DfPanel>
        <DfIdCard
          icon="cube"
          eyebrow="CLIENT"
          title={business}
          sub={snapshot.lead.contact_name ? snapshot.lead.contact_name.toUpperCase() : undefined}
        />
        <DfStrip
          cells={[
            {
              label: 'PAYMENT',
              value: <DfPill tone={paid ? 'ok' : 'alert'}>{paid ? 'CONFIRMED' : humanize(snapshot.artifact.payment_state)}</DfPill>,
            },
            { label: 'CURRENT STAGE', value: stageName(stage) ?? (tasks.length ? 'COMPLETE' : 'NOT STARTED') },
            { label: 'TIMELINE', value: forecast?.value ?? '—', sub: forecast?.unit },
          ]}
        />
      </DfPanel>
      <DfPanel>
        <DfBoardList label="PROJECT">
          <DfBoardRow icon="document" title="SCOPE" meta={scopeLine(snapshot)} />
          <DfBoardRow
            icon="checklist"
            title="RUNBOOK"
            meta={runbook.runbook ? `${tasks.length} TASKS · ${humanize(runbook.runbook.status)}` : 'NOT GENERATED'}
            onOpen={runbook.runbook ? onRunbook : undefined}
          />
          <DfBoardRow
            icon="needsYou"
            title="NEEDS YOU"
            meta={openActions.length ? `${openActions.length} OPEN CLIENT ACTION${openActions.length === 1 ? '' : 'S'}` : 'NONE ACTIVE'}
          />
          <DfBoardRow
            icon="approval"
            title="APPROVALS"
            meta={
              approvalsDone || approvalsOpen
                ? [approvalsDone ? `${approvalsDone} COMPLETE` : null, approvalsOpen ? `${approvalsOpen} REQUESTED` : null]
                    .filter(Boolean)
                    .join(' · ')
                : 'NONE REQUESTED'
            }
          />
          <DfBoardRow icon="layers" title="PROVIDERS" meta={providers ?? 'NOT ASSIGNED'} />
          <DfBoardRow
            icon="security"
            title="VERIFICATION"
            meta={verification.total ? `${verification.passed} OF ${verification.total} PASS` : 'NO RULES YET'}
            onOpen={runbook.runbook ? onRunbook : undefined}
          />
          <DfBoardRow
            icon="blocked"
            title="BLOCKERS"
            meta={snapshot.blockers.length ? snapshot.blockers.map((b) => humanize(b.category)).join(' · ') : 'NONE'}
            tone={snapshot.blockers.length ? 'alert' : undefined}
          />
          <DfBoardRow icon="folder" title="RECORDS" meta={snapshot.ownership_record ? 'OWNERSHIP READY' : 'NOT ISSUED'} />
        </DfBoardList>
      </DfPanel>
      <DfPanel>
        <DfStrip
          cells={[
            {
              icon: 'analytics',
              label: 'BUILD RECOMMENDATION',
              value: rec ? rec.label : 'NONE',
              sub: rec ? rec.hint : undefined,
            },
            {
              icon: 'receipt',
              label: 'FOUNDATION CREDIT',
              value:
                credit.amount_minor !== null && credit.currency ? formatMoney(credit.amount_minor, credit.currency) : '—',
              sub: <DfPill tone={CREDIT_TONE[credit.state]}>{credit.label}</DfPill>,
            },
          ]}
        />
      </DfPanel>
      <div className="df-actions">
        <DfCta label="OPEN EXECUTION WORKBENCH" action="open-workbench" disabled={!runbook.runbook} onClick={onWorkbench} />
      </div>
      {!runbook.runbook && <DfHonestNote>THE WORKBENCH OPENS ONCE THE RUNBOOK IS GENERATED FROM THE PAID SCOPE.</DfHonestNote>}
      <DfTrust text="PROJECT INFORMATION IS SECURE." />
    </FounderBoardShell>
  );
}

// ─── 15 · Execution workbench ───────────────────────────────────────────────────────────────────

export function FounderWorkbenchBoard({
  snapshot,
  runbook,
  onRunbook,
  onTask,
  onBack,
  nav,
}: {
  snapshot: ProjectCommandSnapshot;
  runbook: FounderRunbookView;
  onRunbook: () => void;
  onTask: (taskId: string) => void;
  onBack?: () => void;
  nav?: FounderBoardNav;
}) {
  const business = businessOf(snapshot);
  const stage = currentStage(runbook.tasks);
  const list = workbenchTasks(runbook.tasks);
  const verification = verificationSummary(runbook);
  const next = nextTask(runbook.tasks);
  const action = next ? taskAction(next) : null;
  return (
    <FounderBoardShell board="15" nav={nav}>
      {onBack && <DfBackLink label="PROJECT COMMAND" onClick={onBack} />}
      <DfRail index="15" label="EXECUTION WORKBENCH" />
      <DfHeadline lines={['RUN THE', 'FOUNDATION']} />
      <DfLede>
        EXECUTE EACH TASK, VERIFY RESULTS, AND COMPLETE THE DIGITAL FOUNDATION. THIS IS THE DELIVERY WORKSPACE FOR {business}.
      </DfLede>
      <DfPanel>
        <DfIdCard
          icon="globe"
          eyebrow="CURRENT STAGE"
          title={stageName(stage) ?? 'ALL STAGES COMPLETE'}
          sub={stagePurpose(stage) ?? undefined}
        />
      </DfPanel>
      <DfPanel label="EXECUTION TASKS">
        {list.length ? (
          <DfBoardList label="EXECUTION TASKS">
            {list.map((t) => (
              <DfBoardRow
                key={t.task_id}
                rowId={t.task_id}
                icon={taskIcon(t)}
                title={t.title.toUpperCase()}
                aside={<TaskPills task={t} />}
                onOpen={() => onTask(t.task_id)}
              />
            ))}
          </DfBoardList>
        ) : (
          <p className="df-panel__body df-section__note">NO OPEN TASKS. THE RUNBOOK IS COMPLETE OR NOT GENERATED.</p>
        )}
      </DfPanel>
      <DfPanel>
        <DfStrip
          cells={[
            { icon: 'analytics', label: 'EXPECTED VALUE', value: `${verification.expected} / ${verification.total}` },
            { icon: 'clock', label: 'CURRENT VALUE', value: `${verification.observed} / ${verification.total}` },
            { icon: 'stepsList', label: 'MATCH STATE', value: verification.state },
          ]}
        />
      </DfPanel>
      <DfPanel>
        <DfBoardList>
          <DfBoardRow
            icon="roadmap"
            title="RUNBOOK"
            sub="VIEW TASK ORDER, DEPENDENCIES, AND VERIFICATION FLOW"
            onOpen={onRunbook}
          />
          {next && action && (
            <DfBoardRow
              icon="next"
              title={`NEXT ACTION · ${action.label}`}
              sub={action.detail}
              onOpen={() => onTask(next.task_id)}
            />
          )}
        </DfBoardList>
      </DfPanel>
      <div className="df-actions">
        <DfCta label="VIEW RUNBOOK" action="view-runbook" onClick={onRunbook} />
      </div>
      <DfTrust text="EXECUTION ENVIRONMENT IS SECURE." />
    </FounderBoardShell>
  );
}

// ─── 15A · Runbook at a glance ──────────────────────────────────────────────────────────────────

export function FounderRunbookOverviewBoard({
  snapshot,
  runbook,
  onOpenRunbook,
  onBack,
  nav,
}: {
  snapshot: ProjectCommandSnapshot;
  runbook: FounderRunbookView;
  onOpenRunbook: () => void;
  onBack?: () => void;
  nav?: FounderBoardNav;
}) {
  const tasks = runbook.tasks;
  const stage = currentStage(tasks);
  const counts = runbookCounts(tasks);
  const modes = modeCounts(tasks);
  const forecast = forecastLine(runbook.forecast);
  return (
    <FounderBoardShell board="15A" nav={nav}>
      {onBack && <DfBackLink label="EXECUTION WORKBENCH" onClick={onBack} />}
      <DfRail index="15A" label="RUNBOOK" />
      <DfHeadline lines={['YOUR RUNBOOK', 'AT A GLANCE']} />
      <DfLede>
        REAL-TIME STATUS FOR YOUR DIGITAL FOUNDATION RUNBOOK. TRACK PROGRESS, VERIFY RESULTS, AND SEE WHAT HAPPENS NEXT.
      </DfLede>
      <DfPanel>
        <DfIdCard icon="cube" eyebrow="CLIENT" title={businessOf(snapshot)} />
        <DfIdCard
          icon="document"
          eyebrow={runbook.runbook ? `RUNBOOK V${runbook.runbook.runbook_version}` : 'RUNBOOK'}
          title={runbookScopeTitle(tasks)}
          aside={
            runbook.runbook ? (
              <DfPill tone={runbook.runbook.status === 'ACTIVE' ? 'ok' : 'neutral'}>{humanize(runbook.runbook.status)}</DfPill>
            ) : (
              <DfPill tone="muted">NOT GENERATED</DfPill>
            )
          }
        />
      </DfPanel>
      <DfPanel>
        <DfBoardList>
          <DfBoardRow
            icon="globe"
            title={`CURRENT STAGE · ${stageName(stage) ?? 'COMPLETE'}`}
            sub={stagePurpose(stage) ?? undefined}
            onOpen={onOpenRunbook}
          />
        </DfBoardList>
      </DfPanel>
      <DfPanel>
        <DfStatGrid items={runbookStats(counts)} />
      </DfPanel>
      {forecast && (
        <DfPanel>
          <DfStrip cells={[{ icon: 'clock', label: 'ESTIMATED COMPLETION', value: forecast.value, sub: forecast.unit }]} />
        </DfPanel>
      )}
      <DfPanel label="EXECUTION MODES IN THIS RUNBOOK">
        <DfBoardList>
          {EXECUTION_MODES.map((m) => (
            <DfBoardRow
              key={m}
              rowId={`mode-${m}`}
              icon={MODE_ICON[m]}
              iconTone={m === 'CLIENT_ACTION' ? 'danger' : undefined}
              title={MODE_LONG_LABEL[m]}
              tone={m === 'CLIENT_ACTION' && modes[m] ? 'alert' : undefined}
              aside={<DfPill tone="muted">{`${modes[m]} TASK${modes[m] === 1 ? '' : 'S'}`}</DfPill>}
            />
          ))}
        </DfBoardList>
      </DfPanel>
      <div className="df-actions">
        <DfCta label="OPEN RUNBOOK" action="open-runbook" disabled={!tasks.length} onClick={onOpenRunbook} />
      </div>
      <DfTrust text="PROJECT DATA IS SECURE." />
    </FounderBoardShell>
  );
}

// ─── 15B · Runbook detail ───────────────────────────────────────────────────────────────────────

type RunbookTab = 'OVERVIEW' | 'TASKS' | 'DEPENDENCIES' | 'VERIFICATION';

function RunbookTable({
  tasks,
  numbers,
  onTask,
}: {
  tasks: DigitalFoundationExecutionTask[];
  numbers: Map<string, string>;
  onTask: (taskId: string) => void;
}) {
  return (
    <ul className="df-rtable" aria-label="RUNBOOK TASKS">
      <li>
        <div className="df-rtable__row df-rtable__head" aria-hidden="true">
          <span className="df-rtable__cell df-rtable__num">#</span>
          <span className="df-rtable__icon" />
          <span className="df-rtable__cell df-rtable__task">TASK</span>
          <span className="df-rtable__cell df-rtable__mode">MODE</span>
          <span className="df-rtable__cell df-rtable__status">STATUS</span>
          <span className="df-rtable__cell df-rtable__deps">DEPENDS ON</span>
          <span className="df-rtable__chev" />
        </div>
      </li>
      {tasks.map((t) => (
        <li key={t.task_id} data-task-id={t.task_id}>
          <button type="button" className="df-rtable__row" onClick={() => onTask(t.task_id)}>
            <span className="df-rtable__cell df-rtable__num">{numbers.get(t.task_id)}</span>
            <DfIcon name={taskIcon(t)} className="df-rtable__icon" />
            <span className="df-rtable__cell df-rtable__task">{t.title.toUpperCase()}</span>
            <span className="df-rtable__cell df-rtable__mode">
              <DfPill tone={modeTone(t.execution_mode)}>{MODE_LABEL[t.execution_mode]}</DfPill>
            </span>
            <span className="df-rtable__cell df-rtable__status">
              <DfPill tone={taskStatusTone(t.status)}>{taskStatusLabel(t.status)}</DfPill>
            </span>
            <span className="df-rtable__cell df-rtable__deps">
              <span className="df-visually-hidden">DEPENDS ON </span>
              {dependencyLabel(t, numbers)}
            </span>
            <DfIcon name="chevron" className="df-rtable__chev" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function FounderRunbookDetailBoard({
  snapshot,
  runbook,
  onTask,
  onBack,
  initialTab = 'TASKS',
  nav,
}: {
  snapshot: ProjectCommandSnapshot;
  runbook: FounderRunbookView;
  onTask: (taskId: string) => void;
  onBack?: () => void;
  initialTab?: RunbookTab;
  nav?: FounderBoardNav;
}) {
  const [tab, setTab] = useState<RunbookTab>(initialTab);
  const ordered = orderedTasks(runbook.tasks);
  const numbers = taskNumbers(ordered);
  const counts = runbookCounts(runbook.tasks);
  const scope = runbookScopeTitle(runbook.tasks);
  const scopeWords = scope.split(' ');
  const scopeLast = scopeWords.pop() ?? '';
  const overview: DfKvRow[] = [];
  if (runbook.runbook) {
    overview.push(
      { label: 'RUNBOOK VERSION', value: `V${runbook.runbook.runbook_version}` },
      { label: 'QUOTE VERSION', value: `V${runbook.runbook.quote_version}` },
      { label: 'STATUS', value: humanize(runbook.runbook.status), tone: runbook.runbook.status === 'ACTIVE' ? 'ok' : undefined },
    );
    if (runbook.runbook.activated_at) overview.push({ label: 'ACTIVATED', value: new Date(runbook.runbook.activated_at).toLocaleDateString('en-US').toUpperCase() });
  }
  overview.push({ label: 'TASKS', value: `${counts.completed} OF ${counts.total} COMPLETE` });
  const forecast = forecastLine(runbook.forecast);
  if (forecast) overview.push({ label: 'FORECAST', value: `${forecast.value} ${forecast.unit}` });
  if (runbook.forecast?.forecast_reason) overview.push({ label: 'FORECAST NOTE', value: runbook.forecast.forecast_reason.toUpperCase() });

  return (
    <FounderBoardShell board="15B" nav={nav}>
      {onBack && <DfBackLink label="RUNBOOK AT A GLANCE" onClick={onBack} />}
      <DfRail index="15B" label="RUNBOOK DETAIL" />
      <DfHeadline lines={[scopeWords.join(' '), `${scopeLast} RUNBOOK`]} />
      <DfLede>
        EXECUTE, VERIFY, AND COMPLETE EACH TASK TO DELIVER A SECURE AND OPERATIONAL DIGITAL FOUNDATION FOR {businessOf(snapshot)}.
      </DfLede>
      <DfPanel>
        <DfIdCard
          icon="cube"
          title={businessOf(snapshot)}
          sub={scope}
          aside={runbook.runbook ? <DfPill tone={runbook.runbook.status === 'ACTIVE' ? 'ok' : 'neutral'}>{humanize(runbook.runbook.status)}</DfPill> : undefined}
        />
        <DfTabs
          tabs={[
            { id: 'OVERVIEW', label: 'OVERVIEW' },
            { id: 'TASKS', label: 'TASKS' },
            { id: 'DEPENDENCIES', label: 'DEPENDENCIES' },
            { id: 'VERIFICATION', label: 'VERIFICATION' },
          ]}
          value={tab}
          onChange={setTab}
          label="RUNBOOK SECTIONS"
        />
        {tab === 'TASKS' && <RunbookTable tasks={ordered} numbers={numbers} onTask={onTask} />}
        {tab === 'OVERVIEW' && <DfKv rows={overview} />}
        {tab === 'DEPENDENCIES' && (
          <DfBoardList label="DEPENDENCIES">
            {ordered
              .filter((t) => t.dependency_task_ids.length)
              .map((t) => {
                const waiting = t.dependency_task_ids.filter((id) => {
                  const dep = runbook.tasks.find((x) => x.task_id === id);
                  return dep && !isDone(dep);
                }).length;
                return (
                  <DfBoardRow
                    key={t.task_id}
                    icon="dependency"
                    title={`${numbers.get(t.task_id)} · ${t.title.toUpperCase()}`}
                    sub={`DEPENDS ON ${dependencyLabel(t, numbers)}`}
                    aside={<DfPill tone={waiting ? 'muted' : 'ok'}>{waiting ? `${waiting} OPEN` : 'MET'}</DfPill>}
                    onOpen={() => onTask(t.task_id)}
                  />
                );
              })}
          </DfBoardList>
        )}
        {tab === 'VERIFICATION' &&
          (runbook.verification_rules.length ? (
            <DfBoardList label="VERIFICATION RULES">
              {runbook.verification_rules.map((r) => {
                const result = latestResult(runbook, r.rule_id);
                const task = runbook.tasks.find((t) => t.task_id === r.task_id);
                return (
                  <DfBoardRow
                    key={r.rule_id}
                    icon="checklist"
                    title={humanize(r.check_kind)}
                    sub={task ? `${numbers.get(task.task_id)} · ${task.title.toUpperCase()}` : undefined}
                    aside={<DfPill tone={ruleTone(r, result)}>{ruleStatus(r, result)}</DfPill>}
                    onOpen={task ? () => onTask(task.task_id) : undefined}
                  />
                );
              })}
            </DfBoardList>
          ) : (
            <p className="df-panel__body df-section__note">NO VERIFICATION RULES ON THIS RUNBOOK.</p>
          ))}
      </DfPanel>
      <DfPanel>
        <DfMeter done={counts.completed} total={counts.total} label="RUNBOOK PROGRESS" />
      </DfPanel>
      <div className="df-actions">
        <DfCta
          label={tab === 'VERIFICATION' ? 'VIEW TASKS' : 'VIEW VERIFICATION FLOW'}
          action="view-verification-flow"
          onClick={() => setTab(tab === 'VERIFICATION' ? 'TASKS' : 'VERIFICATION')}
        />
      </div>
      <DfTrust text="PROJECT DATA IS SECURE." />
    </FounderBoardShell>
  );
}

// ─── 15C · Task detail ──────────────────────────────────────────────────────────────────────────

export type FounderTaskOperations = {
  start: (taskId: string) => Promise<unknown>;
  complete: (taskId: string) => Promise<unknown>;
};

type TaskTab = 'DETAIL' | 'EXECUTION' | 'DEPENDENCIES' | 'VERIFICATION';

function shortDate(iso: string | null): string | null {
  return iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }).toUpperCase() : null;
}

export function FounderTaskDetailBoard({
  snapshot,
  runbook,
  taskId,
  operations,
  onTask,
  onBack,
  nav,
}: {
  snapshot: ProjectCommandSnapshot;
  runbook: FounderRunbookView;
  taskId: string;
  operations: FounderTaskOperations;
  onTask: (taskId: string) => void;
  onBack: () => void;
  nav?: FounderBoardNav;
}) {
  const inert = useDfReviewInert();
  const [tab, setTab] = useState<TaskTab>('DETAIL');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ordered = orderedTasks(runbook.tasks);
  const numbers = taskNumbers(ordered);
  const task = runbook.tasks.find((t) => t.task_id === taskId);

  if (!task) {
    return (
      <FounderBoardShell board="15C" nav={nav}>
        <DfBackLink label="RUNBOOK DETAIL" onClick={onBack} />
        <DfRail index="15C" label="RUNBOOK TASK DETAIL" />
        <DfHeadline lines={['TASK', 'NOT FOUND']} />
        <DfLede>THIS TASK IS NOT ON THE CURRENT RUNBOOK. IT MAY HAVE BEEN SUPERSEDED BY A NEWER RUNBOOK VERSION.</DfLede>
        <DfTrust text="EXECUTION ENVIRONMENT IS SECURE." />
      </FounderBoardShell>
    );
  }

  const rules = rulesForTask(runbook, task.task_id);
  const rule = rules[0] ?? null;
  const ruleResult = rule ? latestResult(runbook, rule.rule_id) : null;
  const deps = task.dependency_task_ids
    .map((id) => runbook.tasks.find((t) => t.task_id === id))
    .filter((t): t is DigitalFoundationExecutionTask => Boolean(t));
  const unlocks = dependents(task.task_id, runbook.tasks);
  const action = taskAction(task);
  const headline = [task.title.toUpperCase(), 'TASK DETAIL'];

  const run = async () => {
    setError(null);
    setNotice(null);
    if (inert) {
      setNotice(DF_REVIEW_INERT_MESSAGE);
      return;
    }
    setBusy(true);
    try {
      if (action.kind === 'START') await operations.start(task.task_id);
      else if (action.kind === 'MARK_EXECUTED') await operations.complete(task.task_id);
    } catch (e) {
      setError(e instanceof Error ? e.message.toUpperCase() : 'THE OPERATION DID NOT COMPLETE.');
    } finally {
      setBusy(false);
    }
  };
  const runnable = action.kind === 'START' || action.kind === 'MARK_EXECUTED';

  const detailRows: DfKvRow[] = [];
  if (rule) {
    detailRows.push(
      { label: 'EXPECTED VALUE', icon: 'text', value: rule.expected_value ? <DfMachine>{rule.expected_value}</DfMachine> : 'NOT SET' },
      { label: 'CURRENT VALUE', icon: 'text', value: rule.current_value ? <DfMachine>{rule.current_value}</DfMachine> : 'NOT OBSERVED' },
      { label: 'MATCH STATE', icon: 'analytics', value: <DfPill tone={ruleTone(rule, ruleResult)}>{ruleStatus(rule, ruleResult)}</DfPill> },
    );
  }
  detailRows.push(
    { label: 'EXECUTION MODE', icon: 'gear', value: <DfPill tone={modeTone(task.execution_mode)}>{MODE_LONG_LABEL[task.execution_mode]}</DfPill> },
    { label: 'OWNER', icon: 'user', value: task.execution_mode === 'CLIENT_ACTION' ? businessOf(snapshot) : (task.assigned_actor ?? 'SITE 00').toUpperCase() },
  );

  const executionRows: DfKvRow[] = [
    { label: 'STAGE', value: stageName(task.project_stage) ?? '—' },
    { label: 'PROVIDER', value: task.provider_id ? humanize(task.provider_id) : humanize(task.provider_category) },
    { label: 'ATTEMPTS', value: String(task.attempt_count) },
  ];
  const started = shortDate(task.started_at);
  const completed = shortDate(task.completed_at);
  const verified = shortDate(task.verified_at);
  if (started) executionRows.push({ label: 'STARTED', value: started });
  if (completed) executionRows.push({ label: 'COMPLETED', value: completed });
  if (verified) executionRows.push({ label: 'VERIFIED', value: verified });
  if (task.blocker_category) executionRows.push({ label: 'BLOCKER', value: humanize(task.blocker_category), tone: 'alert' });

  const checklist = (
    <DfPanel label="VERIFICATION CHECKLIST" aside="STATUS">
      {rules.length || unlocks.length ? (
        <ul className="df-checklist">
          {rules.map((r) => {
            const res = latestResult(runbook, r.rule_id);
            const tone = ruleTone(r, res);
            return (
              <li key={r.rule_id} className="df-check">
                <span className={`df-check__dot${tone === 'ok' ? ' df-check__dot--pass' : tone === 'alert' ? ' df-check__dot--fail' : tone === 'info' ? ' df-check__dot--active' : ''}`} aria-hidden="true" />
                <span className="df-check__label">{humanize(r.check_kind)}</span>
                <DfPill tone={tone}>{ruleStatus(r, res)}</DfPill>
              </li>
            );
          })}
          {unlocks.map((u) => (
            <li key={u.task_id} className="df-check">
              <span className={`df-check__dot${isDone(u) ? ' df-check__dot--pass' : ''}`} aria-hidden="true" />
              <span className="df-check__label">{`UNLOCKS ${u.title.toUpperCase()} (TASK ${numbers.get(u.task_id)})`}</span>
              <DfPill tone={taskStatusTone(u.status)}>{taskStatusLabel(u.status)}</DfPill>
            </li>
          ))}
        </ul>
      ) : (
        <p className="df-panel__body df-section__note">NO VERIFICATION RULE IS ATTACHED TO THIS TASK.</p>
      )}
    </DfPanel>
  );

  return (
    <FounderBoardShell board="15C" nav={nav}>
      <DfBackLink label="RUNBOOK DETAIL" onClick={onBack} />
      <DfRail index="15C" label="RUNBOOK TASK DETAIL" />
      <DfHeadline lines={headline} />
      <DfLede>{task.description.toUpperCase()}</DfLede>
      <DfPanel>
        <DfIdCard
          icon={taskIcon(task)}
          eyebrow={`TASK ${numbers.get(task.task_id)} OF ${String(ordered.length).padStart(2, '0')}`}
          title={task.title.toUpperCase()}
          aside={<DfPill tone={taskStatusTone(task.status)}>{taskStatusLabel(task.status)}</DfPill>}
        />
        <DfTabs
          tabs={[
            { id: 'DETAIL', label: 'DETAIL' },
            { id: 'EXECUTION', label: 'EXECUTION' },
            { id: 'DEPENDENCIES', label: 'DEPENDENCIES', count: deps.length },
            { id: 'VERIFICATION', label: 'VERIFICATION', count: rules.length },
          ]}
          value={tab}
          onChange={setTab}
          label="TASK SECTIONS"
        />
        {tab === 'DETAIL' && <DfKv rows={detailRows} />}
        {tab === 'EXECUTION' && <DfKv rows={executionRows} />}
        {tab === 'DEPENDENCIES' && (
          <DfBoardList label="DEPENDENCIES">
            {deps.length ? (
              deps.map((d) => (
                <DfBoardRow
                  key={d.task_id}
                  icon={taskIcon(d)}
                  title={`${numbers.get(d.task_id)} · ${d.title.toUpperCase()}`}
                  aside={<DfPill tone={taskStatusTone(d.status)}>{taskStatusLabel(d.status)}</DfPill>}
                  onOpen={() => onTask(d.task_id)}
                />
              ))
            ) : (
              <DfBoardRow icon="check" title="NO DEPENDENCIES" />
            )}
          </DfBoardList>
        )}
        {tab === 'VERIFICATION' && (
          <DfBoardList label="VERIFICATION RESULTS">
            {rules.length ? (
              rules.map((r) => {
                const res = latestResult(runbook, r.rule_id);
                return (
                  <DfBoardRow
                    key={r.rule_id}
                    icon="checklist"
                    title={humanize(r.check_kind)}
                    sub={res?.detail ? res.detail.toUpperCase() : res ? shortDate(res.ran_at) : 'NOT RUN'}
                    aside={<DfPill tone={ruleTone(r, res)}>{ruleStatus(r, res)}</DfPill>}
                  />
                );
              })
            ) : (
              <DfBoardRow icon="info" title="NO VERIFICATION RULE" />
            )}
          </DfBoardList>
        )}
      </DfPanel>
      {(task.status === 'BLOCKED' || task.status === 'FAILED' || task.status === 'WAITING_CLIENT' || task.status === 'WAITING_PROVIDER') && (
        <DfDecisionLine title="ACTION REQUIRED" sub={(task.blocked_reason ?? action.label).toUpperCase()} />
      )}
      {tab === 'DETAIL' && checklist}
      <DfPanel>
        <DfBoardList>
          <DfBoardRow icon="next" title={`NEXT ACTION · ${action.label}`} sub={action.detail} />
        </DfBoardList>
      </DfPanel>
      {error && (
        <p className="df-field__error" role="alert">
          {error}
        </p>
      )}
      {notice && <DfHonestNote>{notice}</DfHonestNote>}
      <div className="df-actions">
        <DfCta
          label={action.label}
          action={`task-${action.kind.toLowerCase().replace(/_/g, '-')}`}
          busy={busy}
          disabled={!runnable || busy}
          onClick={() => void run()}
        />
      </div>
      {action.kind === 'RUN_VERIFICATION' && (
        <DfHonestNote>
          VERIFICATION NEEDS AN OBSERVED-VALUE CHECK FROM THE VERIFICATION ENGINE. THIS SCREEN NEVER RECORDS A PASS BY HAND.
        </DfHonestNote>
      )}
      <DfTrust text="EXECUTION ENVIRONMENT IS SECURE." />
    </FounderBoardShell>
  );
}
