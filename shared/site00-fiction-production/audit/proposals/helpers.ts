import { NIGHTS_REPAIR, S101_PACKET, TRUTH_DOC } from '../sources.js';
import type { Citation, ProductionImpact } from '../types.js';

/** An enhancement that lives inside existing shots and runtime. */
export const inScene = (note: string, extra: Partial<ProductionImpact> = {}): ProductionImpact => ({
  fitsRuntime: true,
  replaces: null,
  extraSec: 0,
  newScene: false,
  newCharacterAsset: false,
  newProp: false,
  newMusicOrSfx: false,
  reusesLocation: null,
  reusesCharacter: null,
  generationCost: 'NO_CHANGE',
  note,
  ...extra,
});

export const noProduction = inScene('No production change: a written rule only.');

export const cite = (releaseId: string, quote: string, beat?: number, scene = 'P1'): Citation => ({
  releaseId,
  sceneId: `${releaseId}-${scene}`,
  quote,
  ...(beat === undefined ? {} : { beat }),
});

/** A citation into the S1-01 directorial packet (shot subjects), which is read only. */
export const shot = (sceneId: string, quote: string): Citation => ({ releaseId: 'S1-01', sceneId, quote, file: S101_PACKET });

export const truth = (releaseId: string, quote: string): Citation => ({ releaseId, sceneId: `${releaseId}-P1`, quote, file: TRUTH_DOC });

export const nightsRepair = (releaseId: string, quote: string): Citation => ({ releaseId, sceneId: `${releaseId}-P1`, quote, file: NIGHTS_REPAIR });
