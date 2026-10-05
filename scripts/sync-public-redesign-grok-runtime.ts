/**
 * Copy production-eligible Grok outputs into public/ and emit runtime URL registry.
 *   npx tsx scripts/sync-public-redesign-grok-runtime.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname ?? '.', '..');
const REGISTRY_PATH = path.join(ROOT, 'docs/site00/public-redesign/GROK_ASSET_PACK/ASSET_REGISTRY.json');
const RECON_PATH = path.join(ROOT, 'docs/site00/public-redesign/OPUS_DERIVED_SURGERY/RECONCILIATION.json');
const PUBLIC_DIR = path.join(ROOT, 'public/site00/public-redesign/grok');
const OUT_TS = path.join(ROOT, 'src/site00/authority/publicRedesignAssetUrls.ts');

type RegAsset = {
  asset_id: string;
  slot_id: string;
  canonical_filename: string;
  output_path: string;
  production_eligible: boolean;
};

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')) as { assets: RegAsset[] };
const reconciliation = JSON.parse(fs.readFileSync(RECON_PATH, 'utf8')) as {
  live_code: string[];
  production_eligible: number;
};

const liveCode = new Set(reconciliation.live_code);
const eligible = registry.assets.filter((a) => a.production_eligible);
if (eligible.length !== reconciliation.production_eligible) {
  throw new Error(`Expected ${reconciliation.production_eligible} eligible, got ${eligible.length}`);
}

fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const urls: Record<string, string> = {};
for (const asset of eligible) {
  if (liveCode.has(asset.asset_id)) {
    throw new Error(`Live-code asset marked eligible: ${asset.asset_id}`);
  }
  const src = path.join(ROOT, asset.output_path);
  if (!fs.existsSync(src)) throw new Error(`Missing output: ${asset.output_path}`);
  const dest = path.join(PUBLIC_DIR, asset.canonical_filename);
  fs.copyFileSync(src, dest);
  const slotId = asset.slot_id || asset.asset_id;
  if (urls[slotId]) throw new Error(`Duplicate slot registration: ${slotId}`);
  urls[slotId] = `/site00/public-redesign/grok/${asset.canonical_filename}`;
}

const blocked = registry.assets.filter((a) => !a.production_eligible);
for (const b of blocked) {
  if (!liveCode.has(b.asset_id)) {
    throw new Error(`Blocked asset not in live_code list: ${b.asset_id}`);
  }
}

const ts = `/**
 * AUTO-GENERATED — production-eligible Grok assets for public redesign injection.
 * Source: docs/site00/public-redesign/GROK_ASSET_PACK/ASSET_REGISTRY.json
 * Run: npx tsx scripts/sync-public-redesign-grok-runtime.ts
 */
export const PUBLIC_REDESIGN_ASSET_URLS: Partial<Record<string, string>> = ${JSON.stringify(urls, null, 2)} as const;

export const PUBLIC_REDESIGN_INJECTED_ASSET_COUNT = ${eligible.length};

export const PUBLIC_REDESIGN_LIVE_CODE_QUARANTINE = ${JSON.stringify([...liveCode], null, 2)} as const;
`;

fs.writeFileSync(OUT_TS, ts);
console.log(`Synced ${eligible.length} assets to ${PUBLIC_DIR}`);
console.log(`Wrote ${OUT_TS}`);
