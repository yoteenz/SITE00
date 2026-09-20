/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1 — staged icon family for
 * the GENERATE PAGE CONCEPTS pop-up.
 *
 * STAGED ONLY. These drawings do not replace live `AiConsoleIcon` bindings
 * in the Opus shell. Founder approval is required before Composer wires
 * `PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL` into the panel.
 *
 * Construction: 24×24 viewBox, 1.5 stroke, square caps, miter joins,
 * 5–19 content inset, currentColor. One technical/editorial family.
 */

export const PCG_ICON_VIEWBOX = 24;
export const PCG_ICON_STROKE = 1.5;
export const PCG_ICON_INSET = 5;
export const PCG_ICON_STATUS = 'STAGED' as const;
export const PCG_ICON_VERSION = 'P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1';
export const PCG_ICON_FAMILY = 'SITE00_PCG_LINE_V1';

export type PcgIconState = 'default' | 'active' | 'disabled';
export type PcgIconGroup =
  | 'summary'
  | 'cgpt'
  | 'gpt2'
  | 'nbp'
  | 'status'
  | 'footer'
  | 'shared';

export type PcgIconPrimitive =
  | { kind: 'path'; d: string; fill?: boolean }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; fill?: boolean }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number };

export type PcgIconDef = {
  id: PcgIconId;
  group: PcgIconGroup;
  location: string;
  meaning: string;
  recommendedSize: number;
  defaultState: PcgIconState;
  activeState: PcgIconState;
  disabledState: PcgIconState;
  primitives: readonly PcgIconPrimitive[];
};

export const PCG_ICON_IDS = [
  'pcg-system',
  'pcg-cgpt',
  'pcg-gpt2',
  'pcg-nbp',
  'pcg-viewport',
  'pcg-creative-direction',
  'pcg-page-intelligence',
  'pcg-brand-context',
  'pcg-key-messages',
  'pcg-visual-moodboard',
  'pcg-output-brief',
  'pcg-authority-empty',
  'pcg-output-authority',
  'pcg-mobile',
  'pcg-desktop',
  'pcg-output-rendition',
  'pcg-prev',
  'pcg-next',
  'pcg-status-ready',
  'pcg-status-pending',
  'pcg-status-running',
  'pcg-status-complete',
  'pcg-status-failed',
  'pcg-status-partial',
  'pcg-info',
  'pcg-generate',
  'pcg-close',
  'pcg-error',
] as const;

export type PcgIconId = (typeof PCG_ICON_IDS)[number];

const P = (d: string, fill = false): PcgIconPrimitive => ({ kind: 'path', d, fill });
const R = (x: number, y: number, w: number, h: number, fill = false): PcgIconPrimitive => ({
  kind: 'rect',
  x,
  y,
  w,
  h,
  fill,
});
const L = (x1: number, y1: number, x2: number, y2: number): PcgIconPrimitive => ({
  kind: 'line',
  x1,
  y1,
  x2,
  y2,
});

function def(
  id: PcgIconId,
  group: PcgIconGroup,
  location: string,
  meaning: string,
  recommendedSize: number,
  primitives: readonly PcgIconPrimitive[],
): PcgIconDef {
  return {
    id,
    group,
    location,
    meaning,
    recommendedSize,
    defaultState: 'default',
    activeState: 'active',
    disabledState: 'disabled',
    primitives,
  };
}

const CORNERS: readonly PcgIconPrimitive[] = [
  P('M5 9.5V5h4.5'),
  P('M14.5 5H19v4.5'),
  P('M19 14.5V19h-4.5'),
  P('M9.5 19H5v-4.5'),
];
const FRAME = [R(5, 5, 14, 14)];
const CHECK = [P('M7.5 12.2 10.6 15.4 16.6 8.6')];
const CROSS = [L(8, 8, 16, 16), L(16, 8, 8, 16)];
const CHEVRON_R = [P('M10 7.5 16 12 10 16.5')];
const CHEVRON_L = [P('M14 7.5 8 12 14 16.5')];
const NODE = [R(10.5, 10.5, 3, 3, true)];

const DEFS: Record<PcgIconId, PcgIconDef> = {
  'pcg-system': def(
    'pcg-system',
    'summary',
    'Summary strip — source / system glyph',
    'Generator origin: construction corners around a synthesis node.',
    13,
    [...CORNERS, ...NODE],
  ),
  'pcg-cgpt': def(
    'pcg-cgpt',
    'summary',
    'Summary + STEP 1 chip — CGPT creative intelligence',
    'Directional node: alignment box, crosshair ticks, synthesized center.',
    10,
    [
      R(8.5, 8.5, 7, 7),
      L(12, 5, 12, 8.5),
      L(12, 15.5, 12, 19),
      L(5, 12, 8.5, 12),
      L(15.5, 12, 19, 12),
      ...NODE,
    ],
  ),
  'pcg-gpt2': def(
    'pcg-gpt2',
    'summary',
    'Summary + STEP 2 chip — GPT2 authority concept',
    'Single framed field with an inner plate and one authority mark.',
    10,
    [...FRAME, R(8, 8, 8, 8), R(11, 11, 2, 2, true)],
  ),
  'pcg-nbp': def(
    'pcg-nbp',
    'summary',
    'Summary + STEP 3 chip — NBP renditions',
    'One source node branching into three structured outputs.',
    10,
    [
      R(10.5, 5, 3, 3, true),
      L(12, 8, 12, 11),
      L(12, 11, 7, 14),
      L(12, 11, 17, 14),
      R(5, 14, 4, 4),
      R(10, 14, 4, 4),
      R(15, 14, 4, 4),
    ],
  ),
  'pcg-viewport': def(
    'pcg-viewport',
    'summary',
    'Summary — 6 VIEWPORT OUTPUTS',
    'Paired mobile + desktop glyphs, same stroke and baseline.',
    10,
    [
      R(5, 6, 6, 12),
      L(6.8, 16.6, 9.2, 16.6),
      R(13, 7, 7, 8),
      L(16.5, 15, 16.5, 16.5),
      L(14.4, 16.5, 18.6, 16.5),
    ],
  ),
  'pcg-creative-direction': def(
    'pcg-creative-direction',
    'cgpt',
    'CGPT row — CREATIVE DIRECTION',
    'Axis / compass: guiding mark on a technical crosshair.',
    10,
    [
      L(12, 5, 12, 19),
      L(5, 12, 19, 12),
      P('M12 5 14.2 8.2 9.8 8.2Z', true),
      R(10.5, 10.5, 3, 3),
    ],
  ),
  'pcg-page-intelligence': def(
    'pcg-page-intelligence',
    'cgpt',
    'CGPT row — PAGE INTELLIGENCE',
    'Page IA map: framed page with stacked hierarchy bars.',
    10,
    [R(7, 4.5, 10, 15), L(9, 8, 15, 8), L(9, 11.5, 15, 11.5), L(9, 15, 13, 15)],
  ),
  'pcg-brand-context': def(
    'pcg-brand-context',
    'cgpt',
    'CGPT row — BRAND CONTEXT',
    'Modular identity: two offset system planes.',
    10,
    [R(5, 8, 11, 11), R(8, 5, 11, 11)],
  ),
  'pcg-key-messages': def(
    'pcg-key-messages',
    'cgpt',
    'CGPT row — KEY MESSAGES',
    'Message hierarchy: ranked bars with leading ticks.',
    10,
    [
      L(6, 8, 8, 8),
      L(9.5, 8, 18, 8),
      L(6, 12, 8, 12),
      L(9.5, 12, 16, 12),
      L(6, 16, 8, 16),
      L(9.5, 16, 13.5, 16),
    ],
  ),
  'pcg-visual-moodboard': def(
    'pcg-visual-moodboard',
    'cgpt',
    'CGPT row — VISUAL MOODBOARD',
    'Visual board: 2×2 mosaic, one selected plate.',
    10,
    [R(5, 5, 6, 6), R(13, 5, 6, 6), R(5, 13, 6, 6), R(13, 13, 6, 6, true)],
  ),
  'pcg-output-brief': def(
    'pcg-output-brief',
    'cgpt',
    'CGPT card footer — structured brief output',
    'Brief artifact: ranked lines plus a completion node.',
    12,
    [L(5, 8, 18, 8), L(5, 12, 18, 12), L(5, 16, 13, 16), R(16, 14.5, 3, 3, true)],
  ),
  'pcg-authority-empty': def(
    'pcg-authority-empty',
    'gpt2',
    'GPT2 card — authority placeholder',
    'Empty concept field waiting for a single authority plate.',
    18,
    [...FRAME, R(8, 7.5, 8, 9)],
  ),
  'pcg-output-authority': def(
    'pcg-output-authority',
    'gpt2',
    'GPT2 card footer — authority artifact',
    'One distilled visual: frame + inner plate + center mark.',
    12,
    [...FRAME, R(8.5, 8.5, 7, 7), ...NODE],
  ),
  'pcg-mobile': def(
    'pcg-mobile',
    'nbp',
    'NBP group — MOBILE',
    'Phone silhouette: same stroke, scale, and baseline as desktop.',
    11,
    [R(8, 4.5, 8, 15), L(10.5, 6.5, 13.5, 6.5), L(10.5, 17.5, 13.5, 17.5)],
  ),
  'pcg-desktop': def(
    'pcg-desktop',
    'nbp',
    'NBP group — DESKTOP',
    'Display: landscape plate + centered stand, matched to mobile.',
    11,
    [R(4.5, 5.5, 15, 10), L(12, 15.5, 12, 17.5), L(8.5, 17.5, 15.5, 17.5)],
  ),
  'pcg-output-rendition': def(
    'pcg-output-rendition',
    'nbp',
    'NBP card footer — rendition groups',
    'Three sibling frames from one generation pass.',
    12,
    [R(4, 8, 4.5, 8), R(9.75, 8, 4.5, 8), R(15.5, 8, 4.5, 8)],
  ),
  'pcg-prev': def('pcg-prev', 'nbp', 'NBP carousel — previous', 'Precise left chevron.', 10, CHEVRON_L),
  'pcg-next': def('pcg-next', 'nbp', 'NBP carousel — next', 'Precise right chevron.', 10, CHEVRON_R),
  'pcg-status-ready': def(
    'pcg-status-ready',
    'status',
    'Progression pill — READY',
    'Available to begin: open frame + check.',
    9,
    [R(6.5, 6.5, 11, 11), ...CHECK],
  ),
  'pcg-status-pending': def(
    'pcg-status-pending',
    'status',
    'Progression pill — PENDING',
    'Waiting: incomplete construction corners only.',
    9,
    CORNERS,
  ),
  'pcg-status-running': def(
    'pcg-status-running',
    'status',
    'Progression pill — RUNNING / ACTIVE',
    'Active process: synthesis ticks around a node.',
    9,
    [...NODE, L(12, 5, 12, 8), L(12, 16, 12, 19), L(5, 12, 8, 12), L(16, 12, 19, 12)],
  ),
  'pcg-status-complete': def(
    'pcg-status-complete',
    'status',
    'Progression pill — COMPLETE',
    'Finished: check only — text carries the status.',
    9,
    CHECK,
  ),
  'pcg-status-failed': def(
    'pcg-status-failed',
    'status',
    'Progression pill — FAILED',
    'Failed: technical bang, no heavy box.',
    9,
    [L(12, 6.5, 12, 13.5), R(11.25, 16, 1.5, 1.5, true)],
  ),
  'pcg-status-partial': def(
    'pcg-status-partial',
    'status',
    'Progression pill — PARTIAL',
    'Mixed / incomplete: two offset plates.',
    9,
    [R(6, 7, 12, 7), R(8, 11, 12, 7)],
  ),
  'pcg-info': def(
    'pcg-info',
    'footer',
    'Footer — informational note',
    'Quiet technical mark: corners plus an i-stem.',
    10,
    [...CORNERS, R(11.25, 7, 1.5, 1.5, true), L(12, 10, 12, 16)],
  ),
  'pcg-generate': def(
    'pcg-generate',
    'footer',
    'Footer — GENERATE action',
    'Synthesis burst: center node with eight system ticks.',
    13,
    [
      ...NODE,
      L(12, 5, 12, 8),
      L(12, 16, 12, 19),
      L(5, 12, 8, 12),
      L(16, 12, 19, 12),
      L(7.4, 7.4, 9.4, 9.4),
      L(14.6, 14.6, 16.6, 16.6),
      L(16.6, 7.4, 14.6, 9.4),
      L(9.4, 14.6, 7.4, 16.6),
    ],
  ),
  'pcg-close': def(
    'pcg-close',
    'footer',
    'Header Cancel / close',
    'Optically centered cross, same 1.5 stroke.',
    10,
    CROSS,
  ),
  'pcg-error': def(
    'pcg-error',
    'footer',
    'Footer blocked / error strip',
    'Compact bang for capture-block and failures.',
    10,
    [L(12, 6.5, 12, 13.5), R(11.25, 16, 1.5, 1.5, true)],
  ),
};

/** Live AIC id → staged PCG id. Composer applies this only after founder approval. */
export const PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL = {
  'grok-library': 'pcg-system',
  'mark-cgpt': 'pcg-cgpt',
  'mark-authority': 'pcg-gpt2',
  'mark-grok': 'pcg-nbp',
  'opus-explore': 'pcg-creative-direction',
  'opus-context': 'pcg-page-intelligence',
  'attach-style': 'pcg-brand-context',
  'auth-cgpt-message': 'pcg-key-messages',
  'attach-image': 'pcg-visual-moodboard',
  'grok-manifest': 'pcg-output-brief',
  'empty-concept': 'pcg-authority-empty',
  'auth-mobile': 'pcg-mobile',
  'auth-desktop': 'pcg-desktop',
  'preview-prev': 'pcg-prev',
  'preview-next': 'pcg-next',
  'status-ready': 'pcg-status-ready',
  'status-pending': 'pcg-status-pending',
  'status-generating': 'pcg-status-running',
  'status-approved': 'pcg-status-complete',
  'status-error': 'pcg-status-failed',
  'status-review': 'pcg-status-partial',
  'status-not-ready': 'pcg-status-pending',
  'action-close': 'pcg-close',
  'grok-generate': 'pcg-generate',
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

export function getPcgIconDef(id: PcgIconId): PcgIconDef {
  const found = DEFS[id];
  if (!found) throw new Error(`Staged PCG icon missing: ${id}`);
  return found;
}

export function listPcgIconDefs(): PcgIconDef[] {
  return PCG_ICON_IDS.map((id) => getPcgIconDef(id));
}

function primitiveToSvg(primitive: PcgIconPrimitive): string {
  if (primitive.kind === 'path') {
    return primitive.fill
      ? `<path d="${primitive.d}" fill="currentColor" stroke="none"/>`
      : `<path d="${primitive.d}" fill="none" stroke="currentColor" stroke-width="${PCG_ICON_STROKE}" stroke-linecap="square" stroke-linejoin="miter"/>`;
  }
  if (primitive.kind === 'rect') {
    return primitive.fill
      ? `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="currentColor" stroke="none"/>`
      : `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="none" stroke="currentColor" stroke-width="${PCG_ICON_STROKE}"/>`;
  }
  return `<line x1="${primitive.x1}" y1="${primitive.y1}" x2="${primitive.x2}" y2="${primitive.y2}" stroke="currentColor" stroke-width="${PCG_ICON_STROKE}" stroke-linecap="square"/>`;
}

export function renderPcgIconSvg(id: PcgIconId, size?: number): string {
  const icon = getPcgIconDef(id);
  const dim = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${PCG_ICON_VIEWBOX} ${PCG_ICON_VIEWBOX}" fill="none" data-pcg-icon="${icon.id}" data-pcg-icon-status="${PCG_ICON_STATUS}" data-pcg-icon-version="${PCG_ICON_VERSION}">${icon.primitives.map(primitiveToSvg).join('')}</svg>`;
}
