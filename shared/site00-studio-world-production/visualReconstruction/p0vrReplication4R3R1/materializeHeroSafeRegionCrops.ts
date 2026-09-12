import { HERO_AUTHORITY_NORM_CROPS } from '../p0vrReplication3cR1/constants.js';
import { materializeHeroProofSlot } from '../p0vrReplication3cR1/materializeHeroProofSlot.js';
import { validateHeroNormCrop } from './heroCropPurityGuard.js';
import type { HeroSafeRegionCropReceipt } from './types.js';

export async function materializeHeroSafeRegionCrops(input: {
  authorityUrl: string;
  sessionId: string;
}): Promise<{
  crops: { H06: string | null; H12: string | null };
  receipts: HeroSafeRegionCropReceipt[];
}> {
  const slots: { objectId: 'H06' | 'H12'; slotId: string }[] = [
    { objectId: 'H06', slotId: 'hero_h06' },
    { objectId: 'H12', slotId: 'hero_h12' },
  ];

  const receipts: HeroSafeRegionCropReceipt[] = [];
  const crops: { H06: string | null; H12: string | null } = { H06: null, H12: null };

  for (const { objectId, slotId } of slots) {
    const norm = HERO_AUTHORITY_NORM_CROPS[slotId];
    const purity = norm
      ? validateHeroNormCrop({ objectId, ...norm })
      : {
          objectId,
          classification: 'UNKNOWN' as const,
          cropWithinHeroBand: false,
          pageUiContamination: true,
          failureCode: 'H06_CROP_OUTSIDE_HERO' as const,
          notes: 'Missing norm crop',
        };

    const materialized = await materializeHeroProofSlot({
      authorityUrl: input.authorityUrl,
      sessionId: input.sessionId,
      slotId,
    });

    receipts.push({
      objectId,
      slotId,
      classification: purity.classification,
      normCrop: norm ?? null,
      purity,
      materializedUrl: materialized.publicUrl,
      decoded: materialized.trace.decoded,
      naturalWidth: materialized.trace.naturalWidth,
      naturalHeight: materialized.trace.naturalHeight,
      status: materialized.ok && purity.cropWithinHeroBand ? 'PASS' : 'FAIL',
    });

    if (materialized.publicUrl && materialized.ok) {
      crops[objectId] = materialized.publicUrl;
    }
  }

  return { crops, receipts };
}
