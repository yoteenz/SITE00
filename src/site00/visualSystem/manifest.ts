import { DVS_GLYPH_NAMES } from './glyphs';

export type DvsManifestEntry = {
  id: string;
  semantic: string;
  slot: string;
  group: string;
  defaultState: string;
  activeState: string;
  disabledState?: string;
};

export const DVS_GROUPS = [
  'view-modes',
  'agent-marks',
  'viewports',
  'workflow',
  'page-system',
  'workspace',
  'history',
  'upload',
  'asset-actions',
  'review',
  'status',
  'pipeline',
  'inspector',
  'empty',
  'asset-types',
  'asset-status',
  'authority',
  'agent-utility',
  'placeholders',
] as const;

export type DvsGroup = (typeof DVS_GROUPS)[number];

function e(
  id: string,
  semantic: string,
  slot: string,
  group: DvsGroup,
  extra?: Partial<Pick<DvsManifestEntry, 'defaultState' | 'activeState' | 'disabledState'>>,
): DvsManifestEntry {
  return {
    id,
    semantic,
    slot,
    group,
    defaultState: extra?.defaultState ?? 'ink on paper / paper on ink',
    activeState: extra?.activeState ?? 'NDXBOOK lime #cdee30',
    disabledState: extra?.disabledState ?? '34% opacity, same stroke',
  };
}

export const DVS_MANIFEST: DvsManifestEntry[] = [
  e('canonical', 'CANONICAL VIEW', 'design-workspace.view-toggle.canonical', 'view-modes', {
    defaultState: 'framed editorial field + secondary column',
    activeState: 'lime stroke on selected black field',
  }),
  e('list', 'LIST VIEW', 'design-workspace.view-toggle.list', 'view-modes', {
    defaultState: 'three indexed records — sequential inspection',
    activeState: 'lime stroke on selected black field',
  }),
  e('canonical-view', 'CANONICAL VIEW FILE', 'design-workspace.view-toggle.canonical-svg', 'view-modes', {
    defaultState: 'public SVG currentColor pair',
    activeState: 'lime via currentColor',
  }),
  e('list-view', 'LIST VIEW FILE', 'design-workspace.view-toggle.list-svg', 'view-modes', {
    defaultState: 'public SVG currentColor pair',
    activeState: 'lime via currentColor',
  }),

  e('opus', 'OPUS', 'design-workspace.agent-launcher.opus', 'agent-marks', {
    defaultState: 'isometric wire cube — structure agent',
  }),
  e('grok', 'GROK', 'design-workspace.agent-launcher.grok', 'agent-marks', {
    defaultState: '8-ray asterisk + center node — asset agent',
  }),

  e('mobile', 'MOBILE', 'design-workspace.viewport.mobile', 'viewports'),
  e('tablet', 'TABLET', 'design-workspace.viewport.tablet', 'viewports'),
  e('desktop', 'DESKTOP', 'design-workspace.viewport.desktop', 'viewports'),

  e('capture-screen', 'CAPTURE SCREEN', 'design-workspace.chrome.capture-screen', 'workflow'),
  e('create-framework', 'CREATE FRAMEWORK', 'design-workspace.workflow.create-framework', 'workflow'),
  e('generate-assets', 'GENERATE ASSETS', 'design-workspace.workflow.generate-assets', 'workflow'),
  e('select', 'SELECT', 'design-workspace.workflow.select', 'workflow'),
  e('promote', 'PROMOTE', 'design-workspace.workflow.promote', 'workflow'),
  e('approve', 'APPROVE', 'design-workspace.workflow.approve', 'workflow'),
  e('lock', 'LOCK', 'design-workspace.authority.lock', 'workflow'),
  e('unlock', 'UNLOCK', 'design-workspace.authority.unlock', 'workflow'),
  e('pair-review', 'PAIR REVIEW', 'design-workspace.workflow.pair-review', 'workflow'),
  e('review-authority', 'REVIEW AUTHORITY', 'design-workspace.workflow.review-authority', 'workflow'),
  e('fullscreen', 'FULLSCREEN', 'design-workspace.review.fullscreen', 'workflow'),
  e('exit-fullscreen', 'EXIT FULLSCREEN', 'design-workspace.review.exit-fullscreen', 'workflow'),
  e('refine-concept', 'REFINE CONCEPT', 'design-workspace.gallery.refine-concept', 'workflow'),
  e('regenerate', 'REGENERATE', 'design-workspace.gallery.regenerate', 'workflow'),
  e('inspect', 'INSPECT', 'design-workspace.gallery.inspect', 'workflow'),

  e('child-page', 'CHILD PAGE', 'design-workspace.page-system.child', 'page-system'),
  e('grandchild-page', 'GRANDCHILD PAGE', 'design-workspace.page-system.grandchild', 'page-system'),
  e('inheritance', 'INHERITANCE', 'design-workspace.page-system.inheritance', 'page-system'),
  e('batch-edit', 'BATCH EDIT', 'design-workspace.page-system.batch-edit', 'page-system'),

  e('assets', 'ASSETS', 'design-workspace.console.assets', 'workspace'),
  e('interactions', 'INTERACTIONS', 'design-workspace.console.interactions', 'workspace'),
  e('view-pipeline', 'VIEW PIPELINE', 'design-workspace.readiness.view-pipeline', 'workspace'),
  e('view-readiness', 'VIEW READINESS', 'design-workspace.readiness.view-readiness', 'workspace'),
  e('resolve-blocker', 'RESOLVE BLOCKER', 'design-workspace.readiness.resolve-blocker', 'workspace'),

  e('history', 'HISTORY', 'design-workspace.history.timeline', 'history'),
  e('version', 'VERSION', 'design-workspace.history.version', 'history'),
  e('change', 'CHANGE', 'design-workspace.history.change', 'history'),
  e('amendment', 'AMENDMENT', 'design-workspace.history.amendment', 'history'),

  e('upload', 'UPLOAD', 'design-workspace.upload.glyph', 'upload'),
  e('attach', 'ATTACH', 'design-workspace.upload.attach', 'upload'),
  e('drop-zone', 'DROP ZONE', 'design-workspace.upload.drop-zone', 'upload'),
  e('file-ok', 'UPLOAD COMPLETE', 'design-workspace.upload.file-ok', 'upload'),
  e('file-invalid', 'INVALID FILE', 'design-workspace.upload.file-invalid', 'upload'),

  e('replace', 'REPLACE', 'design-workspace.asset-action.replace', 'asset-actions', {
    defaultState: 'stacked frames — swap existing plate',
  }),
  e('regenerate-asset', 'REGENERATE ASSET', 'design-workspace.asset-action.regenerate', 'asset-actions', {
    defaultState: 'frame + return arrow — remake, not swap',
  }),
  e('approve-asset', 'APPROVE ASSET', 'design-workspace.asset-action.approve', 'asset-actions'),
  e('reject', 'REJECT', 'design-workspace.asset-action.reject', 'asset-actions'),

  e('zoom-in', 'ZOOM IN', 'design-workspace.review.zoom-in', 'review'),
  e('zoom-out', 'ZOOM OUT', 'design-workspace.review.zoom-out', 'review'),
  e('fit', 'FIT TO VIEW', 'design-workspace.review.fit', 'review'),
  e('zoom-100', '100%', 'design-workspace.review.zoom-100', 'review'),
  e('side-by-side', 'SIDE BY SIDE', 'design-workspace.review.side-by-side', 'review'),
  e('overlay', 'OVERLAY', 'design-workspace.review.overlay', 'review'),
  e('split', 'SPLIT', 'design-workspace.review.split', 'review'),
  e('compare', 'COMPARE', 'design-workspace.review.compare', 'review'),
  e('comment', 'COMMENT', 'design-workspace.review.comment', 'review'),
  e('annotate', 'ANNOTATE', 'design-workspace.review.annotate', 'review'),

  e('pass', 'PASS', 'design-workspace.status.pass', 'status'),
  e('blocked', 'BLOCKED', 'design-workspace.status.blocked', 'status'),
  e('pending', 'PENDING', 'design-workspace.status.pending', 'status'),
  e('warning', 'WARNING', 'design-workspace.status.warning', 'status'),
  e('not-applicable', 'NOT APPLICABLE', 'design-workspace.status.not-applicable', 'status'),
  e('readiness-current', 'CURRENT', 'design-workspace.readiness.current', 'status'),
  e('readiness-completed', 'COMPLETED', 'design-workspace.readiness.completed', 'status'),
  e('readiness-optional', 'OPTIONAL', 'design-workspace.readiness.optional', 'status'),

  e('stage-01', '01 AUTHORITY DIRECTION', 'design-workspace.pipeline.stage-01', 'pipeline'),
  e('stage-02', '02 PAGE CONCEPTS', 'design-workspace.pipeline.stage-02', 'pipeline'),
  e('stage-03', '03 VIEWPORT SELECTION', 'design-workspace.pipeline.stage-03', 'pipeline'),
  e('stage-04', '04 FINAL APPROVAL', 'design-workspace.pipeline.stage-04', 'pipeline'),
  e('stage-05', '05 PAIR REVIEW', 'design-workspace.pipeline.stage-05', 'pipeline'),
  e('stage-06', '06 HANDOFF', 'design-workspace.pipeline.stage-06', 'pipeline'),
  e('stage-07', '07 TWIN BUILD', 'design-workspace.pipeline.stage-07', 'pipeline'),
  e('stage-08', '08 TWIN REVIEW', 'design-workspace.pipeline.stage-08', 'pipeline'),
  e('stage-09', '09 ASSET PRODUCTION', 'design-workspace.pipeline.stage-09', 'pipeline'),
  e('stage-10', '10 ASSET IMPLEMENTATION', 'design-workspace.pipeline.stage-10', 'pipeline'),
  e('stage-11', '11 PAGE READY', 'design-workspace.pipeline.stage-11', 'pipeline'),

  e('nav-route', 'NAVIGATION / ROUTE', 'design-workspace.inspector.navigation', 'inspector'),
  e('actions', 'ACTIONS', 'design-workspace.inspector.actions', 'inspector'),
  e('state-interaction', 'STATE / INTERACTION', 'design-workspace.inspector.state', 'inspector'),
  e('modal-drawer', 'MODAL / DRAWER', 'design-workspace.inspector.modal-drawer', 'inspector'),
  e('form-input', 'FORM / INPUT', 'design-workspace.inspector.form', 'inspector'),
  e('media', 'MEDIA', 'design-workspace.inspector.media', 'inspector'),
  e('agents', 'AGENTS', 'design-workspace.inspector.agents', 'inspector'),
  e('build', 'BUILD', 'design-workspace.inspector.build', 'inspector'),
  e('approval-cat', 'APPROVAL', 'design-workspace.inspector.approval', 'inspector'),

  e('empty-capture', 'NO CURRENT CAPTURE', 'design-workspace.empty.no-capture', 'empty'),
  e('empty-concept', 'NO CONCEPT SELECTED', 'design-workspace.empty.no-concept', 'empty'),
  e('empty-pages', 'NO PAGE CONCEPTS', 'design-workspace.empty.no-page-concepts', 'empty'),
  e('empty-assets', 'NO ASSETS', 'design-workspace.empty.no-assets', 'empty'),
  e('empty-children', 'NO CHILDREN', 'design-workspace.empty.no-children', 'empty'),
  e('empty-grandchildren', 'NO GRANDCHILDREN', 'design-workspace.empty.no-grandchildren', 'empty'),
  e('empty-history', 'NO HISTORY', 'design-workspace.empty.no-history', 'empty'),
  e('empty-authority', 'NO AUTHORITY', 'design-workspace.empty.no-authority', 'empty'),
  e('empty-attachments', 'NO ATTACHMENTS', 'design-workspace.empty.no-attachments', 'empty'),

  e('type-image', 'IMAGE ASSET', 'design-workspace.asset-console.type-image', 'asset-types'),
  e('type-icon', 'ICON ASSET', 'design-workspace.asset-console.type-icon', 'asset-types'),
  e('type-texture', 'TEXTURE', 'design-workspace.asset-console.type-texture', 'asset-types'),
  e('type-portrait', 'PORTRAIT', 'design-workspace.asset-console.type-portrait', 'asset-types'),
  e('type-hero', 'HERO', 'design-workspace.asset-console.type-hero', 'asset-types'),
  e('type-background', 'BACKGROUND', 'design-workspace.asset-console.type-background', 'asset-types'),
  e('type-illustration', 'ILLUSTRATION', 'design-workspace.asset-console.type-illustration', 'asset-types'),
  e('type-uploaded', 'UPLOADED ASSET', 'design-workspace.asset-console.type-uploaded', 'asset-types'),
  e('type-grok', 'GROK GENERATED', 'design-workspace.asset-console.type-grok', 'asset-types'),
  e('type-founder', 'FOUNDER UPLOADED', 'design-workspace.asset-console.type-founder', 'asset-types'),
  e('type-project', 'PROJECT ASSET', 'design-workspace.asset-console.type-project', 'asset-types'),

  e('staged', 'STAGED', 'design-workspace.asset-status.staged', 'asset-status'),
  e('approved', 'APPROVED', 'design-workspace.asset-status.approved', 'asset-status'),
  e('implemented', 'IMPLEMENTED', 'design-workspace.asset-status.implemented', 'asset-status'),
  e('replaced', 'REPLACED', 'design-workspace.asset-status.replaced', 'asset-status'),
  e('archived', 'ARCHIVED', 'design-workspace.asset-status.archived', 'asset-status'),

  e('authority-none', 'NO AUTHORITY', 'design-workspace.authority.none', 'authority'),
  e('authority-active', 'AUTHORITY ACTIVE', 'design-workspace.authority.active', 'authority'),
  e('authority-approved', 'AUTHORITY APPROVED', 'design-workspace.authority.approved', 'authority'),
  e('authority-new', 'NEW VERSION', 'design-workspace.authority.new-version', 'authority'),
  e('authority-attached', 'REFERENCE ATTACHED', 'design-workspace.authority.attached', 'authority'),

  e('opus-framework', 'FRAMEWORK GENERATION', 'design-workspace.opus-agent.framework', 'agent-utility'),
  e('opus-analysis', 'LAYOUT ANALYSIS', 'design-workspace.opus-agent.analysis', 'agent-utility'),
  e('opus-assembly', 'PAGE ASSEMBLY', 'design-workspace.opus-agent.assembly', 'agent-utility'),
  e('opus-proposal', 'DESIGN PROPOSAL', 'design-workspace.opus-agent.proposal', 'agent-utility'),
  e('opus-compare', 'COMPARISON', 'design-workspace.opus-agent.compare', 'agent-utility'),
  e('opus-revision', 'REVISION', 'design-workspace.opus-agent.revision', 'agent-utility'),
  e('opus-approval', 'APPROVAL STATE', 'design-workspace.opus-agent.approval', 'agent-utility'),
  e('grok-plan', 'ASSET PLAN', 'design-workspace.grok-agent.plan', 'agent-utility'),
  e('grok-generate', 'IMAGE GENERATION', 'design-workspace.grok-agent.generate', 'agent-utility'),
  e('grok-icons', 'ICON SET', 'design-workspace.grok-agent.icons', 'agent-utility'),
  e('grok-variation', 'ASSET VARIATION', 'design-workspace.grok-agent.variation', 'agent-utility'),
  e('grok-replace', 'REPLACEMENT STATE', 'design-workspace.grok-agent.replace', 'agent-utility'),

  e('placeholder', 'GENERIC PLACEHOLDER', 'design-workspace.placeholder.generic', 'placeholders'),
  e('placeholder-page', 'MISSING PAGE ARTIFACT', 'design-workspace.placeholder.page', 'placeholders'),
  e('placeholder-asset', 'MISSING ASSET', 'design-workspace.placeholder.asset', 'placeholders'),
  e('placeholder-capture', 'MISSING CAPTURE', 'design-workspace.placeholder.capture', 'placeholders'),
];

export const DVS_REQUIRED_IDS = [
  'canonical',
  'list',
  'opus',
  'grok',
  'mobile',
  'tablet',
  'desktop',
  'capture-screen',
  'create-framework',
  'generate-assets',
  'select',
  'promote',
  'approve',
  'lock',
  'unlock',
  'pair-review',
  'review-authority',
  'fullscreen',
  'refine-concept',
  'regenerate',
  'inspect',
  'child-page',
  'grandchild-page',
  'inheritance',
  'batch-edit',
  'assets',
  'interactions',
  'view-pipeline',
  'view-readiness',
  'resolve-blocker',
  'history',
  'version',
  'change',
  'amendment',
  'upload',
  'attach',
  'replace',
  'regenerate-asset',
  'approve-asset',
  'reject',
  'zoom-in',
  'zoom-out',
  'fit',
  'side-by-side',
  'overlay',
  'split',
  'comment',
  'annotate',
  'pass',
  'blocked',
  'pending',
  'warning',
  'not-applicable',
  'nav-route',
  'state-interaction',
  'modal-drawer',
  'form-input',
  'media',
] as const;

export const DVS_STAGED_ASSET_COUNT = DVS_MANIFEST.length;

export function dvsManifestIds(): string[] {
  return DVS_MANIFEST.map((entry) => entry.id);
}

export function assertDvsManifestCoverage(): { missingGlyphs: string[]; extraGlyphs: string[] } {
  const manifest = new Set(dvsManifestIds());
  const glyphs = new Set(DVS_GLYPH_NAMES);
  return {
    missingGlyphs: [...manifest].filter((id) => !glyphs.has(id)),
    extraGlyphs: [...glyphs].filter((id) => !manifest.has(id)),
  };
}
