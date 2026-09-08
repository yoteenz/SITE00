/**
 * B5.9R1 — Universal project operating capabilities (distinct from runtime PROJECT_CAPABILITIES).
 * Founder-facing module name for marketing is EVOLVE (not Marketing).
 */

export const PROJECT_OPERATING_CAPABILITIES = [
  'IDENTITY',
  'BUILDER',
  'EVOLVE',
  'CAMPAIGNS',
  'CONTENT_OPS',
  'CREATIVE_INTELLIGENCE',
  'PRODUCTION',
  'WEBSITE_PRODUCTION',
  'REVIEWS',
  'LIBRARY',
  'ANALYTICS',
  'LAUNCH',
  'MAINTENANCE',
  'CLIENT_REVIEW',
  'APPROVALS',
  'CONTROL_ROOM',
] as const;

export type ProjectOperatingCapability = (typeof PROJECT_OPERATING_CAPABILITIES)[number];

/** Internal marketing capability maps to founder-facing EVOLVE module. */
export const MARKETING_TO_EVOLVE_MODULE = 'EVOLVE' as const;

export function operatingCapabilityToModule(
  capability: ProjectOperatingCapability,
): string | null {
  switch (capability) {
    case 'IDENTITY':
      return 'IDENTITY';
    case 'BUILDER':
    case 'WEBSITE_PRODUCTION':
      return 'BUILDER';
    case 'EVOLVE':
    case 'CAMPAIGNS':
    case 'CONTENT_OPS':
    case 'CREATIVE_INTELLIGENCE':
    case 'ANALYTICS':
      return 'EVOLVE';
    case 'PRODUCTION':
    case 'LAUNCH':
    case 'MAINTENANCE':
      return 'PRODUCTION';
    case 'REVIEWS':
    case 'CLIENT_REVIEW':
    case 'APPROVALS':
      return 'REVIEWS';
    case 'LIBRARY':
      return 'LIBRARY';
    case 'CONTROL_ROOM':
      return null;
    default:
      return null;
  }
}
