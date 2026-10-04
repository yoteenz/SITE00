import type { IconImplementationClass, IconRequirement } from './iconTypes';

const LIVE_SVG_IDS = new Set(['SEM_BACK', 'SEM_FORWARD', 'SEM_EXPAND', 'SEM_COLLAPSE', 'SEM_ADD', 'SEM_REMOVE']);

const EXTERNAL_INTEGRATIONS = new Set(['Shopify', 'Stripe', 'Facebook', 'Instagram', 'Google']);

export function classifyIconRequirement(req: Omit<IconRequirement, 'implementation_class'>): IconImplementationClass {
  if (req.notes.includes('EXISTING_BRAND')) return 'EXISTING_BRAND_ASSET';
  if (req.category === 'INTEGRATION' && EXTERNAL_INTEGRATIONS.has(req.canonical_name)) return 'EXTERNAL_PLATFORM_ICON';
  if (req.micro_asset_candidate) return 'ILLUSTRATIVE_MICRO_ASSET';
  if (req.brand_expression_required || req.prominence === 'PRIMARY') return 'BRAND_ICON';
  if (req.can_use_live_svg && LIVE_SVG_IDS.has(req.icon_semantic_id)) return 'LIVE_CODE_SVG';
  if (req.can_use_live_svg && !req.brand_expression_required) return 'LIVE_CODE_SVG';
  return 'BRAND_ICON';
}

export function applyClassification(req: Omit<IconRequirement, 'implementation_class'>): IconRequirement {
  return { ...req, implementation_class: classifyIconRequirement(req) };
}
