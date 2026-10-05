#!/usr/bin/env node
/** Emit OpenArt MCP generate payload(s) for geometry-complete queue indices. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const QUEUE = path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE/_job_queue.json');
const PROJECT = 'Q7IHYCEK3RPn2c1ConEG';
const jobs = JSON.parse(fs.readFileSync(QUEUE, 'utf8'));

function exists(job) {
  const p = path.join(ROOT, job.relative_path);
  return fs.existsSync(p) && fs.statSync(p).size > 500;
}

function payload(job) {
  return {
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
    _meta: { residentId: job.residentId, slot: job.slot, relative_path: job.relative_path },
  };
}

const start = Number(process.argv[2] ?? 0);
const count = Number(process.argv[3] ?? 1);
const out = [];
for (let i = start; i < jobs.length && out.length < count; i++) {
  if (exists(jobs[i])) continue;
  out.push({ index: i, ...payload(jobs[i]) });
}
console.log(JSON.stringify(out));
