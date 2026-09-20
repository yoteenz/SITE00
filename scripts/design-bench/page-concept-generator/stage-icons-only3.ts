/**
 * Dump P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICONS-ONLY3 for founder review.
 * Does not mutate live panel bindings, CSS, copy, or pipeline.
 *
 *   npx tsx scripts/design-bench/page-concept-generator/stage-icons-only3.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderAiConsoleIconSvg } from '../../../shared/site00-design-workspace-production/designAiConsoleIconography.ts';
import {
  PAGE_CONCEPT_GENERATOR_ICONS_ONLY3_PROPOSAL,
  S00_PCG_ICON_FAMILY,
  S00_PCG_ICON_STATUS,
  S00_PCG_ICON_STROKE,
  S00_PCG_ICON_VERSION,
  S00_PCG_ICON_VIEWBOX,
  S00_PCG_SIZE_BAND,
  listS00PcgIconDefs,
  renderS00PcgIconSvg,
  type S00PcgIconId,
} from '../../../shared/site00-design-workspace-production/pageConceptGeneratorIconsOnly3.ts';

const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../public/site00/page-concept-generator/staged/icons-only3',
);
mkdirSync(outDir, { recursive: true });

const defs = listS00PcgIconDefs();

for (const def of defs) {
  writeFileSync(join(outDir, def.filename), `${renderS00PcgIconSvg(def.id)}\n`);
}

writeFileSync(
  join(outDir, 'manifest.json'),
  `${JSON.stringify(
    {
      status: S00_PCG_ICON_STATUS,
      version: S00_PCG_ICON_VERSION,
      family: S00_PCG_ICON_FAMILY,
      viewBox: S00_PCG_ICON_VIEWBOX,
      stroke: S00_PCG_ICON_STROKE,
      count: defs.length,
      livePanelMutation: 'NONE',
      geometryMutated: 'NO',
      textMutated: 'NO',
      logicMutated: 'NO',
      composerIntegration: 'PENDING_FOUNDER_APPROVAL',
      readyForFounderReview: true,
      sizeBand: S00_PCG_SIZE_BAND,
      icons: defs.map((def) => ({
        semanticName: def.semanticName,
        id: def.id,
        filename: def.filename,
        location: def.location,
        meaning: def.meaning,
        visualRole: def.visualRole,
        interactive: def.interactive ? 'YES' : 'NO',
        sizeBand: def.sizeBand,
        recommendedSize: def.recommendedSize,
        currentColor: true,
      })),
      proposal: PAGE_CONCEPT_GENERATOR_ICONS_ONLY3_PROPOSAL,
    },
    null,
    2,
  )}\n`,
);

const icon = (id: S00PcgIconId, size: number) => renderS00PcgIconSvg(id, size);
const liveIcon = (id: Parameters<typeof renderAiConsoleIconSvg>[0], size: number) =>
  renderAiConsoleIconSvg(id).replace('<svg', `<svg width="${size}" height="${size}"`);

const tiles = defs
  .map((def) => {
    const svg = renderS00PcgIconSvg(def.id);
    return `
    <figure class="tile" id="${def.id}">
      <div class="swatch swatch-paper">${svg}</div>
      <div class="swatch swatch-lime">${svg}</div>
      <div class="swatch swatch-ink">${svg}</div>
      <figcaption>
        <strong>${def.filename}</strong>
        <span>${def.semanticName} · ${def.visualRole} · interactive ${def.interactive ? 'YES' : 'NO'}</span>
        <em>${def.sizeBand} · ${def.recommendedSize}px · ${def.location}</em>
        <em>${def.meaning}</em>
        <em>currentColor YES</em>
      </figcaption>
    </figure>`;
  })
  .join('');

const pairs = Object.entries(PAGE_CONCEPT_GENERATOR_ICONS_ONLY3_PROPOSAL)
  .map(([live, staged]) => `
    <figure class="pair">
      <div class="pair-col">
        <div class="swatch swatch-paper">${liveIcon(live as Parameters<typeof renderAiConsoleIconSvg>[0], 28)}</div>
        <span>BEFORE · ${live}</span>
      </div>
      <div class="pair-col">
        <div class="swatch swatch-paper">${icon(staged, 28)}</div>
        <span>AFTER · ${staged}.svg</span>
      </div>
    </figure>`)
  .join('');

const rows = defs
  .map(
    (def) => `
  <tr>
    <td>${def.semanticName}</td>
    <td>${def.filename}</td>
    <td>${def.location}</td>
    <td>${def.visualRole}</td>
    <td>${def.interactive ? 'YES' : 'NO'}</td>
    <td>${def.sizeBand} / ${def.recommendedSize}px</td>
    <td>YES</td>
  </tr>`,
  )
  .join('');

writeFileSync(
  join(outDir, 'review.html'),
  `<!doctype html>
<html lang="en">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>STAGED — GENERATE PAGE CONCEPTS ICONS-ONLY3</title>
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
  :root { --paper:#fdfdfd; --ink:#101010; --lime:#cdee30; --panel:#f7f7f7; --border:#e4e4e4; --muted:#77777d; }
  html,body { margin:0; background:#0a0a0a; color:#f5f5f5; font:11px/1.4 "Martian Mono", ui-monospace, monospace; text-transform:uppercase; }
  header { padding:28px 24px 16px; border-bottom:1px solid #333; }
  h1,h2 { margin:0 0 8px; letter-spacing:.08em; }
  h1 { font-size:15px; }
  h2 { font-size:12px; padding:20px 24px 0; }
  p { margin:0; color:#9a9a9a; max-width:90em; }
  .meta { margin-top:10px; color:#cdee30; }
  nav { display:flex; gap:16px; padding:12px 24px; flex-wrap:wrap; }
  nav a { color:#cdee30; }
  table { width:calc(100% - 48px); margin:16px 24px; border-collapse:collapse; font-size:10px; }
  th,td { border:1px solid #333; padding:7px 8px; text-align:left; }
  th { color:#cdee30; }
  .grid, .pairs { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:12px; padding:16px 24px 24px; }
  .pairs { grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); }
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
  .pair-col span { padding:8px 10px; font-size:9px; color:#aaa; display:block; }
  .compare { display:grid; grid-template-columns:1fr 1fr; gap:18px; padding:16px 24px 48px; }
  @media (max-width: 860px) { .compare { grid-template-columns:1fr; } }
  .panel-label { margin:0 0 8px; color:#cdee30; }
  .s00-pcg { background:var(--paper); color:var(--ink); border:1px solid #b8b8b8; max-width:390px; }
  .s00-pcg * { box-sizing:border-box; font-family:inherit; text-transform:uppercase; }
  .head { display:flex; align-items:center; justify-content:space-between; padding:16px 14px 8px; }
  .title { font-size:14px; font-weight:700; }
  .dismiss { display:inline-flex; align-items:center; gap:5px; min-height:28px; padding:0 9px; border:1px solid #cfcfcf; border-radius:999px; background:#fff; font:inherit; font-size:9px; }
  .target { margin:0 14px 8px; font-size:9.5px; color:#77777d; }
  .summary { display:flex; background:var(--panel); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .metric { flex:1; padding:7px 6px; border-right:1px solid var(--border); font-size:8px; }
  .rail { display:grid; grid-template-columns:repeat(3,1fr); padding:10px 12px; text-align:center; gap:4px; font-size:8px; }
  .chip { display:inline-flex; align-items:center; gap:3px; padding:2px 6px; border:1px solid #cfcfcf; border-radius:999px; font-size:7.5px; font-weight:700; }
  .chip.ready { background:var(--lime); border-color:#0a0a0a; }
  .cards { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:8px 12px 10px; }
  .card { border:1px solid var(--border); background:var(--panel); padding:7px 6px; }
  .cardHead { display:flex; align-items:center; gap:6px; font-size:7.5px; padding-bottom:4px; border-bottom:1px solid var(--border); }
  .tag { display:inline-flex; align-items:center; gap:4px; margin-left:auto; padding:3px 5px; border:1px solid #b8b8b8; background:#f7f7f7; font-size:7px; font-weight:700; }
  .card[data-ready] .tag { background:var(--lime); border-color:#0a0a0a; }
  .row { display:flex; align-items:center; gap:4px; min-height:22px; padding:4px 5px; border:1px solid var(--border); background:#fff; font-size:6.5px; margin:4px 0 0; }
  .row.lead { background:var(--lime); }
  .frame { min-height:56px; margin-top:6px; border:1px solid var(--border); background:#f1f1f1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font-size:6.5px; color:#77777d; }
  .note { display:flex; align-items:center; gap:6px; font-size:7px; color:#77777d; margin:6px 0 0; }
  .paging { display:flex; align-items:center; justify-content:center; gap:6px; padding-top:6px; }
  .foot { padding:8px 14px 10px; background:var(--panel); border-top:1px solid var(--border); }
  .actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .gen,.can { min-height:40px; border:1px solid #0a0a0a; font:inherit; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px; }
  .gen { background:var(--lime); }
  .can { background:#fff; }
</style>
<header>
  <h1>Staged GENERATE PAGE CONCEPTS — icons only 3</h1>
  <p>Icon assets only. Layout, copy, chip/button geometry, and pipeline stay locked. Live pop-up still uses AiConsoleIcon until founder approval.</p>
  <p class="meta">${S00_PCG_ICON_VERSION} · ${S00_PCG_ICON_FAMILY} · ${defs.length} SVG · LIVE MUTATION NONE</p>
</header>
<nav>
  <a href="#manifest">manifest</a>
  <a href="#sheet">icon sheet</a>
  <a href="#compare">icon before / after</a>
  <a href="#preview">panel before / after</a>
</nav>
<h2 id="manifest">1. Icon manifest</h2>
<table>
  <thead><tr><th>Semantic</th><th>Filename</th><th>Location</th><th>Role</th><th>Interactive</th><th>Size</th><th>currentColor</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<h2 id="sheet">2. Icon sheet</h2>
<section class="grid">${tiles}</section>
<h2 id="compare">3. Before / after — live AIC vs ICONS-ONLY3</h2>
<section class="pairs">${pairs}</section>
<h2 id="preview">4. Panel preview — icons swapped only</h2>
<div class="compare">
  <div>
    <p class="panel-label">Before · current implemented icons</p>
    <section class="s00-pcg" data-testid="pcg-icons-only3-before">
      <div class="head"><div class="title">Generate page concepts</div><span class="dismiss">${liveIcon('action-close', 10)} Cancel</span></div>
      <p class="target">Target · ndxbook / overview</p>
      <div class="summary">
        <div class="metric">${liveIcon('grok-library', 13)}</div>
        <div class="metric">1 cgpt creative</div>
        <div class="metric">1 gpt2 authority</div>
        <div class="metric">3 nbp renditions</div>
      </div>
      <div class="rail">
        <div>cgpt creative injection<br/><span class="chip ready">${liveIcon('status-ready', 9)} ready</span></div>
        <div>gpt2 authority concept<br/><span class="chip">${liveIcon('status-pending', 9)} pending</span></div>
        <div>nbp renditions<br/><span class="chip">${liveIcon('status-pending', 9)} pending</span></div>
      </div>
      <div class="cards">
        <article class="card" data-ready>
          <div class="cardHead">step 1 <span class="tag">${liveIcon('mark-cgpt', 10)} cgpt</span></div>
          <div class="row lead">${liveIcon('opus-explore', 10)} creative direction</div>
          <div class="row">${liveIcon('opus-context', 10)} page intelligence</div>
          <div class="row">${liveIcon('attach-style', 10)} brand context</div>
          <div class="row">${liveIcon('auth-cgpt-message', 10)} key messages</div>
          <div class="row">${liveIcon('attach-image', 10)} visual moodboard</div>
          <div class="note">${liveIcon('grok-manifest', 12)} output</div>
        </article>
        <article class="card">
          <div class="cardHead">step 2 <span class="tag">${liveIcon('mark-authority', 10)} gpt2</span></div>
          <div class="frame">${liveIcon('empty-concept', 18)}<span>authority concept pending</span></div>
          <div class="note">${liveIcon('grok-manifest', 12)} output</div>
        </article>
        <article class="card">
          <div class="cardHead">step 3 <span class="tag">${liveIcon('mark-grok', 10)} nbp</span></div>
          <div class="note">${liveIcon('auth-mobile', 11)} mobile (3)</div>
          <div class="frame">${liveIcon('empty-concept', 16)}</div>
          <div class="paging">${liveIcon('preview-prev', 10)} · ${liveIcon('preview-next', 10)}</div>
          <div class="note">${liveIcon('grok-manifest', 12)} output</div>
        </article>
      </div>
      <footer class="foot">
        <p class="note">${liveIcon('status-pending', 10)} outputs will populate below as each stage completes.</p>
        <div class="actions">
          <button class="gen" type="button">${liveIcon('grok-generate', 13)} generate</button>
          <button class="can" type="button">cancel</button>
        </div>
      </footer>
    </section>
  </div>
  <div>
    <p class="panel-label">After · ICONS-ONLY3 (staged)</p>
    <section class="s00-pcg" data-testid="pcg-icons-only3-after">
      <div class="head"><div class="title">Generate page concepts</div><span class="dismiss">${icon('site00-close', 10)} Cancel</span></div>
      <p class="target">Target · ndxbook / overview</p>
      <div class="summary">
        <div class="metric">${icon('site00-system', 13)}</div>
        <div class="metric">${icon('site00-cgpt', 10)} 1 cgpt creative</div>
        <div class="metric">${icon('site00-gpt2', 10)} 1 gpt2 authority</div>
        <div class="metric">${icon('site00-nbp', 10)} 3 nbp renditions</div>
      </div>
      <div class="rail">
        <div>cgpt creative injection<br/><span class="chip ready">${icon('site00-status-ready', 9)} ready</span></div>
        <div>gpt2 authority concept<br/><span class="chip">${icon('site00-status-pending', 9)} pending</span></div>
        <div>nbp renditions<br/><span class="chip">${icon('site00-status-pending', 9)} pending</span></div>
      </div>
      <div class="cards">
        <article class="card" data-ready>
          <div class="cardHead">step 1 <span class="tag">${icon('site00-cgpt', 10)} cgpt</span></div>
          <div class="row lead">${icon('site00-creative-direction', 10)} creative direction</div>
          <div class="row">${icon('site00-page-intelligence', 10)} page intelligence</div>
          <div class="row">${icon('site00-brand-context', 10)} brand context</div>
          <div class="row">${icon('site00-key-messages', 10)} key messages</div>
          <div class="row">${icon('site00-visual-moodboard', 10)} visual moodboard</div>
          <div class="note">${icon('site00-output-brief', 12)} output</div>
        </article>
        <article class="card">
          <div class="cardHead">step 2 <span class="tag">${icon('site00-gpt2', 10)} gpt2</span></div>
          <div class="frame">${icon('site00-authority-placeholder', 18)}<span>authority concept pending</span></div>
          <div class="note">${icon('site00-output-authority', 12)} output</div>
        </article>
        <article class="card">
          <div class="cardHead">step 3 <span class="tag">${icon('site00-nbp', 10)} nbp</span></div>
          <div class="note">${icon('site00-mobile', 11)} mobile (3)</div>
          <div class="frame">${icon('site00-rendition-placeholder', 16)}</div>
          <div class="paging">${icon('site00-chevron-left', 10)} ${icon('site00-dot-active', 6)} ${icon('site00-dot-inactive', 6)} ${icon('site00-chevron-right', 10)}</div>
          <div class="note">${icon('site00-output-renditions', 12)} output</div>
        </article>
      </div>
      <footer class="foot">
        <p class="note">${icon('site00-info', 10)} outputs will populate below as each stage completes.</p>
        <div class="actions">
          <button class="gen" type="button">${icon('site00-generate', 13)} generate</button>
          <button class="can" type="button">cancel</button>
        </div>
      </footer>
    </section>
  </div>
</div>
</html>
`,
);

writeFileSync(
  join(outDir, 'README.txt'),
  [
    'STAGED — GENERATE PAGE CONCEPTS ICONS-ONLY3',
    `Version: ${S00_PCG_ICON_VERSION}`,
    `Family: ${S00_PCG_ICON_FAMILY}`,
    `Count: ${defs.length}`,
    'Live panel mutation: NONE',
    'Geometry / text / logic: NO',
    'Composer integration: PENDING FOUNDER APPROVAL',
    '',
    'Open review.html. Filenames are site00-*.svg.',
    'Do not wire into PageConceptGeneratorPanel until founder approves.',
    '',
  ].join('\n'),
);

console.log(`staged ${defs.length} ICONS-ONLY3 SVGs → ${outDir}`);
