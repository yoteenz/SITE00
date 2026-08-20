/**
 * SITE 00 transactional email dispatch.
 * Renders from shared template registry; provider wiring deferred until configured.
 */
import { renderEmailTemplate } from '../../shared/site00-email/render.js';
import { getTemplateIdForLegacyType } from '../../shared/site00-email/registry/events.js';
import { emailSendKey, hasEmailBeenSent, markEmailSent } from '../../shared/site00-email/sendLog.js';
import type { EmailTemplateVars } from '../../shared/site00-email/types.js';

export type SendEmailOptions = {
  templateType: string;
  recipientEmail: string;
  variables?: Record<string, string>;
  eventId?: string;
  projectId?: string;
  force?: boolean;
};

function mapLegacyVariables(vars?: Record<string, string>): Partial<EmailTemplateVars> {
  if (!vars) return {};
  return {
    clientName: vars.customerName ?? vars.clientName,
    projectName: vars.projectName,
    projectId: vars.projectId,
    ctaUrl: vars.ctaUrl,
    reviewName: vars.reviewName,
    milestoneName: vars.milestoneName,
    liveUrl: vars.liveUrl,
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
