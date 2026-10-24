import type { ShotDesign } from '../../directorial/types.js';

/** No physical camera exists, so no focal length is prescribed (sprint V2 §11); lens intent and depth carry the direction. */
export const NO_LENS = 'Not prescribed: generated image with no physical camera; lens intent and depth of field carry it.';

type Authored = Omit<ShotDesign, 'track' | 'focalLength' | 'coverage' | 'lipSync' | 'mouthVisible' | 'endFrameRef' | 'actionCount' | 'generated' | 'wardrobe' | 'propState' | 'referenceAssets' | 'continuityRisk'> & Partial<ShotDesign>;

export const shot = (s: Authored): ShotDesign => ({
  track: 'VIDEO_A',
  focalLength: NO_LENS,
  coverage: 'SILENT_ACTION',
  lipSync: 'NONE',
  mouthVisible: [],
  endFrameRef: null,
  actionCount: 1,
  generated: true,
  wardrobe: [],
  propState: {},
  referenceAssets: [],
  continuityRisk: [],
  ...s,
});

export const WD = {
  TAILOR: 'Tailor: shirtsleeves rolled twice, a waistcoat, a tape measure round the neck (scene-scoped)',
  TEENAGER: 'Teenager: hoodie open over a pressed shirt, clean sneakers (scene-scoped)',
  GRANDMOTHER: 'Grandmother: house cardigan, reading glasses on a chain (scene-scoped)',
  DRESS: 'The jewel-green dress (design pending, U-4)',
  WOMAN: 'Woman on the balcony: soft at-home dress, bare feet, hair loosely up (scene-scoped)',
  NEIGHBOUR: 'Neighbour: plain t-shirt, reading lamp behind him (scene-scoped)',
} as const;
