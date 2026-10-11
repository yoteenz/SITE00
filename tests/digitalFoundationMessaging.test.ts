import { describe, expect, it } from 'vitest';
import { createArtifactForLead } from '../api/_lib/digitalFoundation/service.js';
import { listProjectMessages, sendProjectMessage } from '../api/_lib/digitalFoundation/messaging.js';

describe('Digital Foundation project messaging', () => {
  it('round-trips founder and client messages in memory', () => {
    const a = createArtifactForLead({ business_name: 'Msg Co', contact_name: 'Client', contact_email: 'c@test.local' });
    sendProjectMessage({ artifact_id: a.artifact_id, author_role: 'FOUNDER', body: 'PLEASE CONFIRM YOUR DOMAIN.' });
    sendProjectMessage({ artifact_id: a.artifact_id, author_role: 'CLIENT', body: 'DOMAIN IS MINE AT EXAMPLE.COM.' });
    const msgs = listProjectMessages(a.artifact_id);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].author_role).toBe('FOUNDER');
    expect(msgs[1].author_role).toBe('CLIENT');
    expect(msgs[1].body).toContain('EXAMPLE.COM');
  });
});
