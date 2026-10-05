#!/usr/bin/env node
/** Print OpenArt generate_image params for job index from queue JSON. */
import fs from 'node:fs';

const queuePath =
  process.argv[3] ??
  'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION/_job_queue_sw001_005.json';
const index = Number(process.argv[2]);
const jobs = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const job = jobs[index];
if (!job) {
  console.error('No job at index', index);
  process.exit(1);
}
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
console.log(
  JSON.stringify({
    model: 'gpt-image-2-5-sunburst',
    mode: 'image2image',
    projectId: 'Q7IHYCEK3RPn2c1ConEG',
    params,
    meta: {
      residentId: job.residentId,
      frameNumber: job.frameNumber,
      relative_path: job.relative_path,
    },
  }),
);
