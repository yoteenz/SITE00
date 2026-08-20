import type { EmailArchetype, EmailFamily } from '../types.js';
import { visualFamilyForRegistryFamily, type VisualFamilyGroup } from './families.js';

export type FidelityStatus = 'calibrated' | 'in-progress' | 'needs-calibration';

export type CompositionContract = {
  templateId: string;
  family: EmailFamily;
  visualFamily: VisualFamilyGroup;
  visualThesis: string;
  primaryFocal: string;
  secondary?: string;
  tertiary?: string;
  requiredArtifact?: string;
  optionalArtifact?: string;
  dominantField: 'light' | 'dark';
  accent: string;
  density: 'low' | 'low-medium' | 'medium' | 'high';
  symmetry: 'symmetric' | 'intentional-asymmetry' | 'split';
  prohibited: string[];
  fidelityStatus: FidelityStatus;
};

const ARCHETYPE_DEFAULTS: Record<
  EmailArchetype,
  Omit<CompositionContract, 'templateId' | 'family' | 'visualFamily' | 'fidelityStatus'>
> = {
  'access-credential': {
    visualThesis: 'Site 00 has recognized you and issued temporary entry.',
    primaryFocal: 'ACCESS CREDENTIAL ARTIFACT',
    secondary: 'WELCOME / RECOGNITION MESSAGE',
    tertiary: 'CTA + system metadata',
    requiredArtifact: 'functional magic-link access object',
    optionalArtifact: 'QR',
    dominantField: 'dark',
    accent: 'SITE 00 red',
    density: 'low-medium',
    symmetry: 'intentional-asymmetry',
    prohibited: ['generic membership-card layout', 'oversized QR', 'generic SaaS header', 'serif-fashion treatment'],
  },
  'project-record': {
    visualThesis: 'A new production record has opened in the system.',
    primaryFocal: 'PROJECT INITIATION STRIP',
    secondary: 'Architectural hallway hero',
    tertiary: 'Metadata card + black CTA',
    dominantField: 'light',
    accent: 'Blueprint hallway band',
    density: 'medium',
    symmetry: 'split',
    prohibited: ['generic project card', 'dashboard screenshot'],
  },
  'studio-portal': {
    visualThesis: 'Payment confirmed — production environment unlocked.',
    primaryFocal: 'PORTAL DOORFRAME',
    secondary: 'Ceremonial status cards',
    tertiary: 'White CTA on dark field',
    dominantField: 'dark',
    accent: 'Red doorframe illumination',
    density: 'medium',
    symmetry: 'symmetric',
    prohibited: ['SaaS onboarding modal', 'plain dark rectangle'],
  },
  'action-required': {
    visualThesis: 'Production is blocked — input required without alert clichés.',
    primaryFocal: 'COORDINATE TARGET',
    secondary: 'Numbered input manifest',
    tertiary: 'Red CTA',
    dominantField: 'light',
    accent: 'Coordinate diagram',
    density: 'medium',
    symmetry: 'split',
    prohibited: ['red exclamation banner', 'generic todo list'],
  },
  'review-dossier': {
    visualThesis: 'Creative directions await review in the corridor.',
    primaryFocal: 'WIREFRAME CORRIDOR',
    secondary: 'Direction count headline',
    tertiary: 'Red CTA',
    dominantField: 'dark',
    accent: 'Direction badge marker',
    density: 'low-medium',
    symmetry: 'intentional-asymmetry',
    prohibited: ['generic review notification', 'attachment list'],
  },
  'milestone-artifact': {
    visualThesis: 'Ceremonial milestone recorded — achievement reveal.',
    primaryFocal: 'HEXAGON ACHIEVEMENT MARK',
    secondary: 'Milestone metadata strip',
    tertiary: 'Black CTA',
    dominantField: 'light',
    accent: 'Completion check in hex frame',
    density: 'low',
    symmetry: 'symmetric',
    prohibited: ['confetti', 'generic badge card'],
  },
  'status-notice': {
    visualThesis: 'Family-specific status transmission.',
    primaryFocal: 'EDITORIAL HEADLINE',
    secondary: 'Family accent mark',
    tertiary: 'Themed CTA',
    dominantField: 'light',
    accent: 'Family-specific geometry',
    density: 'low-medium',
    symmetry: 'symmetric',
    prohibited: ['universal card stack', 'identical layout across families'],
  },
  'system-check': {
    visualThesis: 'Final QA diagnostics before launch authorization.',
    primaryFocal: 'RADAR TARGET DIAGRAM',
    secondary: 'QA status card',
    tertiary: 'Red CTA',
    dominantField: 'light',
    accent: 'Circular radar target',
    density: 'medium',
    symmetry: 'symmetric',
    prohibited: ['checklist UI clone', 'generic pass/fail alert'],
  },
  'launch-authorization': {
    visualThesis: 'Launch sequence armed — approval required.',
    primaryFocal: 'LAUNCH STACK GRAPHIC',
    secondary: 'Authorization headline',
    tertiary: 'Black CTA',
    dominantField: 'light',
    accent: 'Vertical launch stack',
    density: 'low-medium',
    symmetry: 'symmetric',
    prohibited: ['rocket emoji hero', 'generic approval button'],
  },
  'location-live': {
    visualThesis: 'Property is live — arrival at destination.',
    primaryFocal: 'LIVE URL COORDINATE',
    secondary: 'Ceremonial headline',
    tertiary: 'Black CTA',
    dominantField: 'light',
    accent: 'Red accent line (no serif script)',
    density: 'low',
    symmetry: 'symmetric',
    prohibited: ['serif congratulations script', 'generic launch email'],
  },
  'production-complete': {
    visualThesis: 'Production record closed — property active.',
    primaryFocal: 'CORNER REGISTRATION MARKS',
    secondary: 'Closure headline',
    tertiary: 'Black CTA',
    dominantField: 'light',
    accent: 'Corner bracket marks',
    density: 'low',
    symmetry: 'symmetric',
    prohibited: ['shipping confirmation layout'],
  },
  'signal-editorial': {
    visualThesis: 'SITE 00 signal transmission — editorial modules.',
    primaryFocal: 'ISSUE INDEX + MODULES',
    secondary: 'Signal headline',
    tertiary: 'Black CTA',
    dominantField: 'light',
    accent: 'Numbered editorial modules',
    density: 'medium',
    symmetry: 'split',
    prohibited: ['newsletter grid template'],
  },
  'internal-notice': {
    visualThesis: 'Operator system notice — restrained instrumentation.',
    primaryFocal: 'SYSTEM HEADER',
    secondary: 'Operational copy',
    tertiary: 'Minimal CTA',
    dominantField: 'light',
    accent: 'Internal classification mark',
    density: 'low',
    symmetry: 'symmetric',
    prohibited: ['client-facing credential styling'],
  },
};

/** Templates with calibrated fidelity after visual correction sprint. */
const CALIBRATED_TEMPLATES = new Set([
  'sign-in-link',
  'access-credential-issued',
  'verify-email',
  'password-reset',
  'project-initialized',
  'payment-confirmed-studio-access',
  'client-input-required',
  'review-ready',
  'milestone-recorded',
  'qa-passed',
  'launch-authorization-required',
  'location-live',
  'production-complete',
  'site00-signal-newsletter',
]);

const IN_PROGRESS_TEMPLATES = new Set<string>();

export function getCompositionContract(
  templateId: string,
  family: EmailFamily,
  archetype: EmailArchetype,
): CompositionContract {
  const defaults = ARCHETYPE_DEFAULTS[archetype] ?? ARCHETYPE_DEFAULTS['status-notice'];
  const visualFamily = visualFamilyForRegistryFamily(family);
  let fidelityStatus: FidelityStatus = 'needs-calibration';
  if (CALIBRATED_TEMPLATES.has(templateId)) fidelityStatus = 'calibrated';
  else if (IN_PROGRESS_TEMPLATES.has(templateId)) fidelityStatus = 'in-progress';

  return {
    templateId,
    family,
    visualFamily,
    fidelityStatus,
    ...defaults,
  };
}

/** Per-template contract overrides for unique compositions. */
export function getTemplateContractOverrides(templateId: string): Partial<CompositionContract> {
  switch (templateId) {
    case 'sign-in-link':
      return {
        visualThesis: 'Secure one-time entry — magic link credential issued.',
        primaryFocal: 'ACCESS CREDENTIAL ARTIFACT',
        fidelityStatus: 'calibrated',
      };
    case 'access-credential-issued':
      return {
        visualThesis: 'New member credential issued upon account creation.',
        fidelityStatus: 'calibrated',
      };
    case 'verify-email':
      return {
        visualThesis: 'Email verification gate — confirm access coordinates.',
        dominantField: 'dark',
        primaryFocal: 'VERIFICATION COORDINATE MARK',
        fidelityStatus: 'calibrated',
      };
    case 'password-reset':
      return {
        visualThesis: 'Security reset — controlled session re-entry.',
        dominantField: 'dark',
        primaryFocal: 'RESET AUTHORIZATION STRIP',
        fidelityStatus: 'calibrated',
      };
    default:
      return {};
  }
}

export function resolveCompositionContract(
  templateId: string,
  family: EmailFamily,
  archetype: EmailArchetype,
): CompositionContract {
  const base = getCompositionContract(templateId, family, archetype);
  const overrides = getTemplateContractOverrides(templateId);
  return { ...base, ...overrides };
}
