/**
 * FNDATN-01 editorial zone contracts: one desktop and one mobile contract per approved email.
 *
 * Protected zones were surveyed on the cleaned hero art at its authority width (gridded captures, see
 * docs/site00/correspondence/fndatn-01/FNDATN_01_EDITORIAL_ZONE_CONTRACT.md). `authorityTextRight` is
 * the founder authority copy edge measured by scripts/correspondence-studio/fndatn01/measure_editorial_zones.py.
 * Desktop authority copy starts left of the hero crop while live copy keeps a 28px inset, so the desktop
 * safe edge may sit past the authority edge, never past protected art.
 */
import type { EditorialZoneContract, ProtectedZone, ProtectedZoneKind, Rect, RoleRule, TextRole } from '../editorial/zones.js';
import { DESKTOP_HERO_HEIGHT } from './layout.js';
import type { Fndatn01EmailId } from './pack.js';

export const DESKTOP_ART = { width: 680, height: DESKTOP_HERO_HEIGHT } as const;
export const MOBILE_ART_WIDTH = 390;

const z = (id: string, kind: ProtectedZoneKind, label: string, rect: Rect): ProtectedZone => ({ id, kind, label, rect });

const KICKER: RoleRule = {
  font: { family: 'body', weight: 500, tracking: 0.2 },
  size: { preferred: 11, min: 9.5, fallbackMin: 9 },
  lineHeight: 14,
  minWidth: 60,
  preferredLines: 1,
  maxLines: 2,
  gapBefore: 0,
  essential: true,
  trailing: 56,
};

function headlineRule(size: number, lineHeight: number, gapBefore: number): RoleRule {
  return {
    font: { family: 'display', weight: 900, tracking: 0 },
    size: { preferred: size, min: size - 6, fallbackMin: size - 10 },
    lineHeight,
    minWidth: 100,
    gapBefore,
    essential: true,
  };
}

const SUB: RoleRule = {
  font: { family: 'body', weight: 600, tracking: 0.1 },
  size: { preferred: 11, min: 9.5, fallbackMin: 9 },
  lineHeight: 15,
  minWidth: 100,
  preferredLines: 2,
  maxLines: 3,
  gapBefore: 10,
  essential: true,
};

function bodyRule(tracking: number, gapBefore: number, maxWidth: number): RoleRule {
  return {
    font: { family: 'body', weight: 500, tracking },
    size: { preferred: 8.5, min: 7.5 },
    lineHeight: 13,
    maxWidth,
    minWidth: 90,
    preferredLines: 6,
    maxLines: 9,
    gapBefore,
    essential: true,
    stepped: true,
  };
}

/** 12px gap, the 1px rule and its 9px margin. */
const TAGLINE: RoleRule = {
  font: { family: 'body', weight: 500, tracking: 0.2 },
  size: { preferred: 8.5, min: 8.5 },
  lineHeight: 13,
  minWidth: 60,
  gapBefore: 22,
  essential: false,
};

/** Desktop headline sizes: two lines at 52/47, three at 46/41; 06 sets its long third line at 40/35. */
function desktopRoles(headlineLines: number, deskSize?: number): Partial<Record<TextRole, RoleRule>> {
  const size = (deskSize ?? (headlineLines > 2 ? 40 : 46)) + 6;
  const lh = Math.round((size - 4) * 1.02) - 2;
  return { kicker: KICKER, headline: headlineRule(size, lh, 11), sub: SUB, body: bodyRule(0.07, 12, 250), tagline: TAGLINE };
}

function mobileRoles(headlineLines: number): Partial<Record<TextRole, RoleRule>> {
  const size = (headlineLines > 3 ? 36 : 40) + 6;
  const lh = Math.round((size - 4) * 1.02) - 2;
  return { kicker: KICKER, headline: headlineRule(size, lh, 11), sub: SUB, body: bodyRule(0.06, 10, 220) };
}

type Geometry = {
  maxRight: number;
  floor: number;
  authorityTextRight: number;
  zones: ProtectedZone[];
};

const DESKTOP: Record<Fndatn01EmailId, Geometry> = {
  '01': {
    maxRight: 250,
    floor: 290,
    authorityTextRight: 220,
    zones: [
      z('tree', 'NATURE_FOCAL', 'Olive tree crown', [318, 18, 445, 145]),
      z('terrace', 'IMAGE_TRANSITION', 'Headland, sofa and terrace steps', [262, 80, 360, 230]),
      z('glass-ledge', 'RED_GLASS', 'Red glass on the front ledge', [70, 212, 250, 300]),
      z('glass-corner', 'RED_GLASS', 'Red glass corner', [0, 258, 40, 300]),
      z('card', 'PHYSICAL_ARTIFACT', 'Invitation card', [350, 105, 660, 296]),
      z('arch', 'ARCHITECTURAL_FOCAL', 'Red glass architecture', [460, 0, 680, 110]),
    ],
  },
  '02': {
    maxRight: 256,
    floor: 290,
    authorityTextRight: 251,
    zones: [
      z('mullion', 'ARCHITECTURAL_FOCAL', 'Window mullion', [266, 0, 276, 225]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [316, 145, 390, 205]),
      z('glass', 'RED_GLASS', 'Red glass sill', [0, 240, 312, 300]),
      z('marble', 'PHYSICAL_ARTIFACT', 'Marble block', [176, 200, 372, 300]),
      z('card', 'PHYSICAL_ARTIFACT', 'Intake card', [362, 88, 680, 300]),
      z('maple', 'NATURE_FOCAL', 'Red maple', [470, 0, 600, 70]),
    ],
  },
  '03': {
    maxRight: 280,
    floor: 290,
    authorityTextRight: 283,
    zones: [
      z('tree', 'NATURE_FOCAL', 'Olive tree', [288, 15, 420, 170]),
      z('walls', 'ARCHITECTURAL_FOCAL', 'Limestone and red glass walls', [420, 0, 680, 95]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [318, 160, 388, 228]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [290, 170, 392, 262]),
      z('card', 'PHYSICAL_ARTIFACT', 'Recommendation card', [385, 95, 672, 292]),
      z('ledge', 'IMAGE_TRANSITION', 'Front ledge', [200, 255, 400, 300]),
      z('glass', 'RED_GLASS', 'Red glass corner', [0, 254, 122, 300]),
    ],
  },
  '04': {
    maxRight: 240,
    floor: 290,
    authorityTextRight: 185,
    zones: [
      z('tree', 'NATURE_FOCAL', 'Olive tree', [250, 8, 372, 150]),
      z('arch', 'ARCHITECTURAL_FOCAL', 'Red glass architecture', [372, 0, 680, 100]),
      z('terrace', 'IMAGE_TRANSITION', 'Sofa and terrace', [185, 140, 330, 190]),
      z('glass', 'PHYSICAL_ARTIFACT', 'Glass vessel', [288, 160, 332, 232]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [208, 215, 322, 262]),
      z('card', 'PHYSICAL_ARTIFACT', 'Payment receipt card', [312, 98, 668, 300]),
      z('ledge', 'IMAGE_TRANSITION', 'Front ledge', [130, 218, 330, 300]),
      z('glass-corner', 'RED_GLASS', 'Red glass corner', [0, 242, 82, 300]),
    ],
  },
  '05': {
    maxRight: 236,
    floor: 290,
    authorityTextRight: 204,
    zones: [
      z('tree', 'NATURE_FOCAL', 'Olive tree', [238, 8, 388, 182]),
      z('wall', 'ARCHITECTURAL_FOCAL', 'Red glass wall', [385, 0, 680, 100]),
      z('roses', 'NATURE_FOCAL', 'Roses', [352, 98, 482, 165]),
      z('gift', 'PHYSICAL_ARTIFACT', 'Marble gift box', [372, 105, 668, 300]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [318, 178, 378, 248]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [244, 232, 376, 288]),
      z('coast', 'IMAGE_TRANSITION', 'Coastline', [202, 118, 300, 182]),
      z('ledge-upper', 'IMAGE_TRANSITION', 'Upper ledge', [205, 200, 320, 245]),
      z('ledge-lower', 'IMAGE_TRANSITION', 'Lower ledge', [90, 244, 330, 300]),
    ],
  },
  '06': {
    maxRight: 252,
    floor: 290,
    authorityTextRight: 252,
    zones: [
      z('building', 'ARCHITECTURAL_FOCAL', 'Limestone building', [290, 0, 485, 150]),
      z('tree', 'NATURE_FOCAL', 'Olive tree', [262, 48, 402, 200]),
      z('laptop', 'PHYSICAL_ARTIFACT', 'Laptop', [400, 98, 662, 282]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [276, 208, 362, 262]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [350, 190, 402, 262]),
      z('folio', 'PHYSICAL_ARTIFACT', 'Folio', [218, 252, 348, 278]),
      z('ledge', 'IMAGE_TRANSITION', 'Front ledge', [86, 238, 300, 300]),
      z('arch', 'ARCHITECTURAL_FOCAL', 'Red glass architecture', [485, 0, 680, 100]),
    ],
  },
  '07': {
    maxRight: 224,
    floor: 290,
    authorityTextRight: 163,
    zones: [
      z('building', 'ARCHITECTURAL_FOCAL', 'Limestone building', [262, 0, 462, 112]),
      z('tree', 'NATURE_FOCAL', 'Olive tree', [234, 22, 372, 205]),
      z('headland', 'IMAGE_TRANSITION', 'Dark headland', [203, 120, 300, 200]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [175, 208, 282, 258]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [268, 202, 332, 268]),
      z('card', 'PHYSICAL_ARTIFACT', 'Quote card', [318, 92, 604, 300]),
      z('hourglass', 'PHYSICAL_ARTIFACT', 'Hourglass', [592, 102, 668, 282]),
      z('ledge', 'IMAGE_TRANSITION', 'Front ledge', [74, 238, 332, 300]),
      z('arch', 'ARCHITECTURAL_FOCAL', 'Red glass architecture', [462, 0, 680, 100]),
    ],
  },
};

/** `top` is the measured authority kicker cap top less the kicker's 3px half-leading. */
type MobileGeometry = Geometry & { height: number; top: number };

const MOBILE: Record<Fndatn01EmailId, MobileGeometry> = {
  '01': {
    height: 347,
    top: 13,
    maxRight: 205,
    floor: 337,
    authorityTextRight: 193,
    zones: [
      z('card', 'PHYSICAL_ARTIFACT', 'Invitation card', [100, 176, 362, 330]),
      z('tree', 'NATURE_FOCAL', 'Olive tree', [198, 38, 262, 140]),
      z('arch', 'ARCHITECTURAL_FOCAL', 'Red glass architecture', [278, 0, 390, 150]),
      z('terrace', 'IMAGE_TRANSITION', 'Headland and terrace', [196, 100, 390, 175]),
      z('stone', 'IMAGE_TRANSITION', 'Left limestone block', [0, 180, 125, 290]),
      z('glass', 'RED_GLASS', 'Red glass', [0, 205, 72, 347]),
    ],
  },
  '02': {
    height: 424,
    top: 28,
    maxRight: 205,
    floor: 414,
    authorityTextRight: 195,
    zones: [
      z('maple', 'NATURE_FOCAL', 'Red maple and window', [195, 0, 330, 165]),
      z('glass-books', 'PHYSICAL_ARTIFACT', 'Red glass and books', [195, 125, 390, 195]),
      z('card', 'PHYSICAL_ARTIFACT', 'Intake card', [80, 222, 390, 424]),
      z('marble', 'PHYSICAL_ARTIFACT', 'Marble block', [45, 240, 120, 330]),
      z('glass', 'RED_GLASS', 'Red glass', [0, 240, 60, 380]),
    ],
  },
  '03': {
    height: 455,
    top: 23,
    maxRight: 225,
    floor: 445,
    authorityTextRight: 215,
    zones: [
      z('overhang', 'ARCHITECTURAL_FOCAL', 'Overhang', [180, 0, 390, 25]),
      z('tree', 'NATURE_FOCAL', 'Olive tree', [218, 45, 280, 175]),
      z('wall', 'ARCHITECTURAL_FOCAL', 'Red glass wall', [280, 0, 390, 200]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [255, 175, 315, 220]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [205, 220, 335, 260]),
      z('card', 'PHYSICAL_ARTIFACT', 'Recommendation card', [90, 255, 370, 455]),
      z('glass', 'RED_GLASS', 'Red glass', [0, 268, 55, 415]),
    ],
  },
  '04': {
    height: 295,
    top: 14,
    maxRight: 216,
    floor: 290,
    authorityTextRight: 206,
    zones: [
      z('arch', 'ARCHITECTURAL_FOCAL', 'Stone wall and red glass architecture', [245, 0, 390, 295]),
      z('cliffs', 'IMAGE_TRANSITION', 'Coastal cliffs', [208, 150, 245, 250]),
    ],
  },
  '05': {
    height: 366,
    top: 26,
    maxRight: 203,
    floor: 356,
    authorityTextRight: 193,
    zones: [
      z('overhang', 'ARCHITECTURAL_FOCAL', 'Overhang', [175, 0, 390, 25]),
      z('tree', 'NATURE_FOCAL', 'Olive tree', [195, 50, 280, 175]),
      z('wall', 'ARCHITECTURAL_FOCAL', 'Red glass wall', [280, 0, 390, 180]),
      z('gift', 'PHYSICAL_ARTIFACT', 'Marble gift box', [196, 165, 390, 366]),
      z('greenery', 'NATURE_FOCAL', 'Greenery', [120, 224, 185, 245]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [130, 245, 175, 290]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [75, 275, 190, 325]),
      z('glass', 'RED_GLASS', 'Red glass', [0, 270, 55, 366]),
    ],
  },
  '06': {
    height: 394,
    top: 21,
    maxRight: 212,
    floor: 384,
    authorityTextRight: 202,
    zones: [
      z('overhang', 'ARCHITECTURAL_FOCAL', 'Overhang', [196, 0, 390, 30]),
      z('tree', 'NATURE_FOCAL', 'Olive tree', [205, 55, 275, 200]),
      z('wall', 'ARCHITECTURAL_FOCAL', 'Red glass wall', [275, 0, 390, 300]),
      z('laptop', 'PHYSICAL_ARTIFACT', 'Laptop', [180, 205, 375, 345]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [100, 260, 150, 305]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [55, 295, 165, 340]),
      z('glass', 'RED_GLASS', 'Red glass', [0, 320, 40, 394]),
    ],
  },
  '07': {
    height: 380,
    top: 26,
    maxRight: 203,
    floor: 370,
    authorityTextRight: 193,
    zones: [
      z('overhang', 'ARCHITECTURAL_FOCAL', 'Overhang', [185, 0, 390, 25]),
      z('tree', 'NATURE_FOCAL', 'Olive tree', [195, 55, 280, 170]),
      z('wall', 'ARCHITECTURAL_FOCAL', 'Red glass wall', [280, 0, 390, 200]),
      z('sofa', 'IMAGE_TRANSITION', 'Sofa', [205, 175, 280, 200]),
      z('card', 'PHYSICAL_ARTIFACT', 'Quote card', [140, 215, 355, 380]),
      z('hourglass', 'PHYSICAL_ARTIFACT', 'Hourglass', [300, 190, 390, 350]),
      z('crystal', 'PHYSICAL_ARTIFACT', 'Crystal', [100, 235, 155, 285]),
      z('books', 'PHYSICAL_ARTIFACT', 'Stacked books', [60, 280, 150, 340]),
      z('glass', 'RED_GLASS', 'Red glass', [0, 250, 55, 330]),
    ],
  },
};

const SLUGS: Record<Fndatn01EmailId, string> = {
  '01': '01_invitation',
  '02': '02_intake_received',
  '03': '03_recommendation_quote',
  '04': '04_payment_received',
  '05': '05_foundation_complete',
  '06': '06_resume_intake',
  '07': '07_quote_expiry',
};

export const FNDATN01_EMAIL_IDS = Object.keys(SLUGS) as Fndatn01EmailId[];

export function fndatn01DesktopZone(id: Fndatn01EmailId, headlineLines: number, deskSize?: number): EditorialZoneContract {
  const g = DESKTOP[id];
  return {
    schema: 'SITE00_EDITORIAL_ZONE_V1',
    pack: 'FNDATN-01',
    templateId: id,
    slug: SLUGS[id],
    device: 'desktop',
    art: `assets/${SLUGS[id]}/hero-desktop.jpg`,
    canvas: { ...DESKTOP_ART },
    inset: { left: 28, top: headlineLines > 2 ? 20 : 26 },
    gutter: 10,
    maxRight: g.maxRight,
    floor: g.floor,
    protectedZones: g.zones,
    roles: desktopRoles(headlineLines, deskSize),
    fallback: 'STACK_ABOVE_ART',
    overflow: 'NEVER_CLIP',
    authorityTextRight: g.authorityTextRight,
  };
}

export function fndatn01MobileZone(id: Fndatn01EmailId, headlineLines: number): EditorialZoneContract {
  const g = MOBILE[id];
  return {
    schema: 'SITE00_EDITORIAL_ZONE_V1',
    pack: 'FNDATN-01',
    templateId: id,
    slug: SLUGS[id],
    device: 'mobile',
    art: `assets/${SLUGS[id]}/hero-mobile.jpg`,
    canvas: { width: MOBILE_ART_WIDTH, height: g.height },
    inset: { left: 20, top: g.top },
    gutter: 8,
    maxRight: g.maxRight,
    floor: g.floor,
    protectedZones: g.zones,
    roles: mobileRoles(headlineLines),
    fallback: 'STACK_ABOVE_ART',
    overflow: 'NEVER_CLIP',
    authorityTextRight: g.authorityTextRight,
  };
}
