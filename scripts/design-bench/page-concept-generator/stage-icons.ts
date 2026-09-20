/**
 * Dump the staged GENERATE PAGE CONCEPTS icon + label family for founder review.
 * Does not mutate live panel bindings, CSS, or approved manifests.
 *
 *   npx tsx scripts/design-bench/page-concept-generator/stage-icons.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderAiConsoleIconSvg } from '../../../shared/site00-design-workspace-production/designAiConsoleIconography.ts';
import {
  PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL,
  PAGE_CONCEPT_GENERATOR_OUTPUT_ICON_FAMILY,
  PAGE_CONCEPT_GENERATOR_PLACEHOLDER_SET,
  PCG_ICON_FAMILY,
  PCG_ICON_STATUS,
  PCG_ICON_STROKE,
  PCG_ICON_VERSION,
  PCG_ICON_VIEWBOX,
  PCG_INTERACTION_CLASSIFICATION,
  PCG_MODEL_TAG_STYLE,
  PCG_PREVIOUS_PASS,
  PCG_STATUS_CHIP_STYLE,
  listPcgIconDefs,
  renderPcgIconSvg,
  type PcgIconId,
} from '../../../shared/site00-design-workspace-production/pageConceptGeneratorIconography.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '../../../public/site00/page-concept-generator/staged');
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
      previousPass: PCG_PREVIOUS_PASS,
      family: PCG_ICON_FAMILY,
      viewBox: PCG_ICON_VIEWBOX,
      stroke: PCG_ICON_STROKE,
      count: defs.length,
      livePanelMutation: 'NONE',
      geometryMutated: 'NO',
      logicMutated: 'NO',
      composerIntegration: 'PENDING_FOUNDER_APPROVAL',
      readyForFounderReview: true,
      icons: defs.map((def) => ({
        id: def.id,
        group: def.group,
        location: def.location,
        meaning: def.meaning,
        visualRole: def.visualRole,
        interactive: def.interactive ? 'YES' : 'NO',
        recommendedSize: def.recommendedSize,
        defaultState: def.defaultState,
        activeState: def.activeState,
        disabledState: def.disabledState,
        svgFilename: `${def.id}.svg`,
        darkVariant: 'currentColor',
      })),
      proposal: PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL,
      outputIconFamily: PAGE_CONCEPT_GENERATOR_OUTPUT_ICON_FAMILY,
      placeholderSet: PAGE_CONCEPT_GENERATOR_PLACEHOLDER_SET,
      modelTagStyle: PCG_MODEL_TAG_STYLE,
      statusChipStyle: PCG_STATUS_CHIP_STYLE,
      interactionClassification: PCG_INTERACTION_CLASSIFICATION,
    },
    null,
    2,
  )}\n`,
);

const tiles = defs
  .map((def) => {
    const svg = renderPcgIconSvg(def.id);
    return `
    <figure class="tile" data-group="${def.group}" data-role="${def.visualRole}" id="${def.id}">
      <div class="swatch swatch-paper">${svg}</div>
      <div class="swatch swatch-lime">${svg}</div>
      <div class="swatch swatch-ink">${svg}</div>
      <figcaption>
        <strong>${def.id}</strong>
        <span>${def.visualRole} · interactive ${def.interactive ? 'YES' : 'NO'} · ${def.recommendedSize}px</span>
        <em>${def.location}</em>
        <em>${def.meaning}</em>
        <em>${def.id}.svg</em>
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

const classRows = PCG_INTERACTION_CLASSIFICATION.map(
  (row) => `
  <tr>
    <td>${row.semanticName}</td>
    <td>${row.visualRole}</td>
    <td>${row.interactive ? 'YES' : 'NO'}</td>
    <td>${row.intendedSize}</td>
    <td>${row.states}</td>
    <td>${row.svgFilename ?? '—'}</td>
  </tr>`,
).join('');

const icon = (id: PcgIconId, size: number) => renderPcgIconSvg(id, size);

const liveIcon = (id: Parameters<typeof renderAiConsoleIconSvg>[0], size: number) =>
  renderAiConsoleIconSvg(id).replace('<svg', `<svg width="${size}" height="${size}"`);

writeFileSync(
  join(outDir, 'review.html'),
  `<!doctype html>
<html lang="en">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>STAGED — GENERATE PAGE CONCEPTS icon + label cleanup2</title>
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="./s00-pcg-cleanup2.css"/>
<style>
  :root { --paper:#fdfdfd; --ink:#101010; --lime:#cdee30; --panel:#f7f7f7; --muted:#77777d; --border:#e4e4e4; --pcg-paper:#fdfdfd; --pcg-panel:#f7f7f7; --pcg-sunken:#f1f1f1; --pcg-ink:#101010; --pcg-ink-2:#454549; --pcg-ink-3:#77777d; --pcg-border-major:#b8b8b8; --pcg-border-panel:#cfcfcf; --pcg-border-subtle:#e4e4e4; --pcg-black:#0a0a0a; --pcg-lime:#cdee30; --pcg-lime-ink:#131a04; --pcg-red:#c2281d; --pcg-amber:#e0a90a; }
  html,body { margin:0; background:#0a0a0a; color:#f5f5f5; font:11px/1.4 "Martian Mono", ui-monospace, monospace; text-transform:uppercase; }
  header { padding:28px 24px 16px; border-bottom:1px solid #333; }
  h1,h2 { margin:0 0 8px; letter-spacing:.08em; }
  h1 { font-size:15px; }
  h2 { font-size:12px; padding:20px 24px 0; }
  p { margin:0; color:#9a9a9a; max-width:88em; }
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
  table { width:calc(100% - 48px); margin:16px 24px 24px; border-collapse:collapse; font-size:10px; }
  th,td { border:1px solid #333; padding:8px; text-align:left; }
  th { color:#cdee30; }
  .specimens { display:flex; flex-wrap:wrap; gap:16px; padding:16px 24px 24px; }
  .specimen { background:#111; border:1px solid #333; padding:14px; min-width:220px; }
  .specimen h3 { margin:0 0 10px; font-size:10px; color:#cdee30; }
  .compare-panels { display:grid; grid-template-columns:1fr 1fr; gap:18px; padding:16px 24px 48px; }
  @media (max-width: 860px) { .compare-panels { grid-template-columns:1fr; } }
  .panel-label { margin:0 0 8px; color:#cdee30; letter-spacing:.1em; }
  .s00-pcg { --pcg-mono:"Martian Mono", ui-monospace, monospace; background:var(--paper); color:var(--ink); border:1px solid #b8b8b8; max-width:390px; font-family:var(--pcg-mono); }
  .s00-pcg * { box-sizing:border-box; font-family:inherit; text-transform:uppercase; }
  .head { display:flex; align-items:center; justify-content:space-between; padding:16px 14px 8px; }
  .title { font-size:14px; font-weight:700; }
  .dismiss { display:inline-flex; align-items:center; gap:5px; min-height:28px; padding:0 9px; border:1px solid #cfcfcf; border-radius:999px; background:#fff; font:inherit; font-size:9px; cursor:pointer; }
  .target { margin:0 14px 8px; font-size:9.5px; color:#77777d; }
  .summary { display:flex; background:var(--panel); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .metric { flex:1; padding:7px 6px; border-right:1px solid var(--border); font-size:8px; }
  .rail { display:grid; grid-template-columns:repeat(3,1fr); padding:10px 12px; text-align:center; gap:4px; }
  .s00-pcg--before .chip { display:inline-flex; align-items:center; gap:3px; padding:2px 6px; border:1px solid #cfcfcf; border-radius:999px; font-size:7.5px; font-weight:700; }
  .s00-pcg--before .chip.ready { background:var(--lime); border-color:#0a0a0a; }
  .s00-pcg--before .tag { display:inline-flex; align-items:center; gap:4px; margin-left:auto; padding:3px 5px; border:1px solid #b8b8b8; background:#f7f7f7; font-size:7px; font-weight:700; }
  .s00-pcg--before .card[data-stage-state='READY'] .tag { background:var(--lime); border-color:#0a0a0a; }
  .cards { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:8px 12px 10px; }
  .card { border:1px solid var(--border); background:var(--panel); padding:7px 6px; }
  .cardHead { display:flex; align-items:center; gap:6px; padding-bottom:4px; border-bottom:1px solid var(--border); font-size:7.5px; }
  .row { display:flex; align-items:center; gap:4px; min-height:22px; padding:4px 5px; border:1px solid var(--border); background:#fff; font-size:6.5px; margin-bottom:4px; }
  .row.lead { background:var(--lime); }
  .frame { min-height:56px; border:1px solid var(--border); background:#f1f1f1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font-size:6.5px; color:#77777d; }
  .foot { padding:8px 14px 10px; background:var(--panel); border-top:1px solid var(--border); }
  .actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .gen,.can { min-height:40px; border:1px solid #0a0a0a; font:inherit; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; }
  .gen { background:var(--lime); }
  .can { background:#fff; }
  .note { display:flex; align-items:center; gap:6px; font-size:8px; color:#77777d; margin:0 0 6px; }
  .paging { display:flex; align-items:center; justify-content:center; gap:8px; padding-top:4px; }
  .s00-pcg--before .pageArrow { width:20px; height:20px; border:1px solid #e4e4e4; display:inline-flex; align-items:center; justify-content:center; }
  .s00-pcg--before .dot { width:5px; height:5px; border-radius:50%; background:#cfcfcf; display:inline-block; }
  .s00-pcg--before .dot.active { background:var(--lime); outline:1px solid #0a0a0a; }

  /* After panel uses live class names so staged CSS can land on them. */
  .s00-pcg--after .s00-pcg__chip { margin-top:2px; }
  .s00-pcg--after .s00-pcg__tag { margin-left:auto; }
</style>
<header>
  <h1>Staged GENERATE PAGE CONCEPTS — icon + label cleanup2</h1>
  <p>Second refinement pass after ${PCG_PREVIOUS_PASS}. Model tags and status chips stop looking like buttons. Action controls stay actionable. Live pop-up, geometry, and pipeline are unchanged until founder approval.</p>
  <p class="meta">${PCG_ICON_VERSION} · ${PCG_ICON_FAMILY} · ${PCG_ICON_STATUS} · ${defs.length} ICONS · LIVE MUTATION NONE · GEOMETRY NO · LOGIC NO</p>
</header>
<nav>
  <a href="#classify">classification</a>
  <a href="#tags">tags / chips</a>
  <a href="#sheet">icon sheet</a>
  <a href="#compare">icon before / after</a>
  <a href="#preview">panel before / after</a>
</nav>

<h2 id="classify">1. Interaction classification</h2>
<table>
  <thead><tr><th>Semantic</th><th>Role</th><th>Interactive</th><th>Size</th><th>State</th><th>SVG</th></tr></thead>
  <tbody>${classRows}</tbody>
</table>

<h2 id="tags">2. Model tag + status chip specimens</h2>
<section class="specimens">
  <div class="specimen">
    <h3>Before — button-like</h3>
    <div class="s00-pcg s00-pcg--before" style="border:0;background:transparent">
      <span class="tag">${liveIcon('mark-cgpt', 10)} CGPT</span>
      <span class="chip ready">${liveIcon('status-ready', 9)} READY</span>
      <span class="chip">${liveIcon('status-pending', 9)} PENDING</span>
    </div>
  </div>
  <div class="specimen">
    <h3>After — system labels + status</h3>
    <div class="s00-pcg s00-pcg--after" style="border:0;background:transparent;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <span class="s00-pcg__tag">${icon('pcg-cgpt', 10)} CGPT</span>
      <span class="s00-pcg__tag">${icon('pcg-gpt2', 10)} GPT2</span>
      <span class="s00-pcg__tag">${icon('pcg-nbp', 10)} NBP</span>
      <span class="s00-pcg__chip" data-state="READY">${icon('pcg-status-ready', 9)} READY</span>
      <span class="s00-pcg__chip" data-state="PENDING">${icon('pcg-status-pending', 9)} PENDING</span>
      <span class="s00-pcg__chip" data-state="ACTIVE">${icon('pcg-status-running', 9)} RUNNING</span>
      <span class="s00-pcg__chip" data-state="COMPLETE">${icon('pcg-status-complete', 9)} COMPLETE</span>
      <span class="s00-pcg__chip" data-state="FAILED">${icon('pcg-status-failed', 9)} FAILED</span>
      <span class="s00-pcg__chip" data-state="PARTIAL">${icon('pcg-status-partial', 9)} PARTIAL</span>
    </div>
  </div>
  <div class="specimen">
    <h3>Action remains a button</h3>
    <button class="gen" type="button">${icon('pcg-generate', 13)} GENERATE</button>
  </div>
</section>

<h2 id="sheet">3. Icon sheet</h2>
<section class="grid">${tiles}</section>
<h2 id="compare">4. Icon before / after — live AIC vs cleanup2</h2>
<section class="pairs">${pairs}</section>

<h2 id="preview">5. Panel preview — live treatment vs staged cleanup2</h2>
<div class="compare-panels">
  <div>
    <p class="panel-label">Before · current implemented labels (button-like)</p>
    <section class="s00-pcg s00-pcg--before" data-testid="pcg-icon-preview-before">
      <div class="head">
        <div class="title">Generate page concepts</div>
        <span class="dismiss">${liveIcon('action-close', 10)} Cancel</span>
      </div>
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
        <article class="card" data-stage-state="READY">
          <div class="cardHead">step 1 <span class="tag">${liveIcon('mark-cgpt', 10)} cgpt</span></div>
          <div class="row lead">${liveIcon('opus-explore', 10)} creative direction</div>
          <div class="row">${liveIcon('opus-context', 10)} page intelligence</div>
          <div class="row">${liveIcon('attach-style', 10)} brand context</div>
          <div class="row">${liveIcon('auth-cgpt-message', 10)} key messages</div>
          <div class="row">${liveIcon('attach-image', 10)} visual moodboard</div>
        </article>
        <article class="card">
          <div class="cardHead">step 2 <span class="tag">${liveIcon('mark-authority', 10)} gpt2</span></div>
          <div class="frame">${liveIcon('empty-concept', 18)}<span>authority concept pending</span></div>
        </article>
        <article class="card">
          <div class="cardHead">step 3 <span class="tag">${liveIcon('mark-grok', 10)} nbp</span></div>
          <div class="note">${liveIcon('auth-mobile', 11)} mobile (3)</div>
          <div class="frame">${liveIcon('empty-concept', 16)}</div>
          <div class="paging"><span class="pageArrow">${liveIcon('preview-prev', 10)}</span><span class="dot active"></span><span class="dot"></span><span class="dot"></span><span class="pageArrow">${liveIcon('preview-next', 10)}</span></div>
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
    <p class="panel-label">After · cleanup2 tags, chips, icons (staged)</p>
    <section class="s00-pcg s00-pcg--after" data-testid="pcg-icon-preview">
      <div class="head">
        <div class="title">Generate page concepts</div>
        <button class="dismiss s00-pcg__dismiss" type="button">${icon('pcg-close', 10)} Cancel</button>
      </div>
      <p class="target">Target · ndxbook / overview</p>
      <div class="summary">
        <div class="metric">${icon('pcg-system', 13)}</div>
        <div class="metric">${icon('pcg-cgpt', 10)} 1 cgpt creative</div>
        <div class="metric">${icon('pcg-gpt2', 10)} 1 gpt2 authority</div>
        <div class="metric">${icon('pcg-nbp', 10)} 3 nbp renditions</div>
      </div>
      <div class="rail">
        <div>cgpt creative injection<br/><span class="s00-pcg__chip" data-state="READY">${icon('pcg-status-ready', 9)} ready</span></div>
        <div>gpt2 authority concept<br/><span class="s00-pcg__chip" data-state="PENDING">${icon('pcg-status-pending', 9)} pending</span></div>
        <div>nbp renditions<br/><span class="s00-pcg__chip" data-state="PENDING">${icon('pcg-status-pending', 9)} pending</span></div>
      </div>
      <div class="cards">
        <article class="card s00-pcg__card" data-stage-state="READY">
          <div class="cardHead">step 1 <span class="s00-pcg__tag">${icon('pcg-cgpt', 10)} cgpt</span></div>
          <div class="row lead">${icon('pcg-creative-direction', 10)} creative direction</div>
          <div class="row">${icon('pcg-page-intelligence', 10)} page intelligence</div>
          <div class="row">${icon('pcg-brand-context', 10)} brand context</div>
          <div class="row">${icon('pcg-key-messages', 10)} key messages</div>
          <div class="row">${icon('pcg-visual-moodboard', 10)} visual moodboard</div>
          <div class="note">${icon('pcg-output-brief', 12)} structured brief</div>
        </article>
        <article class="card s00-pcg__card">
          <div class="cardHead">step 2 <span class="s00-pcg__tag">${icon('pcg-gpt2', 10)} gpt2</span></div>
          <div class="frame s00-pcg__frameEmpty">${icon('pcg-authority-empty', 18)}<span>authority concept pending</span></div>
          <div class="note">${icon('pcg-output-authority', 12)} authority artifact</div>
        </article>
        <article class="card s00-pcg__card">
          <div class="cardHead">step 3 <span class="s00-pcg__tag">${icon('pcg-nbp', 10)} nbp</span></div>
          <div class="note">${icon('pcg-mobile', 11)} mobile (3)</div>
          <div class="frame s00-pcg__frameEmpty">${icon('pcg-rendition-empty', 16)}</div>
          <div class="paging">
            <span class="s00-pcg__pageArrow">${icon('pcg-prev', 10)}</span>
            ${icon('pcg-dot-active', 6)}
            ${icon('pcg-dot-inactive', 6)}
            ${icon('pcg-dot-inactive', 6)}
            <span class="s00-pcg__pageArrow">${icon('pcg-next', 10)}</span>
          </div>
          <div class="note">${icon('pcg-output-rendition', 12)} rendition set</div>
        </article>
      </div>
      <footer class="foot">
        <p class="note">${icon('pcg-info', 10)} outputs will populate below as each stage completes.</p>
        <div class="actions">
          <button class="gen s00-pcg__generate" type="button">${icon('pcg-generate', 13)} generate</button>
          <button class="can s00-pcg__cancel" type="button">cancel</button>
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
    'STAGED — GENERATE PAGE CONCEPTS icon + label cleanup2',
    `Version: ${PCG_ICON_VERSION}`,
    `Previous pass: ${PCG_PREVIOUS_PASS}`,
    `Family: ${PCG_ICON_FAMILY}`,
    `Status: ${PCG_ICON_STATUS}`,
    `Count: ${defs.length}`,
    'Live panel mutation: NONE',
    'Geometry mutated: NO',
    'Logic mutated: NO',
    'Composer integration: PENDING FOUNDER APPROVAL',
    '',
    'Open review.html for classification, tag/chip specimens, icon sheet,',
    'icon before/after, and panel before/after.',
    'Import s00-pcg-cleanup2.css only after founder approval.',
    'Do not copy these IDs into PageConceptGeneratorPanel until founder approves.',
    '',
  ].join('\n'),
);

console.log(`staged ${defs.length} PCG cleanup2 assets → ${outDir}`);
