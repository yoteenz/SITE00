import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { primeAuthorityIngestionCache } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R1/authorityContentIngestion.js';
import { NDXBOOK_MOBILE_ACTUAL_CANONICAL_MOUNT } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/ndxbookLightBlueprintMount.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';

function primeUri(uri: string): void {
  const rel = uri.replace(/^\//, '');
  const abs = `${process.cwd()}/public/${rel}`;
  if (!existsSync(abs)) return;
  const bytes = readFileSync(abs);
  const contentHash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
  primeAuthorityIngestionCache(uri, {
    referenceAvailable: true,
    contentIngested: true,
    visuallyAnalyzed: true,
    uri,
    contentByteLength: bytes.length,
    contentHash,
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    rowBandAdjustments: Array.from({ length: 8 }, (_, i) => i / 7),
  });
}

primeUri(NDXBOOK_MOBILE_ACTUAL_CANONICAL_MOUNT);
primeUri(NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT);
