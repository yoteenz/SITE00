import type { EmailFamilyCanon } from '../families/registry.js';
import type { EmailTheme } from '../types.js';

/** Event-specific composition ids — not interchangeable family shells. */
export type EmailCompositionId =
  | 'ACCESS_CREDENTIAL'
  | 'WELCOME_LOCATION'
  | 'IDENTITY_PATH'
  | 'IDENTITY_INPUT'
  | 'IDENTITY_CALIBRATION'
  | 'IDENTITY_REVIEW'
  | 'IDENTITY_FOUNDATION'
  | 'INTAKE_ACCESS'
  | 'FAMILY_DEFAULT';

export type TemplateManifestEntry = {
  family: EmailFamilyCanon;
  trigger: string;
  purpose: string;
  visualMode: EmailTheme | 'warm';
  signatureArtifact: string;
  composition: EmailCompositionId;
  compositionType: string;
  statusTreatment: string;
};

/** Per-template art direction — composition overrides family-default renderer. */
export const TEMPLATE_MANIFEST: Record<string, TemplateManifestEntry> = {
  'access-credential-issued': {
    family: 'ACCESS_SECURITY',
    trigger: 'ACCOUNT_CREATED',
    purpose: 'Confirm digital access credential issued at account creation',
    visualMode: 'dark',
    signatureArtifact: 'DIGITAL CREDENTIAL',
    composition: 'ACCESS_CREDENTIAL',
    compositionType: 'SECURE_ACCESS',
    statusTreatment: 'ACCESS GRANTED',
  },
  'welcome-location-assigned': {
    family: 'WELCOME_ONBOARDING',
    trigger: 'LOCATION_ASSIGNED',
    purpose: 'Welcome recipient to assigned SITE 00 location',
    visualMode: 'light',
    signatureArtifact: 'LOCATION KEY',
    composition: 'WELCOME_LOCATION',
    compositionType: 'LOCATION_WELCOME',
    statusTreatment: 'LOCATION ASSIGNED',
  },
  'identity-path-received': {
    family: 'WELCOME_ONBOARDING',
    trigger: 'IDENTITY_PATH_SELECTED',
    purpose: 'Record identity path selection and orientation route',
    visualMode: 'light',
    signatureArtifact: 'PATH / ROUTE MAP',
    composition: 'IDENTITY_PATH',
    compositionType: 'ORIENTATION_ROUTE',
    statusTreatment: 'PATH RECEIVED',
  },
  'identity-input-saved': {
    family: 'WELCOME_ONBOARDING',
    trigger: 'IDENTITY_INPUT_SAVED',
    purpose: 'Confirm identity intake capture saved',
    visualMode: 'light',
    signatureArtifact: 'INPUT RECEIPT',
    composition: 'IDENTITY_INPUT',
    compositionType: 'DATA_CAPTURE',
    statusTreatment: 'INPUT CAPTURED',
  },
  'identity-calibration-complete': {
    family: 'WELCOME_ONBOARDING',
    trigger: 'IDENTITY_COMPLETE',
    purpose: 'Mark identity calibration alignment complete',
    visualMode: 'dark',
    signatureArtifact: 'CALIBRATION MATRIX',
    composition: 'IDENTITY_CALIBRATION',
    compositionType: 'ALIGNMENT_RECORD',
    statusTreatment: 'CALIBRATION COMPLETE',
  },
  'identity-review-ready': {
    family: 'WELCOME_ONBOARDING',
    trigger: 'IDENTITY_REVIEW_READY',
    purpose: 'Identity deliverables ready for operator review',
    visualMode: 'dark',
    signatureArtifact: 'REVIEW DOSSIER',
    composition: 'IDENTITY_REVIEW',
    compositionType: 'REVIEW_QUEUE',
    statusTreatment: 'READY FOR REVIEW',
  },
  'identity-foundation-locked': {
    family: 'WELCOME_ONBOARDING',
    trigger: 'IDENTITY_FOUNDATION_LOCKED',
    purpose: 'Identity foundation specification locked for build',
    visualMode: 'light',
    signatureArtifact: 'LOCKED FOUNDATION BLUEPRINT',
    composition: 'IDENTITY_FOUNDATION',
    compositionType: 'SPECIFICATION_RECORD',
    statusTreatment: 'FOUNDATION LOCKED',
  },
  // INTAKE ACCESS — FAL-native visual production pilot (see shared/site00-email/production/
  // intake-access-manifest.ts for the full reference decomposition). Single composition,
  // branches BUILDER/IDENTITY internally on vars.intakeType — distinct art direction per
  // the founder-approved concept board, shared lifecycle semantics.
  'intake-guest-access': {
    family: 'ACCESS_SECURITY',
    trigger: 'INTAKE_ACCESS_REQUESTED',
    purpose: 'Secure guest resume/view access to a saved Builder or Identity intake',
    visualMode: 'light',
    signatureArtifact: 'BUILD BRIEF RECORD (Builder) / IDENTITY FILE RECORD (Identity)',
    composition: 'INTAKE_ACCESS',
    compositionType: 'INTAKE_LIFECYCLE_ACCESS',
    statusTreatment: 'SECURE ACCESS',
  },
};

export function getTemplateManifest(templateId: string): TemplateManifestEntry | undefined {
  return TEMPLATE_MANIFEST[templateId];
}

export function getTemplateComposition(templateId: string): EmailCompositionId {
  return TEMPLATE_MANIFEST[templateId]?.composition ?? 'FAMILY_DEFAULT';
}
