#!/usr/bin/env tsx
/** Verify canonical formation resolution against production Supabase. */
import { resolveCanonicalCoreDirectionFormation } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/canonicalFormationResolver.js';

const NDXBOOK_ORG = '7681ab75-bddc-43e5-b594-79fcf8168205';

async function main() {
  const result = await resolveCanonicalCoreDirectionFormation({
    organizationId: NDXBOOK_ORG,
    currentBrandLoreFingerprint: '5e71f429',
    preferredFormationVersion: 1,
  });
  console.log(
    JSON.stringify(
      {
        selectionReason: result.selectionReason,
        candidatesConsidered: result.candidatesConsidered,
        formationId: result.record?.formationId,
        formationVersion: result.record?.formationVersion,
        status: result.record?.status,
        directionNames: result.record?.finalDirections?.map((d) => d.directionName),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
