#!/usr/bin/env node
/**
 * Run geometry-complete OpenArt jobs via OPENART_MCP_BRIDGE (JSON line in/out).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const QUEUE = path.join(PACK, '_job_queue.json');
const PROJECT = 'Q7IHYCEK3RPn2c1ConEG';
const RESIDENT_ORDER = ['SW-001', 'SW-002', 'SW-003', 'SW-004', 'SW-005', 'SW-006', 'SW-007', 'SW-008'];

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
    if (wait.status !== 'STILL_RUNNING' && wait.status !== 'PENDING' && wait.status !== 'RUNNING') break;
  }
  throw new Error(`timeout waiting for ${historyId}`);
}

function outputExists(relativePath) {
  const abs = path.join(ROOT, relativePath);
  return fs.existsSync(abs) && fs.statSync(abs).size > 500;
}

function recordJob(job, historyId, outputUrl, retryCount, status) {
  const entry = {
    residentId: job.residentId,
    slot: job.slot,
    historyId,
    outputUrl,
    retryCount,
    status,
  };
  const r = spawnSync(
    'npx',
    ['tsx', 'scripts/studio-world-resident-geometry-complete-openart.mjs', 'record', JSON.stringify(entry)],
    { cwd: ROOT, stdio: 'inherit' },
  );
  if (r.status !== 0) throw new Error(`record failed ${job.residentId} ${job.slot}`);
}

async function runOne(job, maxRetry = 1) {
  if (outputExists(job.relative_path)) {
    return { ok: true, skipped: true, retryCount: 0 };
  }
  let retry = 0;
  while (retry <= maxRetry) {
    try {
      const sub = mcpCall('openart_generate_image', {
        model: 'gpt-image-2-5-sunburst',
        mode: 'image2image',
        projectId: PROJECT,
        params: {
          prompt: job.prompt,
          visualReferences: job.visualReferences,
          aspectRatio: job.aspectRatio,
          resolutionTier: '2k',
          quality: 'high',
          autoEnhancePrompt: false,
          outputFormat: 'png',
          variant: 'sunburst',
        },
      });
      const done = await waitDone(sub.historyId);
      recordJob(job, sub.historyId, done.resources[0].url, retry, 'IN_REVIEW');
      return { ok: true, skipped: false, retryCount: retry, historyId: sub.historyId };
    } catch (e) {
      retry += 1;
      if (retry > maxRetry) {
        try {
          recordJob(job, `failed-${Date.now()}`, 'https://invalid.local/placeholder.png', retry, 'FOUNDER_REVIEW_REQUIRED');
        } catch {
          /* record may fail without url — founder path */
        }
        return { ok: false, skipped: false, retryCount: retry, error: String(e.message || e) };
      }
    }
  }
  return { ok: false, skipped: false, retryCount: maxRetry, error: 'exhausted' };
}

const jobs = JSON.parse(fs.readFileSync(QUEUE, 'utf8'));
const onlyResidents = process.argv[2] ? process.argv[2].split(',') : RESIDENT_ORDER;
const ordered = RESIDENT_ORDER.flatMap((id) => jobs.filter((j) => j.residentId === id)).filter((j) =>
  onlyResidents.includes(j.residentId),
);

const report = {
  generated: 0,
  skipped: 0,
  valid: 0,
  failed: 0,
  retries_by_resident: Object.fromEntries(onlyResidents.map((id) => [id, 0])),
  failures: [],
};

for (const job of ordered) {
  if (outputExists(job.relative_path)) {
    report.skipped += 1;
    continue;
  }
  const result = await runOne(job);
  if (result.skipped) {
    report.skipped += 1;
    continue;
  }
  report.retries_by_resident[job.residentId] += result.retryCount || 0;
  if (result.ok) {
    report.generated += 1;
    report.valid += 1;
  } else {
    report.failed += 1;
    report.failures.push({ residentId: job.residentId, slot: job.slot, error: result.error });
  }
  console.error(JSON.stringify({ job: `${job.residentId}/${job.slot}`, ...result }));
}

const statePath = path.join(PACK, '_autogen_state.json');
fs.writeFileSync(statePath, `${JSON.stringify({ finishedAt: new Date().toISOString(), ...report }, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
