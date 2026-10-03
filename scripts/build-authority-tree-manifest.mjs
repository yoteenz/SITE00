#!/usr/bin/env node
/** Builds artifacts/production-authority-tree/nodes.manifest.json (COMPOSER1). */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const ART = path.join(ROOT, 'artifacts/production-authority-tree');
fs.mkdirSync(ART, { recursive: true });
fs.mkdirSync(path.join(ART, 'tabs'), { recursive: true });

const baseSha = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const slug = 'ndxbook';

const V = 'mobile,tablet,desktop';
const ALL = 'mobile,mobile-xl,tablet,desktop';

function n(partial) {
  return {
    deviationAllowed: 'no',
    staleFallbackRisk: 'low',
    founderReview: 'no',
    inheritedVisual: 'ProductionAuthorityFrame (.pxa)',
    authoritySource: 'inherited parent',
    viewports: V,
    kind: 'route',
    ...partial,
  };
}

const nodes = [];

// —— SHELL ——
nodes.push(
  n({ id: 'shell-frame', parent: 'PRODUCTION', kind: 'section', trigger: 'mount on all authority tabs', status: 'REFERENCE_LOCKED', authoritySource: 'approved generated authority + live implementation', notes: 'Portal to body; locks scroll; hosts header/nav.' }),
  n({ id: 'shell-header-mobile', parent: 'shell-frame', kind: 'section', trigger: 'viewport <700px', viewports: 'mobile,mobile-xl', status: 'STRUCTURALLY_CORRECT_VISUALLY_WRONG', inheritedVisual: 'ph-top (864-space scaled)', authoritySource: 'legacy locked 864 canvas', deviationAllowed: 'no', staleFallbackRisk: 'high', notes: '34px strip vs authority ~57px — shared with hub machine, CF, design overlay.' }),
  n({ id: 'shell-header-host', parent: 'shell-frame', kind: 'section', trigger: 'viewport ≥700px', viewports: 'tablet,desktop', status: 'REFERENCE_LOCKED', inheritedVisual: 'pxh-top', authoritySource: 'live implementation' }),
  n({ id: 'shell-bottom-nav', parent: 'shell-frame', kind: 'section', trigger: 'persistent 7-tab nav', status: 'REFERENCE_LOCKED', notes: 'HUB INBOX DESIGN EXPERIENCE EXPRESSION LIBRARY ACTIVITY' }),
  n({ id: 'shell-nav-inbox-badge', parent: 'shell-bottom-nav', kind: 'interaction', trigger: 'attention queue count', status: 'REFERENCE_LOCKED' }),
);

// —— HUB ——
nodes.push(
  n({ id: 'hub-root', parent: 'HUB', trigger: '/production', status: 'REFERENCE_LOCKED', authoritySource: 'founder reference + Grok1 hub crystal plate' }),
  n({ id: 'hub-hero', parent: 'hub-root', kind: 'section', trigger: 'AuthorityHero crystal chamber', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-status-bar', parent: 'hub-root', kind: 'section', trigger: 'LiveStatusBar', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-overview', parent: 'hub-root', kind: 'section', trigger: 'project overview cards', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-entries', parent: 'hub-root', kind: 'section', trigger: 'ENTRY 002 rail + expression links', status: 'REFERENCE_LOCKED', notes: 'Entry 002 OH NOW IT WAS FUN subject canon.' }),
  n({ id: 'hub-components', parent: 'hub-root', kind: 'section', trigger: 'production graph nodes', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-operations', parent: 'hub-root', kind: 'section', trigger: 'attention → queue', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-operations-empty', parent: 'hub-operations', kind: 'section', trigger: 'no attention items', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-activity-preview', parent: 'hub-root', kind: 'section', trigger: 'recent activity strip', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-activity-empty', parent: 'hub-activity-preview', kind: 'section', trigger: 'no activity', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-open-machine', parent: 'hub-root', kind: 'interaction', trigger: 'Link ?view=machine', status: 'REFERENCE_LOCKED' }),
  n({ id: 'hub-machine', parent: 'HUB', kind: 'temporary', trigger: '/production?view=machine | panel | node | scene query', status: 'LEGACY_LOCKED', inheritedVisual: 'ProductionHub 864-space', authoritySource: 'legacy locked surface', staleFallbackRisk: 'critical', founderReview: 'yes', notes: 'Whole-project machine view — not Entry 002 disguised; do not redesign in tree sprint.' }),
);

// —— INBOX ——
nodes.push(
  n({ id: 'inbox-root', parent: 'INBOX', trigger: '/production/queue', status: 'REFERENCE_LOCKED', authoritySource: 'founder reference inbox plate' }),
  n({ id: 'inbox-tab-needs', parent: 'inbox-root', kind: 'interaction', trigger: 'tab needs', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-tab-watching', parent: 'inbox-root', kind: 'interaction', trigger: 'tab watching', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-tab-resolved', parent: 'inbox-root', kind: 'interaction', trigger: 'tab resolved', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-attention-detail', parent: 'inbox-root', kind: 'section', trigger: 'founder gate / approval card', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-approve', parent: 'inbox-attention-detail', kind: 'interaction', trigger: 'APPROVE button', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-revision', parent: 'inbox-attention-detail', kind: 'interaction', trigger: 'REQUEST REVISION', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-decision-note', parent: 'inbox-root', kind: 'temporary', trigger: 'post-decision footnote', status: 'PARTIAL', notes: 'Inline note not toast system.' }),
  n({ id: 'inbox-queue-list', parent: 'inbox-root', kind: 'section', trigger: 'queued requests', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-empty-needs', parent: 'inbox-root', kind: 'section', trigger: 'empty needs tab', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-watching-list', parent: 'inbox-root', kind: 'section', trigger: 'in-progress requests', status: 'REFERENCE_LOCKED' }),
  n({ id: 'inbox-resolved-feed', parent: 'inbox-root', kind: 'section', trigger: 'activity-derived resolved', status: 'REFERENCE_LOCKED' }),
);

// —— LIBRARY ——
const libCats = ['AUTHORITIES', 'ASSETS', 'CHARACTERS', 'ENVIRONMENTS', 'EXPRESSIONS', 'REFERENCES', 'ICONS', 'MATERIALS', 'DOCUMENTS', 'ARCHIVE'];
nodes.push(n({ id: 'library-root', parent: 'LIBRARY', trigger: '/production/libraries', status: 'REFERENCE_LOCKED', authoritySource: 'founder reference library vault' }));
for (const c of libCats) {
  nodes.push(n({ id: `library-category-${c.toLowerCase()}`, parent: 'library-root', kind: 'section', trigger: `category ${c}`, status: c === 'ARCHIVE' ? 'PARTIAL' : 'REFERENCE_LOCKED' }));
}
nodes.push(
  n({ id: 'library-canon-tabs', parent: 'library-root', kind: 'interaction', trigger: 'CANONICAL|IN REVIEW|SUPERSEDED|ARCHIVE', status: 'REFERENCE_LOCKED' }),
  n({ id: 'library-canon-detail', parent: 'library-root', kind: 'section', trigger: 'canonical vault hero + lineage', status: 'REFERENCE_LOCKED' }),
  n({ id: 'library-collections', parent: 'library-root', kind: 'section', trigger: 'COLLECTIONS list', status: 'REFERENCE_LOCKED' }),
  n({ id: 'library-collection-panel', parent: 'library-collections', kind: 'temporary', trigger: 'expand collection row', status: 'REFERENCE_LOCKED' }),
  n({ id: 'library-recent', parent: 'library-root', kind: 'section', trigger: 'recent assets strip', status: 'REFERENCE_LOCKED' }),
  n({ id: 'library-empty-review', parent: 'library-root', kind: 'section', trigger: 'non-canonical empty', status: 'REFERENCE_LOCKED' }),
);

// —— ACTIVITY ——
nodes.push(
  n({ id: 'activity-root', parent: 'ACTIVITY', trigger: '/production/activity', status: 'REFERENCE_LOCKED', authoritySource: 'founder reference activity log' }),
  n({ id: 'activity-hero', parent: 'activity-root', kind: 'section', trigger: 'hub crystal atmosphere', status: 'REFERENCE_LOCKED' }),
  n({ id: 'activity-filters', parent: 'activity-root', kind: 'interaction', trigger: 'workspace filter chips', status: 'REFERENCE_LOCKED' }),
  n({ id: 'activity-log-row', parent: 'activity-root', kind: 'section', trigger: 'event row expand', status: 'REFERENCE_LOCKED' }),
  n({ id: 'activity-empty', parent: 'activity-root', kind: 'section', trigger: 'no rows after filter', status: 'REFERENCE_LOCKED' }),
);

// —— DESIGN ——
const modes = ['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'];
nodes.push(n({ id: 'design-root', parent: 'DESIGN', trigger: `/production/${slug}/design?mode=*`, status: 'REFERENCE_LOCKED', authoritySource: 'six mode reference plates + Grok1 chamber art' }));
nodes.push(n({ id: 'design-mode-bar', parent: 'design-root', kind: 'interaction', trigger: 'DesignModeBar 6 links', status: 'REFERENCE_LOCKED' }));
for (const m of modes) {
  nodes.push(n({ id: `design-mode-${m}`, parent: 'design-root', kind: 'section', trigger: `?mode=${m}`, status: m === 'viewport' ? 'REFERENCE_LOCKED' : 'REFERENCE_LOCKED', authoritySource: 'production-authority-registry design-' + m }));
}
nodes.push(
  n({ id: 'design-chamber-boards', parent: 'design-root', kind: 'section', trigger: 'floating board panels', status: 'REFERENCE_LOCKED' }),
  n({ id: 'design-pipeline', parent: 'design-root', kind: 'section', trigger: 'pipeline strip', status: 'REFERENCE_LOCKED' }),
  n({ id: 'design-on-your-table', parent: 'design-root', kind: 'section', trigger: 'ON YOUR TABLE cards', status: 'REFERENCE_LOCKED' }),
  n({ id: 'design-viewport-stage', parent: 'design-mode-viewport', kind: 'section', trigger: 'device frame + iframe', status: 'REFERENCE_LOCKED' }),
  n({ id: 'design-viewport-zoom', parent: 'design-mode-viewport', kind: 'interaction', trigger: 'FIT|50|75|100', status: 'REFERENCE_LOCKED' }),
  n({ id: 'design-viewport-safe', parent: 'design-mode-viewport', kind: 'interaction', trigger: 'safe area toggle', status: 'REFERENCE_LOCKED' }),
  n({ id: 'design-viewport-target-select', parent: 'design-mode-viewport', kind: 'interaction', trigger: 'device target dropdown', status: 'REFERENCE_LOCKED' }),
  n({ id: 'design-validation-sheet-link', parent: 'design-mode-viewport', kind: 'interaction', trigger: 'link → design/workspace', status: 'PARTIAL', notes: 'Hands off to twin-opus bench overlay.' }),
);

const designChildren = ['workspace', 'references', 'assets', 'pages', 'skins', 'history', 'more'];
for (const d of designChildren) {
  const st = d === 'workspace' ? 'STRUCTURALLY_CORRECT_VISUALLY_WRONG' : 'REFERENCE_LOCKED';
  nodes.push(n({
    id: `design-child-${d}`,
    parent: 'DESIGN',
    trigger: `/production/${slug}/design/${d}`,
    status: st,
    inheritedVisual: d === 'workspace' ? 'DesignProductionWorkspaceLayout + ph overlay' : 'PwFrame + section',
    authoritySource: d === 'workspace' ? 'legacy twin-opus bench' : 'production design sections',
    staleFallbackRisk: d === 'workspace' ? 'high' : 'medium',
    notes: d === 'workspace' ? 'Mobile: fixed 768 canvas scaled — RESPONSIVE_AUTHORITY_FAILURE.' : 'In-shell DesignProductionSections.',
  }));
}
nodes.push(n({ id: 'design-overlay-chrome', parent: 'design-child-workspace', kind: 'temporary', trigger: 'ProductionChromeOverlay on design/* child routes', status: 'LEGACY_LOCKED', inheritedVisual: 'ph strip', notes: 'Shared 864-space chrome over twin-opus.' }));

// —— EXPERIENCE ——
const expSubs = [
  ['world', 'WORLD'],
  ['zones', 'ZONES'],
  ['environments', 'PATHS'],
  ['modules', 'INTERACTIONS'],
  ['simulations', 'INHABITANTS'],
  ['assets', 'STATES'],
  ['review', 'ACCESS'],
];
nodes.push(n({ id: 'experience-root', parent: 'EXPERIENCE', trigger: `/production/${slug}/experience`, status: 'REFERENCE_LOCKED', authoritySource: 'ExperienceBody + world plate' }));
for (const [sub, label] of expSubs) {
  nodes.push(n({
    id: `experience-child-${sub}`,
    parent: 'EXPERIENCE',
    trigger: `/production/${slug}/experience/${sub}`,
    status: 'PARTIAL',
    inheritedVisual: 'PwFrame + pwa-xchild',
    notes: `Capsule label ${label}. Content: UNMOUNTED empty — honest placeholder.`,
  }));
  nodes.push(n({ id: `experience-capsules-${sub}`, parent: `experience-child-${sub}`, kind: 'interaction', trigger: 'horizontal capsule nav', status: 'REFERENCE_LOCKED' }));
  nodes.push(n({ id: `experience-empty-${sub}`, parent: `experience-child-${sub}`, kind: 'section', trigger: 'NO WORKSPACE SURFACE MOUNTED', status: 'UNMOUNTED', founderReview: 'yes', notes: 'Sub-workspace not mounted in Production yet.' }));
}

// Canon vs registry naming
nodes.push(n({ id: 'experience-canon-paths-alias', parent: 'experience-root', kind: 'section', trigger: 'PATHS capsule → environments route', status: 'REFERENCE_LOCKED', notes: 'Product canon label PATHS; registry id environments.' }));

// —— EXPRESSION ——
const expSubs2 = ['narrative', 'character-fabrication', 'casting', 'wardrobe', 'performance', 'sets', 'storyboard', 'review'];
nodes.push(n({ id: 'expression-root', parent: 'EXPRESSION', trigger: `/production/${slug}/expression?entry=002`, status: 'REFERENCE_LOCKED', authoritySource: 'ExpressionBody production floor' }));
for (const s of expSubs2) {
  const st = s === 'character-fabrication' ? 'PARTIAL' : 'REFERENCE_LOCKED';
  nodes.push(n({ id: `expression-child-${s}`, parent: 'EXPRESSION', trigger: `/production/${slug}/expression/${s}?entry=*`, status: st }));
}
nodes.push(
  n({ id: 'expression-floors-grid', parent: 'expression-root', kind: 'section', trigger: 'PRODUCTION FLOORS cards', status: 'REFERENCE_LOCKED' }),
  n({ id: 'expression-making', parent: 'expression-root', kind: 'section', trigger: 'CURRENTLY MAKING', status: 'REFERENCE_LOCKED' }),
  n({ id: 'expression-active-entries', parent: 'expression-root', kind: 'section', trigger: 'ACTIVE PRODUCTIONS', status: 'REFERENCE_LOCKED' }),
  n({ id: 'expression-travel-table', parent: 'expression-root', kind: 'section', trigger: 'ON YOUR TABLE formats', status: 'REFERENCE_LOCKED' }),
  n({ id: 'expression-campaign-context', parent: 'expression-root', kind: 'section', trigger: 'entry query + context store', status: 'REFERENCE_LOCKED' }),
  n({ id: 'narrative-tabs', parent: 'expression-child-narrative', kind: 'interaction', trigger: 'story|structure|momentum tabs', status: 'REFERENCE_LOCKED' }),
  n({ id: 'narrative-momentum', parent: 'expression-child-narrative', kind: 'temporary', trigger: 'Open narrative momentum / tab=momentum', status: 'REFERENCE_LOCKED', authoritySource: 'NME embed remapped in .pw--authority', notes: 'Grandchild wizard; founder recording surface.' }),
  n({ id: 'casting-tab-actors', parent: 'expression-child-casting', kind: 'interaction', trigger: 'Actors sub-tab', status: 'REFERENCE_LOCKED' }),
  n({ id: 'expression-engine-legacy', parent: 'EXPRESSION', kind: 'route', trigger: `/projects/${slug}/content-operations/expression-engine`, status: 'LEGACY_LOCKED', inheritedVisual: 'expression-engine UI', staleFallbackRisk: 'critical', notes: 'Linked from wardrobe/performance/storyboard/review engine buttons.' }),
  n({ id: 'cf-surface', parent: 'expression-child-character-fabrication', kind: 'section', trigger: 'CharacterFabrication component', status: 'PARTIAL', inheritedVisual: 'CF authority (Fab Condensed)', authoritySource: 'legacy locked CF spec', deviationAllowed: 'yes', notes: 'Wide hosts: scaled 432 canvas; own typography.' }),
);

// —— RESPONSIVE VARIANT RECORDS ——
const respTargets = [
  ['hub-root', 'HUB'],
  ['inbox-root', 'INBOX'],
  ['design-root', 'DESIGN'],
  ['design-child-workspace', 'DESIGN'],
  ['experience-root', 'EXPERIENCE'],
  ['experience-child-world', 'EXPERIENCE'],
  ['expression-root', 'EXPRESSION'],
  ['cf-surface', 'EXPRESSION'],
  ['library-root', 'LIBRARY'],
  ['activity-root', 'ACTIVITY'],
  ['hub-machine', 'HUB'],
];
for (const [id, parent] of respTargets) {
  for (const bp of ['mobile', 'mobile-xl', 'tablet', 'desktop']) {
    let status = 'REFERENCE_LOCKED';
    let notes = '';
    if (id === 'design-child-workspace' && (bp === 'mobile' || bp === 'mobile-xl')) {
      status = 'STRUCTURALLY_CORRECT_VISUALLY_WRONG';
      notes = 'RESPONSIVE_AUTHORITY_FAILURE: 768 desktop canvas scaled into phone.';
    }
    if (id === 'shell-header-mobile' || (id === 'hub-machine' && bp === 'mobile')) {
      status = id === 'hub-machine' ? 'LEGACY_LOCKED' : 'STRUCTURALLY_CORRECT_VISUALLY_WRONG';
    }
    if (id.startsWith('experience-child') && bp !== 'desktop') {
      notes = (notes ? notes + ' ' : '') + 'Pw descendant shell; empty UNMOUNTED body same all breakpoints.';
    }
    nodes.push({
      id: `resp-${id}-${bp}`,
      parent,
      kind: 'responsive-variant',
      trigger: `${id} @ ${bp}`,
      viewports: bp,
      status,
      authoritySource: 'inherited parent',
      inheritedVisual: 'ProductionAuthorityFrame (.pxa)',
      deviationAllowed: 'no',
      staleFallbackRisk: status.includes('WRONG') ? 'high' : 'low',
      founderReview: status === 'UNMOUNTED' ? 'yes' : 'no',
      notes,
    });
  }
}

const genericizationRisks = [
  { surface: 'design-child-workspace', risk: 'GENERICIZATION_RISK', note: 'Twin-opus bench reads generic design-tool / admin panel if palette remap fails.' },
  { surface: 'inbox-root', risk: 'GENERICIZATION_RISK', note: 'Queue rows can drift toward generic CRM if request plates lose authority art.' },
  { surface: 'library-collections', risk: 'GENERICIZATION_RISK', note: 'Card grid temptation — must stay canon inspection floor not generic media DAM.' },
  { surface: 'expression-engine-legacy', risk: 'GENERICIZATION_RISK', note: 'Deprecated Expression engine UI — unrelated SaaS content ops.' },
];

const staleFallbacks = [
  { route: '/production?view=machine', stale: 'ProductionHub', correct: 'hub-root authority', severity: 'P0', priority: 1 },
  { route: `/production/${slug}/design/workspace`, stale: 'DesignTwinOpus overlay', correct: 'design-root chamber language', severity: 'P1', priority: 2 },
  { route: `/projects/${slug}/content-operations/expression-engine`, stale: 'ExpressionEngine', correct: 'expression-child-* descendants', severity: 'P1', priority: 3 },
  { route: 'mobile ph-top/ph-nav', stale: '864-space hub strip', correct: 'pxa chrome dimensions', severity: 'P2', priority: 4 },
  { route: `/production/${slug}/experience/*`, stale: 'generic empty SaaS placeholder', correct: 'experience-root world authority', severity: 'P2', priority: 5 },
];

const authorityConflicts = [
  {
    node: 'experience-canon-paths-alias',
    conflict: 'AUTHORITY_CONFLICT',
    detail: 'Founder canon lists PATHS/ZONES/WORLD modes; registry uses environments/modules ids — labels reconciled in EXPERIENCE_CAPSULES only.',
  },
  {
    node: 'cf-surface',
    conflict: 'AUTHORITY_CONFLICT',
    detail: 'Character Fabrication uses Fab Condensed + CF layout vs Saira Production authority — intentional specialization, must not drift to generic SaaS.',
  },
];

const responsiveAuthorityFailures = [
  { node: 'design-child-workspace', breakpoints: 'mobile,mobile-xl', issue: 'Fixed 768 twin-opus canvas scaled' },
  { node: 'shell-header-mobile', breakpoints: 'mobile,mobile-xl', issue: '864-space ph strip geometry vs pxa authority targets' },
];

const manifest = {
  sprint: 'P0.STUDIOOS.PRODUCTION.AUTHORITY-TREE.COMPOSER1',
  baseSha,
  auditedProjectSlug: slug,
  nodes,
  genericizationRisks,
  staleFallbacks,
  authorityConflicts,
  responsiveAuthorityFailures,
};

fs.writeFileSync(path.join(ART, 'nodes.manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Wrote manifest with', nodes.length, 'nodes');
