/**
 * Phase 2 — founder boards 13–15C over the real operations read models (pipeline, project command, runbook view).
 */
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import * as mem from '../api/_lib/digitalFoundation/memoryStore.js';
import { materializeFixtureScenario } from '../api/_lib/digitalFoundation/service.js';
import {
  completeTask,
  getProjectCommandSnapshot,
  getRunbookView,
  startTask,
} from '../api/_lib/digitalFoundation/operationsEngine.js';
import {
  FounderPipelineBoard,
  FounderProjectCommandBoard,
  FounderRunbookDetailBoard,
  FounderRunbookOverviewBoard,
  FounderTaskDetailBoard,
  FounderWorkbenchBoard,
} from '../src/site00/admin/pages/foundation/boards/FounderBoards';
import {
  currentStage,
  dependencyLabel,
  nextTask,
  orderedTasks,
  runbookCounts,
  runbookScopeTitle,
  taskAction,
  taskNumbers,
  verificationSummary,
  workbenchTasks,
} from '../src/site00/admin/pages/foundation/boards/founderBoardModel';
import { founderBoardPath } from '../src/site00/admin/pages/foundation/boards/founderBoardRoutes';
import { DfReviewInertProvider } from '../src/site00/foundation-client/reviewInert';
import DigitalFoundationReviewFounderBoardHost, {
  REVIEW_FOUNDER_SNAPSHOTS as snap,
} from '../src/site00/pages/foundation/DigitalFoundationReviewFounderBoardHost';
import { visibleLowercase } from './helpers/dfUppercaseAudit';

const html = (el: ReactElement) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(DfReviewInertProvider, null, el)));
const noop = () => undefined;
const inertOps = { start: async () => undefined, complete: async () => undefined };

describe('getRunbookView (read-only engine accessor)', () => {
  beforeEach(() => mem.resetDigitalFoundationMemoryStore());

  it('returns tasks, rules, forecast and credit without mutating the project', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    const before = JSON.stringify(getProjectCommandSnapshot(artifact.artifact_id).tasks);
    const view = getRunbookView(artifact.artifact_id);
    expect(view.artifact_id).toBe(artifact.artifact_id);
    expect(view.runbook).not.toBeNull();
    expect(view.tasks.length).toBeGreaterThan(5);
    expect(view.tasks.every((t) => t.status !== 'SUPERSEDED')).toBe(true);
    expect(view.verification_rules.length).toBeGreaterThan(0);
    expect(JSON.stringify(getProjectCommandSnapshot(artifact.artifact_id).tasks)).toBe(before);
  });

  it('throws for an unknown artifact', () => {
    expect(() => getRunbookView('missing')).toThrow(/ARTIFACT_NOT_FOUND/);
  });

  it('only start-task / complete-task move a task; verification tasks stop at READY_TO_VERIFY', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    const id = artifact.artifact_id;
    let guard = 0;
    while (guard++ < 30) {
      const t = orderedTasks(getRunbookView(id).tasks).find((x) => x.status === 'READY' && x.execution_mode !== 'CLIENT_ACTION');
      if (!t) break;
      expect(taskAction(t).kind).toBe('START');
      startTask(id, t.task_id);
      const started = getRunbookView(id).tasks.find((x) => x.task_id === t.task_id)!;
      expect(taskAction(started).kind).toBe('MARK_EXECUTED');
      completeTask(id, t.task_id);
      const after = getRunbookView(id).tasks.find((x) => x.task_id === t.task_id)!;
      if (t.execution_mode === 'VERIFICATION') {
        expect(after.status).toBe('READY_TO_VERIFY');
        expect(taskAction(after).kind).toBe('RUN_VERIFICATION');
        return;
      }
      expect(after.status).toBe('COMPLETE');
    }
  });
});

describe('founder board model over the engine snapshot', () => {
  const tasks = snap.runbook.tasks;

  it('counts match the engine task statuses', () => {
    const c = runbookCounts(tasks);
    expect(c.total).toBe(tasks.length);
    expect(c.in_progress).toBe(tasks.filter((t) => t.status === 'IN_PROGRESS').length);
    expect(c.completed).toBeGreaterThan(0);
  });

  it('numbers tasks in stage order and labels dependencies by number', () => {
    const ordered = orderedTasks(tasks);
    const numbers = taskNumbers(ordered);
    expect(numbers.get(ordered[0].task_id)).toBe('01');
    const withDeps = ordered.find((t) => t.dependency_task_ids.length);
    expect(withDeps && dependencyLabel(withDeps, numbers)).toMatch(/^\d{2}(, \d{2})*$/);
  });

  it('opens the in-progress task as the focus and the workbench shows the current stage', () => {
    const focus = tasks.find((t) => t.task_id === snap.focus_task_id)!;
    expect(focus.status).toBe('IN_PROGRESS');
    expect(nextTask(tasks)?.status).toMatch(/READY_TO_VERIFY|VERIFYING|IN_PROGRESS/);
    const stage = currentStage(tasks);
    expect(workbenchTasks(tasks).some((t) => t.project_stage === stage)).toBe(true);
    expect(workbenchTasks(tasks).length).toBeLessThanOrEqual(7);
  });

  it('never reports a verification pass the engine did not record', () => {
    expect(snap.runbook.verification_results).toHaveLength(0);
    expect(verificationSummary(snap.runbook).state).toBe('NOT RUN');
    expect(verificationSummary(snap.runbook).passed).toBe(0);
  });

  it('names the runbook from the stages it covers', () => {
    expect(runbookScopeTitle(tasks)).toBe('DOMAIN + EMAIL FOUNDATION');
  });
});

describe('founder board rendering (13–15C)', () => {
  it('13 pipeline lists every project with real names and founder attention', () => {
    const out = html(
      createElement(FounderPipelineBoard, { rows: snap.pipeline.rows, attention: snap.pipeline.attention, onOpenProject: noop }),
    );
    expect(out).toContain('FOUNDATION');
    for (const r of snap.pipeline.rows) expect(out).toContain((r.business_name ?? '').toUpperCase());
    expect(out).toContain('FOUNDER ATTENTION');
    expect(out).toContain('data-df-action="view-project-command"');
    expect(visibleLowercase(out)).toEqual([]);
  });

  it('14 project command reads the snapshot and never shows the credit as applied', () => {
    const out = html(
      createElement(FounderProjectCommandBoard, { snapshot: snap.project_command, runbook: snap.runbook, onWorkbench: noop, onRunbook: noop }),
    );
    expect(out).toContain('REVIEW FOUNDATION CO');
    expect(out).toContain('PROJECT');
    expect(out).toContain('FOUNDATION CREDIT');
    expect(out).not.toMatch(/CREDIT APPLIED|APPLIED TO YOUR BUILD/);
    expect(out).toContain('data-df-action="open-workbench"');
    expect(visibleLowercase(out)).toEqual([]);
  });

  it('15 workbench, 15A overview and 15B detail render the runbook', () => {
    const w = html(createElement(FounderWorkbenchBoard, { snapshot: snap.project_command, runbook: snap.runbook, onRunbook: noop, onTask: noop }));
    expect(w).toContain('EXECUTION TASKS');
    const a = html(createElement(FounderRunbookOverviewBoard, { snapshot: snap.project_command, runbook: snap.runbook, onOpenRunbook: noop }));
    expect(a).toContain('EXECUTION MODES');
    const b = html(createElement(FounderRunbookDetailBoard, { snapshot: snap.project_command, runbook: snap.runbook, onTask: noop }));
    expect(b).toContain('RUNBOOK');
    expect(b).toContain('df-rtable');
    for (const out of [w, a, b]) expect(visibleLowercase(out)).toEqual([]);
  });

  it('15C task detail offers only the real next operation and disables RUN VERIFICATION', () => {
    const inProgress = html(
      createElement(FounderTaskDetailBoard, {
        snapshot: snap.project_command,
        runbook: snap.runbook,
        taskId: snap.focus_task_id,
        operations: inertOps,
        onTask: noop,
        onBack: noop,
      }),
    );
    expect(inProgress).toContain('TASK DETAIL');
    expect(inProgress).toMatch(/MARK (EXECUTED|READY TO VERIFY)/);
    expect(visibleLowercase(inProgress)).toEqual([]);

    const verify = snap.runbook.tasks.find((t) => t.status === 'READY_TO_VERIFY')!;
    const v = html(
      createElement(FounderTaskDetailBoard, {
        snapshot: snap.project_command,
        runbook: snap.runbook,
        taskId: verify.task_id,
        operations: inertOps,
        onTask: noop,
        onBack: noop,
      }),
    );
    expect(v).toContain('RUN VERIFICATION');
    expect(v).toMatch(/<button[^>]*disabled[^>]*>(?:(?!<\/button>).)*RUN VERIFICATION/s);
  });

  it('review host renders each board from the snapshot with inert actions', () => {
    for (const board of ['13', '14', '15', '15A', '15B', '15C'] as const) {
      const out = renderToStaticMarkup(
        createElement(MemoryRouter, null, createElement(DigitalFoundationReviewFounderBoardHost, { initialBoard: board })),
      );
      expect(out).toContain(`data-founder-board="${board}"`);
      expect(out).toContain('INERT ACTIONS');
      expect(out).not.toContain('ws-');
    }
  });
});

describe('founder board routes', () => {
  it('admin paths carry only opaque ids', () => {
    expect(founderBoardPath('13', 'x')).toBe('/admin/site00/foundation/pipeline');
    expect(founderBoardPath('15A', 'a b')).toBe('/admin/site00/foundation/a%20b/runbook');
    expect(founderBoardPath('15C', 'a', 't')).toBe('/admin/site00/foundation/a/runbook/tasks/t');
  });

  it('review snapshot carries no public client token', () => {
    const raw = JSON.stringify(snap);
    expect(raw).not.toMatch(/"public_token":"(?!review-redacted)[^"]+"/);
  });
});
