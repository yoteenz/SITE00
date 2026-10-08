import fs from 'node:fs';
import path from 'node:path';
import type { BlockedReason, GenerationRequest } from './types.js';

export const JURNL_REFERENCE_MANIFEST_PATH =
  'JURNL/MANIFEST/REFERENCE_HYGIENE_V1/JURNL_REFERENCE_MANIFEST_V1.json';

type HygieneManifest = {
  ready_for_corrected_generation: boolean;
  superseded_identity_paths: string[];
  do_not_use_paths: string[];
  mediterranean_scene_paths: string[];
  mediterranean_scene_cap: number;
};

export type JurnlReferenceHygieneResult = {
  status: 'PASS' | 'BLOCKED';
  blockedReason: BlockedReason | null;
  failures: string[];
};

function normalize(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
}

function loadManifest(repoRoot: string): HygieneManifest {
  const abs = path.join(repoRoot, JURNL_REFERENCE_MANIFEST_PATH);
  return JSON.parse(fs.readFileSync(abs, 'utf8')) as HygieneManifest;
}

function listed(filePath: string, banned: readonly string[]): boolean {
  const norm = normalize(filePath);
  const base = norm.split('/').pop() ?? norm;
  return banned.some((item) => {
    const bannedNorm = normalize(item);
    const bannedBase = bannedNorm.split('/').pop() ?? bannedNorm;
    return norm === bannedNorm || base === bannedBase;
  });
}

/** Classify an attached JURNL reference set. Generation stays blocked while no clean identity file exists. */
export function auditJurnlReferenceAttachment(
  repoRoot: string,
  paths: readonly string[],
): JurnlReferenceHygieneResult {
  const manifest = loadManifest(repoRoot);
  const failures: string[] = [];
  const superseded = paths.filter((filePath) =>
    listed(filePath, [...manifest.superseded_identity_paths, ...manifest.do_not_use_paths]),
  );
  if (superseded.length) {
    failures.push(`superseded identity reference attached: ${superseded.map(normalize).join(', ')}`);
    return { status: 'BLOCKED', blockedReason: 'SUPERSEDED_IDENTITY_REFERENCE', failures };
  }
  const scenes = paths.filter((filePath) => listed(filePath, manifest.mediterranean_scene_paths));
  if (scenes.length > manifest.mediterranean_scene_cap) {
    failures.push(
      `mediterranean scene references ${scenes.length} exceed cap ${manifest.mediterranean_scene_cap}: ${scenes.map(normalize).join(', ')}`,
    );
    return { status: 'BLOCKED', blockedReason: 'REFERENCE_HYGIENE_FAILED', failures };
  }
  if (!manifest.ready_for_corrected_generation) {
    failures.push('clean reusable decorative identity asset is not registered');
    return { status: 'BLOCKED', blockedReason: 'REFERENCE_HYGIENE_FAILED', failures };
  }
  return { status: 'PASS', blockedReason: null, failures };
}

export function validateJurnlReferenceHygiene(
  request: Pick<GenerationRequest, 'projectId' | 'attachedReferencePaths'>,
  repoRoot: string,
): JurnlReferenceHygieneResult {
  if (request.projectId.toUpperCase() !== 'JURNL') return { status: 'PASS', blockedReason: null, failures: [] };
  if (!request.attachedReferencePaths) return { status: 'PASS', blockedReason: null, failures: [] };
  return auditJurnlReferenceAttachment(repoRoot, request.attachedReferencePaths);
}
