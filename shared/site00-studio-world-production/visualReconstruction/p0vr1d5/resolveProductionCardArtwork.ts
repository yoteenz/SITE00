/**
 * P0.VR.1D.5 — Production card artwork resolution (existing assets first).
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ProductionCardArtworkResolution } from './types.js';

export type ResolveProductionCardArtworkInput = {
  projectRoot?: string;
  cards: Array<{
    id: string;
    title: string;
    artworkPath: string;
    artworkObjectPosition: string;
    pipelineAssetUrl?: string | null;
    canonicalAssetPath?: string | null;
  }>;
};

export function resolveProductionCardArtwork(
  input: ResolveProductionCardArtworkInput,
): ProductionCardArtworkResolution[] {
  const root = input.projectRoot ?? process.cwd();

  return input.cards.map((card) => {
    const publicAbs = join(root, 'public', card.artworkPath.replace(/^\//, ''));
    const canonicalAbs = card.canonicalAssetPath ? join(root, card.canonicalAssetPath) : null;

    if (canonicalAbs && existsSync(canonicalAbs)) {
      return resolution(card, 'EXISTING_CANONICAL', card.canonicalAssetPath!, 'canonical-local', false);
    }

    if (card.pipelineAssetUrl) {
      return {
        ...resolution(card, 'EXISTING_PIPELINE', card.pipelineAssetUrl, 'experiment-01-v23-slide-01', false),
        artworkUrl: card.pipelineAssetUrl,
      };
    }

    if (existsSync(publicAbs)) {
      return resolution(
        card,
        'REFERENCE_APPROVED_CROP',
        card.artworkPath,
        'mobile-overview-menu-open.png card-artwork crop',
        false,
      );
    }

    return {
      cardId: card.id,
      title: card.title,
      source: 'ARTWORK_GENERATION_REQUIRED',
      assetId: null,
      artworkUrl: null,
      lineage: 'no canonical, pipeline, or reference crop — FAL generation required (founder trigger)',
      generated: false,
      crop: null,
      generationRequired: true,
    };
  });
}

function resolution(
  card: ResolveProductionCardArtworkInput['cards'][number],
  source: ProductionCardArtworkResolution['source'],
  assetId: string,
  lineage: string,
  generated: boolean,
): ProductionCardArtworkResolution {
  return {
    cardId: card.id,
    title: card.title,
    source,
    assetId,
    artworkUrl: card.artworkPath.startsWith('/') ? card.artworkPath : null,
    lineage,
    generated,
    crop: {
      objectFit: 'cover',
      objectPosition: card.artworkObjectPosition,
      aspectRatio: '4 / 3',
    },
    generationRequired: false,
  };
}

export function existingPipelinePreferredOverNewGeneration(
  resolutions: ProductionCardArtworkResolution[],
): boolean {
  return resolutions.every(
    (r) => r.source !== 'GENERATED_NEW' && (r.source !== 'ARTWORK_GENERATION_REQUIRED' || r.generationRequired),
  );
}
