/**
 * P0.VR.PAGE-CONCEPT-DUAL-RENDER-ENGINE-TEST1
 */

export type PageConceptRenderMode = 'NBP_FULL_SET' | 'DUAL_RENDER_TEST';

export type PageConceptRenderLaneType = 'GPT2_DIRECT' | 'NBP';

export function pageConceptRenderModeFromRequest(input: {
  continueDualRenderTest?: boolean;
  regenerateDualRenderLane?: PageConceptRenderLaneType | null;
  continueNbpAfterGpt2Review?: boolean;
}): PageConceptRenderMode {
  if (input.continueDualRenderTest || input.regenerateDualRenderLane) return 'DUAL_RENDER_TEST';
  return 'NBP_FULL_SET';
}
