import { NDXBOOK_MOBILE_ACTUAL_CANONICAL_MOUNT } from '../p0vrTwinV30/mobileTwinPipeline/escalateFounderMobileTwinPackageFromCanonicalAssets.js';
import { NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT } from '../p0vrTwinV30/mobileTwinPipeline/ndxbookLightBlueprintMount.js';

/** Map remote/mock authority URIs to on-disk founder mounts for ingestion (compile-time only). */
export function resolveAuthorityIngestUri(uri: string, kind: 'actual' | 'blueprint'): string {
  const trimmed = uri.trim();
  if (!trimmed) return trimmed;
  const needsMount =
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('vitest-fal://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:');
  if (!needsMount) return trimmed;
  return kind === 'actual' ? NDXBOOK_MOBILE_ACTUAL_CANONICAL_MOUNT : NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT;
}
