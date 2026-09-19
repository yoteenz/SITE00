/**
 * P0.VR.1D.6 — Campaign Board card artwork resolution.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { CampaignCardArtworkResolution } from './types.js';

export function resolveCampaignBoardArtwork(input: {
  projectRoot?: string;
  cards: Array<{ id: string; artworkPath: string }>;
}): CampaignCardArtworkResolution[] {
  const root = input.projectRoot ?? process.cwd();

  return input.cards.map((card) => {
    const publicAbs = join(root, 'public', card.artworkPath.replace(/^\//, ''));
    if (existsSync(publicAbs)) {
      return {
        cardId: card.id,
        source: 'REFERENCE_APPROVED_CROP',
        assetId: card.artworkPath,
        artworkUrl: card.artworkPath,
        lineage: 'mobile-campaign-board-reference.png crop',
        generationRequired: false,
      };
    }
    return {
      cardId: card.id,
      source: 'ARTWORK_GENERATION_REQUIRED',
      assetId: null,
      artworkUrl: null,
      lineage: 'no reference crop — generation required (founder trigger)',
      generationRequired: true,
    };
  });
}
