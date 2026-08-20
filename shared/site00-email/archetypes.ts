import type { EmailArchetype, EmailTemplateDefinition, EmailTemplateVars } from './types.js';
import {
  composeAccessWelcome,
  composeActionRequired,
  composeInternalNotice,
  composeLaunchAuthorization,
  composeLocationLive,
  composeMilestoneArtifact,
  composeProductionComplete,
  composeProjectInitiated,
  composeReviewDossier,
  composeRevisionNotice,
  composeSignalEditorial,
  composeStatusNotice,
  composeStudioPortal,
  composeSystemCheck,
  type CompositionInput,
} from './design/compositions.js';

export type ArchetypeRenderInput = {
  template: EmailTemplateDefinition;
  vars: EmailTemplateVars;
  subject: string;
  preheader: string;
  headline: string;
  subheadline?: string;
  qrDataUrl?: string;
};

function ctx(input: ArchetypeRenderInput): CompositionInput {
  const { template, vars, headline, subheadline } = input;
  return {
    family: template.family,
    familyLabel: vars.familyLabel ?? template.familyLabel,
    templateId: template.id,
    headline,
    subheadline,
    ctaLabel: template.ctaLabel,
    ctaUrl: vars.ctaUrl ?? 'https://site00.com',
    classification: template.classification,
    vars: { ...vars, theme: vars.theme ?? template.defaultTheme },
    qrDataUrl: input.qrDataUrl,
  };
}

export function renderArchetypeHtml(input: ArchetypeRenderInput): string {
  const { template, subject, preheader } = input;
  const c = ctx(input);

  switch (template.archetype as EmailArchetype) {
    case 'access-credential':
      return composeAccessWelcome(c, subject, preheader);
    case 'project-record':
      return composeProjectInitiated(c, subject, preheader);
    case 'studio-portal':
      return composeStudioPortal(c, subject, preheader);
    case 'action-required':
      return composeActionRequired(c, subject, preheader);
    case 'review-dossier':
      return composeReviewDossier(c, subject, preheader);
    case 'milestone-artifact':
      return composeMilestoneArtifact(c, subject, preheader);
    case 'status-notice':
      if (template.id === 'revision-received' || template.id === 'client-revision-received') {
        return composeRevisionNotice(c, subject, preheader);
      }
      return composeStatusNotice(c, subject, preheader);
    case 'system-check':
      return composeSystemCheck(c, subject, preheader);
    case 'launch-authorization':
      return composeLaunchAuthorization(c, subject, preheader);
    case 'location-live':
      return composeLocationLive(c, subject, preheader);
    case 'production-complete':
      return composeProductionComplete(c, subject, preheader);
    case 'signal-editorial':
      return composeSignalEditorial(c, subject, preheader);
    case 'internal-notice':
      return composeInternalNotice(c, subject, preheader);
    default:
      return composeStatusNotice(c, subject, preheader);
  }
}

/** Reference sheet composition label for debug QA panel */
export function referenceCompositionLabel(archetype: EmailArchetype): string {
  const map: Record<EmailArchetype, string> = {
    'access-credential': 'REF 01 — Access / Welcome credential',
    'project-record': 'REF 02 — Project Initiated',
    'studio-portal': 'REF 03 — Studio Access Granted',
    'action-required': 'REF 04 — Input Required',
    'review-dossier': 'REF 05 — Review Ready dossier',
    'milestone-artifact': 'REF 06 — Milestone Recorded',
    'status-notice': 'REF 07 — Status / Revision notice',
    'system-check': 'REF 08 — Final System Check',
    'launch-authorization': 'REF 09 — Launch Authorization',
    'location-live': 'REF 10 — Location Live',
    'production-complete': 'REF 11 — Production Complete',
    'signal-editorial': 'REF 12 — SITE 00 Signal',
    'internal-notice': 'INTERNAL — Operator notice',
  };
  return map[archetype] ?? archetype;
}
