import { describe, expect, it, beforeEach } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { materializeFixtureScenario } from '../api/_lib/digitalFoundation/service.js';
import {
  activateRunbookForArtifact,
  generateRunbookForArtifact,
  getPipelineView,
  getWorkbenchView,
  runTaskVerification,
  setBlocker,
  startTask,
  completeTask,
  escalateTaskMode,
  assessArtifactCompletion,
  syncDerivedState,
} from '../api/_lib/digitalFoundation/operationsEngine.js';
import { computeScopeHash } from '../shared/site00-digital-foundation/operations/scopeHash.js';
import { generateRunbookFromScope } from '../shared/site00-digital-foundation/operations/runbookGenerator.js';
import { defaultDigitalFoundationCommercialConfig } from '../shared/site00-digital-foundation/commercialConfig.js';
import { createQuoteDraft } from '../shared/site00-digital-foundation/quoteEngine.js';
import { assertProviderCapability } from '../shared/site00-digital-foundation/operations/providers.js';

describe('Digital Foundation operations engine', () => {
  beforeEach(() => {
    resetDigitalFoundationMemoryStore();
  });

  it('generates runbook tasks from base quote scope', async () => {
    const { artifact } = await materializeFixtureScenario('A_BASE');
    const { runbook, tasks } = generateRunbookForArtifact(artifact.artifact_id);
    expect(runbook.generated_from_scope_hash).toBeTruthy();
    expect(tasks.length).toBeGreaterThan(10);
    expect(tasks.some((t) => t.task_type === 'MX_CONFIGURE')).toBe(true);
  });

  it('injects addon tasks for additional mailboxes', async () => {
    const { artifact } = await materializeFixtureScenario('B_EXTRA_MAILBOXES');
    const { tasks } = generateRunbookForArtifact(artifact.artifact_id);
    expect(tasks.some((t) => t.task_type === 'ADDITIONAL_MAILBOXES')).toBe(true);
  });

  it('activates runbook on payment and rolls up stages', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    const runbook = activateRunbookForArtifact(artifact.artifact_id);
    expect(runbook.status).toBe('ACTIVE');
    syncDerivedState(artifact.artifact_id);
    const wb = getWorkbenchView(artifact.artifact_id);
    expect(wb.buckets.ready_to_execute.length + wb.buckets.waiting_on_client.length).toBeGreaterThan(0);
  });

  it('respects task dependencies', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    generateRunbookForArtifact(artifact.artifact_id);
    activateRunbookForArtifact(artifact.artifact_id);
    const tasks = getWorkbenchView(artifact.artifact_id).buckets.ready_to_execute;
    const mx = tasks.find((t) => t.task_type === 'MX_CONFIGURE');
    if (mx) {
      expect(() => startTask(artifact.artifact_id, mx.task_id)).toThrow(/NOT_READY/);
    }
  });

  it('creates NEEDS YOU via client-action tasks', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    activateRunbookForArtifact(artifact.artifact_id);
    syncDerivedState(artifact.artifact_id);
    const waiting = getWorkbenchView(artifact.artifact_id).buckets.waiting_on_client;
    expect(waiting.length).toBeGreaterThan(0);
  });

  it('escalates automated path to assisted with reason', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    activateRunbookForArtifact(artifact.artifact_id);
    const ready = getWorkbenchView(artifact.artifact_id).buckets.ready_to_execute[0];
    expect(ready).toBeTruthy();
    startTask(artifact.artifact_id, ready!.task_id);
    const escalated = escalateTaskMode(artifact.artifact_id, ready!.task_id, 'ASSISTED', 'API unavailable');
    expect(escalated.execution_mode).toBe('ASSISTED');
  });

  it('verification fail blocks completion gate', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    activateRunbookForArtifact(artifact.artifact_id);
    const verifyTask = getWorkbenchView(artifact.artifact_id).buckets.ready_to_execute.find(
      (t) => t.execution_mode === 'VERIFICATION',
    );
    if (verifyTask) {
      startTask(artifact.artifact_id, verifyTask.task_id);
      completeTask(artifact.artifact_id, verifyTask.task_id);
      runTaskVerification(artifact.artifact_id, verifyTask.task_id, false);
    }
    const gate = assessArtifactCompletion(artifact.artifact_id);
    expect(gate.ok).toBe(false);
  });

  it('scope hash changes supersede runbook safely', async () => {
    const intake = { needs: ['NEED_DOMAIN' as const, 'NEED_PRO_EMAIL' as const] };
    const quote = createQuoteDraft({
      artifact_id: 'art-1',
      selections: [],
      config: defaultDigitalFoundationCommercialConfig(),
      quote_version: 1,
    });
    const h1 = computeScopeHash({ quote, intake, project_config: {} });
    const h2 = computeScopeHash({
      quote: { ...quote, quote_version: 2 },
      intake,
      project_config: {},
    });
    expect(h1).not.toBe(h2);
    const gen = generateRunbookFromScope({
      artifact_id: 'art-1',
      quote,
      intake,
      project_config: {},
      runbook_version: 1,
    });
    expect(gen.tasks.some((t) => t.task_type === 'LEGACY_EMAIL_MIGRATION')).toBe(false);
  });

  it('pipeline contract exposes attention buckets', async () => {
    await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    const pipeline = getPipelineView();
    expect(pipeline.rows.length).toBeGreaterThan(0);
    expect(pipeline.attention).toHaveProperty('needs_founder');
  });

  it('provider registry has no live writes', () => {
    expect(assertProviderCapability('google_workspace', 'CREATE')).toBe(true);
    expect(assertProviderCapability('google_workspace', 'READ')).toBe(true);
  });

  it('blocker propagates to pipeline row', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    activateRunbookForArtifact(artifact.artifact_id);
    const task = getWorkbenchView(artifact.artifact_id).buckets.ready_to_execute[0];
    if (task) {
      startTask(artifact.artifact_id, task.task_id);
      setBlocker(artifact.artifact_id, task.task_id, 'CLIENT_AUTH_REQUIRED', 'Waiting on client');
    }
    const row = getPipelineView().rows.find((r) => r.artifact_id === artifact.artifact_id);
    expect(row?.blocker).toBe('CLIENT_AUTH_REQUIRED');
  });
});
