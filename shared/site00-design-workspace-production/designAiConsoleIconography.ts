/**
 * P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1 — staged visual micro-asset catalog
 * for the three DESIGN AI consoles.
 *
 * These drawings are STAGED. They do not overwrite any approved SITE 00 /
 * NDXBOOK icon, and they are not registered in the production asset manifest
 * until the founder approves them. The consoles consume this catalog through
 * `AiConsoleIcon`; the same definitions dump to
 * `public/site00/ai-consoles/staged/` for review.
 *
 * Construction: 24×24 viewBox, 1.5 stroke, square caps, miter joins, 5–19
 * content inset. One family — not three icon libraries glued together.
 */

export const AIC_ICON_VIEWBOX = 24;
export const AIC_ICON_STROKE = 1.5;
export const AIC_ICON_INSET = 5;
export const AIC_ICON_STATUS = 'STAGED' as const;
export const AIC_ICON_VERSION = 'P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1';
export const AIC_ICON_FAMILY = 'SITE00_AI_CONSOLE_LINE_V1';

export type AiConsoleIconConsole = 'shared' | 'opus' | 'grok' | 'authority';
export type AiConsoleIconState = 'default' | 'active' | 'disabled' | 'dark';

export type AiConsoleIconPrimitive =
  | { kind: 'path'; d: string; fill?: boolean }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; fill?: boolean }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number };

export type AiConsoleIconDef = {
  id: AiConsoleIconId;
  console: AiConsoleIconConsole;
  usage: string;
  defaultState: AiConsoleIconState;
  activeState: AiConsoleIconState;
  disabledState: AiConsoleIconState;
  darkVariant: 'currentColor';
  primitives: readonly AiConsoleIconPrimitive[];
};

export const AIC_ICON_IDS = [
  /* marks */
  'mark-opus',
  'mark-grok',
  'mark-cgpt',
  'mark-authority',
  /* shared status */
  'status-ready',
  'status-online',
  'status-not-ready',
  'status-blocked',
  'status-thinking',
  'status-generating',
  'status-review',
  'status-approved',
  'status-error',
  'status-pending',
  /* preview controls */
  'preview-fullscreen',
  'preview-fit',
  'preview-zoom-in',
  'preview-zoom-out',
  'preview-prev',
  'preview-next',
  /* reference / attachment */
  'attach-image',
  'attach-document',
  'attach-screenshot',
  'attach-golden',
  'attach-style',
  'attach-modify',
  /* upload */
  'upload',
  'upload-progress',
  'upload-success',
  'upload-invalid',
  'upload-replace',
  /* badges */
  'badge-selected',
  'badge-staged',
  'badge-approved',
  'badge-current',
  'badge-promoted',
  'badge-replaced',
  /* empty states */
  'empty-context',
  'empty-authority',
  'empty-messages',
  'empty-attachments',
  'empty-concept',
  'empty-assets',
  'empty-staged',
  /* shared actions */
  'action-send',
  'action-add',
  'action-remove',
  'action-close',
  'action-inspect',
  'action-view-workspace',
  'action-mention',
  'action-context-assist',
  /* opus */
  'opus-design',
  'opus-edit',
  'opus-refine',
  'opus-explore',
  'opus-context',
  'opus-edit-scope',
  'opus-refine-current',
  'opus-fix-visual',
  'opus-fix-interaction',
  'opus-inspect-only',
  'opus-create-page',
  'opus-create-child',
  'opus-create-grandchild',
  'opus-quick',
  'opus-mode-design',
  'opus-forensic',
  'opus-attach-reference',
  'opus-cost',
  'opus-scope',
  'opus-impact',
  'opus-run',
  'opus-thinking',
  'opus-tool',
  'opus-render',
  'opus-review',
  'opus-proposed',
  'opus-before-after',
  'opus-approve',
  'opus-request-change',
  'opus-revert',
  /* grok */
  'grok-generate',
  'grok-variations',
  'grok-edit',
  'grok-library',
  'grok-page-pack',
  'grok-single',
  'grok-icon-system',
  'grok-replace',
  'grok-variation',
  'grok-images',
  'grok-icons',
  'grok-textures',
  'grok-layouts',
  'grok-asset-selected',
  'grok-asset-staged',
  'grok-asset-approved',
  'grok-asset-implemented',
  'grok-regenerate',
  'grok-inspect',
  'grok-generate-more',
  'grok-manifest',
  'grok-view-requirements',
  'grok-current',
  'grok-target',
  'grok-stage-concept',
  'grok-stage-pair',
  'grok-stage-handoff',
  'grok-stage-ready',
  'grok-type-hero',
  'grok-type-portrait',
  'grok-type-background',
  'grok-type-texture',
  'grok-type-icon',
  'grok-type-illustration',
  'grok-type-layout',
  'grok-type-device',
  'grok-type-uploaded',
  /* authority */
  'auth-mobile',
  'auth-desktop',
  'auth-reference',
  'auth-details',
  'auth-founder',
  'auth-cgpt-message',
  'auth-attachments',
  'auth-upload-reference',
  'auth-send-message',
  'auth-view-versions',
  'auth-send-update',
  'auth-active',
  'auth-approved',
  'auth-draft',
  'auth-new-version',
  'auth-version-current',
  'auth-version-previous',
] as const;

export type AiConsoleIconId = (typeof AIC_ICON_IDS)[number];

const P = (d: string, fill = false): AiConsoleIconPrimitive => ({ kind: 'path', d, fill });
const R = (x: number, y: number, w: number, h: number, fill = false): AiConsoleIconPrimitive => ({
  kind: 'rect',
  x,
  y,
  w,
  h,
  fill,
});
const L = (x1: number, y1: number, x2: number, y2: number): AiConsoleIconPrimitive => ({
  kind: 'line',
  x1,
  y1,
  x2,
  y2,
});

function def(
  id: AiConsoleIconId,
  console: AiConsoleIconConsole,
  usage: string,
  primitives: readonly AiConsoleIconPrimitive[],
): AiConsoleIconDef {
  return {
    id,
    console,
    usage,
    defaultState: 'default',
    activeState: 'active',
    disabledState: 'disabled',
    darkVariant: 'currentColor',
    primitives,
  };
}

/** Four construction corners — the family's outer frame language. */
const CORNERS: readonly AiConsoleIconPrimitive[] = [
  P('M5 9.5V5h4.5'),
  P('M14.5 5H19v4.5'),
  P('M19 14.5V19h-4.5'),
  P('M9.5 19H5v-4.5'),
];

const FRAME = [R(5, 5, 14, 14)];
const CHECK = [P('M7.5 12.2 10.6 15.4 16.6 8.6')];
const CROSS = [L(8, 8, 16, 16), L(16, 8, 8, 16)];
const PLUS = [L(12, 7, 12, 17), L(7, 12, 17, 12)];
const CHEVRON_R = [P('M10 7.5 16 12 10 16.5')];
const CHEVRON_L = [P('M14 7.5 8 12 14 16.5')];
const CYCLE = [P('M8 9.5h5.5V7L16.5 10.5 13.5 14v-2.5H8'), P('M16 14.5H10.5V17L7.5 13.5 10.5 10v2.5H16')];

const UNIQUE: Partial<Record<AiConsoleIconId, AiConsoleIconDef>> = {
  'mark-opus': def(
    'mark-opus',
    'opus',
    'Opus agent mark — construction corners, set-out axes, assembled center.',
    [
      ...CORNERS,
      L(12, 7, 12, 17),
      L(7, 12, 17, 12),
      R(10.5, 10.5, 3, 3, true),
    ],
  ),
  'mark-grok': def(
    'mark-grok',
    'grok',
    'Grok agent mark — generator node with four radiating asset tiles.',
    [
      R(10, 10, 4, 4, true),
      R(10, 4, 4, 4),
      R(10, 16, 4, 4),
      R(4, 10, 4, 4),
      R(16, 10, 4, 4),
      L(12, 8, 12, 10),
      L(12, 14, 12, 16),
      L(8, 12, 10, 12),
      L(14, 12, 16, 12),
    ],
  ),
  'mark-cgpt': def(
    'mark-cgpt',
    'authority',
    'CGPT mark — framed direction. Stays quieter than founder content.',
    [...FRAME, ...CHEVRON_R],
  ),
  'mark-authority': def(
    'mark-authority',
    'authority',
    'Viewport Authority mark — outer frame with an inner aligned plate.',
    [...FRAME, R(8, 8, 8, 8)],
  ),

  'status-ready': def('status-ready', 'shared', 'READY — shape plus colour.', [...FRAME, ...CHECK]),
  'status-online': def('status-online', 'shared', 'ONLINE — solid presence square.', [R(7, 7, 10, 10, true)]),
  'status-not-ready': def('status-not-ready', 'shared', 'NOT READY — empty frame.', FRAME),
  'status-blocked': def('status-blocked', 'shared', 'BLOCKED — frame with deny cross.', [...FRAME, ...CROSS]),
  'status-thinking': def('status-thinking', 'shared', 'THINKING — three paced nodes.', [
    R(5, 10.5, 3, 3, true),
    R(10.5, 10.5, 3, 3, true),
    R(16, 10.5, 3, 3, true),
  ]),
  'status-generating': def('status-generating', 'shared', 'GENERATING — synthesis ticks around a node.', [
    R(10.5, 10.5, 3, 3, true),
    L(12, 5, 12, 8),
    L(12, 16, 12, 19),
    L(5, 12, 8, 12),
    L(16, 12, 19, 12),
  ]),
  'status-review': def('status-review', 'shared', 'REVIEW — stacked plates.', [R(6, 7, 12, 8), R(8, 11, 12, 8)]),
  'status-approved': def('status-approved', 'shared', 'APPROVED — frame plus check. Fill comes from the status plate.', [
    ...FRAME,
    ...CHECK,
  ]),
  'status-error': def('status-error', 'shared', 'ERROR — architectural bang inside a frame.', [
    ...FRAME,
    L(12, 8, 12, 14),
    R(11.25, 16, 1.5, 1.5, true),
  ]),
  'status-pending': def('status-pending', 'shared', 'PENDING — incomplete corners only.', CORNERS),

  'preview-fullscreen': def('preview-fullscreen', 'shared', 'Open preview fullscreen.', [
    P('M5 9.5V5h4.5'),
    P('M14.5 5H19v4.5'),
    P('M19 14.5V19h-4.5'),
    P('M9.5 19H5v-4.5'),
  ]),
  'preview-fit': def('preview-fit', 'shared', 'Fit preview to frame.', [...FRAME, R(8, 8, 8, 8)]),
  'preview-zoom-in': def('preview-zoom-in', 'shared', 'Zoom in.', [...FRAME, ...PLUS]),
  'preview-zoom-out': def('preview-zoom-out', 'shared', 'Zoom out.', [...FRAME, L(8, 12, 16, 12)]),
  'preview-prev': def('preview-prev', 'shared', 'Previous preview.', CHEVRON_L),
  'preview-next': def('preview-next', 'shared', 'Next preview.', CHEVRON_R),

  'attach-image': def('attach-image', 'shared', 'Image attachment.', [
    ...FRAME,
    P('M6.5 16.5 10 12.5 13 15.5 16 11.5 18.5 16.5'),
    R(8, 8, 2.2, 2.2, true),
  ]),
  'attach-document': def('attach-document', 'shared', 'PDF / document attachment.', [
    P('M8 19V5h6l5 5v9H8z'),
    P('M14 5v5h5'),
    L(10.5, 13, 16.5, 13),
    L(10.5, 16, 15, 16),
  ]),
  'attach-screenshot': def('attach-screenshot', 'shared', 'Screenshot / capture attachment.', [
    R(8, 4.5, 8, 15),
    L(10.5, 6.5, 13.5, 6.5),
    L(10.5, 17.5, 13.5, 17.5),
  ]),
  'attach-golden': def('attach-golden', 'shared', 'Golden / authority reference.', [
    P('M12 5 19 12 12 19 5 12Z'),
    P('M12 9 15 12 12 15 9 12Z'),
  ]),
  'attach-style': def('attach-style', 'shared', 'Style reference.', [
    L(6, 8, 18, 8),
    L(6, 12, 15, 12),
    L(6, 16, 12, 16),
  ]),
  'attach-modify': def('attach-modify', 'shared', 'Asset to modify.', [
    R(5, 7, 11, 11),
    P('M14 7l5-2 0 5-5 2z'),
  ]),

  upload: def('upload', 'shared', 'Upload / drop-zone glyph.', [...FRAME, P('M12 16V9'), P('M8.5 11.5 12 8 15.5 11.5')]),
  'upload-progress': def('upload-progress', 'shared', 'Upload in progress.', [...FRAME, L(8, 12, 16, 12), L(8, 15, 13, 15)]),
  'upload-success': def('upload-success', 'shared', 'Upload succeeded.', [...FRAME, ...CHECK]),
  'upload-invalid': def('upload-invalid', 'shared', 'Upload rejected.', [...FRAME, ...CROSS]),
  'upload-replace': def('upload-replace', 'shared', 'Replace uploaded file.', [...FRAME, ...CYCLE]),

  'badge-selected': def('badge-selected', 'shared', 'Thumbnail SELECTED overlay.', CHECK),
  'badge-staged': def('badge-staged', 'shared', 'Thumbnail STAGED overlay.', [R(7, 7, 10, 10)]),
  'badge-approved': def('badge-approved', 'shared', 'Thumbnail APPROVED overlay.', CHECK),
  'badge-current': def('badge-current', 'shared', 'Thumbnail CURRENT overlay.', [R(8, 8, 8, 8, true)]),
  'badge-promoted': def('badge-promoted', 'shared', 'Thumbnail PROMOTED overlay.', [P('M7.5 14 12 8.5 16.5 14')]),
  'badge-replaced': def('badge-replaced', 'shared', 'Thumbnail REPLACED overlay.', CYCLE),

  'empty-context': def('empty-context', 'shared', 'No current context.', CORNERS),
  'empty-authority': def('empty-authority', 'shared', 'No authority image.', [
    R(8, 4.5, 8, 15),
    L(10.5, 6.5, 13.5, 6.5),
  ]),
  'empty-messages': def('empty-messages', 'shared', 'No messages.', [
    R(5, 6, 14, 9),
    P('M9 15v3l4-3h6V6'),
  ]),
  'empty-attachments': def('empty-attachments', 'shared', 'No attachments.', [
    R(7, 8, 10, 10),
    L(7, 11, 17, 11),
  ]),
  'empty-concept': def('empty-concept', 'shared', 'No concept reference.', [
    ...FRAME,
    P('M6.5 16.5 10 13 13 15.5 18 10.5'),
  ]),
  'empty-assets': def('empty-assets', 'shared', 'No assets.', [
    R(5, 5, 6, 6),
    R(13, 5, 6, 6),
    R(5, 13, 6, 6),
    R(13, 13, 6, 6),
  ]),
  'empty-staged': def('empty-staged', 'shared', 'No staged output.', [R(5, 8, 14, 10), L(5, 12, 19, 12)]),

  'action-send': def('action-send', 'shared', 'Send message.', CHEVRON_R),
  'action-add': def('action-add', 'shared', 'Add.', PLUS),
  'action-remove': def('action-remove', 'shared', 'Remove.', CROSS),
  'action-close': def('action-close', 'shared', 'Close console.', CROSS),
  'action-inspect': def('action-inspect', 'shared', 'Inspect.', [...FRAME, R(9, 9, 6, 6)]),
  'action-view-workspace': def('action-view-workspace', 'shared', 'View in workspace.', [
    ...FRAME,
    P('M13 8h3v3'),
    L(11, 13, 16, 8),
  ]),
  'action-mention': def('action-mention', 'shared', 'Mention page.', [
    P('M16.5 12a4.5 4.5 0 1 1-1.3-3.2'),
    P('M16.5 12v1.6c0 1.2.8 2 2 1.4'),
  ]),
  'action-context-assist': def('action-context-assist', 'shared', 'Append compiled context.', [
    L(6, 8, 18, 8),
    L(6, 12, 14, 12),
    L(6, 16, 11, 16),
    R(16, 14.5, 3, 3, true),
  ]),

  'opus-design': def('opus-design', 'opus', 'DESIGN tab / mode.', [
    R(5, 5, 6, 6),
    R(13, 5, 6, 6),
    R(5, 13, 6, 6),
    R(13, 13, 6, 6),
  ]),
  'opus-edit': def('opus-edit', 'opus', 'EDIT.', [P('M6 16.5 8.5 8.5 17.5 6.5 15.5 15.5Z'), L(8.5, 8.5, 15.5, 15.5)]),
  'opus-refine': def('opus-refine', 'opus', 'REFINE.', [R(5, 7, 11, 11), R(8, 5, 11, 11)]),
  'opus-explore': def('opus-explore', 'opus', 'EXPLORE / FORENSIC.', [
    L(12, 5, 12, 19),
    L(5, 12, 19, 12),
    R(9, 9, 6, 6),
  ]),
  'opus-context': def('opus-context', 'opus', 'CURRENT CONTEXT.', [...FRAME, L(8, 9, 16, 9), L(8, 12, 14, 12)]),
  'opus-edit-scope': def('opus-edit-scope', 'opus', 'EDIT SCOPE.', [L(6, 8, 18, 8), L(6, 12, 18, 12), L(6, 16, 14, 16)]),
  'opus-refine-current': def('opus-refine-current', 'opus', 'REFINE CURRENT.', [R(5, 7, 11, 11), R(8, 5, 11, 11)]),
  'opus-fix-visual': def('opus-fix-visual', 'opus', 'FIX VISUAL.', [
    ...FRAME,
    P('M6.5 16 10 12.5 13 15 17.5 10'),
  ]),
  'opus-fix-interaction': def('opus-fix-interaction', 'opus', 'FIX INTERACTION.', [
    R(5.5, 10, 4, 4, true),
    R(14.5, 10, 4, 4, true),
    L(9.5, 12, 14.5, 12),
  ]),
  'opus-inspect-only': def('opus-inspect-only', 'opus', 'INSPECT ONLY.', [...FRAME, R(9, 9, 6, 6)]),
  'opus-create-page': def('opus-create-page', 'opus', 'CREATE PAGE.', [
    R(7, 5, 10, 14),
    L(9.5, 9, 14.5, 9),
    L(9.5, 12, 13, 12),
  ]),
  'opus-create-child': def('opus-create-child', 'opus', 'CREATE CHILD.', [R(5, 5, 9, 12), R(11, 9, 8, 10)]),
  'opus-create-grandchild': def('opus-create-grandchild', 'opus', 'CREATE GRANDCHILD.', [
    R(4.5, 4.5, 7, 9),
    R(9, 8, 7, 9),
    R(13.5, 11.5, 6.5, 8),
  ]),
  'opus-quick': def('opus-quick', 'opus', 'QUICK mode.', CHEVRON_R),
  'opus-mode-design': def('opus-mode-design', 'opus', 'DESIGN mode.', [
    R(5, 5, 6, 6),
    R(13, 5, 6, 6),
    R(5, 13, 6, 6),
    R(13, 13, 6, 6),
  ]),
  'opus-forensic': def('opus-forensic', 'opus', 'FORENSIC mode.', [
    L(12, 5, 12, 19),
    L(5, 12, 19, 12),
    R(9, 9, 6, 6),
  ]),
  'opus-attach-reference': def('opus-attach-reference', 'opus', 'ATTACH REFERENCE.', [
    ...FRAME,
    P('M6.5 16.5 10 12.5 13 15.5 18 10.5'),
  ]),
  'opus-cost': def('opus-cost', 'opus', 'COST.', [...FRAME, L(12, 8, 12, 12.5), L(12, 12.5, 15, 14.5)]),
  'opus-scope': def('opus-scope', 'opus', 'SCOPE.', [R(6, 6, 12, 4), R(6, 11, 12, 3), R(6, 16, 12, 2)]),
  'opus-impact': def('opus-impact', 'opus', 'IMPACT.', [
    R(6, 15, 3, 4),
    R(10.5, 11, 3, 8),
    R(15, 7, 3, 12),
  ]),
  'opus-run': def('opus-run', 'opus', 'RUN OPUS — restrained action chevron.', CHEVRON_R),
  'opus-thinking': def('opus-thinking', 'opus', 'THINKING phase.', [
    R(5, 10.5, 3, 3, true),
    R(10.5, 10.5, 3, 3, true),
    R(16, 10.5, 3, 3, true),
  ]),
  'opus-tool': def('opus-tool', 'opus', 'TOOL phase.', [P('M8 16 16 8'), R(6.5, 14.5, 3, 3), R(14.5, 6.5, 3, 3)]),
  'opus-render': def('opus-render', 'opus', 'RENDER phase.', [...FRAME, P('M6.5 16 10 12 13 15 17.5 10')]),
  'opus-review': def('opus-review', 'opus', 'REVIEW phase.', [R(6, 7, 12, 8), R(8, 11, 12, 8)]),
  'opus-proposed': def('opus-proposed', 'opus', 'PROPOSED CHANGE.', [R(5, 5, 7, 14), R(12, 5, 7, 14), L(12, 5, 12, 19)]),
  'opus-before-after': def('opus-before-after', 'opus', 'BEFORE / AFTER.', [
    R(5, 5, 7, 14),
    R(12, 5, 7, 14),
    L(12, 5, 12, 19),
  ]),
  'opus-approve': def('opus-approve', 'opus', 'APPROVE.', CHECK),
  'opus-request-change': def('opus-request-change', 'opus', 'REQUEST CHANGE.', [
    P('M16 8H9V6L5.5 10 9 14v-2h7'),
  ]),
  'opus-revert': def('opus-revert', 'opus', 'REVERT.', [P('M14 7.5 8 12 14 16.5'), P('M17.5 7.5 11.5 12 17.5 16.5')]),

  'grok-generate': def('grok-generate', 'grok', 'GENERATE.', [
    R(10.5, 10.5, 3, 3, true),
    R(10, 4.5, 4, 4),
    R(10, 15.5, 4, 4),
    R(4.5, 10, 4, 4),
    R(15.5, 10, 4, 4),
  ]),
  'grok-variations': def('grok-variations', 'grok', 'VARIATIONS.', [
    R(5, 5, 6, 6),
    R(13, 5, 6, 6),
    R(5, 13, 6, 6),
    R(13, 13, 6, 6),
  ]),
  'grok-edit': def('grok-edit', 'grok', 'EDIT assets.', [P('M6 16.5 8.5 8.5 17.5 6.5 15.5 15.5Z'), L(8.5, 8.5, 15.5, 15.5)]),
  'grok-library': def('grok-library', 'grok', 'LIBRARY.', [R(5, 6, 14, 4), R(5, 11, 14, 3), R(5, 16, 14, 3)]),
  'grok-page-pack': def('grok-page-pack', 'grok', 'PAGE ASSET PACK.', [
    R(5, 6, 4, 5),
    R(10, 6, 4, 5),
    R(15, 6, 4, 5),
    R(5, 13, 4, 5),
    R(10, 13, 4, 5),
    R(15, 13, 4, 5),
  ]),
  'grok-single': def('grok-single', 'grok', 'SINGLE ASSET.', [R(7, 7, 10, 10)]),
  'grok-icon-system': def('grok-icon-system', 'grok', 'ICON SYSTEM.', [
    R(6, 6, 5, 5),
    R(13, 6, 5, 5),
    R(6, 13, 5, 5),
    R(13, 13, 5, 5),
  ]),
  'grok-replace': def('grok-replace', 'grok', 'REPLACE ASSET.', CYCLE),
  'grok-variation': def('grok-variation', 'grok', 'ASSET VARIATION.', [R(5, 7, 10, 10), R(9, 5, 10, 10)]),
  'grok-images': def('grok-images', 'grok', 'IMAGES filter.', [
    ...FRAME,
    P('M6.5 16.5 10 12.5 13 15.5 18 10.5'),
  ]),
  'grok-icons': def('grok-icons', 'grok', 'ICONS filter.', [R(8, 8, 8, 8), R(10.5, 10.5, 3, 3, true)]),
  'grok-textures': def('grok-textures', 'grok', 'TEXTURES filter.', [
    ...FRAME,
    L(8, 8, 16, 16),
    L(8, 12, 12, 16),
    L(12, 8, 16, 12),
  ]),
  'grok-layouts': def('grok-layouts', 'grok', 'GRAPHICS / LAYOUTS filter.', [R(5, 5, 6, 14), R(13, 5, 6, 14)]),
  'grok-asset-selected': def('grok-asset-selected', 'grok', 'Asset selected.', [...FRAME, ...CHECK]),
  'grok-asset-staged': def('grok-asset-staged', 'grok', 'Asset staged.', [R(7, 7, 10, 10)]),
  'grok-asset-approved': def('grok-asset-approved', 'grok', 'Asset approved.', CHECK),
  'grok-asset-implemented': def('grok-asset-implemented', 'grok', 'Asset implemented.', [
    ...FRAME,
    R(8, 8, 8, 8, true),
  ]),
  'grok-regenerate': def('grok-regenerate', 'grok', 'REGENERATE.', CYCLE),
  'grok-inspect': def('grok-inspect', 'grok', 'INSPECT asset.', [...FRAME, R(9, 9, 6, 6)]),
  'grok-generate-more': def('grok-generate-more', 'grok', 'GENERATE MORE.', [...CORNERS, ...PLUS]),
  'grok-manifest': def('grok-manifest', 'grok', 'MANIFEST.', [
    L(6, 8, 18, 8),
    L(6, 12, 18, 12),
    L(6, 16, 14, 16),
    R(16, 14.5, 3, 3, true),
  ]),
  'grok-view-requirements': def('grok-view-requirements', 'grok', 'VIEW REQUIREMENTS.', [
    L(6, 8, 14, 8),
    L(6, 12, 14, 12),
    L(6, 16, 11, 16),
    ...CHEVRON_R,
  ]),
  'grok-current': def('grok-current', 'grok', 'CURRENT capture.', [R(6, 6, 12, 12, true)]),
  'grok-target': def('grok-target', 'grok', 'TARGET design.', [
    ...FRAME,
    L(12, 7, 12, 17),
    L(7, 12, 17, 12),
  ]),
  'grok-stage-concept': def('grok-stage-concept', 'grok', 'PAGE CONCEPT readiness.', [R(7, 5, 10, 14), L(9.5, 9, 14.5, 9)]),
  'grok-stage-pair': def('grok-stage-pair', 'grok', 'AUTHORITY PAIR readiness.', [R(4.5, 7, 8, 10), R(11.5, 7, 8, 10)]),
  'grok-stage-handoff': def('grok-stage-handoff', 'grok', 'COMPOSER HANDOFF readiness.', [
    R(4.5, 7, 6, 10),
    R(13.5, 7, 6, 10),
    P('M11 12h2'),
    P('M12.2 10.4 14.2 12 12.2 13.6'),
  ]),
  'grok-stage-ready': def('grok-stage-ready', 'grok', 'READY FOR ASSETS.', [...FRAME, ...CHECK]),
  'grok-type-hero': def('grok-type-hero', 'grok', 'Hero asset type.', [R(4.5, 7, 15, 10)]),
  'grok-type-portrait': def('grok-type-portrait', 'grok', 'Portrait asset type.', [R(8, 4.5, 8, 15)]),
  'grok-type-background': def('grok-type-background', 'grok', 'Background asset type.', [R(5, 5, 14, 14)]),
  'grok-type-texture': def('grok-type-texture', 'grok', 'Texture asset type.', [
    ...FRAME,
    L(8, 8, 16, 16),
    L(8, 12, 12, 16),
    L(12, 8, 16, 12),
  ]),
  'grok-type-icon': def('grok-type-icon', 'grok', 'Icon asset type.', [R(8, 8, 8, 8)]),
  'grok-type-illustration': def('grok-type-illustration', 'grok', 'Illustration asset type.', [
    ...FRAME,
    P('M6.5 16.5 10 12 12 14.5 17.5 9'),
    R(8, 8, 2, 2, true),
  ]),
  'grok-type-layout': def('grok-type-layout', 'grok', 'Layout graphic type.', [R(5, 5, 6, 14), R(13, 5, 6, 6), R(13, 13, 6, 6)]),
  'grok-type-device': def('grok-type-device', 'grok', 'Device / mockup type.', [
    R(8, 4.5, 8, 15),
    L(10.5, 6.5, 13.5, 6.5),
    L(10.5, 17.5, 13.5, 17.5),
  ]),
  'grok-type-uploaded': def('grok-type-uploaded', 'grok', 'Uploaded reference type.', [
    ...FRAME,
    P('M12 16V9'),
    P('M8.5 11.5 12 8 15.5 11.5'),
  ]),

  'auth-mobile': def('auth-mobile', 'authority', 'MOBILE AUTHORITY.', [
    R(8, 4.5, 8, 15),
    L(10.5, 6.5, 13.5, 6.5),
    L(10.5, 17.5, 13.5, 17.5),
  ]),
  'auth-desktop': def('auth-desktop', 'authority', 'DESKTOP AUTHORITY.', [R(4.5, 6, 15, 10), L(9, 18, 15, 18), L(12, 16, 12, 18)]),
  'auth-reference': def('auth-reference', 'authority', 'REFERENCE PREVIEW.', [
    ...FRAME,
    P('M6.5 16.5 10 12.5 13 15.5 18 10.5'),
  ]),
  'auth-details': def('auth-details', 'authority', 'AUTHORITY DETAILS.', [
    L(6, 8, 18, 8),
    L(6, 12, 18, 12),
    L(6, 16, 13, 16),
  ]),
  'auth-founder': def('auth-founder', 'authority', 'Founder message mark.', [
    L(8, 6, 8, 18),
    L(8, 6, 16, 6),
    L(8, 12, 14, 12),
  ]),
  'auth-cgpt-message': def('auth-cgpt-message', 'authority', 'CGPT message mark.', [...FRAME, ...CHEVRON_R]),
  'auth-attachments': def('auth-attachments', 'authority', 'ATTACHMENTS.', [R(7, 8, 10, 10), L(7, 11, 17, 11)]),
  'auth-upload-reference': def('auth-upload-reference', 'authority', 'UPLOAD REFERENCE.', [
    ...FRAME,
    P('M12 16V9'),
    P('M8.5 11.5 12 8 15.5 11.5'),
  ]),
  'auth-send-message': def('auth-send-message', 'authority', 'SEND MESSAGE.', CHEVRON_R),
  'auth-view-versions': def('auth-view-versions', 'authority', 'VIEW VERSIONS.', [R(6, 6, 12, 4), R(6, 11, 12, 3), R(6, 16, 12, 3)]),
  'auth-send-update': def('auth-send-update', 'authority', 'SEND TO UPDATE AUTHORITY.', CHEVRON_R),
  'auth-active': def('auth-active', 'authority', 'ACTIVE version.', [R(8, 8, 8, 8, true)]),
  'auth-approved': def('auth-approved', 'authority', 'APPROVED version.', CHECK),
  'auth-draft': def('auth-draft', 'authority', 'DRAFT version.', CORNERS),
  'auth-new-version': def('auth-new-version', 'authority', 'NEW VERSION.', [...CORNERS, ...PLUS]),
  'auth-version-current': def('auth-version-current', 'authority', 'CURRENT version mark.', [R(7, 7, 10, 10, true)]),
  'auth-version-previous': def('auth-version-previous', 'authority', 'PREVIOUS version mark.', [...FRAME, ...CHEVRON_L]),
};

/**
 * Semantic IDs that share a drawing. Aliases keep the founder-facing catalog
 * complete without forking the construction grid.
 */
export const AIC_ICON_ALIASES: Partial<Record<AiConsoleIconId, AiConsoleIconId>> = {};

export function resolveAiConsoleIconId(id: AiConsoleIconId): AiConsoleIconId {
  return AIC_ICON_ALIASES[id] ?? id;
}

export function getAiConsoleIconDef(id: AiConsoleIconId): AiConsoleIconDef {
  const resolved = resolveAiConsoleIconId(id);
  const found = UNIQUE[resolved];
  if (!found) {
    throw new Error(`Staged AI-console icon missing: ${id}`);
  }
  if (resolved === id) return found;
  return { ...found, id, usage: `${found.usage} (alias of ${resolved})` };
}

export function listAiConsoleIconDefs(): AiConsoleIconDef[] {
  return AIC_ICON_IDS.map((id) => getAiConsoleIconDef(id));
}

export function listStagedAiConsoleIcons(): AiConsoleIconDef[] {
  return listAiConsoleIconDefs().filter(() => AIC_ICON_STATUS === 'STAGED');
}

const STATUS_ICON_BY_LABEL: Record<string, AiConsoleIconId> = {
  READY: 'status-ready',
  ONLINE: 'status-online',
  'NOT READY': 'status-not-ready',
  'NOT REQUIRED': 'status-pending',
  BLOCKED: 'status-blocked',
  THINKING: 'status-thinking',
  GENERATING: 'status-generating',
  RENDER: 'status-generating',
  TOOL: 'status-generating',
  PATCHING: 'status-generating',
  COMPARING: 'status-generating',
  TESTING: 'status-generating',
  COMPILING: 'status-thinking',
  REVIEW: 'status-review',
  APPROVED: 'status-approved',
  ERROR: 'status-error',
  PENDING: 'status-pending',
  FIXTURE: 'status-pending',
  IDLE: 'status-pending',
  REVERTED: 'status-pending',
};

export function statusIconForLabel(label: string): AiConsoleIconId {
  return STATUS_ICON_BY_LABEL[label.toUpperCase()] ?? 'status-pending';
}

export const AIC_CONSOLE_MARK: Record<'opus' | 'grok' | 'authority', AiConsoleIconId> = {
  opus: 'mark-opus',
  grok: 'mark-grok',
  authority: 'mark-authority',
};

export const AIC_EMPTY_ICON = {
  context: 'empty-context',
  authority: 'empty-authority',
  messages: 'empty-messages',
  attachments: 'empty-attachments',
  concept: 'empty-concept',
  assets: 'empty-assets',
  staged: 'empty-staged',
} as const;

export const AIC_READINESS_ICON: Record<'PASS' | 'LOCKED' | 'PENDING' | 'READY', AiConsoleIconId> = {
  PASS: 'status-approved',
  LOCKED: 'status-blocked',
  PENDING: 'status-pending',
  READY: 'status-ready',
};

export const AIC_STAGE_ICON: Record<string, AiConsoleIconId> = {
  'page-concept': 'grok-stage-concept',
  'authority-pair': 'grok-stage-pair',
  'composer-handoff': 'grok-stage-handoff',
  'ready-for-assets': 'grok-stage-ready',
};

function primitiveToSvg(primitive: AiConsoleIconPrimitive): string {
  if (primitive.kind === 'path') {
    return primitive.fill
      ? `<path d="${primitive.d}" fill="currentColor" stroke="none"/>`
      : `<path d="${primitive.d}" fill="none" stroke="currentColor" stroke-width="${AIC_ICON_STROKE}" stroke-linecap="square" stroke-linejoin="miter"/>`;
  }
  if (primitive.kind === 'rect') {
    return primitive.fill
      ? `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="currentColor" stroke="none"/>`
      : `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="none" stroke="currentColor" stroke-width="${AIC_ICON_STROKE}"/>`;
  }
  return `<line x1="${primitive.x1}" y1="${primitive.y1}" x2="${primitive.x2}" y2="${primitive.y2}" stroke="currentColor" stroke-width="${AIC_ICON_STROKE}" stroke-linecap="square"/>`;
}

export function renderAiConsoleIconSvg(id: AiConsoleIconId): string {
  const def = getAiConsoleIconDef(id);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${AIC_ICON_VIEWBOX} ${AIC_ICON_VIEWBOX}" fill="none" data-aic-icon="${def.id}" data-aic-icon-status="${AIC_ICON_STATUS}" data-aic-icon-version="${AIC_ICON_VERSION}">${def.primitives.map(primitiveToSvg).join('')}</svg>`;
}
