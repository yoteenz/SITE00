/**
 * B5.2 — Entry 001 archive derivation plan (compile only — no provider dispatch).
 */

import type {
  Entry001ArchiveDerivationPlan,
  Entry001CampaignAsset,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { ENTRY001_REQUIRED_DELIVERABLE_ROLES } from '../../../config/entry001CampaignAssets.js';
import { ENTRY001_VISUAL_CONTINUITY, styleContinuityLockedFromArchive } from './entry001VisualContinuity.js';

const SOURCE_IDS = [
  'entry001-archive-01-then-now',
  'entry001-archive-02-rehab-cycle',
  'entry001-archive-03-apologies-archives',
  'entry001-hero-portrait',
  'entry001-archive-04-story-changed',
];

function continuityRules(): string[] {
  return [
    ...ENTRY001_VISUAL_CONTINUITY.palette,
    ...ENTRY001_VISUAL_CONTINUITY.imageLanguage.slice(0, 2),
    ...ENTRY001_VISUAL_CONTINUITY.annotation.slice(0, 3),
  ];
}

function copyRules(): string[] {
  return [
    'WHO TF IS WE? thesis preserved',
    'media complicity / public rehabilitation argument',
    'no invented apology narrative',
    'archival confrontational tone',
  ];
}

export function compileEntry001ArchiveDerivationPlan(
  approvedArchive: Entry001CampaignAsset[],
): Entry001ArchiveDerivationPlan {
  const locked = styleContinuityLockedFromArchive(approvedArchive.length);

  const targets = ENTRY001_REQUIRED_DELIVERABLE_ROLES.map((role) => {
    const derivable = locked && role !== 'FINAL_REEL';
    let strategy = 'Manual production or founder upload';
    if (role === 'REEL_COVER') {
      strategy =
        'Derive dominant typography, Britney treatment, torn-paper collage, lime marker from approved archive';
    } else if (role === 'HIGHLIGHT_ICON') {
      strategy = 'Derive simple icon/cover from same visual package — no unrelated iconography';
    } else if (role === 'FINAL_REEL') {
      strategy =
        'Major production object — story/visual package established; requires explicit founder generation decision';
    } else if (role === 'TIKTOK_POST') {
      strategy = 'Platform-native expression from Entry narrative — not carousel resize';
    } else if (role === 'X_POST') {
      strategy = 'X-native thread from x-expr-entry-001 beats — not reel repost';
    }

    return {
      role,
      derivable,
      recommendedSourceAssetIds: derivable ? SOURCE_IDS : [],
      visualContinuityRules: continuityRules(),
      copyContinuityRules: copyRules(),
      formatRules:
        role === 'HIGHLIGHT_ICON'
          ? ['square crop', 'lime accent minimal', 'recognizable at small size']
          : role === 'FINAL_REEL'
            ? ['9:16 cinematic', 'broadcast interruption grammar']
            : ['platform-native aspect', 'preserve cream/black/lime palette'],
      generationStrategy: strategy,
      founderApprovalRequired: true,
    };
  });

  return {
    planId: 'entry001-derivation-plan-v001',
    entryId: 'entry-001',
    compiledAt: new Date().toISOString(),
    providerDispatchCount: 0,
    targets,
  };
}
