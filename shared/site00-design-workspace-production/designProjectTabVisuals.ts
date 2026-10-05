/**
 * P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1 — staged visual support pack
 * for the seven live project-level Design Workspace tabs.
 *
 * Opus owns the surfaces. This catalog owns the drawings those surfaces
 * already have slots for: destination glyphs, collection covers, empty
 * plates, material/texture tiles, history marks, utility tiles.
 *
 * Status is STAGED. Nothing here mutates an approved SITE 00 / NDXBOOK
 * asset. The dump lands in `public/site00/project-tabs/staged/` for
 * founder review; the surfaces read the same files through public URLs.
 *
 * Construction (icons): 24×24, 1.5 stroke, square caps, currentColor.
 * Construction (plates): 320×200, NDX ink / paper / lime, labelled so a
 * missing photograph still reads as an index card, not a broken image.
 */

export const PTV_VIEWBOX = 24;
export const PTV_STROKE = 1.5;
export const PTV_STATUS = 'STAGED' as const;
export const PTV_VERSION = 'P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1';
export const PTV_FAMILY = 'SITE00_PROJECT_TAB_LINE_V1';
export const PTV_PUBLIC_ROOT = '/site00/project-tabs/staged';

export type ProjectTabDestination =
  | 'hamburger'
  | 'references'
  | 'assets'
  | 'pages'
  | 'skins'
  | 'history'
  | 'more'
  | 'shared';

export type ProjectTabUsage =
  | 'icon'
  | 'badge'
  | 'cover'
  | 'preview'
  | 'placeholder'
  | 'utility-tile'
  | 'thumbnail';

export type ProjectTabPrimitive =
  | { kind: 'path'; d: string; fill?: boolean }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; fill?: boolean }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill?: boolean }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number };

export type ProjectTabIconDef = {
  id: ProjectTabIconId;
  tab: ProjectTabDestination;
  usage: ProjectTabUsage;
  label: string;
  intended: string;
  primitives: readonly ProjectTabPrimitive[];
};

export const PTV_ICON_IDS = [
  /* hamburger / destinations */
  'dest-workspace',
  'dest-references',
  'dest-assets',
  'dest-pages',
  'dest-skins',
  'dest-history',
  'dest-more',
  'dest-twin-qa',
  'dest-opus-native',
  'dest-icons',
  'dest-archive',
  'dest-projects',
  'dest-design',
  'dest-experience',
  'dest-account',
  'dest-exit',
  'dest-pipeline',
  'dest-creative',
  /* references */
  'ref-all',
  'ref-authority',
  'ref-brand',
  'ref-page',
  'ref-component',
  'ref-icon',
  'ref-archived',
  'ref-upload',
  'ref-assign',
  'ref-compare',
  'ref-inspect',
  /* assets */
  'asset-hero',
  'asset-photo',
  'asset-texture',
  'asset-icon',
  'asset-layout',
  'asset-other',
  'asset-replace',
  'asset-regenerate',
  'asset-inspect',
  'asset-upload',
  /* pages */
  'page-root',
  'page-child',
  'page-grandchild',
  'page-family',
  'page-needed',
  'page-approved',
  'page-map',
  'page-create',
  /* skins */
  'skin-palette',
  'skin-type',
  'skin-material',
  'skin-texture',
  'skin-component',
  'skin-coverage',
  /* history */
  'hist-concept',
  'hist-authority',
  'hist-promotion',
  'hist-review',
  'hist-handoff',
  'hist-lock',
  'hist-asset',
  'hist-build',
  'hist-event',
  /* more */
  'more-context',
  'more-health',
  'more-qa',
  'more-diagnostic',
  'more-icons',
  'more-manifest',
  'more-settings',
  'more-archive',
  /* stamps */
  'stamp-approved',
  'stamp-staged',
  'stamp-needed',
  'stamp-review',
  'stamp-empty',
] as const;

export type ProjectTabIconId = (typeof PTV_ICON_IDS)[number];

const I = (
  id: ProjectTabIconId,
  tab: ProjectTabDestination,
  usage: ProjectTabUsage,
  label: string,
  intended: string,
  primitives: readonly ProjectTabPrimitive[],
): ProjectTabIconDef => ({ id, tab, usage, label, intended, primitives });

const P = (d: string, fill = false): ProjectTabPrimitive => ({ kind: 'path', d, fill });
const R = (x: number, y: number, w: number, h: number, fill = false): ProjectTabPrimitive => ({
  kind: 'rect',
  x,
  y,
  w,
  h,
  fill,
});
const C = (cx: number, cy: number, r: number, fill = false): ProjectTabPrimitive => ({
  kind: 'circle',
  cx,
  cy,
  r,
  fill,
});
const L = (x1: number, y1: number, x2: number, y2: number): ProjectTabPrimitive => ({
  kind: 'line',
  x1,
  y1,
  x2,
  y2,
});

const ICONS: Record<ProjectTabIconId, ProjectTabIconDef> = {
  'dest-workspace': I('dest-workspace', 'hamburger', 'icon', 'WORKSPACE HOME', 'Hamburger destination · workspace', [
    P('M4 11 12 5l8 6v8H4z'),
    L(10, 19, 10, 13),
    L(14, 19, 14, 13),
  ]),
  'dest-references': I('dest-references', 'references', 'icon', 'REFERENCES', 'Hamburger + references tab', [
    R(4, 6, 16, 12),
    P('M4 15l4-3.5 4 3 3-2.2 5 3'),
    C(16.5, 9, 1.2, true),
  ]),
  'dest-assets': I('dest-assets', 'assets', 'icon', 'ASSETS', 'Hamburger + assets tab', [
    P('M12 4l8 4v8l-8 4-8-4V8z'),
    L(12, 4, 12, 20),
    L(4, 8, 20, 8),
  ]),
  'dest-pages': I('dest-pages', 'pages', 'icon', 'PAGES', 'Hamburger + pages tab', [
    P('M7 4h7l4 4v12H7z'),
    L(14, 4, 14, 8),
    L(18, 8, 14, 8),
    L(10, 12, 16, 12),
    L(10, 15, 16, 15),
  ]),
  'dest-skins': I('dest-skins', 'skins', 'icon', 'SKINS', 'Hamburger + skins tab', [
    R(4, 4, 16, 16),
    L(10, 4, 10, 20),
    L(15, 4, 15, 20),
    L(4, 12, 20, 12),
  ]),
  'dest-history': I('dest-history', 'history', 'icon', 'HISTORY', 'Hamburger + history tab', [
    C(12, 12, 8),
    L(12, 7, 12, 12),
    L(12, 12, 16, 14.5),
  ]),
  'dest-more': I('dest-more', 'more', 'icon', 'MORE', 'Hamburger + more tab', [
    R(4, 4, 6, 6),
    R(14, 4, 6, 6),
    R(4, 14, 6, 6),
    R(14, 14, 6, 6),
  ]),
  'dest-twin-qa': I('dest-twin-qa', 'hamburger', 'icon', 'TWIN / QA', 'Pinned tool · twin review', [
    R(3, 6, 8, 9),
    R(13, 6, 8, 9),
    L(8, 18, 16, 18),
  ]),
  'dest-opus-native': I('dest-opus-native', 'hamburger', 'icon', 'OPUS NATIVE', 'Pinned tool · diagnostics', [
    P('M12 3.5 19 6.2v6.2c0 4-3 6.6-7 7.4-4-.8-7-3.4-7-7.4V6.2z'),
    L(12, 8, 12, 13),
    C(12, 16, 0.8, true),
  ]),
  'dest-icons': I('dest-icons', 'more', 'icon', 'ICON SHEET', 'Pinned tool · icon sheet', [
    C(7, 7, 2),
    R(13, 5, 5, 5),
    L(5, 15, 9, 19),
    L(9, 15, 5, 19),
    P('M14 15h5v5h-5z'),
  ]),
  'dest-archive': I('dest-archive', 'more', 'icon', 'ARCHIVE', 'Pinned tool · archive', [
    R(4, 5, 16, 4),
    P('M6 9v10h12V9'),
    L(10, 13, 14, 13),
  ]),
  'dest-projects': I('dest-projects', 'hamburger', 'icon', 'PROJECTS INDEX', 'Utility · projects index', [
    P('M12 4l8 4-8 4-8-4z'),
    P('M4 13l8 4 8-4'),
    P('M4 17l8 4 8-4'),
  ]),
  'dest-design': I('dest-design', 'hamburger', 'icon', 'DESIGN MODULE', 'Utility · design module', [
    L(5, 19, 5, 11),
    L(10, 19, 10, 6),
    L(15, 19, 15, 13),
    L(20, 19, 20, 8),
  ]),
  'dest-experience': I('dest-experience', 'hamburger', 'icon', 'EXPERIENCE MODULE', 'Utility · experience module', [
    C(12, 12, 8),
    C(12, 12, 3),
    L(12, 4, 12, 7),
    L(12, 17, 12, 20),
  ]),
  'dest-account': I('dest-account', 'hamburger', 'icon', 'ACCOUNT', 'Utility · account', [
    C(12, 9, 3.4),
    P('M5 20c.8-3.4 3.2-5 7-5s6.2 1.6 7 5'),
  ]),
  'dest-exit': I('dest-exit', 'hamburger', 'icon', 'EXIT PROJECT', 'Utility · exit', [
    P('M14 5H5v14h9'),
    L(11, 12, 20, 12),
    P('M17 8.5 20 12l-3 3.5'),
  ]),
  'dest-pipeline': I('dest-pipeline', 'hamburger', 'icon', 'PIPELINE', 'Pinned · pipeline / readiness', [
    L(4, 12, 20, 12),
    C(6, 12, 2),
    C(12, 12, 2),
    C(18, 12, 2),
  ]),
  'dest-creative': I('dest-creative', 'more', 'icon', 'CREATIVE CONTEXT', 'Pinned · creative brief', [
    R(5, 5, 14, 14),
    L(8, 10, 16, 10),
    L(8, 13, 16, 13),
    L(8, 16, 13, 16),
  ]),
  'ref-all': I('ref-all', 'references', 'icon', 'ALL REFERENCES', 'References rail · all', [
    R(4, 5, 7, 7),
    R(13, 5, 7, 7),
    R(4, 14, 7, 6),
    R(13, 14, 7, 6),
  ]),
  'ref-authority': I('ref-authority', 'references', 'icon', 'AUTHORITY', 'References collection · authority', [
    P('M12 4 19 7v6c0 4-3 6.4-7 7.2C8 19.4 5 17 5 13V7z'),
  ]),
  'ref-brand': I('ref-brand', 'references', 'icon', 'BRAND', 'References collection · brand', [
    R(5, 6, 14, 12),
    P('M8 15V9h3.2c1.6 0 2.6.8 2.6 2.2S12.8 13.4 11.2 13.4H8'),
  ]),
  'ref-page': I('ref-page', 'references', 'icon', 'PAGE', 'References collection · page', [
    P('M7 4h8l4 4v12H7z'),
    L(15, 4, 15, 8),
    L(19, 8, 15, 8),
  ]),
  'ref-component': I('ref-component', 'references', 'icon', 'COMPONENT', 'References collection · component', [
    R(5, 5, 6, 6),
    R(13, 5, 6, 6),
    R(9, 13, 6, 6),
  ]),
  'ref-icon': I('ref-icon', 'references', 'icon', 'ICON / SYMBOL', 'References collection · icon', [
    C(12, 12, 7),
    L(12, 7, 12, 17),
    L(7, 12, 17, 12),
  ]),
  'ref-archived': I('ref-archived', 'references', 'icon', 'ARCHIVED', 'References collection · archived', [
    R(4, 5, 16, 4),
    P('M6 9v10h12V9'),
    L(9, 13, 15, 13),
  ]),
  'ref-upload': I('ref-upload', 'references', 'icon', 'UPLOAD', 'References action bar', [
    L(12, 16, 12, 6),
    P('M8 9.5 12 6l4 3.5'),
    P('M5 16v3h14v-3'),
  ]),
  'ref-assign': I('ref-assign', 'references', 'icon', 'ASSIGN', 'References action · assign to pages', [
    P('M9 14 13.5 9.5'),
    P('M10 7.5 12 5.2a4 4 0 0 1 5.6 5.6L15.4 13'),
    P('M14 16.5 12 18.8A4 4 0 0 1 6.4 13.2L8.6 11'),
  ]),
  'ref-compare': I('ref-compare', 'references', 'icon', 'COMPARE', 'References / assets / history compare', [
    R(4, 7, 8, 11),
    R(12, 5, 8, 11),
  ]),
  'ref-inspect': I('ref-inspect', 'references', 'icon', 'INSPECT', 'References / assets inspect', [
    C(11, 11, 6),
    L(15.5, 15.5, 20, 20),
  ]),
  'asset-hero': I('asset-hero', 'assets', 'icon', 'HERO', 'Assets category · hero', [
    R(4, 6, 16, 12),
    P('M4 16l5-5 4 3 3-2 4 4'),
  ]),
  'asset-photo': I('asset-photo', 'assets', 'icon', 'PHOTOGRAPHY', 'Assets category · photography', [
    R(4, 7, 16, 11),
    C(12, 12.5, 3),
    R(8, 5, 4, 2, true),
  ]),
  'asset-texture': I('asset-texture', 'assets', 'icon', 'TEXTURE', 'Assets category · texture', [
    R(4, 4, 16, 16),
    L(4, 9, 20, 9),
    L(4, 14, 20, 14),
    L(9, 4, 9, 20),
    L(15, 4, 15, 20),
  ]),
  'asset-icon': I('asset-icon', 'assets', 'icon', 'ICON', 'Assets category · icon', [
    P('M6 8h4v4H6z'),
    P('M14 8h4v4h-4z'),
    P('M10 14h4v4h-4z'),
  ]),
  'asset-layout': I('asset-layout', 'assets', 'icon', 'LAYOUT', 'Assets category · layout', [
    R(4, 4, 16, 16),
    L(4, 9, 20, 9),
    L(11, 9, 11, 20),
  ]),
  'asset-other': I('asset-other', 'assets', 'icon', 'OTHER', 'Assets category · other', [
    R(6, 6, 12, 12),
    L(6, 12, 18, 12),
  ]),
  'asset-replace': I('asset-replace', 'assets', 'icon', 'REPLACE', 'Assets workflow · replace', [
    P('M7 8h10l-3-3'),
    P('M17 16H7l3 3'),
  ]),
  'asset-regenerate': I('asset-regenerate', 'assets', 'icon', 'REGENERATE', 'Assets workflow · regenerate', [
    P('M7 8a6 6 0 1 1-1 4'),
    P('M7 4v5h5'),
  ]),
  'asset-inspect': I('asset-inspect', 'assets', 'icon', 'INSPECT ASSET', 'Assets workflow · inspect', [
    C(11, 11, 6),
    L(15.5, 15.5, 20, 20),
    R(8, 9, 6, 4),
  ]),
  'asset-upload': I('asset-upload', 'assets', 'icon', 'UPLOAD ASSET', 'Assets action · upload', [
    L(12, 17, 12, 6),
    P('M8 9.5 12 6l4 3.5'),
    P('M5 17v2h14v-2'),
  ]),
  'page-root': I('page-root', 'pages', 'icon', 'ROOT', 'Pages filter · root', [
    P('M12 4v16'),
    P('M12 8l6 4-6 4'),
    C(12, 5, 1.4, true),
  ]),
  'page-child': I('page-child', 'pages', 'icon', 'CHILD', 'Pages filter · child', [
    L(6, 5, 6, 12),
    L(6, 12, 14, 12),
    R(14, 9, 6, 6),
  ]),
  'page-grandchild': I('page-grandchild', 'pages', 'icon', 'GRANDCHILD', 'Pages filter · grandchild', [
    L(5, 5, 5, 19),
    L(5, 12, 11, 12),
    L(11, 12, 11, 17),
    L(11, 17, 17, 17),
    R(17, 15, 3, 4),
  ]),
  'page-family': I('page-family', 'pages', 'icon', 'FAMILY', 'Pages family card mark', [
    R(4, 8, 5, 10),
    R(10, 5, 5, 13),
    R(16, 10, 4, 8),
  ]),
  'page-needed': I('page-needed', 'pages', 'badge', 'NEEDS DESIGN', 'Pages status · needs design', [
    C(12, 12, 8),
    L(12, 8, 12, 13),
    C(12, 16.2, 0.7, true),
  ]),
  'page-approved': I('page-approved', 'pages', 'badge', 'APPROVED', 'Pages status · approved', [
    C(12, 12, 8),
    P('M8 12.2 11 15l5-6'),
  ]),
  'page-map': I('page-map', 'pages', 'icon', 'PROJECT MAP', 'Pages architecture map', [
    C(6, 7, 2),
    C(18, 7, 2),
    C(12, 17, 2),
    L(8, 7, 16, 7),
    L(12, 7, 12, 15),
  ]),
  'page-create': I('page-create', 'pages', 'icon', 'CREATE PAGE', 'Pages action · create', [
    L(12, 5, 12, 19),
    L(5, 12, 19, 12),
  ]),
  'skin-palette': I('skin-palette', 'skins', 'icon', 'PALETTE', 'Skins foundations · palette', [
    R(4, 6, 5, 12, true),
    R(10, 6, 4, 12),
    R(15, 6, 5, 12),
  ]),
  'skin-type': I('skin-type', 'skins', 'icon', 'TYPE', 'Skins foundations · typography', [
    P('M6 18V8h5'),
    L(6, 8, 13, 8),
    P('M15 18V10h4'),
  ]),
  'skin-material': I('skin-material', 'skins', 'icon', 'MATERIAL', 'Skins · materials', [
    R(5, 6, 14, 12),
    P('M5 14l4-3 3 2 3-3 4 4'),
  ]),
  'skin-texture': I('skin-texture', 'skins', 'icon', 'TEXTURE', 'Skins · texture language', [
    L(5, 6, 19, 6),
    L(5, 10, 19, 10),
    L(5, 14, 19, 14),
    L(5, 18, 19, 18),
  ]),
  'skin-component': I('skin-component', 'skins', 'icon', 'COMPONENT', 'Skins · component grammar', [
    R(4, 8, 7, 8),
    R(13, 6, 7, 5),
    R(13, 13, 7, 5),
  ]),
  'skin-coverage': I('skin-coverage', 'skins', 'icon', 'COVERAGE', 'Skins · application coverage', [
    C(12, 12, 8),
    P('M12 4a8 8 0 0 1 8 8H12z', true),
  ]),
  'hist-concept': I('hist-concept', 'history', 'badge', 'CONCEPT', 'History event · concept', [
    R(5, 5, 14, 14),
    P('M8 16V8l4 4 4-4v8'),
  ]),
  'hist-authority': I('hist-authority', 'history', 'badge', 'AUTHORITY', 'History event · authority', [
    P('M12 4 19 7v6c0 4-3 6.4-7 7.2C8 19.4 5 17 5 13V7z'),
  ]),
  'hist-promotion': I('hist-promotion', 'history', 'badge', 'PROMOTION', 'History event · promotion', [
    P('M6 14l6-8 6 8H6z', true),
    L(8, 18, 16, 18),
  ]),
  'hist-review': I('hist-review', 'history', 'badge', 'REVIEW', 'History event · review', [
    C(12, 12, 3),
    C(12, 12, 8),
  ]),
  'hist-handoff': I('hist-handoff', 'history', 'badge', 'HANDOFF', 'History event · handoff', [
    L(5, 12, 19, 12),
    P('M15 8l4 4-4 4'),
    R(4, 9, 4, 6),
  ]),
  'hist-lock': I('hist-lock', 'history', 'badge', 'LOCK', 'History event · lock', [
    R(7, 11, 10, 8),
    P('M9 11V8a3 3 0 0 1 6 0v3'),
  ]),
  'hist-asset': I('hist-asset', 'history', 'badge', 'ASSET', 'History event · asset', [
    R(5, 7, 14, 10),
    P('M5 15l4-3 3 2 3-2.5 4 3.5'),
  ]),
  'hist-build': I('hist-build', 'history', 'badge', 'BUILD', 'History event · build', [
    R(5, 8, 6, 10),
    R(13, 5, 6, 13),
  ]),
  'hist-event': I('hist-event', 'history', 'badge', 'EVENT', 'History event · generic', [
    C(12, 12, 3, true),
    C(12, 12, 8),
  ]),
  'more-context': I('more-context', 'more', 'icon', 'CREATIVE CONTEXT', 'More module · creative context', [
    R(5, 5, 14, 14),
    L(8, 10, 16, 10),
    L(8, 13, 16, 13),
    L(8, 16, 12, 16),
  ]),
  'more-health': I('more-health', 'more', 'icon', 'SYSTEM HEALTH', 'More module · health', [
    C(12, 12, 8),
    P('M12 6v6l4 2'),
  ]),
  'more-qa': I('more-qa', 'more', 'icon', 'TWIN QA', 'More module · twin QA', [
    R(3, 6, 8, 10),
    R(13, 6, 8, 10),
    L(7, 19, 17, 19),
  ]),
  'more-diagnostic': I('more-diagnostic', 'more', 'icon', 'DIAGNOSTIC', 'More module · opus native', [
    L(5, 17, 9, 10),
    L(9, 10, 12, 14),
    L(12, 14, 19, 6),
  ]),
  'more-icons': I('more-icons', 'more', 'icon', 'ICON SHEET', 'More module · icon sheet', [
    C(7, 8, 2),
    R(14, 6, 4, 4),
    P('M6 15h4v4H6z'),
    L(15, 15, 19, 19),
    L(19, 15, 15, 19),
  ]),
  'more-manifest': I('more-manifest', 'more', 'icon', 'MANIFEST', 'More module · manifest inspector', [
    P('M7 4h8l4 4v12H7z'),
    L(10, 12, 16, 12),
    L(10, 15, 16, 15),
    L(10, 18, 14, 18),
  ]),
  'more-settings': I('more-settings', 'more', 'icon', 'SETTINGS', 'More module · project settings', [
    L(4, 8, 20, 8),
    L(4, 16, 20, 16),
    C(9, 8, 2),
    C(15, 16, 2),
  ]),
  'more-archive': I('more-archive', 'more', 'icon', 'ARCHIVE', 'More module · archive', [
    R(4, 5, 16, 4),
    P('M6 9v10h12V9'),
    L(10, 13, 14, 13),
  ]),
  'stamp-approved': I('stamp-approved', 'shared', 'badge', 'APPROVED', 'Status stamp · approved', [
    P('M6 12.2 10.2 16.2 18 7.5'),
  ]),
  'stamp-staged': I('stamp-staged', 'shared', 'badge', 'STAGED', 'Status stamp · staged', [
    R(5, 5, 14, 14),
    L(5, 12, 19, 12),
  ]),
  'stamp-needed': I('stamp-needed', 'shared', 'badge', 'NEEDED', 'Status stamp · needs design', [
    L(12, 6, 12, 13),
    C(12, 17, 0.8, true),
    R(5, 5, 14, 14),
  ]),
  'stamp-review': I('stamp-review', 'shared', 'badge', 'REVIEW', 'Status stamp · in review', [
    C(12, 12, 3),
    C(12, 12, 7),
  ]),
  'stamp-empty': I('stamp-empty', 'shared', 'placeholder', 'EMPTY', 'Empty-state mark', [
    R(5, 6, 14, 12),
    L(9, 12, 15, 12),
  ]),
};

export function getProjectTabIconDef(id: ProjectTabIconId): ProjectTabIconDef {
  const found = ICONS[id];
  if (!found) throw new Error(`Staged project-tab icon missing: ${id}`);
  return found;
}

export function listProjectTabIconDefs(): ProjectTabIconDef[] {
  return PTV_ICON_IDS.map((id) => getProjectTabIconDef(id));
}

export const PTV_ICON_BY_PS: Record<string, ProjectTabIconId> = {
  PsIconHome: 'dest-workspace',
  PsIconGrid: 'dest-more',
  PsIconDoc: 'dest-pages',
  PsIconImage: 'dest-references',
  PsIconLink: 'ref-assign',
  PsIconLayers: 'dest-projects',
  PsIconPalette: 'dest-skins',
  PsIconClock: 'dest-history',
  PsIconUpload: 'asset-upload',
  PsIconSearch: 'ref-inspect',
  PsIconCompare: 'ref-compare',
  PsIconChart: 'dest-design',
  PsIconPlus: 'page-create',
  PsIconCheck: 'stamp-approved',
  PsIconFilter: 'more-settings',
  PsIconBox: 'dest-assets',
  PsIconBell: 'dest-more',
  PsIconSliders: 'more-settings',
  PsIconMonitor: 'dest-twin-qa',
  PsIconExit: 'dest-exit',
  PsIconUser: 'dest-account',
  PsIconShield: 'dest-opus-native',
  PsIconArchive: 'dest-archive',
};

export const PTV_HISTORY_ICON: Record<string, ProjectTabIconId> = {
  CONCEPT: 'hist-concept',
  AUTHORITY: 'hist-authority',
  PROMOTION: 'hist-promotion',
  REVIEW: 'hist-review',
  HANDOFF: 'hist-handoff',
  LOCK: 'hist-lock',
  ASSET: 'hist-asset',
  BUILD: 'hist-build',
  EVENT: 'hist-event',
};

export const PTV_COLLECTION_ICON: Record<string, ProjectTabIconId> = {
  all: 'ref-all',
  authority: 'ref-authority',
  brand: 'ref-brand',
  page: 'ref-page',
  component: 'ref-component',
  icon: 'ref-icon',
  archived: 'ref-archived',
};

export const PTV_ASSET_CATEGORY_ICON: Record<string, ProjectTabIconId> = {
  hero: 'asset-hero',
  photography: 'asset-photo',
  texture: 'asset-texture',
  icon: 'asset-icon',
  layout: 'asset-layout',
  other: 'asset-other',
};

/* ------------------------------------------------------------------ plates */

export type ProjectTabPlateId =
  | 'plate-ref-authority'
  | 'plate-ref-brand'
  | 'plate-ref-page'
  | 'plate-ref-component'
  | 'plate-ref-icon'
  | 'plate-ref-archived'
  | 'plate-ref-empty'
  | 'plate-asset-hero'
  | 'plate-asset-photo'
  | 'plate-asset-texture'
  | 'plate-asset-icon'
  | 'plate-asset-layout'
  | 'plate-asset-empty'
  | 'plate-asset-demand'
  | 'plate-page-family'
  | 'plate-page-map'
  | 'plate-skin-palette'
  | 'plate-skin-type'
  | 'plate-skin-material'
  | 'plate-skin-texture'
  | 'plate-hist-empty'
  | 'plate-hist-milestone'
  | 'plate-more-context'
  | 'plate-more-qa'
  | 'plate-more-diagnostic'
  | 'plate-more-icons'
  | 'plate-more-banner'
  | 'plate-hamburger-hero';

export type ProjectTabPlateDef = {
  id: ProjectTabPlateId | string;
  tab: ProjectTabDestination;
  usage: ProjectTabUsage;
  label: string;
  intended: string;
  ready: 'STAGED';
  kind: 'svg' | 'raster';
  file: string;
};

export const PTV_PLATE_IDS: ProjectTabPlateId[] = [
  'plate-ref-authority',
  'plate-ref-brand',
  'plate-ref-page',
  'plate-ref-component',
  'plate-ref-icon',
  'plate-ref-archived',
  'plate-ref-empty',
  'plate-asset-hero',
  'plate-asset-photo',
  'plate-asset-texture',
  'plate-asset-icon',
  'plate-asset-layout',
  'plate-asset-empty',
  'plate-asset-demand',
  'plate-page-family',
  'plate-page-map',
  'plate-skin-palette',
  'plate-skin-type',
  'plate-skin-material',
  'plate-skin-texture',
  'plate-hist-empty',
  'plate-hist-milestone',
  'plate-more-context',
  'plate-more-qa',
  'plate-more-diagnostic',
  'plate-more-icons',
  'plate-more-banner',
  'plate-hamburger-hero',
];

export const PTV_RASTER_PLATES: ProjectTabPlateDef[] = [
  {
    id: 'raster-ref-brand',
    tab: 'references',
    usage: 'cover',
    label: 'BRAND / IDENTITY',
    intended: 'References collection cover + hamburger hero fallback',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-ref-brand.jpg',
  },
  {
    id: 'raster-ref-authority',
    tab: 'references',
    usage: 'cover',
    label: 'AUTHORITY',
    intended: 'References authority collection cover',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-ref-authority.jpg',
  },
  {
    id: 'raster-ref-mood',
    tab: 'references',
    usage: 'cover',
    label: 'FOUNDER / MOOD',
    intended: 'References mood / founder collection cover',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-ref-mood.jpg',
  },
  {
    id: 'raster-material',
    tab: 'skins',
    usage: 'preview',
    label: 'MATERIAL / ATMOSPHERE',
    intended: 'Skins material tiles + texture fallback',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-material-atmosphere.jpg',
  },
  {
    id: 'raster-more-banner',
    tab: 'more',
    usage: 'utility-tile',
    label: 'DESIGN WORKSPACE',
    intended: 'More tab banner when the project has no family capture',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-more-banner.jpg',
  },
  {
    id: 'raster-empty-library',
    tab: 'shared',
    usage: 'placeholder',
    label: 'LIBRARY EMPTY',
    intended: 'Empty-state plate for references / assets with no media',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-empty-library.jpg',
  },
  {
    id: 'raster-page-map',
    tab: 'pages',
    usage: 'preview',
    label: 'PAGE ARCHITECTURE',
    intended: 'Pages map support + family fallback',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-page-architecture.jpg',
  },
  {
    id: 'raster-hist-milestone',
    tab: 'history',
    usage: 'thumbnail',
    label: 'MILESTONE',
    intended: 'History empty / latest-milestone thumbnail',
    ready: 'STAGED',
    kind: 'raster',
    file: 'raster/plate-hist-milestone.jpg',
  },
];

export function projectTabVisualUrl(file: string): string {
  return `${PTV_PUBLIC_ROOT}/${file}`;
}

export function projectTabIconUrl(id: ProjectTabIconId): string {
  return projectTabVisualUrl(`${id}.svg`);
}

export function projectTabPlateUrl(id: string): string {
  return projectTabVisualUrl(`${id}.svg`);
}

export function projectTabRasterUrl(file: string): string {
  return projectTabVisualUrl(file);
}

export const PTV_COLLECTION_PLATE: Record<string, string> = {
  all: 'raster/plate-ref-brand.jpg',
  authority: 'raster/plate-ref-authority.jpg',
  brand: 'raster/plate-ref-brand.jpg',
  page: 'plate-ref-page.svg',
  component: 'plate-ref-component.svg',
  icon: 'plate-ref-icon.svg',
  archived: 'plate-ref-archived.svg',
};

export const PTV_ASSET_CATEGORY_PLATE: Record<string, string> = {
  hero: 'plate-asset-hero.svg',
  photography: 'plate-asset-photo.svg',
  texture: 'plate-asset-texture.svg',
  icon: 'plate-asset-icon.svg',
  layout: 'plate-asset-layout.svg',
  other: 'plate-asset-empty.svg',
};

export const PTV_MATERIAL_PLATE: Record<string, string> = {
  concrete: 'raster/plate-material-atmosphere.jpg',
  'brushed-metal': 'plate-skin-material.svg',
  glass: 'plate-skin-material.svg',
  paper: 'raster/plate-ref-mood.jpg',
  matte: 'plate-skin-material.svg',
  architectural: 'raster/plate-material-atmosphere.jpg',
  grain: 'plate-skin-texture.svg',
  halftone: 'plate-skin-texture.svg',
  linework: 'plate-skin-texture.svg',
  'data-grid': 'plate-skin-texture.svg',
};

export function pageFamilyPlateId(label: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'family';
  return `family-${slug}`;
}

function primitiveToSvg(primitive: ProjectTabPrimitive): string {
  if (primitive.kind === 'path') {
    return primitive.fill
      ? `<path d="${primitive.d}" fill="currentColor" stroke="none"/>`
      : `<path d="${primitive.d}" fill="none" stroke="currentColor" stroke-width="${PTV_STROKE}" stroke-linecap="square" stroke-linejoin="miter"/>`;
  }
  if (primitive.kind === 'rect') {
    return primitive.fill
      ? `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="currentColor" stroke="none"/>`
      : `<rect x="${primitive.x}" y="${primitive.y}" width="${primitive.w}" height="${primitive.h}" fill="none" stroke="currentColor" stroke-width="${PTV_STROKE}"/>`;
  }
  if (primitive.kind === 'circle') {
    return primitive.fill
      ? `<circle cx="${primitive.cx}" cy="${primitive.cy}" r="${primitive.r}" fill="currentColor" stroke="none"/>`
      : `<circle cx="${primitive.cx}" cy="${primitive.cy}" r="${primitive.r}" fill="none" stroke="currentColor" stroke-width="${PTV_STROKE}"/>`;
  }
  return `<line x1="${primitive.x1}" y1="${primitive.y1}" x2="${primitive.x2}" y2="${primitive.y2}" stroke="currentColor" stroke-width="${PTV_STROKE}" stroke-linecap="square"/>`;
}

export function renderProjectTabIconSvg(id: ProjectTabIconId): string {
  const def = getProjectTabIconDef(id);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PTV_VIEWBOX} ${PTV_VIEWBOX}" fill="none" data-ptv-icon="${def.id}" data-ptv-status="${PTV_STATUS}" data-ptv-version="${PTV_VERSION}">${def.primitives.map(primitiveToSvg).join('')}</svg>`;
}

const PLATE_COPY: Record<ProjectTabPlateId, { kicker: string; title: string; pattern: PlatePattern }> = {
  'plate-ref-authority': { kicker: 'AUTHORITY', title: 'THE SIGNAL\nIS THE INDEX.', pattern: 'signal' },
  'plate-ref-brand': { kicker: 'BRAND / IDENTITY', title: 'NDX', pattern: 'mark' },
  'plate-ref-page': { kicker: 'PAGE REFERENCE', title: 'SCREEN\nAUTHORITY', pattern: 'grid' },
  'plate-ref-component': { kicker: 'COMPONENT', title: 'REGION\nGRAMMAR', pattern: 'tiles' },
  'plate-ref-icon': { kicker: 'ICON / SYMBOL', title: 'MARK\nSYSTEM', pattern: 'marks' },
  'plate-ref-archived': { kicker: 'ARCHIVED', title: 'SUPERSEDED\nLINEAGE', pattern: 'archive' },
  'plate-ref-empty': { kicker: 'LIBRARY', title: 'NO PREVIEW', pattern: 'empty' },
  'plate-asset-hero': { kicker: 'HERO PLATE', title: 'PRIMARY\nIMAGE', pattern: 'hero' },
  'plate-asset-photo': { kicker: 'PHOTOGRAPHY', title: 'EDITORIAL\nSTILL', pattern: 'photo' },
  'plate-asset-texture': { kicker: 'TEXTURE', title: 'GRAIN /\nPLATE', pattern: 'grain' },
  'plate-asset-icon': { kicker: 'ICON SYSTEM', title: 'SYMBOL\nSET', pattern: 'marks' },
  'plate-asset-layout': { kicker: 'LAYOUT', title: 'GRID /\nTEMPLATE', pattern: 'grid' },
  'plate-asset-empty': { kicker: 'ASSET DESK', title: 'NO ASSET\nYET', pattern: 'empty' },
  'plate-asset-demand': { kicker: 'SLOT COVERAGE', title: 'DEMAND\nMAP', pattern: 'tiles' },
  'plate-page-family': { kicker: 'PAGE FAMILY', title: 'CLUSTER', pattern: 'tree' },
  'plate-page-map': { kicker: 'ARCHITECTURE', title: 'PROJECT\nMAP', pattern: 'tree' },
  'plate-skin-palette': { kicker: 'PALETTE', title: 'INK / PAPER\n/ LIME', pattern: 'swatch' },
  'plate-skin-type': { kicker: 'TYPOGRAPHY', title: 'Aa', pattern: 'type' },
  'plate-skin-material': { kicker: 'MATERIAL', title: 'SURFACE', pattern: 'material' },
  'plate-skin-texture': { kicker: 'TEXTURE', title: 'TREATMENT', pattern: 'grain' },
  'plate-hist-empty': { kicker: 'HISTORY', title: 'NO EVENTS\nYET', pattern: 'empty' },
  'plate-hist-milestone': { kicker: 'MILESTONE', title: 'PROMOTION', pattern: 'stamp' },
  'plate-more-context': { kicker: 'CREATIVE', title: 'CONTEXT', pattern: 'signal' },
  'plate-more-qa': { kicker: 'TWIN / QA', title: 'SIDE BY\nSIDE', pattern: 'split' },
  'plate-more-diagnostic': { kicker: 'DIAGNOSTIC', title: 'OPUS\nNATIVE', pattern: 'grid' },
  'plate-more-icons': { kicker: 'ICON SHEET', title: 'SYMBOL\nLIBRARY', pattern: 'marks' },
  'plate-more-banner': { kicker: 'UTILITIES', title: 'DESIGN\nWORKSPACE', pattern: 'mark' },
  'plate-hamburger-hero': { kicker: 'PROJECT', title: 'NDX', pattern: 'mark' },
};

type PlatePattern =
  | 'mark'
  | 'signal'
  | 'grid'
  | 'tiles'
  | 'marks'
  | 'archive'
  | 'empty'
  | 'hero'
  | 'photo'
  | 'grain'
  | 'tree'
  | 'swatch'
  | 'type'
  | 'material'
  | 'stamp'
  | 'split';

function platePattern(pattern: PlatePattern): string {
  switch (pattern) {
    case 'mark':
      return `<rect x="214" y="28" width="78" height="78" fill="#dbff00"/><text x="253" y="78" text-anchor="middle" fill="#0a0a0a" font-size="22" font-weight="700" font-family="ui-monospace, Menlo, monospace">NDX</text>`;
    case 'signal':
      return `<rect x="220" y="36" width="72" height="128" fill="#111"/><rect x="220" y="36" width="6" height="128" fill="#dbff00"/>`;
    case 'grid':
      return `<g stroke="#2a2a2a" stroke-width="1">${[0, 1, 2, 3]
        .flatMap((x) => [0, 1, 2].map((y) => `<rect x="${208 + x * 24}" y="${40 + y * 28}" width="20" height="24" fill="none"/>`))
        .join('')}</g>`;
    case 'tiles':
      return `<rect x="214" y="40" width="34" height="34" fill="#1a1a1a"/><rect x="254" y="40" width="34" height="34" fill="#dbff00"/><rect x="214" y="80" width="34" height="34" fill="#111"/><rect x="254" y="80" width="34" height="34" fill="#2a2a2a"/>`;
    case 'marks':
      return `<circle cx="232" cy="64" r="10" fill="none" stroke="#dbff00" stroke-width="1.5"/><rect x="250" y="54" width="20" height="20" fill="none" stroke="#f4f4f4" stroke-width="1.5"/><path d="M222 100h20M232 90v20" stroke="#f4f4f4" stroke-width="1.5"/><rect x="254" y="92" width="16" height="16" fill="#dbff00"/>`;
    case 'archive':
      return `<rect x="214" y="48" width="78" height="18" fill="#2a2a2a"/><rect x="222" y="66" width="62" height="70" fill="none" stroke="#555" stroke-width="1.5"/>`;
    case 'empty':
      return `<rect x="210" y="48" width="82" height="82" fill="none" stroke="#333" stroke-dasharray="4 4"/><path d="M244 80v28M230 94h28" stroke="#dbff00" stroke-width="1.5"/>`;
    case 'hero':
      return `<rect x="200" y="28" width="100" height="144" fill="#111"/><rect x="200" y="28" width="100" height="8" fill="#dbff00"/>`;
    case 'photo':
      return `<circle cx="252" cy="92" r="28" fill="none" stroke="#555" stroke-width="1.5"/><circle cx="252" cy="92" r="10" fill="#1a1a1a"/>`;
    case 'grain':
      return `<g fill="#2a2a2a">${Array.from({ length: 40 }, (_, i) => {
        const x = 210 + (i % 8) * 10;
        const y = 40 + Math.floor(i / 8) * 22;
        return `<rect x="${x}" y="${y}" width="2" height="2"/>`;
      }).join('')}</g>`;
    case 'tree':
      return `<circle cx="252" cy="52" r="6" fill="#dbff00"/><line x1="252" y1="58" x2="252" y2="88" stroke="#666"/><line x1="220" y1="88" x2="284" y2="88" stroke="#666"/><circle cx="220" cy="96" r="4" fill="#f4f4f4"/><circle cx="252" cy="96" r="4" fill="#f4f4f4"/><circle cx="284" cy="96" r="4" fill="#f4f4f4"/>`;
    case 'swatch':
      return `<rect x="214" y="40" width="18" height="88" fill="#000"/><rect x="234" y="40" width="18" height="88" fill="#f4f4f4"/><rect x="254" y="40" width="18" height="88" fill="#dbff00"/><rect x="274" y="40" width="16" height="88" fill="#757575"/>`;
    case 'type':
      return `<text x="252" y="110" text-anchor="middle" fill="#f4f4f4" font-size="54" font-family="ui-serif, Georgia, serif">Aa</text>`;
    case 'material':
      return `<rect x="210" y="40" width="86" height="110" fill="#1a1a1a"/><rect x="210" y="40" width="86" height="110" fill="none" stroke="#444"/><line x1="210" y1="95" x2="296" y2="95" stroke="#333"/>`;
    case 'stamp':
      return `<rect x="220" y="48" width="64" height="64" fill="#dbff00"/><rect x="232" y="64" width="40" height="32" fill="none" stroke="#0a0a0a" stroke-width="2"/>`;
    case 'split':
      return `<rect x="210" y="40" width="38" height="110" fill="#111"/><rect x="256" y="40" width="38" height="110" fill="#1c1c1c"/><rect x="246" y="86" width="12" height="18" fill="#dbff00"/>`;
    default:
      return '';
  }
}

export function renderProjectTabPlateSvg(
  id: ProjectTabPlateId | string,
  override?: { kicker?: string; title?: string; pattern?: PlatePattern },
): string {
  const known = (PLATE_COPY as Record<string, { kicker: string; title: string; pattern: PlatePattern }>)[id];
  const kicker = override?.kicker ?? known?.kicker ?? 'PROJECT';
  const title = override?.title ?? known?.title ?? id.toUpperCase();
  const pattern = override?.pattern ?? known?.pattern ?? 'grid';
  const lines = title.split('\n');
  const titleSvg = lines
    .map(
      (line, index) =>
        `<text x="24" y="${88 + index * 28}" fill="#f4f4f4" font-size="22" font-weight="700" letter-spacing="0.04em" font-family="ui-monospace, Menlo, monospace">${escapeXml(line)}</text>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200" data-ptv-plate="${id}" data-ptv-status="${PTV_STATUS}" data-ptv-version="${PTV_VERSION}">
  <rect width="320" height="200" fill="#0a0a0a"/>
  <rect x="8" y="8" width="304" height="184" fill="none" stroke="#2a2a2a"/>
  <text x="24" y="36" fill="#dbff00" font-size="9" letter-spacing="0.16em" font-family="ui-monospace, Menlo, monospace">${escapeXml(kicker)}</text>
  ${titleSvg}
  ${platePattern(pattern)}
  <text x="24" y="180" fill="#6a6a70" font-size="8" letter-spacing="0.14em" font-family="ui-monospace, Menlo, monospace">STAGED · ${PTV_VERSION}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function listProjectTabPlateDefs(): ProjectTabPlateDef[] {
  const svg = PTV_PLATE_IDS.map((id) => ({
    id,
    tab: plateTab(id),
    usage: plateUsage(id),
    label: PLATE_COPY[id].kicker,
    intended: PLATE_COPY[id].title.replace(/\n/g, ' '),
    ready: PTV_STATUS,
    kind: 'svg' as const,
    file: `${id}.svg`,
  }));
  return [...svg, ...PTV_RASTER_PLATES];
}

function plateTab(id: ProjectTabPlateId): ProjectTabDestination {
  if (id.startsWith('plate-ref')) return 'references';
  if (id.startsWith('plate-asset')) return 'assets';
  if (id.startsWith('plate-page')) return 'pages';
  if (id.startsWith('plate-skin')) return 'skins';
  if (id.startsWith('plate-hist')) return 'history';
  if (id.startsWith('plate-more')) return 'more';
  if (id.startsWith('plate-hamburger')) return 'hamburger';
  return 'shared';
}

function plateUsage(id: ProjectTabPlateId): ProjectTabUsage {
  if (id.includes('empty')) return 'placeholder';
  if (id.includes('banner') || id.includes('more')) return 'utility-tile';
  if (id.includes('ref') || id.includes('hamburger')) return 'cover';
  return 'preview';
}
