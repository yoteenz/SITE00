/**
 * Brand-specific narrative emphasis — does not replace grammar library.
 */

import type { NarrativeGrammarId } from './types.js';

export type BrandNarrativeOverlay = {
  brandId: string;
  preferredGrammars: readonly NarrativeGrammarId[];
  toneGuards: readonly string[];
  forbiddenPhrasing: readonly string[];
};

export const BRAND_NARRATIVE_OVERLAYS: Record<string, BrandNarrativeOverlay> = {
  ndxbook: {
    brandId: 'ndxbook',
    preferredGrammars: ['CULTURAL_GLITCH', 'INVESTIGATION', 'CONTRADICTION', 'MYTH_BUST'],
    toneGuards: ['Investigative', 'Editorial', 'Receipt-led', 'No generic hype'],
    forbiddenPhrasing: ['game-changer', 'unlock your potential', 'here is the secret'],
  },
  'frontal-slayer': {
    brandId: 'frontal-slayer',
    preferredGrammars: ['TRANSFORMATION', 'DESIRE_GAP_MECHANISM', 'PROCESS_ACCESS', 'BEFORE_AFTER_WITH_CAUSE'],
    toneGuards: ['Confidence', 'Expertise', 'Proof of result'],
    forbiddenPhrasing: ['vague empowerment'],
  },
  site00: {
    brandId: 'site00',
    preferredGrammars: ['SYSTEM_REVEAL', 'TRANSFORMATION', 'BEFORE_AFTER_WITH_CAUSE'],
    toneGuards: ['Design intelligence', 'System clarity'],
    forbiddenPhrasing: ['generic SaaS hook'],
  },
  'astral-world': {
    brandId: 'astral-world',
    preferredGrammars: ['IDENTITY_SHIFT', 'PROCESS_ACCESS', 'TRANSFORMATION'],
    toneGuards: ['Discovery', 'Intimacy', 'Anticipation'],
    forbiddenPhrasing: ['hard sell CTA'],
  },
};

export function brandOverlayFor(brandId: string): BrandNarrativeOverlay | null {
  const key = brandId.trim().toLowerCase();
  return BRAND_NARRATIVE_OVERLAYS[key] ?? null;
}
