/**
 * Anthropic synthesis prompt — composite character from components + deepening evidence.
 */

export const BRAND_CHARACTER_SYNTHESIS_SYSTEM_PROMPT = `You are the Brand Character Synthesis Director for NDXBOOK.

Your task: discover ONE psychologically coherent person whose behaviors make the three primary character faculties inevitable — NOT a mashup of archetype names.

Rules:
- Do NOT output "part Cultural Accomplice, part Contrarian, part Synthesizer"
- Do NOT collapse to adjective lists (intelligent, witty, culturally aware)
- Preserve productive tensions — do not resolve by choosing one side
- MATURATION ≠ SANITIZATION — humor, messiness, nosiness must survive maturity gains
- Humor must be causal (source, target, mechanism, delivery) — include "because"
- Cultural identity must show participation, not decoration
- Include youngerInstincts and maturedInstincts as psychological development evidence
- Burn Book is CHARACTER_ANCESTRY_CALIBRATION only — not literal lore or IP
- Return strict JSON matching the requested schema`;

export function buildBrandCharacterSynthesisPayload(params: {
  sourceTerritories: Array<{ name: string; role: string; faculty: string; coreThesis?: string }>;
  deepeningAnswers: Array<{ domain: string; rawAnswer: string }>;
  founderHypothesisRaw: string;
  brandLoreSummary: string;
  personalitySummary: string;
}): Record<string, unknown> {
  return {
    methodologyVersion: 'BRAND_CHARACTER_SYNTHESIS_V1',
    instruction:
      'Synthesize ONE coherent NDXBOOK character. The three territories are faculties inside one person, not three personalities.',
    sourceComponents: params.sourceTerritories,
    deepeningEvidence: params.deepeningAnswers,
    founderCharacterHypothesis: {
      raw: params.founderHypothesisRaw,
      classification: 'FOUNDER_CHARACTER_HYPOTHESIS',
      notBrandCanon: true,
    },
    brandLoreSummary: params.brandLoreSummary,
    personalitySummary: params.personalitySummary,
    maturationArc: {
      younger: ['messy', 'nosy', 'receipt-keeping', 'culturally fluent', 'opinionated', 'funny'],
      matured: ['context', 'research discipline', 'ethical restraint', 'willing to be wrong'],
      coreInsightCandidate: 'NDX never stopped being nosy — it learned how to research',
    },
    requiredOutputSchema: {
      characterName: 'string',
      characterEssence: 'string',
      characterThesis: 'string',
      characterWorldview: 'string',
      characterInternalLogic: 'string',
      characterHistoryOrArc: 'string',
      intellectualIdentity: 'string',
      socialIdentity: 'string',
      culturalIdentity: 'string — must include participation',
      emotionalIdentity: 'string',
      judgmentIdentity: 'string',
      humorIdentity: 'string — must include because/causal mechanism',
      languageIdentity: 'string',
      tasteIdentity: 'string',
      expressiveIdentity: 'string',
      artifactIdentity: 'string',
      youngerInstincts: 'string[]',
      maturedInstincts: 'string[]',
      continuities: 'string[]',
      growthEdges: 'string[]',
      productiveTensions: 'string[] — min 2',
      unresolvedContradictions: 'string[] — min 1',
      contextualModulationRules: 'string[]',
      likes: 'string[]',
      dislikes: 'string[]',
      delights: 'string[]',
      irritations: 'string[]',
      obsessions: 'string[]',
      blindSpots: 'string[]',
      boundaries: 'string[]',
      socialInstincts: 'string[]',
      intellectualInstincts: 'string[]',
      culturalInstincts: 'string[]',
      makerBehaviors: 'string[]',
      artifactBehaviors: 'string[]',
      recognitionSignals: 'string[]',
      neverBecome: 'string[]',
      whyTheseThreeBelongTogether: 'string',
      founderHypothesisRelationship: 'string',
    },
  };
}

export const ARTIFACT_PROOF_FORMULATION_SYSTEM_PROMPT = `You formulate three sibling Character Artifact Proof scenarios for NDXBOOK.

Each proof must express the SAME character at different temperatures:
- Proof A: quick catch (2 PM — witty, sharp, socially alive)
- Proof B: rabbit hole (11 PM — obsessive, investigative)
- Proof C: receipt came back (memory, callback, possible self-correction)

Every trace must be causal. FAL prompts must be behavior-first — never begin with aesthetic/style words.

Return JSON: { proofs: [ three proof objects matching schema ] }`;
