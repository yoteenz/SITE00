/**
 * P0.CGO.1 — Motif propagation map.
 */

import type { CampaignWorldBible, MotifPropagationMap } from './types.js';

export function buildMotifPropagationMap(motif: string, world: CampaignWorldBible): MotifPropagationMap {
  return {
    motif,
    appearances: {
      PROP: world.propSystem.find((p) => p.toLowerCase().includes(motif.toLowerCase().split(' ')[0] ?? '')) ?? `Prop carrying ${motif}`,
      HUMAN_STYLING: world.nailDirection.includes(motif) ? world.nailDirection : `Optional nail/styling echo of ${motif}`,
      GRAPHIC: world.graphicLanguage,
      COPY: world.campaignTitleLanguage,
      ENVIRONMENT: world.setting,
      PRODUCT: world.productRole,
      MOVEMENT: world.motionLogic,
    },
    evolutionModes: ['REPEAT', 'TRANSFORM', 'HIDE', 'REVEAL'],
  };
}
