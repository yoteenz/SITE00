import type { CompileNarrativeMomentumInput, NarrativeEvidenceObject, NarrativeInterpretation, ProofObject } from './types.js';

const INTERPRETIVE_PROCESS_CLAIMS = [
  /memory is edited/i,
  /culture rewrites taste/i,
  /audience changed, not the object/i,
];

export function isInterpretiveClaim(text: string): boolean {
  return INTERPRETIVE_PROCESS_CLAIMS.some((re) => re.test(text));
}

export function buildEntry002Evidence(input: CompileNarrativeMomentumInput): {
  evidence: NarrativeEvidenceObject[];
  interpretations: NarrativeInterpretation[];
} {
  const m = input.chapterMapping;
  if (!m) return { evidence: [], interpretations: [] };

  const evidence: NarrativeEvidenceObject[] = [
    {
      id: 'ev-archival-language',
      proofType: 'ARCHIVAL_PROOF',
      sourceType: 'PLATFORM_TONE',
      sourceReference: 'Real-time cultural descriptions (comments, press, platform tone) — founder archive required',
      whatIsObserved: m.receipt,
      whatItSupports: 'Present nostalgia collides with how the same era was described live',
      strength: 'PRIMARY',
      placement: {
        beatId: 'receipt',
        whyNow: 'After familiar scene — audience needs receipts before contradiction lands',
        beliefBefore: m.claim,
        beliefAfter: 'Past ridicule was real and documented',
      },
      status: 'SOURCE_REQUIRED',
    },
    {
      id: 'ev-temporal-comparison',
      proofType: 'COMPARATIVE_PROOF',
      sourceType: 'THEN_NOW_COMPARISON',
      sourceReference: 'Same visual codes — then vs now labeling (approved authority assets)',
      whatIsObserved: m.contradiction,
      whatItSupports: 'Object continuity vs label flip',
      strength: 'PRIMARY',
      placement: {
        beatId: 'contradiction',
        whyNow: 'Receipts loaded — compare what stayed vs what language changed',
        beliefBefore: m.receipt,
        beliefAfter: 'Visual codes did not change; cultural label did',
      },
      status: 'DERIVED_COMPARISON',
    },
    {
      id: 'ev-edit-suite-metaphor',
      proofType: 'VISUAL_PROOF',
      sourceType: 'EDITORIAL_METAPHOR',
      sourceReference: input.creativeTerritoryLabel,
      whatIsObserved: 'Physical edit suite / timeline / splice metaphor in approved cover world',
      whatItSupports: 'Atmospheric texture for memory-as-edit metaphor — not evidentiary claim',
      strength: 'ATMOSPHERIC',
      placement: {
        beatId: 'recontext',
        whyNow: 'After lens — visual metaphor supports synthesis without replacing proof',
        beliefBefore: m.lens,
        beliefAfter: 'Mechanism feels tangible',
      },
      status: 'SOURCE_AVAILABLE',
    },
  ];

  const interpretations: NarrativeInterpretation[] = [
    {
      id: 'interp-ndx-lens',
      claim: m.lens,
      derivedFromEvidenceIds: ['ev-archival-language', 'ev-temporal-comparison'],
      lens: 'NDXBOOK investigative editorial',
      confidence: 'HIGH',
      role: 'NDX_LENS',
    },
    {
      id: 'interp-memory-edit',
      claim: m.synthesis,
      derivedFromEvidenceIds: ['ev-archival-language', 'ev-temporal-comparison'],
      lens: 'Cultural revision / memory edit',
      confidence: 'HIGH',
      role: 'SYNTHESIS',
    },
    {
      id: 'interp-interjection',
      claim: m.interjection,
      derivedFromEvidenceIds: ['ev-temporal-comparison'],
      lens: 'Quotable editorial punch',
      confidence: 'MEDIUM',
      role: 'EDITORIAL',
    },
  ];

  return { evidence, interpretations };
}

export function evidenceToLegacyProofObjects(evidence: readonly NarrativeEvidenceObject[]): ProofObject[] {
  return evidence.map((e) => ({
    proofId: e.id,
    proofType: e.proofType,
    source: e.sourceReference,
    whatItProves: e.whatIsObserved,
    whenAudienceNeedsIt: e.placement.whyNow,
    bestPlacement: e.placement.beatId,
    visualForm: e.sourceType,
    strength: e.strength,
    riskOfOverexplaining: e.strength === 'ATMOSPHERIC' ? 'HIGH' : 'MEDIUM',
  }));
}

export function assertNoInterpretationClassifiedAsEvidence(evidence: readonly NarrativeEvidenceObject[]): void {
  for (const e of evidence) {
    if (e.proofType === 'PROCESS_PROOF' && isInterpretiveClaim(e.whatIsObserved)) {
      throw new Error(`EVIDENCE_CONTAINS_INTERPRETATION:${e.id}`);
    }
    if (isInterpretiveClaim(e.whatIsObserved) && e.strength === 'PRIMARY') {
      throw new Error(`PRIMARY_EVIDENCE_IS_INTERPRETATION:${e.id}`);
    }
  }
}
