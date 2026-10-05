#!/usr/bin/env node
/**
 * Process pending geometry-complete jobs when OPENART_MCP_BRIDGE is set.
 * Tracks retries per resident; updates _autogen_state.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const QUEUE = path.join(PACK, '_job_queue.json');
const STATE = path.join(PACK, '_autogen_state.json');
const PROJECT = 'Q7IHYCEK3RPn2c1ConEG';
const RESIDENT_ORDER = ['SW-001', 'SW-002', 'SW-003', 'SW-004', 'SW-005', 'SW-006', 'SW-007', 'SW-008'];

function loadState() {
  if (fs.existsSync(STATE)) return JSON.parse(fs.readFileSync(STATE, 'utf8'));
  return {
    generated: 0,
    skipped: 0,
    valid: 0,
    failed: 0,
    retries_by_resident: Object.fromEntries(RESIDENT_ORDER.map((id) => [id, 0])),
    failures: [],
  };
}

function saveState(s) {
  fs.writeFileSync(STATE, `${JSON.stringify({ ...s, updatedAt: new Date().toISOString() }, null, 2)}\n`);
}

function mcpCall(tool, args) {
  const bridge = process.env.OPENART_MCP_BRIDGE;
  if (!bridge) throw new Error('OPENART_MCP_BRIDGE not set');
  const payload = JSON.stringify({ namespace: 'openart', tool, arguments: args });
  const r = spawnSync(bridge, [], { input: payload, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || `bridge exit ${r.status}`);
  const text = r.stdout.trim();
  return JSON.parse(text);
}

async function waitDone(historyId) {
  for (let i = 0; i < 30; i++) {
    const wait = mcpCall('openart_creation_wait', { historyId, timeoutSeconds: 90 });
    if (wait.status === 'COMPLETED' && wait.resources?.[0]?.url) return wait;
    if (wait.status === 'FAILED' || wait.status === 'CANCELLED') throw new Error(wait.error || wait.status);
  }
  throw new Error(`timeout ${historyId}`);
}

function exists(job) {
  const p = path.join(ROOT, job.relative_path);
  return fs.existsSync(p) && fs.statSync(p).size > 500;
}

function record(job, historyId, outputUrl, retryCount, status) {
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
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
}

function markFounderReview(job, retryCount, historyId, err) {
  const master = path.join(PACK, 'geometry_complete_master_manifest.json');
  const data = JSON.parse(fs.readFileSync(master, 'utf8'));
  const res = data.residents.find((x) => x.resident_id === job.residentId);
  const asset = res?.assets.find((a) => a.slot === job.slot);
  if (asset) {
    Object.assign(asset, {
      openart_generation_id: historyId || null,
      approval_status: 'FOUNDER_REVIEW_REQUIRED',
      geometry_status: 'FAILED',
      retry_count: retryCount,
      failure_note: String(err).slice(0, 500),
      updated_at: new Date().toISOString(),
    });
    fs.writeFileSync(master, `${JSON.stringify(data, null, 2)}\n`);
  }
}

async function runJob(job, state) {
  if (exists(job)) {
    state.skipped += 1;
    saveState(state);
    return;
  }
  let retry = 0;
  let lastHistory = null;
  let lastErr = null;
  while (retry <= 1) {
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
      lastHistory = sub.historyId;
      const done = await waitDone(sub.historyId);
      record(job, sub.historyId, done.resources[0].url, retry, 'IN_REVIEW');
      state.generated += 1;
      state.valid += 1;
      state.retries_by_resident[job.residentId] += retry;
      saveState(state);
      console.error(`OK ${job.residentId} ${job.slot} retry=${retry}`);
      return;
    } catch (e) {
      lastErr = e;
      if (retry >= 1) break;
      retry += 1;
      state.retries_by_resident[job.residentId] += 1;
    }
  }
  state.failed += 1;
  state.retries_by_resident[job.residentId] += retry;
  state.failures.push({ residentId: job.residentId, slot: job.slot, error: String(lastErr?.message || lastErr) });
  markFounderReview(job, retry, lastHistory, lastErr);
  saveState(state);
  console.error(`FAIL ${job.residentId} ${job.slot}`, lastErr);
}

const jobs = JSON.parse(fs.readFileSync(QUEUE, 'utf8'));
const only = process.argv[2] ? process.argv[2].split(',') : RESIDENT_ORDER;
const maxJobs = Number(process.argv[3] || 9999);
const state = loadState();
let n = 0;

for (const id of only) {
  for (const job of jobs.filter((j) => j.residentId === id)) {
    if (n >= maxJobs) break;
    await runJob(job, state);
    n += 1;
  }
}

console.log(JSON.stringify(state, null, 2));
