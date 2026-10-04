#!/usr/bin/env node
/**
 * Single queue step: load job by index, optionally invoke OPENART_MCP_BRIDGE, else emit MCP payload on stdout.
 * Cloud agent loop: submit openart_generate_image → openart_creation_wait → runner record.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const QUEUE =
  process.argv[3] ??
  path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/_job_queue_sw001_005.json');
const emitOnly = process.argv[2] === 'emit';
const index = Number(emitOnly ? process.argv[3] : process.argv[2]);
const jobs = JSON.parse(fs.readFileSync(QUEUE, 'utf8'));
const job = jobs[index];
if (!Number.isFinite(index) || !job) {
  console.error('Usage: batch-step.mjs <index> | batch-step.mjs emit <index>');
  process.exit(1);
}

function mcpCall(tool, args) {
  const bridge = process.env.OPENART_MCP_BRIDGE;
  if (!bridge) return null;
  const payload = JSON.stringify({ namespace: 'openart', tool, arguments: args });
  const r = spawnSync(bridge, [], { input: payload, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || `bridge exit ${r.status}`);
  return JSON.parse(r.stdout.trim());
}

const payload = {
  model: 'gpt-image-2-5-sunburst',
  mode: 'image2image',
  projectId: 'Q7IHYCEK3RPn2c1ConEG',
  params: {
    prompt: job.prompt,
    imageCount: 1,
    aspectRatio: job.aspectRatio,
    resolutionTier: '2k',
    quality: 'high',
    outputFormat: 'png',
    autoEnhancePrompt: false,
    visualReferences: [job.visualReference],
  },
  meta: {
    residentId: job.residentId,
    frameNumber: job.frameNumber,
    relative_path: job.relative_path,
    queueIndex: index,
  },
};

if (emitOnly || !process.env.OPENART_MCP_BRIDGE) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const sub = mcpCall('openart_generate_image', {
  model: payload.model,
  mode: payload.mode,
  projectId: payload.projectId,
  params: payload.params,
});
let wait = sub;
for (let i = 0; i < 24 && wait.status !== 'COMPLETED' && wait.status !== 'FAILED'; i++) {
  wait = mcpCall('openart_creation_wait', { historyId: sub.historyId, timeoutSeconds: 90 });
}
if (wait.status !== 'COMPLETED' || !wait.resources?.[0]?.url) {
  console.error(JSON.stringify({ error: wait.error || wait.status, historyId: sub.historyId }));
  process.exit(2);
}
const record = {
  residentId: job.residentId,
  frameNumber: job.frameNumber,
  historyId: sub.historyId,
  outputUrl: wait.resources[0].url,
  retryCount: 0,
  status: 'COMPLETED',
};
spawnSync('npx', ['tsx', 'scripts/studio-world-resident-fabrication-openart-runner.mjs', 'record', JSON.stringify(record)], {
  cwd: ROOT,
  stdio: 'inherit',
});
