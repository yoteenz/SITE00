import type { ConceptVisualObject } from './types.js';

const HOST_TOP = 0.07;

/** Pre-generation object IDs for NDXBOOK overview mobile (client canvas). */
export function buildNdxOverviewVisualObjectCatalog(): ConceptVisualObject[] {
  const mk = (
    objectId: string,
    role: string,
    type: ConceptVisualObject['type'],
    y: number,
    h: number,
    opts: Partial<ConceptVisualObject> = {},
  ): ConceptVisualObject => ({
    objectId,
    parentId: null,
    role,
    type,
    semanticRole: role,
    renderPrimitive: type === 'IMAGE' || type === 'GRAPHIC' ? 'MEDIA' : 'DOM',
    sourceType:
      type === 'IMAGE' || type === 'GRAPHIC'
        ? 'GENERATED_RASTER_ASSET'
        : type === 'DIVIDER' || type === 'BORDER'
          ? 'CSS_GRAPHIC'
          : 'DOM_TEXT',
    x: 0.04,
    y: HOST_TOP + y,
    width: 0.92,
    height: h,
    zIndex: 10,
    textContent: null,
    fontFamily: 'ndx_condensed',
    fontRole: null,
    fontSize: null,
    fontWeight: null,
    lineHeight: null,
    letterSpacing: null,
    textTransform: null,
    textAlign: null,
    lineBreaks: [],
    color: '#111111',
    background: null,
    border: null,
    borderWidth: null,
    borderRadius: null,
    opacity: 1,
    assetSlotId: null,
    canonicalAssetId: null,
    objectFit: null,
    objectPosition: null,
    crop: null,
    interactionRole: null,
    functionBindingTarget: null,
    ownership: 'CLIENT',
    status: 'PLANNED',
    ...opts,
  });

  const objects: ConceptVisualObject[] = [
    mk('masthead.projectMark', 'Project mark', 'ICON', 0.01, 0.04, {
      sourceType: 'GENERATED_TRANSPARENT_ASSET',
      assetSlotId: 'slot-masthead.projectMark',
    }),
    mk('masthead.projectName', 'Project name', 'TEXT', 0.01, 0.035, {
      textContent: 'NDXBOOK',
      fontRole: 'title',
      fontSize: 0.028,
      fontWeight: '700',
      textTransform: 'uppercase',
    }),
    mk('masthead.descriptor', 'Descriptor', 'TEXT', 0.045, 0.025, {
      textContent: 'OVERVIEW',
      fontRole: 'caption',
      fontSize: 0.018,
    }),
    mk('masthead.status', 'Status chip', 'STATUS', 0.04, 0.03, { functionBindingTarget: 'project_status' }),
    mk('sectionNav.overview', 'Nav overview', 'NAV_ITEM', 0.08, 0.04, {
      functionBindingTarget: 'section_nav.overview',
      interactionRole: 'navigation',
    }),
    mk('sectionNav.identity', 'Nav identity', 'NAV_ITEM', 0.08, 0.04, {
      x: 0.28,
      functionBindingTarget: 'section_nav.identity',
      interactionRole: 'navigation',
    }),
    mk('sectionNav.production', 'Nav production', 'NAV_ITEM', 0.08, 0.04, {
      x: 0.52,
      functionBindingTarget: 'section_nav.production',
      interactionRole: 'navigation',
    }),
    mk('hero.eyebrow', 'Hero eyebrow', 'TEXT', 0.13, 0.02, { textContent: 'CURRENT FOCUS', fontRole: 'eyebrow' }),
    mk('hero.headline', 'Hero headline', 'TEXT', 0.15, 0.06, {
      textContent: 'BUILD THE\nOVERVIEW',
      fontRole: 'headline',
      fontSize: 0.042,
      fontWeight: '700',
      lineBreaks: ['BUILD THE', 'OVERVIEW'],
      color: '#ffffff',
      background: '#0a0a0a',
    }),
    mk('hero.supportingCopy', 'Hero supporting', 'TEXT', 0.21, 0.04, { textContent: 'Editorial project overview', color: '#cccccc' }),
    mk('hero.imageMain', 'Hero main image', 'IMAGE', 0.14, 0.22, {
      x: 0.04,
      width: 0.55,
      assetSlotId: 'slot-hero.imageMain',
      sourceType: 'GENERATED_COMPLEX_MEDIA',
      objectFit: 'cover',
    }),
    mk('hero.ndxOverlay', 'NDX overlay graphic', 'GRAPHIC', 0.18, 0.12, {
      x: 0.62,
      sourceType: 'GENERATED_TRANSPARENT_ASSET',
      assetSlotId: 'slot-hero.ndxOverlay',
    }),
    mk('hero.quickAction1', 'Quick action', 'BUTTON', 0.26, 0.035, { interactionRole: 'cta' }),
    mk('hero.dividerLime', 'Lime divider', 'DIVIDER', 0.3, 0.004, {
      color: '#c8ff00',
      background: '#c8ff00',
      sourceType: 'CSS_GRAPHIC',
      height: 0.004,
    }),
    mk('progress.percent', 'Progress percent', 'TEXT', 0.32, 0.025, {
      functionBindingTarget: 'project_progress',
      fontRole: 'metric',
    }),
    mk('progress.track', 'Progress track', 'PROGRESS_TRACK', 0.35, 0.012, { background: '#e5e5e5' }),
    mk('progress.fill', 'Progress fill', 'PROGRESS_FILL', 0.35, 0.012, {
      width: 0.55,
      background: '#c8ff00',
      functionBindingTarget: 'project_progress',
    }),
    mk('progress.phase', 'Phase label', 'TEXT', 0.365, 0.025, { functionBindingTarget: 'current_phase' }),
    mk('metrics.cell01.value', 'Metric 01 value', 'METRIC', 0.4, 0.03, { functionBindingTarget: 'key_metrics' }),
    mk('metrics.cell01.label', 'Metric 01 label', 'TEXT', 0.43, 0.02, { fontRole: 'caption' }),
    mk('metrics.cell02.value', 'Metric 02 value', 'METRIC', 0.4, 0.03, { x: 0.36 }),
    mk('metrics.cell02.label', 'Metric 02 label', 'TEXT', 0.43, 0.02, { x: 0.36 }),
    mk('focus.icon', 'Focus icon', 'ICON', 0.48, 0.04, {
      sourceType: 'GENERATED_TRANSPARENT_ASSET',
      assetSlotId: 'slot-focus.icon',
    }),
    mk('focus.title', 'Focus title', 'TEXT', 0.48, 0.05, { x: 0.12, functionBindingTarget: 'current_focus' }),
    mk('milestone.title', 'Milestone title', 'TEXT', 0.55, 0.04, { functionBindingTarget: 'next_milestone' }),
    mk('activity.row01', 'Activity row 01', 'ACTIVITY_ROW', 0.62, 0.05, { functionBindingTarget: 'recent_activity' }),
    mk('activity.row02', 'Activity row 02', 'ACTIVITY_ROW', 0.68, 0.05, { functionBindingTarget: 'recent_activity' }),
    mk('client.surfaceMain', 'Main white surface', 'SURFACE', 0.0, 0.75, {
      y: HOST_TOP,
      height: 0.75,
      background: '#ffffff',
      zIndex: 1,
    }),
    mk('client.surfaceHero', 'Hero black surface', 'SURFACE', 0.12, 0.2, {
      background: '#0a0a0a',
      zIndex: 2,
    }),
  ];

  return objects.map((o) => ({
    ...o,
    assetSlotId: o.assetSlotId ?? (o.sourceType.includes('GENERATED') && o.type !== 'TEXT' ? `slot-${o.objectId}` : null),
  }));
}
