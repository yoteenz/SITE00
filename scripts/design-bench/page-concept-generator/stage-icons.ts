/**
 * Dump the staged GENERATE PAGE CONCEPTS icon family for founder review.
 * Does not mutate live panel bindings or approved manifests.
 *
 *   npx tsx scripts/design-bench/page-concept-generator/stage-icons.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderAiConsoleIconSvg } from '../../../shared/site00-design-workspace-production/designAiConsoleIconography.ts';
import {
  PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL,
  PCG_ICON_FAMILY,
  PCG_ICON_STATUS,
  PCG_ICON_STROKE,
  PCG_ICON_VERSION,
  PCG_ICON_VIEWBOX,
  listPcgIconDefs,
  renderPcgIconSvg,
  type PcgIconId,
} from '../../../shared/site00-design-workspace-production/pageConceptGeneratorIconography.ts';

const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../public/site00/page-concept-generator/staged',
);
mkdirSync(outDir, { recursive: true });

const defs = listPcgIconDefs();

for (const def of defs) {
  writeFileSync(join(outDir, `${def.id}.svg`), `${renderPcgIconSvg(def.id)}\n`);
}

writeFileSync(
  join(outDir, 'manifest.json'),
  `${JSON.stringify(
    {
      status: PCG_ICON_STATUS,
      version: PCG_ICON_VERSION,
      family: PCG_ICON_FAMILY,
      viewBox: PCG_ICON_VIEWBOX,
      stroke: PCG_ICON_STROKE,
      count: defs.length,
      livePanelMutation: 'NONE',
      composerIntegration: 'PENDING_FOUNDER_APPROVAL',
      icons: defs.map((def) => ({
        id: def.id,
        group: def.group,
        location: def.location,
        meaning: def.meaning,
        recommendedSize: def.recommendedSize,
        defaultState: def.defaultState,
        activeState: def.activeState,
        disabledState: def.disabledState,
        darkVariant: 'currentColor',
      })),
      proposal: PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL,
    },
    null,
    2,
  )}\n`,
);

const tiles = defs
  .map((def) => {
    const svg = renderPcgIconSvg(def.id);
    return `
    <figure class="tile" data-group="${def.group}" id="${def.id}">
      <div class="swatch swatch-paper">${svg}</div>
      <div class="swatch swatch-lime">${svg}</div>
      <div class="swatch swatch-ink">${svg}</div>
      <figcaption>
        <strong>${def.id}</strong>
        <span>${def.group} · ${def.recommendedSize}px</span>
        <em>${def.location}</em>
        <em>${def.meaning}</em>
        <em>default / active (currentColor) / disabled (opacity .4)</em>
      </figcaption>
    </figure>`;
  })
  .join('');

const pairs = Object.entries(PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL)
  .map(([live, staged]) => {
    const before = renderAiConsoleIconSvg(live as Parameters<typeof renderAiConsoleIconSvg>[0]);
    const after = renderPcgIconSvg(staged as PcgIconId);
    return `
    <figure class="pair">
      <div class="pair-col">
        <div class="swatch swatch-paper">${before}</div>
        <span>BEFORE · ${live}</span>
      </div>
      <div class="pair-col">
        <div class="swatch swatch-paper">${after}</div>
        <span>AFTER · ${staged}</span>
      </div>
    </figure>`;
  })
  .join('');

const icon = (id: PcgIconId, size: number) => renderPcgIconSvg(id, size);

writeFileSync(
  join(outDir, 'review.html'),
  `<!doctype html>
<html lang="en">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>STAGED — GENERATE PAGE CONCEPTS icon family</title>
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
  :root { --paper:#fdfdfd; --ink:#101010; --lime:#cdee30; --panel:#f7f7f7; --muted:#77777d; --border:#e4e4e4; }
  html,body { margin:0; background:#0a0a0a; color:#f5f5f5; font:11px/1.4 "Martian Mono", ui-monospace, monospace; text-transform:uppercase; }
  header { padding:28px 24px 16px; border-bottom:1px solid #333; }
  h1,h2 { margin:0 0 8px; letter-spacing:.08em; }
  h1 { font-size:15px; }
  h2 { font-size:12px; padding:20px 24px 0; }
  p { margin:0; color:#9a9a9a; max-width:80em; }
  .meta { margin-top:10px; color:#cdee30; letter-spacing:.08em; }
  nav { display:flex; gap:16px; padding:12px 24px; flex-wrap:wrap; }
  nav a { color:#cdee30; letter-spacing:.08em; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; padding:16px 24px 24px; }
  .pairs { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; padding:16px 24px 24px; }
  .tile, .pair { margin:0; border:1px solid #333; background:#111; }
  .swatch { display:flex; align-items:center; justify-content:center; height:72px; }
  .swatch svg { width:28px; height:28px; }
  .swatch-paper { background:var(--paper); color:var(--ink); }
  .swatch-lime { background:var(--lime); color:#131a04; }
  .swatch-ink { background:#0a0a0a; color:var(--lime); }
  figcaption { padding:8px 10px 10px; display:flex; flex-direction:column; gap:3px; }
  figcaption em { color:#888; font-style:normal; font-size:10px; }
  figcaption span { color:#cdee30; font-size:10px; }
  .pair { display:grid; grid-template-columns:1fr 1fr; }
  .pair-col { display:flex; flex-direction:column; }
  .pair-col span { padding:8px 10px; font-size:9px; color:#aaa; }
  .preview-wrap { padding:16px 24px 48px; }
  .s00-pcg { background:var(--paper); color:var(--ink); border:1px solid #b8b8b8; max-width:390px; margin:0 auto; }
  .s00-pcg * { box-sizing:border-box; font-family:inherit; text-transform:uppercase; }
  .head { display:flex; align-items:center; justify-content:space-between; padding:16px 14px 8px; }
  .title { font-size:14px; font-weight:700; }
  .dismiss { display:inline-flex; align-items:center; gap:5px; min-height:28px; padding:0 9px; border:1px solid #cfcfcf; border-radius:999px; background:#fff; font:inherit; font-size:9px; }
  .target { margin:0 14px 8px; font-size:9.5px; color:#77777d; }
  .summary { display:flex; background:var(--panel); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .metric { flex:1; padding:7px 6px; border-right:1px solid var(--border); font-size:8px; }
  .rail { display:grid; grid-template-columns:repeat(3,1fr); padding:10px 12px; text-align:center; gap:4px; }
  .chip { display:inline-flex; align-items:center; gap:3px; padding:2px 6px; border:1px solid #cfcfcf; border-radius:999px; font-size:7.5px; }
  .chip.ready { background:var(--lime); }
  .cards { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:8px 12px 10px; }
  .card { border:1px solid var(--border); background:var(--panel); padding:7px 6px; }
  .row { display:flex; align-items:center; gap:4px; min-height:22px; padding:4px 5px; border:1px solid var(--border); background:#fff; font-size:6.5px; margin-bottom:4px; }
  .row.lead { background:var(--lime); }
  .foot { padding:8px 14px 10px; background:var(--panel); border-top:1px solid var(--border); }
  .actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .gen,.can { min-height:40px; border:1px solid #0a0a0a; font:inherit; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px; }
  .gen { background:var(--lime); }
  .can { background:#fff; }
  .note { display:flex; align-items:center; gap:6px; font-size:8px; color:#77777d; margin:0 0 6px; }
</style>
<header>
  <h1>Staged GENERATE PAGE CONCEPTS icon family</h1>
  <p>P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1. One 24×24 construction grid, 1.5 stroke, square caps, currentColor. Live pop-up is unchanged until founder approval. Composer must not wire these until READY_FOR_FOUNDER_REVIEW is accepted.</p>
  <p class="meta">${PCG_ICON_VERSION} · ${PCG_ICON_FAMILY} · ${PCG_ICON_STATUS} · ${defs.length} ICONS · LIVE MUTATION NONE</p>
</header>
<nav>
  <a href="#sheet">icon sheet</a>
  <a href="#compare">before / after</a>
  <a href="#preview">panel preview</a>
</nav>
<h2 id="sheet">1. Icon sheet</h2>
<section class="grid">${tiles}</section>
<h2 id="compare">2. Before / after — live AIC vs staged PCG</h2>
<section class="pairs">${pairs}</section>
<h2 id="preview">3. Panel preview (staged icons only — not live)</h2>
<div class="preview-wrap">
  <section class="s00-pcg" data-testid="pcg-icon-preview">
    <div class="head">
      <div class="title">Generate page concepts</div>
      <span class="dismiss">${icon('pcg-close', 10)} Cancel</span>
    </div>
    <p class="target">Target · ndxbook / overview</p>
    <div class="summary">
      <div class="metric">${icon('pcg-system', 13)}</div>
      <div class="metric">${icon('pcg-cgpt', 10)} 1 cgpt creative</div>
      <div class="metric">${icon('pcg-gpt2', 10)} 1 gpt2 authority</div>
      <div class="metric">${icon('pcg-nbp', 10)} 3 nbp renditions</div>
      <div class="metric">${icon('pcg-viewport', 10)} 6 viewport outputs</div>
    </div>
    <div class="rail">
      <div>${icon('pcg-cgpt', 10)}<div>cgpt creative injection</div><span class="chip ready">${icon('pcg-status-ready', 9)} ready</span></div>
      <div>${icon('pcg-gpt2', 10)}<div>gpt2 authority concept</div><span class="chip">${icon('pcg-status-pending', 9)} pending</span></div>
      <div>${icon('pcg-nbp', 10)}<div>nbp renditions</div><span class="chip">${icon('pcg-status-pending', 9)} pending</span></div>
    </div>
    <div class="cards">
      <article class="card">
        <div>step 1 ${icon('pcg-cgpt', 10)} cgpt</div>
        <div class="row lead">${icon('pcg-creative-direction', 10)} creative direction</div>
        <div class="row">${icon('pcg-page-intelligence', 10)} page intelligence</div>
        <div class="row">${icon('pcg-brand-context', 10)} brand context</div>
        <div class="row">${icon('pcg-key-messages', 10)} key messages</div>
        <div class="row">${icon('pcg-visual-moodboard', 10)} visual moodboard</div>
        <div class="note">${icon('pcg-output-brief', 12)} output brief</div>
      </article>
      <article class="card">
        <div>step 2 ${icon('pcg-gpt2', 10)} gpt2</div>
        <div class="swatch swatch-paper">${icon('pcg-authority-empty', 18)}</div>
        <div class="note">${icon('pcg-output-authority', 12)} authority artifact</div>
      </article>
      <article class="card">
        <div>step 3 ${icon('pcg-nbp', 10)} nbp</div>
        <div class="note">${icon('pcg-mobile', 11)} mobile (3)</div>
        <div class="note">${icon('pcg-desktop', 11)} desktop (3)</div>
        <div class="note">${icon('pcg-prev', 10)} ${icon('pcg-next', 10)}</div>
        <div class="note">${icon('pcg-output-rendition', 12)} rendition groups</div>
      </article>
    </div>
    <footer class="foot">
      <p class="note">${icon('pcg-error', 10)} blocked · source capture required</p>
      <p class="note">${icon('pcg-info', 10)} outputs will populate below as each stage completes.</p>
      <div class="actions">
        <button class="gen" type="button">${icon('pcg-generate', 13)} generate</button>
        <button class="can" type="button">cancel</button>
      </div>
    </footer>
  </section>
</div>
</html>
`,
);

writeFileSync(
  join(outDir, 'README.txt'),
  [
    'STAGED — GENERATE PAGE CONCEPTS icon family',
    `Version: ${PCG_ICON_VERSION}`,
    `Family: ${PCG_ICON_FAMILY}`,
    `Status: ${PCG_ICON_STATUS}`,
    `Count: ${defs.length}`,
    'Live panel mutation: NONE',
    'Composer integration: PENDING FOUNDER APPROVAL',
    '',
    'Open review.html for the icon sheet, before/after pairs, and panel preview.',
    'Do not copy these IDs into PageConceptGeneratorPanel until founder approves.',
    '',
  ].join('\n'),
);

console.log(`staged ${defs.length} PCG icons → ${outDir}`);
