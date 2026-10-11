import type { CorrespondenceWorkspaceManifest, EmailTemplateVersion } from '../types.js';

const R3_DOCS = 'docs/site00/idnty/visual-authority/email-v2/r3';
const R3_PREVIEWS = '/site00-correspondence-studio/previews/r3';
const R2_PREVIEWS = '/site00-correspondence-studio/previews/r2';

/**
 * Email V2 R3 editorial publishing compositions. Appended after the V2 benchmark versions (never replacing
 * them) with the nine R2 territories registered alongside for comparison. Agent selection is not approval:
 * every version enters at founder_review.
 */
export const R3_EDITORIAL_IMPORT_CONTRACT = {
  sprint: 'P0.SITE00.IDNTY.EMAIL-V2-R3-EDITORIAL-PUBLISHING-BESPOKE-GRAPHIC-INTELLIGENCE-AND-TYPOGRAPHIC-AUTHORITY1',
  branch: 'cursor/df-email-v2-r3-editorial-a9f7',
  auto_approve: false,
  rollout_remaining_seventeen: 'NOT_AUTHORIZED',
  typography: `${R3_DOCS}/TYPOGRAPHIC_AUTHORITY.md`,
  asset_manifest: `${R3_DOCS}/GRAPHIC_ASSET_MANIFEST.json`,
  emails: [
    {
      benchmark_id: 'B01',
      copy_authority: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B01_personal-foundation-invitation/COPY.md',
      template_id: 'personal-foundation-invitation',
      editorial_register: 'LETTER' as const,
      r3_title: 'THE INVITATION',
      r2_territories: [
        ['A', 'A PRIVATE CORRESPONDENCE'],
        ['B', 'ARCHITECTURAL OPENING'],
        ['C', 'PERSONAL EDITORIAL'],
      ],
    },
    {
      benchmark_id: 'B02',
      copy_authority: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B02_foundation-complete/COPY.md',
      template_id: 'foundation-complete',
      editorial_register: 'RECORD' as const,
      r3_title: 'THE RECORD',
      r2_territories: [
        ['A', 'MONUMENT ESTABLISHED'],
        ['B', 'ARCHITECTURAL RECORD'],
        ['C', 'MILESTONE REVEAL'],
      ],
    },
    {
      benchmark_id: 'B03',
      copy_authority: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B03_M06-bldr-introduction/COPY.md',
      template_id: 'M06',
      editorial_register: 'FEATURE' as const,
      r3_title: 'THE ISSUE',
      r2_territories: [
        ['A', 'ARCHITECTURAL MANIFESTO'],
        ['B', 'ENTER THE LOCATION'],
        ['C', 'THE UNBUILT POSSIBILITY'],
      ],
    },
  ],
};

type R3Row = (typeof R3_EDITORIAL_IMPORT_CONTRACT.emails)[number];

export function r3VersionId(benchmarkId: string): string {
  return `${benchmarkId}@r3-editorial`;
}

export function r2VersionId(benchmarkId: string, territory: string): string {
  return `${benchmarkId}@r2-territory-${territory.toLowerCase()}`;
}

function r2Versions(row: R3Row): EmailTemplateVersion[] {
  return row.r2_territories.map(([letter, title]) => ({
    version_id: r2VersionId(row.benchmark_id, letter),
    label: `R2 TERRITORY ${letter} · ${title}`,
    created_at: '2026-10-11T00:00:00.000Z',
    implementation_scope: 'design_only',
    preview_source: {
      kind: 'repository_html',
      repoPath: `scripts/df-email-v2-benchmark/r2/territories/${row.benchmark_id}_${letter}.html`,
      publicPreviewPath: `${R2_PREVIEWS}/${row.benchmark_id}_${letter}.html`,
    },
    editorial_register: row.editorial_register,
    editorial_intent_ref: 'scripts/df-email-v2-benchmark/r2/territories.json',
    copy_ref: row.copy_authority,
    asset_provenance_ref: 'scripts/df-email-v2-benchmark/r2/territories.json',
    review_state: 'founder_review',
  }));
}

function r3Version(row: R3Row): EmailTemplateVersion {
  return {
    version_id: r3VersionId(row.benchmark_id),
    label: `R3 EDITORIAL · ${row.r3_title}`,
    created_at: '2026-10-11T12:00:00.000Z',
    implementation_scope: 'responsive_html',
    preview_source: {
      kind: 'repository_html',
      repoPath: `scripts/df-email-v2-benchmark/r3/emails/${row.benchmark_id}_R3.html`,
      publicPreviewPath: `${R3_PREVIEWS}/${row.benchmark_id}_R3.html`,
    },
    editorial_register: row.editorial_register,
    editorial_intent_ref: `${R3_DOCS}/ART_DIRECTION_R3.md#${row.benchmark_id.toLowerCase()}`,
    copy_ref: `${R3_DOCS}/${row.benchmark_id}_COPY_R3.md`,
    asset_provenance_ref: `${R3_DOCS}/GRAPHIC_ASSET_MANIFEST.json`,
    review_state: 'founder_review',
  };
}

/** Append R2 comparison and R3 versions to an existing manifest; R3 becomes the current version. */
export function applyR3EditorialImport(manifest: CorrespondenceWorkspaceManifest): CorrespondenceWorkspaceManifest {
  for (const row of R3_EDITORIAL_IMPORT_CONTRACT.emails) {
    const entry = manifest.templates[row.template_id];
    if (!entry) continue;
    const added = [...r2Versions(row), r3Version(row)];
    const ids = new Set(added.map((v) => v.version_id));
    entry.versions = [...entry.versions.filter((v) => !ids.has(v.version_id)), ...added];
    entry.current_version_id = r3VersionId(row.benchmark_id);
  }
  return manifest;
}

export function listR3TemplateIds(): string[] {
  return R3_EDITORIAL_IMPORT_CONTRACT.emails.map((e) => e.template_id);
}
