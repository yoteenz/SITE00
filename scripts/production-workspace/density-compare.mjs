#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — screenshot pack.
 *
 * Packs the live-browser captures of density-audit.mjs into a few labelled contact sheets (before = current main,
 * after = this branch), computes the per-state pixel diff and builds the labelled before / after comparison set.
 *
 *   node scripts/production-workspace/density-compare.mjs <beforeDir> <afterDir> <outDir>
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';

const [beforeDir, afterDir, outDir] = process.argv.slice(2);
const FAMILIES = (process.env.FAMILIES ?? 'mobile').split(',');
const W = { mobile: 393, tablet: 417, desktop: 480 }; // stored cell width (mobile 1x, tablet half, desktop third)


// pixel diff before → after for every captured state (all families): share of pixels whose RGB delta > 30
const pixelDiff = {};
for (const family of ['mobile', 'tablet', 'desktop']) {
  if (!existsSync(`${beforeDir}/${family}`) || !existsSync(`${afterDir}/${family}`)) continue;
  for (const f of readdirSync(`${beforeDir}/${family}`).filter((x) => x.endsWith('.png')).sort()) {
    if (!existsSync(`${afterDir}/${family}/${f}`)) continue;
    const [A, B] = await Promise.all([`${beforeDir}/${family}/${f}`, `${afterDir}/${family}/${f}`].map((p) => sharp(p).raw().toBuffer({ resolveWithObject: true })));
    let pct = null;
    if (A.info.width === B.info.width && A.info.height === B.info.height) {
      let diff = 0;
      const ch = A.info.channels;
      for (let i = 0; i < A.data.length; i += ch)
        if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 30) diff++;
      pct = Math.round((diff / (A.info.width * A.info.height)) * 10000) / 100;
    }
    pixelDiff[`${family}/${f.replace(/\.png$/, '')}`] = pct;
  }
}
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/pixel-diff.json`, `${JSON.stringify(pixelDiff, null, 2)}\n`);

// contact sheets (few files, by design: the repo inventory walk is file-count sensitive). Mobile: one sheet per tab,
// one row per captured screen, BEFORE | AFTER. Tablet / desktop: one AFTER sheet per family (pixel-identical to main).
const TAB_OF = (id) => (id === 'hub' ? 'hub' : id.split('-')[0]);
const cellLabel = (text, w) =>
  Buffer.from(`<svg width="${w}" height="24" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111114"/><text x="8" y="16" font-family="Helvetica, Arial, sans-serif" font-size="11" letter-spacing="1" fill="#ffffff">${text}</text></svg>`);
const SHEET_INDEX = {};
mkdirSync(`${outDir}/sheets`, { recursive: true });
if (FAMILIES.includes('mobile') && existsSync(`${afterDir}/mobile`)) {
  const shots = readdirSync(`${afterDir}/mobile`).filter((x) => x.endsWith('.png')).sort();
  const byTab = {};
  for (const f of shots) (byTab[TAB_OF(f.replace(/-\d+\.png$/, ''))] ??= []).push(f);
  for (const [tab, files] of Object.entries(byTab)) {
    const cw = 393;
    const rows = await Promise.all(
      files.map(async (f) => {
        const b = existsSync(`${beforeDir}/mobile/${f}`) ? await sharp(`${beforeDir}/mobile/${f}`).resize({ width: cw }).png().toBuffer() : null;
        const a = await sharp(`${afterDir}/mobile/${f}`).resize({ width: cw }).png().toBuffer();
        const h = Math.max((await sharp(a).metadata()).height, b ? (await sharp(b).metadata()).height : 0);
        return { f, b, a, h };
      }),
    );
    const W = cw * 2 + 12;
    const H = rows.reduce((n, r) => n + r.h + 24, 0);
    const comp = [];
    let y = 0;
    rows.forEach((r, i) => {
      const id = r.f.replace(/\.png$/, '');
      comp.push({ input: cellLabel(`${id.toUpperCase()} — BEFORE · main`, cw), top: y, left: 0 }, { input: cellLabel(`${id.toUpperCase()} — AFTER`, cw), top: y, left: cw + 12 });
      if (r.b) comp.push({ input: r.b, top: y + 24, left: 0 });
      comp.push({ input: r.a, top: y + 24, left: cw + 12 });
      SHEET_INDEX[`mobile/${id}`] = { sheet: `sheets/mobile-${tab}.jpg`, row: i, before: { x: 0, y: y + 24, w: cw, h: r.h }, after: { x: cw + 12, y: y + 24, w: cw, h: r.h } };
      y += r.h + 24;
    });
    await sharp({ create: { width: W, height: H, channels: 3, background: '#f4f4f6' } }).composite(comp).jpeg({ quality: 74, mozjpeg: true }).toFile(`${outDir}/sheets/mobile-${tab}.jpg`);
  }
}
for (const family of FAMILIES.filter((f) => f !== 'mobile')) {
  if (!existsSync(`${afterDir}/${family}`)) continue;
  const files = readdirSync(`${afterDir}/${family}`).filter((x) => x.endsWith('.png')).sort();
  const cw = W[family];
  const cells = await Promise.all(files.map(async (f) => ({ f, buf: await sharp(`${afterDir}/${family}/${f}`).resize({ width: cw }).png().toBuffer() })));
  const ch = Math.max(...(await Promise.all(cells.map(async (c) => (await sharp(c.buf).metadata()).height))));
  const cols = 5;
  const comp = [];
  cells.forEach((c, i) => {
    const x = (i % cols) * (cw + 8);
    const y = Math.floor(i / cols) * (ch + 32);
    const id = c.f.replace(/\.png$/, '');
    comp.push({ input: cellLabel(`${id.toUpperCase()} — AFTER (= main)`, cw), top: y, left: x }, { input: c.buf, top: y + 24, left: x });
    SHEET_INDEX[`${family}/${id}`] = { sheet: `sheets/${family}-after.jpg`, cell: i, after: { x, y: y + 24, w: cw, h: ch } };
  });
  const rowsN = Math.ceil(cells.length / cols);
  await sharp({ create: { width: cols * (cw + 8), height: rowsN * (ch + 32), channels: 3, background: '#f4f4f6' } })
    .composite(comp)
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(`${outDir}/sheets/${family}-after.jpg`);
}
writeFileSync(`${outDir}/sheets/index.json`, `${JSON.stringify(SHEET_INDEX, null, 2)}\n`);

// comparison set (sprint §64): HUB authority, EXPERIENCE, DESIGN child, EXPRESSION child, LIBRARY media panel,
// ACTIVITY / INBOX dense views — mobile 393×852, before | after
const SET = [
  ['hub-authority', 'hub-1', 'HUB — AUTHORITY (UNCHANGED)'],
  ['experience-root', 'experience-1', 'EXPERIENCE — ROOT'],
  ['experience-child-world', 'experience-world-1', 'EXPERIENCE — CHILD · WORLD'],
  ['design-child-brand', 'design-brand-1', 'DESIGN — CHILD · BRAND'],
  ['expression-child-casting', 'expression-casting-actors-1', 'EXPRESSION — CHILD · CASTING / ACTORS'],
  ['expression-child-wardrobe', 'expression-wardrobe-looks-1', 'EXPRESSION — CHILD · WARDROBE / LOOKS'],
  ['library-media-panel', 'library-1', 'LIBRARY — MEDIA PANELS'],
  ['library-collection-open', 'library-collection-open-1', 'LIBRARY — COLLECTION OPEN'],
  ['activity-dense', 'activity-1', 'ACTIVITY — DENSE FEED'],
  ['inbox-dense', 'inbox-1', 'INBOX — NEEDS YOU'],
  ['inbox-decision-detail', 'inbox-decision-detail-1', 'INBOX — DECISION DETAIL'],
];
mkdirSync(`${outDir}/compare`, { recursive: true });
const label = (text, w) =>
  Buffer.from(
    `<svg width="${w}" height="34" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111114"/><text x="12" y="22" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="1.5" fill="#ffffff">${text}</text></svg>`,
  );
for (const [name, shot, title] of SET) {
  const b = `${beforeDir}/mobile/${shot}.png`;
  const a = `${afterDir}/mobile/${shot}.png`;
  if (!existsSync(b) || !existsSync(a)) continue;
  const [B, A] = await Promise.all([b, a].map((p) => sharp(p).resize({ width: 393 }).png().toBuffer()));
  const h = (await sharp(B).metadata()).height;
  const ha = (await sharp(A).metadata()).height;
  const H = Math.max(h, ha);
  await sharp({ create: { width: 393 * 2 + 12, height: H + 68, channels: 3, background: '#f4f4f6' } })
    .composite([
      { input: label(title, 393 * 2 + 12), top: 0, left: 0 },
      { input: label('BEFORE · main', 393), top: 34, left: 0 },
      { input: label('AFTER · this sprint', 393), top: 34, left: 393 + 12 },
      { input: B, top: 68, left: 0 },
      { input: A, top: 68, left: 393 + 12 },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`${outDir}/compare/${name}.jpg`);
}
console.log('screenshot pack written to', outDir);
