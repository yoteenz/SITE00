/**
 * Grammar selection intelligence — concept/topic/brand/proof driven (not format-only).
 */

import { brandOverlayFor } from './brandOverlays.js';
import { getNarrativeGrammar } from './grammarLibrary.js';
import type { SelectNarrativeGrammarInput, SelectNarrativeGrammarResult } from './types.js';

function topicSignals(topic: string): { cultural: boolean; forensic: boolean; system: boolean } {
  const t = topic.toLowerCase();
  return {
    cultural: /nostalgia|era|fashion|culture|2016|taste|aesthetic|memory/.test(t),
    forensic: /receipt|archive|evidence|contradiction|investigation/.test(t),
    system: /system|design|workflow|pipeline|product/.test(t),
  };
}

function hasChapter01Grammar(labels: readonly string[] | undefined): boolean {
  if (!labels?.length) return false;
  const set = new Set(labels.map((l) => l.toUpperCase()));
  return set.has('CLAIM') && set.has('RECEIPT') && set.has('CONTRADICTION');
}

export function selectNarrativeGrammar(input: SelectNarrativeGrammarInput): SelectNarrativeGrammarResult {
  const signals = topicSignals(input.topic);
  const overlay = brandOverlayFor(input.brandId);
  const proofRich = input.availableProofTypes.length >= 2;

  if (hasChapter01Grammar(input.chapterArgumentLabels) && signals.cultural) {
    return {
      selectedGrammar: 'CULTURAL_GLITCH',
      confidence: 'HIGH',
      selectionReason:
        'Chapter 01 argument beats plus cultural/temporal subject — cultural glitch primary; investigation alternate.',
      alternateGrammar: 'INVESTIGATION',
    };
  }

  if (hasChapter01Grammar(input.chapterArgumentLabels)) {
    return {
      selectedGrammar: 'CONTRADICTION',
      confidence: 'HIGH',
      selectionReason: 'Canonical Chapter 01 CLAIM→RECEIPT→CONTRADICTION lineage preserved in grammar library.',
      alternateGrammar: 'INVESTIGATION',
    };
  }

  if (signals.cultural && proofRich) {
    return {
      selectedGrammar: 'CULTURAL_GLITCH',
      confidence: 'HIGH',
      selectionReason: 'Cultural subject with multi-type proof — glitch + receipt architecture.',
      alternateGrammar: 'INVESTIGATION',
    };
  }

  if (signals.forensic || input.desiredShift.toLowerCase().includes('evidence')) {
    return {
      selectedGrammar: 'INVESTIGATION',
      confidence: 'MEDIUM',
      selectionReason: 'Forensic/desired-evidence shift favors investigation grammar.',
      alternateGrammar: 'CONTRADICTION',
    };
  }

  if (signals.system || input.brandId.toLowerCase() === 'site00') {
    return {
      selectedGrammar: 'SYSTEM_REVEAL',
      confidence: 'MEDIUM',
      selectionReason: 'System/design subject or SITE 00 brand overlay.',
      alternateGrammar: 'TRANSFORMATION',
    };
  }

  const preferred = overlay?.preferredGrammars[0] ?? 'CONTRADICTION';
  getNarrativeGrammar(preferred);
  return {
    selectedGrammar: preferred,
    confidence: 'MEDIUM',
    selectionReason: `Brand overlay preference for ${input.brandId}.`,
    alternateGrammar: overlay?.preferredGrammars[1] ?? null,
  };
}
