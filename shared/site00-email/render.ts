import { renderArchetypeHtml } from './archetypes.js';
import { mergePreviewVars } from './fixtures/previewData.js';
import { qrDataUrlFor } from './qr.js';
import { getTemplateById, EMAIL_TEMPLATES } from './registry/templates.js';
import type { EmailTemplateVars, RenderedEmail } from './types.js';

export function resolveTemplateVars(templateId: string, overrides?: Partial<EmailTemplateVars>): EmailTemplateVars {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Unknown email template: ${templateId}`);
  return mergePreviewVars({ ...template.varsForPreview, familyLabel: template.familyLabel, ...overrides });
}

function needsQr(templateId: string): boolean {
  return templateId === 'access-credential-issued' || templateId === 'sign-in-link';
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

/** @deprecated sync wrapper — prefer renderEmailTemplate async */
export function renderEmailTemplateSync(templateId: string, varOverrides?: Partial<EmailTemplateVars>): RenderedEmail {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Unknown email template: ${templateId}`);
  const vars = resolveTemplateVars(templateId, varOverrides);
  const subject = template.subject(vars);
  const preheader = template.preheader(vars);
  const headline = template.headline(vars);
  const subheadline = template.subheadline?.(vars);
  const html = renderArchetypeHtml({ template, vars, subject, preheader, headline, subheadline });
  const text = renderEmailText({ template, vars, subject, headline, subheadline });
  return { html, text, subject, preheader };
}

export function renderEmailText(params: {
  template: { ctaLabel: string; name: string };
  vars: EmailTemplateVars;
  subject: string;
  headline: string;
  subheadline?: string;
}): string {
  const { template, vars, subject, headline, subheadline } = params;
  const lines: string[] = [subject, '', headline];
  if (subheadline) lines.push(subheadline);
  if (vars.bodyLines?.length) lines.push('', ...vars.bodyLines);
  if (vars.dataFields?.length) {
    lines.push('');
    for (const f of vars.dataFields) lines.push(`${f.label}: ${f.value}`);
  }
  if (vars.inputItems?.length) {
    lines.push('');
    vars.inputItems.forEach((item, i) => lines.push(`${String(i + 1).padStart(2, '0')} ${item}`));
  }
  lines.push('', `${template.ctaLabel}: ${vars.ctaUrl ?? 'https://site00.com'}`);
  lines.push('', '—', 'SITE 00', 'https://site00.com');
  return lines.join('\n');
}

export function listTemplateIds(): string[] {
  return EMAIL_TEMPLATES.map((t) => t.id);
}
