import type { EmailFamilyCanon } from '../families/registry.js';
import { EMAIL_TEMPLATES } from './templates.js';

/** Explicit template → primary family mapping (81 templates). */
const TEMPLATE_FAMILY_MAP: Record<string, EmailFamilyCanon> = {
  // 01 ACCESS / SECURITY
  'sign-in-link': 'ACCESS_SECURITY',
  'verify-email': 'ACCESS_SECURITY',
  'password-reset': 'ACCESS_SECURITY',
  'security-change-recorded': 'ACCESS_SECURITY',
  'unusual-access': 'ACCESS_SECURITY',
  'access-credential-issued': 'ACCESS_SECURITY',

  // 02 WELCOME / ONBOARDING
  'welcome-location-assigned': 'WELCOME_ONBOARDING',
  'identity-path-received': 'WELCOME_ONBOARDING',
  'identity-input-saved': 'WELCOME_ONBOARDING',
  'identity-calibration-complete': 'WELCOME_ONBOARDING',
  'identity-review-ready': 'WELCOME_ONBOARDING',
  'identity-foundation-locked': 'WELCOME_ONBOARDING',

  // 03 PROJECT / PRODUCTION
  'build-type-identified': 'PROJECT_PRODUCTION',
  'project-initialized': 'PROJECT_PRODUCTION',
  'project-scope-ready': 'PROJECT_PRODUCTION',
  'scope-approved': 'PROJECT_PRODUCTION',
  'payment-authorization-ready': 'PROJECT_PRODUCTION',
  'payment-initiated': 'PROJECT_PRODUCTION',
  'payment-confirmed-studio-access': 'PROJECT_PRODUCTION',
  'studio-activated': 'PROJECT_PRODUCTION',
  'client-input-received': 'PROJECT_PRODUCTION',
  'production-resumed': 'PROJECT_PRODUCTION',
  'production-stage-started': 'PROJECT_PRODUCTION',
  'production-stage-completed': 'PROJECT_PRODUCTION',
  'assets-required': 'PROJECT_PRODUCTION',
  'asset-vault-updated': 'PROJECT_PRODUCTION',
  'assets-ready-for-review': 'PROJECT_PRODUCTION',
  'asset-approval-recorded': 'PROJECT_PRODUCTION',
  'asset-production-complete': 'PROJECT_PRODUCTION',
  'studio-record-available': 'PROJECT_PRODUCTION',
  'internal-new-client': 'PROJECT_PRODUCTION',
  'internal-payment-confirmed': 'PROJECT_PRODUCTION',
  'internal-client-input': 'PROJECT_PRODUCTION',
  'internal-review-submitted': 'PROJECT_PRODUCTION',
  'internal-revision-requested': 'PROJECT_PRODUCTION',
  'internal-approval-received': 'PROJECT_PRODUCTION',
  'internal-review-required': 'PROJECT_PRODUCTION',
  'internal-launch-ready': 'PROJECT_PRODUCTION',
  'internal-launch-completed': 'PROJECT_PRODUCTION',
  'internal-system-incident': 'PROJECT_PRODUCTION',

  // 04 ACTION / REVIEW
  'blueprint-directions-ready': 'ACTION_REVIEW',
  'review-ready': 'ACTION_REVIEW',
  'review-reminder': 'ACTION_REVIEW',
  'revision-received': 'ACTION_REVIEW',
  'revision-ready': 'ACTION_REVIEW',
  'approval-recorded': 'ACTION_REVIEW',
  'direction-locked': 'ACTION_REVIEW',
  'qa-started': 'ACTION_REVIEW',

  // 05 MILESTONE / CELEBRATION
  'milestone-recorded': 'MILESTONE_CELEBRATION',
  'major-progress': 'MILESTONE_CELEBRATION',
  'qa-passed': 'MILESTONE_CELEBRATION',

  // 06 DELIVERY / COMPLETE
  'launch-authorization-required': 'DELIVERY_COMPLETE',
  'launch-authorized': 'DELIVERY_COMPLETE',
  'deployment-started': 'DELIVERY_COMPLETE',
  'location-live': 'DELIVERY_COMPLETE',
  'production-complete': 'DELIVERY_COMPLETE',
  'final-deliverables-ready': 'DELIVERY_COMPLETE',
  'domain-connected': 'DELIVERY_COMPLETE',
  'post-launch-checkin': 'DELIVERY_COMPLETE',

  // 07 BILLING / PAYMENT
  'payment-receipt': 'BILLING_PAYMENT',
  'upcoming-payment': 'BILLING_PAYMENT',
  'invoice-ready': 'BILLING_PAYMENT',
  'refund-recorded': 'BILLING_PAYMENT',

  // 08 ALERT / BLOCKER
  'client-input-required': 'ALERT_BLOCKER',
  'production-paused': 'ALERT_BLOCKER',
  'payment-failed': 'ALERT_BLOCKER',
  'domain-connection-required': 'ALERT_BLOCKER',
  'integration-action-required': 'ALERT_BLOCKER',
  'launch-failed': 'ALERT_BLOCKER',
  'qa-client-input': 'ALERT_BLOCKER',
  'support-request-received': 'ALERT_BLOCKER',
  'support-response-available': 'ALERT_BLOCKER',
  'project-message': 'ALERT_BLOCKER',
  'internal-project-blocked': 'ALERT_BLOCKER',
  'internal-automation-failed': 'ALERT_BLOCKER',

  // 09 RE-ENGAGEMENT
  'site00-signal-newsletter': 'REENGAGEMENT_HUMAN',
  'case-study-spotlight': 'REENGAGEMENT_HUMAN',
  'system-update': 'REENGAGEMENT_HUMAN',
  're-engagement': 'REENGAGEMENT_HUMAN',
  'abandoned-intake': 'REENGAGEMENT_HUMAN',
  'evolve-invitation': 'REENGAGEMENT_HUMAN',
};

/** Fallback when template id missing from explicit map. */
function inferFamilyFromRegistry(templateId: string): EmailFamilyCanon {
  const t = EMAIL_TEMPLATES.find((x) => x.id === templateId);
  if (!t) return 'PROJECT_PRODUCTION';
  switch (t.family) {
    case 'access':
      return 'ACCESS_SECURITY';
    case 'identity':
      return 'WELCOME_ONBOARDING';
    case 'review':
      return 'ACTION_REVIEW';
    case 'milestone':
      return 'MILESTONE_CELEBRATION';
    case 'billing':
      return 'BILLING_PAYMENT';
    case 'signal':
      return 'REENGAGEMENT_HUMAN';
    case 'launch':
    case 'property':
    case 'domain':
      return 'DELIVERY_COMPLETE';
    case 'support':
    case 'internal':
      return 'ALERT_BLOCKER';
    default:
      return 'PROJECT_PRODUCTION';
  }
}

export function getPrimaryFamily(templateId: string): EmailFamilyCanon {
  return TEMPLATE_FAMILY_MAP[templateId] ?? inferFamilyFromRegistry(templateId);
}

export function listTemplatesByFamily(canon: EmailFamilyCanon): string[] {
  return EMAIL_TEMPLATES.filter((t) => getPrimaryFamily(t.id) === canon).map((t) => t.id);
}

export function familyMappingAudit(): {
  total: number;
  mapped: number;
  unresolved: string[];
} {
  const unresolved = EMAIL_TEMPLATES.filter((t) => !TEMPLATE_FAMILY_MAP[t.id]).map((t) => t.id);
  return {
    total: EMAIL_TEMPLATES.length,
    mapped: EMAIL_TEMPLATES.length - unresolved.length,
    unresolved,
  };
}

export { TEMPLATE_FAMILY_MAP };
