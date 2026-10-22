import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export type FounderPackageManifest = {
  package: string;
  property_slug: string;
  documents: Array<{ file: string; sha256: string; status: string; authority?: string }>;
  structured_slate?: string;
  visual_assets?: Array<{ file: string; sha256: string; status: string }>;
};

export type ArchiveValidationIssue = {
  severity: 'ERROR' | 'WARN';
  code: string;
  message: string;
  file?: string;
};

export type ArchiveValidationReport = {
  packageRoot: string;
  fileCount: number;
  expectedFileCount: number;
  issues: ArchiveValidationIssue[];
  sha256Verified: string[];
  sha256Mismatch: Array<{ file: string; expected: string; actual: string }>;
  missingFiles: string[];
  episodeSlate?: {
    episodeCount: number;
    partCount: number;
    partsPerEpisode: number;
  };
  visualAssets?: Array<{ file: string; bytes: number; sha256: string; readable: boolean }>;
  ok: boolean;
};

const REQUIRED_FILES = [
  '00_READ_ME.md',
  '01_SERIES_THESIS.md',
  '02_WORLD_AND_CULTURE.md',
  '03_EXCHANGE_INSTITUTION.md',
  '04_CHARACTER_AND_FAMILY.md',
  '05_HIDDEN_HISTORY_AND_REVELATIONS.md',
  '06_SPECULATIVE_TECHNOLOGY.md',
  '07_SEASON_ONE_AND_THIRTY_PARTS.md',
  '08_STORY_AND_PRODUCTION_METHOD.md',
  '09_COMMERCIAL_STRATEGY.md',
  '10_OPEN_QUESTIONS_AND_OPUS_BRIEF.md',
  'ingestion_manifest.json',
  'episode_slate.json',
  'visual_refs/sloane_lockwood_facial_identity_sheet.jpg',
  'visual_refs/sloane_lockwood_face_lock_editorial_board.jpg',
];

function sha256File(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export function validateFounderPackageArchive(packageRoot: string): ArchiveValidationReport {
  const issues: ArchiveValidationIssue[] = [];
  const sha256Verified: string[] = [];
  const sha256Mismatch: ArchiveValidationReport['sha256Mismatch'] = [];
  const missingFiles: string[] = [];

  for (const rel of REQUIRED_FILES) {
    const full = path.join(packageRoot, rel);
    if (!fs.existsSync(full)) {
      missingFiles.push(rel);
      issues.push({ severity: 'ERROR', code: 'MISSING_FILE', message: `Missing ${rel}`, file: rel });
    }
  }

  let manifest: FounderPackageManifest | null = null;
  const manifestPath = path.join(packageRoot, 'ingestion_manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as FounderPackageManifest;
    } catch {
      issues.push({ severity: 'ERROR', code: 'MANIFEST_PARSE', message: 'ingestion_manifest.json is not valid JSON' });
    }
  }

  if (manifest) {
    for (const doc of manifest.documents ?? []) {
      const full = path.join(packageRoot, doc.file);
      if (!fs.existsSync(full)) continue;
      const actual = sha256File(full);
      if (actual === doc.sha256) {
        sha256Verified.push(doc.file);
      } else {
        sha256Mismatch.push({ file: doc.file, expected: doc.sha256, actual });
        issues.push({
          severity: 'WARN',
          code: 'SHA256_MISMATCH',
          message: `Hash mismatch for ${doc.file} (package may have been updated after manifest)`,
          file: doc.file,
        });
      }
    }
    for (const asset of manifest.visual_assets ?? []) {
      const full = path.join(packageRoot, asset.file);
      if (!fs.existsSync(full)) continue;
      const actual = sha256File(full);
      if (actual === asset.sha256) sha256Verified.push(asset.file);
      else {
        sha256Mismatch.push({ file: asset.file, expected: asset.sha256, actual });
        issues.push({
          severity: 'WARN',
          code: 'SHA256_MISMATCH',
          message: `Hash mismatch for ${asset.file}`,
          file: asset.file,
        });
      }
    }
    if (manifest.property_slug !== 'the-exchange') {
      issues.push({
        severity: 'ERROR',
        code: 'PROPERTY_SLUG',
        message: `Expected property_slug the-exchange, got ${manifest.property_slug}`,
      });
    }
  }

  let episodeSlate: ArchiveValidationReport['episodeSlate'];
  const slatePath = path.join(packageRoot, 'episode_slate.json');
  if (fs.existsSync(slatePath)) {
    try {
      const slate = JSON.parse(fs.readFileSync(slatePath, 'utf8')) as {
        episodes: Array<{ parts: unknown[] }>;
        parts_per_episode?: number;
      };
      const episodeCount = slate.episodes?.length ?? 0;
      let partCount = 0;
      for (const ep of slate.episodes ?? []) partCount += ep.parts?.length ?? 0;
      episodeSlate = {
        episodeCount,
        partCount,
        partsPerEpisode: slate.parts_per_episode ?? 3,
      };
      if (episodeCount !== 10) {
        issues.push({ severity: 'ERROR', code: 'EPISODE_COUNT', message: `Expected 10 episodes, got ${episodeCount}` });
      }
      if (partCount !== 30) {
        issues.push({ severity: 'ERROR', code: 'PART_COUNT', message: `Expected 30 parts, got ${partCount}` });
      }
    } catch {
      issues.push({ severity: 'ERROR', code: 'SLATE_PARSE', message: 'episode_slate.json parse failed' });
    }
  }

  const visualAssets: ArchiveValidationReport['visualAssets'] = [];
  for (const rel of [
    'visual_refs/sloane_lockwood_facial_identity_sheet.jpg',
    'visual_refs/sloane_lockwood_face_lock_editorial_board.jpg',
  ]) {
    const full = path.join(packageRoot, rel);
    if (!fs.existsSync(full)) continue;
    const buf = fs.readFileSync(full);
    visualAssets.push({
      file: rel,
      bytes: buf.length,
      sha256: crypto.createHash('sha256').update(buf).digest('hex'),
      readable: buf.length > 1000,
    });
  }

  const allFiles: string[] = [];
  function walk(dir: string, prefix = ''): void {
    for (const name of fs.readdirSync(dir)) {
      const rel = prefix ? `${prefix}/${name}` : name;
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full, rel);
      else allFiles.push(rel);
    }
  }
  walk(packageRoot);

  const errors = issues.filter((i) => i.severity === 'ERROR');
  return {
    packageRoot,
    fileCount: allFiles.length,
    expectedFileCount: 15,
    issues,
    sha256Verified,
    sha256Mismatch,
    missingFiles,
    episodeSlate,
    visualAssets,
    ok: errors.length === 0 && missingFiles.length === 0,
  };
}
