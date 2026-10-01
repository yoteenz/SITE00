import type { AuthorityPlanEntry, CreativeExperienceGraph, ExperienceFamily, FamilySurfaceExpression } from '../map2/map2Types';
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
