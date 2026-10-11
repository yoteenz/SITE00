import registry from '../../docs/site00/idnty/visual-authority/email-pack/DF_V2_COMPLETE_EMAIL_TEMPLATE_REGISTRY.json';
import { OPUS_V2_BENCHMARK_IMPORT_CONTRACT } from './import/opusV2BenchmarkImport.js';
import type { CorrespondenceWorkspaceManifest, EmailTemplateVersion, ReviewState } from './types.js';

export type LibraryClassification = CorrespondenceWorkspaceManifest['templates'][string]['classification'];

export type LibraryRow = {
  template_id: string;
  display_name: string;
  project_id: string;
  campaign_id: string;
  brand_authority_id: string;
  classification: LibraryClassification;
  /** Benchmark id (B01…) when the current version is an imported editorial composition, else registry alias, else sequence. */
  code: string;
  sequence: number;
  version_count: number;
  current_version: EmailTemplateVersion;
  composed: boolean;
};

export type CopyContract = {
  subject: string | null;
  preheader: string | null;
  primary_cta: string | null;
  body_outline: string[];
  trigger_event: string | null;
};

type RegistryTemplate = {
  template_id: string;
  manifest_alias: string | null;
  trigger_event?: string | null;
  copy_contract?: {
    subject?: string | null;
    preheader?: string | null;
    primary_cta?: string | null;
    body_outline?: string[] | null;
  };
};

const REGISTRY_BY_ID = new Map<string, RegistryTemplate>(
  (registry as { templates: RegistryTemplate[] }).templates.map((t) => [t.template_id, t]),
);

const BENCHMARK_BY_VERSION = new Map<string, string>(
  OPUS_V2_BENCHMARK_IMPORT_CONTRACT.emails.map((e) => [e.version_id, e.benchmark_id]),
);

export function benchmarkIdForVersion(versionId: string): string | null {
  return BENCHMARK_BY_VERSION.get(versionId) ?? null;
}

/** Registry copy contract for a template — read-only canonical copy, never edited from the studio. */
export function copyContractFor(templateId: string): CopyContract | null {
  const hit = REGISTRY_BY_ID.get(templateId);
  if (!hit) return null;
  const c = hit.copy_contract ?? {};
  return {
    subject: c.subject ?? null,
    preheader: c.preheader ?? null,
    primary_cta: c.primary_cta ?? null,
    body_outline: c.body_outline ?? [],
    trigger_event: hit.trigger_event ?? null,
  };
}

export function versionIsComposed(version: EmailTemplateVersion): boolean {
  return version.preview_source.kind === 'repository_html' && Boolean(version.preview_source.publicPreviewPath);
}

export function resolveVersion(
  entry: CorrespondenceWorkspaceManifest['templates'][string],
  versionId?: string | null,
): EmailTemplateVersion {
  return (
    (versionId ? entry.versions.find((v) => v.version_id === versionId) : undefined) ??
    entry.versions.find((v) => v.version_id === entry.current_version_id) ??
    entry.versions[0]
  );
}

export function listLibraryRows(
  manifest: CorrespondenceWorkspaceManifest,
  scope: { brandAuthorityId: string; campaignId?: string | null },
): LibraryRow[] {
  const rows: LibraryRow[] = [];
  for (const project of manifest.projects) {
    for (const campaign of project.campaigns) {
      if (campaign.brand_authority_id !== scope.brandAuthorityId) continue;
      if (scope.campaignId && campaign.campaign_id !== scope.campaignId) continue;
      const sequence =
        campaign.template_sequence ?? campaign.email_families.flatMap((f) => f.template_ids);
      sequence.forEach((templateId, index) => {
        const entry = manifest.templates[templateId];
        if (!entry) return;
        const current = resolveVersion(entry);
        const alias = REGISTRY_BY_ID.get(templateId)?.manifest_alias ?? null;
        rows.push({
          template_id: templateId,
          display_name: entry.display_name,
          project_id: project.project_id,
          campaign_id: campaign.campaign_id,
          brand_authority_id: campaign.brand_authority_id,
          classification: entry.classification,
          code: benchmarkIdForVersion(current.version_id) ?? alias ?? String(index + 1).padStart(2, '0'),
          sequence: index + 1,
          version_count: entry.versions.length,
          current_version: current,
          composed: entry.versions.some(versionIsComposed),
        });
      });
    }
  }
  return rows;
}

export type LibraryFilter = {
  classification: LibraryClassification | 'all';
  query: string;
  /** When set, only rows whose current-version review state is in this list. */
  reviewStates?: ReviewState[] | null;
};

export function filterLibraryRows(
  rows: LibraryRow[],
  filter: LibraryFilter,
  reviewStateOf: (row: LibraryRow) => ReviewState,
): LibraryRow[] {
  const q = filter.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter.classification !== 'all' && row.classification !== filter.classification) return false;
    if (filter.reviewStates && !filter.reviewStates.includes(reviewStateOf(row))) return false;
    if (!q) return true;
    const contract = copyContractFor(row.template_id);
    const haystack = [
      row.display_name,
      row.template_id,
      row.code,
      row.classification,
      row.current_version.label,
      row.current_version.editorial_register ?? '',
      reviewStateOf(row).replace(/_/g, ' '),
      contract?.subject ?? '',
      contract?.preheader ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function countByClassification(rows: LibraryRow[]): Record<LibraryClassification | 'all', number> {
  const out: Record<LibraryClassification | 'all', number> = { all: rows.length, transactional: 0, operational: 0, marketing: 0 };
  for (const r of rows) out[r.classification] += 1;
  return out;
}

export function reviewStateLabel(state: ReviewState): string {
  return state.replace(/_/g, ' ').toUpperCase();
}

/** A top-level node of a composed email, reduced to what the inspector needs. */
export type EmailBlockDescriptor = {
  tag: string;
  className: string;
  text: string;
  imageSrc: string | null;
  hasHeading1: boolean;
  hasHeading2: boolean;
};

export type EmailBlockKind =
  | 'header'
  | 'hero'
  | 'headline'
  | 'main_copy'
  | 'feature'
  | 'divider'
  | 'image'
  | 'primary_cta'
  | 'close'
  | 'footer'
  | 'section';

const BLOCK_LABELS: Record<EmailBlockKind, string> = {
  header: 'HEADER',
  hero: 'HERO',
  headline: 'HEADLINE',
  main_copy: 'MAIN COPY',
  feature: 'FEATURE',
  divider: 'DIVIDER',
  image: 'IMAGE',
  primary_cta: 'PRIMARY CTA',
  close: 'CLOSE',
  footer: 'FOOTER',
  section: 'SECTION',
};

const CLASS_KINDS: Record<string, EmailBlockKind> = {
  mast: 'header',
  lh: 'header',
  hero: 'hero',
  monument: 'hero',
  idea: 'headline',
  head: 'headline',
  open: 'main_copy',
  letter: 'main_copy',
  walk: 'feature',
  reveal: 'feature',
  ledger: 'feature',
  own: 'feature',
  fig: 'divider',
  rule: 'divider',
  band: 'primary_cta',
  act: 'primary_cta',
  closer: 'close',
  close: 'close',
  rest: 'image',
  foot: 'footer',
};

export type EmailBlock = {
  index: number;
  kind: EmailBlockKind;
  label: string;
  summary: string;
  imageSrc: string | null;
  className: string;
  /** Blocks the composition shows on one breakpoint only. */
  viewport: 'mobile' | 'desktop' | null;
};

function firstClass(className: string): string {
  return className.split(/\s+/).filter((c) => c && c !== 'mob-only' && c !== 'desk-only')[0] ?? '';
}

export function classifyEmailBlocks(nodes: EmailBlockDescriptor[]): EmailBlock[] {
  let heroAssigned = false;
  return nodes.map((node, index) => {
    const cls = firstClass(node.className);
    const text = node.text.replace(/\s+/g, ' ').trim();
    let kind: EmailBlockKind | undefined = CLASS_KINDS[cls];
    if (!kind) {
      if (index === 0) kind = 'header';
      else if (node.tag === 'a') kind = 'primary_cta';
      else if (node.hasHeading1) kind = 'headline';
      else if (node.imageSrc && text.length < 40) kind = heroAssigned ? 'image' : 'hero';
      else if (node.hasHeading2) kind = 'feature';
      else kind = text ? 'main_copy' : 'section';
    }
    if (!text && node.imageSrc && (kind === 'primary_cta' || kind === 'close' || kind === 'main_copy')) kind = 'image';
    if (kind === 'hero') heroAssigned = true;
    const classes = node.className.split(/\s+/);
    return {
      index,
      kind,
      label: BLOCK_LABELS[kind],
      summary: text.length > 64 ? `${text.slice(0, 61).trimEnd()}…` : text,
      imageSrc: node.imageSrc,
      className: node.className,
      viewport: classes.includes('mob-only') ? 'mobile' : classes.includes('desk-only') ? 'desktop' : null,
    };
  });
}
