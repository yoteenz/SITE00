#!/usr/bin/env npx tsx
/**
 * Canonical creative range preflight — no image generation.
 */

import {
  getCanonicalRangePreflight,
} from '../api/_lib/site00Evolve/creativeDirection/canonicalCreativeRange/canonicalCreativeRangeService.js';

async function main() {
  const preflight = await getCanonicalRangePreflight();
  console.log(JSON.stringify(preflight, null, 2));
  if (!preflight.canonicalRangeGenerationReady) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
