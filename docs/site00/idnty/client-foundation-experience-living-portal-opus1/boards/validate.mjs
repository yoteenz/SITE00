#!/usr/bin/env node
/**
 * Validation suite for the YOUR FOUNDATION client authority (sprint §47).
 * Writes boards/validation-report.json and prints a summary. Read-only with respect to the application.
 *
 * Usage (repo root): node docs/site00/idnty/client-foundation-experience-living-portal-opus1/boards/validate.mjs [--no-layout]
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { here, repo, start, measure, SPECIMEN, VIEWPORTS, tierOf } from './lib.mjs';

const root = resolve(here, '..');
const results = [];
const check = (group, name, ok, detail = '') => results.push({ group, name, ok: Boolean(ok), detail: String(detail).slice(0, 600) });

// ─── 1. Authority files ──────────────────────────────────────────────────────────────────────
const DOCS = [
  'README.md', '01_SOURCE_AND_PRODUCT_AUDIT.md', '02_CLIENT_EXPERIENCE_NARRATIVE.md', '03_CLIENT_INFORMATION_ARCHITECTURE.md', '04_CANONICAL_LIFECYCLE_UI_MATRIX.md',
  '05_POST_INTAKE_REVIEW_AUTHORITY.md', '06_FOUNDATION_ROADMAP_AUTHORITY.md', '07_NEEDS_YOU_AUTHORITY.md', '08_RECORDS_AUTHORITY.md', '09_HOME_SCREEN_INSTALL_AUTHORITY.md',
  '10_HOME_SCREEN_ICON_AND_LAUNCH.md', '11_FOUNDATION_ACCESS_CARD_AUTHORITY.md', '12_ACCESS_CARD_SECURITY_AND_QR.md', '13_SECURE_CLIENT_REENTRY.md', '14_PERSONALIZED_PROPOSAL_AUTHORITY.md',
  '15_RECOMMENDATION_SELECTION.md', '16_QUOTE_VERSION_AND_ACCEPTANCE.md', '17_PAYMENT_AND_CONFIRMATION.md', '18_PROJECT_OPERATIONS_EXPERIENCE.md', '19_COMPLETION_AND_HANDOFF.md',
  '20_ACTIVITY_AND_NOTIFICATIONS.md', '21_GLOBAL_CLIENT_OVERLAY_REGISTRY.md', '22_RESPONSIVE_GRID_SPECIFICATION.md', '23_TYPOGRAPHY_AND_DESIGN_TOKENS.md', '24_APPROVED_ASSET_MANIFEST.md',
  '25_MOTION_AND_TRANSITIONS.md', '26_COMPONENT_REGISTRY.md', '27_BACKEND_GAP_REGISTER.md', '28_SECURITY_AND_PRIVACY_REVIEW.md', '29_OPUS_TO_COMPOSER_HANDOFF.md',
  '30_VISUAL_BOARD_MANIFEST.md', '31_FOUNDER_APPROVAL_REGISTER.md', '32_VALIDATION_AND_TEST_REPORT.md', '33_IMPLEMENTATION_READINESS.md',
];
const doc = (f) => (existsSync(join(root, f)) ? readFileSync(join(root, f), 'utf8') : '');
for (const f of DOCS) {
  const t = doc(f);
  const num = f.slice(0, 2);
  check('authority-files', f, t.length > 400 && (f === 'README.md' ? t.startsWith('# ') : t.startsWith(`# ${num} `)), t ? `${t.length} chars` : 'missing');
}
const extra = readdirSync(root).filter((f) => f.endsWith('.md') && !DOCS.includes(f));
check('authority-files', 'no unexpected documents', extra.length === 0, extra.join(', '));

// ─── 2. Board manifest ───────────────────────────────────────────────────────────────────────
const manifest = JSON.parse(readFileSync(join(here, 'board-manifest.json'), 'utf8'));
const ids = Object.keys(manifest.boards);
const tiers = ids.reduce((a, k) => ((a[k.replace(/\d+$/, '')] = (a[k.replace(/\d+$/, '')] ?? 0) + 1), a), {});
const MIN = { M: 20, TP: 10, TL: 10, D: 20, UW: 5, X: 10, AH: 10 };
for (const [k, n] of Object.entries(MIN)) check('board-manifest', `tier ${k} ≥ ${n}`, (tiers[k] ?? 0) >= n, `${tiers[k] ?? 0}`);
check('board-manifest', 'total ≥ 85', ids.length >= 85, `${ids.length}`);
const srcBoards = readdirSync(join(here, 'src')).filter((f) => /^board-[A-Z]+\d\d-.+\.html$/.test(f));
check('board-manifest', 'every board source rendered', srcBoards.length === ids.length, `${srcBoards.length} sources / ${ids.length} manifest`);
let shaBad = [], frameBad = [], fontBad = [], errBad = [], lowBad = [], layoutBad = [];
for (const [id, b] of Object.entries(manifest.boards)) {
  const p = join(here, b.image);
  if (!existsSync(p) || createHash('sha256').update(readFileSync(p)).digest('hex') !== b.sha256) shaBad.push(id);
  if (b.live_frames && b.live_frames.ready !== b.live_frames.total) frameBad.push(id);
  if (!Object.values(b.fonts_loaded ?? {}).every(Boolean)) fontBad.push(id);
  if ((b.page_errors ?? []).length) errBad.push(`${id}: ${b.page_errors.join(' | ')}`);
  if ((b.lowercase_app_text ?? []).length) lowBad.push(`${id}: ${b.lowercase_app_text.join(' | ')}`);
  if ((b.frame_layout?.failing ?? []).length) layoutBad.push(`${id}: ${b.frame_layout.failing.map((f) => `${f.q}@${f.viewport}:${f.hard.join('+')}`).join(' | ')}`);
}
check('board-manifest', 'png sha256 matches manifest', !shaBad.length, shaBad.join(', '));
check('board-manifest', 'all live frames ready', !frameBad.length, frameBad.join(', '));
check('board-manifest', 'fonts loaded in every frame', !fontBad.length, fontBad.join(', '));
check('board-manifest', 'no page errors / failed requests', !errBad.length, errBad.join(' ; '));
check('board-manifest', 'no lowercase client copy', !lowBad.length, lowBad.join(' ; '));
check('board-manifest', 'no per-frame layout failures', !layoutBad.length, layoutBad.join(' ; '));
const boardsJs = readFileSync(join(here, 'src/boards.js'), 'utf8');
check('board-manifest', 'every board labels frames as specimens (not live screenshots)', /SPECIMEN · NOT LIVE APP/.test(readFileSync(join(here, 'src/board-kit.js'), 'utf8')) && /not a screenshot of the running application/.test(readFileSync(join(here, 'src/board-kit.js'), 'utf8')));
const famLetters = new Set([
  ...[...boardsJs.matchAll(/fam: '([^']*)'/g)].flatMap((m) => [...m[1].matchAll(/\b([A-T]) ·/g)].map((x) => x[1])),
  ...[...boardsJs.matchAll(/section\('\d\d', '([A-T](?: · [A-T])*)'/g)].flatMap((m) => m[1].split(' · ')),
]);
const famCover = 'ABCDEFHIJKLMNOPQRST'.split('').filter((f) => !famLetters.has(f)); // G (access card) retired in LOCK1
check('board-manifest', 'families A–T present (G retired by LOCK1)', famCover.length === 0, famCover.join(','));
const RETIRED = ['M09', 'D11', 'AH06', 'AH07', 'AH08', 'AH09', 'AH10'];
check('retired-card', 'retired card boards absent from the active manifest', RETIRED.every((r) => !manifest.boards[r]), RETIRED.filter((r) => manifest.boards[r]).join(','));
const archived = readdirSync(join(here, 'archive/retired-access-card')).filter((f) => f.endsWith('.png'));
check('retired-card', 'retired card boards archived (history preserved)', RETIRED.every((r) => archived.some((f) => f.startsWith(`board-${r}-`))), archived.join(', '));
check('retired-card', 'retired boards listed under manifest.retired with label', RETIRED.every((r) => /RETIRED/.test(manifest.retired?.[r]?.status ?? '')));

// ─── 4. Component registry ───────────────────────────────────────────────────────────────────
const reg = doc('26_COMPONENT_REGISTRY.md');
const regRows = reg.split('\n').filter((l) => /^\| CF-\d\d /.test(l));
const regCells = regRows.map((l) => l.split(' | ').length);
check('component-registry', '41 registered components (CF-34/35 retired, CF-41 launch added)', regRows.length === 41 && /^\| CF-34 \| ~~/m.test(reg) && /^\| CF-35 \| ~~/m.test(reg) && /^\| CF-41 \|/m.test(reg), `${regRows.length}`);
check('component-registry', 'each component defines 13 interaction fields + id + name', regCells.every((n) => n === 15) && regRows.every((l) => !/\|\s*\|/.test(l)), regCells.join(','));
check('component-registry', 'DOWNLOAD ACCESS CARD mapped as RETIRED (no component)', /\| ~~DOWNLOAD ACCESS CARD~~ \| \*\*RETIRED\*\*/.test(reg));
for (const ex of ['SAVE YOUR FOUNDATION', 'REFRESH STATUS', 'VIEW INTAKE SUMMARY', 'VIEW PROPOSAL', 'ACCEPT QUOTE', 'REQUEST CLARIFICATION', 'CONTINUE TO CHECKOUT', 'OPEN ROADMAP', 'VIEW RECORDS', 'RETURN TO FOUNDATION'])
  check('component-registry', `example control mapped: ${ex}`, new RegExp(`\\| ${ex} \\| CF-\\d\\d( \\(|\\s\\|)`).test(reg));
const ovRows = doc('21_GLOBAL_CLIENT_OVERLAY_REGISTRY.md').split('\n').filter((l) => /^\| OL-C\d\d /.test(l));
check('component-registry', '14 overlays registered (4 retired, OL-C14 added)', ovRows.length === 14 && ovRows.filter((l) => /RETIRED/.test(l)).length === 4, `${ovRows.length}`);
const handoff = doc('29_OPUS_TO_COMPOSER_HANDOFF.md');
for (const h of ['Source route map', 'Current component map', 'New component map', 'Reusable visual primitives', 'Grid, type, tokens, fonts, assets, motion', 'Lifecycle UI matrix, post-intake mapping', 'Proposal / quote versioning', 'Home-screen install contract', 'Safe reentry architecture', 'Access card file contract, QR security', 'Email event contract', 'Payment event gates', 'Backend gaps', 'Accessibility', 'Error states', 'Test matrix', 'Migration impact', 'Implementation order', 'Acceptance criteria'])
  check('handoff', `handoff section: ${h}`, handoff.toLowerCase().includes(h.toLowerCase()));
check('handoff', 'phases 0–14 present', [...Array(15).keys()].every((n) => new RegExp(`^\\| ${n} \\|`, 'm').test(handoff)));

// ─── 5. State machine consistency ────────────────────────────────────────────────────────────
const types = readFileSync(join(repo, 'shared/site00-digital-foundation/types.ts'), 'utf8');
const union = types.match(/export type DigitalFoundationArtifactState =([\s\S]*?);/)[1].match(/'([A-Z_]+)'/g).map((s) => s.slice(1, -1));
const SPRINT = ['INVITED', 'OPENED', 'INTAKE_IN_PROGRESS', 'INTAKE_COMPLETE', 'RECOMMENDATION_READY', 'QUOTE_READY', 'AWAITING_ACCEPTANCE', 'AWAITING_PAYMENT', 'PAID', 'PROJECT_ACTIVE', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'WAITING_ON_PROVIDER', 'FINAL_VERIFICATION', 'COMPLETE', 'BUILD_OPPORTUNITY', 'ARCHIVED'];
check('state-machine', 'source union equals sprint canonical list (17)', union.length === 17 && SPRINT.every((s) => union.includes(s)), union.join(','));
const matrix = doc('04_CANONICAL_LIFECYCLE_UI_MATRIX.md');
const missing = union.filter((s) => !matrix.includes(`| \`${s}\` |`));
check('state-machine', 'every canonical state mapped in 04', !missing.length, missing.join(','));
const kit = readFileSync(join(here, 'src/cf-kit.js'), 'utf8');
const canon = [...kit.matchAll(/canon: '([A-Z_]+)'/g)].map((m) => m[1]);
check('state-machine', 'specimen phases reference only canonical states', canon.every((c) => union.includes(c)), canon.join(','));
const stageNames = [...kit.matchAll(/n: '([A-Z &]+)', s:/g)].map((m) => m[1]);
check('state-machine', 'roadmap = locked 7 client stages', JSON.stringify(stageNames) === JSON.stringify(['INTAKE RECEIVED', 'FOUNDATION REVIEW', 'PERSONALIZED PROPOSAL', 'APPROVAL & PAYMENT', 'FOUNDATION SETUP', 'FINAL VERIFICATION', 'COMPLETE']), stageNames.join(' · '));
const allSrc = readdirSync(join(here, 'src')).filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(here, 'src', f), 'utf8')).join('\n');
check('state-machine', 'no client state machine / transition table in specimens', !/transition|ALLOWED_TRANSITIONS|setState\(/.test(allSrc));

// ─── 7. Quote / payment consistency (static) ─────────────────────────────────────────────────
const pages = readFileSync(join(here, 'src/cf-pages.js'), 'utf8');
const ex = Object.fromEntries([...pages.matchAll(/\['([A-Z -]+)', (\d+)\]/g)].map((m) => [m[1], Number(m[2])]));
const EXPECT = { 'ADDITIONAL MAILBOX': 75, 'NEW DOMAIN': 100, 'DOMAIN TRANSFER': 100, 'DOMAIN RECOVERY': 150, 'EMAIL MIGRATION': 200, 'MULTI-USER SETUP': 150, 'EMAIL ROUTING': 100, 'EMAIL SIGNATURE': 150, 'DEVICE SETUP': 50, 'DNS CLEANUP': 150, 'SITE CONFLICT': 150 };
check('quote-payment', 'example add-on prices equal sprint example pricing', Object.entries(EXPECT).every(([k, v]) => ex[k] === v), JSON.stringify(ex));
check('quote-payment', 'base Digital Foundation $500', /n: 'DIGITAL FOUNDATION'[^}]*p: 50000/.test(pages));
check('quote-payment', 'example pricing labelled as not a charge', /EXAMPLE PRICING FOR AUTHORITY REVIEW — NOT A LIVE CHARGE/.test(pages) && /EXAMPLE PRICING · NOT A CHARGE/.test(readFileSync(join(here, 'src/board-kit.js'), 'utf8')));
check('quote-payment', 'no card input anywhere in specimens', !/type="(tel|number)"|card number|cvc|cvv/i.test(allSrc));
check('quote-payment', 'disclosures from source (DF_DISCLOSURES), not retyped', /__DF\.DF_DISCLOSURES/.test(pages));

// ─── 10. Documentation link check ────────────────────────────────────────────────────────────
const badLinks = [];
for (const f of DOCS) {
  for (const m of doc(f).matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
    const t = m[1];
    if (/^https?:/.test(t)) continue;
    if (!existsSync(resolve(root, t))) badLinks.push(`${f} → ${t}`);
  }
}
check('doc-links', 'all relative markdown links resolve', !badLinks.length, badLinks.join(' ; '));
const docRefs = [];
for (const f of DOCS) for (const m of doc(f).matchAll(/`(\d\d)`/g)) if (!DOCS.some((d) => d.startsWith(m[1] + '_'))) docRefs.push(`${f} → ${m[1]}`);
// LOCK1 amendment folder
const lockRoot = resolve(root, '../client-foundation-digital-access-authority-lock1');
const LOCK_DOCS = ['README.md', '01_FOUNDER_DECISION_LOCK.md', '02_APPROVED_ICON_ASSET.md', '03_APPROVED_LAUNCH_ASSET.md', '04_CLIENT_ACCESS_CARD_RETIREMENT.md', '05_HOME_SCREEN_INSTALL_CONTRACT.md', '06_SECURE_REENTRY_CONTRACT.md', '07_RESPONSIVE_LAUNCH_SPEC.md', '08_ASSET_MANIFEST.md', '09_BACKEND_GAP_RECONCILIATION.md', '10_UPDATED_COMPOSER_HANDOFF.md', '11_FOUNDER_APPROVAL_RECORD.md', '12_VALIDATION.md'];
const ldoc = (f) => (existsSync(join(lockRoot, f)) ? readFileSync(join(lockRoot, f), 'utf8') : '');
for (const f of LOCK_DOCS) {
  const t = ldoc(f);
  check('lock1-files', f, t.length > 400 && (f === 'README.md' ? t.startsWith('# ') : t.startsWith(`# ${f.slice(0, 2)} `)), t ? `${t.length} chars` : 'missing');
}
const lockExtra = readdirSync(lockRoot).filter((f) => f.endsWith('.md') && !LOCK_DOCS.includes(f));
check('lock1-files', 'no unexpected LOCK1 documents', lockExtra.length === 0, lockExtra.join(', '));
for (const f of LOCK_DOCS) {
  const t = ldoc(f);
  for (const m of t.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) if (!/^https?:/.test(m[1]) && !existsSync(resolve(lockRoot, m[1]))) badLinks.push(`LOCK1 ${f} → ${m[1]}`);
  for (const m of t.matchAll(/(OPUS1 )?`(\d\d)`/g)) {
    const pool = m[1] ? DOCS : LOCK_DOCS;
    if (!pool.some((d) => d.startsWith(m[2] + '_'))) docRefs.push(`LOCK1 ${f} → ${m[1] ?? ''}${m[2]}`);
  }
}
check('doc-links', 'LOCK1 links resolve', !badLinks.some((b) => b.startsWith('LOCK1')), badLinks.filter((b) => b.startsWith('LOCK1')).join(' ; '));
check('doc-links', 'all `NN` document references resolve', !docRefs.length, docRefs.join(' ; '));
const gaps = new Set([...doc('27_BACKEND_GAP_REGISTER.md').matchAll(/\| (?:\*\*|~~)?(G-\d\d)(?:\*\*|~~)? \|/g)].map((m) => m[1]));
const gapRefs = new Set([...DOCS.flatMap((f) => [...doc(f).matchAll(/G-\d\d/g)].map((m) => m[0])), ...LOCK_DOCS.flatMap((f) => [...ldoc(f).matchAll(/G-\d\d/g)].map((m) => m[0]))]);
const undefinedGaps = [...gapRefs].filter((g) => !gaps.has(g));
check('doc-links', 'every G-xx reference is defined in 27', !undefinedGaps.length, undefinedGaps.join(','));
const ods = new Set([...doc('31_FOUNDER_APPROVAL_REGISTER.md').matchAll(/\| (OD-\d\d) \|/g)].map((m) => m[1]));
const odRefs = [...new Set([...DOCS, ...LOCK_DOCS.map((f) => `L:${f}`)].flatMap((f) => [...(f.startsWith('L:') ? ldoc(f.slice(2)) : doc(f)).matchAll(/OD-\d\d/g)].map((m) => m[0])))].filter((o) => !ods.has(o));
check('doc-links', 'every OD-xx reference is defined in 31', !odRefs.length, odRefs.join(','));
const frs = new Set([...ldoc('11_FOUNDER_APPROVAL_RECORD.md').matchAll(/\| \*{0,2}(FR-\d\d)\*{0,2} \|/g)].map((m) => m[1]));
const frRefs = [...new Set([...DOCS.map(doc), ...LOCK_DOCS.map(ldoc)].flatMap((t) => [...t.matchAll(/FR-\d\d/g)].map((m) => m[0])))].filter((x) => !frs.has(x));
check('doc-links', 'every FR-xx reference is defined in LOCK1 11', !frRefs.length, frRefs.join(','));
check('lock1-gaps', 'G-02, G-09, G-12 preserved as blocking; G-11 retired', /\*\*G-02\*\* \|[^\n]*ACTIVE · BLOCKING/.test(ldoc('09_BACKEND_GAP_RECONCILIATION.md')) && /\*\*G-09\*\* \|[^\n]*ACTIVE · BLOCKING/.test(ldoc('09_BACKEND_GAP_RECONCILIATION.md')) && /\*\*G-12\*\* \|[^\n]*ACTIVE · BLOCKING/.test(ldoc('09_BACKEND_GAP_RECONCILIATION.md')) && /\*\*G-11\*\* \|[^\n]*\*\*RETIRED\*\*/.test(ldoc('09_BACKEND_GAP_RECONCILIATION.md')) && /~~G-11~~/.test(doc('27_BACKEND_GAP_REGISTER.md')));
const lh = ldoc('10_UPDATED_COMPOSER_HANDOFF.md');
const order = lh.slice(lh.indexOf('## 24. Implementation order'), lh.indexOf('## 25.'));
check('lock1-handoff', 'implementation phases 0–14 present, no card/QR phase', [...Array(15).keys()].every((n) => new RegExp(`^\\| ${n} \\|`, 'm').test(order)) && !/^\| \d+ \|[^\n]*(access card|\bQR\b|card export)/im.test(order) && /no client access card phase/i.test(order));
for (const h of ['Asset source files', 'Canonical repository paths', 'Icon export specification', 'Launch image contract', 'Responsive safe zones', 'PWA manifest', 'Apple touch icon', 'Android icons', 'theme colour', 'token-free start URL', 'Install flow', 'iOS guidance', 'Android guidance', 'Secure email reentry', 'session restoration', 'persistent identity', 'Backend security gates', 'Post-intake status flow', 'Quote approval gate', 'Payment verification gate', 'Client navigation', 'Removed card component list', 'Updated test requirements'])
  check('lock1-handoff', `handoff covers: ${h}`, lh.toLowerCase().includes(h.toLowerCase()));

// ─── 6. Access security (static) ─────────────────────────────────────────────────────────────
// Bearer tokens are randomBytes(24).toString('base64url') = exactly 32 chars.
const TOKEN_URL = /\/foundation\/(?!return\b|review\b)[A-Za-z0-9_-]{32}(?![A-Za-z0-9_.-])/; // a following "." is a source file path, not a token
const scanFiles = [...readdirSync(join(here, 'src')).map((f) => join(here, 'src', f)), ...DOCS.map((f) => join(root, f))].filter((p) => statSync(p).isFile());
const tokenHits = scanFiles.filter((p) => TOKEN_URL.test(readFileSync(p, 'utf8')));
check('access-security', 'no bearer-token-shaped /foundation/<token> URL in boards or docs', !tokenHits.length, tokenHits.map((p) => relative(root, p)).join(', '));
check('access-security', 'no secret-shaped strings (sk_live, sk_test, service_role key, JWT)', !scanFiles.some((p) => /sk_(live|test)_[A-Za-z0-9]{8,}|eyJhbGciOi|SERVICE_ROLE_KEY=\S+/.test(readFileSync(p, 'utf8'))));
const man10 = JSON.parse(ldoc('05_HOME_SCREEN_INSTALL_CONTRACT.md').match(/```json\n([\s\S]*?)```/)[1]);
check('home-screen', 'manifest id and every field token-free', !TOKEN_URL.test(JSON.stringify(man10)) && man10.id === '/foundation/return');
check('home-screen', 'manifest icons point at the approved-icon deploy paths (192 any, 512 any, 512 maskable)', JSON.stringify(man10.icons.map((i) => [i.sizes, i.purpose])) === JSON.stringify([['192x192', 'any'], ['512x512', 'any'], ['512x512', 'maskable']]) && man10.icons.every((i) => /^\/site00\/idnty\/foundation\/foundation-icon-/.test(i.src)));
check('home-screen', 'manifest start_url has no token and targets /foundation/return', man10.start_url.startsWith('/foundation/return') && !TOKEN_URL.test(man10.start_url), man10.start_url);
check('home-screen', 'manifest short_name MY FOUNDATION', man10.short_name === 'MY FOUNDATION');
check('home-screen', 'manifest theme/background from --df-bg', man10.theme_color === '#f3f2ef' && man10.background_color === '#f3f2ef');

// ─── LOCK1 asset identity ────────────────────────────────────────────────────────────────────
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const ICON_SHA = '4dccf2ae9e5bd26220cb426b4e5a0d3ed53b4eeb7e5f22bb33fb66785b2f9b76';
const LAUNCH_SHA = 'f88555656a347835e1f071cb1bd2a19243c833282ab1e242b36bbde84646b249';
check('asset-identity', 'icon master byte-identical to founder attachment 01', sha(join(lockRoot, 'assets/master/SITE00_FOUNDATION_ICON_MASTER.png')) === ICON_SHA);
check('asset-identity', 'launch master byte-identical to founder attachment 02', sha(join(lockRoot, 'assets/master/SITE00_FOUNDATION_LAUNCH_MASTER.png')) === LAUNCH_SHA);
const deriv = JSON.parse(readFileSync(join(lockRoot, 'assets/derived/derivation.json'), 'utf8'));
check('asset-identity', 'derivation record references the locked icon master', deriv.master_sha256 === ICON_SHA);
for (const o of deriv.outputs) {
  const p = join(lockRoot, 'assets', o.file);
  let info = '';
  try {
    info = execFileSync('python3', ['-I', '-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]);print(im.size[0],im.size[1],im.mode,int("exif" in im.info),int(any(k in im.info for k in ("text","comment","XML:com.adobe.xmp"))))', p], { encoding: 'utf8' }).trim();
  } catch (e) {
    info = `ERR ${e.message.slice(0, 60)}`;
  }
  check('asset-identity', `derivative ${o.file}: hash, ${o.px}² opaque RGB, no metadata`, sha(p) === o.sha256 && info === `${o.px} ${o.px} RGB 0 0`, info);
}
const reDerive = (() => {
  try {
    return execFileSync('python3', ['-I', '-c', 'import json,subprocess,sys,tempfile,shutil,pathlib\nsrc=pathlib.Path(sys.argv[1]);tmp=pathlib.Path(tempfile.mkdtemp());(tmp/"master").mkdir();shutil.copy(src/"master/SITE00_FOUNDATION_ICON_MASTER.png",tmp/"master");subprocess.run([sys.executable,"-I",str(src/"derive-icons.py"),str(tmp)],check=True,capture_output=True);print(json.dumps([o["sha256"] for o in json.load(open(tmp/"derived/derivation.json"))["outputs"]]));shutil.rmtree(tmp)', join(lockRoot, 'assets')], { encoding: 'utf8' }).trim();
  } catch (e) {
    return `ERR ${e.message.slice(0, 80)}`;
  }
})();
let reHashes = [];
try {
  reHashes = JSON.parse(reDerive);
} catch {}
check('asset-identity', 'icon derivatives reproducible bit-for-bit from the master (derive-icons.py)', JSON.stringify(reHashes) === JSON.stringify(deriv.outputs.map((o) => o.sha256)), reDerive.slice(0, 120));
const activeSrc = ['cf-kit.js', 'cf-pages.js', 'cf-access.js', 'specimen.js', 'cf.css'].map((f) => readFileSync(join(here, 'src', f), 'utf8')).join('\n');
check('retired-card', 'active specimens contain no card component, QR library or ?card= route', !/qrcode|cardPage|cardExport|walletPass|\?card=|ACCESS CARD|ACCESS_CARD|\.ac__|SCAN TO RETURN/.test(activeSrc));
check('asset-identity', 'specimens use the locked masters / derivatives, not the retired placeholder icon', /SITE00_FOUNDATION_LAUNCH_MASTER\.png/.test(activeSrc) && /foundation-icon-192\.png/.test(activeSrc) && !/appicon__bar|appicon__s|appicon__dot/.test(activeSrc));

// ─── 9. Brand asset audit (static) ───────────────────────────────────────────────────────────
const css = readFileSync(join(here, 'src/cf.css'), 'utf8');
const PALETTE = new Set(['#f3f2ef', '#f9f8f6', '#f6f5f2', '#0c0c0c', '#2f2f2e', '#75736e', '#a3a19c', '#dcdad5', '#c9c7c2', '#ce1017', '#b30f17', '#2e5e3f', '#fff', '#ffffff', '#f0474d', '#d3121b', '#a80c13', '#e7e6e2', '#efeeeb', '#ebeae6', '#b9b7b2', '#bdbbb6', '#3a3a39', '#2a2a29', '#121212', '#e9e8e4']);
const hexes = [...new Set([...css.matchAll(/#[0-9a-fA-F]{3,6}\b/g)].map((m) => m[0].toLowerCase()))];
const off = hexes.filter((h) => !PALETTE.has(h));
check('brand-assets', 'cf.css colours ⊂ DF tokens + object glass + neutral device chrome', !off.length, off.join(','));
const famVals = [...css.matchAll(/font-family:\s*([^;]+);/g)].map((m) => m[1].trim()).filter((v) => !/^(var\(--(display|text)\)|inherit)$/.test(v));
check('brand-assets', 'only the two approved font families', !famVals.length && /--display: 'SITE 00 Display'/.test(css) && /--text: 'Saira Semi Condensed'/.test(css), famVals.join(' | '));
check('brand-assets', 'no external image or stock photo references', !/url\((?!['"]?data:)|<img [^>]*src="http/.test(allSrc + css));
check('brand-assets', 'no AIO / referral card art reused', !/aio-card|referral-card|rf-card|AIO_CARD/i.test(allSrc + css));
check('brand-assets', 'no "Anthony" demo data', !scanFiles.some((p) => /anthony/i.test(readFileSync(p, 'utf8')) && !p.endsWith('01_SOURCE_AND_PRODUCT_AUDIT.md') && !p.endsWith('28_SECURITY_AND_PRIVACY_REVIEW.md') && !p.endsWith('32_VALIDATION_AND_TEST_REPORT.md') && !p.endsWith('validate.mjs')));

// ─── 11. Production isolation ────────────────────────────────────────────────────────────────
const grepSrc = (() => {
  try {
    return execFileSync('git', ['grep', '-l', 'client-foundation-experience-living-portal-opus1', '--', 'src', 'shared', 'api', 'server', 'index.html', 'vite.config.ts', 'package.json'], { cwd: repo, encoding: 'utf8' });
  } catch {
    return '';
  }
})();
check('production-isolation', 'application never imports the authority folder', grepSrc.trim() === '', grepSrc);
const changed = execFileSync('git', ['diff', '--name-only', 'd68038a87', '--'], { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean);
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean);
const outside = [...changed, ...untracked].filter((f) => !f.startsWith('docs/site00/idnty/client-foundation-experience-living-portal-opus1/') && !f.startsWith('docs/site00/idnty/client-foundation-digital-access-authority-lock1/') && f !== 'node_modules');
check('production-isolation', 'only the two authority folders changed vs base d68038a87 (no public/, src/, referral studio)', !outside.length, outside.join(', '));

// ─── 3 / 6 / 7 / 8 / 9. Live checks in Chromium ──────────────────────────────────────────────
const skipLayout = process.argv.includes('--no-layout');
const { base, data, browser, close } = await start(5264);
const open = async (q, w, h, dsf = 1) => {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.addInitScript(`window.__DF = ${JSON.stringify(data)};`);
  await page.goto(`${base}/${SPECIMEN}?${q}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  return { page, reqs };
};
try {
  // 3. Responsive layout audit
  if (!skipLayout) {
    const LAYOUT_PAGES = ['p=review', 'p=overview&st=underway', 'p=overview&st=payment', 'p=roadmap&st=blocked', 'p=needs', 'p=action', 'p=records', 'p=record&st=view', 'p=proposal&st=superseded', 'p=recs&st=declined-required', 'p=accept&st=partial', 'p=pay', 'p=confirm&st=confirmed', 'p=progress', 'p=verify&st=review', 'p=complete&st=build', 'p=activity', 'p=prefs', 'p=home&os=ios', 'p=home&os=desktop', 'p=reentry&st=sent', 'p=error&k=load'];
    const fails = [];
    let n = 0;
    for (const [w, h] of VIEWPORTS) {
      for (const q of LAYOUT_PAGES) {
        const { page } = await open(q, w, h);
        const m = await page.evaluate(measure);
        const hard = ['overflow', 'collision', 'dimensions', 'truncation', 'multiline', 'minText', 'fonts'].filter((k) => m[k].length);
        if (hard.length) fails.push(`${q}@${w}x${h} ${hard.map((k) => `${k}:${m[k].slice(0, 2).join(' / ')}`).join(' ; ')}`);
        n++;
        await page.close();
      }
    }
    check('responsive-spec', `layout audit ${LAYOUT_PAGES.length} pages × ${VIEWPORTS.length} viewports (${n} renders)`, !fails.length, fails.slice(0, 12).join(' || '));
    const tierSeen = [...new Set(VIEWPORTS.map(([w]) => tierOf(w)))];
    check('responsive-spec', 'all five tiers audited', tierSeen.length === 5, tierSeen.join(','));
    const comps = {};
    for (const [w, h] of [[390, 844], [820, 1180], [1194, 834], [1440, 900], [2560, 1440]]) {
      const { page } = await open('p=overview&st=underway', w, h);
      comps[tierOf(w)] = await page.evaluate(() => ({ bnav: !!document.querySelector('.cf-bnav'), tabs: !!document.querySelector('.cf-tabs'), side: document.querySelector('.cf-side')?.getBoundingClientRect().width ?? 0, aside: document.querySelector('.cf-aside')?.getBoundingClientRect().width ?? 0 }));
      await page.close();
    }
    const distinct = new Set(Object.values(comps).map((c) => JSON.stringify(c))).size;
    check('responsive-spec', 'each tier has a distinct composition', distinct === 5, JSON.stringify(comps));
  }

  // LOCK1 launch: safe zones visible at every viewport, never distorted, exact master pixels
  {
    const LVP = [[320, 700, 3], [360, 740, 3], [375, 812, 3], [390, 844, 3], [412, 915, 2.6], [430, 932, 3], [768, 1024, 2], [820, 1180, 2], [834, 1112, 2], [1024, 768, 2], [1194, 834, 2], [1280, 800, 2], [1440, 900, 2], [1920, 1080, 1], [2560, 1440, 1], [3440, 1440, 1], [844, 390, 3], [932, 430, 3]];
    const bad = [];
    const ups = [];
    for (const [w, h, d] of LVP) {
      const { page, reqs } = await open('p=launch', w, h, d);
      const r = await page.evaluate(() => {
        const img = document.querySelector('.ln__img');
        return { ...document.body.dataset, nw: img.naturalWidth, nh: img.naturalHeight, src: img.getAttribute('src'), alt: img.alt };
      });
      const expectFit = w / h <= 0.67 ? 'cover' : 'contain';
      if (r.launchSafe !== 'ok' || r.launchFit !== expectFit || r.nw !== 941 || r.nh !== 1672 || !/SITE00_FOUNDATION_LAUNCH_MASTER\.png$/.test(r.src)) bad.push(`${w}x${h}: ${r.launchSafe} ${r.launchFit}≠${expectFit}`);
      ups.push(Number(r.launchUpscale));
      if (w === 390) check('brand-assets', 'specimen requests stay on the local origin', reqs.every((u) => u.startsWith(base) || u.startsWith('data:')), reqs.filter((u) => !u.startsWith(base)).join(', '));
      if (w === 390) check('launch', 'launch alt text carries the approved copy', r.alt === 'SITE 00 — DIGITAL FOUNDATION. YOUR DIGITAL SPACE AWAITS.', r.alt);
      await page.close();
    }
    check('launch', `safe zones fully visible, correct mode, exact 941×1672 master at ${LVP.length} viewports`, !bad.length, bad.join(' | '));
    check('launch', 'resolution limitation measured and documented (max device upscale)', Math.max(...ups) > 1 && /1\.26–1\.67×/.test(ldoc('07_RESPONSIVE_LAUNCH_SPEC.md')), `max ${Math.max(...ups).toFixed(2)}×`);
    const overlaps = [];
    for (const stx of ['slow', 'stalled', 'offline']) {
      for (const [w, h] of [[320, 700], [390, 844], [1440, 900]]) {
        const { page } = await open(`p=launch&st=${stx}&guides=1`, w, h, 2);
        const o = await page.evaluate(() => {
          const c = document.querySelector('.ln__chip').getBoundingClientRect();
          const lines = new Set([...document.querySelector('.ln__chip span').getClientRects()].map((r) => Math.round(r.top))).size;
          const zones = [...document.querySelectorAll('.ln__guides i')].map((i) => i.getBoundingClientRect());
          const hit = zones.some((z) => !(c.right < z.left || c.left > z.right || c.bottom < z.top || c.top > z.bottom));
          return { hit, lines, inView: c.bottom <= innerHeight && c.left >= 0 && c.right <= innerWidth };
        });
        if (o.hit || o.lines > 1 || !o.inView) overlaps.push(`${stx}@${w}: hit=${o.hit} lines=${o.lines} inView=${o.inView}`);
        await page.close();
      }
    }
    check('launch', 'status chips single-line, in view, never overlapping a safe zone (9 renders)', !overlaps.length, overlaps.join(' | '));
  }
  // LOCK1 retired card: no card CTA in any rendered client view
  {
    const leaks = [];
    for (const q of ['p=review', 'p=overview&st=underway&ol=menu', 'p=home&os=none', 'p=home&os=ios', 'p=confirm&st=confirmed', 'p=email&st=review', 'p=overview&st=complete']) {
      for (const [w, h] of [[390, 844], [1440, 900]]) {
        const { page } = await open(q, w, h);
        const t = (await page.evaluate(() => document.body.innerText)).toUpperCase();
        if (/ACCESS CARD|SCAN TO RETURN|DOWNLOAD IMAGE|QR/.test(t)) leaks.push(`${q}@${w}`);
        await page.close();
      }
    }
    check('retired-card', 'no retired card CTA / QR in rendered client views (14 renders)', !leaks.length, leaks.join(', '));
    const { page } = await open('p=home&os=ios', 390, 844);
    const icon = await page.evaluate(() => document.querySelector('.cf-sheet img.appicon')?.getAttribute('src') ?? '');
    check('asset-identity', 'install sheet previews the approved icon derivative', /foundation-icon-192\.png$/.test(icon), icon);
    const cta = await page.evaluate(() => document.body.innerText);
    check('home-screen', 'CTA copy is SAVE YOUR FOUNDATION (LOCK1)', /SAVE YOUR FOUNDATION/.test(cta));
    await page.close();
  }

  // 7. Quote / payment (rendered)
  for (const [q, must, mustNot] of [
    ['p=confirm', 'RETURNING HERE DOES NOT MARK IT PAID', 'YOUR FOUNDATION IS UNDERWAY'],
    ['p=confirm&st=delayed', 'STILL', 'YOUR FOUNDATION IS UNDERWAY'],
    ['p=confirm&st=confirmed', 'VERIFIED BY STRIPE', ''],
    ['p=pay', 'YOUR FOUNDATION IS READY TO BEGIN', 'UNDERWAY'],
    ['p=accept&st=changed', 'CAN NO LONGER BE ACCEPTED', ''],
    ['p=proposal&st=superseded', 'PROPOSAL V1 CAN NO LONGER BE ACCEPTED OR PAID', ''],
  ]) {
    const { page } = await open(q, 1440, 900);
    const t = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').toUpperCase();
    const inputs = await page.evaluate(() => document.querySelectorAll('input').length);
    check('quote-payment', `${q}: “${must}”${mustNot ? ` and never “${mustNot}”` : ''}; no inputs`, t.includes(must) && (!mustNot || !t.includes(mustNot)) && inputs === 0);
    await page.close();
  }
  {
    const { page } = await open('p=accept', 390, 844);
    const dis = await page.evaluate(() => [...document.querySelectorAll('.cf-cta')].find((b) => b.textContent.includes('ACCEPT PROPOSAL'))?.getAttribute('aria-disabled'));
    check('quote-payment', 'ACCEPT disabled until three disclosures confirmed', dis === 'true');
    await page.close();
  }
  for (const q of ['p=review', 'p=overview&st=underway', 'p=roadmap&st=underway', 'p=progress', 'p=verify']) {
    const { page } = await open(q, 1440, 900);
    const t = await page.evaluate(() => document.body.innerText);
    check('truthfulness', `${q}: no percentage / countdown / “just updated”`, !/\d+\s?%|JUST UPDATED|\bLIVE\b|SECONDS LEFT|MINUTES LEFT/i.test(t));
    await page.close();
  }

  // 8. Home-screen platform check (rendered)
  for (const [os, expectBtn] of [['ios', false], ['manual', false], ['desktop', false], ['android', true], ['installed', false]]) {
    const { page } = await open(`p=home&os=${os}`, os === 'desktop' ? 1440 : 390, os === 'desktop' ? 900 : 844);
    const btns = await page.evaluate(() => [...document.querySelectorAll('.cf-sheet .cf-cta, .cf-main .cf-cta')].map((b) => b.textContent.trim()));
    const installish = btns.filter((b) => /ADD TO HOME SCREEN|INSTALL/.test(b));
    check('home-screen', `${os}: ${expectBtn ? 'one browser-prompt button' : 'no install button'}`, expectBtn ? installish.length === 1 : installish.length === 0, btns.join(' | '));
    await page.close();
  }
  {
    const { page } = await open('p=home&os=ios', 390, 844);
    const t = await page.evaluate(() => document.body.innerText);
    check('home-screen', 'iOS guidance names Share → Add to Home Screen and says SITE 00 cannot add it', /TAP SHARE/.test(t) && /ADD TO HOME SCREEN/.test(t) && /CAN’T ADD IT FOR YOU/.test(t));
    await page.close();
  }
  // Reentry: 12 states render, none shows client data publicly beyond session states
  const RE = ['session', 'expired', 'verify', 'sent', 'linkexpired', 'invalid', 'notfound', 'revoked', 'wrongid', 'unavailable', 'retry', 'success'];
  let reOk = 0;
  const leak = [];
  for (const s of RE) {
    const { page } = await open(`p=reentry&st=${s}`, 390, 844);
    const t = await page.evaluate(() => document.body.innerText);
    if (t.length > 50) reOk++;
    if (!['session', 'success'].includes(s) && /NORTHLINE|M•••@|DF-7Q4M/.test(t)) leak.push(s);
    await page.close();
  }
  check('access-security', 'all 12 reentry states render', reOk === 12, `${reOk}/12`);
  check('access-security', 'public reentry states reveal no client data (non-enumerating)', !leak.length, leak.join(','));
} finally {
  await close();
}

const failed = results.filter((r) => !r.ok);
const byGroup = results.reduce((a, r) => ((a[r.group] ??= { pass: 0, fail: 0 }), a[r.group][r.ok ? 'pass' : 'fail']++, a), {});
writeFileSync(join(here, 'validation-report.json'), `${JSON.stringify({ generated_by: 'boards/validate.mjs', base: 'd68038a87', total: results.length, passed: results.length - failed.length, failed: failed.length, groups: byGroup, results }, null, 2)}\n`);
for (const [g, c] of Object.entries(byGroup)) console.log(`${g.padEnd(22)} pass ${c.pass}  fail ${c.fail}`);
for (const f of failed) console.log(`FAIL [${f.group}] ${f.name} — ${f.detail}`);
console.log(`TOTAL ${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
