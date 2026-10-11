/**
 * SITE 00 Builder studio — Immersive Blueprint before / after sheets.
 *
 *   node scripts/site00/builder-studio-qa/blueprint-before-after.cjs [qaDir]
 *
 * For each section, at identical viewports and the same selection state: BEFORE (forensic capture at ab9f1bef),
 * AFTER with the section's default view (blueprint-forensics.cjs, label "after"), and AFTER with an item selected
 * (blueprint-immersive.cjs). Writes `comparisons/before-after-<viewport>.jpg`.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const QA = path.resolve(process.argv[2] || 'docs/site00/builder-experience/hybrid-spatial-studio/immersive-blueprint-qa');
const OUT = path.join(QA, 'comparisons');
fs.mkdirSync(OUT, { recursive: true });

const ROWS = [
  ['01 OVERVIEW', '01-overview', null],
  ['02 STRUCTURE', '02-structure', '02b-structure-L3-envelope'],
  ['03 PAGES', '03-pages', '03b-pages-P06-shop-model'],
  ['04 FEATURES', '04-features', '04b-features-sell'],
  ['05 TIMELINE', '05-timeline', '05a-timeline-stage-02'],
];

const label = (text, width, color = '#111') =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="40"><rect width="100%" height="100%" fill="#fff"/><text x="12" y="27" font-family="sans-serif" font-size="19" font-weight="700" fill="${color}">${text}</text></svg>`);

async function sheet(vp, height) {
  const tiles = [];
  for (const [name, file, picked] of ROWS) {
    const before = path.join(QA, 'before', `${vp}-${file}.jpg`);
    const after = path.join(QA, 'after-default', `${vp}-${file}.jpg`);
    const sel = picked ? path.join(QA, 'after', `${vp}-${picked}.jpg`) : null;
    const cells = [
      [`BEFORE · ${name}`, before, '#111'],
      [`AFTER · ${name}`, after, '#e50107'],
      [picked ? `AFTER · SELECTED` : 'AFTER · (WHOLE PLACE)', sel && fs.existsSync(sel) ? sel : after, '#e50107'],
    ];
    if (!cells.every(([, f]) => fs.existsSync(f))) {
      console.log('skip', vp, name);
      continue;
    }
    tiles.push(await Promise.all(cells.map(async ([t, f, c]) => {
      const img = await sharp(f).resize({ height }).toBuffer();
      const { width } = await sharp(img).metadata();
      return { t, c, img, width };
    })));
  }
  if (!tiles.length) return;
  const W = tiles[0].reduce((s, c) => s + c.width + 12, 0);
  const H = tiles.length * (height + 40 + 16);
  const comp = [];
  tiles.forEach((row, r) => {
    let x = 0;
    for (const cell of row) {
      const y = r * (height + 56);
      comp.push({ input: label(cell.t, cell.width, cell.c), left: x, top: y });
      comp.push({ input: cell.img, left: x, top: y + 40 });
      x += cell.width + 12;
    }
  });
  const file = path.join(OUT, `before-after-${vp}.jpg`);
  await sharp({ create: { width: W, height: H, channels: 3, background: '#2a2a2e' } }).composite(comp).jpeg({ quality: 80 }).toFile(file);
  console.log('wrote', path.relative(process.cwd(), file));
}

(async () => {
  await sheet('390x844', 760);
  await sheet('1440x900', 420);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
