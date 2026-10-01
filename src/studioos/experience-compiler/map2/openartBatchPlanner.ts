import type { AuthorityPlanEntry, OpenArtAuthorityBatch } from './map2Types';
import type { IconFamilyAuthority } from '../icons/iconTypes';

export function planIconFamilyOpenArtBatch(project_id: string, iconAuthority: IconFamilyAuthority): OpenArtAuthorityBatch {
  return {
    batch_id: `batch_icon_${iconAuthority.icon_family_id}`,
    project_id,
    family_id: iconAuthority.icon_family_id,
    surface: 'DESKTOP_WEB',
    authorities: [iconAuthority.authority_id],
    authority_type: 'ICON_FAMILY_AUTHORITY',
    model: 'openart-gpt-image-2-family',
    generation_mode: 'PARALLEL_INDEPENDENT',
    prompts: { [iconAuthority.authority_id]: iconAuthority.generation_prompt },
    aspect_ratios: { [iconAuthority.authority_id]: '16:9' },
    expected_filenames: [`ICON_FAMILY_${iconAuthority.icon_family_id}.jpg`],
    dependency_order: [iconAuthority.authority_id],
    icon_family_id: iconAuthority.icon_family_id,
    representative_semantics: iconAuthority.representative_semantics,
  };
}

export function planOpenArtBatches(project_id: string, plan: AuthorityPlanEntry[], iconAuthority?: IconFamilyAuthority | null): OpenArtAuthorityBatch[] {
  const byFamilySurface = new Map<string, AuthorityPlanEntry[]>();
  for (const e of plan) {
    const key = `${e.family_id}|${e.surface}`;
    byFamilySurface.set(key, [...(byFamilySurface.get(key) ?? []), e]);
  }
  const batches: OpenArtAuthorityBatch[] = [];
  let batchIdx = 0;
  for (const [key, entries] of byFamilySurface) {
    const [family_id, surface] = key.split('|') as [string, OpenArtAuthorityBatch['surface']];
    const parentFirst = entries.filter((e) => e.new_grammar);
    const children = entries.filter((e) => !e.new_grammar);
    const ordered = [...parentFirst, ...children];
    const expected_filenames = ordered.map((e, i) =>
      canonicalAuthorityFilename(i + 1, e.family_id, e.surface, e.screen_or_state),
    );
    batches.push({
      batch_id: `batch_${batchIdx++}_${family_id}_${surface}`,
      project_id,
      family_id,
      surface,
      authorities: ordered.map((e) => e.authority_id),
      authority_type: 'PAGE_AUTHORITY',
      model: 'openart-gpt-image-2-family',
      generation_mode: parentFirst.length ? 'SEQUENTIAL_DEPENDENT' : 'PARALLEL_INDEPENDENT',
      prompts: Object.fromEntries(ordered.map((e) => [e.authority_id, e.generation_prompt])),
      aspect_ratios: Object.fromEntries(ordered.map((e) => [e.authority_id, e.surface === 'DESKTOP_WEB' ? '16:9' : '9:16'])),
      expected_filenames,
      dependency_order: ordered.map((e) => e.authority_id),
    });
  }
  if (iconAuthority) {
    batches.unshift(planIconFamilyOpenArtBatch(project_id, iconAuthority));
  }
  return batches;
}

export function canonicalAuthorityFilename(
  order: number,
  familyId: string,
  surface: string,
  state: string,
): string {
  const prefix = String(order).padStart(2, '0');
  const fam = familyId.replace(/[^A-Z0-9_]/gi, '_').toUpperCase();
  const surf = surface === 'APP' ? 'APP' : surface.replace('_WEB', '');
  const st = state.replace(/[^A-Z0-9_]/gi, '_').toUpperCase();
  if (surface === 'APP') return `${prefix}_APP_${fam}_${st}.jpg`;
  return `${prefix}_${fam}_${surf}.jpg`;
}

export function mapIngestByManifest(filename: string, authority_id: string): { authority_id: string; filename: string } {
  return { authority_id, filename };
}
