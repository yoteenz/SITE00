import type { NDXIconName, NdxIconDefinition } from './types.js';
import { NDX_ICON_VIEWBOX } from './tokens.js';
import { buildPixelTracedIconRegistry } from './p0ui3b/buildRegistry.js';

export { NDX_ICON_VIEWBOX };

/** P0.UI.3B — pixel-traced canonical registry (viewBox 24, currentColor). */
const ICONS: Record<NDXIconName, NdxIconDefinition> = buildPixelTracedIconRegistry();

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

export function ndxIconIsReferenceTraced(name: NDXIconName): boolean {
  const c = getNdxIconDefinition(name).traceClassification;
  return c === 'REFERENCE_TRACED' || c === 'PIXEL_TRACED';
}

export function ndxIconIsPixelTraced(name: NDXIconName): boolean {
  return getNdxIconDefinition(name).traceClassification === 'PIXEL_TRACED';
}
