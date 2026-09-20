/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-LABEL-CLEANUP2 — staged icon +
 * non-interactive label family for the GENERATE PAGE CONCEPTS pop-up.
 *
 * Second pass after GROK-ICON-CLEANUP1. STAGED ONLY. Live Opus shell,
 * geometry, and pipeline stay locked. Founder approval is required before
 * Composer wires `PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL` or imports
 * `s00-pcg-cleanup2.css`.
 *
 * Construction: 24×24 viewBox, 1.5 stroke, square caps, miter joins,
 * 5–19 content inset, currentColor. One technical/editorial family.
 */

export const PCG_ICON_VIEWBOX = 24;
export const PCG_ICON_STROKE = 1.5;
export const PCG_ICON_INSET = 5;
export const PCG_ICON_STATUS = 'STAGED' as const;
export const PCG_ICON_VERSION = 'P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-LABEL-CLEANUP2';
export const PCG_ICON_FAMILY = 'SITE00_PCG_LINE_V2';
export const PCG_PREVIOUS_PASS = 'P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1';

export type PcgIconState = 'default' | 'active' | 'disabled';
export type PcgIconGroup =
  | 'summary'
  | 'cgpt'
  | 'gpt2'
  | 'nbp'
  | 'status'
  | 'footer'
  | 'shared'
  | 'carousel'
  | 'placeholder';

export type PcgVisualRole = 'ACTION' | 'STATUS' | 'MODEL_TAG' | 'ICON' | 'PLACEHOLDER' | 'CAROUSEL';

export type PcgIconPrimitive =
  | { kind: 'path'; d: string; fill?: boolean }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; fill?: boolean }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number };

export type PcgIconDef = {
  id: PcgIconId;
  group: PcgIconGroup;
  location: string;
  meaning: string;
  visualRole: PcgVisualRole;
  interactive: boolean;
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
  'pcg-rendition-empty',
  'pcg-mobile',
  'pcg-desktop',
  'pcg-output-rendition',
  'pcg-prev',
  'pcg-next',
  'pcg-dot-active',
  'pcg-dot-inactive',
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
  visualRole: PcgVisualRole,
  interactive: boolean,
  recommendedSize: number,
  primitives: readonly PcgIconPrimitive[],
): PcgIconDef {
  return {
    id,
    group,
    location,
    meaning,
    visualRole,
    interactive,
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
const CHEVRON_R = [P('M11 8 16 12 11 16')];
const CHEVRON_L = [P('M13 8 8 12 13 16')];
const NODE = [R(10.5, 10.5, 3, 3, true)];

const DEFS: Record<PcgIconId, PcgIconDef> = {
  'pcg-system': def(
    'pcg-system',
    'summary',
    'Summary strip — source / system glyph',
    'Pipeline plan: one creative pass → one authority → three renditions. Not a database stack.',
    'ICON',
    false,
    13,
    [
      R(5, 9, 3.5, 6),
      L(8.5, 12, 10, 12),
      R(10, 9, 3.5, 6),
      L(13.5, 12, 15, 12),
      R(15, 6.5, 3.5, 3),
      R(15, 10.5, 3.5, 3),
      R(15, 14.5, 3.5, 3),
    ],
  ),
  'pcg-cgpt': def(
    'pcg-cgpt',
    'cgpt',
    'Summary + STEP 1 model tag — CGPT creative intelligence',
    'Layered context nodes synthesizing into one directional mark.',
    'MODEL_TAG',
    false,
    10,
    [
      R(5, 6, 3, 3),
      R(5, 10.5, 3, 3),
      R(5, 15, 3, 3),
      L(8, 7.5, 11.5, 12),
      L(8, 12, 11.5, 12),
      L(8, 16.5, 11.5, 12),
      R(11.5, 10.5, 3, 3, true),
      L(14.5, 12, 19, 12),
      P('M16.6 9.8 19 12 16.6 14.2'),
    ],
  ),
  'pcg-gpt2': def(
    'pcg-gpt2',
    'gpt2',
    'Summary + STEP 2 model tag — GPT2 authority concept',
    'One page composition: framed visual field + singular authority mark. Not a nested square.',
    'MODEL_TAG',
    false,
    10,
    [R(6, 4.5, 12, 15), R(8, 7, 8, 8), R(11, 10, 2, 2, true), L(8, 17.2, 16, 17.2)],
  ),
  'pcg-nbp': def(
    'pcg-nbp',
    'nbp',
    'Summary + STEP 3 model tag — NBP renditions',
    'One source plate branching into three controlled outputs.',
    'MODEL_TAG',
    false,
    10,
    [
      R(5, 8, 5, 8),
      L(10, 12, 13, 12),
      L(13, 12, 16, 7),
      L(13, 12, 16, 12),
      L(13, 12, 16, 17),
      R(16, 5.5, 3, 3),
      R(16, 10.5, 3, 3),
      R(16, 15.5, 3, 3),
    ],
  ),
  'pcg-viewport': def(
    'pcg-viewport',
    'summary',
    'Summary — 6 VIEWPORT OUTPUTS',
    'Paired mobile + desktop glyphs, same stroke and baseline.',
    'ICON',
    false,
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
    'Steering axis: technical crosshair with a north tick. Not a play triangle.',
    'ICON',
    false,
    10,
    [L(12, 5, 12, 19), L(5, 12, 19, 12), L(10.2, 6.6, 13.8, 6.6), R(11, 11, 2, 2, true)],
  ),
  'pcg-page-intelligence': def(
    'pcg-page-intelligence',
    'cgpt',
    'CGPT row — PAGE INTELLIGENCE',
    'Modular page map: header band, column split, stacked module.',
    'ICON',
    false,
    10,
    [R(6, 4.5, 12, 15), L(6, 8.5, 18, 8.5), L(12, 8.5, 12, 19.5), L(6, 14.2, 12, 14.2)],
  ),
  'pcg-brand-context': def(
    'pcg-brand-context',
    'cgpt',
    'CGPT row — BRAND CONTEXT',
    'Identity stack: tapering system plates with a core mark. Not generic app layers.',
    'ICON',
    false,
    10,
    [R(5, 5.5, 14, 4), R(6.5, 10.2, 11, 3.4), R(8, 14.8, 8, 3.2), R(6.2, 6.4, 1.8, 1.8, true)],
  ),
  'pcg-key-messages': def(
    'pcg-key-messages',
    'cgpt',
    'CGPT row — KEY MESSAGES',
    'Text hierarchy: lead mark + ranked lines. Not a chat bubble.',
    'ICON',
    false,
    10,
    [R(5, 6.4, 2, 2, true), L(8.5, 7.4, 19, 7.4), L(8.5, 12, 16.2, 12), L(8.5, 16.6, 13.2, 16.6)],
  ),
  'pcg-visual-moodboard': def(
    'pcg-visual-moodboard',
    'cgpt',
    'CGPT row — VISUAL MOODBOARD',
    'Framed reference mosaic: uneven board tiles, not a stock photo.',
    'ICON',
    false,
    10,
    [R(5, 5, 8, 8), R(14, 5, 5, 5), R(14, 11, 5, 8), R(5, 14, 8, 5)],
  ),
  'pcg-output-brief': def(
    'pcg-output-brief',
    'cgpt',
    'CGPT card footer — structured brief output',
    'Output family · brief: ranked lines plus a completion node.',
    'ICON',
    false,
    12,
    [L(6, 7, 18, 7), L(6, 11, 18, 11), L(6, 15, 13, 15), R(16, 13.5, 3, 3, true)],
  ),
  'pcg-authority-empty': def(
    'pcg-authority-empty',
    'placeholder',
    'GPT2 card — AUTHORITY CONCEPT PENDING',
    'Subtle framed visual field waiting for one authority plate. Not a broken-image glyph.',
    'PLACEHOLDER',
    false,
    18,
    [...FRAME, R(8, 7.2, 8, 7), L(8, 16.6, 16, 16.6)],
  ),
  'pcg-output-authority': def(
    'pcg-output-authority',
    'gpt2',
    'GPT2 card footer — authority artifact',
    'Output family · authority: page frame + inner field + center mark.',
    'ICON',
    false,
    12,
    [R(6, 4.5, 12, 15), R(8, 7, 8, 8), ...NODE],
  ),
  'pcg-rendition-empty': def(
    'pcg-rendition-empty',
    'placeholder',
    'NBP card — RENDITION PENDING',
    'Landscape frame with a technical crosshair. Not a browser broken-image icon.',
    'PLACEHOLDER',
    false,
    16,
    [R(5, 6.5, 14, 11), L(12, 9, 12, 15), L(8.5, 12, 15.5, 12), R(11.25, 11.25, 1.5, 1.5, true)],
  ),
  'pcg-mobile': def(
    'pcg-mobile',
    'nbp',
    'NBP group — MOBILE',
    'Phone silhouette: same stroke, scale, and baseline as desktop.',
    'ICON',
    false,
    11,
    [R(8, 4.5, 8, 15), L(10.5, 6.5, 13.5, 6.5), L(10.5, 17.5, 13.5, 17.5)],
  ),
  'pcg-desktop': def(
    'pcg-desktop',
    'nbp',
    'NBP group — DESKTOP',
    'Display: landscape plate + centered stand, matched to mobile.',
    'ICON',
    false,
    11,
    [R(4.5, 5.5, 15, 10), L(12, 15.5, 12, 17.5), L(8.5, 17.5, 15.5, 17.5)],
  ),
  'pcg-output-rendition': def(
    'pcg-output-rendition',
    'nbp',
    'NBP card footer — rendition groups',
    'Output family · rendition set: one source plus three sibling frames.',
    'ICON',
    false,
    12,
    [R(5, 8, 4, 8), L(9, 12, 10.4, 12), R(10.4, 6, 3.4, 5), R(10.4, 13, 3.4, 5), R(15.2, 8, 3.8, 8)],
  ),
  'pcg-prev': def(
    'pcg-prev',
    'carousel',
    'NBP carousel — previous',
    'Quiet left chevron. No enclosing button box.',
    'CAROUSEL',
    true,
    10,
    CHEVRON_L,
  ),
  'pcg-next': def(
    'pcg-next',
    'carousel',
    'NBP carousel — next',
    'Quiet right chevron. No enclosing button box.',
    'CAROUSEL',
    true,
    10,
    CHEVRON_R,
  ),
  'pcg-dot-active': def(
    'pcg-dot-active',
    'carousel',
    'NBP carousel — active page',
    'Technical square, filled. Quiet against rendition frames.',
    'CAROUSEL',
    true,
    6,
    [R(9, 9, 6, 6, true)],
  ),
  'pcg-dot-inactive': def(
    'pcg-dot-inactive',
    'carousel',
    'NBP carousel — inactive page',
    'Technical square, hollow. Same optical size as active.',
    'CAROUSEL',
    true,
    6,
    [R(9, 9, 6, 6)],
  ),
  'pcg-status-ready': def(
    'pcg-status-ready',
    'status',
    'Status chip — READY',
    'Compact check only. Colour lives on the chip fill, not a heavy outline.',
    'STATUS',
    false,
    9,
    CHECK,
  ),
  'pcg-status-pending': def(
    'pcg-status-pending',
    'status',
    'Status chip — PENDING',
    'Waiting: incomplete construction corners only.',
    'STATUS',
    false,
    9,
    CORNERS,
  ),
  'pcg-status-running': def(
    'pcg-status-running',
    'status',
    'Status chip — RUNNING / ACTIVE',
    'Active process: four ticks around a node. No animation in this pass.',
    'STATUS',
    false,
    9,
    [...NODE, L(12, 5, 12, 8), L(12, 16, 12, 19), L(5, 12, 8, 12), L(16, 12, 19, 12)],
  ),
  'pcg-status-complete': def(
    'pcg-status-complete',
    'status',
    'Status chip — COMPLETE',
    'Finished: check plus a quiet baseline.',
    'STATUS',
    false,
    9,
    [...CHECK, L(8, 17.6, 16, 17.6)],
  ),
  'pcg-status-failed': def(
    'pcg-status-failed',
    'status',
    'Status chip — FAILED',
    'Compact technical cross. Informational — not a destructive action.',
    'STATUS',
    false,
    9,
    CROSS,
  ),
  'pcg-status-partial': def(
    'pcg-status-partial',
    'status',
    'Status chip — PARTIAL',
    'Mixed state: full rule over a shorter rule.',
    'STATUS',
    false,
    9,
    [L(6, 9, 18, 9), L(6, 15, 12.5, 15)],
  ),
  'pcg-info': def(
    'pcg-info',
    'footer',
    'Footer — informational note / outputs progress',
    'Quiet technical mark: corners plus an i-stem.',
    'ICON',
    false,
    10,
    [...CORNERS, R(11.25, 7, 1.5, 1.5, true), L(12, 10, 12, 16)],
  ),
  'pcg-generate': def(
    'pcg-generate',
    'footer',
    'Footer — GENERATE action',
    'Action synthesis: center node with four orthogonal ticks. Not a sparkle.',
    'ACTION',
    true,
    13,
    [...NODE, L(12, 5, 12, 8), L(12, 16, 12, 19), L(5, 12, 8, 12), L(16, 12, 19, 12)],
  ),
  'pcg-close': def(
    'pcg-close',
    'footer',
    'Header Cancel / close',
    'Optically centered cross, same 1.5 stroke. Lives on an action control.',
    'ACTION',
    true,
    10,
    CROSS,
  ),
  'pcg-error': def(
    'pcg-error',
    'footer',
    'Footer blocked / error strip',
    'Compact bang for capture-block and failures.',
    'STATUS',
    false,
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

/** Per-stage output family — Composer must not reuse one glyph for all three footers. */
export const PAGE_CONCEPT_GENERATOR_OUTPUT_ICON_FAMILY = {
  CGPT: 'pcg-output-brief',
  GPT2: 'pcg-output-authority',
  NBP: 'pcg-output-rendition',
} as const;

export const PAGE_CONCEPT_GENERATOR_PLACEHOLDER_SET = {
  AUTHORITY_CONCEPT_PENDING: 'pcg-authority-empty',
  RENDITION_PENDING: 'pcg-rendition-empty',
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

/**
 * Interaction classification for the pop-up. ACTION may look clickable.
 * STATUS / MODEL_TAG / ICON / PLACEHOLDER must not.
 */
export const PCG_INTERACTION_CLASSIFICATION = [
  {
    semanticName: 'GENERATE',
    visualRole: 'ACTION' as const,
    interactive: true,
    intendedSize: 40,
    svgFilename: 'pcg-generate.svg',
    states: 'enabled lime fill / disabled muted',
  },
  {
    semanticName: 'CANCEL',
    visualRole: 'ACTION' as const,
    interactive: true,
    intendedSize: 40,
    svgFilename: null,
    states: 'paper fill + major border',
  },
  {
    semanticName: 'HEADER CLOSE',
    visualRole: 'ACTION' as const,
    interactive: true,
    intendedSize: 28,
    svgFilename: 'pcg-close.svg',
    states: 'pill dismiss — remains an action',
  },
  {
    semanticName: 'CGPT',
    visualRole: 'MODEL_TAG' as const,
    interactive: false,
    intendedSize: 14,
    svgFilename: 'pcg-cgpt.svg',
    states: 'flat technical tag',
  },
  {
    semanticName: 'GPT2',
    visualRole: 'MODEL_TAG' as const,
    interactive: false,
    intendedSize: 14,
    svgFilename: 'pcg-gpt2.svg',
    states: 'flat technical tag',
  },
  {
    semanticName: 'NBP',
    visualRole: 'MODEL_TAG' as const,
    interactive: false,
    intendedSize: 14,
    svgFilename: 'pcg-nbp.svg',
    states: 'flat technical tag',
  },
  {
    semanticName: 'READY',
    visualRole: 'STATUS' as const,
    interactive: false,
    intendedSize: 13,
    svgFilename: 'pcg-status-ready.svg',
    states: 'light lime fill, no thick black outline',
  },
  {
    semanticName: 'PENDING',
    visualRole: 'STATUS' as const,
    interactive: false,
    intendedSize: 13,
    svgFilename: 'pcg-status-pending.svg',
    states: 'light gray + subtle outline',
  },
  {
    semanticName: 'RUNNING',
    visualRole: 'STATUS' as const,
    interactive: false,
    intendedSize: 13,
    svgFilename: 'pcg-status-running.svg',
    states: 'restrained lime/black, no motion this pass',
  },
  {
    semanticName: 'COMPLETE',
    visualRole: 'STATUS' as const,
    interactive: false,
    intendedSize: 13,
    svgFilename: 'pcg-status-complete.svg',
    states: 'compact check + baseline',
  },
  {
    semanticName: 'FAILED',
    visualRole: 'STATUS' as const,
    interactive: false,
    intendedSize: 13,
    svgFilename: 'pcg-status-failed.svg',
    states: 'red mark, not a destructive button',
  },
  {
    semanticName: 'PARTIAL',
    visualRole: 'STATUS' as const,
    interactive: false,
    intendedSize: 13,
    svgFilename: 'pcg-status-partial.svg',
    states: 'muted amber/gray technical state',
  },
  {
    semanticName: 'CAROUSEL PREV/NEXT',
    visualRole: 'CAROUSEL' as const,
    interactive: true,
    intendedSize: 10,
    svgFilename: 'pcg-prev.svg / pcg-next.svg',
    states: 'quiet chevron, no box',
  },
  {
    semanticName: 'CAROUSEL DOTS',
    visualRole: 'CAROUSEL' as const,
    interactive: true,
    intendedSize: 6,
    svgFilename: 'pcg-dot-active.svg / pcg-dot-inactive.svg',
    states: 'square technical, filled vs hollow',
  },
] as const;

export const PCG_MODEL_TAG_STYLE = {
  height: '14px',
  padding: '0 3px 0 4px',
  border: 'none',
  background: 'transparent',
  accent: '2px lime left rule on the ready stage only; otherwise ink-3 hairline',
  borderRadius: '0',
  shadow: 'none',
  hover: 'none',
  cursor: 'default',
  pointerEvents: 'none',
  fontSize: '7px',
} as const;

export const PCG_STATUS_CHIP_STYLE = {
  height: '13px',
  padding: '0 5px',
  borderRadius: '2px',
  shadow: 'none',
  cursor: 'default',
  pointerEvents: 'none',
  fontSize: '7px',
  READY: {
    background: 'rgb(205 238 48 / 28%)',
    border: '1px solid rgb(205 238 48 / 55%)',
    color: '#131a04',
  },
  PENDING: {
    background: '#f1f1f1',
    border: '1px solid #e4e4e4',
    color: '#77777d',
  },
  RUNNING: {
    background: 'rgb(205 238 48 / 16%)',
    border: '1px solid rgb(16 16 16 / 18%)',
    color: '#131a04',
  },
  COMPLETE: {
    background: '#efefef',
    border: '1px solid #d8d8d8',
    color: '#101010',
  },
  FAILED: {
    background: 'rgb(194 40 29 / 8%)',
    border: '1px solid rgb(194 40 29 / 28%)',
    color: '#c2281d',
  },
  PARTIAL: {
    background: 'rgb(224 169 10 / 12%)',
    border: '1px solid rgb(224 169 10 / 35%)',
    color: '#454549',
  },
} as const;

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
