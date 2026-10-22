import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export type CharacterVisualRegistryFile = {
  schemaVersion: string;
  propertySlug: string;
  characters: Array<{
    characterId: string;
    assets: Array<{
      runtimePublicPath: string;
      sha256: string;
      visualApprovalStatus: string;
    }>;
  }>;
};

const DEFAULT_REGISTRY_PATH = path.join(
  process.cwd(),
  'THE_EXCHANGE/MANIFEST/CHARACTER_VISUAL_REGISTRY_V1.json',
);

export function loadCharacterVisualRegistry(registryPath = DEFAULT_REGISTRY_PATH): CharacterVisualRegistryFile {
  return JSON.parse(fs.readFileSync(registryPath, 'utf8')) as CharacterVisualRegistryFile;
}

export function validateCharacterVisualRegistry(registryPath = DEFAULT_REGISTRY_PATH): {
  ok: boolean;
  assetCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const registry = loadCharacterVisualRegistry(registryPath);
  let assetCount = 0;

  for (const character of registry.characters) {
    for (const asset of character.assets) {
      assetCount += 1;
      const publicFile = path.join(process.cwd(), 'public', asset.runtimePublicPath.replace(/^\//, ''));
      if (!fs.existsSync(publicFile)) {
        errors.push(`Missing public asset: ${asset.runtimePublicPath}`);
        continue;
      }
      const hash = crypto.createHash('sha256').update(fs.readFileSync(publicFile)).digest('hex');
      if (hash !== asset.sha256) {
        errors.push(`SHA256 mismatch for ${asset.runtimePublicPath}`);
      }
    }
  }

  if (assetCount !== 6) {
    errors.push(`Expected 6 ingested visual assets, found ${assetCount}`);
  }

  return { ok: errors.length === 0, assetCount, errors };
}
