/**
 * Part 22 — Mock commercial surface reconciliation.
 */

import type { MockCommercialSurface } from './types.js';

export const MOCK_COMMERCIAL_SURFACES: readonly MockCommercialSurface[] = [
  {
    id: 'seed-services-hub',
    location: 'src/site00/config/seed/site00-page-seed.ts SITE00_SERVICES_SEED',
    resolution: 'CONNECT',
    reason: 'Hub links valid routes but copy is seed — catalog should drive labels when CMS absent',
  },
  {
    id: 'evolve-pricing-plans',
    location: '/evolve/plans EvolvePricingPage',
    resolution: 'REPLACE_WITH_REAL_STATE',
    reason: 'Must read canonical catalog or explicit legacy alias banner',
  },
  {
    id: 'control-billing-placeholder',
    location: '/control/billing ControlSectionPage',
    resolution: 'REPLACE_WITH_REAL_STATE',
    reason: 'Placeholder modules must not imply live billing',
  },
  {
    id: 'idnty-display-tiers',
    location: 'src/site00/config/identity.ts IDNTY_INVESTMENT_TIERS',
    resolution: 'CONNECT',
    reason: 'Display until canonical package IDs wired to intake context',
  },
  {
    id: 'portfolio-journal-seed',
    location: 'site00-page-seed empty arrays',
    resolution: 'KEEP_AS_DEV_ONLY',
    reason: 'Not commercial offers',
  },
  {
    id: 'marketing-confirm-payment-sim',
    location: 'confirmMarketingPayment API',
    resolution: 'KEEP_AS_DEV_ONLY',
    reason: 'Simulated payment until Stripe — maps to CommercialActivationEvent',
  },
];

export function mockSurfaceWouldMasqueradeAsLive(id: string): boolean {
  const s = MOCK_COMMERCIAL_SURFACES.find((m) => m.id === id);
  return s?.resolution === 'REPLACE_WITH_REAL_STATE';
}
