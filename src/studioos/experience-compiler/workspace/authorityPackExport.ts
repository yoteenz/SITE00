import type { AuthorityPlanEntry, CreativeExperienceGraph, ExperienceFamily, FamilySurfaceExpression } from '../map2/map2Types';
import type { IconPipelineSlice } from '../icons/iconTypes';
import type { VisualSurgeryPipelineSlice } from '../visual-surgery/visualSurgeryTypes';
import { grokStartHereMarkdown, imageRulesMarkdown } from '../visual-surgery/grokAssetPackCompiler';
import { iconRulesMarkdown } from '../icons/iconPipeline';
import { AUTHORITY_PACK_FILES } from '../map2/authorityPackCompiler';
import type { CompiledPackFile, IngestedAuthorityAsset, PackSizeValidation } from './types';
import { orderIngestedByPlan } from './openartManifestIngest';

const LITE_TARGET_MB = 25;
const LITE_WARN_MB = 28;
const LITE_BLOCK_MB = 30;

export function estimateBytes(content: string): number {
  return new TextEncoder().encode(content).byteLength;
}

export function compileMasterPackFiles(input: {
  project_id: string;
  graph: CreativeExperienceGraph;
  families: ExperienceFamily[];
  surfaces: FamilySurfaceExpression[];
  plan: AuthorityPlanEntry[];
  assets: IngestedAuthorityAsset[];
  lineage: Record<string, unknown>;
  icon_pipeline?: IconPipelineSlice | null;
  visual_surgery_pipeline?: VisualSurgeryPipelineSlice | null;
}): CompiledPackFile[] {
  const ordered = orderIngestedByPlan(input.plan, input.assets);
  const manifest = {
    project_id: input.project_id,
    authorities: ordered.map((a) => ({
      authority_id: a.authority_id,
      filename: a.canonical_filename,
      surface: a.surface,
      family_id: a.family_id,
      version: a.version,
      generation_id: a.generation_id,
    })),
    superseded_excluded: true,
  };
  const files: CompiledPackFile[] = [
    {
      path: '00_START_HERE.md',
      content: `# Authority pack\n\nProject: ${input.project_id}\n\nUse AUTHORITY_MANIFEST.json for canonical ordering.`,
      byte_length: 0,
    },
    { path: 'AUTHORITY_MANIFEST.json', content: JSON.stringify(manifest, null, 2), byte_length: 0 },
    { path: 'EXPERIENCE_GRAPH.json', content: JSON.stringify(input.graph, null, 2), byte_length: 0 },
    { path: 'EXPERIENCE_FAMILIES.json', content: JSON.stringify({ families: input.families }, null, 2), byte_length: 0 },
    {
      path: 'SURFACE_EXPRESSION_MANIFEST.json',
      content: JSON.stringify({ expressions: input.surfaces }, null, 2),
      byte_length: 0,
    },
    { path: 'MODEL_PIPELINE.md', content: '# Model pipeline\n\nOPENART → COMPOSER PACK → SONNET → OPUS → GROK → COMPOSER\n', byte_length: 0 },
    {
      path: 'generation_lineage.json',
      content: JSON.stringify(input.lineage, null, 2),
      byte_length: 0,
    },
  ];
  if (input.icon_pipeline) {
    files.push(
      { path: 'icons/ICON_MANIFEST.json', content: JSON.stringify(input.icon_pipeline.icon_manifest, null, 2), byte_length: 0 },
      { path: 'icons/ICON_RULES.md', content: iconRulesMarkdown(input.icon_pipeline.icon_family), byte_length: 0 },
      {
        path: 'icons/ICON_FAMILY_AUTHORITY.jpg',
        content: '[placeholder:icon-family-authority]',
        byte_length: 400_000,
      },
    );
    if (input.icon_pipeline.micro_asset_family) {
      files.push({
        path: 'micro-assets/MICRO_ASSET_MANIFEST.json',
        content: JSON.stringify(input.icon_pipeline.micro_asset_family, null, 2),
        byte_length: 0,
      });
    }
  }
  if (input.visual_surgery_pipeline) {
    const vs = input.visual_surgery_pipeline;
    files.push(
      { path: 'images/IMAGE_ASSET_MANIFEST.json', content: JSON.stringify(vs.image_requirements, null, 2), byte_length: 0 },
      { path: 'images/IMAGE_RULES.md', content: imageRulesMarkdown(), byte_length: 0 },
      { path: 'images/CONTINUITY_GROUPS.json', content: JSON.stringify({ groups: vs.continuity_groups }, null, 2), byte_length: 0 },
      { path: 'images/SURFACE_VARIANTS.json', content: JSON.stringify({ variants: vs.surface_variants }, null, 2), byte_length: 0 },
      {
        path: 'GROK_ASSET_PACK/00_START_HERE.md',
        content: grokStartHereMarkdown(),
        byte_length: 0,
      },
      {
        path: 'GROK_ASSET_PACK/LAYER_OWNERSHIP_MANIFEST.json',
        content: JSON.stringify(vs.layer_ownership, null, 2),
        byte_length: 0,
      },
    );
  }
  for (const a of ordered) {
    files.push({
      path: `assets/${a.canonical_filename}`,
      content: `[binary:${a.byte_length}]`,
      byte_length: a.byte_length,
    });
  }
  return files.map((f) => ({ ...f, byte_length: f.path.startsWith('assets/') ? f.byte_length : estimateBytes(f.content) }));
}

export function compileSonnetLitePackFiles(master: CompiledPackFile[], includeDirections = true): CompiledPackFile[] {
  const allow = new Set([
    '00_START_HERE.md',
    'AUTHORITY_MANIFEST.json',
    'AUTHORITY_RULES.md',
    'SONNET_IMPLEMENTATION_DIRECTIONS.md',
    'EXPERIENCE_GRAPH.json',
    'EXPERIENCE_FAMILIES.json',
    'SURFACE_EXPRESSION_MANIFEST.json',
    ...master.filter((f) => f.path.startsWith('assets/')).map((f) => f.path),
  ]);
  const rules: CompiledPackFile = {
    path: 'AUTHORITY_RULES.md',
    content: '# Authority rules\n\nDo not invent routes. Follow manifest order.\n',
    byte_length: 0,
  };
  rules.byte_length = estimateBytes(rules.content);
  const directions: CompiledPackFile | null = includeDirections
    ? {
        path: 'SONNET_IMPLEMENTATION_DIRECTIONS.md',
        content: '# Sonnet directions\n\nImplement structure only; no pixel invention beyond authorities.\n',
        byte_length: estimateBytes('# Sonnet directions\n\nImplement structure only; no pixel invention beyond authorities.\n'),
      }
    : null;
  const out = master.filter((f) => allow.has(f.path));
  if (!out.some((f) => f.path === 'AUTHORITY_RULES.md')) out.push(rules);
  if (directions && !out.some((f) => f.path === directions.path)) out.push(directions);
  return out;
}

export function validatePackSize(totalBytes: number): PackSizeValidation {
  const total_mb = totalBytes / (1024 * 1024);
  if (total_mb > LITE_BLOCK_MB) {
    return { total_bytes: totalBytes, total_mb, level: 'block', message: `Pack ${total_mb.toFixed(1)} MB exceeds ${LITE_BLOCK_MB} MB hard limit` };
  }
  if (total_mb >= LITE_WARN_MB) {
    return { total_bytes: totalBytes, total_mb, level: 'warn', message: `Pack ${total_mb.toFixed(1)} MB — warning above ${LITE_WARN_MB} MB` };
  }
  return { total_bytes: totalBytes, total_mb, level: 'ok', message: `Pack ${total_mb.toFixed(1)} MB within ${LITE_TARGET_MB} MB target` };
}

export function sumPackBytes(files: CompiledPackFile[]): number {
  return files.reduce((s, f) => s + f.byte_length, 0);
}

export function excludeSupersededAssets(assets: IngestedAuthorityAsset[]): IngestedAuthorityAsset[] {
  return assets.filter((a) => !a.superseded);
}

export { AUTHORITY_PACK_FILES, LITE_BLOCK_MB, LITE_TARGET_MB };
