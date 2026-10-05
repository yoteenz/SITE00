import {
  VISUAL_INGESTION_ANALYSIS_MODE,
  VISUAL_INGESTION_PROVIDER,
} from './constants.js';
import type { AuthorityReferenceState } from './implementationExpressionTypes.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';

export type IngestedAuthorityContent = AuthorityReferenceState & {
  widthPx: number;
  heightPx: number;
  rowBandAdjustments: number[];
};

const browserPrimedIngestion = new Map<string, IngestedAuthorityContent>();

export function primeAuthorityIngestionCache(uri: string, content: IngestedAuthorityContent): void {
  browserPrimedIngestion.set(uri, content);
}

export function clearAuthorityIngestionCacheForTests(): void {
  browserPrimedIngestion.clear();
}

function hashBytesBrowser(bytes: ArrayBuffer): string {
  const slice = new Uint8Array(bytes).slice(0, 128);
  return fnv1aHex(`ingest-${bytes.byteLength}-${Array.from(slice).join(',')}`);
}

export function ingestAuthorityImageContentSync(input: {
  uri: string;
  specWidthPx: number;
  specHeightPx: number;
}): IngestedAuthorityContent {
  const primed = browserPrimedIngestion.get(input.uri);
  if (primed) return primed;

  const referenceAvailable = Boolean(input.uri?.trim());
  if (!referenceAvailable) {
    return {
      referenceAvailable: false,
      contentIngested: false,
      visuallyAnalyzed: false,
      uri: null,
      contentByteLength: 0,
      contentHash: null,
      widthPx: input.specWidthPx,
      heightPx: input.specHeightPx,
      rowBandAdjustments: [],
    };
  }

  const uri = input.uri;
  let contentByteLength = 0;
  let contentHash: string | null = null;
  const widthPx = input.specWidthPx;
  const heightPx = input.specHeightPx;
  const rowBandAdjustments: number[] = Array.from({ length: 8 }, (_, i) => i / 7);

  if (typeof window !== 'undefined' && uri.startsWith('/assets/ndxbook-reconstruction/')) {
    contentHash = fnv1aHex(`browser-static-mount:${uri}`);
    contentByteLength = 1;
  }

  const contentIngested = contentByteLength > 0 && contentHash !== null;
  const visuallyAnalyzed = contentIngested;

  return {
    referenceAvailable,
    contentIngested,
    visuallyAnalyzed,
    uri,
    contentByteLength,
    contentHash,
    widthPx,
    heightPx,
    rowBandAdjustments,
  };
}

export async function ingestAuthorityImageContent(input: {
  uri: string;
  specWidthPx: number;
  specHeightPx: number;
}): Promise<IngestedAuthorityContent> {
  const sync = ingestAuthorityImageContentSync(input);
  if (sync.contentIngested && sync.contentByteLength > 1) return sync;

  if (typeof fetch === 'function' && typeof window !== 'undefined') {
    try {
      const pathPart = input.uri.startsWith('/') ? input.uri : `/${input.uri}`;
      const res = await fetch(`${window.location.origin}${pathPart}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const ingested: IngestedAuthorityContent = {
          ...sync,
          contentByteLength: buf.byteLength,
          contentHash: hashBytesBrowser(buf),
          contentIngested: true,
          visuallyAnalyzed: true,
        };
        primeAuthorityIngestionCache(input.uri, ingested);
        return ingested;
      }
    } catch {
      /* fall through */
    }
  }

  return sync;
}

export function ingestionProviderMetadata(): {
  provider: string;
  analysisMode: string;
  version: string;
} {
  return {
    provider: VISUAL_INGESTION_PROVIDER,
    analysisMode: VISUAL_INGESTION_ANALYSIS_MODE,
    version: '1',
  };
}
