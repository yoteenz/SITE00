import type { NDXIconName, NdxIconDefinition } from './types.js';

/** Monoline geometric paths — viewBox 0 0 24 24, stroke via consumer */
const ICONS: Record<NDXIconName, NdxIconDefinition> = {
  overview: {
    name: 'overview',
    paths: [
      { d: 'M4 4h7v7H4z' },
      { d: 'M13 4h7v4h-7z' },
      { d: 'M13 10h7v10h-7z' },
      { d: 'M4 13h7v7H4z' },
    ],
  },
  campaigns: {
    name: 'campaigns',
    paths: [
      { d: 'M5 6h14v12H5z' },
      { d: 'M8 10h8' },
      { d: 'M8 14h5' },
      { d: 'M17 4L7 9', opacity: 0.85 },
    ],
  },
  content_ops: {
    name: 'content_ops',
    paths: [
      { d: 'M7 4h10v16H7z' },
      { d: 'M9 8h6' },
      { d: 'M9 12h6' },
      { d: 'M9 16h4' },
    ],
  },
  lab: {
    name: 'lab',
    paths: [
      { d: 'M9 3v6l-4 10h14l-4-10V3' },
      { d: 'M8 3h8' },
      { d: 'M10 14h4' },
    ],
  },
  more: {
    name: 'more',
    paths: [],
    circles: [
      { cx: 6, cy: 12, r: 1.25, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.25, fill: 'currentColor' },
      { cx: 18, cy: 12, r: 1.25, fill: 'currentColor' },
    ],
  },
  ellipsis: {
    name: 'ellipsis',
    paths: [],
    circles: [
      { cx: 6, cy: 12, r: 1.25, fill: 'currentColor' },
      { cx: 12, cy: 12, r: 1.25, fill: 'currentColor' },
      { cx: 18, cy: 12, r: 1.25, fill: 'currentColor' },
    ],
  },
  project_overview: {
    name: 'project_overview',
    paths: [
      { d: 'M4 4h7v7H4z' },
      { d: 'M13 4h7v4h-7z' },
      { d: 'M13 10h7v10h-7z' },
      { d: 'M4 13h7v7H4z' },
    ],
  },
  project_settings: {
    name: 'project_settings',
    paths: [
      { d: 'M12 15a3 3 0 100-6 3 3 0 000 6z' },
      { d: 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
    ],
  },
  back_to_projects: {
    name: 'back_to_projects',
    paths: [
      { d: 'M8 6v12' },
      { d: 'M5 9l3-3 3 3' },
      { d: 'M11 8h8v3h-5v2h5v3h-8' },
    ],
    hostCanonical: true,
  },
  return_to_origin: {
    name: 'return_to_origin',
    paths: [
      { d: 'M12 4l6.5 3.75v7.5L12 19 5.5 15.25v-7.5L12 4z' },
      { d: 'M12 9v6' },
      { d: 'M9.5 10.5L12 9l2.5 1.5' },
    ],
    hostCanonical: true,
  },
  inspect: {
    name: 'inspect',
    paths: [
      { d: 'M10 10a2 2 0 104 0 2 2 0 00-4 0z' },
      { d: 'M21 21l-4.35-4.35' },
      { d: 'M4 4l2 2', opacity: 0.5 },
    ],
  },
  help: {
    name: 'help',
    paths: [
      { d: 'M12 18h.01' },
      { d: 'M9.5 9a2.5 2.5 0 115 0c0 2-2.5 1.75-2.5 4' },
      { d: 'M12 22a10 10 0 110-20 10 10 0 010 20z' },
    ],
  },
  notifications: {
    name: 'notifications',
    paths: [
      { d: 'M12 4a4 4 0 00-4 4v3l-2 2h12l-2-2V8a4 4 0 00-4-4z' },
      { d: 'M10 20a2 2 0 004 0' },
    ],
  },
  experiments_hub: {
    name: 'experiments_hub',
    paths: [
      { d: 'M12 4v4' },
      { d: 'M12 16v4' },
      { d: 'M4 12h4' },
      { d: 'M16 12h4' },
      { d: 'M6.3 6.3l2.8 2.8' },
      { d: 'M14.9 14.9l2.8 2.8' },
      { d: 'M17.7 6.3l-2.8 2.8' },
      { d: 'M9.1 14.9l-2.8 2.8' },
    ],
    circles: [{ cx: 12, cy: 12, r: 2, fill: 'currentColor' }],
  },
  campaign_board: {
    name: 'campaign_board',
    paths: [
      { d: 'M5 5h5v14H5z' },
      { d: 'M12 5h7v8h-7z' },
      { d: 'M12 15h7v4h-7z' },
    ],
  },
  cultural_intelligence: {
    name: 'cultural_intelligence',
    paths: [
      { d: 'M12 22a10 10 0 110-20 10 10 0 010 20z' },
      { d: 'M2 12h20' },
      { d: 'M12 2a15 15 0 010 20' },
      { d: 'M12 2a15 15 0 000 20' },
    ],
  },
  character_lab: {
    name: 'character_lab',
    paths: [
      { d: 'M12 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7z' },
      { d: 'M5 20c0-3.5 3.15-5 7-5s7 1.5 7 5' },
    ],
  },
  performance_learning: {
    name: 'performance_learning',
    paths: [
      { d: 'M4 19V5' },
      { d: 'M4 19h16' },
      { d: 'M8 16l3-4 3 2 4-6' },
    ],
  },
  archive: {
    name: 'archive',
    paths: [
      { d: 'M4 7h16v13H4z' },
      { d: 'M8 7V5h8v2' },
      { d: 'M4 11h16' },
    ],
  },
  projects: {
    name: 'projects',
    paths: [
      { d: 'M6 8l6-3 6 3v8l-6 3-6-3V8z' },
      { d: 'M6 8l6 3 6-3' },
      { d: 'M12 11v8' },
    ],
    hostCanonical: true,
  },
  origin: {
    name: 'origin',
    paths: [
      { d: 'M12 3l7.5 4.33v8.66L12 20 4.5 15.99V7.33L12 3z' },
      { d: 'M12 8v8' },
    ],
    hostCanonical: true,
  },
};

export const NDX_ICON_REGISTRY: Readonly<Record<NDXIconName, NdxIconDefinition>> = ICONS;

export const NDX_ICON_NAMES = Object.keys(ICONS) as NDXIconName[];

export const NDX_REQUIRED_NAV_ICONS: NDXIconName[] = [
  'overview',
  'campaigns',
  'content_ops',
  'lab',
  'more',
];

export const NDX_REQUIRED_MENU_ICONS: NDXIconName[] = [
  'project_overview',
  'project_settings',
  'back_to_projects',
  'return_to_origin',
  'inspect',
  'help',
];

export const NDX_REQUIRED_WORKSPACE_ICONS: NDXIconName[] = [
  'overview',
  'experiments_hub',
  'campaign_board',
  'content_ops',
  'cultural_intelligence',
  'character_lab',
  'performance_learning',
  'archive',
  'project_settings',
  'inspect',
  'help',
  'notifications',
  'more',
];

export function getNdxIconDefinition(name: NDXIconName): NdxIconDefinition {
  const def = ICONS[name];
  if (!def) throw new Error(`Unknown NDX icon: ${name}`);
  return def;
}

export function isNdxIconRegistered(name: string): name is NDXIconName {
  return name in ICONS;
}

export function ndxIconSvgUsesCurrentColor(name: NDXIconName): boolean {
  const def = getNdxIconDefinition(name);
  const raw = JSON.stringify(def);
  return !raw.includes('#') && !raw.includes('rgb');
}
