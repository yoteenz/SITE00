#!/usr/bin/env node
/**
 * Headless batch driver for resident geometry OpenArt jobs.
 * Requires OPENART_MCP_BRIDGE: path to executable that reads one JSON line stdin
 * { tool, arguments } and prints one JSON line stdout (MCP tool result).
 * Cloud agents without a bridge should run generations via OpenArt MCP namespace directly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const PACK = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION');
const QUEUE_PATH =
  process.env.SW_GEO_QUEUE ??
  path.join(PACK, '_job_queue_sw001_005.json');
const STATE_PATH = path.join(PACK, '_autogen_state.json');
const CREDITS_PER = 152;
const MAX_RETRIES = 2;
const PROJECT_ID = 'Q7IHYCEK3RPn2c1ConEG';

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { nextIndex: 0, creditsUsed: 0 };
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(s) {
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(s, null, 2)}\n`);
}

function mcpCall(tool, args) {
  const bridge = process.env.OPENART_MCP_BRIDGE;
  if (!bridge) {
    throw new Error(
      'OPENART_MCP_BRIDGE not set — export path to MCP bridge executable (reads/writes JSON lines)',
    );
  }
  const payload = JSON.stringify({ namespace: 'openart', tool, arguments: args });
  const r = spawnSync(bridge, [], { input: payload, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || `bridge exit ${r.status}`);
  return JSON.parse(r.stdout.trim());
}

async function generateAndWait(job) {
  const params = {
    prompt: job.prompt,
    imageCount: 1,
    aspectRatio: job.aspectRatio,
    resolutionTier: '2k',
    quality: 'high',
    outputFormat: 'png',
    autoEnhancePrompt: false,
    visualReferences: [job.visualReference],
  };
  let retry = 0;
  while (retry <= MAX_RETRIES) {
    try {
      const sub = mcpCall('openart_generate_image', {
        model: 'gpt-image-2-5-sunburst',
        mode: 'image2image',
        projectId: PROJECT_ID,
        params,
      });
      const historyId = sub.historyId;
      if (!historyId) throw new Error(`no historyId: ${JSON.stringify(sub).slice(0, 200)}`);
      let wait = sub;
      for (let i = 0; i < 20 && wait.status !== 'COMPLETED' && wait.status !== 'FAILED'; i++) {
        wait = mcpCall('openart_creation_wait', { historyId, timeoutSeconds: 90 });
      }
      if (wait.status === 'COMPLETED' && wait.resources?.[0]?.url) {
        return {
          ok: true,
          historyId,
          outputUrl: wait.resources[0].url,
          retryCount: retry,
        };
      }
      throw new Error(wait.error || wait.status || 'generation failed');
    } catch (e) {
      retry += 1;
      if (retry > MAX_RETRIES) {
        return { ok: false, retryCount: retry, error: String(e.message || e) };
      }
    }
  }
  return { ok: false, retryCount: MAX_RETRIES, error: 'exhausted retries' };
}

function record(job, result) {
  const entry = {
    residentId: job.residentId,
    frameNumber: job.frameNumber,
    historyId: result.historyId ?? null,
    outputUrl: result.outputUrl ?? null,
    retryCount: result.retryCount ?? 0,
    status: result.ok ? 'COMPLETED' : 'FAILED',
    error: result.error ?? null,
  };
  const r = spawnSync('npx', ['tsx', 'scripts/studio-world-resident-fabrication-openart-runner.mjs', 'record', JSON.stringify(entry)], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
}

async function run({ maxJobs, startIndex, batchPauseMs = 800 }) {
  const jobs = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  const state = loadState();
  let idx = startIndex ?? state.nextIndex ?? 0;
  let processed = 0;
  const budget = process.env.SW_GEO_MAX_CREDITS
    ? Math.floor(Number(process.env.SW_GEO_MAX_CREDITS) / CREDITS_PER)
    : jobs.length;

  while (idx < jobs.length && processed < (maxJobs ?? jobs.length) && processed < budget) {
    const job = jobs[idx];
    console.log(`[autogen] ${idx + 1}/${jobs.length} ${job.residentId} frame ${job.frameNumber}`);
    const result = await generateAndWait(job);
    record(job, result);
    state.nextIndex = idx + 1;
    state.creditsUsed = (state.creditsUsed ?? 0) + (result.ok ? CREDITS_PER : 0);
    saveState(state);
    idx += 1;
    processed += 1;
    if (batchPauseMs) await new Promise((r) => setTimeout(r, batchPauseMs));
  }
  console.log('[autogen] done processed', processed, 'nextIndex', state.nextIndex);
}

const cmd = process.argv[2] ?? 'run';
if (cmd === 'run') {
  const maxJobs = process.argv[3] ? Number(process.argv[3]) : undefined;
  await run({ maxJobs });
} else if (cmd === 'status') {
  console.log(JSON.stringify(loadState(), null, 2));
} else {
  console.error('Usage: autogen.mjs run [maxJobs]|status');
  process.exit(1);
}
