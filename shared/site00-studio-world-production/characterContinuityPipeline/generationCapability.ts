/**
 * P0.5E.5 — FAL character generation capability registry + schema discovery.
 */

import { randomUUID } from 'node:crypto';
import {
  SITE00_FAL_REFERENCE_EDIT_MODEL,
  SITE00_FAL_TEXT_TO_IMAGE_MODEL,
} from '../../site00-visual-generation/falImageModels.js';
import type { CharacterGenerationCapability, SchemaSupportState } from './types.js';

/** Representative capability classes — not permanent authority */
export const REPRESENTATIVE_FAL_ENDPOINTS = {
  TEXT_TO_IMAGE: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
  IMAGE_TO_IMAGE: SITE00_FAL_REFERENCE_EDIT_MODEL,
  REFERENCE_TO_VIDEO: 'fal-ai/kling-video/v1.6/standard/reference-to-video',
  IMAGE_TO_VIDEO: 'fal-ai/kling-video/v1.6/standard/image-to-video',
  MULTI_REFERENCE: SITE00_FAL_REFERENCE_EDIT_MODEL,
} as const;

export function buildGptImage2TextCapability(): CharacterGenerationCapability {
  return {
    capabilityId: randomUUID(),
    provider: 'fal',
    endpoint: SITE00_FAL_TEXT_TO_IMAGE_MODEL,
    schemaVersion: 'gpt-image-2@2026',
    schemaSupportState: 'SUPPORTED_VERIFIED',
    schemaRetrievedAt: new Date().toISOString(),
    supportsTextToImage: true,
    supportsImageToImage: false,
    supportsReferenceImages: false,
    supportsMultipleReferences: false,
    supportsFaceReference: false,
    supportsIdentityBinding: false,
    supportsElements: false,
    supportsReferenceToVideo: false,
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    supportsStartFrame: false,
    supportsEndFrame: false,
    supportsAudio: false,
    supportsLipSync: false,
    supportsVoiceReference: false,
    supportsNegativePrompt: false,
    supportsSeed: false,
    supportsLoRA: false,
    supportsCharacterTraining: false,
    supportsResolutionControl: true,
    supportsDurationControl: false,
    supportsAspectRatio: true,
    supportsCameraInstruction: false,
    maxReferenceCount: 0,
  };
}

export function buildGptImage2EditCapability(): CharacterGenerationCapability {
  return {
    ...buildGptImage2TextCapability(),
    capabilityId: randomUUID(),
    endpoint: SITE00_FAL_REFERENCE_EDIT_MODEL,
    supportsImageToImage: true,
    supportsReferenceImages: true,
    supportsMultipleReferences: true,
    supportsFaceReference: true,
    maxReferenceCount: 8,
  };
}

export function buildReferenceToVideoCapability(): CharacterGenerationCapability {
  return {
    capabilityId: randomUUID(),
    provider: 'fal',
    endpoint: REPRESENTATIVE_FAL_ENDPOINTS.REFERENCE_TO_VIDEO,
    schemaVersion: 'schema-review-required',
    schemaSupportState: 'SCHEMA_REVIEW_REQUIRED',
    schemaRetrievedAt: null,
    supportsTextToImage: false,
    supportsImageToImage: false,
    supportsReferenceImages: true,
    supportsMultipleReferences: true,
    supportsFaceReference: true,
    supportsIdentityBinding: false,
    supportsElements: false,
    supportsReferenceToVideo: true,
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    supportsStartFrame: false,
    supportsEndFrame: false,
    supportsAudio: false,
    supportsLipSync: false,
    supportsVoiceReference: false,
    supportsNegativePrompt: true,
    supportsSeed: true,
    supportsLoRA: false,
    supportsCharacterTraining: false,
    supportsResolutionControl: true,
    supportsDurationControl: true,
    supportsAspectRatio: true,
    supportsCameraInstruction: true,
    maxReferenceCount: 4,
  };
}

export function buildImageToVideoCapability(): CharacterGenerationCapability {
  const base = buildReferenceToVideoCapability();
  return {
    ...base,
    capabilityId: randomUUID(),
    endpoint: REPRESENTATIVE_FAL_ENDPOINTS.IMAGE_TO_VIDEO,
    supportsReferenceToVideo: false,
    supportsImageToVideo: true,
    supportsStartFrame: true,
  };
}

export function buildDefaultCharacterCapabilityRegistry(): CharacterGenerationCapability[] {
  return [
    buildGptImage2TextCapability(),
    buildGptImage2EditCapability(),
    buildReferenceToVideoCapability(),
    buildImageToVideoCapability(),
  ];
}

export function resolveSchemaSupportState(state: SchemaSupportState): boolean {
  return state === 'SUPPORTED_VERIFIED' || state === 'SUPPORTED_PARTIAL';
}

export function capabilityFromVerifiedSchemaOnly(cap: CharacterGenerationCapability): boolean {
  return cap.schemaSupportState !== 'UNSUPPORTED' && cap.schemaSupportState !== 'UNAVAILABLE';
}
