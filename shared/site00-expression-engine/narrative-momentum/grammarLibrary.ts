/**
 * Narrative grammar library — structures, not creative territories.
 */

import type { NarrativeGrammar, NarrativeGrammarId } from './types.js';

function beats(
  rows: Array<{ id: string; label: string; purpose: string; fn: import('./types.js').ShotFunction }>,
): NarrativeGrammar['beatSequence'] {
  return rows.map((r) => ({
    beatId: r.id,
    label: r.label,
    purpose: r.purpose,
    defaultShotFunction: r.fn,
  }));
}

export const NARRATIVE_GRAMMAR_LIBRARY: Record<NarrativeGrammarId, NarrativeGrammar> = {
  TRANSFORMATION: {
    grammarId: 'TRANSFORMATION',
    label: 'Transformation',
    beatSequence: beats([
      { id: 'desire', label: 'DESIRE', purpose: 'Name what the audience wants', fn: 'ESTABLISH' },
      { id: 'gap', label: 'GAP', purpose: 'Show missing system', fn: 'DISRUPT' },
      { id: 'proof', label: 'PROOF', purpose: 'Evidence the gap is real', fn: 'PROVE' },
      { id: 'mechanism', label: 'MECHANISM', purpose: 'How change happens', fn: 'REVEAL' },
      { id: 'transformation', label: 'TRANSFORMATION', purpose: 'Shift lands', fn: 'TRANSFORM' },
      { id: 'open_loop', label: 'OPEN LOOP', purpose: 'Next desire', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Result hunger without system', 'Product / method stories'],
  },
  INVESTIGATION: {
    grammarId: 'INVESTIGATION',
    label: 'Investigation',
    beatSequence: beats([
      { id: 'anomaly', label: 'ANOMALY', purpose: 'Something does not fit', fn: 'DISRUPT' },
      { id: 'receipt', label: 'RECEIPT', purpose: 'Document the anomaly', fn: 'PROVE' },
      { id: 'pattern', label: 'PATTERN', purpose: 'Repeat signal', fn: 'ESCALATE' },
      { id: 'contradiction', label: 'CONTRADICTION', purpose: 'Break prior model', fn: 'CONTRADICT' },
      { id: 'diagnosis', label: 'DIAGNOSIS', purpose: 'Name mechanism', fn: 'REVEAL' },
      { id: 'revelation', label: 'REVELATION', purpose: 'Answer partial', fn: 'REFRAME' },
      { id: 'unresolved', label: 'UNRESOLVED QUESTION', purpose: 'Honest remainder', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Forensic / evidence-led NDX entries'],
  },
  CULTURAL_GLITCH: {
    grammarId: 'CULTURAL_GLITCH',
    label: 'Cultural Glitch',
    beatSequence: beats([
      { id: 'familiar', label: 'FAMILIAR SCENE', purpose: 'Shared present belief', fn: 'ESTABLISH' },
      { id: 'glitch', label: 'GLITCH', purpose: 'Temporal/cultural rupture', fn: 'DISRUPT' },
      { id: 'receipt', label: 'RECEIPT', purpose: 'Archive proves past label', fn: 'PROVE' },
      { id: 'contradiction', label: 'CONTRADICTION', purpose: 'Same object, new story', fn: 'CONTRADICT' },
      { id: 'lens', label: 'NDX LENS', purpose: 'Editorial reframe', fn: 'REFRAME' },
      { id: 'recontext', label: 'RECONTEXTUALIZATION', purpose: 'Memory edit named', fn: 'TRANSFORM' },
      { id: 'open_loop', label: 'OPEN LOOP', purpose: 'Cultural question remains', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Past/present taste collision', 'Nostalgia revision stories'],
  },
  MYTH_BUST: {
    grammarId: 'MYTH_BUST',
    label: 'Myth Bust',
    beatSequence: beats([
      { id: 'belief', label: 'BELIEF', purpose: 'State myth', fn: 'ESTABLISH' },
      { id: 'evidence', label: 'CONTRADICTORY EVIDENCE', purpose: 'Break myth', fn: 'PROVE' },
      { id: 'persistence', label: 'WHY BELIEF PERSISTS', purpose: 'Mechanism of myth', fn: 'ESCALATE' },
      { id: 'mechanism', label: 'MECHANISM', purpose: 'Correct model', fn: 'REVEAL' },
      { id: 'model', label: 'CORRECTED MODEL', purpose: 'New map', fn: 'REFRAME' },
      { id: 'consequence', label: 'CONSEQUENCE', purpose: 'So what', fn: 'TRANSFORM' },
      { id: 'next_q', label: 'NEXT QUESTION', purpose: 'Open loop', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Correcting popular narratives'],
  },
  PROCESS_ACCESS: {
    grammarId: 'PROCESS_ACCESS',
    label: 'Process Access',
    beatSequence: beats([
      { id: 'result', label: 'RESULT', purpose: 'Show outcome', fn: 'ESTABLISH' },
      { id: 'how', label: 'HOW?', purpose: 'Question mechanism', fn: 'DISRUPT' },
      { id: 'hidden', label: 'HIDDEN PROCESS', purpose: 'Reveal work', fn: 'REVEAL' },
      { id: 'friction', label: 'FRICTION', purpose: 'Cost of process', fn: 'ESCALATE' },
      { id: 'system', label: 'SYSTEM', purpose: 'Repeatable method', fn: 'PROVE' },
      { id: 'payoff', label: 'PAYOFF', purpose: 'Earned result', fn: 'TRANSFORM' },
      { id: 'access', label: 'NEXT ACCESS POINT', purpose: 'Open loop', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Behind-the-scenes credibility'],
  },
  IDENTITY_SHIFT: {
    grammarId: 'IDENTITY_SHIFT',
    label: 'Identity Shift',
    beatSequence: beats([
      { id: 'recognition', label: 'RECOGNITION', purpose: 'Self-mirror', fn: 'ESTABLISH' },
      { id: 'discomfort', label: 'DISCOMFORT', purpose: 'Tension named', fn: 'DISRUPT' },
      { id: 'evidence', label: 'EVIDENCE', purpose: 'Proof pattern', fn: 'PROVE' },
      { id: 'naming', label: 'NAMING', purpose: 'Label experience', fn: 'REVEAL' },
      { id: 'reframe', label: 'REFRAME', purpose: 'Identity shift', fn: 'REFRAME' },
      { id: 'shift', label: 'IDENTITY SHIFT', purpose: 'New self-story', fn: 'TRANSFORM' },
      { id: 'invitation', label: 'INVITATION', purpose: 'Open loop', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Personal archive / recognition stories'],
  },
  SYSTEM_REVEAL: {
    grammarId: 'SYSTEM_REVEAL',
    label: 'System Reveal',
    beatSequence: beats([
      { id: 'visible', label: 'VISIBLE RESULT', purpose: 'Surface outcome', fn: 'ESTABLISH' },
      { id: 'complexity', label: 'INVISIBLE COMPLEXITY', purpose: 'Hidden layers', fn: 'DISRUPT' },
      { id: 'failure', label: 'FAILURE OF CURRENT METHOD', purpose: 'Break naive fix', fn: 'CONTRADICT' },
      { id: 'map', label: 'SYSTEM MAP', purpose: 'Show structure', fn: 'REVEAL' },
      { id: 'why', label: 'WHY SYSTEM WORKS', purpose: 'Mechanism', fn: 'PROVE' },
      { id: 'transform', label: 'TRANSFORMATION', purpose: 'New understanding', fn: 'TRANSFORM' },
      { id: 'next', label: 'NEXT SYSTEM QUESTION', purpose: 'Open loop', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['SITE 00 / design intelligence', 'Complex product systems'],
  },
  CONTRADICTION: {
    grammarId: 'CONTRADICTION',
    label: 'Contradiction (Chapter 01 lineage)',
    legacyNdxChapter01: true,
    beatSequence: beats([
      { id: 'claim', label: 'CLAIM', purpose: 'Present belief', fn: 'ESTABLISH' },
      { id: 'receipt', label: 'RECEIPT', purpose: 'Evidence on record', fn: 'PROVE' },
      { id: 'contradiction', label: 'CONTRADICTION', purpose: 'Break claim', fn: 'CONTRADICT' },
      { id: 'lens', label: 'LENS', purpose: 'Editorial frame', fn: 'REFRAME' },
      { id: 'interjection', label: 'INTERJECTION', purpose: 'Quotable cut', fn: 'DISRUPT' },
      { id: 'synthesis', label: 'SYNTHESIS', purpose: 'New model', fn: 'TRANSFORM' },
      { id: 'residual', label: 'RESIDUAL TENSION', purpose: 'Open loop', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Canonical NDXBOOK Chapter 01 argument grammar'],
  },
  BEFORE_AFTER_WITH_CAUSE: {
    grammarId: 'BEFORE_AFTER_WITH_CAUSE',
    label: 'Before / After With Cause',
    beatSequence: beats([
      { id: 'before', label: 'BEFORE', purpose: 'Prior state', fn: 'ESTABLISH' },
      { id: 'after', label: 'AFTER', purpose: 'Changed state', fn: 'DISRUPT' },
      { id: 'cause', label: 'CAUSE', purpose: 'Mechanism link', fn: 'REVEAL' },
      { id: 'proof', label: 'PROOF', purpose: 'Validate cause', fn: 'PROVE' },
      { id: 'implication', label: 'IMPLICATION', purpose: 'So what', fn: 'TRANSFORM' },
      { id: 'open', label: 'OPEN LOOP', purpose: 'Next case', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Clear causal marketing when earned'],
  },
  DESIRE_GAP_MECHANISM: {
    grammarId: 'DESIRE_GAP_MECHANISM',
    label: 'Desire Gap Mechanism',
    beatSequence: beats([
      { id: 'desire', label: 'DESIRE', purpose: 'Want stated', fn: 'ESTABLISH' },
      { id: 'gap', label: 'GAP', purpose: 'Block named', fn: 'DISRUPT' },
      { id: 'mechanism', label: 'MECHANISM', purpose: 'Bridge logic', fn: 'REVEAL' },
      { id: 'proof', label: 'PROOF', purpose: 'Evidence bridge works', fn: 'PROVE' },
      { id: 'payoff', label: 'PAYOFF', purpose: 'Desire advanced', fn: 'TRANSFORM' },
      { id: 'open', label: 'OPEN LOOP', purpose: 'Next gap', fn: 'OPEN_LOOP' },
    ]),
    bestFor: ['Frontal Slayer transformation arcs'],
  },
};

export function getNarrativeGrammar(id: NarrativeGrammarId): NarrativeGrammar {
  return NARRATIVE_GRAMMAR_LIBRARY[id];
}

export function listNarrativeGrammars(): readonly NarrativeGrammar[] {
  return Object.values(NARRATIVE_GRAMMAR_LIBRARY);
}
