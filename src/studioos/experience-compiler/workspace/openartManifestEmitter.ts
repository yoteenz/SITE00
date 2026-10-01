import type { AuthorityPlanEntry } from '../map2/map2Types';
import { planOpenArtBatches } from '../map2/openartBatchPlanner';
import type { OpenArtEmitRecord } from './types';

export type OpenArtProviderConfig = {
  provider: 'OPENART';
  model_family: string;
  model_version?: string;
};

export const DEFAULT_OPENART_PROVIDER: OpenArtProviderConfig = {
  provider: 'OPENART',
  model_family: 'gpt-image-2-family',
  model_version: undefined,
};

export function resolveOpenArtModelId(config: OpenArtProviderConfig = DEFAULT_OPENART_PROVIDER): string {
  return config.model_version ? `${config.provider}:${config.model_family}:${config.model_version}` : `${config.provider}:${config.model_family}`;
}

export function emitOpenArtManifest(
  project_id: string,
  plan: AuthorityPlanEntry[],
  provider: OpenArtProviderConfig = DEFAULT_OPENART_PROVIDER,
): { batches: ReturnType<typeof planOpenArtBatches>; records: OpenArtEmitRecord[]; preview: OpenArtManifestPreview } {
  const batches = planOpenArtBatches(project_id, plan);
  const model_family = resolveOpenArtModelId(provider);
  const records: OpenArtEmitRecord[] = [];
  for (const batch of batches) {
    batch.authorities.forEach((authority_id, idx) => {
      const entry = plan.find((p) => p.authority_id === authority_id);
      records.push({
        batch_id: batch.batch_id,
        authority_id,
        family_id: batch.family_id,
        surface: batch.surface,
        model_family,
        generation_mode: batch.generation_mode,
        prompt: batch.prompts[authority_id] ?? entry?.generation_prompt ?? '',
        references: [],
        aspect_ratio: batch.aspect_ratios[authority_id] ?? '9:16',
        resolution: batch.surface === 'DESKTOP_WEB' ? '1920x1080' : '1080x1920',
        output_format: 'jpeg',
        dependency_order: idx,
        expected_filename: batch.expected_filenames[idx] ?? `${authority_id}.jpg`,
        candidate_version: 1,
      });
    });
  }
  const preview: OpenArtManifestPreview = {
    generation_count: records.length,
    authority_names: records.map((r) => r.authority_id),
    surfaces: [...new Set(records.map((r) => r.surface))],
    filenames: records.map((r) => r.expected_filename),
    has_dependencies: batches.some((b) => b.generation_mode === 'SEQUENTIAL_DEPENDENT'),
  };
  return { batches, records, preview };
}

export type OpenArtManifestPreview = {
  generation_count: number;
  authority_names: string[];
  surfaces: string[];
  filenames: string[];
  has_dependencies: boolean;
};
