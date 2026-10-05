/**
 * SkinContinuityRecord — locked decisions after each approved screen.
 */

import type { SkinContinuityRecord } from './types.js';

const continuityStore = new Map<string, SkinContinuityRecord>();

export function getDefaultContinuityRecord(brandFamilySkinId: string, version: string): SkinContinuityRecord {
  return {
    brandFamilySkinId,
    version,
    lockedDecisions: [
      'MARTIAN_MONO_ONLY',
      'UPPERCASE_UI',
      'HOST_FIREWALL_INTACT',
    ],
    allowedVariation: ['FONT_SIZE', 'FONT_WEIGHT', 'TRACKING', 'LINE_HEIGHT', 'DENSITY', 'SPACING_RHYTHM'],
    moduleSpecificRules: {
      EVOLVE: ['PRESERVE_NDX_SPECIALIZATION', 'PRESERVE_CAMPAIGNS', 'PRESERVE_CONTENT_OPS'],
    },
    prohibitedPatterns: ['COLOR_ONLY_SKIN', 'COPY_PREVIOUS_SCREEN_LAYOUT_LITERAL'],
    founderNotes: null,
    updatedAt: new Date().toISOString(),
  };
}

export function getSkinContinuityRecord(brandFamilySkinId: string, version: string): SkinContinuityRecord {
  const key = `${brandFamilySkinId}@${version}`;
  const existing = continuityStore.get(key);
  if (existing) return existing;
  const record = getDefaultContinuityRecord(brandFamilySkinId, version);
  continuityStore.set(key, record);
  return record;
}

export function updateContinuityAfterApprovedScreen(
  brandFamilySkinId: string,
  version: string,
  lockedDecision: string,
): SkinContinuityRecord {
  const record = getSkinContinuityRecord(brandFamilySkinId, version);
  if (!record.lockedDecisions.includes(lockedDecision)) {
    record.lockedDecisions.push(lockedDecision);
  }
  record.updatedAt = new Date().toISOString();
  continuityStore.set(`${brandFamilySkinId}@${version}`, record);
  return record;
}

export function clearContinuityForTest(): void {
  continuityStore.clear();
}
