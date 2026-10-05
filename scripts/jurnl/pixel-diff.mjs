/**
 * Pixel diff of two capture folders (same file names): node scripts/jurnl/pixel-diff.mjs <dirA> <dirB> [out.json]
 * Reports differing pixels per file (channel delta > 8 counts as different).
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
const [a, b, out] = process.argv.slice(2);
const rows = [];
for (const f of readdirSync(a).filter((x) => x.endsWith('.png')).sort()) {
  const [x, y] = await Promise.all([a, b].map((d) => sharp(join(d, f)).raw().toBuffer({ resolveWithObject: true })));
  if (x.info.width !== y.info.width || x.info.height !== y.info.height) {
    rows.push({ file: f, sizeMismatch: true, diffPixels: -1 });
    continue;
  }
  let diff = 0;
  const ch = x.info.channels;
  for (let i = 0; i < x.data.length; i += ch) {
    for (let c = 0; c < 3; c++) {
      if (Math.abs(x.data[i + c] - y.data[i + c]) > 8) {
        diff++;
        break;
      }
    }
  }
  rows.push({ file: f, diffPixels: diff, share: +(diff / (x.info.width * x.info.height)).toFixed(6) });
}
const changed = rows.filter((r) => r.diffPixels !== 0);
const summary = { files: rows.length, identical: rows.length - changed.length, changed: changed.length, maxShare: Math.max(0, ...rows.map((r) => r.share ?? 1)) };
if (out) writeFileSync(out, JSON.stringify({ summary, rows }, null, 2));
console.log(JSON.stringify(summary));
for (const r of changed) console.log(JSON.stringify(r));
