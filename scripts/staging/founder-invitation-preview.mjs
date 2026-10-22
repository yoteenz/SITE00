/**
 * Local staging proof: render invitation preview without Resend send.
 * Usage (names only — set real allowlist email locally):
 *   SITE00_DF_FOUNDER_TEST_MODE=1 \
 *   SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST=you@domain.com \
 *   SITE00_PUBLIC_APP_ORIGIN=https://staging.example.com \
 *   node scripts/staging/founder-invitation-preview.mjs
 */
import { createSyntheticTestClient, prepareTestInvitation } from '../../api/_lib/digitalFoundation/founderReadiness.js';
import { getDfMemoryState } from '../../api/_lib/digitalFoundation/memoryStore.js';

const allowlist = process.env.SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST?.trim();
if (!allowlist) {
  console.error('BLOCKED: set SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST');
  process.exit(1);
}
if (process.env.SITE00_DF_FOUNDER_TEST_MODE !== '1') {
  console.error('BLOCKED: set SITE00_DF_FOUNDER_TEST_MODE=1');
  process.exit(1);
}

const email = allowlist.split(/[,;\s]+/)[0];
const out = createSyntheticTestClient({ display_name: 'Founder Staging E2E', contact_email: email });
const intent = [...getDfMemoryState().sendIntents.values()].find((i) => i.template_id === 'personal-foundation-invitation');
if (!intent) {
  console.error('BLOCKED: no invitation intent queued');
  process.exit(1);
}
const preview = prepareTestInvitation(intent.intent_id);
console.log(
  JSON.stringify(
    {
      artifact_id: out.artifact.artifact_id,
      personalized_path: out.personalized_url,
      staging_origin: process.env.SITE00_PUBLIC_APP_ORIGIN ?? 'https://site00.com (default — set SITE00_PUBLIC_APP_ORIGIN for staging)',
      preview,
      send_blocked: true,
    },
    null,
    2,
  ),
);
