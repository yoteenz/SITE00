/**
 * P0.VR.DESIGN.OPUS-AI-CONSOLES1 — records an interaction walkthrough of the three
 * consoles (video), proving the controls work rather than just render.
 *
 *   node scripts/design-bench/ai-consoles/demo.mjs [baseUrl] [outDir] [desktop|mobile]
 */

import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:5174';
const OUT = process.argv[3] ?? '/tmp/ai-console-demo';
const FORM = process.argv[4] ?? 'desktop';
const ROUTE = '/projects/design/ndxbook';
const PROJECT = 'ndxbook';

const viewport = FORM === 'mobile' ? { width: 430, height: 932 } : { width: 1440, height: 900 };
mkdirSync(OUT, { recursive: true });

function swatch(label, bg, fg) {
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="${bg}" width="100%" height="100%"/><text x="50%" y="52%" fill="${fg}" font-family="monospace" font-size="42" text-anchor="middle">${label}</text></svg>`,
    )
  );
}

function readyProductionState() {
  const now = new Date().toISOString();
  return {
    storeVersion: 2,
    projectId: PROJECT,
    pageId: 'design-twin-opus-direct',
    sessionVersion: 7,
    contractFreeze: { designAuthorityVersion: 'design-authority-v1' },
    workflowStage: 'BUILD',
    packageStatus: 'DESIGN_IN_PROGRESS',
    selectedCandidateId: 'v13',
    preferredMobileConceptId: 'qa-concept-a',
    preferredDesktopConceptId: 'qa-concept-c',
    promotedMobileConceptId: 'qa-concept-a',
    promotedDesktopConceptId: 'qa-concept-c',
    mobileAuthority: 'APPROVED',
    desktopAuthority: 'APPROVED',
    mobileVersion: 'v2',
    desktopVersion: 'v2',
    twinImplementationStatus: 'READY_FOR_REVIEW',
    twinPageReviewedAt: now,
    pairReviewOpenedAt: now,
    authorityReviewDecision: 'APPROVE',
    authorityReviewedAt: now,
    pairLockedAt: now,
    authorityLockedBy: 'demo',
    designAuthorityVersion: 'design-authority-v1',
    tabletMode: 'DERIVED',
    tabletDerivedOk: true,
    tabletOverrideReason: null,
    tabletOverrideApprovedAt: null,
    translationApproved: true,
    buildPackage: null,
    history: [],
    spendConfirmations: [],
    updatedAt: now,
  };
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport, recordVideo: { dir: OUT, size: viewport } });
const page = await context.newPage();

await page.route('**/api/site00/design-workspace-production**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, state: readyProductionState(), sessionVersion: 7 }),
  }),
);

const pause = (ms = 700) => page.waitForTimeout(ms);

await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.tod-root');
await pause(1200);

await page.evaluate(
  ({ project, current, hero, grid, texture }) => {
    const prefix = `site00:design-page-authority-workflow:v1:${project}::`;
    const existing = Object.keys(localStorage).find((key) => key.startsWith(prefix));
    const pageId = existing ? existing.slice(prefix.length) : `${project}:overview`;
    const now = new Date().toISOString();
    const earlier = new Date(Date.now() - 3600_000).toISOString();

    const authority = (vp, image) => ({
      authorityId: `${pageId}:${vp.toLowerCase()}-authority`,
      projectId: project,
      pageId,
      viewport: vp,
      activeVersionId: `${vp.toLowerCase()}-auth-v1`,
      chatThreadId: `cgpt-${pageId}-${vp}`,
      updatedAt: now,
      messages: [
        {
          id: `${vp}-m1`,
          role: 'founder',
          text: 'Create a modern, editorial mobile layout inspired by this reference. Keep the tone bold and minimal.',
          at: earlier,
        },
        {
          id: `${vp}-m2`,
          role: 'cgpt',
          text: 'Here is a direction based on your reference. Clean typography, strong contrast, editorial framing.',
          at: now,
        },
      ],
      versions: [
        {
          versionId: `${vp.toLowerCase()}-auth-v1`,
          label: 'v1',
          imageUrl: image,
          notes: 'Initial authority reference (founder + CGPT collaboration).',
          createdAt: earlier,
          status: 'ACTIVE',
        },
      ],
    });

    localStorage.setItem(
      `site00:design-page-authority-workflow:v1:${project}::${pageId}`,
      JSON.stringify({
        mobileAuthority: authority('MOBILE', current),
        desktopAuthority: authority('DESKTOP', grid),
        preferred: { mobileConceptId: 'qa-concept-a', desktopConceptId: 'qa-concept-c' },
        promoted: {
          mobileConceptId: 'qa-concept-a',
          mobilePromotedAt: now,
          desktopConceptId: 'qa-concept-c',
          desktopPromotedAt: now,
        },
        pairReviewOpenedAt: now,
        twinReviewedAt: now,
        pairLockedAt: now,
        twinImplementationStatus: 'READY_FOR_REVIEW',
        composerHandoffPackage: { packageId: 'pkg-demo' },
        grokOptOut: false,
        twinRouteVerifiedAt: now,
        history: [],
      }),
    );

    for (const vp of ['MOBILE', 'TABLET', 'DESKTOP']) {
      localStorage.setItem(
        `site00:design-page-capture:v1:${project}:${pageId}:${vp}`,
        JSON.stringify({
          latest: {
            captureId: `cap-${vp}`,
            projectId: project,
            pageId,
            screenId: 'overview',
            viewport: vp,
            route: `/projects/${project}`,
            timestamp: now,
            buildVersion: 'demo',
            artifactPath: current,
            createdBy: 'demo',
            source: 'LOCAL_FALLBACK',
          },
          history: [],
        }),
      );
    }

    const asset = (id, slot, preview, status) => ({
      assetId: id,
      projectId: project,
      pageId,
      slot,
      format: 'PNG',
      width: 1440,
      height: 3200,
      previewDataUrl: preview,
      status,
      origin: 'GROK',
      runId: 'demo-run',
      createdAt: now,
    });
    localStorage.setItem(
      'site00:design-grok-staged:v1',
      JSON.stringify([
        asset('demo-1', 'page-hero', hero, 'STAGED'),
        asset('demo-2', 'culture-grid', grid, 'STAGED'),
        asset('demo-3', 'pattern-texture', texture, 'STAGED'),
        asset('demo-4', 'icon-system', grid, 'STAGED'),
        asset('demo-5', 'layout-plate', texture, 'APPROVED'),
      ]),
    );
  },
  {
    project: PROJECT,
    current: swatch('CURRENT', '#161616', '#cdee30'),
    hero: swatch('HERO', '#101010', '#cdee30'),
    grid: swatch('GRID', '#2b2b2b', '#fdfdfd'),
    texture: swatch('TEXTURE', '#454545', '#cdee30'),
  },
);

await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('.tod-root');
await pause(1200);

/* ---------------------------------------------------------------- OPUS --- */
await page.click('[data-interaction-id="view-row-opus"]');
await page.waitForSelector('.s00-aic--opus');
await pause(900);
await page.getByRole('radio', { name: 'FIX VISUAL' }).click();
await pause(500);
await page.getByRole('radio', { name: 'FORENSIC' }).click();
await pause(500);
await page.getByRole('radio', { name: 'DESIGN', exact: true }).click();
await pause(400);
await page
  .locator('textarea[aria-label="Change request"]')
  .fill('Tighten the hero band: reduce the display type to two lines and align the meta column to the grid.');
await pause(600);
await page.getByTitle(/Append the compiled page context/).click();
await pause(800);
await page.getByRole('button', { name: 'ADD REFERENCE' }).click();
await pause(800);
await page.locator('.s00-aic__thumb').first().click();
await pause(700);
await page.getByRole('tab', { name: 'CONTEXT' }).click();
await pause(900);
await page.getByRole('tab', { name: 'DESIGN' }).click();
await pause(600);
await page.keyboard.press('Escape');
await pause(700);

/* ---------------------------------------------------------------- GROK --- */
await page.click('[data-interaction-id="view-row-grok"]');
await page.waitForSelector('.s00-aic--grok');
await pause(1000);
await page.locator('.s00-aic--grok .s00-aic__body').evaluate((node) => node.scrollTo({ top: 420, behavior: 'smooth' }));
await pause(900);
await page.locator('.s00-aic__tile').nth(1).click();
await pause(700);
await page.locator('.s00-aic--grok .s00-aic__body').evaluate((node) => node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' }));
await pause(900);
await page.getByRole('button', { name: '⌕ INSPECT' }).first().click();
await pause(900);
await page.getByRole('button', { name: '⟳ REGENERATE' }).first().click();
await pause(600);
await page.locator('textarea[aria-label="Improvement request"]').fill('Higher contrast, tighter crop on the subject.');
await pause(600);
await page.getByRole('button', { name: 'CONFIRM REGENERATE (FIXTURE)' }).click();
await pause(1200);
await page.getByRole('tab', { name: 'LIBRARY' }).click();
await pause(1000);
await page.keyboard.press('Escape');
await pause(700);

/* ----------------------------------------------- VIEWPORT AUTHORITY ------ */
await page.getByRole('button', { name: 'Open mobile authority editor' }).click();
await page.waitForSelector('.s00-aic--authority', { timeout: 10000 });
await pause(1000);
await page.getByRole('tab', { name: 'DESKTOP AUTHORITY' }).click();
await pause(900);
await page.getByRole('tab', { name: 'MOBILE AUTHORITY' }).click();
await pause(700);
await page.locator('.s00-aic--authority .s00-aic__body').evaluate((node) => node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' }));
await pause(900);
await page.locator('input[aria-label="Message CGPT"]').fill('Push the grid tighter and keep the lime accent for one element only.');
await pause(800);
await page.getByRole('button', { name: 'Send message' }).click();
await pause(1400);
await page.getByRole('button', { name: /VIEW VERSIONS/ }).click();
await pause(1400);

await context.close();
await browser.close();
console.log(`video written to ${OUT}`);
