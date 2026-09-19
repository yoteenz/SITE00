/**
 * Dump the staged AI-console icon family to public/site00/ai-consoles/staged/
 * for founder review. Does not touch any approved asset manifest.
 *
 *   npx tsx scripts/design-bench/ai-consoles/stage-icons.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AIC_ICON_FAMILY,
  AIC_ICON_STATUS,
  AIC_ICON_STROKE,
  AIC_ICON_VERSION,
  AIC_ICON_VIEWBOX,
  listStagedAiConsoleIcons,
  renderAiConsoleIconSvg,
} from '../../../shared/site00-design-workspace-production/designAiConsoleIconography.ts';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../../../public/site00/ai-consoles/staged');
mkdirSync(outDir, { recursive: true });

const defs = listStagedAiConsoleIcons();

for (const def of defs) {
  writeFileSync(join(outDir, `${def.id}.svg`), `${renderAiConsoleIconSvg(def.id)}\n`);
}

writeFileSync(
  join(outDir, 'manifest.json'),
  `${JSON.stringify(
    {
      status: AIC_ICON_STATUS,
      version: AIC_ICON_VERSION,
      family: AIC_ICON_FAMILY,
      viewBox: AIC_ICON_VIEWBOX,
      stroke: AIC_ICON_STROKE,
      count: defs.length,
      approvedAssetMutation: 'NONE',
      icons: defs.map((def) => ({
        id: def.id,
        console: def.console,
        usage: def.usage,
        defaultState: def.defaultState,
        activeState: def.activeState,
        disabledState: def.disabledState,
        darkVariant: def.darkVariant,
      })),
    },
    null,
    2,
  )}\n`,
);

const tiles = defs
  .map((def) => {
    const svg = renderAiConsoleIconSvg(def.id);
    return `
    <figure class="tile" data-console="${def.console}" id="${def.id}">
      <div class="swatch swatch-paper">${svg}</div>
      <div class="swatch swatch-lime">${svg}</div>
      <div class="swatch swatch-ink">${svg}</div>
      <figcaption>
        <strong>${def.id}</strong>
        <span>${def.console}</span>
        <em>${def.usage}</em>
      </figcaption>
    </figure>`;
  })
  .join('');

writeFileSync(
  join(outDir, 'index.html'),
  `<!doctype html>
<html lang="en">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>STAGED — SITE 00 AI console icon family</title>
<style>
  :root { --paper:#fdfdfd; --ink:#161616; --lime:#cdee30; }
  html,body { margin:0; background:#0a0a0a; color:#f5f5f5; font:12px/1.4 "Martian Mono", ui-monospace, monospace; }
  header { padding:28px 24px 16px; border-bottom:1px solid #333; }
  h1 { margin:0 0 8px; font-size:16px; letter-spacing:.12em; text-transform:uppercase; }
  p { margin:0; color:#9a9a9a; max-width:72em; }
  .meta { margin-top:10px; color:#cdee30; letter-spacing:.08em; }
  nav { display:flex; gap:16px; padding:12px 24px; flex-wrap:wrap; }
  nav a { color:#cdee30; text-transform:uppercase; letter-spacing:.08em; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; padding:16px 24px 48px; }
  .tile { margin:0; border:1px solid #333; background:#111; }
  .swatch { display:flex; align-items:center; justify-content:center; height:72px; }
  .swatch svg { width:28px; height:28px; }
  .swatch-paper { background:var(--paper); color:var(--ink); }
  .swatch-lime { background:var(--lime); color:#101505; }
  .swatch-ink { background:#0a0a0a; color:var(--lime); }
  figcaption { padding:8px 10px 10px; display:flex; flex-direction:column; gap:3px; }
  figcaption strong { letter-spacing:.04em; }
  figcaption span { color:#cdee30; font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
  figcaption em { color:#888; font-style:normal; font-size:10px; }
</style>
<header>
  <h1>STAGED AI-console icon family</h1>
  <p>P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1. One 24×24 construction grid, 1.5 stroke, square caps. Paper / lime / ink swatches. Founder approval required before manifest integration. Approved-asset mutation: NONE.</p>
  <p class="meta">${AIC_ICON_VERSION} · ${AIC_ICON_FAMILY} · ${AIC_ICON_STATUS} · ${defs.length} ICONS</p>
</header>
<nav>
  <a href="#mark-opus">marks</a>
  <a href="#status-ready">status</a>
  <a href="#opus-design">opus</a>
  <a href="#grok-generate">grok</a>
  <a href="#auth-mobile">authority</a>
</nav>
<section class="grid">${tiles}</section>
</html>
`,
);

writeFileSync(
  join(outDir, 'README.txt'),
  [
    'STAGED — SITE 00 AI console visual micro-assets',
    `Version: ${AIC_ICON_VERSION}`,
    `Family: ${AIC_ICON_FAMILY}`,
    `Status: ${AIC_ICON_STATUS}`,
    `Count: ${defs.length}`,
    'Approved asset mutation: NONE',
    '',
    'These files are for founder review only.',
    'Do not copy them into an approved manifest without an explicit approve.',
    'Open index.html to inspect paper / lime / ink variants.',
    '',
  ].join('\n'),
);

console.log(`staged ${defs.length} AI-console icons → ${outDir}`);
