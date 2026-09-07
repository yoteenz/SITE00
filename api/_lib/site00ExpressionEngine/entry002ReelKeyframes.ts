/**
 * Sprint B4 — Entry 002 REEL keyframe authority (Stage 1).
 */

import { randomUUID } from 'node:crypto';
import type {
  ReelKeyframeAsset,
  ReelKeyframeRole,
  ReelKeyframeSpec,
} from '../../../shared/site00-expression-engine/entry002ReelTypes.js';
import {
  ENTRY_002_TERRITORY_ID,
  ENTRY_002_WORLD_ID,
} from './entry002Blueprint.js';
import { B3_GENERATED_ANCHOR_ASSET_ID } from './entry002B3FounderOverride.js';
import { registerGeneration } from './lineageRegistration.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';

export function buildEntry002ReelKeyframeSpecs(): ReelKeyframeSpec[] {
  return [
    {
      keyframeId: 'kf-entry-002-reel-start',
      role: 'START',
      shotIds: ['r2-s01', 'r2-s02'],
      description:
        'Black frame. Phone glows lime with one legible nostalgia claim. Immediate portal into archive — subject first.',
      visualRequirements: [
        'pure black opening',
        'phone lime edge glow',
        'controlled nostalgia receipt',
        '2016 IG baddie fashion legibility',
        'NOT edit suite establishing shot',
      ],
      continuityRefs: ['obj-phone-cover', 'pal-edit-suite', 'nar-nostalgia-revision'],
      coverConnection: 'ENTRY_IDENTITY_NOT_SHOT_LIST',
    },
    {
      keyframeId: 'kf-entry-002-reel-mid',
      role: 'MID',
      shotIds: ['r2-s05', 'r2-s06', 'r2-s07'],
      description:
        'Physical edit suite takeover — timeline cut, label removed, same fashion image relabeled. Razor symbolic not violent.',
      visualRequirements: [
        'physical timeline strips',
        'razor / edit blade at cut point',
        'label splice behavior',
        'same image two labels',
        'NOT software UI',
      ],
      continuityRefs: ['env-edit-suite', 'obj-razor-timeline', 'gram-timeline-edit'],
      coverConnection: 'ENTRY_IDENTITY_NOT_SHOT_LIST',
    },
    {
      keyframeId: 'kf-entry-002-reel-end',
      role: 'END',
      shotIds: ['r2-s09', 'r2-s10'],
      description: 'Synthesis line + ENTRY 002 end card. Cinematic temporal experience — not static cover on black.',
      visualRequirements: [
        'synthesis typography moment',
        'ENTRY 002 filing card',
        '2016 IG BADDIE FASHION subject label',
        'environment may appear — not pure black throughout',
      ],
      continuityRefs: ['nar-nostalgia-revision', 'typ-editorial', 'pal-edit-suite'],
      coverConnection: 'ENTRY_IDENTITY_NOT_SHOT_LIST',
    },
  ];
}

function buildKeyframeAssetId(role: ReelKeyframeRole): string {
  const suffix = randomUUID().slice(0, 8).toUpperCase();
  return `NDX-ENTRY-002-REEL-KF-${role}-${suffix}`;
}

export function compileEntry002ReelKeyframes(options?: {
  dispatch?: boolean;
}): ReelKeyframeAsset[] {
  const specs = buildEntry002ReelKeyframeSpecs();
  const coverAuthorityId = B3_GENERATED_ANCHOR_ASSET_ID.replace('COVER-ANCHOR', 'COVER-AUTHORITY-PHONE');

  return specs.map((spec) => {
    const assetId = buildKeyframeAssetId(spec.role);
    const storagePath = `site00/assts/expression-engine/ndxbook/entry-002/reel/${assetId.toLowerCase()}.webp`;
    const receipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-002',
      format: 'REEL',
      territoryId: ENTRY_002_TERRITORY_ID,
      worldId: ENTRY_002_WORLD_ID,
      assetId,
      parentAssetId: 'founder-cover-authority-phone',
      provider: 'fal-flux',
      model: 'fal-ai/flux-pro',
      promptLineage: [
        'sprint-b4-entry-002-reel-keyframe',
        spec.keyframeId,
        spec.role,
        ...spec.visualRequirements.slice(0, 3),
      ],
      referenceLineage: [
        ENTRY_002_WORLD_ID,
        ENTRY_002_TERRITORY_ID,
        CHAPTER_01_ID,
        'founder-cover-authority-phone',
        coverAuthorityId,
      ],
      trackingState: 'TRACKED',
    });

    return {
      assetId,
      keyframeId: spec.keyframeId,
      role: spec.role,
      storagePath,
      previewUrl: `https://expression-engine.local/${storagePath}`,
      receipt,
      founderJudgment: 'UNREVIEWED' as const,
      status: options?.dispatch ? ('DISPATCHED' as const) : ('COMPILED' as const),
    };
  });
}
