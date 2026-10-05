/** npx tsx scripts/generate-character-fabrication-manifest.ts → docs/character-fabrication/CHARACTER_FABRICATION_ASSET_MANIFEST.json */
import { writeFileSync } from 'node:fs';
import { buildCharacterAssetManifest } from '../shared/site00-character-fabrication/assets.js';

const out = 'docs/character-fabrication/CHARACTER_FABRICATION_ASSET_MANIFEST.json';
writeFileSync(out, `${JSON.stringify(buildCharacterAssetManifest(), null, 2)}\n`);
console.log(`wrote ${out}`);
