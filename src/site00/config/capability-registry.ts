/**
 * SITE 00 installable capability registry — data-driven systems for EVOLVE onboarding,
 * Studio recommendations, Services, and admin scope.
 */

export type CapabilityCategory =
  | 'EXPERIENCE'
  | 'COMMERCE'
  | 'OPERATIONS'
  | 'INTELLIGENCE'
  | 'CONNECTIONS';

export type Site00ServiceType = 'identity' | 'builder' | 'evolve';

export type CapabilityRegistryEntry = {
  id: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  supportedServiceTypes: Site00ServiceType[];
  assessmentRequired: boolean;
  accessRequirements: string[];
  dependencies: string[];
  iconAsset: string;
  status: 'active' | 'planned';
};

export const SITE00_CAPABILITY_REGISTRY: CapabilityRegistryEntry[] = [
  {
    id: 'ui-ux-enhancement',
    name: 'UI/UX ENHANCEMENT',
    category: 'EXPERIENCE',
    description: 'VISUAL POLISH, LAYOUT REFINEMENT, AND EXPERIENCE IMPROVEMENTS.',
    supportedServiceTypes: ['evolve'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-refine.svg',
    status: 'active',
  },
  {
    id: 'responsive-systems',
    name: 'RESPONSIVE SYSTEMS',
    category: 'EXPERIENCE',
    description: 'MOBILE AND MULTI-DEVICE EXPERIENCE OPTIMIZATION.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-refine.svg',
    status: 'active',
  },
  {
    id: 'interactive-navigation',
    name: 'INTERACTIVE NAVIGATION',
    category: 'EXPERIENCE',
    description: 'SMART NAVIGATION, WAYFINDING, AND CONTEXTUAL ROUTING.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-refine.svg',
    status: 'active',
  },
  {
    id: 'custom-storefront',
    name: 'CUSTOM STOREFRONT',
    category: 'COMMERCE',
    description: 'TAILORED ECOMMERCE EXPERIENCES ON EXISTING PLATFORMS.',
    supportedServiceTypes: ['evolve'],
    assessmentRequired: true,
    accessRequirements: ['shopify', 'stripe'],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-install.svg',
    status: 'active',
  },
  {
    id: 'product-configurator',
    name: 'PRODUCT CONFIGURATOR',
    category: 'COMMERCE',
    description: 'INTERACTIVE PRODUCT BUILDERS AND OPTION FLOWS.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-install.svg',
    status: 'active',
  },
  {
    id: 'memberships-rewards',
    name: 'MEMBERSHIPS & REWARDS',
    category: 'COMMERCE',
    description: 'ACCOUNTS, LOYALTY, SUBSCRIPTIONS, AND MEMBER EXPERIENCES.',
    supportedServiceTypes: ['evolve'],
    assessmentRequired: true,
    accessRequirements: ['stripe'],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-install.svg',
    status: 'active',
  },
  {
    id: 'smart-intake',
    name: 'SMART INTAKE',
    category: 'OPERATIONS',
    description: 'INTELLIGENT FORMS, QUALIFICATION, AND ONBOARDING FLOWS.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: false,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-install.svg',
    status: 'active',
  },
  {
    id: 'client-portals',
    name: 'CLIENT PORTALS',
    category: 'OPERATIONS',
    description: 'SECURE CLIENT WORKSPACES, FILES, AND PROJECT VISIBILITY.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-install.svg',
    status: 'active',
  },
  {
    id: 'admin-tooling',
    name: 'ADMIN TOOLING',
    category: 'OPERATIONS',
    description: 'INTERNAL DASHBOARDS, APPROVALS, AND WORKFLOW CONTROL.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-install.svg',
    status: 'active',
  },
  {
    id: 'workflow-automation',
    name: 'WORKFLOW AUTOMATION',
    category: 'OPERATIONS',
    description: 'AUTOMATED HANDOFFS, NOTIFICATIONS, AND OPERATIONAL FLOWS.',
    supportedServiceTypes: ['evolve'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-install.svg',
    status: 'active',
  },
  {
    id: 'ai-assistants',
    name: 'AI ASSISTANTS',
    category: 'INTELLIGENCE',
    description: 'CONTEXTUAL AI GUIDANCE AND SUPPORT WITHIN YOUR PROPERTY.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-transform.svg',
    status: 'active',
  },
  {
    id: 'personalization',
    name: 'PERSONALIZATION',
    category: 'INTELLIGENCE',
    description: 'ADAPTIVE CONTENT, RECOMMENDATIONS, AND USER-AWARE EXPERIENCES.',
    supportedServiceTypes: ['evolve'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-transform.svg',
    status: 'active',
  },
  {
    id: 'api-integrations',
    name: 'API INTEGRATIONS',
    category: 'CONNECTIONS',
    description: 'CONNECT CRM, PAYMENTS, BOOKING, ANALYTICS, AND THIRD-PARTY SYSTEMS.',
    supportedServiceTypes: ['evolve', 'builder'],
    assessmentRequired: true,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-transform.svg',
    status: 'active',
  },
  {
    id: 'analytics-insights',
    name: 'ANALYTICS & INSIGHTS',
    category: 'CONNECTIONS',
    description: 'MEASUREMENT, REPORTING, AND OPERATIONAL SIGNALS.',
    supportedServiceTypes: ['evolve'],
    assessmentRequired: false,
    accessRequirements: [],
    dependencies: [],
    iconAsset: '/assets/evolve/evolve-transform.svg',
    status: 'active',
  },
];

export function getCapabilitiesForService(service: Site00ServiceType): CapabilityRegistryEntry[] {
  return SITE00_CAPABILITY_REGISTRY.filter(
    (entry) => entry.status === 'active' && entry.supportedServiceTypes.includes(service),
  );
}

export function getCapabilitiesByCategory(
  service: Site00ServiceType = 'evolve',
): Record<CapabilityCategory, CapabilityRegistryEntry[]> {
  const entries = getCapabilitiesForService(service);
  const grouped = {} as Record<CapabilityCategory, CapabilityRegistryEntry[]>;
  for (const entry of entries) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }
  return grouped;
}
