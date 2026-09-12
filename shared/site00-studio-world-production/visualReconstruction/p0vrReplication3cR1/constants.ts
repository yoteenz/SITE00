export const P0_VR_REPLICATION_3C_R1_BUILD = 'v331' as const;

/** Center-stack mid slice — photographic proof slot for 3C-R1. */
export const HERO_MATERIALIZATION_PROOF_SLOT_ID = 'slice_b' as const;

/** Normalized crop rects against full design authority mobile PNG (0–1). */
export const HERO_AUTHORITY_NORM_CROPS: Record<
  string,
  { left: number; top: number; width: number; height: number }
> = {
  slice_a: { left: 0.36, top: 0.22, width: 0.32, height: 0.08 },
  slice_b: { left: 0.36, top: 0.30, width: 0.32, height: 0.09 },
  slice_c: { left: 0.36, top: 0.38, width: 0.32, height: 0.09 },
  right_graphic: { left: 0.72, top: 0.26, width: 0.24, height: 0.22 },
  /** P0.VR.4R3R1 — hero-safe center column (page Y 228–448 on 812px authority). */
  hero_h06: { left: 140 / 375, top: 228 / 812, width: 160 / 375, height: 220 / 812 },
  /** P0.VR.4R3R1 — hero lower-right photo slot only (no milestone/activity band). */
  hero_h12: { left: 300 / 375, top: 380 / 812, width: 64 / 375, height: 56 / 812 },
};

/** Minimum luma standard deviation (0–255 scale) to reject blank/uniform crops. */
export const MIN_CROP_LUMA_STDDEV = 4.5;
