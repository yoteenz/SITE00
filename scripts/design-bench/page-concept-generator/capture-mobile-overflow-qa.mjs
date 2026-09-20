import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../../src/site00/styles/site00-page-concept-generator.css'),
  'utf8',
);

const planFoot =
  '1 CGPT creative injection + 1 GPT2 page authority + 3 NBP rendition groups (Mobile + Desktop). Confirm before spend.';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>${css}
body{margin:0;background:#333}
.wrap{min-height:100vh;display:flex;align-items:flex-end;justify-content:center}
</style>
</head>
<body><div class="wrap">
<div class="s00-pcg-layer" style="position:relative;inset:auto;width:100%">
<div class="s00-pcg-layer__box">
<section class="s00-pcg" data-testid="page-concept-generator-shell">
<header class="s00-pcg__head"><div class="s00-pcg__headRow"><h2 class="s00-pcg__title">GENERATE PAGE CONCEPTS</h2><button type="button" class="s00-pcg__dismiss">× CANCEL</button></div><p class="s00-pcg__target">TARGET · NDXBOOK / OVERVIEW</p></header>
<div class="s00-pcg__summary"><span class="s00-pcg__summaryGlyph">▣</span>
<span class="s00-pcg__metric"><strong class="s00-pcg__metricCount">1 CGPT</strong><span class="s00-pcg__metricLabel">CREATIVE</span></span>
<span class="s00-pcg__metric"><strong class="s00-pcg__metricCount">1 GPT2</strong><span class="s00-pcg__metricLabel">AUTHORITY</span></span>
<span class="s00-pcg__metric"><strong class="s00-pcg__metricCount">3 NBP</strong><span class="s00-pcg__metricLabel">RENDITIONS</span></span>
<span class="s00-pcg__metric"><strong class="s00-pcg__metricCount">6 VIEWPORT</strong><span class="s00-pcg__metricLabel">OUTPUTS</span><span class="s00-pcg__metricNote">(MOBILE + DESKTOP)</span></span>
</div>
<div class="s00-pcg__scroll">
<ol class="s00-pcg__rail">
<li class="s00-pcg__railItem"><span class="s00-pcg__railTitle">CGPT CREATIVE INJECTION</span><span class="s00-pcg__railNote">GENERATE CREATIVE DIRECTION, PAGE INTELLIGENCE AND BRAND CONTEXT.</span></li>
<li class="s00-pcg__railItem"><span class="s00-pcg__railTitle">GPT2 AUTHORITY CONCEPT</span><span class="s00-pcg__railNote">CREATE A SINGLE, REFINED AUTHORITY CONCEPT FOR THE PAGE.</span></li>
<li class="s00-pcg__railItem"><span class="s00-pcg__railTitle">NBP RENDITIONS</span><span class="s00-pcg__railNote">PRODUCE MULTIPLE VIEWPORT RENDERS (MOBILE + DESKTOP) FROM THE CONCEPT.</span></li>
</ol>
<div class="s00-pcg__cards"><article class="s00-pcg__card"><h3 class="s00-pcg__cardTitle">CREATIVE INJECTION</h3></article><article class="s00-pcg__card"><h3 class="s00-pcg__cardTitle">AUTHORITY CONCEPT</h3></article><article class="s00-pcg__card"><h3 class="s00-pcg__cardTitle">RENDITIONS</h3></article></div>
</div>
<footer class="s00-pcg__foot">
<p class="s00-pcg__footNotes"><span class="s00-pcg__footNote">OUTPUTS WILL POPULATE BELOW AS EACH STAGE COMPLETES.</span>
<span class="s00-pcg__footSpend"><span class="s00-pcg__footSpendFull">${planFoot.toUpperCase()} · CONFIRM BEFORE SEND.</span><span class="s00-pcg__footSpendCompact"><span class="s00-pcg__footSpendConfirm">CONFIRM BEFORE SEND.</span><span class="s00-pcg__footSpendMicro">1 CGPT + 1 GPT2 + 3 NBP · 6 OUTPUTS</span></span></span></p>
<div class="s00-pcg__actions"><button class="s00-pcg__generate">GENERATE</button><button class="s00-pcg__cancel">CANCEL</button></div>
</footer>
</section></div></div></div></body></html>`;

const browser = await chromium.launch();
for (const [w, h, name] of [
  [390, 844, '390'],
  [393, 852, '393'],
  [430, 932, '430'],
  [1280, 900, 'desktop'],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'load' });
  const metrics = await page.evaluate(() => ({
    docScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    shellScroll: (() => {
      const el = document.querySelector('.s00-pcg');
      return el ? el.scrollWidth - el.clientWidth : 0;
    })(),
  }));
  if (metrics.docScroll > 1 || metrics.shellScroll > 1) {
    throw new Error(`overflow at ${name}: ${JSON.stringify(metrics)}`);
  }
  await page.locator('[data-testid="page-concept-generator-shell"]').screenshot({
    path: `/opt/cursor/artifacts/pcg-rollback-overflow-fix2-${name}.png`,
    type: 'png',
  });
}
await browser.close();
console.log('QA screenshots saved, no horizontal overflow');
