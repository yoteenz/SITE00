/** Central email event → template mapping for production wiring. */
export type EmailEventId =
  | 'ACCOUNT_CREATED'
  | 'EMAIL_VERIFICATION_REQUIRED'
  | 'MAGIC_LINK_REQUESTED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'IDENTITY_PATH_SELECTED'
  | 'IDENTITY_COMPLETE'
  | 'BUILD_TYPE_SELECTED'
  | 'PROJECT_CREATED'
  | 'SCOPE_READY'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_CONFIRMED'
  | 'STUDIO_ACTIVATED'
  | 'CLIENT_INPUT_REQUIRED'
  | 'CLIENT_INPUT_RECEIVED'
  | 'PRODUCTION_RESUMED'
  | 'PRODUCTION_BLOCKED'
  | 'STAGE_STARTED'
  | 'STAGE_COMPLETED'
  | 'BLUEPRINT_REVIEW_READY'
  | 'REVIEW_READY'
  | 'REVISION_RECEIVED'
  | 'REVISION_READY'
  | 'APPROVAL_RECEIVED'
  | 'DIRECTION_LOCKED'
  | 'ASSET_VAULT_UPDATED'
  | 'ASSET_REVIEW_READY'
  | 'MILESTONE_RECORDED'
  | 'QA_STARTED'
  | 'QA_PASSED'
  | 'LAUNCH_AUTH_REQUIRED'
  | 'LAUNCH_AUTHORIZED'
  | 'LOCATION_LIVE'
  | 'PRODUCTION_COMPLETE'
  | 'PAYMENT_FAILED'
  | 'DOMAIN_REQUIRED'
  | 'DOMAIN_CONNECTED'
  | 'MARKETING_INTAKE_RECEIVED'
  | 'MARKETING_PAYMENT_CONFIRMED'
  | 'MARKETING_PRODUCTION_STARTED'
  | 'MARKETING_CLIENT_ACTION_REQUIRED'
  | 'MARKETING_REVIEW_READY'
  | 'MARKETING_DELIVERABLE_READY'
  | 'MARKETING_CAMPAIGN_COMPLETE'
  | 'INTAKE_ACCESS_REQUESTED'
  | 'INTAKE_SUBMITTED'
  | 'INTAKE_CLAIMED';

export type EmailEventDefinition = {
  event: EmailEventId;
  templateId: string;
  wired: boolean;
  notes?: string;
};

/** Maps lifecycle events to template IDs. `wired: true` only when send path exists. */
export const EMAIL_EVENT_REGISTRY: EmailEventDefinition[] = [
  { event: 'ACCOUNT_CREATED', templateId: 'access-credential-issued', wired: true, notes: 'Profile create → sendEmailAsync (stub until provider configured)' },
  { event: 'EMAIL_VERIFICATION_REQUIRED', templateId: 'verify-email', wired: false, notes: 'Supabase Auth owns verification emails' },
  { event: 'PASSWORD_RESET_REQUESTED', templateId: 'password-reset', wired: false, notes: 'Supabase Auth owns reset emails' },
  { event: 'MAGIC_LINK_REQUESTED', templateId: 'sign-in-link', wired: false, notes: 'Wire when magic-link auth confirmed' },
  { event: 'IDENTITY_PATH_SELECTED', templateId: 'identity-path-received', wired: false },
  { event: 'IDENTITY_COMPLETE', templateId: 'identity-calibration-complete', wired: false },
  { event: 'BUILD_TYPE_SELECTED', templateId: 'build-type-identified', wired: false },
  { event: 'PROJECT_CREATED', templateId: 'project-initialized', wired: false },
  { event: 'SCOPE_READY', templateId: 'project-scope-ready', wired: false },
  { event: 'PAYMENT_REQUIRED', templateId: 'payment-authorization-ready', wired: false },
  { event: 'PAYMENT_INITIATED', templateId: 'payment-initiated', wired: false },
  { event: 'PAYMENT_CONFIRMED', templateId: 'payment-confirmed-studio-access', wired: false, notes: 'Wire on Stripe webhook confirmation' },
  { event: 'STUDIO_ACTIVATED', templateId: 'studio-activated', wired: false },
  { event: 'CLIENT_INPUT_REQUIRED', templateId: 'client-input-required', wired: false },
  { event: 'CLIENT_INPUT_RECEIVED', templateId: 'client-input-received', wired: false },
  { event: 'PRODUCTION_BLOCKED', templateId: 'production-paused', wired: false },
  { event: 'REVIEW_READY', templateId: 'review-ready', wired: false },
  { event: 'BLUEPRINT_REVIEW_READY', templateId: 'blueprint-directions-ready', wired: false },
  { event: 'REVISION_RECEIVED', templateId: 'revision-received', wired: false },
  { event: 'APPROVAL_RECEIVED', templateId: 'approval-recorded', wired: false },
  { event: 'DIRECTION_LOCKED', templateId: 'direction-locked', wired: false },
  { event: 'MILESTONE_RECORDED', templateId: 'milestone-recorded', wired: false },
  { event: 'QA_PASSED', templateId: 'qa-passed', wired: false },
  { event: 'LAUNCH_AUTH_REQUIRED', templateId: 'launch-authorization-required', wired: false },
  { event: 'LOCATION_LIVE', templateId: 'location-live', wired: false },
  { event: 'PRODUCTION_COMPLETE', templateId: 'production-complete', wired: false },
  { event: 'PAYMENT_FAILED', templateId: 'payment-failed', wired: false },
  { event: 'DOMAIN_REQUIRED', templateId: 'domain-connection-required', wired: false },
  { event: 'DOMAIN_CONNECTED', templateId: 'domain-connected', wired: false },
  { event: 'MARKETING_INTAKE_RECEIVED', templateId: 'marketing-intake-received', wired: false, notes: 'Wire when marketing intake API persists' },
  { event: 'MARKETING_PAYMENT_CONFIRMED', templateId: 'payment-confirmed-studio-access', wired: false, notes: 'Marketing engagement payment → studio access pattern' },
  { event: 'MARKETING_PRODUCTION_STARTED', templateId: 'production-stage-started', wired: false },
  { event: 'MARKETING_CLIENT_ACTION_REQUIRED', templateId: 'client-input-required', wired: false },
  { event: 'MARKETING_REVIEW_READY', templateId: 'review-ready', wired: false },
  { event: 'MARKETING_DELIVERABLE_READY', templateId: 'final-deliverables-ready', wired: false },
  { event: 'MARKETING_CAMPAIGN_COMPLETE', templateId: 'production-complete', wired: false },
  {
    event: 'INTAKE_ACCESS_REQUESTED',
    templateId: 'intake-guest-access',
    wired: false,
    notes: 'Guest secure resume link — visual production approved (FAL-native Intake Access pilot). "wired: false" reflects that no EMAIL_PROVIDER is configured yet, not the design status; sendEmailAsync renders the real template and records a truthful not-configured state.',
  },
  {
    event: 'INTAKE_SUBMITTED',
    templateId: 'intake-submission-receipt',
    wired: false,
    notes: 'CREATIVE_DIRECTION_PENDING — Identity/Builder completion receipt. intakeType in payload distinguishes IDENTITY vs BUILDER.',
  },
  {
    event: 'INTAKE_CLAIMED',
    templateId: 'intake-claimed',
    wired: false,
    notes: 'CREATIVE_DIRECTION_PENDING — guest intake claimed by an authenticated account.',
  },
];

export function getEventTemplate(event: EmailEventId): EmailEventDefinition | undefined {
  return EMAIL_EVENT_REGISTRY.find((e) => e.event === event);
}

export function getTemplateIdForLegacyType(templateType: string): string {
  const legacy: Record<string, string> = {
    welcome: 'access-credential-issued',
    'access-credential': 'access-credential-issued',
    'project-created': 'project-initialized',
    'payment-confirmed': 'payment-confirmed-studio-access',
    'client-input-required': 'client-input-required',
    'review-ready': 'review-ready',
  };
  return legacy[templateType] ?? templateType;
}
