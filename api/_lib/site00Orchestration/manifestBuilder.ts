import type { ManifestBuilderInput, ProposedManifest, LaunchTargetType } from './types.js';

const FEATURE_CATALOG: Record<
  string,
  { title: string; why: string; defaultClassification: 'REQUIRED_FOR_LAUNCH' | 'OPTIONAL_POST_LAUNCH' }
> = {
  public_website: {
    title: 'Public Website',
    why: 'Core public-facing web presence required for launch target.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  identity: {
    title: 'Brand Identity',
    why: 'Approved identity system required for consistent launch.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  payments: {
    title: 'Payment Processing',
    why: 'Online payment capability required for revenue operations.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  authentication: {
    title: 'Authentication',
    why: 'User authentication required for protected client flows.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  mobile_responsive: {
    title: 'Mobile Responsiveness',
    why: 'Mobile experience required for field and client access.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  social_marketing: {
    title: 'Social Marketing',
    why: 'Social presence supports brand launch awareness.',
    defaultClassification: 'OPTIONAL_POST_LAUNCH',
  },
  native_app: {
    title: 'Native Application',
    why: 'Native app extends platform reach.',
    defaultClassification: 'OPTIONAL_POST_LAUNCH',
  },
  campaign_hero: {
    title: 'Campaign Hero Film',
    why: 'Flagship creative asset for brand launch campaign.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  analytics: {
    title: 'Analytics Verification',
    why: 'Launch measurement and conversion tracking.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  commerce: {
    title: 'Commerce System',
    why: 'Product catalog and purchase flows for brand commerce.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  transactional_email: {
    title: 'Transactional Email',
    why: 'Lifecycle and access emails for customer communication.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  admin_operations: {
    title: 'Admin Operations',
    why: 'Internal operator environment for production management.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  builder_flow: {
    title: 'Builder Flow',
    why: 'Client onboarding and project builder intake.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  studio_workflow: {
    title: 'Studio Workflow',
    why: 'Creative production pipeline for deliverables.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  client_portal: {
    title: 'Client Portal',
    why: 'Authenticated client access to project status and deliverables.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  load_board: {
    title: 'Load Board',
    why: 'Core brokerage load board operations.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  permitting: {
    title: 'Permitting Module',
    why: 'Regulatory permitting workflows for service operations.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  brokerage: {
    title: 'Brokerage Operations',
    why: 'Core brokerage service delivery.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  smart_intake: {
    title: 'Smart Intake',
    why: 'Structured client intake for service requests.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
  legal_essentials: {
    title: 'Legal Essentials',
    why: 'Terms, privacy, and compliance pages for launch.',
    defaultClassification: 'REQUIRED_FOR_LAUNCH',
  },
};

const ORG_DEFAULTS: Record<
  string,
  { targetType: LaunchTargetType; targetName: string; features: string[]; deferred: string[] }
> = {
  'site-00': {
    targetType: 'FULL_PLATFORM_LAUNCH',
    targetName: 'Full Platform Launch',
    features: [
      'public_website',
      'identity',
      'builder_flow',
      'payments',
      'studio_workflow',
      'admin_operations',
      'transactional_email',
    ],
    deferred: ['social_marketing'],
  },
  'frontal-slayer': {
    targetType: 'FLAGSHIP_BRAND_LAUNCH',
    targetName: 'Flagship Brand Launch',
    features: [
      'commerce',
      'payments',
      'transactional_email',
      'campaign_hero',
      'analytics',
      'mobile_responsive',
    ],
    deferred: ['social_marketing'],
  },
  'all-in-one-enterprises': {
    targetType: 'CORE_OPERATIONS',
    targetName: 'Core Service Operations',
    features: [
      'public_website',
      'mobile_responsive',
      'authentication',
      'smart_intake',
      'permitting',
      'brokerage',
      'client_portal',
      'payments',
      'legal_essentials',
      'load_board',
    ],
    deferred: ['social_marketing', 'native_app'],
  },
};

export function generateProposedManifest(input: ManifestBuilderInput): ProposedManifest {
  const orgDefaults = ORG_DEFAULTS[input.organizationSlug] ?? {
    targetType: 'CUSTOM' as LaunchTargetType,
    targetName: 'Custom Launch Target',
    features: input.requestedFeatures ?? [],
    deferred: input.deferredFeatures ?? [],
  };

  const requested = new Set(input.requestedFeatures ?? orgDefaults.features);
  const excluded = new Set(input.excludedFeatures ?? []);
  const deferred = new Set(input.deferredFeatures ?? orgDefaults.deferred);

  for (const f of excluded) {
    requested.delete(f);
    deferred.delete(f);
  }

  const requirements: ProposedManifest['requirements'] = [];

  for (const [key, def] of Object.entries(FEATURE_CATALOG)) {
    if (excluded.has(key)) continue;
    if (!requested.has(key) && !deferred.has(key)) continue;

    const isDeferred = deferred.has(key);
    requirements.push({
      requirement_key: key,
      title: def.title,
      description: def.why,
      why_required: isDeferred
        ? `Owner elected to defer ${def.title} to post-launch.`
        : def.why,
      classification: isDeferred ? 'DEFERRED_BY_OWNER' : def.defaultClassification,
      execution_status: 'NOT_STARTED',
      can_defer: def.defaultClassification !== 'REQUIRED_FOR_LAUNCH' || isDeferred,
      source_of_requirement: `manifest_builder:${input.organizationSlug}`,
    });
  }

  return {
    targetName: input.launchMode ? String(input.launchMode).replace(/_/g, ' ') : orgDefaults.targetName,
    targetType: input.launchMode ?? orgDefaults.targetType,
    objective:
      input.businessObjective ??
      `Achieve ${orgDefaults.targetName} for ${input.organizationSlug.replace(/-/g, ' ').toUpperCase()}.`,
    requirements,
  };
}
