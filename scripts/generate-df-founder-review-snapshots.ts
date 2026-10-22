/**
 * Founder board review snapshots (boards 13–15C) for `/foundation/review`.
 * Built with the real operations engine on the in-memory store: payment, runbook activation, start-task and
 * complete-task only. No verification pass is recorded and no provider action runs.
 * Run: npx tsx scripts/generate-df-founder-review-snapshots.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as mem from '../api/_lib/digitalFoundation/memoryStore.js';
import { materializeFixtureScenario } from '../api/_lib/digitalFoundation/service.js';
import {
  completeTask,
  getPipelineView,
  getProjectCommandSnapshot,
  getRunbookView,
  setBlocker,
  startTask,
} from '../api/_lib/digitalFoundation/operationsEngine.js';
import { orderedTasks } from '../src/site00/admin/pages/foundation/boards/founderBoardModel.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = join(root, 'src/site00/pages/foundation/generated/reviewFounderSnapshots.json');

async function project(scenario: string, business: string) {
  const { artifact } = await materializeFixtureScenario(scenario);
  const a = mem.memGetArtifact(artifact.artifact_id)!;
  a.intake.business_name = business;
  const lead = mem.memGetLead(a.lead_id);
  if (lead) lead.business_name = business;
  return a.artifact_id;
}

function nextFounderTask(artifactId: string) {
  return orderedTasks(getRunbookView(artifactId).tasks).find(
    (t) => t.status === 'READY' && t.execution_mode !== 'CLIENT_ACTION',
  );
}

/** Start and finish founder-side tasks in runbook order. Verification tasks stop at READY_TO_VERIFY. */
function advance(artifactId: string, count: number) {
  for (let i = 0; i < count; i++) {
    const t = nextFounderTask(artifactId);
    if (!t) return;
    startTask(artifactId, t.task_id);
    completeTask(artifactId, t.task_id);
  }
}

function redact<T>(value: T): T {
  return JSON.parse(JSON.stringify(value).replace(/"public_token":"[^"]*"/g, '"public_token":"review-redacted"')) as T;
}

async function main() {
  mem.resetDigitalFoundationMemoryStore();

  const focus = await project('J_PAYMENT_SUCCESS', 'Review Foundation Co');
  advance(focus, 9);
  const inProgress = nextFounderTask(focus);
  if (inProgress) startTask(focus, inProgress.task_id);

  const blocked = await project('J_PAYMENT_SUCCESS', 'Review Blocked Studio');
  advance(blocked, 2);
  const stuck = nextFounderTask(blocked);
  if (stuck) setBlocker(blocked, stuck.task_id, 'CLIENT_AUTH_REQUIRED', 'Registrar access needed from client');

  await project('A_BASE', 'Review Quoted Group');
  await project('K_PAYMENT_FAILURE', 'Review Payment Retry');
  await project('M_COMPLETE_CREDIT', 'Review Complete Works');

  const runbook = getRunbookView(focus);
  const ordered = orderedTasks(runbook.tasks);
  const taskFocus =
    ordered.find((t) => t.status === 'IN_PROGRESS') ??
    ordered.find((t) => t.status === 'READY_TO_VERIFY') ??
    ordered.find((t) => t.verification_rule_id) ??
    ordered[0];

  const out = redact({
    generated_at: new Date().toISOString(),
    focus_artifact_id: focus,
    focus_task_id: taskFocus?.task_id ?? null,
    pipeline: getPipelineView(),
    project_command: getProjectCommandSnapshot(focus),
    runbook,
  });

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(out, null, 2));
  const statuses = ordered.reduce<Record<string, number>>((acc, t) => ((acc[t.status] = (acc[t.status] ?? 0) + 1), acc), {});
  console.log(`Wrote ${outFile}`);
  console.log('focus task', taskFocus?.title, taskFocus?.status, 'statuses', statuses);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
