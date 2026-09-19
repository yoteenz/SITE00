/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — the project's design expression system.
 *
 * This is the SKINS tab's model. It is deliberately not a theme builder: the
 * founder does not pick colours here, they read the expression the project has
 * already committed to and see where it is and is not applied.
 *
 * The palette, type ramp and material vocabulary are declared per project
 * because they are brand facts, not runtime state. Everything measured —
 * which page families the expression covers, how mobile and desktop parity
 * stands — is derived from the live page registry, so the coverage section
 * cannot drift away from the pages that actually exist.
 */

import { buildProjectPageArchitecture } from './designProjectLibraries.js';
import { buildDesignProjectIntelligence } from './designProjectBinding/projectIntelligence.js';

export type SkinSwatch = {
  token: string;
  value: string;
  role: string;
};

export type SkinTypeStyle = {
  name: string;
  role: string;
  sample: string;
  stack: string;
};

export type SkinMaterial = {
  name: string;
  role: string;
};

export type SkinPanelPattern = {
  name: string;
  role: string;
};

export type SkinCoverageRow = {
  family: string;
  pages: number;
  mobile: number;
  desktop: number;
  /** 0-100. Share of the family's pages carrying both viewport expressions. */
  parity: number;
};

export type ProjectSkinSystem = {
  projectId: string;
  skinName: string;
  version: string;
  tagline: string;
  traits: string[];
  status: 'ACTIVE' | 'DRAFT';
  palette: SkinSwatch[];
  typography: SkinTypeStyle[];
  materials: SkinMaterial[];
  textures: string[];
  panelGrammar: SkinPanelPattern[];
  componentStyles: { name: string; tone: 'primary' | 'secondary' | 'ghost' }[];
  coverage: SkinCoverageRow[];
  parity: { label: string; ok: boolean }[];
  pagesCovered: number;
  pagesTotal: number;
};

type SkinDefinition = {
  skinName: string;
  version: string;
  tagline: string;
  traits: string[];
  palette: SkinSwatch[];
  typography: SkinTypeStyle[];
  materials: SkinMaterial[];
  textures: string[];
};

const NDX_SKIN: SkinDefinition = {
  skinName: 'NDXBOOK',
  version: 'v1.3',
  tagline: 'A MORE HUMAN INDEX.',
  traits: ['CLEAN', 'BOLD', 'CULTURAL', 'EDITORIAL', 'MODERN'],
  palette: [
    { token: 'NDX BLACK', value: '#000000', role: 'Ground' },
    { token: 'NDX WHITE', value: '#ffffff', role: 'Paper' },
    { token: 'NDX ACCENT', value: '#dbff00', role: 'Signal' },
    { token: 'NDX GRAY 900', value: '#1a1a1a', role: 'Panel' },
    { token: 'NDX GRAY 600', value: '#757575', role: 'Meta' },
    { token: 'NDX GRAY 200', value: '#e5e5e5', role: 'Rule' },
  ],
  typography: [
    { name: 'NDX SANS', role: 'Primary', sample: 'Aa', stack: 'Inter · 400/700' },
    { name: 'NDX SANS COND', role: 'Display', sample: 'Aa', stack: 'Condensed · 700' },
    { name: 'NDX SERIF', role: 'Accent', sample: 'Aa', stack: 'Editorial serif · 400' },
    { name: 'NDX MONO', role: 'Data / UI', sample: 'Aa', stack: 'IBM Plex Mono · 400/600' },
  ],
  materials: [
    { name: 'CONCRETE', role: 'Architectural ground' },
    { name: 'BRUSHED METAL', role: 'Industrial edge' },
    { name: 'GLASS', role: 'Transparency' },
    { name: 'PAPER', role: 'Editorial body' },
    { name: 'MATTE', role: 'Neutral field' },
  ],
  textures: ['ARCHITECTURAL', 'GRAIN', 'HALFTONE', 'LINEWORK', 'DATA GRID'],
};

const DEFAULT_SKIN: SkinDefinition = {
  skinName: 'PROJECT CANONICAL',
  version: 'v1.0',
  tagline: 'Managed under SITE 00 design authority.',
  traits: ['NEUTRAL', 'STRUCTURED'],
  palette: [
    { token: 'INK', value: '#050505', role: 'Ground' },
    { token: 'PAPER', value: '#f4f4f4', role: 'Paper' },
    { token: 'SIGNAL', value: '#d8ff3e', role: 'Signal' },
  ],
  typography: [
    { name: 'PRIMARY', role: 'Body', sample: 'Aa', stack: 'System sans' },
    { name: 'MONO', role: 'Data / UI', sample: 'Aa', stack: 'IBM Plex Mono' },
  ],
  materials: [{ name: 'PAPER', role: 'Editorial body' }],
  textures: ['GRAIN'],
};

const PANEL_GRAMMAR: SkinPanelPattern[] = [
  { name: 'HERO', role: 'Full-bleed review' },
  { name: 'CONTENT', role: 'Editorial column' },
  { name: 'MEDIA', role: 'Contact sheet' },
  { name: 'DATA', role: 'Metadata rows' },
  { name: 'MODULAR', role: 'Grid of modules' },
];

const COMPONENT_STYLES: { name: string; tone: 'primary' | 'secondary' | 'ghost' }[] = [
  { name: 'PRIMARY BTN', tone: 'primary' },
  { name: 'SECONDARY BTN', tone: 'secondary' },
  { name: 'GHOST BTN', tone: 'ghost' },
];

const SKINS: Record<string, SkinDefinition> = { ndxbook: NDX_SKIN };

export function buildProjectSkinSystem(projectId: string): ProjectSkinSystem {
  const definition = SKINS[projectId] ?? DEFAULT_SKIN;
  const intelligence = buildDesignProjectIntelligence(projectId);
  const architecture = buildProjectPageArchitecture(projectId);

  const coverage: SkinCoverageRow[] = architecture.coverage.map((row) => ({
    family: row.family,
    pages: row.total,
    mobile: row.mobile,
    desktop: row.desktop,
    parity: row.total === 0 ? 0 : Math.round((Math.min(row.mobile, row.desktop) / row.total) * 100),
  }));

  const pagesCovered = architecture.all.filter(
    (page) => page.mobilePreviewUrl || page.desktopPreviewUrl,
  ).length;

  const withMobile = architecture.all.filter((page) => Boolean(page.mobilePreviewUrl)).length;
  const withDesktop = architecture.all.filter((page) => Boolean(page.desktopPreviewUrl)).length;
  const withAuthority = architecture.all.filter((page) => Boolean(page.designAuthorityVersion)).length;

  return {
    projectId,
    skinName: intelligence?.displayName ?? definition.skinName,
    version: definition.version,
    tagline: definition.tagline,
    traits: definition.traits,
    status: intelligence ? 'ACTIVE' : 'DRAFT',
    palette: definition.palette,
    typography: definition.typography,
    materials: definition.materials,
    textures: definition.textures,
    panelGrammar: PANEL_GRAMMAR,
    componentStyles: COMPONENT_STYLES,
    coverage,
    parity: [
      { label: 'VISUAL PARITY', ok: withMobile > 0 && withDesktop > 0 },
      { label: 'COMPONENT PARITY', ok: architecture.totalPages > 0 },
      { label: 'TYPOGRAPHY PARITY', ok: definition.typography.length > 1 },
      { label: 'COLOR PARITY', ok: definition.palette.length >= 3 },
      { label: 'CONTENT ADAPTIVE', ok: withAuthority > 0 },
      { label: 'PLATFORM OPTIMIZED', ok: withMobile === withDesktop && withMobile > 0 },
    ],
    pagesCovered,
    pagesTotal: architecture.totalPages,
  };
}
