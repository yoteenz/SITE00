/** Compose captures into a labelled contact sheet: node scripts/jurnl/contact-sheet.mjs <out.png> <cols> <cellW> <img...> */
import sharp from 'sharp';
const [out, cols = '7', cellW = '260', ...imgs] = process.argv.slice(2);
const c = +cols;
const w = +cellW;
const metas = await Promise.all(imgs.map((p) => sharp(p).metadata()));
const h = Math.round((w * metas[0].height) / metas[0].width);
const rows = Math.ceil(imgs.length / c);
const tiles = await Promise.all(imgs.map((p) => sharp(p).resize(w, h, { fit: 'contain', background: '#222' }).toBuffer()));
await sharp({ create: { width: c * w + (c + 1) * 6, height: rows * h + (rows + 1) * 6, channels: 3, background: '#1b1b1b' } })
  .composite(tiles.map((t, i) => ({ input: t, left: 6 + (i % c) * (w + 6), top: 6 + Math.floor(i / c) * (h + 6) })))
  .png()
  .toFile(out);
console.log(out);
