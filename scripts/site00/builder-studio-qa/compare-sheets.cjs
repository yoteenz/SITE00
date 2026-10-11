/**
 * SITE 00 Builder studio — Creative Refinement 1 comparison sheets.
 *
 *   node scripts/site00/builder-studio-qa/compare-sheets.cjs
 *
 * REFERENCE crops come from the approved-reference halves of hybrid-spatial-studio/comparisons/*-reference-vs-
 * implementation.jpg (left 390px, below the label). BEFORE is the unmodified studio captured at the start of the
 * sprint; AFTER is this branch, captured live by creative-captures.cjs. Nothing is retouched: tiles are only scaled.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = 'docs/site00/builder-experience/hybrid-spatial-studio';
const REF = path.join(ROOT, 'comparisons');
const QA = path.join(ROOT, 'creative-refinement-qa');
const BEFORE = path.join(QA, 'before');
const AFTER = path.join(QA, 'after');
const OUT = path.join(QA, 'comparisons');
fs.mkdirSync(OUT, { recursive: true });

const LABEL_H = 34;
const GAP = 10;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const label = (text, width, color = '#111114') =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#ffffff"/>` +
      `<text x="10" y="22" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="1.2" fill="${color}">${esc(text)}</text></svg>`,
  );

async function refTile(name, width) {
  const file = path.join(REF, `${name}-reference-vs-implementation.jpg`);
  const meta = await sharp(file).metadata();
  return sharp(file).extract({ left: 0, top: 24, width: 390, height: meta.height - 24 }).resize({ width }).toBuffer();
}
const shotTile = (file, width) => sharp(file).resize({ width }).toBuffer();

/** Columns of [label, buffer]; each column is labelled; tallest decides the sheet height. */
async function sheet(file, columns, colW) {
  const tiles = await Promise.all(columns.map(async ([text, buf, color]) => ({ text, color, buf, h: (await sharp(buf).metadata()).height })));
  const height = LABEL_H + Math.max(...tiles.map((t) => t.h));
  const width = tiles.length * colW + (tiles.length - 1) * GAP;
  const composite = tiles.flatMap((t, i) => [
    { input: label(t.text, colW, t.color), left: i * (colW + GAP), top: 0 },
    { input: t.buf, left: i * (colW + GAP), top: LABEL_H },
  ]);
  await sharp({ create: { width, height, channels: 3, background: '#2a2a2e' } }).composite(composite).jpeg({ quality: 82 }).toFile(path.join(OUT, file));
  console.log('wrote', file);
}

/** Rows of columns: a grid with one label per tile. */
async function grid(file, rows, colW) {
  const built = [];
  for (const row of rows) {
    const tiles = await Promise.all(row.map(async ([text, f, color]) => ({ text, color, buf: await shotTile(f, colW) })));
    const h = Math.max(...(await Promise.all(tiles.map(async (t) => (await sharp(t.buf).metadata()).height))));
    built.push({ tiles, h });
  }
  const cols = Math.max(...rows.map((r) => r.length));
  const width = cols * colW + (cols - 1) * GAP;
  const height = built.reduce((s, r) => s + LABEL_H + r.h, 0) + (built.length - 1) * GAP;
  const composite = [];
  let y = 0;
  for (const r of built) {
    r.tiles.forEach((t, i) => {
      composite.push({ input: label(t.text, colW, t.color), left: i * (colW + GAP), top: y });
      composite.push({ input: t.buf, left: i * (colW + GAP), top: y + LABEL_H });
    });
    y += LABEL_H + r.h + GAP;
  }
  await sharp({ create: { width, height, channels: 3, background: '#2a2a2e' } }).composite(composite).jpeg({ quality: 82 }).toFile(path.join(OUT, file));
  console.log('wrote', file);
}

const RED = '#e5231b';
const b = (n) => path.join(BEFORE, `${n}.jpg`);
const a = (n) => path.join(AFTER, `${n}.jpg`);

(async () => {
  // Reference | before | after, one sheet per room.
  const rooms = [
    ['room1', 'place', 'mobile-01b-place-simple', 'mobile-01b-place-simple'],
    ['room2', 'feel', 'mobile-02a-feel-modern', 'mobile-02a-feel-modern'],
    ['room3', 'work', 'mobile-03c-work-multiple', 'mobile-03c-work-multiple'],
    ['room4', 'pace', 'mobile-04a-pace-standard', 'mobile-04a-pace-standard'],
    ['blueprint', 'blueprint', 'mobile-05a-blueprint-overview', 'mobile-05a-blueprint-overview'],
  ];
  for (const [ref, slug, before, after] of rooms) {
    await sheet(
      `reference-before-after-${slug}.jpg`,
      [
        ['REFERENCE (approved)', await refTile(ref, 390)],
        ['BEFORE (sprint start)', await shotTile(b(before), 390)],
        ['AFTER (this branch)', await shotTile(a(after), 390), RED],
      ],
      390,
    );
  }

  // Area sheets: before row over after row.
  const feel = ['modern', 'bold', 'editorial', 'immersive'].map((f, i) => `mobile-02${'abcd'[i]}-feel-${f}`);
  await grid('before-after-feel.jpg', [feel.map((n) => [`BEFORE · ${n.split('-').pop().toUpperCase()}`, b(n)]), feel.map((n) => [`AFTER · ${n.split('-').pop().toUpperCase()}`, a(n), RED])], 300);
  const place = ['simple', 'advanced', 'world', 'custom'].map((p, i) => `mobile-01${'bcde'[i]}-place-${p}`);
  await grid('before-after-place.jpg', [place.map((n) => [`BEFORE · ${n.split('-').pop().toUpperCase()}`, b(n)]), place.map((n) => [`AFTER · ${n.split('-').pop().toUpperCase()}`, a(n), RED])], 300);
  await grid(
    'before-after-work-pace.jpg',
    [
      [['BEFORE · WORK DEFAULT', b('mobile-03b-work-pages')], ['BEFORE · WORK MULTIPLE', b('mobile-03c-work-multiple')], ['BEFORE · PACE STANDARD', b('mobile-04a-pace-standard')], ['BEFORE · PACE FLEXIBLE', b('mobile-04b-pace-flexible')]],
      [['AFTER · WORK DEFAULT', a('mobile-03a-work-default-pages-only'), RED], ['AFTER · WORK MULTIPLE', a('mobile-03c-work-multiple'), RED], ['AFTER · PACE STANDARD', a('mobile-04a-pace-standard'), RED], ['AFTER · PACE FLEXIBLE', a('mobile-04b-pace-flexible'), RED]],
    ],
    300,
  );
  const tabs = ['structure', 'pages', 'features', 'timeline'].map((t, i) => `mobile-05${'bcde'[i]}-blueprint-${t}`);
  await grid('before-after-blueprint-tabs.jpg', [tabs.map((n) => [`BEFORE · ${n.split('-').pop().toUpperCase()}`, b(n)]), tabs.map((n) => [`AFTER · ${n.split('-').pop().toUpperCase()}`, a(n), RED])], 300);
  const confirm = ['mobile-05h-blueprint-confirmation', 'mobile-05i-blueprint-confirmation-ready', 'mobile-05j-blueprint-submission-received', 'mobile-05k-blueprint-submitted-state'];
  const short = (n) => n.replace('mobile-05', '').slice(2).replace('blueprint-', '').toUpperCase();
  await grid('before-after-confirmation.jpg', [confirm.map((n) => [`BEFORE · ${short(n)}`, b(n)]), confirm.map((n) => [`AFTER · ${short(n)}`, a(n), RED])], 300);
  await grid(
    'before-after-desktop.jpg',
    [
      [['BEFORE · PLACE', b('desktop-01b-place-simple')], ['AFTER · PLACE', a('desktop-01b-place-simple'), RED]],
      [['BEFORE · FEEL', b('desktop-02a-feel-modern')], ['AFTER · FEEL', a('desktop-02a-feel-modern'), RED]],
      [['BEFORE · WORK', b('desktop-03c-work-multiple')], ['AFTER · WORK', a('desktop-03c-work-multiple'), RED]],
      [['BEFORE · BLUEPRINT', b('desktop-05a-blueprint-overview')], ['AFTER · BLUEPRINT', a('desktop-05a-blueprint-overview'), RED]],
      [['BEFORE · CONFIRMATION', b('desktop-05h-blueprint-confirmation')], ['AFTER · CONFIRMATION', a('desktop-05h-blueprint-confirmation'), RED]],
    ],
    720,
  );
  await grid(
    'before-after-tablet.jpg',
    [
      ['01b-place-simple', '02a-feel-modern', '03c-work-multiple', '05a-blueprint-overview', '05h-blueprint-confirmation'].map((n) => [`BEFORE · ${n.slice(4).toUpperCase()}`, b(`tablet-${n}`)]),
      ['01b-place-simple', '02a-feel-modern', '03c-work-multiple', '05a-blueprint-overview', '05h-blueprint-confirmation'].map((n) => [`AFTER · ${n.slice(4).toUpperCase()}`, a(`tablet-${n}`), RED]),
    ],
    300,
  );
  // Typography and spacing close-up: the intro block (header to lede) at 2x, before over after.
  const crop = (f) => sharp(f).extract({ left: 0, top: 0, width: 780, height: 560 }).toBuffer();
  const typo = [];
  for (const n of ['mobile-01b-place-simple', 'mobile-02a-feel-modern', 'mobile-05a-blueprint-overview']) {
    typo.push([`BEFORE · ${n.split("-").slice(2).join(" ").toUpperCase()}`, await crop(b(n))]);
  }
  for (const n of ['mobile-01b-place-simple', 'mobile-02a-feel-modern', 'mobile-05a-blueprint-overview']) {
    typo.push([`AFTER · ${n.split("-").slice(2).join(" ").toUpperCase()}`, await crop(a(n)), RED]);
  }
  const tmp = typo.map(([t, buf, c]) => ({ t, buf, c }));
  const colW = 520;
  const tiles = await Promise.all(tmp.map(async (x) => ({ ...x, buf: await sharp(x.buf).resize({ width: colW }).toBuffer() })));
  const th = (await sharp(tiles[0].buf).metadata()).height;
  const composite = tiles.flatMap((x, i) => [
    { input: label(x.t, colW, x.c), left: (i % 3) * (colW + GAP), top: Math.floor(i / 3) * (LABEL_H + th + GAP) },
    { input: x.buf, left: (i % 3) * (colW + GAP), top: Math.floor(i / 3) * (LABEL_H + th + GAP) + LABEL_H },
  ]);
  await sharp({ create: { width: 3 * colW + 2 * GAP, height: 2 * (LABEL_H + th) + GAP, channels: 3, background: '#2a2a2e' } })
    .composite(composite)
    .jpeg({ quality: 84 })
    .toFile(path.join(OUT, 'before-after-typography.jpg'));
  console.log('wrote before-after-typography.jpg');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
