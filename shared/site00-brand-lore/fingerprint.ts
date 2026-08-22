/**
 * Brand Lore fingerprint — a stable, deterministic signature of "what intelligence produced this
 * Creative Direction formation." Used to detect when a founder's calibration answers have changed
 * since the three directions were formed, so stale pre-calibration proposals can be labeled
 * truthfully instead of silently presented as current (see Section IV/V of the Core Direction
 * Reformation sprint spec).
 *
 * Deliberately built from raw answers + every synthesized BrandLoreField value (not just
 * profileVersion) — profileVersion increments on every save even when a save is a no-op resync,
 * so it is not a trustworthy "did the founder's actual answers change" signal on its own.
 */

import { LORE_FIELD_KEYS } from './loreSynthesis.js';
import type { BrandLoreField, BrandLoreProfile } from './types.js';

/** FNV-1a 32-bit — fast, dependency-free, stable across Node/browser. Not cryptographic; this is
 * a change-detection signature, not a security boundary. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computeBrandLoreFingerprint(profile: Pick<BrandLoreProfile, 'rawLoreAnswers' | 'contextClassification'> & Partial<BrandLoreProfile>): string {
  const fieldValues = LORE_FIELD_KEYS.map((key) => {
    const field = (profile as Record<string, unknown>)[key] as BrandLoreField | undefined;
    return [key, field?.value ?? null];
  });
  const payload = JSON.stringify({
    rawLoreAnswers: profile.rawLoreAnswers ?? {},
    contextClassification: profile.contextClassification ?? null,
    fields: fieldValues,
  });
  return fnv1a(payload);
}
