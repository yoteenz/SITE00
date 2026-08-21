/**
 * SITE 00 transactional email dispatch.
 * Renders from shared template registry; provider wiring deferred until configured.
 */
import { renderEmailTemplate } from '../../../shared/site00-email/render.js';
import { getTemplateIdForLegacyType } from '../../../shared/site00-email/registry/events.js';
import { emailSendKey, hasEmailBeenSent, markEmailSent } from '../../../shared/site00-email/sendLog.js';
import type { EmailTemplateVars } from '../../../shared/site00-email/types.js';

export type SendEmailOptions = {
  templateType: string;
  recipientEmail: string;
  variables?: Record<string, string | number>;
  eventId?: string;
  projectId?: string;
  force?: boolean;
};

function mapLegacyVariables(vars?: Record<string, string | number>): Partial<EmailTemplateVars> {
  if (!vars) return {};
  const completionRaw = vars.intakeCompletionPercent;
  const completion = typeof completionRaw === 'number' ? completionRaw : typeof completionRaw === 'string' ? Number(completionRaw) : undefined;
  return {
    clientName: vars.customerName ? String(vars.customerName) : vars.clientName ? String(vars.clientName) : undefined,
    projectName: vars.projectName ? String(vars.projectName) : undefined,
    projectId: vars.projectId ? String(vars.projectId) : undefined,
    ctaUrl: vars.ctaUrl ? String(vars.ctaUrl) : undefined,
    reviewName: vars.reviewName ? String(vars.reviewName) : undefined,
    milestoneName: vars.milestoneName ? String(vars.milestoneName) : undefined,
    liveUrl: vars.liveUrl ? String(vars.liveUrl) : undefined,
    intakeReference: vars.intakeReference ? String(vars.intakeReference) : undefined,
    intakeType: vars.intakeType === 'BUILDER' ? 'BUILDER' : vars.intakeType === 'IDENTITY' ? 'IDENTITY' : undefined,
    secureViewUrl: vars.secureViewUrl ? String(vars.secureViewUrl) : undefined,
    accountClaimUrl: vars.accountClaimUrl ? String(vars.accountClaimUrl) : undefined,
    nextStep: vars.nextStep ? String(vars.nextStep) : undefined,
    // Intake Access email family (FAL-native visual production pilot) — see
    // shared/site00-email/production/intake-access-manifest.ts.
    intakeStatusDisplay: vars.intakeStatusDisplay ? String(vars.intakeStatusDisplay) : undefined,
    intakeLastSavedAtDisplay: vars.intakeLastSavedAtDisplay ? String(vars.intakeLastSavedAtDisplay) : undefined,
    intakeCompletionPercent: Number.isFinite(completion) ? completion : undefined,
  };
}

export async function renderEmailForSend(options: SendEmailOptions) {
  const templateId = getTemplateIdForLegacyType(options.templateType);
  const rendered = await renderEmailTemplate(templateId, mapLegacyVariables(options.variables));
  return { ...rendered, templateId };
}

export function sendEmailAsync(options: SendEmailOptions): void {
  const templateId = getTemplateIdForLegacyType(options.templateType);
  const key = emailSendKey({
    templateId,
    recipient: options.recipientEmail,
    eventId: options.eventId,
    projectId: options.projectId,
  });

  if (!options.force && hasEmailBeenSent(key)) {
    markEmailSent({
      templateId,
      event: options.eventId,
      recipient: options.recipientEmail,
      projectId: options.projectId,
      status: 'skipped',
      providerStatus: 'duplicate',
    });
    console.info('[sendEmail] skipped duplicate', templateId, options.recipientEmail);
    return;
  }

  void (async () => {
    try {
      const rendered = await renderEmailForSend(options);
      const provider = process.env.EMAIL_PROVIDER?.trim();

      if (!provider) {
        markEmailSent({
          templateId,
          event: options.eventId,
          recipient: options.recipientEmail,
          projectId: options.projectId,
          status: 'skipped',
          providerStatus: 'not-configured',
        });
        console.info('[sendEmail] rendered (provider not configured)', templateId, options.recipientEmail, rendered.subject);
        return;
      }

      markEmailSent({
        templateId,
        event: options.eventId,
        recipient: options.recipientEmail,
        projectId: options.projectId,
        status: 'queued',
        providerStatus: provider,
      });
      console.info('[sendEmail] queued', provider, templateId, options.recipientEmail, rendered.subject);
    } catch (err) {
      markEmailSent({
        templateId,
        event: options.eventId,
        recipient: options.recipientEmail,
        projectId: options.projectId,
        status: 'failed',
        error: err instanceof Error ? err.message : 'render failed',
      });
      console.error('[sendEmail] failed', templateId, err);
    }
  })();
}
