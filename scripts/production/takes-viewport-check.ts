/**
 * EXPRESSION → TAKES responsive check (§24–§25) against a running Vite dev server.
 *
 * The spine API is served in-process: Playwright routes every `/api/site00/production-spine` request to the real
 * handler over a TEST_FIXTURE store in a temp directory (one captured take from the fake provider). Clicking a
 * decision in the page writes genuine records to that store, which the script reads back from disk.
 *
 *   npx vite --port 5191 --host 127.0.0.1 &   then   npx tsx scripts/production/takes-viewport-check.ts [outDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from 'playwright';
import { createProductionSpineHandler, type SpineContext } from '../../api/site00/production-spine.js';
import { FOUNDER_ACTOR } from '../../shared/site00-fiction-production/approvals.js';
import { authorizeStep, decideElement } from '../../shared/site00-fiction-production/directorial/review.js';
import { repoPath } from '../../shared/site00-fiction-production/paths.js';
import { loadSceneReviewState } from '../../shared/site00-fiction-production/scenes/index.js';
import { MediaSigner } from '../../shared/site00-production-spine/media.js';
import { FfmpegFrameExtractor, FfprobeMediaProbe } from '../../shared/site00-production-spine/node/ffmpeg.js';
import { jsonFileStore } from '../../shared/site00-production-spine/node/jsonStore.js';
import { LocalPrivateMediaStore } from '../../shared/site00-production-spine/node/localMedia.js';
import { spineProject } from '../../shared/site00-production-spine/projects/index.js';
import { buildSh01Records, EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR, SH01, sceneGateFrom } from '../../shared/site00-production-spine/projects/theExchange.js';
import { FakeProviderTransport, OpenArtAgentSessionTransport } from '../../shared/site00-production-spine/providers.js';
import { ProductionRunner } from '../../shared/site00-production-spine/runner.js';
import { TEST_FIXTURE, type Actor, type AnyRecord } from '../../shared/site00-production-spine/types.js';
import { callHandler } from './sh01DryRun.js';
import { makeSpineFixtureMedia, steppingClock, tempDir } from './spineFixtures.js';

const root = process.cwd();
const BASE = process.env.TAKES_CHECK_BASE_URL ?? 'http://127.0.0.1:5191';
const URL_PATH = `/production/${EXCHANGE_PROJECT_ID}/expression/performance/takes`;
const outDir = path.resolve(process.argv[2] ?? tempDir('site00-takes-viewports-'));
fs.mkdirSync(outDir, { recursive: true });
const FOUNDER: Actor = { id: 'test:founder', role: 'FOUNDER' };
const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844, touch: true },
  { name: 'tablet-834', width: 834, height: 1194, touch: true },
  { name: 'desktop-1440', width: 1440, height: 900, touch: false },
  { name: 'ultrawide-2560', width: 2560, height: 1440, touch: false },
] as const;

async function fixtureContext(workDir: string): Promise<SpineContext> {
  const project = spineProject(EXCHANGE_PROJECT_ID)!;
  const media = makeSpineFixtureMedia(workDir);
  const store = jsonFileStore(path.join(workDir, 'records'), { projectId: EXCHANGE_PROJECT_ID, live: false });
  const testMedia = new LocalPrivateMediaStore(path.join(workDir, 'media'), { repoRoot: root, live: false, signer: SIGNER });
  const fake = new FakeProviderTransport('OpenArt', { bytes: media.video, mimeType: 'video/mp4' });
  let review = loadSceneReviewState(SH01.releaseId, root);
  const at = '2026-10-25T13:00:00Z';
  review = authorizeStep(authorizeStep(review, 'SCREENPLAY', FOUNDER_ACTOR, at, 'TEST'), 'DIRECTION', FOUNDER_ACTOR, at, 'TEST');
  for (const e of review.elements) if (e.state !== 'APPROVED') review = decideElement(review, e.elementId, 'APPROVED', FOUNDER_ACTOR, at, 'TEST');
  review = authorizeStep(authorizeStep(authorizeStep(review, 'KEYFRAMES', FOUNDER_ACTOR, at, 'TEST'), 'GENERATION_BUDGET', FOUNDER_ACTOR, at, 'TEST'), 'PRODUCTION', FOUNDER_ACTOR, at, 'TEST', [SH01.shotId]);
  const clock = steppingClock('2026-10-25T14:00:00Z');
  const runner = new ProductionRunner({ store, media: testMedia, transports: { 'OA-NBP-I2I-2K-REF': fake, 'OA-K3O-I2V-PRO': fake }, sceneGate: sceneGateFrom(review), probe: new FfprobeMediaProbe(), extractor: new FfmpegFrameExtractor(), clock: () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') });
  const { budget, shot, jobs } = buildSh01Records(root);
  const mark = <T extends AnyRecord>(r: T): T => ({ ...r, fixture: TEST_FIXTURE });
  await store.create(mark(budget));
  await store.create(mark({ ...shot, requiredDecisions: shot.requiredDecisions.map((d) => ({ ...d, status: 'ANSWERED' as const })) }));
  for (const j of jobs) await store.create(mark(j));
  const ref = await testMedia.put({ projectId: EXCHANGE_PROJECT_ID, bytes: media.frame, mimeType: 'image/png' });
  const t = clock();
  await store.create({ kind: 'ASSET', id: 'ASSET-TEST-FIXTURE-KF-ENV-CITY-DUSK-A', projectId: EXCHANGE_PROJECT_ID, schemaVersion: 1, revision: 1, createdAt: t, updatedAt: t, createdBy: FOUNDER.id, fixture: TEST_FIXTURE, mediaType: 'IMAGE', mimeType: 'image/png', adapter: testMedia.adapter, storageRef: ref.storageRef, contentSha256: ref.sha256, byteSize: ref.byteSize, verifiedAt: t, lineage: { sourceJobId: null, sourceTakeId: null, derivedFromAssetId: null, providerOperationId: 'NOT_AVAILABLE', providerSourceHost: 'NOT_AVAILABLE' } });
  await runner.authorizeBudget(SH01.budgetId, FOUNDER, { authorizedCredits: 255, decisionRefs: ['FD-S101-11'], note: 'TEST FIXTURE' });
  await runner.approveReference(SH01.shotId, 'KF-ENV-CITY-DUSK-A', 'ASSET-TEST-FIXTURE-KF-ENV-CITY-DUSK-A', FOUNDER, { decisionRefs: ['FD-S101-08'], note: 'TEST FIXTURE' });
  const videoId = `JOB-${SH01.shotId}-VIDEO-01`;
  await runner.requestAuthorization(videoId, FOUNDER);
  await runner.authorizeJob(videoId, FOUNDER, { maxCredits: 175, ttlSec: 900, decisionRefs: ['FD-S101-11'], note: 'TEST FIXTURE' });
  await runner.dispatch(videoId);
  await runner.poll(videoId);
  return { store, media: testMedia, runner, refs: project.refs(root, project.providers(() => ({ execution: 'FAKE_TEST_ONLY', reason: 'test double', transportId: fake.transportId }))) };
}

function liveContext(): SpineContext {
  const project = spineProject(EXCHANGE_PROJECT_ID)!;
  const store = jsonFileStore(repoPath(EXCHANGE_RECORDS_DIR, root), { projectId: EXCHANGE_PROJECT_ID, live: true, readOnly: 'viewport check: read only' });
  const media = new LocalPrivateMediaStore(tempDir('site00-takes-live-'), { repoRoot: root, live: true, signer: SIGNER });
  const openart = new OpenArtAgentSessionTransport({});
  const runner = new ProductionRunner({ store, media, transports: Object.fromEntries(project.routeIds.map((r) => [r, openart])), sceneGate: project.sceneGate(root), probe: new FfprobeMediaProbe(), clock: () => new Date().toISOString() });
  return { store, media, runner, refs: project.refs(root, project.providers(() => ({ execution: 'DISABLED', reason: openart.status().reason, transportId: openart.transportId }))) };
}

const SIGNER = new MediaSigner(null);

async function routeSpine(page: Page, ctx: SpineContext) {
  // tsx keeps function names with a __name helper that page.evaluate callbacks would otherwise lack.
  await page.addInitScript('window.__name = (f) => f;');
  const handler = createProductionSpineHandler({ authenticate: async () => ({ ok: true, actor: FOUNDER }), open: async (id) => (id === EXCHANGE_PROJECT_ID ? ctx : null), signer: SIGNER, now: () => new Date().toISOString() });
  await page.route('**/api/site00/production-spine**', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const r = await callHandler(handler, { method: req.method(), query: Object.fromEntries(u.searchParams), body: req.postData() ? JSON.parse(req.postData()!) : {}, headers: {} });
    await route.fulfill({ status: r.status, headers: { 'content-type': r.headers['content-type'] ?? 'application/json' }, body: r.bytes ?? JSON.stringify(r.json) });
  });
}

/** Geometry the responsive rules require, measured in the page. */
async function measure(page: Page) {
  return page.evaluate(() => {
    const doc = document.scrollingElement!;
    const frame = document.querySelector('[data-testid="production-authority-frame"]')!;
    const scroller = document.querySelector('[data-testid="production-authority-scroll"]') as HTMLElement;
    const nav = frame.lastElementChild!.getBoundingClientRect();
    const box = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom, right: r.right };
    };
    const inView = (b: ReturnType<typeof box>) => !!b && b.w > 0 && b.h > 0 && b.x >= 0 && b.y >= 0 && b.right <= innerWidth + 0.5 && b.bottom <= innerHeight + 0.5;
    const buttons = [...document.querySelectorAll('[data-testid="spine-take-actions"] button, [data-testid="spine-generate-button"]')].map((b) => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      return { text: b.textContent?.trim(), w: r.width, h: r.height, radius: parseFloat(cs.borderTopLeftRadius), inView: r.width > 0 && r.y >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5, disabled: (b as HTMLButtonElement).disabled, reason: b.getAttribute('data-reason') };
    });
    const video = box('[data-testid="spine-take-video"]');
    const stage = box('[data-testid="spine-take"]');
    const shotText = document.querySelector('[data-testid="spine-shot-row"] b');
    return {
      viewport: { w: innerWidth, h: innerHeight },
      pageScroll: { scrollHeight: doc.scrollHeight, scrollWidth: doc.scrollWidth, fitsHeight: doc.scrollHeight <= innerHeight + 1, fitsWidth: doc.scrollWidth <= innerWidth + 1 },
      frameScroll: { scrollHeight: scroller.scrollHeight, clientHeight: scroller.clientHeight, fits: scroller.scrollHeight <= scroller.clientHeight + 1 },
      navVisible: nav.bottom <= innerHeight + 0.5 && nav.height > 0,
      video: video && stage ? { ...video, insidePanel: video.x >= stage.x - 0.5 && video.right <= stage.right + 0.5 && video.y >= stage.y - 0.5 && video.bottom <= stage.bottom + 0.5, inView: inView(video) } : null,
      buttons,
      roundButtons: buttons.filter((b) => b.radius >= Math.min(b.w, b.h) / 2 - 0.5).length,
      shotFontPx: shotText ? parseFloat(getComputedStyle(shotText).fontSize) : null,
      shotRowInView: inView(box('[data-testid="spine-shot-row"]')),
      h264: document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"') || 'NO',
      fixtureBanner: inView(box('[data-testid="spine-fixture-banner"]')),
      panels: ['spine-shots', 'spine-take', 'spine-requirements', 'spine-history'].map((id) => ({ id, inView: inView(box(`[data-testid="${id}"]`)) })),
    };
  });
}

const takeOnDisk = (dir: string) => JSON.parse(fs.readFileSync(path.join(dir, 'records', 'TAKE', `TAKE-${SH01.shotId}-01.json`), 'utf8')) as { decision: string; selectedForEdit: boolean; approvalIds: string[] };

async function main() {
  const workDir = tempDir('site00-takes-fixture-');
  const ctx = await fixtureContext(workDir);
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium' });
  const results: Record<string, unknown> = {};
  const interactions: string[] = [];
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch, isMobile: vp.name === 'mobile-390', deviceScaleFactor: 1 });
      const page = await context.newPage();
      await routeSpine(page, ctx);
      await page.goto(`${BASE}${URL_PATH}`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('spine-take-stage').waitFor({ timeout: 60_000 });
      await page.waitForTimeout(400);
      const m = await measure(page);
      await page.screenshot({ path: path.join(outDir, `takes-fixture-${vp.name}.png`) });
      if (vp.name === 'mobile-390') {
        await page.getByTestId('spine-take-hold').tap();
        await page.getByText('HELD', { exact: true }).first().waitFor();
        interactions.push(`390 touch: HOLD → disk ${takeOnDisk(workDir).decision}`);
      }
      if (vp.name === 'desktop-1440') {
        await page.getByTestId('spine-take-approve').focus();
        await page.keyboard.press('Enter');
        await page.getByText('APPROVED', { exact: true }).first().waitFor();
        interactions.push(`1440 keyboard: APPROVE → disk ${takeOnDisk(workDir).decision}`);
      }
      if (vp.name === 'ultrawide-2560') {
        await page.getByTestId('spine-take-select-for-edit').click();
        await page.getByText('SELECTED FOR EDIT', { exact: true }).first().waitFor();
        const t = takeOnDisk(workDir);
        interactions.push(`2560 click: SELECT FOR EDIT → disk selectedForEdit=${t.selectedForEdit}, ${t.approvalIds.length} approvals`);
        await page.screenshot({ path: path.join(outDir, `takes-fixture-${vp.name}-selected.png`) });
      }
      results[vp.name] = m;
      await context.close();
    }
    // The live catalogue: no takes yet, generate disabled with its reasons.
    for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch });
      const page = await context.newPage();
      await routeSpine(page, liveContext());
      await page.goto(`${BASE}${URL_PATH}`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('spine-no-takes').waitFor({ timeout: 60_000 });
      await page.waitForTimeout(300);
      results[`live-${vp.name}`] = await measure(page);
      await page.screenshot({ path: path.join(outDir, `takes-live-${vp.name}.png`) });
      await context.close();
    }
  } finally {
    await browser.close();
  }
  const records = takeOnDisk(workDir);
  const report = { url: URL_PATH, outDir, interactions, finalTakeOnDisk: records, results };
  fs.writeFileSync(path.join(outDir, 'takes-viewport-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  const failures: string[] = [];
  for (const [name, r] of Object.entries(results) as Array<[string, Awaited<ReturnType<typeof measure>>]>) {
    if (!r.pageScroll.fitsHeight || !r.pageScroll.fitsWidth) failures.push(`${name}: page scrolls (${r.pageScroll.scrollWidth}×${r.pageScroll.scrollHeight})`);
    if (!r.frameScroll.fits) failures.push(`${name}: frame scrolls`);
    if (!r.navVisible) failures.push(`${name}: bottom nav hidden`);
    if (r.roundButtons) failures.push(`${name}: ${r.roundButtons} circular buttons`);
    if (r.buttons.some((b) => !b.inView)) failures.push(`${name}: a decision control is off screen`);
    if (!name.startsWith('live') && (!r.video?.insidePanel || !r.video.inView)) failures.push(`${name}: video preview does not fit its panel`);
    if (!name.startsWith('live') && !r.fixtureBanner) failures.push(`${name}: test-fixture label not visible`);
    if (!r.shotRowInView) failures.push(`${name}: shot row not visible`);
    if (r.panels.some((p) => !p.inView)) failures.push(`${name}: panel off screen: ${r.panels.filter((p) => !p.inView).map((p) => p.id).join(', ')}`);
  }
  if (!(records.decision === 'APPROVED' && records.selectedForEdit)) failures.push('decisions did not persist to the store');
  console.log(JSON.stringify({ interactions, failures, outDir }, null, 2));
  fs.rmSync(workDir, { recursive: true, force: true });
  if (failures.length) process.exit(1);
}

await main();
