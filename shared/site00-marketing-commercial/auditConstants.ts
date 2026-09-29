/**
 * P0.SW.MARKETING-WEBSITE-TO-STUDIO-WORLD-COMMERCIAL-PIPELINE-INTEGRATION1
 * Documented audit of EXISTING marketing architecture (do not invent parallel routes).
 */

export const MARKETING_ARCHITECTURE_AUDIT = {
  MARKETING_PUBLIC_ROUTE: '/evolve/marketing',
  MARKETING_SERVICE_PAGE: '/evolve/marketing/services',
  MARKETING_PACKAGE_MODEL: 'shared/site00-marketing/serviceTaxonomy.ts (MARKETING_CONTENT_SERVICES by service category — not dollar packages)',
  MARKETING_PURCHASE_FLOW:
    'INTAKE → BRIEF → authorize → confirm-payment (server) → provision (Studio World adapter) — see docs/SITE_00_EVOLVE_MARKETING.md',
  MARKETING_INTAKE_FLOW: '/evolve/marketing/intake/:serviceId',
  MARKETING_PROJECT_CREATION_FLOW:
    'createMarketingEngagement (API) → intake complete → payment → provision links studio_world_campaign_id + site00_external_production_links',
  MARKETING_CLIENT_WORKSPACE_ROUTE: '/evolve/marketing/engagement/:engagementId',
  MARKETING_BILLING_MODEL:
    'payment_state on site00_marketing_engagements; EVOLVE commercial catalog in shared/site00-evolve-commercial (separate from per-service marketing intake)',
  MARKETING_EXISTING_DATABASE_TABLES: [
    'site00_marketing_engagements',
    'site00_marketing_engagement_events',
    'site00_external_production_links',
    'site00_marketing_profiles (EVOLVE Marketing OS)',
  ],
  MARKETING_EXISTING_STUDIO_WORLD_HANDOFF:
    'api/_lib/marketingEngagements/service.provisionMarketingEngagement → getProductionServiceAdapter().provisionCampaign',
  PRICING_AUTHORITY: 'shared/site00-evolve-commercial/types.ts (FOUNDER_PRICING_REQUIRED for Studio World add-ons until wired)',
} as const;

export const MARKETING_CUSTOMER_JOURNEY_STEPS = [
  'VISITOR',
  'MARKETING_PAGE',
  'PACKAGE_SERVICE',
  'CTA_INTAKE',
  'PURCHASE_CONTACT_INTAKE',
  'ACCOUNT',
  'PROJECT_ENGAGEMENT',
  'PRODUCTION',
] as const;
