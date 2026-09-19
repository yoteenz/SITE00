/**
 * P0.VR.1D.11 — CharacterLabReferenceAssetResolver + visual asset manifest.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { NDX_CHARACTER_LAB_ASSET_PATHS, NDX_CHARACTER_LAB_REFERENCE_PATH } from './constants.js';
import type { CharacterLabAssetSource, CharacterLabVisualAssetEntry, CharacterLabVisualAssetManifest } from './types.js';

function resolveAsset(input: {
  assetRole: CharacterLabVisualAssetEntry['assetRole'];
  storagePath: string;
  referenceCrop: string;
  domFallback?: boolean;
  objectFit?: string;
  objectPosition?: string;
  projectRoot?: string;
}): CharacterLabVisualAssetEntry {
  const root = input.projectRoot ?? process.cwd();
  const publicAbs = join(root, 'public', input.storagePath.replace(/^\//, ''));

  if (existsSync(publicAbs)) {
    return {
      assetRole: input.assetRole,
      source: 'REFERENCE_CROP',
      assetId: input.storagePath,
      storagePath: input.storagePath,
      referenceCrop: input.referenceCrop,
      generationRequired: false,
      provider: 'none',
      status: 'RESOLVED',
      objectFit: input.objectFit ?? 'cover',
      objectPosition: input.objectPosition ?? 'center',
    };
  }

  if (input.domFallback) {
    return {
      assetRole: input.assetRole,
      source: 'DOM_REPRODUCIBLE',
      assetId: null,
      storagePath: null,
      referenceCrop: input.referenceCrop,
      generationRequired: false,
      provider: 'dom',
      status: 'DOM_FALLBACK',
    };
  }

  return {
    assetRole: input.assetRole,
    source: 'FAL_RECONSTRUCTION_REQUIRED',
    assetId: null,
    storagePath: null,
    referenceCrop: input.referenceCrop,
    generationRequired: true,
    provider: 'fal',
    status: 'MISSING',
  };
}

export function resolveCharacterLabReferenceAssets(input: {
  projectRoot?: string;
} = {}): CharacterLabVisualAssetEntry[] {
  return [
    resolveAsset({
      assetRole: 'CHARACTER_PORTRAIT',
      storagePath: NDX_CHARACTER_LAB_ASSET_PATHS.portrait,
      referenceCrop: NDX_CHARACTER_LAB_REFERENCE_PATH,
      objectPosition: 'center 18%',
      projectRoot: input.projectRoot,
    }),
    resolveAsset({
      assetRole: 'LANGUAGE_NOTE_SURFACE',
      storagePath: NDX_CHARACTER_LAB_ASSET_PATHS.languageNoteSurface,
      referenceCrop: NDX_CHARACTER_LAB_REFERENCE_PATH,
      domFallback: true,
      projectRoot: input.projectRoot,
    }),
    resolveAsset({
      assetRole: 'WORKING_DRAFT_STICKY_NOTE',
      storagePath: NDX_CHARACTER_LAB_ASSET_PATHS.stickyNoteSurface,
      referenceCrop: NDX_CHARACTER_LAB_REFERENCE_PATH,
      domFallback: true,
      projectRoot: input.projectRoot,
    }),
    {
      assetRole: 'GREEN_TAPE',
      source: 'DOM_REPRODUCIBLE' as CharacterLabAssetSource,
      assetId: null,
      storagePath: null,
      referenceCrop: NDX_CHARACTER_LAB_REFERENCE_PATH,
      generationRequired: false,
      provider: 'dom',
      status: 'DOM_FALLBACK',
    },
    {
      assetRole: 'PAPER_TEXTURES',
      source: 'DOM_REPRODUCIBLE' as CharacterLabAssetSource,
      assetId: null,
      storagePath: null,
      referenceCrop: NDX_CHARACTER_LAB_REFERENCE_PATH,
      generationRequired: false,
      provider: 'dom',
      status: 'DOM_FALLBACK',
    },
  ];
}

export function buildCharacterLabVisualAssetManifest(input: {
  projectRoot?: string;
} = {}): CharacterLabVisualAssetManifest {
  const entries = resolveCharacterLabReferenceAssets(input);
  return {
    manifestId: randomUUID(),
    screenId: 'MOBILE_CHARACTER_LAB',
    referencePath: NDX_CHARACTER_LAB_REFERENCE_PATH,
    entries,
  };
}

export function existingAssetPreferredOverFalGeneration(manifest: CharacterLabVisualAssetManifest): boolean {
  const rasterRoles = ['CHARACTER_PORTRAIT', 'LANGUAGE_NOTE_SURFACE', 'WORKING_DRAFT_STICKY_NOTE'];
  return manifest.entries
    .filter((e) => rasterRoles.includes(e.assetRole))
    .every((e) => e.source === 'REFERENCE_CROP' || e.source === 'EXISTING_ASSET' || e.source === 'DOM_REPRODUCIBLE');
}

export function falReconstructionCandidates(manifest: CharacterLabVisualAssetManifest): CharacterLabVisualAssetEntry[] {
  return manifest.entries.filter((e) => e.source === 'FAL_RECONSTRUCTION_REQUIRED');
}
