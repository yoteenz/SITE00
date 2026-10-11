/**
 * Mint Anthony Digital Foundation invite (founder machine only).
 * Requires: SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1, Supabase service role env.
 * Usage:
 *   ANTHONY_CONTACT_EMAIL=... ANTHONY_CONTACT_NAME=... node --import tsx scripts/site00/mint-anthony-foundation-invite.mjs
 * Prints personalized URL to stdout — do not commit output.
 */
import { createArtifactForLead } from '../../api/_lib/digitalFoundation/service.js';
import { persistArtifactGraph } from '../../api/_lib/digitalFoundation/persistence/supabaseStore.js';

const email = process.env.ANTHONY_CONTACT_EMAIL?.trim();
const name = process.env.ANTHONY_CONTACT_NAME?.trim() || 'Anthony Reyes';
const business = process.env.ANTHONY_BUSINESS_NAME?.trim() || 'Anthony Transport LLC';

if (!email) {
  console.error('BLOCKED: set ANTHONY_CONTACT_EMAIL to mint the production invite.');
  process.exit(2);
}

process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE = '1';

const artifact = createArtifactForLead({
  business_name: business,
  contact_name: name,
  contact_email: email,
  referral_kind: 'DIRECT',
});
await persistArtifactGraph(artifact.artifact_id);

console.log(JSON.stringify({
  artifact_id: artifact.artifact_id,
  production_url: `https://site00.com/foundation/${artifact.public_token}`,
  api_check: `https://api.site00.com/api/site00/digital-foundation-artifact?action=payload&token=${encodeURIComponent(artifact.public_token)}`,
}, null, 2));
