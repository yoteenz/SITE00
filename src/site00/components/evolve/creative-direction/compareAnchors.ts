/** Common comparison anchors — same concept, territory-native specimen types */

export const PAGE_001_ANCHOR_BY_INDEX: Record<number, string> = {
  1: 'page_001_indexed',
  2: 'page_001_editorial',
  3: 'page_001_kinetic',
};

export const TYPOGRAPHY_ANCHOR_BY_INDEX: Record<number, string> = {
  1: 'typography_system',
  2: 'typography_spread',
  3: 'typography_system',
};

export const VOLUME_ANCHOR_BY_INDEX: Record<number, string> = {
  1: 'volume_registry',
  2: 'volume_color_system',
  3: 'volume_stinger',
};

export const WORDMARK_ANCHOR = 'wordmark';

export const COMMON_ANCHOR_LABELS = [
  { key: 'wordmark', label: 'Brand identity / wordmark' },
  { key: 'page001', label: 'Page 001' },
  { key: 'typography', label: 'Typography' },
  { key: 'volume', label: 'Volume system' },
] as const;

export function anchorSpecimenType(
  anchorKey: (typeof COMMON_ANCHOR_LABELS)[number]['key'],
  territoryIndex: number,
): string {
  if (anchorKey === 'wordmark') return WORDMARK_ANCHOR;
  if (anchorKey === 'page001') return PAGE_001_ANCHOR_BY_INDEX[territoryIndex] ?? PAGE_001_ANCHOR_BY_INDEX[1];
  if (anchorKey === 'typography') return TYPOGRAPHY_ANCHOR_BY_INDEX[territoryIndex] ?? 'typography_system';
  return VOLUME_ANCHOR_BY_INDEX[territoryIndex] ?? 'volume_registry';
}

export const TERRITORY_NATIVE_PREFIXES: Record<number, string[]> = {
  1: ['brand_index', 'page_catalog', 'cross_reference', 'feed_index', 'navigation_archive', 'graphic_language'],
  2: ['magazine_', 'feature_', 'knowledge_', 'quote_', 'social_carousel', 'instagram_', 'article_'],
  3: ['motion_title', 'hook_frame', 'motion_sequence', 'page_number', 'signal_graphic', 'dark_light'],
};

export function isTerritoryNativeSpecimen(specimenType: string, territoryIndex: number): boolean {
  const prefixes = TERRITORY_NATIVE_PREFIXES[territoryIndex] ?? [];
  return prefixes.some((p) => specimenType.startsWith(p));
}
