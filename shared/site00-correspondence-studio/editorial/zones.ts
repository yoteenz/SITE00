/**
 * Editorial text zone contract. Shared by every correspondence pack; each approved email declares its
 * own geometry. Coordinates are CSS px on the hero art at its authority width (desktop 680 wide, mobile
 * 390 wide), origin top-left. Heroes anchor their art at the top-left corner, so at any narrower canvas
 * the art crops on the right and never slides under the copy, and at any wider canvas it scales away
 * from the copy. A zone contract measured at the authority width therefore holds at every width the
 * layout serves.
 */
import type { FontSpec } from './measure.js';

export type Rect = readonly [x0: number, y0: number, x1: number, y1: number];

export type ProtectedZoneKind =
  | 'ARCHITECTURAL_FOCAL'
  | 'RED_GLASS'
  | 'PHYSICAL_ARTIFACT'
  | 'NATURE_FOCAL'
  | 'IMAGE_TRANSITION';

export type ProtectedZone = { id: string; kind: ProtectedZoneKind; label: string; rect: Rect };

export type TextRole = 'kicker' | 'headline' | 'sub' | 'body' | 'tagline';
export const TEXT_ROLE_ORDER: readonly TextRole[] = ['kicker', 'headline', 'sub', 'body', 'tagline'];

export type RoleRule = {
  font: Omit<FontSpec, 'size'>;
  /** Authority size and the strict lower limit the solver may reach before stacking. */
  size: { preferred: number; min: number; fallbackMin?: number };
  /** Line height in px at the preferred size; scales with size. */
  lineHeight: number;
  /** Editorial measure cap. */
  maxWidth?: number;
  /** Narrowest column the role may be set in. */
  minWidth: number;
  preferredLines?: number;
  maxLines?: number;
  /** Space above the role in px. */
  gapBefore: number;
  /** Non-essential roles are omitted when no safe area remains; essential copy never is. */
  essential: boolean;
  /** Width the role adds beside its text on the same line (the kicker rule). */
  trailing?: number;
  /** Each line takes the safe width of its own row band, so copy steps in beside protected art. */
  stepped?: boolean;
};

export type DeviceClass = 'desktop' | 'mobile';

export type EditorialZoneContract = {
  schema: 'SITE00_EDITORIAL_ZONE_V1';
  pack: string;
  templateId: string;
  slug: string;
  device: DeviceClass;
  art: string;
  canvas: { width: number; height: number };
  /** Copy column origin. */
  inset: { left: number; top: number };
  /** Clear space kept between copy and any protected zone. */
  gutter: number;
  /** Right edge of the text-safe area, at most the measured authority copy edge plus tolerance. */
  maxRight: number;
  /** Bottom of the text-safe area. */
  floor: number;
  /** Design-authorized extra depth used before any font reduction; never below protected art. */
  expansionFloor?: number;
  protectedZones: readonly ProtectedZone[];
  roles: Partial<Record<TextRole, RoleRule>>;
  fallback: 'STACK_ABOVE_ART';
  overflow: 'NEVER_CLIP';
  /** Measured founder authority copy edge (scripts/correspondence-studio/fndatn01/measure_editorial_zones.py). */
  authorityTextRight: number;
};

function overlaps(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && b0 < a1;
}

/** Right edge of the text-safe area for a band of rows. */
export function safeRight(c: EditorialZoneContract, y0: number, y1: number): number {
  let right = c.maxRight;
  for (const z of c.protectedZones) {
    if (overlaps(y0 - c.gutter, y1 + c.gutter, z.rect[1], z.rect[3])) right = Math.min(right, z.rect[0] - c.gutter);
  }
  return right;
}

/** Available column width for a band of rows, from the copy inset to the safe right edge. */
export function safeWidth(c: EditorialZoneContract, y0: number, y1: number): number {
  return Math.max(0, safeRight(c, y0, y1) - c.inset.left);
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
}
