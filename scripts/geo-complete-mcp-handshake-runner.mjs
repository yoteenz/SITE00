#!/usr/bin/env node
/**
 * Process geometry-complete queue via file handshake (cloud agent fulfills OpenArt MCP).
 * Active request: artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/_mcp_active_request.json
 * Active response: artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/_mcp_active_response.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
const QUEUE = path.join(PACK, '_job_queue.json');
const REQ = path.join(PACK, '_mcp_active_request.json');
const RES = path.join(PACK, '_mcp_active_response.json');
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

function exists(job) {
  const p = path.join(ROOT, job.relative_path);
  return fs.existsSync(p) && fs.statSync(p).size > 500;
}

function mcpRound(type, payload, timeoutMs = 180000) {
  fs.writeFileSync(
    REQ,
    `${JSON.stringify({ type, ...payload, requestedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  try {
    fs.unlinkSync(RES);
  } catch {
    /* ok */
  }
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(RES)) {
      const body = JSON.parse(fs.readFileSync(RES, 'utf8'));
      fs.unlinkSync(RES);
      if (body.error) throw new Error(body.error);
      return body;
    }
    spawnSync('sleep', ['0.5'], { stdio: 'ignore' });
  }
  throw new Error(`MCP handshake timeout for ${type}`);
}

function record(job, historyId, outputUrl, retryCount, status) {
  const entry = { residentId: job.residentId, slot: job.slot, historyId, outputUrl, retryCount, status };
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
      const sub = mcpRound('generate', {
        job: { residentId: job.residentId, slot: job.slot },
        call: {
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
        },
      });
      lastHistory = sub.historyId;
      const done = mcpRound('wait', { historyId: sub.historyId, timeoutSeconds: 90 }, 120000);
      if (done.status !== 'COMPLETED' || !done.resources?.[0]?.url) {
        throw new Error(done.error || done.status || 'no url');
      }
      record(job, sub.historyId, done.resources[0].url, retry, 'IN_REVIEW');
      state.generated += 1;
      state.valid += 1;
      state.retries_by_resident[job.residentId] += retry;
      saveState(state);
      console.error(`OK ${job.residentId} ${job.slot}`);
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
const state = loadState();

for (const id of only) {
  for (const job of jobs.filter((j) => j.residentId === id)) {
    await runJob(job, state);
  }
}

console.log(JSON.stringify(state, null, 2));
