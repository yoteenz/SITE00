import { readFileSync } from 'node:fs';
import { forensicBlueprintCacheKey } from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import type { ForensicUiBlueprintAuthority } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import { TWIN_V42_GOLDEN_AUTHORITY_KEY } from './constants.js';
import { sealTwinV4GoldenAuthority } from './twinV4GoldenAuthority.js';
import type { TwinV4GoldenAuthority } from './twinV42Types.js';

const FORENSIC_STORAGE_PREFIX = 'site00:forensic-blueprint-cache:v1:';

export function buildTwinV42PlaywrightLocalStorageSeed(input: {
  actualHash: string;
  forensicAuthority: ForensicUiBlueprintAuthority;
  goldenAuthority: TwinV4GoldenAuthority;
}): Record<string, string> {
  const cacheKey = forensicBlueprintCacheKey({ actualHash: input.actualHash });
  return {
    [`${FORENSIC_STORAGE_PREFIX}${cacheKey}`]: JSON.stringify(input.forensicAuthority),
    [TWIN_V42_GOLDEN_AUTHORITY_KEY]: JSON.stringify(input.goldenAuthority),
    isSignedIn: 'true',
  };
}

export async function buildTwinV42FixturePlaywrightSeed(input: {
  actualHash: string;
  fixtureHttpUrl: string;
  fixturePath: string;
  forensicAuthority: ForensicUiBlueprintAuthority;
}): Promise<{ localStorageSeed: Record<string, string>; goldenAuthority: TwinV4GoldenAuthority }> {
  const bytes = new Uint8Array(readFileSync(input.fixturePath));
  const goldenAuthority = await sealTwinV4GoldenAuthority({
    artifactId: input.forensicAuthority.id,
    artifactUrl: input.fixtureHttpUrl,
    bytes,
  });
  return {
    goldenAuthority,
    localStorageSeed: buildTwinV42PlaywrightLocalStorageSeed({
      actualHash: input.actualHash,
      forensicAuthority: {
        ...input.forensicAuthority,
        blueprintImageUri: input.fixtureHttpUrl,
      },
      goldenAuthority,
    }),
  };
}
