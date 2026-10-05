#!/usr/bin/env node
/**
 * Run validation OpenArt jobs via OPENART_MCP_BRIDGE (JSON line in/out).
 * Bridge line: {"namespace":"openart","tool":"...","arguments":{...}} → tool result JSON.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const RESIDENTS = ['SW-001', 'SW-002', 'SW-003', 'SW-004', 'SW-005', 'SW-006', 'SW-007', 'SW-008'];
const FRAMES = ['WORK_PORTRAIT_FRONT', 'WORK_FULL_BODY_FRONT'];

function mcpCall(tool, args) {
  const bridge = process.env.OPENART_MCP_BRIDGE;
  if (!bridge) throw new Error('OPENART_MCP_BRIDGE not set');
  const payload = JSON.stringify({ namespace: 'openart', tool, arguments: args });
  const r = spawnSync(bridge, [], { input: payload, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || `bridge exit ${r.status}`);
  return JSON.parse(r.stdout.trim());
}

async function waitDone(historyId) {
  for (let i = 0; i < 30; i++) {
    const wait = mcpCall('openart_creation_wait', { historyId, timeoutSeconds: 90 });
    if (wait.status === 'COMPLETED' && wait.resources?.[0]?.url) return wait;
    if (wait.status === 'FAILED' || wait.status === 'CANCELLED') throw new Error(wait.error || wait.status);
    if (wait.status !== 'STILL_RUNNING' && wait.status !== 'PENDING') break;
  }
  throw new Error(`timeout waiting for ${historyId}`);
}

function recordFrame(residentId, frameType, historyId, url, retryCount) {
  const r = spawnSync(
    'node',
    [
      'scripts/studio-world-validation-openart-build-record.mjs',
      residentId,
      frameType,
      historyId,
      url,
      String(retryCount),
    ],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  const entry = r.stdout.trim();
  spawnSync('node', ['scripts/studio-world-resident-fabrication-validation-openart.mjs', 'record', entry], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

async function runOne(residentId, frameType, maxRetry = 1) {
  const runOne = spawnSync('node', ['scripts/studio-world-validation-openart-run-one.mjs', residentId, frameType], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (runOne.status !== 0) throw new Error(runOne.stderr || runOne.stdout);
  const job = JSON.parse(runOne.stdout.trim());
  let retry = 0;
  while (retry <= maxRetry) {
    try {
      const sub = mcpCall('openart_generate_image', {
        model: job.model,
        mode: job.mode,
        projectId: job.projectId,
        params: job.params,
      });
      const done = await waitDone(sub.historyId);
      recordFrame(residentId, frameType, sub.historyId, done.resources[0].url, retry);
      return { ok: true, retryCount: retry, historyId: sub.historyId };
    } catch (e) {
      retry += 1;
      if (retry > maxRetry) return { ok: false, retryCount: retry, error: String(e.message || e) };
    }
  }
  return { ok: false, retryCount: maxRetry, error: 'exhausted' };
}

const only = process.argv[2] ? process.argv[2].split(',') : RESIDENTS;
const report = { total_retries: 0, validation_blocked: [], frames: [] };

for (const id of only) {
  for (const ft of FRAMES) {
    const result = await runOne(id, ft);
    report.frames.push({ resident_id: id, frame_type: ft, ...result });
    report.total_retries += result.retryCount || 0;
    if (!result.ok) report.validation_blocked.push({ resident_id: id, frame_type: ft, error: result.error });
    console.error(JSON.stringify({ id, ft, ...result }));
  }
}

const out = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION/failure_retry_report.json');
fs.writeFileSync(
  out,
  JSON.stringify(
    {
      sprint: 'P0.STUDIOWORLD.RESIDENT-FABRICATION.AUTHORITY-VALIDATION.RESUME16.OPENART2',
      ...report,
      notes: 'Generated via batch-run + OPENART_MCP_BRIDGE',
    },
    null,
    2,
  ),
);
console.log('Wrote', out);
