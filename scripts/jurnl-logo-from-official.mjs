/**
 * JURNL official logo → transparent runtime mark (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * Source: the founder's OFFICIAL logo authority (REFERENCE/REFERENCE_JURNL_LOGO_OFFICIAL.jpg) — never a crop
 * from a generated screen. The white field becomes alpha; ink keeps the official muted-rose colour.
 *
 * Usage: node scripts/jurnl-logo-from-official.mjs <official.jpg> <out.png>
 */
import sharp from 'sharp';

const [src, out] = process.argv.slice(2);
if (!src || !out) throw new Error('usage: jurnl-logo-from-official.mjs <official.jpg> <out.png>');

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const n = info.width * info.height;
// Official ink colour = mean of clearly-inked pixels.
let r = 0, g = 0, b = 0, k = 0;
for (let i = 0; i < n; i++) {
  const [R, G, B] = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  if ((R + G + B) / 3 < 150) { r += R; g += G; b += B; k++; }
}
const ink = [Math.round(r / k), Math.round(g / k), Math.round(b / k)];
const rgba = Buffer.alloc(n * 4);
for (let i = 0; i < n; i++) {
  const lum = (data[i * 3] + data[i * 3 + 1] + data[i * 3 + 2]) / 3;
  const inkLum = (ink[0] + ink[1] + ink[2]) / 3;
  const a = Math.max(0, Math.min(1, (245 - lum) / (245 - inkLum)));
  rgba[i * 4] = ink[0];
  rgba[i * 4 + 1] = ink[1];
  rgba[i * 4 + 2] = ink[2];
  rgba[i * 4 + 3] = Math.round(a * 255);
}
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ threshold: 1 })
  .resize({ height: 512 })
  .png({ compressionLevel: 9 })
  .toFile(out);
const meta = await sharp(out).metadata();
console.log(JSON.stringify({ ink: `rgb(${ink.join(',')})`, width: meta.width, height: meta.height }));

// Square project cover for SITE 00 host selectors (official mark centred on JURNL bone).
const coverOut = out.replace(/\.png$/, '').replace(/jurnl-logo-official$/, 'jurnl-cover') + '.png';
const mark = await sharp(out).resize({ height: 360 }).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#F9F6EF' } })
  .composite([{ input: mark, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(coverOut);
console.log(JSON.stringify({ cover: coverOut }));
