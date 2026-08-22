/**
 * Physical reference crops from resolved founder reference assets.
 */

import sharp from 'sharp';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import type {
  BoardReferenceCrop,
  BoardReferenceInfluenceEdge,
  BoardZoneId,
  ResolvedBoardReference,
} from './creativeDirectionBoardTypes.js';

export type CropSpec = {
  cropId: string;
  sourceReferenceId: string;
  left: number;
  top: number;
  width: number;
  height: number;
  purpose: string;
  boardZone: BoardZoneId;
  influencedAssetIds: string[];
};

const DEFAULT_CROP_SPECS: CropSpec[] = [
  {
    cropId: 'REF-COMP-01',
    sourceReferenceId: 'ref-editorial-spread-modern',
    left: 0,
    top: 0,
    width: 0.65,
    height: 0.55,
    purpose: 'Asymmetric hero composition rhythm — dominant photographic column',
    boardZone: 'heroEditorialSpread',
    influencedAssetIds: ['MU01', 'MU03'],
  },
  {
    cropId: 'REF-ANNOT-01',
    sourceReferenceId: 'ref-live-revision-behavior',
    left: 0.1,
    top: 0.15,
    width: 0.75,
    height: 0.7,
    purpose: 'Margin annotation density and strike/replace behavior',
    boardZone: 'primaryRevisionArtifact',
    influencedAssetIds: ['MU02'],
  },
  {
    cropId: 'REF-MAT-01',
    sourceReferenceId: 'ref-material-paper',
    left: 0.05,
    top: 0.05,
    width: 0.9,
    height: 0.45,
    purpose: 'Editorial paper surface and warm neutral material field',
    boardZone: 'primaryRevisionArtifact',
    influencedAssetIds: ['MU02'],
  },
  {
    cropId: 'REF-PHOTO-01',
    sourceReferenceId: 'ref-editorial-spread-modern',
    left: 0.35,
    top: 0.2,
    width: 0.55,
    height: 0.65,
    purpose: 'Documentary editorial crop framing',
    boardZone: 'supportingPhotography',
    influencedAssetIds: ['MU03'],
  },
];

export async function createReferenceCrops(params: {
  references: ResolvedBoardReference[];
  comparisonIndex: number;
  specs?: CropSpec[];
}): Promise<BoardReferenceCrop[]> {
  const specs = params.specs ?? DEFAULT_CROP_SPECS;
  const refById = new Map(params.references.map((r) => [r.referenceId, r]));
  const crops: BoardReferenceCrop[] = [];

  for (const spec of specs) {
    const ref = refById.get(spec.sourceReferenceId);
    if (!ref) continue;

    const buffer = await downloadUrlToBuffer(ref.publicUrl);
    const meta = await sharp(buffer).metadata();
    const imgW = meta.width ?? 1024;
    const imgH = meta.height ?? 1024;

    const left = Math.floor(spec.left * imgW);
    const top = Math.floor(spec.top * imgH);
    const width = Math.max(64, Math.floor(spec.width * imgW));
    const height = Math.max(64, Math.floor(spec.height * imgH));

    const cropped = await sharp(buffer)
      .extract({
        left,
        top,
        width: Math.min(width, imgW - left),
        height: Math.min(height, imgH - top),
      })
      .webp({ quality: 90 })
      .toBuffer();

    const storagePath = `site00/creative-direction/ndxbook/boards/${String(params.comparisonIndex).padStart(2, '0')}/refs/v2/${spec.cropId}.webp`;
    const upload = await uploadSite00AssetBuffer(storagePath, cropped, 'image/webp');

    crops.push({
      cropId: spec.cropId,
      sourceReferenceId: spec.sourceReferenceId,
      sourceX: left,
      sourceY: top,
      cropWidth: width,
      cropHeight: height,
      purpose: spec.purpose,
      boardZone: spec.boardZone,
      influencedAssetIds: spec.influencedAssetIds,
      storagePath,
      publicUrl: upload.publicUrl,
    });

    ref.width = imgW;
    ref.height = imgH;
  }

  return crops;
}

export function buildReferenceInfluenceGraph(params: {
  crops: BoardReferenceCrop[];
  references: ResolvedBoardReference[];
}): BoardReferenceInfluenceEdge[] {
  const edges: BoardReferenceInfluenceEdge[] = [];

  for (const crop of params.crops) {
    const trait =
      crop.cropId === 'REF-ANNOT-01'
        ? 'aggressive strike / replacement / margin-note behavior'
        : crop.cropId === 'REF-COMP-01'
          ? 'asymmetrical image / type relationship'
          : crop.cropId === 'REF-MAT-01'
            ? 'editorial paper surface and warm material tactility'
            : 'documentary editorial photographic framing';

    const application =
      crop.influencedAssetIds.includes('MU02') && crop.cropId === 'REF-ANNOT-01'
        ? 'HYBRID_OVERLAY'
        : 'FAL_REFERENCE_CONDITIONED';

    edges.push({
      referenceId: crop.sourceReferenceId,
      cropId: crop.cropId,
      trait,
      boardZone: crop.boardZone,
      assetManifestId: crop.influencedAssetIds[0] ?? 'MU01',
      application,
    });
  }

  for (const ref of params.references) {
    if (!edges.some((e) => e.referenceId === ref.referenceId)) {
      edges.push({
        referenceId: ref.referenceId,
        trait: ref.referenceRole,
        boardZone: 'heroEditorialSpread',
        assetManifestId: 'MU01',
        application: 'FAL_REFERENCE_CONDITIONED',
      });
    }
  }

  return edges;
}

export { DEFAULT_CROP_SPECS };
