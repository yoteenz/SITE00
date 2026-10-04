#!/usr/bin/env node
/** Print OpenArt MCP payload for one validation frame (stdout JSON). */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const refs = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION/openart_visual_references.json'),
    'utf8',
  ),
);
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, 'artifacts/STUDIO_WORLD_RESIDENT_FABRICATION_VALIDATION/validation_manifest.json'),
    'utf8',
  ),
);

const residentId = process.argv[2];
const frameType = process.argv[3];
const res = manifest.residents.find((r) => r.resident_id === residentId);
const frame = res.frames.find((f) => f.frame_type === frameType);
const r = refs[residentId];
const visualReferences =
  frameType === 'WORK_PORTRAIT_FRONT'
    ? [r.casting]
    : [r.casting, r.fullBody];

console.log(
  JSON.stringify({
    model: 'gpt-image-2-5-sunburst',
    mode: 'image2image',
    projectId: 'Q7IHYCEK3RPn2c1ConEG',
    params: {
      prompt: frame.prompt,
      visualReferences,
      aspectRatio: frameType === 'WORK_PORTRAIT_FRONT' ? '3:4' : '9:16',
      resolutionTier: '2k',
      quality: 'high',
      autoEnhancePrompt: false,
      outputFormat: 'png',
      variant: 'sunburst',
    },
    meta: { residentId, frameType, file: frame.file, folder: res.resident_name },
  }),
);
