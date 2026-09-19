/**
 * P0.VR.5 — Replacement slot mapping for multi-asset bind flows.
 */

import type { AssetJob, DetectedAssetCandidate, ReplacementMapping, ReplacementSlot } from './types.js';

export function buildReplacementMappingFromJob(job: AssetJob): ReplacementMapping | null {
  if (!job.replacementMapping) return null;
  const confirmed = job.detectedRegions
    .filter((r) => r.founderDecision === 'CONFIRMED')
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const slots = job.replacementMapping.replacementSlots.slice(0, confirmed.length);
  while (slots.length < confirmed.length) {
    slots.push({
      slotId: `slot-${slots.length + 1}`,
      slotName: `TARGET SLOT ${slots.length + 1}`,
      route: job.route,
      componentPath: null,
      assetSlot: `slot-${slots.length + 1}`,
      orderIndex: slots.length,
      currentAssetUrl: null,
    });
  }

  const sourceOrderToTargetOrder: Record<number, string> = {};
  confirmed.forEach((candidate, index) => {
    const slot = slots[index];
    if (slot) {
      sourceOrderToTargetOrder[candidate.orderIndex] = slot.slotId;
      candidate.replacementTarget = slot.slotId;
    }
  });

  return {
    ...job.replacementMapping,
    replacementSlots: slots,
    sourceOrderToTargetOrder,
  };
}

export function mapCandidateToSlot(
  candidate: DetectedAssetCandidate,
  mapping: ReplacementMapping,
): ReplacementSlot | null {
  const slotId = mapping.sourceOrderToTargetOrder[candidate.orderIndex] ?? candidate.replacementTarget;
  if (!slotId) return null;
  return mapping.replacementSlots.find((s) => s.slotId === slotId) ?? null;
}

export function replacementTargetsForJob(job: AssetJob): Array<{ candidateId: string; slot: ReplacementSlot | null }> {
  const mapping = buildReplacementMappingFromJob(job);
  if (!mapping) return [];
  return job.detectedRegions
    .filter((r) => r.founderDecision === 'CONFIRMED')
    .map((candidate) => ({
      candidateId: candidate.candidateId,
      slot: mapCandidateToSlot(candidate, mapping),
    }));
}

export function validateReplacementReadiness(job: AssetJob): { ready: boolean; blocker?: string } {
  if (!job.replacementMapping || job.replacementMapping.slotMatchingMode === 'NONE') {
    return { ready: true };
  }
  const mapping = buildReplacementMappingFromJob(job);
  if (!mapping) return { ready: false, blocker: 'REPLACEMENT_MAPPING_MISSING' };
  const confirmed = job.detectedRegions.filter((r) => r.founderDecision === 'CONFIRMED');
  if (mapping.replacementSlots.length < confirmed.length) {
    return { ready: false, blocker: 'INSUFFICIENT_REPLACEMENT_SLOTS' };
  }
  return { ready: true };
}
