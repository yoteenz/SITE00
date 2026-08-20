import type { EmailArchetype, EmailTemplateDefinition, EmailTemplateVars } from './types.js';
import { renderFamilyEmail } from './design/families/render.js';
import { getPrimaryFamily } from './registry/family-map.js';
import { getFamilySpec, type EmailFamilyCanon } from './families/registry.js';
import type { CompositionInput } from './design/compositions.js';

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

/** Route every template through its primary nine-family hero composition. */
export function renderArchetypeHtml(input: ArchetypeRenderInput): string {
  const { template, subject, preheader } = input;
  const canon = getPrimaryFamily(template.id);
  return renderFamilyEmail(canon, ctx(input), subject, preheader);
}

/** Reference label for debug QA — family board id */
export function referenceCompositionLabel(archetype: EmailArchetype, templateId?: string): string {
  if (templateId) {
    const canon = getPrimaryFamily(templateId);
    const spec = getFamilySpec(canon);
    return `FAMILY ${spec.num} — ${spec.label}`;
  }
  const legacy: Record<EmailArchetype, string> = {
    'access-credential': 'FAMILY 01 — ACCESS / SECURITY',
    'project-record': 'FAMILY 03 — PROJECT / PRODUCTION',
    'studio-portal': 'FAMILY 03 — PROJECT / PRODUCTION',
    'action-required': 'FAMILY 08 — ALERT / BLOCKER',
    'review-dossier': 'FAMILY 04 — ACTION / REVIEW',
    'milestone-artifact': 'FAMILY 05 — MILESTONE / CELEBRATION',
    'status-notice': 'FAMILY — STATUS',
    'system-check': 'FAMILY 04 — ACTION / REVIEW',
    'launch-authorization': 'FAMILY 06 — DELIVERY / COMPLETE',
    'location-live': 'FAMILY 06 — DELIVERY / COMPLETE',
    'production-complete': 'FAMILY 06 — DELIVERY / COMPLETE',
    'signal-editorial': 'FAMILY 09 — RE-ENGAGEMENT',
    'internal-notice': 'INTERNAL — OPERATOR',
  };
  return legacy[archetype] ?? archetype;
}

export function referenceFamilyCanon(templateId: string): EmailFamilyCanon {
  return getPrimaryFamily(templateId);
}
