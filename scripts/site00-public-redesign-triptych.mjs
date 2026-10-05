#!/usr/bin/env node
/**
 * Builds docs/site00/public-redesign/opus-proof/<id>/comparison.jpg = AUTHORITY | SONNET BEFORE | OPUS AFTER
 * (390-px-wide frames side by side) for every authority folder that has all three captures.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.argv[2] ?? 'docs/site00/public-redesign/opus-proof');
let n = 0;
for (const id of fs.readdirSync(ROOT).filter((f) => !f.startsWith('_'))) {
  const dir = path.join(ROOT, id);
  const files = ['authority.jpg', 'before.png', 'after.png'].map((f) => path.join(dir, f));
  if (!files.every((f) => fs.existsSync(f))) continue;
  const metas = await Promise.all(files.map((f) => sharp(f).metadata()));
  const H = Math.max(...metas.map((m) => m.height));
  let x = 0;
  const composites = [];
  for (let i = 0; i < files.length; i += 1) {
    composites.push({ input: files[i], left: x, top: 0 });
    x += metas[i].width + 6;
  }
  await sharp({ create: { width: x - 6, height: H, channels: 3, background: '#7a7a7a' } })
    .composite(composites)
    .jpeg({ quality: 74 })
    .toFile(path.join(dir, 'comparison.jpg'));
  n += 1;
}
console.log(`wrote ${n} comparison triptychs`);
