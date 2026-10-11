import type { CorrespondenceWorkspaceManifest, EmailTemplateVersion } from '../types.js';
import { buildDigitalFoundationWorkspaceManifest } from '../manifests/digital-foundation-lifecycle.js';

/** Import contract for Opus Email V2 editorial benchmark (do not regenerate). */
export const OPUS_V2_BENCHMARK_IMPORT_CONTRACT = {
  sprint: 'P0.SITE00.IDNTY.EMAIL-V2-NDX-EDITORIAL-INTELLIGENCE-BESPOKE-COMPOSITION-AND-THREE-EMAIL-BENCHMARK1',
  branch: 'cursor/df-email-v2-ndx-benchmark-a9f7',
  release_tag: 'df-v2-email-ndx-benchmark-2026-10-11',
  auto_approve: false,
  rollout_remaining_seventeen: 'NOT_AUTHORIZED',
  emails: [
    {
      benchmark_id: 'B01',
      template_id: 'personal-foundation-invitation',
      display_name: 'PERSONAL FOUNDATION INVITATION',
      editorial_register: 'LETTER' as const,
      editorial_intent: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B01_personal-foundation-invitation/EDITORIAL_INTENT.md',
      copy: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B01_personal-foundation-invitation/COPY.md',
      html_source: 'scripts/df-email-v2-benchmark/source/B01_personal-foundation-invitation.html',
      version_id: 'B01@v2-editorial-benchmark',
      initial_review_state: 'founder_review' as const,
    },
    {
      benchmark_id: 'B02',
      template_id: 'foundation-complete',
      display_name: 'FOUNDATION COMPLETE',
      editorial_register: 'RECORD' as const,
      editorial_intent: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B02_foundation-complete/EDITORIAL_INTENT.md',
      copy: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B02_foundation-complete/COPY.md',
      html_source: 'scripts/df-email-v2-benchmark/source/B02_foundation-complete.html',
      version_id: 'B02@v2-editorial-benchmark',
      initial_review_state: 'founder_review' as const,
    },
    {
      benchmark_id: 'B03',
      template_id: 'M06',
      display_name: 'M06 — BLDR INTRODUCTION',
      editorial_register: 'FEATURE' as const,
      editorial_intent: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B03_M06-bldr-introduction/EDITORIAL_INTENT.md',
      copy: 'docs/site00/idnty/visual-authority/email-v2/benchmarks/B03_M06-bldr-introduction/COPY.md',
      html_source: 'scripts/df-email-v2-benchmark/source/B03_M06-bldr-introduction.html',
      version_id: 'B03@v2-editorial-benchmark',
      initial_review_state: 'founder_review' as const,
    },
  ],
};

export type OpusImportOptions = {
  /** When true, overlay V2 benchmark versions onto the workspace manifest. */
  apply: boolean;
};

function benchmarkVersion(
  row: (typeof OPUS_V2_BENCHMARK_IMPORT_CONTRACT.emails)[number],
): EmailTemplateVersion {
  return {
    version_id: row.version_id,
    label: 'V2 EDITORIAL BENCHMARK',
    created_at: '2026-10-11T00:00:00.000Z',
    implementation_scope: 'design_only',
    preview_source: {
      kind: 'repository_html',
      repoPath: row.html_source,
      publicPreviewPath: `/site00-correspondence-studio/previews/${row.benchmark_id}.html`,
    },
    editorial_register: row.editorial_register,
    editorial_intent_ref: row.editorial_intent,
    copy_ref: row.copy,
    asset_provenance_ref: 'docs/site00/idnty/visual-authority/email-v2/ASSET_REUSE_MAP.md',
    review_state: row.initial_review_state,
  };
}

/** Merge Opus benchmark versions into the Digital Foundation workspace (repository-backed). */
export function applyOpusV2BenchmarkImport(options: OpusImportOptions): CorrespondenceWorkspaceManifest {
  const manifest = buildDigitalFoundationWorkspaceManifest();
  if (!options.apply) return manifest;

  for (const row of OPUS_V2_BENCHMARK_IMPORT_CONTRACT.emails) {
    const existing = manifest.templates[row.template_id];
    if (!existing) continue;
    const v = benchmarkVersion(row);
    existing.versions = [...existing.versions.filter((x) => x.version_id !== v.version_id), v];
    existing.current_version_id = v.version_id;
  }
  return manifest;
}

export function listOpusBenchmarkTemplateIds(): string[] {
  return OPUS_V2_BENCHMARK_IMPORT_CONTRACT.emails.map((e) => e.template_id);
}
