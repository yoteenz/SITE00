/**
 * INVITATION 001 — founder comparison board.
 * Composes the code-rendered territory artifacts into one review image. Founder selection stays PENDING.
 *
 *   npx tsx scripts/site00/invitation001/render-founder-board.ts
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { FONT_LINK, RED, INK, TERRITORIES } from './territories';

const RENDERS = resolve('docs/site00/invitation-system/invitation-001/renders');
const HTML_OUT = resolve(RENDERS, '../html');

const dataUrl = (file: string) => {
  const ext = file.endsWith('.png') ? 'png' : 'jpeg';
  return `data:image/${ext};base64,${readFileSync(join(RENDERS, file)).toString('base64')}`;
};

const TRADEOFFS: Record<string, { feel: string; risk: string; cost: string; fit: string }> = {
  A: {
    feel: 'Editorial, luminous, gallery invitation. Reads as an event, not a sales card.',
    risk: 'White stock shows handling marks; edge paint must be tightly registered on thick board.',
    cost: 'STANDARD PREMIUM: moderate · SPECIALTY: painted edge + blind emboss add setup',
    fit: 'Closest to SITE 00 light surface and editorial type system.',
  },
  B: {
    feel: 'Private, nocturnal, membership. Foil carries the mark.',
    risk: 'Drifts toward credit-card look if foil or proportions are over-used; QR needs a white panel.',
    cost: 'STANDARD PREMIUM: moderate · SPECIALTY: soft-touch + foil + spot gloss add passes',
    fit: 'Strong desk presence; furthest from the light product surface.',
  },
  C: {
    feel: 'Architectural object. The aperture is the threshold to the digital address.',
    risk: 'Non-standard size, triplex lamination and die-aligned red geometry raise tolerance risk.',
    cost: 'STANDARD PREMIUM: higher · SPECIALTY: triplex + custom size highest',
    fit: 'Most distinctive; strongest bridge to the immersive arrival.',
  },
};

function column(id: 'A' | 'B' | 'C'): string {
  const t = TERRITORIES.find((x) => x.id === id)!;
  const k = id.toLowerCase();
  const tr = TRADEOFFS[id];
  return `
  <section class="col">
    <header><span class="tid">TERRITORY ${id}</span><h2>${t.name}</h2><p class="concept">${t.concept}</p></header>
    <div class="pair ${id === 'C' ? 'vert' : ''}">
      <figure><img src="${dataUrl(`territory-${k}-front.png`)}"><figcaption>FRONT</figcaption></figure>
      <figure><img src="${dataUrl(`territory-${k}-back.png`)}"><figcaption>BACK · PROTOTYPE QR</figcaption></figure>
    </div>
    <div class="trio">
      <figure><img src="${dataUrl(`territory-${k}-material-three-quarter.jpg`)}"><figcaption>MATERIAL · CODE RENDER</figcaption></figure>
      <figure><img src="${dataUrl(`territory-${k}-detail-macro.jpg`)}"><figcaption>DETAIL MACRO</figcaption></figure>
      <figure><img src="${dataUrl(`territory-${k}-in-hand-visualization.jpg`)}"><figcaption>AI VISUALIZATION · NOT A PROOF</figcaption></figure>
    </div>
    <dl>
      <dt>SIZE</dt><dd>${t.widthMm} × ${t.heightMm} MM · ${t.thicknessMm} MM</dd>
      <dt>FEEL</dt><dd>${tr.feel}</dd>
      <dt>RISK</dt><dd>${tr.risk}</dd>
      <dt>COST</dt><dd>${tr.cost}</dd>
      <dt>FIT</dt><dd>${tr.fit}</dd>
    </dl>
  </section>`;
}

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:2400px;background:#F5F3F3;color:${INK};font-family:'Barlow',sans-serif;-webkit-font-smoothing:antialiased;padding:72px 72px 64px}
  .top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid ${INK};padding-bottom:28px;margin-bottom:40px}
  .wm{font-family:'Martian Mono',monospace;font-weight:800;font-variation-settings:'wdth' 75;font-size:30px;display:flex;align-items:center;gap:12px}
  .dia{width:10px;height:10px;background:${RED};transform:rotate(45deg)}
  h1{font-family:'Oswald',sans-serif;font-weight:600;font-size:64px;letter-spacing:.01em;line-height:1;margin-top:18px}
  .status{text-align:right;font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;letter-spacing:.14em;font-size:18px;line-height:1.7}
  .status b{color:${RED}}
  .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:48px}
  .col{background:#fff;padding:32px;border:1px solid #dcd8d8}
  .tid{font-family:'Martian Mono',monospace;font-size:15px;letter-spacing:.12em;color:${RED}}
  h2{font-family:'Oswald',sans-serif;font-weight:600;font-size:40px;margin:6px 0 8px}
  .concept{font-size:18px;line-height:1.4;color:#3a3a3a;min-height:76px}
  figure{margin:0}
  figure img{width:100%;display:block;box-shadow:0 10px 30px rgba(0,0,0,.12)}
  figcaption{font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;letter-spacing:.14em;font-size:12px;color:#6b6b6b;margin-top:8px}
  .pair{display:grid;grid-template-columns:1fr;gap:18px;margin:24px 0}
  .pair.vert{grid-template-columns:1fr 1fr}
  .trio{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
  .trio img{aspect-ratio:1/1;object-fit:cover}
  dl{display:grid;grid-template-columns:90px 1fr;gap:10px 16px;font-size:17px;line-height:1.4;border-top:1px solid #e3dfdf;padding-top:18px}
  dt{font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;letter-spacing:.14em;font-size:13px;padding-top:3px}
  .foot{display:grid;grid-template-columns:1.2fr 1fr;gap:48px;margin-top:40px;border-top:2px solid ${INK};padding-top:28px;font-size:19px;line-height:1.5}
  .foot h3{font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;letter-spacing:.14em;font-size:15px;margin-bottom:8px}
  .rec{border-left:4px solid ${RED};padding-left:20px}
`;

function boardHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}<style>${CSS}</style></head><body>
  <div class="top">
    <div><div class="wm">SITE 00<i class="dia"></i></div><h1>INVITATION 001 · PHYSICAL TERRITORIES</h1></div>
    <div class="status">FOUNDER SELECTION: <b>PENDING</b><br>PRINT PRODUCTION: NOT AUTHORIZED<br>QR: PROTOTYPE · VERIFY ON PHYSICAL PROOF</div>
  </div>
  <div class="cols">${column('A')}${column('B')}${column('C')}</div>
  <div class="foot">
    <div class="rec"><h3>AGENT RECOMMENDATION (NOT APPROVAL)</h3>
      Territory A. It is the most legible expression of the SITE 00 light editorial system, keeps the QR on a clean white field
      with the widest scan margin, and its premium cues (painted red edge, blind emboss, silver hairline) survive a STANDARD PREMIUM
      run without specialty tooling. Territory C is the strongest object and the best bridge to the digital arrival, at higher
      fabrication risk.</div>
    <div><h3>HOW TO READ THIS BOARD</h3>
      Fronts, backs and material views are code renders at 300 PPI from the same source as the print files.
      AI visualizations show context and approximate scale only. They are not print proofs.
      Every QR resolves to site00.com/invite/aio-office-inv001 and is a prototype until scanned on a physical proof.</div>
  </div>
</body></html>`;
}

async function main(): Promise<void> {
  mkdirSync(HTML_OUT, { recursive: true });
  const html = boardHtml();
  writeFileSync(join(HTML_OUT, 'invitation001-founder-board.html'), html.replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g, '#embedded'));
  const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? join(homedir(), '.cache/ms-playwright/chromium-1148/chrome-linux/chrome');
  const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
  const ctx = await browser.newContext({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const out = join(RENDERS, 'invitation001-founder-board.jpg');
  await p.screenshot({ path: out, type: 'jpeg', quality: 86, fullPage: true });
  await browser.close();
  console.log('wrote', out);
}

void main();
