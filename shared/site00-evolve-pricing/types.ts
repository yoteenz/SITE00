/** EVOLVE pricing authorities — shared types. */

export type EvolvePricingMode = 'SELF_DIRECTED' | 'SITE00_DIRECTED';

export type EvolvePricingPlanIconId =
  | 'solo'
  | 'studio'
  | 'pro'
  | 'project-pass'
  | 'agency-enterprise'
  | 'discovery-sprint'
  | 'directed-build'
  | 'growth-partner'
  | 'marketing-retainer'
  | 'custom-agency';

export type EvolvePricingPlan = {
  id: string;
  index: string;
  name: string;
  subtitle: string;
  price: string;
  priceDetail: string;
  bullets: string[];
  footer?: string;
  badge?: string;
  iconId: EvolvePricingPlanIconId;
  ctaLabel: string;
  ctaRoute: string;
  featured?: boolean;
};

export const EVOLVE_PRICING_MODES: EvolvePricingMode[] = ['SELF_DIRECTED', 'SITE00_DIRECTED'];
