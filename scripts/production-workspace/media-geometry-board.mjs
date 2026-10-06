#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PANEL-MEDIA-GEOMETRY-REFINEMENT2 — founder review board.
 *
 * For each review page: BEFORE (main) | AFTER (this branch) screenshot, plus a side column naming the media ROLE,
 * FIT MODE, PANEL MODE and WHY a crop is / is not allowed — read from the two media reports.
 *
 *   node scripts/production-workspace/media-geometry-board.mjs <beforeDir> <afterDir> <outDir>
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const [beforeDir, afterDir, outDir] = process.argv.slice(2);
mkdirSync(`${outDir}/boards`, { recursive: true });
const report = (dir) => JSON.parse(readFileSync(`${dir}/media-report.json`, 'utf8'));
const B = report(beforeDir);
const A = report(afterDir);

/** [board id, viewport, route id, title, focus panel test ids (for the notes)] */
export const BOARD = [
  ['casting-mobile', 'mobile', 'expression-casting', 'EXPRESSION → CASTING · AVAILABLE TALENT + LEAD AUTHORITY', ['casting-available-talent', 'casting-lead-authority']],
  ['casting-desktop', 'desktop', 'expression-casting', 'EXPRESSION → CASTING · DESKTOP (composition kept)', ['casting-available-talent', 'casting-lead-authority']],
  ['portrait-actor-profile', 'mobile', 'expression-casting-actor-profile', 'PORTRAIT-HEAVY · ACTOR PROFILE', ['casting-actor-profile']],
  ['portrait-role-detail', 'mobile', 'expression-casting-role-detail', 'PORTRAIT ROWS · ROLE DETAIL (rows never sliced)', ['casting-role-current', 'casting-role-matches']],
  ['ui-screenshot-jurnl', 'mobile', 'design-jurnl-brand', 'UI SCREENSHOT · JURNL DESIGN TABLE (approved F01 screens)', ['design-table']],
  ['logo-identity-desktop', 'desktop', 'design-brand', 'LOGO / IDENTITY · DESIGN OVERVIEW MARK', ['design-overview']],
  ['authority-look', 'mobile', 'expression-look', 'REFERENCE / AUTHORITY · LOOK ROOT', ['look-root-active']],
  ['authority-inbox-detail', 'mobile', 'inbox-decision-detail', 'REFERENCE / AUTHORITY · INBOX DECISION DETAIL', ['inbox-detail-card']],
  ['authority-milestone', 'mobile', 'activity-milestone-look', 'REFERENCE / AUTHORITY · ACTIVITY MILESTONE', []],
  ['authority-inbox-detail-tablet', 'tablet', 'inbox-decision-detail', 'REFERENCE / AUTHORITY · INBOX DECISION CARD · TABLET (no mobile stacking; art column at the PREVIEW floor)', ['inbox-detail-card']],
  ['authority-milestone-tablet', 'tablet', 'activity-milestone-look', 'REFERENCE / AUTHORITY · ACTIVITY MILESTONE · TABLET', []],
  ['frames-storyboard', 'mobile', 'expression-storyboard', 'VIDEO FRAMES · STORYBOARD ROOT', ['storyboard-root-boards', 'storyboard-inspector']],
  ['landscape-library', 'mobile', 'library', 'LANDSCAPE / SCENE NODE ART · LIBRARY STRIPS', ['library-recent', 'library-lineage-flow']],
  ['inbox-root', 'mobile', 'inbox', 'INBOX ROOT · FOCUS CARD + INCOMING CARDS', ['inbox-focus', 'inbox-incoming']],
  ['hub-control', 'mobile', 'hub', 'HUB · AUTHORITY (pixel-identical)', []],
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function notes(rep, vp, route, focus) {
  const els = rep.elements.filter((e) => e.viewport === vp && e.route === route && (!focus.length || focus.includes(e.panel)));
  const seen = new Map();
  for (const e of els) {
    const k = `${e.panel ?? '—'}|${e.role}|${e.scale}|${e.fit ?? '—'}|${e.cropId ?? '—'}`;
    const fail = e.codes.filter((c) => !['UNCLASSIFIED'].includes(c));
    const prev = seen.get(k) ?? { e, n: 0, codes: new Set(), minAxis: 1 };
    prev.n++;
    fail.forEach((c) => prev.codes.add(c));
    prev.minAxis = Math.min(prev.minAxis, e.minAxis);
    seen.set(k, prev);
  }
  return [...seen.values()].slice(0, 7).map(({ e, n, codes, minAxis }) => {
    const crop = e.cropped ? `crop ${Math.round(minAxis * 100)}% kept` : 'whole source';
    const why = codes.size ? [...codes].join(' · ') : e.cropped ? `crop allowed: ${e.cropId}` : 'no crop';
    return `${(e.panel ?? '').toUpperCase().slice(0, 28)} · ${e.role} · ${e.scale} · ${e.fit ?? 'role default'} · ${e.panelMode ?? '—'} ×${n} — ${crop} — ${why}`;
  });
}

const W = { mobile: 393, tablet: 560, desktop: 640 };
const label = (text, w, h = 30, size = 13, bg = '#111114') =>
  Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${bg}"/><text x="12" y="${h / 2 + size / 3}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" letter-spacing="1.2" fill="#ffffff">${esc(text)}</text></svg>`);
const notesSvg = (title, lines, w, h) => {
  const body = lines
    .map((l, i) => {
      const words = l.split(' — ');
      return `<text x="14" y="${70 + i * 58}" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#111114">${esc(words[0])}</text><text x="14" y="${88 + i * 58}" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="${/FAIL|CROP_|SLICE|CLIP|LEGIB/.test(words.slice(1).join(' ')) ? '#c8161b' : '#1d7a43'}">${esc(words.slice(1).join(' — '))}</text>`;
    })
    .join('');
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/><text x="14" y="30" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.2" fill="#111114">${esc(title)}</text>${body}</svg>`);
};

const manifest = [];
for (const [id, vp, route, title, focus] of BOARD) {
  const bShot = `${beforeDir}/${vp}/${route}.png`;
  const aShot = `${afterDir}/${vp}/${route}.png`;
  if (!existsSync(bShot) || !existsSync(aShot)) {
    console.log('skip', id);
    continue;
  }
  const cw = W[vp] ?? 393;
  const [bb, ab] = await Promise.all([bShot, aShot].map((p) => sharp(p).resize({ width: cw }).png().toBuffer()));
  const h = Math.max((await sharp(bb).metadata()).height, (await sharp(ab).metadata()).height);
  const nw = 560;
  const bl = notes(B, vp, route, focus);
  const al = notes(A, vp, route, focus);
  const nh = Math.max(h, 120 + 58 * Math.max(bl.length, al.length) * 2);
  const total = cw * 2 + nw + 24;
  await sharp({ create: { width: total, height: nh + 64, channels: 3, background: '#f4f4f6' } })
    .composite([
      { input: label(`${title} — ${vp.toUpperCase()}`, total, 34, 14), top: 0, left: 0 },
      { input: label('BEFORE · main', cw, 30, 12, '#5a5a62'), top: 34, left: 0 },
      { input: label('AFTER · this sprint', cw, 30, 12, '#c8161b'), top: 34, left: cw + 12 },
      { input: bb, top: 64, left: 0 },
      { input: ab, top: 64, left: cw + 12 },
      { input: notesSvg('BEFORE — ROLE · SCALE · FIT · PANEL MODE', bl, nw, Math.floor(nh / 2)), top: 64, left: cw * 2 + 24 },
      { input: notesSvg('AFTER — ROLE · SCALE · FIT · PANEL MODE', al, nw, Math.ceil(nh / 2)), top: 64 + Math.floor(nh / 2), left: cw * 2 + 24 },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`${outDir}/boards/${id}.jpg`);
  mkdirSync(`${outDir}/before`, { recursive: true });
  mkdirSync(`${outDir}/after`, { recursive: true });
  await sharp(bb).jpeg({ quality: 78, mozjpeg: true }).toFile(`${outDir}/before/${id}.jpg`);
  await sharp(ab).jpeg({ quality: 78, mozjpeg: true }).toFile(`${outDir}/after/${id}.jpg`);
  manifest.push({ id, title, viewport: vp, route, board: `screenshots/boards/${id}.jpg`, before: { shot: `screenshots/before/${id}.jpg`, notes: bl }, after: { shot: `screenshots/after/${id}.jpg`, notes: al } });
  console.log('board', id);
}
writeFileSync(`${outDir}/boards/index.json`, `${JSON.stringify(manifest, null, 2)}\n`);
