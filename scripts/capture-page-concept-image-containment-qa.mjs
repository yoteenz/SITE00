/**
 * Visual QA — bounded concept previews (mobile / tablet / desktop widths).
 */
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ART = '/opt/cursor/artifacts/page-concept-image-containment-qa';
const CSS_PATH = path.resolve('src/site00/styles/site00-page-concept-generator.css');

const VIEWPORTS = [
  { id: 'mobile', width: 390, height: 844 },
  { id: 'tablet', width: 834, height: 1112 },
  { id: 'desktop', width: 1280, height: 900 },
];

const css = await readFile(CSS_PATH, 'utf8');
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>${css}</style></head><body class="s00-pcg">
<section class="s00-pcg__mobileReview">
${['A', 'B', 'C']
  .map(
    (l) => `<article class="s00-pcg__mobileReviewCard"><header>MOBILE CONCEPT ${l}</header>
<div class="s00-pcg__containPreview" data-contain-size="mobile"><div class="s00-pcg__containPreviewStage">
<img class="s00-pcg__containPreviewImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='390' height='844'/%3E" alt=""/>
</div></div></article>`,
  )
  .join('')}
</section>
<section class="s00-pcg__viewportFamilyGrid">
<div class="s00-pcg__containPreview" data-contain-size="tablet"><div class="s00-pcg__containPreviewStage"><img class="s00-pcg__containPreviewImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='768' height='1024'/%3E"/></div></div>
<div class="s00-pcg__containPreview" data-contain-size="desktop"><div class="s00-pcg__containPreviewStage"><img class="s00-pcg__containPreviewImg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1440' height='900'/%3E"/></div></div>
</section>
</body></html>`;

await mkdir(ART, { recursive: true });
const htmlPath = path.join(ART, 'index.html');
await writeFile(htmlPath, html);

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(`file://${htmlPath}`);
  await page.screenshot({ path: path.join(ART, `three-concepts-${vp.id}.png`), fullPage: true });
  const frameBox = await page.locator('.s00-pcg__containPreview').first().boundingBox();
  if (frameBox) {
    expectHeight(frameBox.height, vp.id);
  }
  await page.close();
}
await browser.close();
console.log('Wrote containment QA to', ART);

function expectHeight(h, vp) {
  if (h > 500) throw new Error(`Preview too tall on ${vp}: ${h}px`);
}
