/**
 * DESIGN canonical icon + asset pack (P0.STUDIOOS.PRODUCTION.DESIGN.ASSET-AUTHORITY-CONVERGENCE.OPUS3).
 *
 * The one resolver for the supplied DWS_SONNET_LITE / 05_SYSTEM_PACKS assets. Every file is an exact crop of the
 * supplied sheets (see public/site00/production-authority-assets/design-pack/SOURCE.json and
 * scripts/site00-design-pack-extract.py). Design surfaces take pack art from here — never from CSS stand-ins,
 * generic icon libraries or unrelated plates — wherever the pack supplies the asset.
 */
const P = '/site00/production-authority-assets/design-pack';

/** 03 PIPELINE STAGE ICONS — rendered stage objects, in pipeline order. */
export const DESIGN_STAGES = [
  { id: 'intelligence', label: 'INTELLIGENCE', src: `${P}/stages/01-intelligence.png` },
  { id: 'concept', label: 'CONCEPT', src: `${P}/stages/02-concept.png` },
  { id: 'experience', label: 'EXPERIENCE', src: `${P}/stages/03-experience.png` },
  { id: 'surfaces', label: 'SURFACES', src: `${P}/stages/04-surfaces.png` },
  { id: 'assets', label: 'ASSETS', src: `${P}/stages/05-assets.png` },
  { id: 'authority', label: 'AUTHORITY', src: `${P}/stages/06-authority.png` },
  { id: 'production', label: 'PRODUCTION', src: `${P}/stages/07-production.png` },
] as const;
export const designStage = (i: number) => DESIGN_STAGES[i % DESIGN_STAGES.length]!;

const NAV_ICONS = ['hub', 'work', 'library', 'activity', 'exit', 'menu', 'dropdown', 'search', 'settings', 'user'] as const;
const OBJECT_ICONS = ['cube-system', 'orbital-sphere', 'concentric-rings', 'geometric-lattice', 'ui-frame', 'route-map', 'stack-layers', 'database', 'cloud', 'network'] as const;
export type DesignPackIcon = `nav-${(typeof NAV_ICONS)[number]}` | `object-${(typeof OBJECT_ICONS)[number]}`;
export const DESIGN_ICON_IDS: readonly DesignPackIcon[] = [...NAV_ICONS.map((n) => `nav-${n}` as const), ...OBJECT_ICONS.map((n) => `object-${n}` as const)];
/** 01 NAVIGATION + 04 OBJECT / SYSTEM icon tiles. */
export const designIcon = (id: DesignPackIcon) => `${P}/icons/${id}.png`;
export const designIconLabel = (id: DesignPackIcon) => id.replace(/^(nav|object)-/, '').replace(/-/g, ' ').toUpperCase();

/** 07 DEVICE FRAMES */
export const DESIGN_DEVICES = { desktop: `${P}/devices/desktop.png`, tablet: `${P}/devices/tablet.png`, mobile: `${P}/devices/mobile.png` } as const;
export type DesignDevice = keyof typeof DESIGN_DEVICES;

/** 08 ENVIRONMENT PLATES */
export const DESIGN_PLATES = {
  mainAtrium: `${P}/plates/main-atrium.jpg`,
  crop01: `${P}/plates/crop-01.jpg`,
  crop02: `${P}/plates/crop-02.jpg`,
  crop03: `${P}/plates/crop-03.jpg`,
  crop04: `${P}/plates/crop-04.jpg`,
} as const;

/** 09 MATERIAL SWATCHES */
export const DESIGN_SWATCHES = [
  { id: 'white-acrylic', label: 'WHITE ACRYLIC' },
  { id: 'matte-white', label: 'MATTE WHITE' },
  { id: 'chrome', label: 'CHROME' },
  { id: 'smoked-glass', label: 'SMOKED GLASS' },
  { id: 'clear-glass', label: 'CLEAR GLASS' },
  { id: 'red-glow-glass', label: 'RED GLOW GLASS' },
  { id: 'graphite', label: 'GRAPHITE' },
  { id: 'neutral-paper', label: 'NEUTRAL PAPER' },
].map((s) => ({ ...s, src: `${P}/swatches/${s.id}.jpg` }));

/** Every pack file the Design workspace references (tests assert each exists on disk). */
export const DESIGN_PACK_FILES: string[] = [
  ...DESIGN_STAGES.map((s) => s.src),
  ...DESIGN_ICON_IDS.map(designIcon),
  ...Object.values(DESIGN_DEVICES),
  ...Object.values(DESIGN_PLATES),
  ...DESIGN_SWATCHES.map((s) => s.src),
];
