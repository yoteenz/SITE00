/**
 * Reference-target HTML for debug COMPARE mode — template-specific when manifest exists.
 */
import type { EmailFamilyCanon } from '../families/registry.js';
import { getFamilySpec } from '../families/registry.js';
import { getPrimaryFamily } from '../registry/family-map.js';
import { getTemplateManifest } from './template-manifest.js';
import { DEBUG_EMAIL_FIXTURES } from '../fixtures/previewData.js';
import { renderFamilyEmail } from '../design/families/render.js';
import { renderLifecycleComposition } from '../design/compositions/lifecycle.js';
import type { CompositionInput } from '../design/compositions.js';

function refInput(canon: EmailFamilyCanon): CompositionInput {
  const spec = getFamilySpec(canon);
  const v = { ...DEBUG_EMAIL_FIXTURES };
  return {
    family: 'access',
    familyLabel: spec.label.split(' / ')[0] ?? spec.label,
    templateId: `ref-${canon.toLowerCase()}`,
    headline: defaultHeadline(canon),
    subheadline: defaultSubheadline(canon),
    ctaLabel: spec.primaryCtaPattern,
    ctaUrl: v.ctaUrl ?? 'https://site00.com',
    classification: 'transactional',
    vars: v,
    qrDataUrl: canon === 'ACCESS_SECURITY' ? undefined : undefined,
  };
}

function defaultHeadline(canon: EmailFamilyCanon): string {
  switch (canon) {
    case 'ACCESS_SECURITY':
      return 'YOU HAVE ACCESS TO SITE 00.';
    case 'WELCOME_ONBOARDING':
      return 'YOUR LOCATION EXISTS NOW.';
    case 'PROJECT_PRODUCTION':
      return 'YOUR PROJECT IS IN PROGRESS.';
    case 'ACTION_REVIEW':
      return 'YOUR REVIEW IS REQUESTED.';
    case 'MILESTONE_CELEBRATION':
      return 'PHASE 01 COMPLETE.';
    case 'DELIVERY_COMPLETE':
      return 'YOUR PACKAGE IS READY.';
    case 'BILLING_PAYMENT':
      return 'BUILD RECEIPT ISSUED.';
    case 'ALERT_BLOCKER':
      return 'WE HIT A RED LIGHT.';
    case 'REENGAGEMENT_HUMAN':
      return "WE DIDN'T RENT IT OUT.";
    default:
      return 'SITE 00';
  }
}

function defaultSubheadline(canon: EmailFamilyCanon): string {
  switch (canon) {
    case 'ACCESS_SECURITY':
      return 'This secure link is unique to you. It will expire after one use.';
    case 'WELCOME_ONBOARDING':
      return 'Funny. It was empty five minutes ago.';
    case 'PROJECT_PRODUCTION':
      return "We're building what comes next. Track it. Refine it. Ship it.";
    case 'ACTION_REVIEW':
      return 'Please review the content below and provide your feedback.';
    case 'MILESTONE_CELEBRATION':
      return 'The foundation is set. The system is moving forward.';
    case 'DELIVERY_COMPLETE':
      return 'Your assets have been delivered to your SITE 00 vault.';
    case 'BILLING_PAYMENT':
      return 'Your transaction has funded another part of your build.';
    case 'ALERT_BLOCKER':
      return "Nothing's broken. We just can't build past this point without you.";
    case 'REENGAGEMENT_HUMAN':
      return 'YOUR LOCATION IS STILL EXACTLY WHERE YOU LEFT IT.';
    default:
      return '';
  }
}

export function renderReferenceTargetForFamily(canon: EmailFamilyCanon): string {
  const spec = getFamilySpec(canon);
  const input = refInput(canon);
  return renderFamilyEmail(canon, input, `${spec.label} — Reference`, 'Approved family reference target');
}

/** Legacy archetype param ignored — routes by template manifest or primary family. */
export function renderReferenceTarget(_archetype: string, _refLabel: string, templateId?: string): string {
  if (templateId) {
    const manifest = getTemplateManifest(templateId);
    if (manifest) {
      const spec = getFamilySpec(manifest.family);
      const input = refInput(manifest.family);
      input.templateId = templateId;
      input.headline = defaultHeadline(manifest.family);
      input.subheadline = defaultSubheadline(manifest.family);
      const lifecycle = renderLifecycleComposition(
        manifest.composition,
        input,
        `${spec.label} — Reference`,
        manifest.purpose,
      );
      if (lifecycle) return lifecycle;
    }
    return renderReferenceTargetForFamily(getPrimaryFamily(templateId));
  }
  return renderReferenceTargetForFamily('ACCESS_SECURITY');
}

export function referenceCompareLabel(canon: EmailFamilyCanon): string {
  const spec = getFamilySpec(canon);
  return `FAMILY ${spec.num} — APPROVED REFERENCE · ${spec.label}`;
}
