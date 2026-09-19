/**
 * P0.VR.DESIGN.OPUS-AI-CONSOLES1 — browser QA for the three DESIGN AI consoles.
 *
 * Opens the real workspace against the dev server and captures every state the
 * sprint requires proof of, at both authorities: desktop workbench (1440x980)
 * and mobile sheet (430x932). Fixture state for the ready/populated captures is
 * seeded through the same localStorage contracts the app itself writes, so the
 * console renders from real stored workflow state rather than a stub.
 *
 *   node scripts/design-bench/ai-consoles/qa.mjs [baseUrl] [outDir]
 */

import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:5174';
const OUT = process.argv[3] ?? '/tmp/ai-console-qa';
const ROUTE = '/projects/design/ndxbook';
const PROJECT = 'ndxbook';

const DESKTOP = { width: 1440, height: 980 };
const MOBILE = { width: 430, height: 932 };

mkdirSync(OUT, { recursive: true });

const results = [];

function swatch(label, bg, fg) {
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="${bg}" width="100%" height="100%"/><text x="50%" y="52%" fill="${fg}" font-family="monospace" font-size="42" text-anchor="middle">${label}</text></svg>`,
    )
  );
}

/** A production session with the twin built and the authority pair locked. */
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
    authorityLockedBy: 'qa',
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

async function openWorkspace(page) {
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tod-root', { timeout: 30000 });
  await page.waitForTimeout(1200);
}

async function shot(page, name) {
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file });
  results.push(name);
  console.log('captured', file);
}

async function closeConsole(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
}

async function openOpus(page) {
  await page.click('[data-interaction-id="view-row-opus"]');
  await page.waitForSelector('.s00-aic--opus', { timeout: 10000 });
  await page.waitForTimeout(600);
}

async function openGrok(page) {
  await page.click('[data-interaction-id="view-row-grok"]');
  await page.waitForSelector('.s00-aic--grok', { timeout: 10000 });
  await page.waitForTimeout(600);
}

async function openAuthority(page) {
  await page.getByRole('button', { name: 'Open mobile authority editor' }).click();
  await page.waitForSelector('.s00-aic--authority', { timeout: 10000 });
  await page.waitForTimeout(600);
}

/** Seeds an ELIGIBLE Grok state, staged assets and a populated authority thread. */
async function seedReadyState(page) {
  await page.evaluate(
    ({ project, mobileSwatch, conceptSwatch, assetA, assetB, assetC }) => {
      // The registry page id carries the route suffix; read it back from the
      // key the workspace itself wrote rather than guessing it.
      const prefix = `site00:design-page-authority-workflow:v1:${project}::`;
      const existing = Object.keys(localStorage).find((key) => key.startsWith(prefix));
      const pageId = existing ? existing.slice(prefix.length) : `${project}:overview`;
      const now = new Date().toISOString();
      const earlier = new Date(Date.now() - 3600_000).toISOString();

      const authority = (viewport, image) => ({
        authorityId: `${pageId}:${viewport.toLowerCase()}-authority`,
        projectId: project,
        pageId,
        viewport,
        activeVersionId: `${viewport.toLowerCase()}-auth-v2`,
        chatThreadId: `cgpt-${pageId}-${viewport}`,
        updatedAt: now,
        messages: [
          {
            id: `${viewport}-m1`,
            role: 'founder',
            text: 'Create a modern, editorial mobile layout inspired by this reference. Keep the tone bold and minimal.',
            at: earlier,
          },
          {
            id: `${viewport}-m2`,
            role: 'cgpt',
            text: 'Here is a direction based on your reference. Clean typography, strong contrast, and editorial framing.',
            at: now,
          },
        ],
        versions: [
          {
            versionId: `${viewport.toLowerCase()}-auth-v1`,
            label: 'v1',
            imageUrl: image,
            notes: 'Initial authority reference (founder + CGPT collaboration).',
            createdAt: earlier,
            status: 'SUPERSEDED',
          },
          {
            versionId: `${viewport.toLowerCase()}-auth-v2`,
            label: 'v2',
            imageUrl: image,
            notes: 'Editorial framing, bold display type, high contrast plates.',
            createdAt: now,
            status: 'ACTIVE',
          },
        ],
      });

      const workflow = {
        mobileAuthority: authority('MOBILE', mobileSwatch),
        desktopAuthority: authority('DESKTOP', conceptSwatch),
        preferred: { mobileConceptId: 'concept-a', desktopConceptId: 'concept-c' },
        promoted: {
          mobileConceptId: 'concept-a',
          mobilePromotedAt: now,
          desktopConceptId: 'concept-c',
          desktopPromotedAt: now,
        },
        pairReviewOpenedAt: now,
        twinReviewedAt: now,
        pairLockedAt: now,
        twinImplementationStatus: 'READY_FOR_REVIEW',
        composerHandoffPackage: {
          packageId: 'pkg-qa-1',
          projectId: project,
          pageId,
          mobilePromotedDesignId: 'concept-a',
          desktopPromotedDesignId: 'concept-c',
          mobileAuthorityReferenceId: `${pageId}:mobile-authority`,
          desktopAuthorityReferenceId: `${pageId}:desktop-authority`,
          tabletPolicy: 'DERIVED',
          interactionContractVersion: 'v1',
          assetManifestVersion: 'v1',
          pageContextVersion: 'v1',
          references: [],
          handoffTimestamp: now,
          founderApproval: true,
        },
        grokOptOut: false,
        twinRouteVerifiedAt: now,
        history: [],
      };
      localStorage.setItem(
        `site00:design-page-authority-workflow:v1:${project}::${pageId}`,
        JSON.stringify(workflow),
      );

      for (const viewport of ['MOBILE', 'TABLET', 'DESKTOP']) {
        localStorage.setItem(
          `site00:design-page-capture:v1:${project}:${pageId}:${viewport}`,
          JSON.stringify({
            latest: {
              captureId: `cap-${viewport}`,
              projectId: project,
              pageId,
              screenId: 'overview',
              viewport,
              route: `/projects/${project}`,
              timestamp: now,
              buildVersion: 'qa',
              artifactPath: mobileSwatch,
              createdBy: 'qa',
              source: 'LOCAL_FALLBACK',
            },
            history: [],
          }),
        );
      }

      // The twin gates read the production store, not the page workflow.
      const cacheKey = `site00:design-workspace-production:cache:v2:${project}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) ?? 'null');
      const baseState = cached?.state ?? JSON.parse(localStorage.getItem(`site00:design-workspace-production:v1:${project}`) ?? '{}');
      const productionState = {
        ...baseState,
        projectId: project,
        promotedMobileConceptId: 'qa-concept-a',
        promotedDesktopConceptId: 'qa-concept-c',
        preferredMobileConceptId: 'qa-concept-a',
        preferredDesktopConceptId: 'qa-concept-c',
        pairReviewOpenedAt: now,
        pairLockedAt: now,
        twinImplementationStatus: 'READY_FOR_REVIEW',
        twinPageReviewedAt: now,
        updatedAt: now,
      };
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          cacheVersion: 2,
          serverSessionVersion: cached?.serverSessionVersion ?? 1,
          cachedAt: now,
          state: productionState,
          role: 'SERVER_CACHE',
        }),
      );
      localStorage.setItem(`site00:design-workspace-production:v1:${project}`, JSON.stringify(productionState));

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
        runId: 'qa-run',
        createdAt: now,
      });
      localStorage.setItem(
        'site00:design-grok-staged:v1',
        JSON.stringify([
          asset('grok-qa-1', 'page-hero', assetA, 'STAGED'),
          asset('grok-qa-2', 'culture-grid', assetB, 'STAGED'),
          asset('grok-qa-3', 'pattern-texture', assetC, 'STAGED'),
          asset('grok-qa-4', 'icon-system', assetB, 'STAGED'),
          asset('grok-qa-5', 'layout-plate', assetC, 'APPROVED'),
        ]),
      );
    },
    {
      project: PROJECT,
      mobileSwatch: swatch('CURRENT', '#161616', '#cdee30'),
      conceptSwatch: swatch('CONCEPT', '#1d1d1d', '#fdfdfd'),
      assetA: swatch('HERO', '#101010', '#cdee30'),
      assetB: swatch('GRID', '#2b2b2b', '#fdfdfd'),
      assetC: swatch('TEXTURE', '#454545', '#cdee30'),
    },
  );
}

const browser = await chromium.launch();

for (const [label, viewportSize] of [
  ['desktop', DESKTOP],
  ['mobile', MOBILE],
]) {
  const context = await browser.newContext({ viewport: viewportSize, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('pageerror', (error) => console.log(`[${label}] pageerror`, error.message));

  // --- blocked / empty states, as a founder first meets them ---------------
  await openWorkspace(page);
  await openOpus(page);
  await shot(page, `opus-${label}`);
  await page.click('[data-interaction-id="opus-edit-scope"]');
  await page.waitForTimeout(300);
  await shot(page, `opus-readonly-scope-${label}`);
  await closeConsole(page);

  await openGrok(page);
  await shot(page, `grok-blocked-${label}`);
  await page.getByRole('button', { name: 'VIEW REQUIREMENTS' }).click();
  await page.waitForTimeout(300);
  await shot(page, `grok-requirements-${label}`);
  await closeConsole(page);

  await openAuthority(page);
  await shot(page, `authority-empty-${label}`);
  await closeConsole(page);

  // --- ready / populated states -------------------------------------------
  // The twin gates read the production session, which lives on the API rather
  // than in the browser. The dev VM has no runtime behind /api, so the session
  // is stubbed at the network boundary — the app's own hydration path, state
  // shape and gating all run unmodified.
  await page.route('**/api/site00/design-workspace-production**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, state: readyProductionState(), sessionVersion: 7 }),
    });
  });
  await seedReadyState(page);
  await openWorkspace(page);

  await openGrok(page);
  await shot(page, `grok-ready-${label}`);
  await page.locator('.s00-aic__tile').first().click();
  await page.waitForTimeout(400);
  await page.locator('.s00-aic--grok .s00-aic__body').evaluate((node) => node.scrollTo(0, node.scrollHeight));
  await page.waitForTimeout(300);
  await shot(page, `grok-selected-asset-${label}`);
  await closeConsole(page);

  await openAuthority(page);
  await shot(page, `authority-populated-${label}`);
  await page.locator('.s00-aic--authority .s00-aic__body').evaluate((node) => node.scrollTo(0, node.scrollHeight));
  await page.waitForTimeout(300);
  await shot(page, `authority-thread-${label}`);
  await closeConsole(page);

  await openOpus(page);
  await page.locator('.s00-aic--opus .s00-aic__body').evaluate((node) => node.scrollTo(0, node.scrollHeight));
  await page.waitForTimeout(300);
  await shot(page, `opus-composer-${label}`);
  await closeConsole(page);

  await context.close();
}

await browser.close();
console.log(`\n${results.length} captures in ${OUT}`);
