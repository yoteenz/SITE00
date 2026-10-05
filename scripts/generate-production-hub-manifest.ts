/**
 * Deterministically generates docs/production-hub/GROK_ASSET_MANIFEST.json from the asset registry.
 * Run: npx tsx scripts/generate-production-hub-manifest.ts
 */
import { writeFileSync } from 'node:fs';
import { buildHubGrokManifest } from '../shared/site00-production-hub/manifest.js';

const out = 'docs/production-hub/GROK_ASSET_MANIFEST.json';
writeFileSync(out, `${JSON.stringify(buildHubGrokManifest(), null, 2)}\n`);
console.log(`wrote ${out}`);
