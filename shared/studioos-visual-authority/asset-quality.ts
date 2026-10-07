/**
 * Asset quality gating — Studio OS rule for every photographic / generated layer that enters a composite
 * (P0.JURNL.F09.PROMPT-FORENSICS-AND-CREATIVE-LOGIC-AUDIT1, addendum on THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1).
 *
 * Defined by the audit; not yet wired into any gate (evaluateAuthorityGate / checkCompositeAuthority are unchanged).
 * The consuming stage measures the decoded file itself — it never trusts the producer's reported size.
 */

/** What an output is allowed to be, from strongest to weakest. */
export const ASSET_PURPOSES = ['AUTHORITY_CANDIDATE', 'FOUNDER_REVIEW_EXCEPTION', 'LAYOUT_PROOF', 'WIREFRAME_ONLY'] as const;
export type AssetPurpose = (typeof ASSET_PURPOSES)[number];

/** Where the pixels came from. Anything but FULL_RENDER / SUPER_RESOLVED is degraded by definition. */
export const ASSET_PROVENANCE = ['FULL_RENDER', 'SUPER_RESOLVED', 'PREVIEW', 'THUMBNAIL', 'PROXY', 'SCREENSHOT', 'UNKNOWN'] as const;
export type AssetProvenance = (typeof ASSET_PROVENANCE)[number];
export const DEGRADED_PROVENANCE: readonly AssetProvenance[] = ['PREVIEW', 'THUMBNAIL', 'PROXY', 'SCREENSHOT', 'UNKNOWN'];

/**
 * Maximum linear upscale (required device px ÷ original generated px, on the limiting axis after crop) per purpose.
 * Super-resolution does not reset the ratio: it is measured against the pixels the generator produced.
 */
export const UPSCALE_LIMITS = { AUTHORITY_CANDIDATE: 1.0, FOUNDER_REVIEW_EXCEPTION: 1.5, LAYOUT_PROOF: 2.0 } as const;

export const ASSET_QUALITY_GATE = {
  SOURCE_RESOLUTION_RULE: 'Every photographic or generated layer must be decoded on disk at ≥ the device pixels it covers on the review canvas (canvas pt × review scale, after crop). The project’s canonical generation size is the target; the canvas requirement is the floor. Measured by the consuming stage on the file itself.',
  UPSCALE_RULE: `Measured against the original generated pixels. AUTHORITY_CANDIDATE ≤ ${UPSCALE_LIMITS.AUTHORITY_CANDIDATE}× (downsampling only). FOUNDER_REVIEW_EXCEPTION ≤ ${UPSCALE_LIMITS.FOUNDER_REVIEW_EXCEPTION}×, only with founder approval recorded before compositing (a founder may approve a higher ratio for a named run), through a dedicated super-resolution model (never browser / CSS / bilinear resampling), checked at 100 % crop. LAYOUT_PROOF ≤ ${UPSCALE_LIMITS.LAYOUT_PROOF}×. Above that the photographic layer may not be shown at canvas size.`,
  FOUNDER_REVIEW_THRESHOLD: 'Any founder-facing visual meets AUTHORITY_CANDIDATE, or FOUNDER_REVIEW_EXCEPTION with the approval on record, and passes 100 % crop QA (no upsampling softness, no compression blocks, exact glyphs). Founder-facing = sent, shown, attached, linked, zipped or named for the founder, including delivery on a direct request.',
  LAYOUT_PROOF_THRESHOLD: `Internal only. Permitted when every photographic source is FULL_RENDER / SUPER_RESOLVED and ≤ ${UPSCALE_LIMITS.LAYOUT_PROOF}× upscale; watermarked; never named candidate, board or review; never delivered to the founder. Its only job is to check placement against real scene geometry.`,
  WIREFRAME_THRESHOLD: 'Above the layout-proof limit, or from a degraded source (preview, thumbnail, proxy, screenshot, unknown): geometry only — flat tonal blocks and type boxes at the canvas size, with the source shown beside it at its native size if needed. Never a photographic composite.',
  BLOCK_CONDITION: 'Before compositing, for each photographic layer: decoded size below the requirement for the intended purpose, upscale above its limit, degraded provenance, or dimensions not verifiable → status BLOCKED_ON_ASSET_QUALITY. Stop. Produce no canvas-size composite, board or zip; report the measured gap and the unblock routes.',
  NO_DEGRADED_ASSET_RULE: 'A degraded asset never advances a stage. Watermarks, labels and disclaimers do not make it acceptable. Each stage verifies its own inputs (decoded size + provenance) instead of trusting the producer. Asked for “the images” while blocked, deliver what exists at native size, labelled — never upscale or composite to make it look like a candidate.',
  REFERENCE_INPUT_RULE: 'A reference attached to a generator (image-to-image) has a short side ≥ 720 px and FULL_RENDER provenance; previews and thumbnails are never references.',
} as const;

export type AssetQualityInput = {
  source_px: { w: number; h: number };
  covers_pt: { w: number; h: number };
  review_scale: number;
  provenance: AssetProvenance;
  purpose: AssetPurpose;
  founder_facing: boolean;
  founder_exception?: { approved: boolean; max_upscale?: number };
};
export type AssetQualityResult = { upscale: number; required_px: { w: number; h: number }; highest_permitted: AssetPurpose; verdict: 'PASS' | 'BLOCK'; reasons: string[] };

const rank = (p: AssetPurpose) => ASSET_PURPOSES.indexOf(p);

/** Pure evaluator of ASSET_QUALITY_GATE for one photographic layer. */
export function assessAssetQuality(a: AssetQualityInput): AssetQualityResult {
  const required_px = { w: Math.round(a.covers_pt.w * a.review_scale), h: Math.round(a.covers_pt.h * a.review_scale) };
  const upscale = Math.round(Math.max(required_px.w / a.source_px.w, required_px.h / a.source_px.h) * 100) / 100;
  const exceptionMax = a.founder_exception?.approved ? Math.max(UPSCALE_LIMITS.FOUNDER_REVIEW_EXCEPTION, a.founder_exception.max_upscale ?? 0) : UPSCALE_LIMITS.FOUNDER_REVIEW_EXCEPTION;
  const degraded = DEGRADED_PROVENANCE.includes(a.provenance);
  const highest_permitted: AssetPurpose = degraded ? 'WIREFRAME_ONLY'
    : upscale <= UPSCALE_LIMITS.AUTHORITY_CANDIDATE ? 'AUTHORITY_CANDIDATE'
      : upscale <= exceptionMax ? 'FOUNDER_REVIEW_EXCEPTION'
        : upscale <= UPSCALE_LIMITS.LAYOUT_PROOF ? 'LAYOUT_PROOF' : 'WIREFRAME_ONLY';
  const reasons: string[] = [];
  if (degraded) reasons.push(`degraded provenance: ${a.provenance}`);
  if (upscale > UPSCALE_LIMITS.AUTHORITY_CANDIDATE) reasons.push(`upscale ${upscale}× (source ${a.source_px.w}×${a.source_px.h} → required ${required_px.w}×${required_px.h})`);
  if (rank(a.purpose) < rank(highest_permitted)) reasons.push(`requested ${a.purpose}; highest permitted ${highest_permitted}`);
  if (a.founder_facing && rank(a.purpose) > rank('FOUNDER_REVIEW_EXCEPTION')) reasons.push(`${a.purpose} is never founder-facing`);
  if (a.purpose === 'FOUNDER_REVIEW_EXCEPTION' && !a.founder_exception?.approved) reasons.push('founder exception not approved before compositing');
  const ok = rank(a.purpose) >= rank(highest_permitted)
    && !(a.founder_facing && rank(a.purpose) > rank('FOUNDER_REVIEW_EXCEPTION'))
    && !(a.purpose === 'FOUNDER_REVIEW_EXCEPTION' && !a.founder_exception?.approved);
  return { upscale, required_px, highest_permitted, verdict: ok ? 'PASS' : 'BLOCK', reasons: ok ? [] : reasons };
}

/** What a run must deliver when it is blocked (any project). */
export const BLOCKED_RUN_PROTOCOL = [
  'PREFLIGHT FIRST: before spending a generation, confirm the route returns a file at the required size into the working environment. If not, stop before generating.',
  'If blocked after generating: set status BLOCKED_ON_<REASON>; claim 0 candidates.',
  'Deliver the block report (measured gap, why, unblock routes with cost and expiry), the render ledger and the prompts.',
  'Optionally attach the previews at their native size, labelled PREVIEW — direction only, not for evaluation.',
  'Do not composite, upscale, board, zip or name anything candidate / review. Internal geometry checks stay internal (WIREFRAME_ONLY).',
  'Code and methodology may be committed and tested on fixtures; they are not visual deliverables.',
] as const;

/** REFERENCE_INPUT_RULE as a check. */
export function meetsReferenceInputRule(px: { w: number; h: number }, provenance: AssetProvenance): boolean {
  return Math.min(px.w, px.h) >= 720 && !DEGRADED_PROVENANCE.includes(provenance);
}
