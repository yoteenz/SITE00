import type { IntegrationOpportunity, ProjectExperienceIntelligence } from './map2Types';

const CATALOG = ['Shopify', 'Stripe', 'Booking', 'CRM', 'Email', 'SMS', 'Membership', 'Auth', 'Social', 'Reviews', 'Loyalty', 'Analytics'] as const;

export function proposeIntegrationsFromIntelligence(intelligence: ProjectExperienceIntelligence): IntegrationOpportunity[] {
  const proposed: IntegrationOpportunity[] = [];
  if (intelligence.revenue_model.toLowerCase().includes('commerce') || intelligence.products_services.length) {
    proposed.push({
      integration: 'Shopify',
      reason: 'Product catalog + checkout',
      experience_enabled: 'Commerce flows',
      routes_affected: ['/review', '/build'],
      required_or_optional: 'REQUIRED',
      launch_or_future: 'LAUNCH',
    });
  }
  if (intelligence.app_intent === 'COMPANION' || intelligence.app_intent === 'PRIMARY') {
    proposed.push({
      integration: 'Auth',
      reason: 'Cross-device session + saved projects',
      experience_enabled: 'Account + app companion',
      routes_affected: ['/account', '/projects'],
      required_or_optional: 'REQUIRED',
      launch_or_future: 'LAUNCH',
    });
  }
  return proposed;
}

export function listIntegrationCatalog(): readonly string[] {
  return CATALOG;
}
