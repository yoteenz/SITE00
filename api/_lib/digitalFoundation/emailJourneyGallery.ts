import { FNDATN01_EMAILS } from '../../../shared/site00-correspondence-studio/fndatn01/pack.js';
import { allApprovedEmailGalleryTemplates } from '../../../shared/site00-digital-foundation/founderE2eEmailJourney.js';
import type { DigitalFoundationArtifactPayload } from '../../../shared/site00-digital-foundation/types.js';
import type { CommunicationSendIntent } from '../../../shared/site00-digital-foundation/communications/types.js';
import { renderFndatnForDispatch, supportsFndatnTemplate } from './communications/fndatnTemplateBridge.js';
import { prepareTestInvitation } from './founderReadiness.js';
import { effectivePublicAppOrigin } from './stagingEnvConfig.js';

export type EmailGalleryRow = {
  milestone: string;
  template_id: string;
  trigger: string;
  subject: string;
  html: string;
  cta_label: string;
  cta_destination: string;
  cta_links_resolved: string[];
  sending_status: string;
  provider_message_id: string | null;
  delivery_status: string;
  provider_status_at: string | null;
  timestamp: string | null;
  approval_status: 'NOT_APPLICABLE' | 'TRIGGERED' | 'NOT_TRIGGERED' | 'FAILED';
  intent_id: string | null;
};

function triggerLabel(trigger: unknown): string {
  if (!trigger || typeof trigger !== 'object') return '—';
  const t = trigger as { kind?: string; event?: string; condition?: string };
  if (t.kind === 'artifact_event') return t.event ?? 'artifact_event';
  if (t.kind === 'derived_condition') return t.condition ?? 'derived';
  return String(t.kind ?? '—');
}

function resolveCtaLinks(html: string, token: string, origin: string): string[] {
  const links = [...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((m) => m[0]);
  const pathLinks = [...html.matchAll(/\/foundation\/[A-Za-z0-9_-]+[^\s"'<>]*/g)].map((m) => `${origin}${m[0]}`);
  return [...new Set([...links, ...pathLinks])].filter((l) => l.includes(token) || l.includes('/foundation/'));
}

export function buildEmailJourneyGallery(input: {
  payload: DigitalFoundationArtifactPayload | null;
  intents: CommunicationSendIntent[];
}): EmailGalleryRow[] {
  const origin = effectivePublicAppOrigin().replace(/\/$/, '');
  const token = input.payload?.artifact.public_token ?? '{public_token}';
  const byTemplate = new Map<string, CommunicationSendIntent>();
  for (const intent of input.intents) {
    const prev = byTemplate.get(intent.template_id);
    if (!prev || intent.created_at > prev.created_at) byTemplate.set(intent.template_id, intent);
  }

  return FNDATN01_EMAILS.map((meta) => {
    const intent = byTemplate.get(meta.template_id);
    const applicable = allApprovedEmailGalleryTemplates().find((g) => g.template_id === meta.template_id)
      ?.applicable_in_automated_run;

    let subject = '—';
    let html = '';
    if (input.payload && supportsFndatnTemplate(meta.template_id)) {
      const rendered = renderFndatnForDispatch(meta.template_id, input.payload, origin);
      if (rendered) {
        subject = rendered.subject;
        html = rendered.html;
      }
    }

    let approval_status: EmailGalleryRow['approval_status'] = applicable ? 'NOT_TRIGGERED' : 'NOT_APPLICABLE';
    if (intent) {
      approval_status = intent.status === 'FAILED' || intent.status === 'BOUNCED' ? 'FAILED' : 'TRIGGERED';
    }

    const ctaDest = meta.cta_destination.replace('{public_token}', token);

    return {
      milestone: meta.title,
      template_id: meta.template_id,
      trigger: triggerLabel(meta.trigger),
      subject: intent && supportsFndatnTemplate(meta.template_id) ? prepareTestInvitation(intent.intent_id).subject : subject,
      html,
      cta_label: meta.cta_label,
      cta_destination: ctaDest,
      cta_links_resolved: html ? resolveCtaLinks(html, token, origin) : [],
      sending_status: intent?.status ?? 'NOT_SENT',
      provider_message_id: intent?.provider_message_id ?? null,
      delivery_status: intent?.status ?? 'NOT_SENT',
      provider_status_at: intent?.provider_status_at ?? null,
      timestamp: intent?.created_at ?? null,
      approval_status,
      intent_id: intent?.intent_id ?? null,
    };
  });
}
