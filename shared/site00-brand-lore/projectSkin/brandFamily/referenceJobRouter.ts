/**
 * DesignReferenceJobRouter — route by referencePurpose, not file type.
 */

import type { DesignReferencePurpose, ReferenceJobType, ScreenAuthorityIngestionFailureCode } from './referencePurpose.js';

export type ReferenceJobRoute = {
  pipeline: ReferenceJobType;
  purpose: DesignReferencePurpose;
  failureCode: ScreenAuthorityIngestionFailureCode | null;
};

export function routeReferenceJob(purpose: DesignReferencePurpose | null | undefined): ReferenceJobRoute {
  if (!purpose) {
    return {
      pipeline: 'ASSET_RECONSTRUCTION',
      purpose: 'ASSET_SOURCE',
      failureCode: 'REFERENCE_PURPOSE_MISSING',
    };
  }

  switch (purpose) {
    case 'SCREEN_AUTHORITY':
      return { pipeline: 'SCREEN_AUTHORITY', purpose, failureCode: null };
    case 'ASSET_SOURCE':
      return { pipeline: 'ASSET_RECONSTRUCTION', purpose, failureCode: null };
    case 'PAGE_REFERENCE':
      return { pipeline: 'PAGE_REFERENCE', purpose, failureCode: null };
    case 'INSPIRATION':
    case 'CONTENT_REFERENCE':
      return { pipeline: 'PAGE_REFERENCE', purpose, failureCode: null };
    default:
      return { pipeline: 'ASSET_RECONSTRUCTION', purpose: 'ASSET_SOURCE', failureCode: 'REFERENCE_PURPOSE_MISSING' };
  }
}

export function screenAuthorityMustNotRouteToAssetPipeline(purpose: DesignReferencePurpose): boolean {
  const route = routeReferenceJob(purpose);
  return route.pipeline === 'SCREEN_AUTHORITY' && route.failureCode === null;
}

export function assetSourceRoutesToAssetPipeline(purpose: DesignReferencePurpose): boolean {
  return routeReferenceJob(purpose).pipeline === 'ASSET_RECONSTRUCTION';
}
