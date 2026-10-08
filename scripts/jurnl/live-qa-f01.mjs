/**
 * JURNL F01 — LIVE BROWSER QA (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 *
 * Drives the REAL SITE 00 Design workspace (/production/:slug/design) and the REAL project runtime route
 * (/production/jurnl/runtime/*) in Chromium: project switching, design modes, inspector, viewport presets +
 * overlays, and every F01 interaction family (drawers, sheets, modals, inline, toasts, loading, focus, password,
 * handoff boundaries, switch account, sign-out, recovery, F01 → F02). Writes JPEG proofs + LIVE_QA_REPORT.json.
 *
 * Usage: node scripts/jurnl/live-qa-f01.mjs [baseUrl=http://127.0.0.1:5174] [outDir=artifacts/jurnl-f01-live-qa]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { qaChromiumPath } from './qa-env.mjs';

const [BASE = 'http://127.0.0.1:5174', OUT = 'artifacts/jurnl-f01-live-qa'] = process.argv.slice(2);
const RT = `${BASE}/production/jurnl/runtime`;
mkdirSync(join(OUT, 'flows'), { recursive: true });
mkdirSync(join(OUT, 'workspace'), { recursive: true });

const checks = [];
const pageErrors = [];
let shotN = 0;
function check(group, name, pass, detail = '') {
  checks.push({ group, name, pass: !!pass, detail: String(detail ?? '') });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${group}] ${name}${detail ? ` — ${detail}` : ''}`);
}
async function shot(page, dir, name) {
  const file = join(OUT, dir, `${String(++shotN).padStart(3, '0')}-${name}.jpg`);
  // Settle finite enter animations (drawer rise / modal pop / toast) so proofs never capture a half-faded surface.
  await page
    .evaluate(() =>
      Promise.race([
        Promise.all(
          document
            .getAnimations({ subtree: true })
            .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => null)),
        ),
        new Promise((r) => setTimeout(r, 1500)),
      ]),
    )
    .catch(() => null);
  await page.screenshot({ path: file, type: 'jpeg', quality: 72 });
  return file;
}
const sel = (t) => `[data-jrn-trigger="${t}"]`;
const wait = (p, ms = 450) => p.waitForTimeout(ms);

const browser = await chromium.launch({ headless: true, executablePath: qaChromiumPath() });

/* ───────────────────────── 1. DESIGN WORKSPACE + PROJECT SWITCHING ───────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => pageErrors.push(`workspace: ${e}`));
  await page.goto(`${BASE}/production/ndxbook/design?mode=brand`);
  await page.waitForSelector('[data-testid="design-chamber-screen"]', { timeout: 30000 });
  await wait(page, 2500);
  check('SELECTOR', 'NDXBOOK workspace loads with host chrome', await page.locator('[data-testid="production-chrome-project"][data-project="ndxbook"]').count());
  await shot(page, 'workspace', 'ndxbook-brand-before-switch');
  await page.click('[data-testid="production-chrome-project"]');
  await wait(page);
  check('SELECTOR', 'PROJECT switcher opens and lists JURNL', await page.locator('[data-testid="production-project-menu-item"]', { hasText: 'JURNL' }).count());
  const menuOverlaps = await page.locator('[data-testid="production-project-menu-item"]').evaluateAll((items) =>
    items.filter((a) => {
      const thumb = a.querySelector('.pxm__thumb')?.getBoundingClientRect();
      const label = a.querySelector(':scope > span:not(.pxm__thumb)')?.getBoundingClientRect();
      return !thumb || !label || label.left < thumb.right || label.height > thumb.height * 2.2;
    }).length,
  );
  check('SELECTOR', 'switcher rows: thumb + label laid out side by side (no overlap / no wrap)', menuOverlaps === 0, `overlapping rows: ${menuOverlaps}`);
  await shot(page, 'workspace', 'project-switcher-open');
  const hostHeaderBefore = await page.locator('[data-testid="production-workspace-header"]').evaluate((el) => ({ cls: el.className, h: el.getBoundingClientRect().height }));
  await page.locator('[data-testid="production-project-menu-item"]', { hasText: 'JURNL' }).click();
  await page.waitForURL(/\/production\/jurnl\/design\?mode=brand/);
  await page.waitForSelector('[data-project="jurnl"]');
  await wait(page, 1500);
  const hostHeaderAfter = await page.locator('[data-testid="production-workspace-header"]').evaluate((el) => ({ cls: el.className, h: el.getBoundingClientRect().height }));
  check('SELECTOR', 'switch lands on /production/jurnl/design?mode=brand', page.url().endsWith('/production/jurnl/design?mode=brand'), page.url());
  check('CONTEXT', 'JURNL context loaded (chamber data-project=jurnl, PERSONAL)', await page.locator('[data-project="jurnl"][data-project-type="PERSONAL"]').count());
  check('CONTEXT', 'brand changed: JURNL palette + tagline visible, no NDX copy', (await page.locator('[data-testid="project-palette"] i').count()) === 9 && !(await page.content()).includes('NDX GROTESK'));
  check('FIREWALL', 'host chrome unchanged across switch (same header class + height)', hostHeaderBefore.cls === hostHeaderAfter.cls && Math.abs(hostHeaderBefore.h - hostHeaderAfter.h) < 1, JSON.stringify([hostHeaderBefore, hostHeaderAfter]));
  check('FIREWALL', 'host chrome shows JURNL as the selected project', await page.locator('[data-testid="production-chrome-project"][data-project="jurnl"]').count());
  await shot(page, 'workspace', 'jurnl-brand-after-switch');
  for (const mode of ['experience', 'surfaces', 'compiler', 'assets']) {
    await page.click(`[data-testid="design-mode-${mode}"]`);
    await page.waitForSelector(`[data-testid="design-chamber-screen"][data-mode="${mode}"][data-project="jurnl"]`);
    await wait(page, 900);
    check('MODES', `${mode.toUpperCase()} reacts to JURNL`, await page.locator(`[data-mode="${mode}"][data-project="jurnl"]`).count());
    await shot(page, 'workspace', `jurnl-${mode}`);
  }
  for (const tab of ['screens', 'interactions', 'gate', 'claims', 'assets', 'budget']) {
    await page.goto(`${BASE}/production/jurnl/design?mode=compiler&inspect=${tab}`);
    await page.waitForSelector(`[data-testid="project-inspector"][data-tab="${tab}"]`);
    await wait(page, 700);
    check('INSPECT', `inspector ${tab.toUpperCase()} opens`, true);
    await shot(page, 'workspace', `inspector-${tab}`);
  }
  // viewport presets + overlays
  for (const [preset, w, h] of [['MOBILE', 393, 852], ['TABLET', 834, 1194], ['DESKTOP', 1440, 900]]) {
    await page.goto(`${BASE}/production/jurnl/design?mode=viewport&preset=${preset}&screen=F01.00`);
    const dev = page.locator('[data-testid="design-viewport-device"]');
    await dev.waitFor();
    const frame = page.frameLocator('[data-testid="design-viewport-frame"]');
    await frame.locator('[data-jrn-screen="F01.00"]').waitFor({ timeout: 20000 });
    await wait(page, 1200);
    const dims = await dev.evaluate((el) => [el.getAttribute('data-target-w'), el.getAttribute('data-target-h')]);
    const inner = await frame.locator('.jrn').evaluate((el) => [window.innerWidth, window.innerHeight, el.getBoundingClientRect().width]);
    check('VIEWPORT', `${preset} ${w}×${h} target`, dims[0] === String(w) && dims[1] === String(h), dims.join('×'));
    check('VIEWPORT', `${preset} runtime lays out at real logical width`, inner[0] === w && inner[1] === h, inner.join(','));
    const hScroll = await frame.locator('.jrn').evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    check('VIEWPORT', `${preset} no horizontal overflow inside runtime`, !hScroll);
    await shot(page, 'workspace', `viewport-${preset.toLowerCase()}`);
    if (preset === 'MOBILE') {
      for (const t of ['safe', 'grid', 'bounds']) await page.click(`[data-testid="design-viewport-${t}-toggle"]`);
      await wait(page, 1400);
      check('OVERLAYS', 'SAFE AREA (project insets) visible', await page.locator('[data-testid="design-viewport-safe"]').count());
      check('OVERLAYS', 'GRID shows 4 project columns', (await page.locator('[data-testid="design-viewport-grid"] i').count()) === 4);
      const bc = await page.locator('[data-testid="design-viewport-bounds"]').getAttribute('data-count');
      check('OVERLAYS', 'BOUNDS measured runtime blocks', Number(bc) >= 3, bc);
      await shot(page, 'workspace', 'viewport-mobile-safe-grid-bounds');
      await page.click('[data-testid="design-viewport-reference-toggle"]');
      await wait(page, 1200);
      check('OVERLAYS', 'REFERENCE authority beside the live device', await page.locator('[data-testid="design-viewport-reference"] img').count());
      await shot(page, 'workspace', 'viewport-mobile-reference-compare');
    }
  }
  // scenario + live messages
  await page.goto(`${BASE}/production/jurnl/design?mode=viewport&screen=F01.03`);
  await page.frameLocator('[data-testid="design-viewport-frame"]').locator('[data-jrn-screen="F01.03"]').waitFor();
  await wait(page, 800);
  check('VIEWPORT', 'runtime reports its live screen to the host', (await page.locator('[data-live="screen"] b').textContent())?.includes('F01.03'));
  await page.selectOption('[data-testid="design-viewport-state"]', 'state:locked');
  await page.frameLocator('[data-testid="design-viewport-frame"]').locator('[data-jrn-overlay="locked"]').waitFor();
  check('VIEWPORT', 'STATE selector drives the runtime (LOCKED drawer)', true);
  await shot(page, 'workspace', 'viewport-state-locked');
  // switch back to NDXBOOK: reverse check
  await page.click('[data-testid="production-chrome-project"]');
  await page.locator('[data-testid="production-project-menu-item"]', { hasText: 'NDXBOOK' }).click();
  await page.waitForURL(/\/production\/ndxbook\/design\?mode=viewport$/);
  await wait(page, 2500);
  const ndxIframe = await page.locator('[data-testid="design-viewport-frame"]').getAttribute('src');
  check('SELECTOR', 'switch back to NDXBOOK clears JURNL state (client app iframe, no runtime controls)', !ndxIframe?.includes('/runtime/') && !(await page.locator('[data-testid="design-viewport-grid-toggle"]').count()), ndxIframe);
  await page.click('[data-testid="design-mode-brand"]');
  await wait(page, 1200);
  check('SELECTOR', 'NDXBOOK brand mode restored (NDX config, no JURNL data)', (await page.content()).includes('NDX GROTESK') && !(await page.locator('[data-project="jurnl"]').count()));
  await shot(page, 'workspace', 'ndxbook-brand-after-switch-back');
  await page.close();
  // mobile host
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  m.on('pageerror', (e) => pageErrors.push(`workspace-mobile: ${e}`));
  for (const mode of ['brand', 'viewport']) {
    await m.goto(`${BASE}/production/jurnl/design?mode=${mode}`);
    await m.waitForSelector('[data-testid="design-chamber-screen"]');
    await wait(m, 2500);
    await shot(m, 'workspace', `mobile-host-jurnl-${mode}`);
  }
  check('MODES', 'JURNL workspace renders in the mobile host', true);
  await m.close();
}

/* ───────────────────────── 2. RUNTIME INTERACTIONS (mobile authority 393×852) ───────────────────────── */
const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
page.on('pageerror', (e) => pageErrors.push(`runtime: ${e}`));
const go = async (route, q = '') => {
  await page.goto(`${RT}/${route}${q ? `?${q}` : ''}`);
  await page.waitForSelector('[data-jrn-screen]');
  await wait(page, 600);
};
const screenIs = async (id) => (await page.locator(`[data-jrn-screen="${id}"]`).count()) > 0;

// fresh device
await go('entry', 'reset=1');
check('ROUTING', 'F01.00 WELCOME', await screenIs('F01.00'));
await shot(page, 'flows', 'f0100-welcome');
await page.click(sel('welcome-get-started'));
// ENTRY v2: WELCOME → VALUE PROPOSITION → KEY BENEFITS → GET STARTED → CREATE ACCOUNT.
for (const [trigger, next] of [['value-continue', 'F01.15'], ['benefits-continue', 'F01.16'], ['begin-get-started', 'F01.01']]) {
  await page.waitForSelector(sel(trigger));
  await page.click(sel(trigger));
  await page.waitForSelector(`[data-jrn-screen="${next}"]`);
}
check('ROUTING', 'GET STARTED → VALUE → BENEFITS → BEGIN → F01.01 (route transitions)', true);

// CREATE ACCOUNT
await page.click(sel('create-first-name'));
check('FORM', 'focused input = focus state', (await page.locator('.jrn-e2__field[data-focused="true"], .jrn-field[data-focused="true"]').count()) === 1);
await shot(page, 'flows', 'f0101-focus');
await page.click(sel('create-submit'));
await wait(page);
check('FORM', 'validation summary error panel', await page.locator(sel('create-error-validation')).count());
await shot(page, 'flows', 'f0101-validation');
await page.fill(sel('create-password'), 'jurnl');
await wait(page);
check('PASSWORD', 'requirements expand inline', (await page.locator(`${sel('create-password-requirements')}[data-open="true"]`).count()) === 1);
await page.click(sel('create-password-toggle'));
check('PASSWORD', 'SHOW PASSWORD reveals', (await page.locator(sel('create-password')).getAttribute('type')) === 'text');
await page.click(sel('create-password-toggle'));
check('PASSWORD', 'HIDE PASSWORD masks', (await page.locator(sel('create-password')).getAttribute('type')) === 'password');
await page.fill(sel('create-password'), 'Jurnl-2026!');
await wait(page);
check('PASSWORD', 'all 4 requirements met', (await page.locator('.jrn-req[data-met="true"]').count()) === 4);
await shot(page, 'flows', 'f0101-password-requirements');
await page.click(sel('create-terms-link'));
await page.waitForSelector('[data-jrn-overlay="terms"]');
check('DRAWER', 'TERMS long drawer opens', true);
await page.locator(sel('terms-section')).first().click();
await wait(page);
check('INLINE', 'terms section inline expansion', (await page.locator('[data-jrn-overlay="terms"] .jrn-expand[data-open="true"]').count()) === 1);
await shot(page, 'flows', 'f0101-terms-drawer');
await page.click(sel('terms-accept'));
await wait(page);
check('DRAWER', 'I AGREE closes drawer + ticks agreement', !(await page.locator('[data-jrn-overlay="terms"]').count()) && (await page.locator(`${sel('create-agree')}[aria-checked="true"]`).count()) === 1);
await page.click(sel('create-privacy-link'));
await page.waitForSelector('[data-jrn-overlay="privacy-policy"]');
await page.keyboard.press('Escape');
await wait(page);
check('DRAWER', 'PRIVACY POLICY drawer opens + Escape closes', !(await page.locator('[data-jrn-overlay="privacy-policy"]').count()));
await page.click(sel('create-apple'));
await page.waitForSelector('[data-jrn-overlay="social-apple"]');
await shot(page, 'flows', 'f0101-apple-boundary');
await page.click(sel('social-apple-continue'));
await page.waitForSelector('text=APPLE SIGN IN IS NOT AVAILABLE YET', { timeout: 5000 });
check('HANDOFF', 'social auth boundary → honest provider-not-configured (no fake success)', true);
await shot(page, 'flows', 'f0101-apple-not-configured');
await page.click(sel('social-apple-cancel'));
await page.fill(sel('create-first-name'), 'Ava');
await page.fill(sel('create-last-name'), 'Reyes');
await page.fill(sel('create-email'), 'emma@example.com');
await page.click(sel('create-submit'));
await page.waitForSelector(sel('create-error-email-in-use'), { timeout: 6000 });
check('ERROR', 'EMAIL ALREADY IN USE panel', true);
await shot(page, 'flows', 'f0101-email-in-use');
await page.fill(sel('create-email'), `ava.${Date.now()}@example.com`);
await page.click(sel('create-submit'));
await wait(page, 250);
check('LOADING', 'CREATING ACCOUNT... loading button', (await page.locator(`${sel('create-submit')}[data-loading="true"]`).count()) === 1);
await shot(page, 'flows', 'f0101-loading');
await page.waitForSelector('[data-jrn-screen="F01.02"]', { timeout: 8000 });
check('ROUTING', 'account created → F01.02 EMAIL VERIFICATION', true);

// EMAIL VERIFICATION
check('UPPERCASE', 'entered email shown uppercase', (await page.locator(sel('verify-email-address')).innerText()).includes('@EXAMPLE.COM'));
await page.click(sel('verify-resend'));
await page.waitForSelector('[data-jrn-trigger="toast-verify-resent"]', { timeout: 6000 });
check('TOAST', 'RESEND → success banner', true);
await shot(page, 'flows', 'f0102-resend-toast');
await page.click(sel('verify-change-email'));
await page.waitForSelector('[data-jrn-overlay="change-email"][data-jrn-drawer="short"]');
check('DRAWER', 'CHANGE EMAIL short drawer', true);
await shot(page, 'flows', 'f0102-change-email-drawer');
await page.click(sel('change-email-cancel'));
await page.click(sel('verify-open-mail'));
await page.waitForSelector('[data-jrn-overlay="mail"]');
check('HANDOFF', 'OPEN EMAIL APP → JURNL external handoff card', true);
await shot(page, 'flows', 'f0102-mail-handoff');
await page.click(sel('mail-continue'));
await wait(page);
check('HANDOFF', 'handoff continues and returns to JURNL', !(await page.locator('[data-jrn-overlay="mail"]').count()));
await page.waitForSelector(sel('verify-success-continue'), { timeout: 6000 });
check('FLOW', 'design preview follows the emailed link: verified, CONTINUE onward', true);
await page.goto(`${RT}/entry/verify-email?link=expired`);
await page.waitForSelector(sel('verify-error-expired'), { timeout: 6000 });
check('ERROR', 'expired verification link panel', true);
await shot(page, 'flows', 'f0102-expired');
await page.goto(`${RT}/entry/verify-email?link=valid`);
await page.waitForSelector(sel('verify-success-continue'), { timeout: 6000 });
check('STATE', 'verification success', true);
await shot(page, 'flows', 'f0102-verified');
await page.click(sel('verify-success-continue'));
await page.waitForSelector('[data-jrn-screen="F01.09"]');

// BIOMETRIC
await shot(page, 'flows', 'f0109-biometric');
await page.click(sel('bio-enable'));
await page.waitForSelector('[data-jrn-overlay="faceid-enable"]');
await page.click(sel('faceid-enable-continue'));
await wait(page, 200);
check('HANDOFF', 'native biometric boundary: JURNL waiting hold (no fake OS sheet)', (await page.locator('[data-jrn-overlay="faceid-enable"] [data-waiting="true"]').count()) >= 1);
await shot(page, 'flows', 'f0109-native-handoff-waiting');
await page.waitForSelector('[data-jrn-trigger="toast-biometric-enabled"]', { timeout: 6000 });
check('TOAST', 'FACE ID ENABLED success banner', true);
await shot(page, 'flows', 'f0109-enabled');
await page.click(sel('bio-enabled-continue'));
await page.waitForSelector('[data-jrn-screen="F01.10"]');

// DEVICE TRUST
await page.click(sel('trust-learn'));
await page.waitForSelector('[data-jrn-overlay="device-learn"][data-jrn-drawer="long"]');
check('DRAWER', 'LEARN WHAT THIS MEANS long drawer', true);
await shot(page, 'flows', 'f0110-learn-drawer');
await page.click(sel('device-learn-got-it'));
await page.click(sel('trust-confirm'));
await page.waitForSelector('[data-jrn-screen="F01.11"]');
check('TOAST', 'TRUST THIS DEVICE → toast + F01.11', await page.locator('[data-jrn-trigger="toast-device-trusted"]').count());

// PRIVACY
await shot(page, 'flows', 'f0111-privacy');
for (const row of ['your-data', 'connected-accounts', 'ai-access', 'data-export', 'remove-access']) {
  await page.click(sel(`privacy-row-${row}`));
  await page.waitForSelector(`[data-jrn-overlay="privacy-${row}"]`);
  if (row === 'ai-access') {
    await page.click(sel('privacy-ai-personalizedInsights'));
    check('TOGGLE', 'square-rounded AI toggle switches', (await page.locator(`${sel('privacy-ai-personalizedInsights')}[aria-checked="true"]`).count()) === 1);
    await shot(page, 'flows', 'f0111-ai-access');
    await page.click(sel('privacy-ai-save'));
    await page.waitForSelector('[data-jrn-trigger="toast-ai-saved"]');
    check('TOAST', 'AI preferences saved', true);
    continue;
  }
  if (row === 'data-export') {
    await page.click(sel('privacy-export-request'));
    await page.waitForSelector(sel('privacy-export-requested'));
    check('STATE', 'data export requested (flagged claim C10)', await page.locator('[data-claim="C10"]').count());
    await shot(page, 'flows', 'f0111-export-requested');
  }
  if (row === 'remove-access') {
    await page.click(sel('privacy-delete-account'));
    await page.waitForSelector('[data-jrn-overlay="delete-account"][data-jrn-modal="confirm"]');
    check('MODAL', 'DELETE ACCOUNT confirmation modal', true);
    await shot(page, 'flows', 'f0111-delete-confirm');
    await page.click(sel('delete-account-cancel'));
    continue;
  }
  check('DRAWER', `privacy ${row} drawer`, true);
  await page.keyboard.press('Escape');
  await wait(page, 300);
}
await page.click(sel('privacy-details'));
await page.waitForSelector('[data-jrn-overlay="privacy-details"]');
check('DRAWER', 'VIEW PRIVACY DETAILS drawer shell', true);
await page.keyboard.press('Escape');
await page.click(sel('privacy-continue'));
await page.waitForSelector('[data-jrn-screen="F01.12"]');

// SECURITY
await shot(page, 'flows', 'f0112-security');
for (const row of ['biometric', 'device', 'connected', 'data', 'sessions']) {
  await page.click(sel(`security-row-${row}`));
  await page.waitForSelector(`[data-jrn-overlay="security-${row}"]`);
  if (row === 'biometric') {
    await page.click(sel('security-biometric-touch'));
    check('CHOICE', 'square-rounded FACE ID / TOUCH ID choice', (await page.locator(`${sel('security-biometric-touch')}[aria-checked="true"]`).count()) === 1);
  }
  if (row === 'sessions') {
    await page.waitForSelector(sel('security-session-revoke-preview-laptop'));
    await page.click(sel('security-session-revoke-preview-laptop'));
    await page.waitForSelector('[data-jrn-overlay="revoke-session"]');
    await shot(page, 'flows', 'f0112-revoke-confirm');
    await page.click(sel('revoke-session-confirm'));
    await page.waitForSelector('text=SESSION REVOKED', { timeout: 6000 });
    check('MODAL', 'REVOKE SESSION confirm → revoked', true);
    await shot(page, 'flows', 'f0112-session-revoked');
    await page.click(sel('revoke-session-cancel'));
    continue;
  }
  check('DRAWER', `security ${row} drawer`, true);
  if (row === 'data') await shot(page, 'flows', 'f0112-secure-data-handling');
  await page.keyboard.press('Escape');
  await wait(page, 300);
}
await page.click(sel('security-details'));
await page.waitForSelector('[data-jrn-overlay="security-details"][data-jrn-sheet="full"]');
check('SHEET', 'VIEW SECURITY DETAILS full-screen sheet', true);
await shot(page, 'flows', 'f0112-security-sheet');
await page.click(sel('security-details-close'));
await page.click(sel('security-continue'));
await page.waitForSelector('[data-jrn-screen="F01.13"]');

// COMPLETE + FAMILY BOUNDARY
check('STATE', 'entry complete checklist reflects real state', (await page.locator('.jrn-checkline[data-done="true"]').count()) === 3);
await shot(page, 'flows', 'f0113-complete');
await page.click(sel('complete-continue'));
await page.waitForSelector('[data-jrn-screen="F02.BOUNDARY"][data-transition="family"]');
await wait(page, 900); // let the family crossfade settle before the proof capture
check('TRANSITION', 'CONTINUE TO SETUP → F01 → F02 family boundary', true);
await shot(page, 'flows', 'f02-boundary');

// SIGN IN states
await go('entry/sign-in');
await page.fill(sel('signin-email'), 'emma@example.com');
await page.fill(sel('signin-password'), 'wrong-pass');
await page.click(sel('signin-submit'));
await page.waitForSelector(sel('signin-error-incorrect'), { timeout: 6000 });
check('ERROR', 'INCORRECT PASSWORD panel', true);
await shot(page, 'flows', 'f0103-incorrect');
await page.click(sel('signin-password-toggle'));
check('PASSWORD', 'sign-in SHOW PASSWORD', (await page.locator(sel('signin-password')).getAttribute('type')) === 'text');
await page.fill(sel('signin-email'), 'nobody@example.com');
await page.click(sel('signin-submit'));
await page.waitForSelector(sel('signin-error-not-found'), { timeout: 6000 });
check('ERROR', 'ACCOUNT NOT FOUND panel with CREATE ACCOUNT', true);
await page.fill(sel('signin-email'), 'locked@example.com');
await page.click(sel('signin-submit'));
await page.waitForSelector('[data-jrn-overlay="locked"]', { timeout: 6000 });
check('DRAWER', 'ACCOUNT LOCKED short drawer (wine)', true);
await shot(page, 'flows', 'f0103-locked');
await page.click(sel('locked-back'));
await page.fill(sel('signin-email'), 'emma@example.com');
await page.fill(sel('signin-password'), 'Jurnl-2026');
await page.click(sel('signin-keep'));
check('CHECKBOX', 'KEEP ME SIGNED IN square checkbox', (await page.locator(`${sel('signin-keep')}[aria-checked="true"]`).count()) === 1);
await page.click(sel('signin-submit'));
await wait(page, 250);
check('LOADING', 'SIGNING IN... loading', (await page.locator(`${sel('signin-submit')}[data-loading="true"]`).count()) === 1);
await page.waitForSelector('[data-jrn-screen="F01.13"]', { timeout: 8000 });
check('ROUTING', 'sign-in success → post-auth routing (decided device → F01.13)', true);

// RETURNING USER (remembered from KEEP ME SIGNED IN)
await page.evaluate(() => sessionStorage.removeItem('jurnl.runtime.v1.session'));
await page.evaluate(() => localStorage.setItem('jurnl.runtime.v1.session', ''));
await go('', '');
check('STATE', 'remembered user lands on F01.04 RETURNING USER UNLOCK', await screenIs('F01.04'), page.url());
await shot(page, 'flows', 'f0104-unlock');
await page.goto(`${RT}/entry/unlock?os=failed`);
await page.waitForSelector(sel('unlock-faceid'));
await page.click(sel('unlock-faceid'));
await page.click(sel('faceid-unlock-continue'));
await page.waitForSelector(sel('unlock-error-faceid'), { timeout: 6000 });
check('ERROR', 'FACE ID FAILED panel (OS outcome via boundary)', (await page.locator(sel('unlock-retry')).innerText()).trim() === 'TRY AGAIN');
await shot(page, 'flows', 'f0104-faceid-failed');
await page.click(sel('unlock-use-password'));
await page.waitForSelector('[data-jrn-overlay="use-password"][data-jrn-sheet="full"]');
check('SHEET', 'USE PASSWORD full-screen sheet', true);
await shot(page, 'flows', 'f0104-use-password-sheet');
await page.click(sel('use-password-close'));
await page.click(sel('unlock-switch-account'));
await page.waitForSelector('[data-jrn-overlay="switch-account"]');
check('DRAWER', 'SWITCH ACCOUNT surface', true);
await shot(page, 'flows', 'f0104-switch-account');
await page.click(sel('switch-sign-out'));
await page.waitForSelector('[data-jrn-overlay="sign-out"][data-jrn-modal="confirm"]');
check('MODAL', 'SIGN OUT confirmation', true);
await shot(page, 'flows', 'f0104-sign-out-confirm');
await page.click(sel('sign-out-confirm'));
await page.waitForSelector('[data-jrn-screen="F01.00"]');
check('ROUTING', 'sign out → F01.00', true);

// RECOVERY
await go('entry/forgot-password');
await page.fill(sel('forgot-email'), 'emma@');
await page.click(sel('forgot-submit'));
await page.waitForSelector(sel('forgot-error-email'));
check('ERROR', 'forgot password invalid email', true);
await page.fill(sel('forgot-email'), 'emma@example.com');
await page.click(sel('forgot-submit'));
await wait(page, 250);
check('LOADING', 'SENDING... loading', (await page.locator(`${sel('forgot-submit')}[data-loading="true"]`).count()) === 1);
await page.waitForSelector('[data-jrn-screen="F01.06"]', { timeout: 8000 });
await page.click(sel('reset-sent-resend'));
await page.waitForSelector('[data-jrn-trigger="toast-reset-resent"]', { timeout: 6000 });
check('TOAST', 'reset link resent', true);
await shot(page, 'flows', 'f0106-resent');
await page.goto(`${RT}/entry/new-password?token=expired`);
await page.waitForSelector(sel('newpw-error-invalid-link'), { timeout: 6000 });
check('ERROR', 'invalid / expired reset link', true);
await page.goto(`${RT}/entry/new-password?token=preview`);
await page.waitForSelector(sel('newpw-password'));
await page.fill(sel('newpw-password'), 'jurnl');
await page.fill(sel('newpw-confirm'), 'jurnl');
await page.click(sel('newpw-submit'));
check('ERROR', 'weak password flagged', await page.locator(sel('newpw-error-weak')).count());
await page.fill(sel('newpw-password'), 'Jurnl-2027!');
await page.fill(sel('newpw-confirm'), 'Jurnl-2028!');
await page.click(sel('newpw-submit'));
check('ERROR', 'confirm mismatch', await page.locator(sel('newpw-error-mismatch')).count());
await shot(page, 'flows', 'f0107-mismatch');
await page.fill(sel('newpw-confirm'), 'Jurnl-2027!');
await page.click(sel('newpw-submit'));
await page.waitForSelector('[data-jrn-screen="F01.08"]', { timeout: 8000 });
await page.waitForSelector('[data-jrn-trigger="toast-reset-success"]');
check('TOAST', 'password reset → F01.08 + success banner', true);
await shot(page, 'flows', 'f0108-success');
await page.click(sel('reset-success-sign-in'));
await page.waitForSelector('[data-jrn-screen="F01.03"]');
await page.fill(sel('signin-email'), 'emma@example.com');
await page.fill(sel('signin-password'), 'Jurnl-2027!');
await page.click(sel('signin-submit'));
await page.waitForSelector('[data-jrn-screen]:not([data-jrn-screen="F01.03"])', { timeout: 8000 });
check('ROUTING', 'new password signs in (real recovery state)', true);

// NETWORK scenario
await go('entry/sign-in', 'scenario=network-error');
await page.fill(sel('signin-email'), 'emma@example.com');
await page.fill(sel('signin-password'), 'Jurnl-2027!');
await page.click(sel('signin-submit'));
await page.waitForSelector('[data-jrn-trigger="toast-network"]', { timeout: 6000 });
check('TOAST', 'network error toast (scenario)', true);
await shot(page, 'flows', 'f0103-network-error');

// UPPERCASE + geometry sweep on live DOM
const sweep = await page.evaluate(() => {
  const root = document.querySelector('.jrn');
  const interactive = [...root.querySelectorAll('button, input, a')];
  const round = interactive.filter((el) => {
    const cs = getComputedStyle(el);
    const r = parseFloat(cs.borderTopLeftRadius);
    return r >= Math.min(el.offsetWidth, el.offsetHeight) / 2 - 0.5 && el.offsetWidth > 0;
  }).length;
  return { interactive: interactive.length, round };
});
check('GEOMETRY', 'circular interactive controls in live DOM = 0', sweep.round === 0, JSON.stringify(sweep));
await page.close();
await browser.close();

const pass = checks.filter((c) => c.pass).length;
const report = { sprint: 'P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1', base: BASE, at: new Date().toISOString(), total: checks.length, pass, fail: checks.length - pass, pageErrors, checks };
writeFileSync(join(OUT, 'LIVE_QA_REPORT.json'), JSON.stringify(report, null, 2));
console.log(`\nLIVE QA: ${pass}/${checks.length} PASS · page errors: ${pageErrors.length}`);
process.exit(checks.length - pass ? 1 : 0);
