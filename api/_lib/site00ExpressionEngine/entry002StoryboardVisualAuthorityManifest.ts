/**
 * Sprint B4.9R4 — Resolve five founder-approved authority images for provider reference binding.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  Entry002StoryboardVisualAuthorityManifest,
  Entry002StoryboardVisualAuthorityManifestEntry,
  VisualAuthorityReferenceRole,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { buildEntry002PreStoryboardPublicAssetPath } from './entry002PreStoryboardAuthorityAssets.js';
import {
  ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
  ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
} from './entry002PreStoryboardFounderApproval.js';

const REQUIRED_AUTHORITY_IMAGE_COUNT = 5 as const;

const REFERENCE_ROLES: VisualAuthorityReferenceRole[] = [
  'NDX_IDENTITY_PRESENCE',
  'SUBJECT_WOMAN_IDENTITY',
  'NDX_HANDS_LIME_NAILS_INTERACTIONS',
  'SUBJECT_WARDROBE_FASHION_CONTINUITY',
  'PHONE_PROFILE_CULTURAL_GLITCH',
];

function resolveCanonicalSiteOrigin(): string {
  const origin =
    process.env.SITE00_CANONICAL_ORIGIN?.trim() ||
    process.env.VITE_SITE00_CANONICAL_ORIGIN?.trim() ||
    'https://site00.com';
  return origin.replace(/\/$/, '');
}

export function resolveEntry002AuthorityImageUrlForProvider(publicAssetPath: string): string {
  const normalized = publicAssetPath.startsWith('/') ? publicAssetPath : `/${publicAssetPath}`;
  return `${resolveCanonicalSiteOrigin()}${normalized}`;
}

function publicPathToDisk(publicPath: string): string {
  return path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
}

async function isAssetReadable(publicAssetPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(publicPathToDisk(publicAssetPath));
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

export async function compileEntry002StoryboardVisualAuthorityManifest(): Promise<Entry002StoryboardVisualAuthorityManifest> {
  const entries: Entry002StoryboardVisualAuthorityManifestEntry[] = [];
  const blockers: string[] = [];

  for (let i = 0; i < ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS.length; i++) {
    const approval = ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS[i]!;
    const referenceRole = REFERENCE_ROLES[i]!;
    const publicAssetPath = buildEntry002PreStoryboardPublicAssetPath(approval.boardNumber);
    const diskPath = publicPathToDisk(publicAssetPath);
    const readable = await isAssetReadable(publicAssetPath);

    if (approval.founderJudgment !== 'LOVE_IT') {
      blockers.push(`${approval.authorityId}: founderJudgment !== LOVE_IT`);
    }
    if (!approval.visualAuthority) {
      blockers.push(`${approval.authorityId}: visualAuthority !== true`);
    }
    if (approval.version !== ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION) {
      blockers.push(`${approval.authorityId}: stale version ${approval.version}`);
    }
    if (!readable) {
      blockers.push(`${approval.authorityId}: asset not readable at ${diskPath}`);
    }

    entries.push({
      authorityId: approval.authorityId,
      assetId: approval.authorityId,
      assetPath: diskPath,
      publicAssetPath,
      providerReferenceUrl: resolveEntry002AuthorityImageUrlForProvider(publicAssetPath),
      version: approval.version,
      founderJudgment: 'LOVE_IT',
      visualAuthority: true,
      referenceRole,
      referencePriority: approval.boardNumber,
      assetReadable: readable,
    });
  }

  const resolvedAuthorityImageCount = entries.filter((e) => e.assetReadable).length;
  const validated =
    blockers.length === 0 &&
    entries.length === REQUIRED_AUTHORITY_IMAGE_COUNT &&
    resolvedAuthorityImageCount === REQUIRED_AUTHORITY_IMAGE_COUNT;

  return {
    entries,
    requiredAuthorityImageCount: REQUIRED_AUTHORITY_IMAGE_COUNT,
    resolvedAuthorityImageCount,
    validated,
    bindingFailureReason: validated ? null : blockers.join('; ') || 'AUTHORITY_IMAGE_BINDING_INCOMPLETE',
  };
}

export function assertVisualAuthorityManifestFailClosed(
  manifest: Entry002StoryboardVisualAuthorityManifest,
): void {
  if (!manifest.validated) {
    throw new Error(
      manifest.bindingFailureReason ?? 'Visual authority manifest validation failed — fail closed',
    );
  }
}

export function extractProviderReferenceUrlsFromManifest(
  manifest: Entry002StoryboardVisualAuthorityManifest,
): string[] {
  return manifest.entries
    .filter((e) => e.assetReadable)
    .sort((a, b) => a.referencePriority - b.referencePriority)
    .map((e) => e.providerReferenceUrl);
}

export function extractAuthorityImageIdsSentToProvider(
  manifest: Entry002StoryboardVisualAuthorityManifest,
): string[] {
  return manifest.entries
    .filter((e) => e.assetReadable)
    .sort((a, b) => a.referencePriority - b.referencePriority)
    .map((e) => e.authorityId);
}

export function isDeterministicStoryboardProvider(provider: string): boolean {
  const normalized = provider.toLowerCase();
  return (
    normalized.startsWith('deterministic') ||
    normalized.startsWith('local') ||
    normalized.startsWith('mock') ||
    normalized.startsWith('fixture') ||
    normalized.startsWith('test') ||
    normalized === 'none' ||
    normalized === 'sharp-format-convert-v1'
  );
}

export function isRealProviderStoryboardDispatch(provider: string, dispatched: boolean): boolean {
  return dispatched && !isDeterministicStoryboardProvider(provider);
}
