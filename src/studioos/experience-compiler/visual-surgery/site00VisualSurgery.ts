import { PUBLIC_REDESIGN_AUTHORITY_RECORDS } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { PUBLIC_REDESIGN_ASSET_SLOTS } from '../../../site00/authority/publicRedesignAssetSlots';
import { runVisualAssetSurgeryPipeline } from './visualSurgeryPipeline';

/** SITE 00 INGEST — decompose authorities + asset slots without mass Grok generation. */
export function buildSite00VisualSurgeryFixture() {
  const authorities = PUBLIC_REDESIGN_AUTHORITY_RECORDS;
  const pipeline = runVisualAssetSurgeryPipeline({
    project_id: 'site00',
    authorities,
    mode: 'INGEST',
  });
  const grokSlots = PUBLIC_REDESIGN_ASSET_SLOTS.filter((s) => s.grokRequired).length;
  return {
    mode: 'INGEST' as const,
    authority_count: authorities.length,
    asset_slot_count: PUBLIC_REDESIGN_ASSET_SLOTS.length,
    grok_required_slots: grokSlots,
    pipeline,
    validation: {
      origin_same_world:
        pipeline.continuity_groups.find((c) => c.continuity_group_id === 'SITE00_ORIGIN_UNIVERSE_V1')?.member_asset_ids.length ?? 0 > 0,
      bldr_continuity: pipeline.continuity_groups.some((c) => c.continuity_group_id === 'BLDR_WORLD_SYSTEM_V1'),
      evolve_continuity: pipeline.continuity_groups.some((c) => c.continuity_group_id === 'EVOLVE_INTERVENTION_SYSTEM_V1'),
      bldr_command_decomposed: pipeline.scene_decompositions.some((d) => d.authority_id === '01_BLDR_COMMAND_CENTER'),
      no_mass_generation: true,
    },
  };
}
