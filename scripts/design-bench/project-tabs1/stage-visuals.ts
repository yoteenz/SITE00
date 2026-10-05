/**
 * Dump the staged project-tab visual pack to
 * public/site00/project-tabs/staged/ for founder review.
 * Does not touch any approved asset manifest.
 *
 *   npx tsx scripts/design-bench/project-tabs1/stage-visuals.ts
 */

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PTV_FAMILY,
  PTV_PLATE_IDS,
  PTV_RASTER_PLATES,
  PTV_STATUS,
  PTV_VERSION,
  listProjectTabIconDefs,
  listProjectTabPlateDefs,
  pageFamilyPlateId,
  renderProjectTabIconSvg,
  renderProjectTabPlateSvg,
} from '../../../shared/site00-design-workspace-production/designProjectTabVisuals.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const outDir = join(root, 'public/site00/project-tabs/staged');
const rasterDir = join(outDir, 'raster');
mkdirSync(rasterDir, { recursive: true });

const icons = listProjectTabIconDefs();
for (const def of icons) {
  writeFileSync(join(outDir, `${def.id}.svg`), `${renderProjectTabIconSvg(def.id)}\n`);
}

for (const id of PTV_PLATE_IDS) {
  writeFileSync(join(outDir, `${id}.svg`), `${renderProjectTabPlateSvg(id)}\n`);
}

const families = [
  'ROOT',
  'BRAND',
  'CONTENT',
  'EXPERIMENT',
  'PERSONAL',
  'ARCHIVE',
  'INSPECT',
  'CULTURAL',
  'MARKETING',
  'OVERVIEW',
];
for (const label of families) {
  const id = pageFamilyPlateId(label);
  writeFileSync(
    join(outDir, `${id}.svg`),
    `${renderProjectTabPlateSvg(id, { kicker: 'PAGE FAMILY', title: label, pattern: 'tree' })}\n`,
  );
}

const rasterSources: Array<[string, string]> = [
  ['plate-ref-brand.jpg', 'plate-ref-brand.jpg'],
  ['plate-ref-authority.jpg', 'plate-ref-authority.jpg'],
  ['plate-ref-mood.jpg', 'plate-ref-mood.jpg'],
  ['plate-material-atmosphere.jpg', 'plate-material-atmosphere.jpg'],
  ['plate-more-banner.jpg', 'plate-more-banner.jpg'],
  ['plate-empty-library.jpg', 'plate-empty-library.jpg'],
  ['plate-page-architecture.jpg', 'plate-page-architecture.jpg'],
  ['plate-hist-milestone.jpg', 'plate-hist-milestone.jpg'],
];

for (const [from, to] of rasterSources) {
  const candidates = [
    join('/opt/cursor/artifacts/assets', from),
    join(root, 'public/site00/project-tabs/staged/raster', to),
  ];
  const source = candidates.find((path) => existsSync(path));
  if (!source) {
    console.warn(`missing raster ${from} — SVG plate remains the fallback`);
    continue;
  }
  copyFileSync(source, join(rasterDir, to));
}

const plates = listProjectTabPlateDefs();
writeFileSync(
  join(outDir, 'manifest.json'),
  `${JSON.stringify(
    {
      status: PTV_STATUS,
      version: PTV_VERSION,
      family: PTV_FAMILY,
      approvedAssetMutation: 'NONE',
      icons: icons.map((def) => ({
        id: def.id,
        tab: def.tab,
        usage: def.usage,
        label: def.label,
        intended: def.intended,
        ready: PTV_STATUS,
      })),
      plates: [
        ...plates,
        ...families.map((label) => ({
          id: pageFamilyPlateId(label),
          tab: 'pages',
          usage: 'thumbnail',
          label,
          intended: `Pages family fallback for ${label}`,
          ready: PTV_STATUS,
          kind: 'svg',
          file: `${pageFamilyPlateId(label)}.svg`,
        })),
      ],
    },
    null,
    2,
  )}\n`,
);

const iconTiles = icons
  .map(
    (def) => `
    <figure class="tile" data-tab="${def.tab}" id="${def.id}">
      <div class="swatch swatch-paper">${renderProjectTabIconSvg(def.id)}</div>
      <div class="swatch swatch-lime">${renderProjectTabIconSvg(def.id)}</div>
      <div class="swatch swatch-ink">${renderProjectTabIconSvg(def.id)}</div>
      <figcaption>
        <strong>${def.id}</strong>
        <span>${def.tab} · ${def.usage}</span>
        <em>${def.intended}</em>
      </figcaption>
    </figure>`,
  )
  .join('');

const plateTiles = [...PTV_PLATE_IDS, ...families.map((label) => pageFamilyPlateId(label))]
  .map((id) => {
    const isFamily = String(id).startsWith('family-');
    const svg = isFamily
      ? renderProjectTabPlateSvg(id, {
          kicker: 'PAGE FAMILY',
          title: id.replace('family-', '').toUpperCase(),
          pattern: 'tree',
        })
      : renderProjectTabPlateSvg(id);
    return `<figure class="plate" id="${id}">${svg}<figcaption>${id}</figcaption></figure>`;
  })
  .join('');

const rasterTiles = PTV_RASTER_PLATES.map(
  (plate) => `<figure class="plate"><img src="${plate.file}" alt="${plate.label}"/><figcaption>${plate.id} · ${plate.label}</figcaption></figure>`,
).join('');

writeFileSync(
  join(outDir, 'review.html'),
  `<!doctype html>
<html lang="en">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>STAGED — SITE 00 project-tab visual pack</title>
<style>
  :root { --paper:#fdfdfd; --ink:#161616; --lime:#cdee30; }
  html,body { margin:0; background:#0a0a0a; color:#f5f5f5; font:12px/1.4 ui-monospace, Menlo, monospace; }
  header { padding:28px 24px 16px; border-bottom:1px solid #333; }
  h1 { margin:0 0 8px; font-size:16px; letter-spacing:.12em; text-transform:uppercase; }
  p { margin:0; color:#9a9a9a; max-width:80em; }
  .meta { margin-top:10px; color:#cdee30; letter-spacing:.08em; }
  nav { display:flex; gap:16px; padding:12px 24px; flex-wrap:wrap; }
  nav a { color:#cdee30; text-transform:uppercase; letter-spacing:.08em; }
  h2 { margin:24px 24px 0; letter-spacing:.14em; font-size:12px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; padding:16px 24px 24px; }
  .plates { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; padding:16px 24px 48px; }
  .tile, .plate { margin:0; border:1px solid #333; background:#111; }
  .swatch { display:flex; align-items:center; justify-content:center; height:64px; }
  .swatch svg { width:26px; height:26px; }
  .swatch-paper { background:var(--paper); color:var(--ink); }
  .swatch-lime { background:var(--lime); color:#101505; }
  .swatch-ink { background:#0a0a0a; color:var(--lime); }
  figcaption { padding:8px 10px 10px; display:flex; flex-direction:column; gap:3px; }
  figcaption strong { letter-spacing:.04em; }
  figcaption span { color:#cdee30; font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
  figcaption em { color:#888; font-style:normal; font-size:10px; }
  .plate svg, .plate img { width:100%; display:block; }
</style>
<header>
  <h1>STAGED project-tab visual pack</h1>
  <p>${PTV_VERSION}. Icons 24×24 / 1.5 stroke. Plates 320×200 labelled index cards plus eight editorial rasters. Destinations are the seven live Design Workspace tabs. Approved-asset mutation: NONE.</p>
  <p class="meta">${PTV_FAMILY} · ${PTV_STATUS} · ${icons.length} ICONS · ${plates.length + families.length} PLATES</p>
</header>
<nav>
  <a href="#dest-workspace">hamburger</a>
  <a href="#ref-all">references</a>
  <a href="#asset-hero">assets</a>
  <a href="#page-root">pages</a>
  <a href="#skin-palette">skins</a>
  <a href="#hist-concept">history</a>
  <a href="#more-context">more</a>
  <a href="#plates">plates</a>
</nav>
<h2>ICONS</h2>
<section class="grid">${iconTiles}</section>
<h2 id="plates">PLATES</h2>
<section class="plates">${plateTiles}${rasterTiles}</section>
</html>
`,
);

writeFileSync(
  join(outDir, 'README.txt'),
  [
    'STAGED — SITE 00 project-tab visual support pack',
    `Version: ${PTV_VERSION}`,
    `Family: ${PTV_FAMILY}`,
    `Status: ${PTV_STATUS}`,
    `Icons: ${icons.length}`,
    `Plates: ${plates.length + families.length}`,
    'Approved asset mutation: NONE',
    '',
    'Destinations (live):',
    '  /projects/design/:slug/references',
    '  /projects/design/:slug/assets',
    '  /projects/design/:slug/pages',
    '  /projects/design/:slug/skins',
    '  /projects/design/:slug/history',
    '  /projects/design/:slug/more',
    '  OV-HOST-MODULE-NAV (hamburger)',
    '',
    'These files are for founder review.',
    'Do not copy them into an approved manifest without an explicit approve.',
    'Open review.html to inspect paper / lime / ink variants and plates.',
    '',
  ].join('\n'),
);

console.log(`staged ${icons.length} icons + plates → ${outDir}`);
