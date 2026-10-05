/**
 * Email send log + idempotency — lightweight stubs until provider + DB table exist.
 */
export type EmailSendLogEntry = {
  id: string;
  templateId: string;
  event?: string;
  recipient: string;
  projectId?: string;
  sentAt: string;
  status: 'queued' | 'sent' | 'failed' | 'skipped';
  providerStatus?: string;
  error?: string;
};

const sentKeys = new Set<string>();
const sendLog: EmailSendLogEntry[] = [];

export function emailSendKey(params: { templateId: string; recipient: string; eventId?: string; projectId?: string }): string {
  return [params.templateId, params.recipient.toLowerCase(), params.eventId ?? '', params.projectId ?? ''].join('|');
}

export function hasEmailBeenSent(key: string): boolean {
  return sentKeys.has(key);
}

export function markEmailSent(entry: Omit<EmailSendLogEntry, 'id' | 'sentAt'>): EmailSendLogEntry {
  const record: EmailSendLogEntry = {
    ...entry,
    id: `eml_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sentAt: new Date().toISOString(),
  };
  sendLog.unshift(record);
  if (record.status === 'sent' || record.status === 'queued') {
    sentKeys.add(emailSendKey({ templateId: record.templateId, recipient: record.recipient, eventId: record.event, projectId: record.projectId }));
  }
  return record;
}

export function getEmailSendLog(limit = 50): EmailSendLogEntry[] {
  return sendLog.slice(0, limit);
}
