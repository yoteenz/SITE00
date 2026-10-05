/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICONS-ONLY3 — staged icon family for
 * the GENERATE PAGE CONCEPTS pop-up.
 *
 * ICON ASSETS ONLY. Live Opus shell, layout, copy, chip/button geometry,
 * and pipeline stay locked. Founder approval is required before Composer
 * replaces `AiConsoleIcon` bindings.
 *
 * Construction: 24×24 viewBox, 1.5 stroke, square caps, miter joins,
 * 6–18 optical inset, currentColor, no gradients/shadows.
 */

export const S00_PCG_ICON_VIEWBOX = 24;
export const S00_PCG_ICON_STROKE = 1.5;
export const S00_PCG_ICON_INSET = 6;
export const S00_PCG_ICON_STATUS = 'STAGED' as const;
export const S00_PCG_ICON_VERSION = 'P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICONS-ONLY3';
export const S00_PCG_ICON_FAMILY = 'SITE00_PCG_LINE_V3';

export type S00PcgSizeBand = 'XS' | 'SM' | 'MD' | 'LG';
export type S00PcgRole = 'ACTION' | 'STATUS' | 'MODEL_TAG' | 'ICON' | 'PLACEHOLDER' | 'CAROUSEL';

export type S00PcgPrimitive =
  | { kind: 'path'; d: string; fill?: boolean }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; fill?: boolean }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number };

export type S00PcgIconId =
  | 'site00-system'
  | 'site00-cgpt'
  | 'site00-gpt2'
  | 'site00-nbp'
  | 'site00-creative-direction'
  | 'site00-page-intelligence'
  | 'site00-brand-context'
  | 'site00-key-messages'
  | 'site00-visual-moodboard'
  | 'site00-authority-placeholder'
  | 'site00-rendition-placeholder'
  | 'site00-output-brief'
  | 'site00-output-authority'
  | 'site00-output-renditions'
  | 'site00-mobile'
  | 'site00-desktop'
  | 'site00-status-ready'
  | 'site00-status-pending'
  | 'site00-status-running'
  | 'site00-status-complete'
  | 'site00-status-failed'
  | 'site00-status-partial'
  | 'site00-generate'
  | 'site00-close'
  | 'site00-chevron-left'
  | 'site00-chevron-right'
  | 'site00-dot-active'
  | 'site00-dot-inactive'
  | 'site00-info';

export type S00PcgIconDef = {
  id: S00PcgIconId;
  filename: `${S00PcgIconId}.svg`;
  semanticName: string;
  location: string;
  meaning: string;
  visualRole: S00PcgRole;
  interactive: boolean;
  sizeBand: S00PcgSizeBand;
  recommendedSize: number;
  currentColor: true;
  primitives: readonly S00PcgPrimitive[];
};

export const S00_PCG_SIZE_BAND = {
  XS: { min: 12, max: 14, default: 12, use: 'status / inline' },
  SM: { min: 16, max: 16, default: 16, use: 'utility / tag / row' },
  MD: { min: 18, max: 20, default: 18, use: 'stage / card / placeholder' },
  LG: { min: 20, max: 24, default: 22, use: 'Generate / summary highlight' },
} as const;

export const S00_PCG_ICON_IDS: readonly S00PcgIconId[] = [
  'site00-system',
  'site00-cgpt',
  'site00-gpt2',
  'site00-nbp',
  'site00-creative-direction',
  'site00-page-intelligence',
  'site00-brand-context',
  'site00-key-messages',
  'site00-visual-moodboard',
  'site00-authority-placeholder',
  'site00-rendition-placeholder',
  'site00-output-brief',
  'site00-output-authority',
  'site00-output-renditions',
  'site00-mobile',
  'site00-desktop',
  'site00-status-ready',
  'site00-status-pending',
  'site00-status-running',
  'site00-status-complete',
  'site00-status-failed',
  'site00-status-partial',
  'site00-generate',
  'site00-close',
  'site00-chevron-left',
  'site00-chevron-right',
  'site00-dot-active',
  'site00-dot-inactive',
  'site00-info',
];

const P = (d: string, fill = false): S00PcgPrimitive => ({ kind: 'path', d, fill });
const R = (x: number, y: number, w: number, h: number, fill = false): S00PcgPrimitive => ({
  kind: 'rect',
  x,
  y,
  w,
  h,
  fill,
});
const L = (x1: number, y1: number, x2: number, y2: number): S00PcgPrimitive => ({
  kind: 'line',
  x1,
  y1,
  x2,
  y2,
});

function def(
  id: S00PcgIconId,
  semanticName: string,
  location: string,
  meaning: string,
  visualRole: S00PcgRole,
  interactive: boolean,
  sizeBand: S00PcgSizeBand,
  recommendedSize: number,
  primitives: readonly S00PcgPrimitive[],
): S00PcgIconDef {
  return {
    id,
    filename: `${id}.svg`,
    semanticName,
    location,
    meaning,
    visualRole,
    interactive,
    sizeBand,
    recommendedSize,
    currentColor: true,
    primitives,
  };
}

const CORNERS: readonly S00PcgPrimitive[] = [
  P('M6 10V6h4'),
  P('M14 6h4v4'),
  P('M18 14v4h-4'),
  P('M10 18H6v-4'),
];
const CHECK = [P('M7.5 12.2 10.6 15.4 16.6 8.6')];
const CROSS = [L(8, 8, 16, 16), L(16, 8, 8, 16)];
const NODE = [R(10.5, 10.5, 3, 3, true)];

const DEFS: Record<S00PcgIconId, S00PcgIconDef> = {
  'site00-system': def(
    'site00-system',
    'SYSTEM / CONTEXT',
    'Summary strip — leading glyph',
    'Construction origin: corners around a synthesis node. Not a database stack.',
    'ICON',
    false,
    'LG',
    22,
    [...CORNERS, ...NODE],
  ),
  'site00-cgpt': def(
    'site00-cgpt',
    'CGPT',
    'Summary + STEP 1 tag',
    'Layered context signals synthesizing into one directional mark.',
    'MODEL_TAG',
    false,
    'SM',
    16,
    [
      R(6, 6.5, 3, 3),
      R(6, 10.5, 3, 3),
      R(6, 14.5, 3, 3),
      L(9, 8, 13.5, 12),
      L(9, 12, 13.5, 12),
      L(9, 16, 13.5, 12),
      R(13.5, 10.5, 3, 3, true),
      L(16.5, 12, 18.5, 12),
    ],
  ),
  'site00-gpt2': def(
    'site00-gpt2',
    'GPT2',
    'Summary + STEP 2 tag',
    'One portrait composition with a single authority field.',
    'MODEL_TAG',
    false,
    'SM',
    16,
    [R(7, 4.5, 10, 15), R(9, 7, 6, 7), R(11, 9.5, 2, 2, true)],
  ),
  'site00-nbp': def(
    'site00-nbp',
    'NBP',
    'Summary + STEP 3 tag',
    'One source plate branching into three controlled outputs.',
    'MODEL_TAG',
    false,
    'SM',
    16,
    [
      R(6, 8, 5, 8),
      L(11, 12, 13.5, 12),
      L(13.5, 12, 15.5, 7.5),
      L(13.5, 12, 15.5, 16.5),
      R(15.5, 6, 3, 3),
      R(15.5, 10.5, 3, 3),
      R(15.5, 15, 3, 3),
    ],
  ),
  'site00-creative-direction': def(
    'site00-creative-direction',
    'CREATIVE DIRECTION',
    'CGPT row',
    'Steering axis with a north tick. Not a light bulb.',
    'ICON',
    false,
    'SM',
    16,
    [L(12, 6, 12, 18), L(6, 12, 18, 12), L(10, 7.5, 14, 7.5), ...NODE],
  ),
  'site00-page-intelligence': def(
    'site00-page-intelligence',
    'PAGE INTELLIGENCE',
    'CGPT row',
    'Page architecture: header band + column split. Not a generic document.',
    'ICON',
    false,
    'SM',
    16,
    [R(6.5, 4.5, 11, 15), L(6.5, 8.5, 17.5, 8.5), L(12, 8.5, 12, 19.5)],
  ),
  'site00-brand-context': def(
    'site00-brand-context',
    'BRAND CONTEXT',
    'CGPT row',
    'Tapered identity stack with a core mark. Not stock layers.',
    'ICON',
    false,
    'SM',
    16,
    [R(6, 6, 12, 3.4), R(7.5, 10.4, 9, 3.2), R(9, 14.8, 6, 3), R(7.2, 6.8, 1.8, 1.8, true)],
  ),
  'site00-key-messages': def(
    'site00-key-messages',
    'KEY MESSAGES',
    'CGPT row',
    'Message hierarchy: lead mark + ranked lines. Not a speech bubble.',
    'ICON',
    false,
    'SM',
    16,
    [R(6, 6.6, 2, 2, true), L(9.2, 7.6, 18, 7.6), L(9.2, 12, 16, 12), L(9.2, 16.4, 13.5, 16.4)],
  ),
  'site00-visual-moodboard': def(
    'site00-visual-moodboard',
    'VISUAL MOODBOARD',
    'CGPT row',
    'Uneven framed mosaic. Not a mountain-photo glyph.',
    'ICON',
    false,
    'SM',
    16,
    [R(6, 6, 7, 7), R(14, 6, 4, 4), R(14, 11.2, 4, 6.8), R(6, 14.2, 7, 3.8)],
  ),
  'site00-authority-placeholder': def(
    'site00-authority-placeholder',
    'AUTHORITY CONCEPT PENDING',
    'GPT2 result frame',
    'Quiet framed field waiting for one authority plate.',
    'PLACEHOLDER',
    false,
    'MD',
    18,
    [R(6, 6, 12, 12), R(8.5, 8, 7, 6), L(8.5, 15.6, 15.5, 15.6)],
  ),
  'site00-rendition-placeholder': def(
    'site00-rendition-placeholder',
    'RENDITION PENDING',
    'NBP empty slots',
    'Landscape frame + technical crosshair. Same family as authority pending.',
    'PLACEHOLDER',
    false,
    'MD',
    18,
    [R(6, 7.2, 12, 9.6), L(12, 9.4, 12, 14.6), L(9.4, 12, 14.6, 12)],
  ),
  'site00-output-brief': def(
    'site00-output-brief',
    'CGPT OUTPUT',
    'CGPT card footer',
    'Structured brief: ranked rules + completion node.',
    'ICON',
    false,
    'SM',
    16,
    [L(6, 7.5, 18, 7.5), L(6, 12, 18, 12), L(6, 16.5, 13, 16.5), R(16, 15, 3, 3, true)],
  ),
  'site00-output-authority': def(
    'site00-output-authority',
    'GPT2 OUTPUT',
    'GPT2 card footer',
    'Single authority artifact — same portrait language as GPT2.',
    'ICON',
    false,
    'SM',
    16,
    [R(7, 4.5, 10, 15), R(9, 7, 6, 7), ...NODE],
  ),
  'site00-output-renditions': def(
    'site00-output-renditions',
    'NBP OUTPUT',
    'NBP card footer',
    'Rendition set: one source plus three sibling frames.',
    'ICON',
    false,
    'SM',
    16,
    [R(6, 8, 4, 8), R(11, 6, 3, 5), R(11, 13, 3, 5), R(15.5, 8, 3, 8)],
  ),
  'site00-mobile': def(
    'site00-mobile',
    'MOBILE',
    'NBP group label',
    'Phone plate. Same stroke, scale, and baseline as desktop.',
    'ICON',
    false,
    'SM',
    16,
    [R(8, 4.5, 8, 15), L(10.5, 6.6, 13.5, 6.6), L(10.5, 17.4, 13.5, 17.4)],
  ),
  'site00-desktop': def(
    'site00-desktop',
    'DESKTOP',
    'NBP group label',
    'Monitor plate + stand. Matched to mobile.',
    'ICON',
    false,
    'SM',
    16,
    [R(5, 6, 14, 9), L(12, 15, 12, 17.2), L(9, 17.2, 15, 17.2)],
  ),
  'site00-status-ready': def(
    'site00-status-ready',
    'READY',
    'Progression chip',
    'Available: compact check. Passive.',
    'STATUS',
    false,
    'XS',
    12,
    CHECK,
  ),
  'site00-status-pending': def(
    'site00-status-pending',
    'PENDING',
    'Progression chip',
    'Waiting: incomplete construction corners.',
    'STATUS',
    false,
    'XS',
    12,
    CORNERS,
  ),
  'site00-status-running': def(
    'site00-status-running',
    'RUNNING',
    'Progression chip',
    'Active: orthogonal ticks around a node. No motion.',
    'STATUS',
    false,
    'XS',
    12,
    [...NODE, L(12, 6, 12, 8.5), L(12, 15.5, 12, 18), L(6, 12, 8.5, 12), L(15.5, 12, 18, 12)],
  ),
  'site00-status-complete': def(
    'site00-status-complete',
    'COMPLETE',
    'Progression chip',
    'Finished: check plus a quiet baseline.',
    'STATUS',
    false,
    'XS',
    12,
    [...CHECK, L(8, 17.6, 16, 17.6)],
  ),
  'site00-status-failed': def(
    'site00-status-failed',
    'FAILED',
    'Progression chip',
    'Error: precise cross. Not a destructive button.',
    'STATUS',
    false,
    'XS',
    12,
    CROSS,
  ),
  'site00-status-partial': def(
    'site00-status-partial',
    'PARTIAL',
    'Progression chip',
    'Mixed: full rule over a shorter rule.',
    'STATUS',
    false,
    'XS',
    12,
    [L(6, 9.2, 18, 9.2), L(6, 14.8, 12.5, 14.8)],
  ),
  'site00-generate': def(
    'site00-generate',
    'GENERATE',
    'Footer primary action',
    'Node expansion: inner signal + outer frame + four ticks. Not a sparkle.',
    'ACTION',
    true,
    'LG',
    22,
    [
      R(8.5, 8.5, 7, 7),
      ...NODE,
      L(12, 5.5, 12, 8.5),
      L(12, 15.5, 12, 18.5),
      L(5.5, 12, 8.5, 12),
      L(15.5, 12, 18.5, 12),
    ],
  ),
  'site00-close': def(
    'site00-close',
    'CLOSE',
    'Header dismiss / cancel glyph',
    'Optically centered X. Same 1.5 stroke.',
    'ACTION',
    true,
    'SM',
    16,
    CROSS,
  ),
  'site00-chevron-left': def(
    'site00-chevron-left',
    'CAROUSEL PREV',
    'NBP paging',
    'Quiet left chevron. Subordinate to thumbnails.',
    'CAROUSEL',
    true,
    'SM',
    16,
    [P('M14 8 9 12 14 16')],
  ),
  'site00-chevron-right': def(
    'site00-chevron-right',
    'CAROUSEL NEXT',
    'NBP paging',
    'Quiet right chevron. Subordinate to thumbnails.',
    'CAROUSEL',
    true,
    'SM',
    16,
    [P('M10 8 15 12 10 16')],
  ),
  'site00-dot-active': def(
    'site00-dot-active',
    'CAROUSEL DOT ACTIVE',
    'NBP paging',
    'Filled technical square.',
    'CAROUSEL',
    true,
    'XS',
    12,
    [R(9, 9, 6, 6, true)],
  ),
  'site00-dot-inactive': def(
    'site00-dot-inactive',
    'CAROUSEL DOT INACTIVE',
    'NBP paging',
    'Hollow technical square. Same optical size as active.',
    'CAROUSEL',
    true,
    'XS',
    12,
    [R(9, 9, 6, 6)],
  ),
  'site00-info': def(
    'site00-info',
    'INFO / PROGRESSION',
    'Footer note',
    'Quiet corners plus an i-stem.',
    'ICON',
    false,
    'SM',
    16,
    [...CORNERS, R(11.25, 7.4, 1.5, 1.5, true), L(12, 10.2, 12, 16.2)],
  ),
};

/** Live AIC id → staged site00 filename stem. Composer applies after approval. */
export const PAGE_CONCEPT_GENERATOR_ICONS_ONLY3_PROPOSAL = {
  'grok-library': 'site00-system',
  'mark-cgpt': 'site00-cgpt',
  'mark-authority': 'site00-gpt2',
  'mark-grok': 'site00-nbp',
  'opus-explore': 'site00-creative-direction',
  'opus-context': 'site00-page-intelligence',
  'attach-style': 'site00-brand-context',
  'auth-cgpt-message': 'site00-key-messages',
  'attach-image': 'site00-visual-moodboard',
  'grok-manifest': 'site00-output-brief',
  'empty-concept': 'site00-authority-placeholder',
  'auth-mobile': 'site00-mobile',
  'auth-desktop': 'site00-desktop',
  'preview-prev': 'site00-chevron-left',
  'preview-next': 'site00-chevron-right',
  'status-ready': 'site00-status-ready',
  'status-pending': 'site00-status-pending',
  'status-generating': 'site00-status-running',
  'status-approved': 'site00-status-complete',
  'status-error': 'site00-status-failed',
  'status-review': 'site00-status-partial',
  'action-close': 'site00-close',
  'grok-generate': 'site00-generate',
} as const;

export const PAGE_CONCEPT_GENERATOR_LIVE_ICON_LOCK = [
  'grok-library',
  'mark-cgpt',
  'mark-authority',
  'mark-grok',
  'opus-explore',
  'opus-context',
  'attach-style',
  'auth-cgpt-message',
  'attach-image',
  'grok-manifest',
  'empty-concept',
  'auth-mobile',
  'auth-desktop',
  'preview-prev',
  'preview-next',
  'action-close',
  'status-error',
  'status-pending',
  'grok-generate',
] as const;

export function getS00PcgIconDef(id: S00PcgIconId): S00PcgIconDef {
  const found = DEFS[id];
  if (!found) throw new Error(`Staged ICONS-ONLY3 missing: ${id}`);
  return found;
}

export function listS00PcgIconDefs(): S00PcgIconDef[] {
  return S00_PCG_ICON_IDS.map((id) => getS00PcgIconDef(id));
}

function primitiveToSvg(primitive: S00PcgPrimitive): string {
  if (primitive.kind === 'path') {
    return primitive.fill
      ? `<path d="${primitive.d}" fill="currentColor" stroke="none"/>`
      : `<path d="${primitive.d}" fill="none" stroke="currentColor" stroke-width="${S00_PCG_ICON_STROKE}" stroke-linecap="square" stroke-linejoin="miter"/>`;
  }
  if (primitive.kind === 'rect') {
    return primitive.fill
      ? `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="currentColor" stroke="none"/>`
      : `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="none" stroke="currentColor" stroke-width="${S00_PCG_ICON_STROKE}"/>`;
  }
  return `<line x1="${primitive.x1}" y1="${primitive.y1}" x2="${primitive.x2}" y2="${primitive.y2}" stroke="currentColor" stroke-width="${S00_PCG_ICON_STROKE}" stroke-linecap="square"/>`;
}

export function renderS00PcgIconSvg(id: S00PcgIconId, size?: number): string {
  const icon = getS00PcgIconDef(id);
  const dim = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${S00_PCG_ICON_VIEWBOX} ${S00_PCG_ICON_VIEWBOX}" fill="none" data-s00-pcg-icon="${icon.id}" data-s00-pcg-icon-status="${S00_PCG_ICON_STATUS}" data-s00-pcg-icon-version="${S00_PCG_ICON_VERSION}">${icon.primitives.map(primitiveToSvg).join('')}</svg>`;
}
