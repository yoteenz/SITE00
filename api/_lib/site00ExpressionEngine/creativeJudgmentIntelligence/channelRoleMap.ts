/**
 * ChannelRoleMap + resize-only detection.
 */

import type {
  ChannelRoleMap,
  ChannelRoleEntry,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

const DEFAULT_ROLES: Record<string, { role: string; narrativeJob: string }> = {
  REEL: { role: 'HOOK / WORLD ENTRY', narrativeJob: 'Open threshold — discover complicity' },
  CAROUSEL: { role: 'ARGUMENT / EVIDENCE', narrativeJob: 'Receipt ladder — prove mechanism' },
  STORY: { role: 'PARTICIPATION / INTIMACY', narrativeJob: 'Interactive confession beat' },
  EMAIL: { role: 'PERSUASION / CONTEXT / CONVERSION', narrativeJob: 'Translate reveal to action' },
  LANDING: { role: 'SYNTHESIS / ACTION', narrativeJob: 'Campaign thesis + CTA' },
  SAVEABLE: { role: 'TAXONOMY / REFERENCE', narrativeJob: 'Compressed reference artifact' },
};

export function buildDefaultChannelRoleMap(campaignId: string, formats: string[] = ['REEL', 'CAROUSEL', 'STORY', 'EMAIL']): ChannelRoleMap {
  const entries: ChannelRoleEntry[] = formats.map((format) => {
    const spec = DEFAULT_ROLES[format] ?? { role: 'DISTINCT CHANNEL JOB REQUIRED', narrativeJob: 'Must not duplicate other channels' };
    return {
      channelId: `${campaignId}-${format.toLowerCase()}`,
      format,
      role: spec.role,
      narrativeJob: spec.narrativeJob,
      mustNotDuplicate: formats.filter((f) => f !== format),
    };
  });
  const roles = entries.map((e) => e.role);
  const allRolesDistinct = new Set(roles).size === roles.length;
  return {
    campaignId,
    entries,
    resizeOnlyRisk: false,
    allRolesDistinct,
  };
}

export function detectResizeOnlyThinking(map: ChannelRoleMap, copyHashes: string[]): ChannelRoleMap {
  const uniqueCopy = new Set(copyHashes);
  const sameCopy = uniqueCopy.size === 1 && copyHashes.length > 1;
  const sameRole = !map.allRolesDistinct;
  const resizeOnly = sameCopy || sameRole;
  return { ...map, resizeOnlyRisk: resizeOnly };
}
