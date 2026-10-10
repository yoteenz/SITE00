import { beforeEach, describe, expect, it } from 'vitest';
import { buildClientRecords } from '../shared/site00-digital-foundation/clientRecords.js';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  acceptQuote,
  createArtifactForLead,
  getClientArtifactPayloadByToken,
  updateIntake,
} from '../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { buildDfMenu, DF_DISCLOSURES, portalViewsForPayload, resolveDfRoute } from '../src/site00/foundation-client/model';

beforeEach(() => resetDigitalFoundationMemoryStore());

function paidPayload() {
  const a = createArtifactForLead({ referral_kind: 'DIRECT', business_name: 'Portal Co' });
  updateIntake(
    a.artifact_id,
    { business_name: 'Portal Co', contact_name: 'Sam', current_email: 'sam@portal.co', team_size: 1, needs: ['NEED_DOMAIN'] },
    true,
  );
  acceptQuote({ artifact_id: a.artifact_id, disclosures: [...DF_DISCLOSURES] });
  return a;
}

describe('project portal routing (Family C)', () => {
  it('PORTAL surface exposes roadmap and needs-you when portal v2 flag is on', async () => {
    const a = paidPayload();
    await simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: getClientArtifactPayloadByToken(a.public_token).quote!.quote_id });
    const payload = getClientArtifactPayloadByToken(a.public_token);
    const route = resolveDfRoute(payload, { checkout: null, activationSeen: true });
    expect(route.kind).toBe('views');
    if (route.kind !== 'views') return;
    expect(route.views).toContain('ROADMAP');
    expect(route.views).toContain('NEEDS_YOU');
    expect(route.views).toContain('COMM_PREFS');
  });

  it('menu destinations include needs-you and communication preferences on portal', async () => {
    const a = paidPayload();
    await simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: getClientArtifactPayloadByToken(a.public_token).quote!.quote_id });
    const payload = getClientArtifactPayloadByToken(a.public_token);
    const views = portalViewsForPayload(payload);
    const menu = buildDfMenu(['P06', ...views], 'OVERVIEW');
    expect(menu.destinations.some((d) => d.id === 'needs_you' && d.available)).toBe(true);
    expect(menu.destinations.some((d) => d.id === 'comm_prefs' && d.available)).toBe(true);
  });

  it('records index only includes honest rows (payment when paid)', async () => {
    const a = paidPayload();
    await simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: getClientArtifactPayloadByToken(a.public_token).quote!.quote_id });
    const payload = getClientArtifactPayloadByToken(a.public_token);
    const rows = buildClientRecords(payload);
    expect(rows.some((r) => r.category === 'PAYMENTS')).toBe(true);
    expect(rows.every((r) => r.title.length > 0)).toBe(true);
  });
});
