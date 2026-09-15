import type { TwinV41PixelExtractionBundle } from '../p0vrTwinV41/twinV41Types.js';
import { compileTwinV41PixelExtraction } from '../p0vrTwinV41/compileTwinV41PixelExtraction.js';
import { resolveTwinV41BootContext } from '../p0vrTwinV41/resolveTwinV41BootContext.js';
import { primeTwinV41ForensicFromDesignSession } from '../p0vrTwinV41/primeTwinV41ForensicFromDesignSession.js';
import {
  forensicBlueprintCacheKey,
  readForensicBlueprintFromCache,
} from '../p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { site00IsBrowser } from '../../runtime/site00RuntimeEnv.js';
import {
  P0_VR_TWIN_V41F1_LINEAGE,
  P0_VR_TWIN_V42_LINEAGE,
  TWIN_V4_GOLDEN_AUTHORITY_INVALID,
  TWIN_V42_PLAYWRIGHT_DEVICE_SCALE,
} from './constants.js';
import { twinV42SegmentationCacheKey } from './segmentationCacheKey.js';
import { purgeStaleTwinV4AuthorityReferences } from './twinV4AuthorityPurge.js';
import {
  fetchGoldenAuthorityBytes,
  readPinnedTwinV4GoldenAuthority,
  resolveTwinV4GoldenAuthority,
  validateTwinV4GoldenAuthority,
} from './twinV4GoldenAuthority.js';
import { auditTwinV4LiveDomForRasterCheat } from './twinV4RasterCheatFirewall.js';
import type {
  TwinV4CanonicalViewport,
  TwinV42GoldenDiffBundle,
  TwinV4GoldenAuthority,
} from './twinV42Types.js';
import { readTwinV42GoldenDiffBundle, writeTwinV42GoldenDiffBundle } from './twinV42Persistence.js';
import { sha256Hex } from './sha256Hex.js';

const memorySegmentationCache = new Map<string, TwinV41PixelExtractionBundle>();

export type TwinV42PageBootResult = {
  lineage: string;
  goldenAuthority: TwinV4GoldenAuthority;
  canonicalViewport: TwinV4CanonicalViewport;
  purgeReceipt: ReturnType<typeof purgeStaleTwinV4AuthorityReferences>;
  pixelBundle: TwinV41PixelExtractionBundle;
  diffBundle: TwinV42GoldenDiffBundle | null;
  fallbackAuthorityAllowed: false;
};

async function goldenBytesMatchPin(pin: TwinV4GoldenAuthority): Promise<void> {
  const { bytes } = await fetchGoldenAuthorityBytes(pin.artifactUrl);
  const hash = await sha256Hex(bytes);
  if (hash !== pin.sha256) throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
}

async function resolveSourceActualHash(projectId: string, queryActualHash: string | null): Promise<string> {
  const boot = resolveTwinV41BootContext({ projectId, queryActualHash });
  if (boot.sourceActualHash) return boot.sourceActualHash;
  const primed = await primeTwinV41ForensicFromDesignSession(projectId);
  if (primed.ok) return primed.sourceActualHash;
  throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
}

export async function compileTwinV42PageBoot(input: {
  projectId: string;
  queryActualHash?: string | null;
  allowSeal?: boolean;
}): Promise<TwinV42PageBootResult> {
  const allowSeal = input.allowSeal ?? site00IsBrowser();
  let golden: TwinV4GoldenAuthority;

  const pinned = readPinnedTwinV4GoldenAuthority();
  if (pinned) {
    golden = await validateTwinV4GoldenAuthority(pinned);
  } else {
    const sourceActualHash = await resolveSourceActualHash(input.projectId, input.queryActualHash ?? null);
    const authority = readForensicBlueprintFromCache(
      forensicBlueprintCacheKey({ actualHash: sourceActualHash }),
    );
    if (!authority) throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
    golden = await resolveTwinV4GoldenAuthority({
      allowSeal,
      candidate: { artifactId: authority.id, artifactUrl: authority.blueprintImageUri },
    });
  }

  await goldenBytesMatchPin(golden);
  const purgeReceipt = purgeStaleTwinV4AuthorityReferences(golden);

  const viewport: TwinV4CanonicalViewport = {
    width: golden.width,
    height: golden.height,
    deviceScaleFactor: TWIN_V42_PLAYWRIGHT_DEVICE_SCALE,
    source: 'GOLDEN_AUTHORITY',
  };

  const segKey = twinV42SegmentationCacheKey(golden.sha256);
  let pixelBundle: TwinV41PixelExtractionBundle;
  const memCached = memorySegmentationCache.get(segKey);
  if (memCached) {
    pixelBundle = memCached;
  } else if (typeof localStorage !== 'undefined') {
    const cachedSeg = localStorage.getItem(segKey);
    if (cachedSeg) {
      try {
        pixelBundle = JSON.parse(cachedSeg) as TwinV41PixelExtractionBundle;
        memorySegmentationCache.set(segKey, pixelBundle);
      } catch {
        pixelBundle = await compileTwinV41AfterGolden(input, golden, segKey);
      }
    } else {
      pixelBundle = await compileTwinV41AfterGolden(input, golden, segKey);
    }
  } else {
    pixelBundle = await compileTwinV41AfterGolden(input, golden, segKey);
  }

  const rasterFirewall = auditTwinV4LiveDomForRasterCheat({
    liveHtml: '',
    goldenUrl: golden.artifactUrl,
  });

  const existingDiff = readTwinV42GoldenDiffBundle();
  const diffBundle: TwinV42GoldenDiffBundle | null =
    existingDiff?.goldenAuthority.sha256 === golden.sha256 ? existingDiff : null;

  if (!diffBundle) {
    const stubGate = {
      status: 'BLOCKED' as const,
      fullPagePass: false,
      criticalRegionPass: false,
      rasterCheatViolations: rasterFirewall.runtimeRasterUsage,
    };
    writeTwinV42GoldenDiffBundle({
      lineage: P0_VR_TWIN_V42_LINEAGE,
      goldenAuthority: golden,
      canonicalViewport: viewport,
      purgeReceipt,
      iterations: [],
      fontStability: { documentFontsReady: false, fallbackFontsDetected: false },
      assetStability: { imagesLoaded: 0, imagesPending: 0, placeholderImages: 0 },
      rasterFirewall,
      gate: stubGate,
      reconstructionEngineProof: 'INCONCLUSIVE',
      proofBlockedReason: 'PLAYWRIGHT_GOLDEN_DIFF_NOT_RUN',
    });
  }

  return {
    lineage: `${P0_VR_TWIN_V41F1_LINEAGE}+${P0_VR_TWIN_V42_LINEAGE}`,
    goldenAuthority: golden,
    canonicalViewport: viewport,
    purgeReceipt,
    pixelBundle,
    diffBundle: readTwinV42GoldenDiffBundle(),
    fallbackAuthorityAllowed: false,
  };
}

export function clearTwinV42SegmentationCacheForTests(): void {
  memorySegmentationCache.clear();
}

async function compileTwinV41AfterGolden(
  input: { projectId: string; queryActualHash?: string | null },
  golden: TwinV4GoldenAuthority,
  segKey: string,
): Promise<TwinV41PixelExtractionBundle> {
  const sourceActualHash = await resolveSourceActualHash(input.projectId, input.queryActualHash ?? null);
  const bundle = await compileTwinV41PixelExtraction({ projectId: input.projectId, sourceActualHash });
  const { bytes } = await fetchGoldenAuthorityBytes(golden.artifactUrl);
  const imageHash = await sha256Hex(bytes);
  if (imageHash !== golden.sha256) {
    throw new Error(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
  }
  memorySegmentationCache.set(segKey, bundle);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(segKey, JSON.stringify(bundle));
  }
  return bundle;
}

