#!/usr/bin/env node
/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — before / after report.
 *
 * Reads two density-audit.mjs outputs (before = current main, after = this branch) and writes the QA artifacts:
 * HUB type authority (measured), root-tab QA, child-page QA, child-page density audit, media component audit and
 * the screenshot manifest. Thresholds come from the shared contract (HUB tiers, deviation limit 1.15).
 *
 *   node scripts/production-workspace/density-report.mjs <before/audit.json> <after/audit.json> <outDir> <shotsRel>
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { CHILD_PAGES } from './density-routes.mjs';

const [beforePath, afterPath, outDir, shotsRel = 'screenshots'] = process.argv.slice(2);
const before = JSON.parse(readFileSync(beforePath, 'utf8'));
const after = JSON.parse(readFileSync(afterPath, 'utf8'));
mkdirSync(outDir, { recursive: true });
const PIXEL_DIFF = existsSync(`${outDir}/${shotsRel}/pixel-diff.json`) ? JSON.parse(readFileSync(`${outDir}/${shotsRel}/pixel-diff.json`, 'utf8')) : {};
const SHEETS = existsSync(`${outDir}/${shotsRel}/sheets/index.json`) ? JSON.parse(readFileSync(`${outDir}/${shotsRel}/sheets/index.json`, 'utf8')) : {};
/** A capture lives in a contact sheet: `<sheet>#<state>:<before|after>`; region in SITE00_WORKSPACE_SCREENSHOT_MANIFEST.json. */
const shot = (label, s) => {
  const id = s.replace(/\.png$/, '');
  const e = SHEETS[id];
  return e ? `${shotsRel}/${e.sheet}#${id.split('/')[1]}:${label}` : null;
};
const region = (label, s) => SHEETS[s.replace(/\.png$/, '')]?.[label] ?? null;

const ARTBOARD = { mobile: 1125, tablet: 1792, desktop: 2000 };
const SCALE = {
  mobile: { T0: [17, 6.5], T1: [19, 7], T2: [19, 7], T3: [24, 8.5], T4: [28, 9.5], T5: [38, 12], T6: [58, 18], METRIC: [34, 11] },
  tablet: { T0: [18.5, 8], T1: [19, 8.5], T2: [22, 9.5], T3: [28, 11], T4: [28, 12], T5: [50, 20], T6: [74, 30], METRIC: [38, 16] },
  desktop: { T0: [16.5, 10], T1: [17, 10.5], T2: [20, 12], T3: [24, 14], T4: [26, 15], T5: [44, 24], T6: [66, 36], METRIC: [34, 20] },
};
const LIMIT = 1.15;
/** Mobile frame changes that are intentional density decisions (component class → reason). Anything else that
 * changes its frame aspect by more than 12% is reported as UNEXPLAINED (an accidental crush). */
const FRAME_INTENT = {
  'experience|bg:pxa-hero__bg': 'EXPERIENCE root fits one screen: the world plate flexes into the space above the panel (min = HUB hero × 1.6)',
  'expression|bg:pxa-hero__bg': 'EXPRESSION root hero band → HUB hero height × 1.3 (copy on a wash)',
  'library|bg:pxa-vault__bg': 'LIBRARY vault hero → HUB gutter + HUB hero band height',
  'library-collection-open|bg:pxa-vault__bg': 'LIBRARY vault hero → HUB gutter + HUB hero band height',
  'library|bg:pxa-thumb': 'LIBRARY recent / most-used strips: 16:9 frame instead of a 2.2:1 sliver (subject kept)',
  'library|img:ph-img': 'LIBRARY recent / most-used strips: 16:9 frame instead of a 2.2:1 sliver (subject kept)',
  'library-collection-open|bg:pxa-thumb': 'LIBRARY recent / most-used strips: 16:9 frame instead of a 2.2:1 sliver (subject kept)',
  'library-collection-open|img:ph-img': 'LIBRARY recent / most-used strips: 16:9 frame instead of a 2.2:1 sliver (subject kept)',
  'activity|bg:iax-hero__plate': 'ACTIVITY hero band → HUB hero height × 1.2',
  'activity-approvals|bg:iax-hero__plate': 'ACTIVITY hero band → HUB hero height × 1.2',
};
/** Decorative composition layers (environment art, the DESIGN chamber core, stage glyphs): not media panels. */
const DECORATIVE = ['pxa-chamber__atrium-art', 'img:pxa-core', 'img:pxa-vis', 'img:pxa-stage'];
const tierPx = (family, tier, width) => {
  const [au, floor] = SCALE[family][tier];
  return Math.max(floor, (au * Math.min(width, 2200)) / ARTBOARD[family]);
};
const r2 = (n) => Math.round(n * 100) / 100;
const isNumeric = (s) => /^[\d\s/%.+\-–·]+$/.test(s.trim());
const isGlyph = (s) => /^[›‹→←+×·…|>]+$/.test(s.trim());

/** Role of a measured text layer (heading tags + a few class hints; everything else is body / control / label). */
function role(t) {
  if (isGlyph(t.text)) return 'glyph';
  if (isNumeric(t.text) && t.fs >= 10) return 'metric';
  if (t.tag === 'h1') return 'page-title';
  if (t.tag === 'h2' || t.tag === 'h3' || t.tag === 'strong' || /head__title|__title|-head/.test(t.cls)) return 'section-title';
  if (/^(button|a|input|select)$/.test(t.tag) || /btn|tab|chip|cta|capsule|lens/.test(t.cls)) return 'control';
  if (t.tag === 'small' || t.tag === 'time' || t.tag === 'dt' || t.tag === 'em') return 'label';
  return 'body';
}
/** HUB-equivalent ceiling for a role (root tabs may carry one display title; child pages top out at T5). */
function ceiling(family, kind, r, width) {
  const t = (tier) => tierPx(family, tier, width);
  switch (r) {
    case 'page-title':
      return kind === 'root' ? t('T6') : t('T5');
    case 'section-title':
      return t('T5');
    case 'metric':
      return t('METRIC');
    case 'control':
    case 'body':
      return t('T4');
    case 'label':
      return t('T3');
    default:
      return Infinity;
  }
}
/** Child states that are LENSES of a root tab (same root hero, e.g. ACTIVITY ?view=approvals) keep the root's
 * display title: their page-title ceiling is the root one (T6), recorded as an explicit exception. */
const ROOT_LENS = new Set(CHILD_PAGES.filter((c) => c.rootLens).map((c) => c.id));
const kindFor = (row) => (ROOT_LENS.has(row.id) ? 'root' : row.kind);
function oversized(row) {
  return row.text.filter((t) => {
    const r = role(t);
    return t.fs > ceiling(row.family, kindFor(row), r, row.viewport.w) * LIMIT;
  });
}
function layer(row, r, pick = Math.max) {
  const v = row.text.filter((t) => role(t) === r).map((t) => t.fs);
  return v.length ? r2(pick(...v)) : null;
}
const median = (...v) => {
  const s = [...v].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const key = (r) => `${r.family}:${r.id}`;
const byKey = (rows) => new Map(rows.map((r) => [key(r), r]));
const B = byKey(before);
const A = byKey(after);

const textClips = (row) => row.text.filter((t) => t.clipped || t.outOfParent).length;
const mediaUndeclared = (row) => row.media.filter((m) => !m.slot).length;
const mediaCropNoSlot = (row) =>
  row.media.filter((m) => {
    if (m.slot || !m.natural || !m.natural.h) return false;
    const rendered = m.rect.w / Math.max(1, m.rect.h);
    const nat = m.natural.w / m.natural.h;
    return Math.abs(rendered - nat) / nat > 0.05 && !/contain/.test(m.fit);
  }).length;
const mediaClip = (row) => row.media.filter((m) => m.clipFrac < 0.97 && !m.overflowsViewport).length;
const distorted = (row) => row.media.filter((m) => m.distorted).length;
const broken = (row) => row.media.filter((m) => m.broken).length;
const sourceDriven = (row) => row.media.filter((m) => m.sourceDriven).length;

function summary(row) {
  if (!row) return null;
  const over = oversized(row);
  return {
    pageTitle: layer(row, 'page-title'),
    sectionTitle: layer(row, 'section-title'),
    body: layer(row, 'body', median),
    label: layer(row, 'label', median),
    control: layer(row, 'control', median),
    metric: layer(row, 'metric'),
    maxText: r2(Math.max(0, ...row.text.filter((t) => !isGlyph(t.text)).map((t) => t.fs))),
    contentScreens: r2(row.scroll.height / row.scroll.client),
    oversizedLayers: over.length,
    oversizedSamples: [...new Set(over.map((t) => `${t.tag}${t.cls ? '.' + t.cls : ''} ${r2(t.fs)}px "${t.text.slice(0, 24)}"`))].slice(0, 6),
    textClips: textClips(row),
    horizontalOverflow: row.overflowCount + (row.docOverflowX ? 1 : 0),
    media: row.media.length,
    mediaUndeclared: mediaUndeclared(row),
    mediaCropWithoutSlot: mediaCropNoSlot(row),
    mediaAncestorClip: mediaClip(row),
    mediaDistorted: distorted(row),
    mediaBroken: broken(row),
    mediaSourceDriven: sourceDriven(row),
    errors: row.errors.length,
  };
}

const families = ['mobile', 'tablet', 'desktop'];
const TYPE_KEYS = ['pageTitle', 'sectionTitle', 'body', 'label', 'control', 'metric', 'maxText', 'contentScreens', 'textClips', 'horizontalOverflow', 'media'];
function qa(kind) {
  const out = [];
  for (const family of families) {
    for (const a of after.filter((r) => r.family === family && r.kind === kind)) {
      const b = B.get(key(a));
      const sb = summary(b);
      const sa = summary(a);
      const hub = summary(A.get(`${family}:hub`));
      const pass = sa.oversizedLayers === 0 && sa.horizontalOverflow === 0 && sa.mediaDistorted === 0 && sa.mediaBroken === 0 && sa.mediaSourceDriven === 0;
      out.push({
        family,
        id: a.id,
        tab: a.tab,
        route: a.route,
        hubReference: kind === 'root' && hub ? { pageTitle: hub.pageTitle, sectionTitle: hub.sectionTitle, body: hub.body, label: hub.label, control: hub.control, metric: hub.metric } : undefined,
        before: sb,
        after: sa,
        verdict:
          a.id === 'hub' ?
            a.shots.every((s) => PIXEL_DIFF[s.replace(/\.png$/, '')] === 0) && TYPE_KEYS.every((k) => JSON.stringify(sb?.[k]) === JSON.stringify(sa[k])) ?
              'PASS (UNCHANGED AUTHORITY — pixel-identical)'
            : 'CHECK'
          : pass ? 'PASS'
          : family !== 'mobile' && a.shots.every((s) => PIXEL_DIFF[s.replace(/\.png$/, '')] === 0) ? 'UNCHANGED (regression target, pixel-identical to main)'
          : 'PARTIAL',
        rootLens: ROOT_LENS.has(a.id) || undefined,
        screenshots: {
          before: family === 'mobile' ? (b?.shots ?? []).map((s) => shot('before', s)) : 'pixel-identical to after (see pixelDiff)',
          after: a.shots.map((s) => shot('after', s)),
          pixelDiff: Object.fromEntries(a.shots.map((s) => [s, PIXEL_DIFF[s.replace(/\.png$/, '')] ?? null])),
        },
      });
    }
  }
  return out;
}

const root = qa('root');
const child = qa('child');
writeFileSync(`${outDir}/SITE00_WORKSPACE_ROOT_TAB_QA.json`, JSON.stringify({ sprint: 'P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1', deviationLimit: LIMIT, rows: root }, null, 2));
writeFileSync(`${outDir}/SITE00_WORKSPACE_CHILD_PAGE_QA.json`, JSON.stringify({ sprint: 'P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1', deviationLimit: LIMIT, rows: child }, null, 2));

// child-page density audit: per child, mobile before/after layer sizes vs the HUB ceiling
const childAudit = child
  .filter((c) => c.family === 'mobile')
  .map((c) => ({
    id: c.id,
    tab: c.tab,
    route: c.route,
    ceilingPx: { pageTitle: r2(tierPx('mobile', 'T5', 393)), sectionTitle: r2(tierPx('mobile', 'T5', 393)), bodyControl: r2(tierPx('mobile', 'T4', 393)), label: r2(tierPx('mobile', 'T3', 393)), metric: r2(tierPx('mobile', 'METRIC', 393)) },
    before: { pageTitle: c.before?.pageTitle, sectionTitle: c.before?.sectionTitle, body: c.before?.body, control: c.before?.control, maxText: c.before?.maxText, oversizedLayers: c.before?.oversizedLayers, samples: c.before?.oversizedSamples },
    after: { pageTitle: c.after.pageTitle, sectionTitle: c.after.sectionTitle, body: c.after.body, control: c.after.control, maxText: c.after.maxText, oversizedLayers: c.after.oversizedLayers, samples: c.after.oversizedSamples },
  }));
writeFileSync(`${outDir}/SITE00_WORKSPACE_CHILD_PAGE_DENSITY_AUDIT.json`, JSON.stringify(childAudit, null, 2));

// HUB measured type authority (mobile / tablet / desktop): each tier's token value and the HUB layers that render it
const hubAuthority = {};
for (const family of families) {
  const hub = A.get(`${family}:hub`);
  if (!hub) continue;
  const w = hub.viewport.w;
  const tiers = {};
  for (const tier of Object.keys(SCALE[family])) {
    const px = r2(tierPx(family, tier, w));
    const layers = [...new Set(hub.text.filter((t) => Math.abs(t.fs - px) < 0.35 && !isGlyph(t.text)).map((t) => `${t.tag}${t.cls ? '.' + t.cls : ''} "${t.text.slice(0, 22)}"`))].slice(0, 5);
    tiers[tier] = { tokenPx: px, authorityUnits: SCALE[family][tier][0], floorPx: SCALE[family][tier][1], hubLayers: layers };
  }
  hubAuthority[family] = { viewport: hub.viewport, tiers, distinctSizes: [...new Set(hub.text.map((t) => r2(t.fs)))].sort((a, b) => a - b), contentScreens: r2(hub.scroll.height / hub.scroll.client) };
}
writeFileSync(`${outDir}/SITE00_WORKSPACE_HUB_TYPE_AUTHORITY.json`, JSON.stringify({ source: 'live computed styles at 393x852 / 834x1194 / 1440x900 (density-audit.mjs)', hub: hubAuthority }, null, 2));

// media component audit: one record per media component class (mobile), before → after; frames compared PER ROUTE
const mediaKey = (m) => `${m.kind}:${m.cls || m.parentCls || '(none)'}`;
const comp = new Map();
for (const [label, rows] of [
  ['before', before],
  ['after', after],
]) {
  for (const r of rows.filter((x) => x.family === 'mobile')) {
    for (const m of r.media) {
      const k = mediaKey(m);
      const e = comp.get(k) ?? { component: k, routes: new Set(), before: null, after: null, frames: new Map() };
      e.routes.add(r.id);
      const rec = {
        slot: m.slot ?? 'UNDECLARED',
        fitMode: m.fitMode ?? 'UNDECLARED',
        cssFit: m.fit,
        focal: m.position,
        rect: `${m.rect.w}x${m.rect.h}`,
        natural: m.natural ? `${m.natural.w}x${m.natural.h}` : null,
        ancestorClip: m.clipFrac < 0.97 ? `${m.clipFrac}@${m.clipBy}` : 'none',
        distorted: m.distorted,
        sourceDriven: m.sourceDriven,
      };
      if (!e[label]) e[label] = rec;
      const f = e.frames.get(r.id) ?? {};
      if (!f[label]) f[label] = rec.rect;
      e.frames.set(r.id, f);
      comp.set(k, e);
    }
  }
}
const aspectOf = (rect) => {
  const [w, h] = rect.split('x').map(Number);
  return h ? w / h : null;
};
const mediaAudit = [...comp.values()].map((e) => {
  const frameChanges = [...e.frames.entries()]
    .filter(([, f]) => f.before && f.after)
    .map(([route, f]) => ({ route, before: f.before, after: f.after, aspectChange: Math.round((Math.abs(aspectOf(f.after) - aspectOf(f.before)) / aspectOf(f.before)) * 1000) / 1000 }))
    .filter((f) => f.aspectChange > 0.12)
    .map((f) => ({ ...f, intent: Object.entries(FRAME_INTENT).find(([k]) => `${f.route}|${e.component}`.includes(k))?.[1] ?? 'UNEXPLAINED' }));
  return {
    component: e.component,
    routes: [...e.routes],
    current_slot: e.before?.slot ?? null,
    current_fit: e.before?.cssFit ?? null,
    current_overflow: e.before?.ancestorClip ?? null,
    new_slot: e.after?.slot ?? null,
    new_fit: e.after?.fitMode ?? null,
    frame_owner: !e.after ? null : /pw-media/.test(e.component) ? 'SLOT' : 'COMPOSITION',
    frame_changes: frameChanges,
    focal_behavior: e.after?.focal ?? null,
    responsive_behavior: e.after ? `${e.after.rect} frame at 393 (source ${e.after.natural ?? 'n/a'}); fit ${e.after.cssFit}` : null,
    status:
      !e.after ? 'NOT RENDERED AFTER'
      : e.after.slot !== 'UNDECLARED' ? 'DECLARED'
      : DECORATIVE.some((d) => e.component.includes(d)) ? 'COMPOSITION ART (decorative layer, not a media panel)'
      : 'COMPOSITION-OWNED (fit declared by tab CSS)',
  };
});
writeFileSync(`${outDir}/SITE00_WORKSPACE_MEDIA_COMPONENT_AUDIT.json`, JSON.stringify(mediaAudit, null, 2));

// screenshot manifest
const manifest = [];
for (const [label, rows] of [
  ['before', before],
  ['after', after],
])
  for (const r of rows)
    for (const s of r.shots)
      manifest.push({
        state: label,
        family: r.family,
        id: r.id,
        kind: r.kind,
        route: r.route,
        file: label === 'before' && r.family !== 'mobile' ? null : shot(label, s),
        region: label === 'before' && r.family !== 'mobile' ? undefined : region(label, s),
        note: label === 'before' && r.family !== 'mobile' ? `not stored: pixel diff vs after ${PIXEL_DIFF[s.replace(/\.png$/, '')] ?? 'n/a'}%` : undefined,
        pixelDiffPct: PIXEL_DIFF[s.replace(/\.png$/, '')] ?? null,
        viewport: `${r.viewport.w}x${r.viewport.h}`,
      });
writeFileSync(`${outDir}/SITE00_WORKSPACE_SCREENSHOT_MANIFEST.json`, JSON.stringify(manifest, null, 2));

// console totals for the completion report
const tot = (rows, fn) => rows.reduce((n, r) => n + fn(r), 0);
const fam = (rows, f) => rows.filter((r) => r.family === f);
const rootTitleTabs = (rows, f) =>
  fam(rows, f).filter((r) => r.kind === 'root' && r.id !== 'hub' && r.text.some((t) => ['page-title', 'section-title'].includes(role(t)) && t.fs > ceiling(f, 'root', role(t), r.viewport.w) * LIMIT)).length;
const totals = {};
for (const f of families) {
  totals[f] = {
    oversizedRootTitleTabsBefore: rootTitleTabs(before, f),
    oversizedRootTitleTabsAfter: rootTitleTabs(after, f),
    oversizedRootLayersBefore: tot(fam(before, f).filter((r) => r.kind === 'root'), (r) => oversized(r).length),
    oversizedRootLayersAfter: tot(fam(after, f).filter((r) => r.kind === 'root'), (r) => oversized(r).length),
    oversizedChildLayersBefore: tot(fam(before, f).filter((r) => r.kind === 'child'), (r) => oversized(r).length),
    oversizedChildLayersAfter: tot(fam(after, f).filter((r) => r.kind === 'child'), (r) => oversized(r).length),
    textClipsBefore: tot(fam(before, f), textClips),
    textClipsAfter: tot(fam(after, f), textClips),
    mediaBefore: tot(fam(before, f), (r) => r.media.length),
    mediaAfter: tot(fam(after, f), (r) => r.media.length),
    mediaUndeclaredBefore: tot(fam(before, f), mediaUndeclared),
    mediaUndeclaredAfter: tot(fam(after, f), mediaUndeclared),
    mediaCropWithoutSlotBefore: tot(fam(before, f), mediaCropNoSlot),
    mediaCropWithoutSlotAfter: tot(fam(after, f), mediaCropNoSlot),
    mediaAncestorClipBefore: tot(fam(before, f), mediaClip),
    mediaAncestorClipAfter: tot(fam(after, f), mediaClip),
    distortedAfter: tot(fam(after, f), distorted),
    brokenAfter: tot(fam(after, f), broken),
    sourceDrivenAfter: tot(fam(after, f), sourceDriven),
    horizontalOverflowAfter: tot(fam(after, f), (r) => r.overflowCount + (r.docOverflowX ? 1 : 0)),
    errorsAfter: tot(fam(after, f), (r) => r.errors.length),
  };
}
totals.mediaComponents = mediaAudit.length;
totals.frameChangesIntentional = mediaAudit.flatMap((m) => m.frame_changes.filter((f) => f.intent !== 'UNEXPLAINED').map((f) => `${f.route} ${m.component} ${f.before} → ${f.after}`));
totals.frameChangesUnexplained = mediaAudit.flatMap((m) => m.frame_changes.filter((f) => f.intent === 'UNEXPLAINED').map((f) => `${f.route} ${m.component} ${f.before} → ${f.after}`));
totals.mediaUndeclaredAfterByComponent = mediaAudit.filter((m) => m.new_slot === 'UNDECLARED').map((m) => `${m.component} — ${m.status}`);
writeFileSync(`${outDir}/SITE00_WORKSPACE_QA_TOTALS.json`, JSON.stringify(totals, null, 2));
console.log(JSON.stringify(totals, null, 2));
