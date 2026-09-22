/**
 * Visual QA stills for founder review UX (mobile / tablet / desktop widths).
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ART = '/opt/cursor/artifacts/page-concept-founder-review-qa';
const CSS_PATH = path.resolve('src/site00/styles/site00-page-concept-generator.css');

const STATES = [
  'cgpt-review',
  'full-brief-drawer',
  'mobile-concept-review',
  'concept-inspect',
  'experience-expression',
  'viewport-family',
  'page-family-system',
  'ready-for-twin',
  'twin-review',
  'live-promotion',
];

const VIEWPORTS = [
  { id: 'mobile', width: 390, height: 844 },
  { id: 'tablet', width: 834, height: 1112 },
  { id: 'desktop', width: 1280, height: 900 },
];

const htmlShell = (css) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><style>${css}</style></head><body>
${STATES.map((id) => `<section id="${id}" class="s00-pcg qa-block" data-qa-state="${id}"><header class="s00-pcg__head"><h2 class="s00-pcg__title">GENERATE PAGE CONCEPTS</h2></header>
${stateMarkup(id)}
</section>`).join('\n')}
</body></html>`;

function stateMarkup(id) {
  switch (id) {
    case 'cgpt-review':
      return `<div class="s00-pcg__cgptDigest" data-testid="page-concept-cgpt-digest-card"><div class="s00-pcg__cgptDigestRow"><span class="s00-pcg__cgptDigestLabel">CREATIVE PREMISE</span><p class="s00-pcg__cgptDigestExcerpt">Editorial overview with evidence plates.</p></div></div>`;
    case 'full-brief-drawer':
      return `<div class="s00-pcg__briefInspector"><div class="s00-pcg__briefStatusChips"><span>IDENTITY · PRESENT</span></div><section class="s00-pcg__briefSection"><span class="s00-pcg__briefSectionNum">01</span> PREMISE</section><details class="s00-pcg__briefTechnical"><summary>TECHNICAL DETAILS</summary></details></div>`;
    case 'mobile-concept-review':
      return `<div class="s00-pcg__mobileReview"><article class="s00-pcg__mobileReviewCard"><span>MOBILE CONCEPT A</span><div class="s00-pcg__mobileReviewThumb"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='360'/%3E" alt=""/></div></article></div>`;
    case 'concept-inspect':
      return `<div class="s00-pcg__inspectSheet"><h3>CONCEPT A</h3><dl><dt>PAGE VALIDITY</dt><dd>PASS</dd></dl></div>`;
    case 'experience-expression':
      return `<div class="s00-pcg__experienceTiles"><article class="s00-pcg__experienceTile">DRAWER / SHEET</article></div>`;
    case 'viewport-family':
      return `<div class="s00-pcg__viewportFamilyGrid"><article class="s00-pcg__viewportFamilyCard"><span>MOBILE</span><span>SOURCE AUTHORITY</span></article></div>`;
    case 'page-family-system':
      return `<section data-testid="page-concept-page-family-system-review"><h3>PAGE FAMILY SYSTEM</h3></section>`;
    case 'ready-for-twin':
      return `<div data-testid="page-concept-ready-for-twin"><p>LIVE PAGE WILL NOT BE MODIFIED.</p></div>`;
    case 'twin-review':
      return `<div data-testid="page-concept-twin-review"><h4>AUTHORITY VS TWIN</h4></div>`;
    case 'live-promotion':
      return `<div data-testid="page-concept-live-promotion"><button class="s00-pcg__livePromoteBtn">PROMOTE TWIN TO LIVE</button></div>`;
    default:
      return '';
  }
}

const css = await import('node:fs/promises').then((fs) => fs.readFile(CSS_PATH, 'utf8'));
await mkdir(ART, { recursive: true });
const htmlPath = path.join(ART, 'index.html');
await writeFile(htmlPath, htmlShell(css));

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(`file://${htmlPath}`);
  for (const state of STATES) {
    await page.locator(`#${state}`).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(ART, `${state}-${vp.id}.png`) });
  }
  await page.close();
}
await browser.close();
console.log('Wrote QA stills to', ART);
