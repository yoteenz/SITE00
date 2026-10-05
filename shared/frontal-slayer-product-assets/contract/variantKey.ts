/**
 * Deterministic ProductVariantKey — shared across Studio World and Frontal Slayer website.
 * Normalize axis order: color → style → texture → length → part → finish
 */

export const VARIANT_KEY_AXIS_ORDER = [
  'color',
  'style',
  'texture',
  'length',
  'part',
  'finish',
  'productId',
  'heroRole',
  'variantType',
  'variantValue',
] as const;

export type NormalizedVariantAxes = Record<string, string>;

export function normalizeVariantAxes(axes: Record<string, string>): NormalizedVariantAxes {
  const normalized: NormalizedVariantAxes = {};
  for (const [k, v] of Object.entries(axes)) {
    if (v) normalized[k.toLowerCase()] = v;
  }
  return normalized;
}

export function buildDeterministicVariantKey(axes: Record<string, string>): string {
  const normalized = normalizeVariantAxes(axes);
  const parts: string[] = [];
  for (const axis of VARIANT_KEY_AXIS_ORDER) {
    if (normalized[axis]) parts.push(`${axis}=${normalized[axis]}`);
  }
  for (const key of Object.keys(normalized).sort()) {
    if (!VARIANT_KEY_AXIS_ORDER.includes(key as (typeof VARIANT_KEY_AXIS_ORDER)[number])) {
      parts.push(`${key}=${normalized[key]}`);
    }
  }
  return parts.join('|');
}

export function buildConfigurationSlug(axes: Record<string, string>): string {
  const normalized = normalizeVariantAxes(axes);
  const segments: string[] = [];
  if (normalized.color) segments.push(`color-${normalized.color}`);
  if (normalized.style) segments.push(`style-${normalized.style}`);
  if (normalized.texture) segments.push(`texture-${normalized.texture}`);
  if (normalized.length) segments.push(`length-${normalized.length}`);
  if (normalized.part) segments.push(`part-${normalized.part}`);
  if (normalized.finish) segments.push(`finish-${normalized.finish}`);
  return segments.join('_') || 'default';
}

export function variantKeysMatch(a: Record<string, string>, b: Record<string, string>): boolean {
  return buildDeterministicVariantKey(a) === buildDeterministicVariantKey(b);
}
