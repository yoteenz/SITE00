import { renderFndatn01Email } from '../../../../shared/site00-correspondence-studio/fndatn01/index.js';
import type { Fndatn01EmailId } from '../../../../shared/site00-correspondence-studio/fndatn01/pack.js';
import type { DigitalFoundationArtifactPayload } from '../../../../shared/site00-digital-foundation/types.js';
import { demoScenario, fixtureContextFor } from '../../../../shared/site00-correspondence-studio/fndatn01/fixtures.js';
import { isSyntheticBusinessName } from '../../../../shared/site00-digital-foundation/founderTestMode.js';

const TEMPLATE_TO_FNDATN: Record<string, Fndatn01EmailId> = {
  'personal-foundation-invitation': '01',
  'intake-completed': '02',
  'quote-ready': '03',
  'payment-confirmed': '04',
  'foundation-complete': '05',
  'intake-resume-reminder': '06',
  'quote-expiry-reminder': '07',
};

export function fndatnEmailIdForTemplate(templateId: string): Fndatn01EmailId | null {
  return TEMPLATE_TO_FNDATN[templateId] ?? null;
}

export function supportsFndatnTemplate(templateId: string): boolean {
  return templateId in TEMPLATE_TO_FNDATN;
}

/**
 * Render FNDATN-01 HTML for a lifecycle template. Uses live artifact payload when synthetic; otherwise demo scenario for preview sends.
 */
export function renderFndatnForDispatch(templateId: string, payload: DigitalFoundationArtifactPayload, assetBase: string) {
  const emailId = fndatnEmailIdForTemplate(templateId);
  if (!emailId) return null;

  const synthetic = isSyntheticBusinessName(payload.lead.business_name ?? payload.artifact.intake.business_name);
  const data = synthetic ? payload : demoScenario(emailId);
  const ctx = { ...fixtureContextFor(emailId), mode: 'send' as const, assetBase, founderAuthorized: emailId === '01' };
  const rendered = renderFndatn01Email(emailId, data, ctx);
  if (!rendered.ok || !rendered.html) return null;
  return { subject: rendered.subject ?? rendered.subjectHtml ?? 'SITE 00 Digital Foundation', html: rendered.html };
}
