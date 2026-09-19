/**
 * WebVisualReferenceAuthority — reference image as canonical visual truth.
 */

import type { NormalizedVisualReference } from '../types.js';
import type { WebsiteVisualWorkflowMode } from '../modes.js';
import type {
  ResolvedWebVisualReferenceAsset,
  ResponsiveAuthorityMode,
  ViewportClass,
  WebVisualReferenceAuthority,
  WebVisualReferenceSourceType,
} from './types.js';
import { VISUAL_AUTHORITY_ORDER } from './constants.js';

export function inferViewportClass(width: number, height: number): ViewportClass {
  const ratio = width / Math.max(height, 1);
  if (width >= 2560) return 'ultrawide';
  if (width >= 1024 && ratio >= 1.2) return 'desktop';
  if (width >= 768 && width < 1024) return 'tablet';
  if (width < 768) return 'mobile';
  return 'unknown';
}

export function createWebVisualReferenceAuthority(input: {
  asset: ResolvedWebVisualReferenceAsset;
  reference: NormalizedVisualReference;
  sourceType: WebVisualReferenceSourceType;
  surfaceType?: string;
  workflowMode?: WebsiteVisualWorkflowMode;
  responsiveMode?: ResponsiveAuthorityMode;
}): WebVisualReferenceAuthority {
  const { asset, reference } = input;
  const viewportClass = inferViewportClass(asset.width, asset.height);
  return {
    referenceAssetId: asset.assetId,
    referenceImageUrl: asset.resolvedUrl,
    surfaceType: input.surfaceType ?? 'founder-workspace',
    viewportClass,
    viewportWidth: asset.width,
    viewportHeight: asset.height,
    aspectRatio: asset.width / Math.max(asset.height, 1),
    deviceClass: reference.detectedDeviceClass,
    authorityStatus: 'REFERENCE_READY',
    sourceType: input.sourceType,
    workflowMode: input.workflowMode ?? 'WEBSITE_RECONSTRUCTION',
    responsiveMode: input.responsiveMode ?? 'REFERENCE_LOCKED',
    createdAt: new Date().toISOString(),
    imageAuthorityPath: asset.resolvedUrl,
  };
}

/** Text description cannot override visible geometry from reference. */
export function textDescriptionOutranksReference(_textWeight: number): boolean {
  return false;
}

export function visualAuthorityOrder(): readonly string[] {
  return VISUAL_AUTHORITY_ORDER;
}

export function buildImageReferenceProviderPayload(authority: WebVisualReferenceAuthority): {
  referenceImageUrl: string;
  imageAuthorityPath: string;
  visionInput: true;
  imageConditioning: true;
  textDescriptionSecondary: true;
} {
  return {
    referenceImageUrl: authority.referenceImageUrl,
    imageAuthorityPath: authority.imageAuthorityPath,
    visionInput: true,
    imageConditioning: true,
    textDescriptionSecondary: true,
  };
}

/** Block unsolicited design improvement during reconstruction mode. */
export function unauthorizedDesignImprovementBlocked(
  workflowMode: WebsiteVisualWorkflowMode,
  requestedChange: 'spacing' | 'nav' | 'grid' | 'typography' | 'hierarchy' | 'other',
): boolean {
  if (workflowMode !== 'WEBSITE_RECONSTRUCTION') return false;
  return ['spacing', 'nav', 'grid', 'typography', 'hierarchy', 'other'].includes(requestedChange);
}
