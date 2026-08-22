import { renderArchetypeHtml } from './archetypes.js';
import { mergePreviewVars } from './fixtures/previewData.js';
import { getPrimaryFamily } from './registry/family-map.js';
import { qrDataUrlFor } from './qr.js';
import { getTemplateById, EMAIL_TEMPLATES } from './registry/templates.js';
import type { EmailFamilyCanon } from './families/registry.js';
import type { EmailTemplateDefinition, EmailTemplateVars, RenderedEmail } from './types.js';

export function resolveTemplateVars(templateId: string, overrides?: Partial<EmailTemplateVars>): EmailTemplateVars {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Unknown email template: ${templateId}`);
  return mergePreviewVars(template.id, { ...template.varsForPreview, familyLabel: template.familyLabel, ...overrides });
}

function needsQr(templateId: string): boolean {
  return getPrimaryFamily(templateId) === 'ACCESS_SECURITY';
}

export async function renderEmailTemplate(templateId: string, varOverrides?: Partial<EmailTemplateVars>): Promise<RenderedEmail> {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Unknown email template: ${templateId}`);

  const vars = resolveTemplateVars(templateId, varOverrides);
  const subject = template.subject(vars);
  const preheader = template.preheader(vars);
  const headline = template.headline(vars);
  const subheadline = template.subheadline?.(vars);

  let qrDataUrl: string | undefined;
  if (needsQr(templateId)) {
    qrDataUrl = await qrDataUrlFor(vars.ctaUrl ?? 'https://site00.com/signin');
  }

  const html = renderArchetypeHtml({ template, vars, subject, preheader, headline, subheadline, qrDataUrl });
  const text = renderEmailText({ template, vars, subject, headline, subheadline });

  return { html, text, subject, preheader };
}

export function renderEmailTemplateSync(templateId: string, varOverrides?: Partial<EmailTemplateVars>): RenderedEmail {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Unknown email template: ${templateId}`);
  const vars = resolvePreviewVarsSync(templateId, varOverrides, template);
  const subject = template.subject(vars);
  const preheader = template.preheader(vars);
  const headline = template.headline(vars);
  const subheadline = template.subheadline?.(vars);
  const html = renderArchetypeHtml({ template, vars, subject, preheader, headline, subheadline });
  const text = renderEmailText({ template, vars, subject, headline, subheadline });
  return { html, text, subject, preheader };
}

function resolvePreviewVarsSync(
  templateId: string,
  overrides: Partial<EmailTemplateVars> | undefined,
  template: EmailTemplateDefinition,
): EmailTemplateVars {
  return mergePreviewVars(templateId, { ...template.varsForPreview, familyLabel: template.familyLabel, ...overrides });
}

/** Family-aware plain-text fallback */
export function renderEmailText(params: {
  template: EmailTemplateDefinition;
  vars: EmailTemplateVars;
  subject: string;
  headline: string;
  subheadline?: string;
}): string {
  const { template, vars, subject, headline, subheadline } = params;
  const canon = getPrimaryFamily(template.id);
  const lines: string[] = [subject, '', headline];
  if (subheadline) lines.push(subheadline);

  appendFamilyText(lines, canon, vars, template);

  lines.push('', `${template.ctaLabel}: ${vars.ctaUrl ?? 'https://site00.com'}`);
  if (vars.secondaryCtaLabel && vars.secondaryCtaUrl) {
    lines.push(`${vars.secondaryCtaLabel}: ${vars.secondaryCtaUrl}`);
  }
  lines.push('', '—', 'SITE 00', 'https://site00.com');
  return lines.join('\n');
}

function appendFamilyText(
  lines: string[],
  canon: EmailFamilyCanon,
  vars: EmailTemplateVars,
  _template: EmailTemplateDefinition,
): void {
  // Intake Access/lifecycle emails carry their own dynamic record fields regardless of which
  // canon family they map into for the family-default shell (ACCESS_SECURITY / WELCOME_ONBOARDING) —
  // handled once here rather than duplicated across those canon branches.
  if (vars.intakeReference) {
    lines.push('', `${(vars.intakeType ?? 'INTAKE').toUpperCase()} REFERENCE: ${vars.intakeReference}`);
    if (vars.intakeStatusDisplay) lines.push(`STATUS: ${vars.intakeStatusDisplay}`);
    if (vars.intakeLastSavedAtDisplay) lines.push(`LAST SAVED: ${vars.intakeLastSavedAtDisplay}`);
    if (typeof vars.intakeCompletionPercent === 'number') lines.push(`COMPLETION: ${vars.intakeCompletionPercent}%`);
    return;
  }
  switch (canon) {
    case 'ACCESS_SECURITY':
      if (vars.memberId) lines.push('', `MEMBER ID: ${vars.memberId}`);
      if (vars.issuedDate) lines.push(`ISSUED: ${vars.issuedDate}`);
      if (vars.statusLabel) lines.push(`STATUS: ${vars.statusLabel}`);
      break;
    case 'WELCOME_ONBOARDING':
      lines.push('', `LOCATION: ${vars.locationId ?? vars.memberId ?? '—'}`);
      if (vars.firstStop) lines.push(`FIRST STOP: ${vars.firstStop}`);
      break;
    case 'PROJECT_PRODUCTION':
      if (vars.projectId) lines.push('', `PROJECT: ${vars.projectId}`);
      if (vars.phase) lines.push(`PHASE: ${vars.phase}`);
      if (vars.currentModule) lines.push(`MODULE: ${vars.currentModule}`);
      break;
    case 'ACTION_REVIEW':
      if (vars.dataFields?.length) {
        lines.push('');
        for (const f of vars.dataFields) lines.push(`${f.label}: ${f.value}`);
      }
      break;
    case 'MILESTONE_CELEBRATION':
      if (vars.milestonePhase) lines.push('', `MILESTONE: ${vars.milestonePhase}`);
      if (vars.milestoneImpact) lines.push(`IMPACT: ${vars.milestoneImpact}`);
      break;
    case 'DELIVERY_COMPLETE':
      if (vars.packageId) lines.push('', `PACKAGE: ${vars.packageId}`);
      if (vars.storageLocation) lines.push(`STORAGE: ${vars.storageLocation}`);
      break;
    case 'BILLING_PAYMENT':
      if (vars.invoiceId) lines.push('', `RECEIPT: ${vars.invoiceId}`);
      if (vars.amount) lines.push(`TOTAL: ${vars.currency ?? 'USD'} ${vars.amount}`);
      if (vars.paymentStatus) lines.push(`STATUS: ${vars.paymentStatus}`);
      break;
    case 'ALERT_BLOCKER':
      if (vars.holdId) lines.push('', `HOLD: ${vars.holdId}`);
      if (vars.waitingOn) lines.push(`WAITING ON: ${vars.waitingOn}`);
      if (vars.inputItems?.length) {
        lines.push('');
        vars.inputItems.forEach((item, i) => lines.push(`${String(i + 1).padStart(2, '0')} ${item}`));
      }
      break;
    case 'REENGAGEMENT_HUMAN':
      lines.push('', `LOCATION: ${vars.locationId ?? vars.memberId ?? '—'}`);
      if (vars.occupancyStatus) lines.push(`OCCUPANCY: ${vars.occupancyStatus}`);
      break;
    default:
      if (vars.bodyLines?.length) lines.push('', ...vars.bodyLines);
  }
}

export function listTemplateIds(): string[] {
  return EMAIL_TEMPLATES.map((t) => t.id);
}

export function getTemplatePrimaryFamily(templateId: string): EmailFamilyCanon {
  return getPrimaryFamily(templateId);
}
