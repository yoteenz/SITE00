/**
 * Character Event + Content Thesis production from opportunities — extends P0.5C.
 */

import { randomUUID } from 'node:crypto';
import type { ContentOpportunity, ResearchDepth } from './types.js';
import type { CharacterEventFromOpportunity, ContentThesisFromOpportunity } from './types.js';

export function formulateCharacterEventFromOpportunity(opp: ContentOpportunity): CharacterEventFromOpportunity {
  return {
    id: `mce-ops-${randomUUID().slice(0, 8)}`,
    projectId: opp.projectId,
    characterSystemId: 'from-operations',
    trigger: opp.summary,
    subject: opp.subject,
    context: opp.domains.join('; '),
    initialObservation: opp.summary,
    initialReaction: opp.whyPotentiallyInteresting,
    whyNDXCares: opp.whyPotentiallyInteresting,
    questionsRaised: [],
    contradictionsDetected: [],
    memoriesTriggered: opp.sourceType === 'ARCHIVE_REVISIT' ? ['Prior evidence retrieved'] : [],
    culturalAssociations: opp.domains.filter((d) => d.includes('culture')),
    evidenceNeeded: opp.evidenceNeeded,
    connectionsSuspected: [],
    humorPotential: opp.humorPotential > 0.5 ? 'Possible' : null,
    seriousnessRequirement: null,
    investigationDepth: opp.investigationPotential >= 0.7 ? 'DEEP' : 'SHALLOW',
    provisionalJudgment: null,
    confidence: 'MEDIUM',
    unresolvedQuestions: [],
    possibleBehavioralModes: [],
    status: 'FORMULATED',
    fingerprint: opp.fingerprint,
    opportunityId: opp.id,
    whatNdxSaw: opp.summary,
    whatNdxMightBeWrongAbout: 'Initial take may be incomplete — investigation may revise',
    whatNdxDoesNext: opp.investigationPotential >= 0.7 ? 'Investigate further' : 'React and observe',
  };
}

export function formulateContentThesisFromOpportunity(
  opp: ContentOpportunity,
  characterEventId: string,
  researchDepth: ResearchDepth,
): ContentThesisFromOpportunity {
  const modeMap: Record<string, string> = {
    'subscription normalization': 'mode-02-question',
    'corporate layoff memo language': 'mode-06-translation',
    'late fees across decades': 'mode-09-connection',
    'saved tweet vs current announcement': 'mode-07-receipt',
    'standing desk reconsideration': 'mode-08-self-correction',
    'attention economy pattern': 'mode-05-rabbit-hole',
    'self-checkout time promise': 'mode-04-failed-promise',
  };
  const behavioralModeId = modeMap[opp.subject] ?? 'mode-01-side-eye';

  return {
    id: `mct-ops-${randomUUID().slice(0, 8)}`,
    characterEventId,
    behavioralModeId,
    whatHappened: opp.summary,
    whatNDXNoticed: opp.summary,
    whyItMatters: opp.whyPotentiallyInteresting,
    whatNDXInitiallyThought: opp.whyPotentiallyInteresting,
    whatNDXInvestigated: researchDepth === 'INVESTIGATIVE' ? 'Pattern across sources' : 'Immediate observation',
    whatNDXFound: 'Partial — may remain open',
    whatNDXConnected: '',
    whatNDXRemembered: opp.sourceType === 'ARCHIVE_REVISIT' ? 'Archived evidence' : '',
    whatNDXChangedItsMindAbout: null,
    centralContradiction: null,
    centralQuestion: opp.investigationPotential >= 0.7 ? 'What is really going on here?' : null,
    centralClaim: null,
    confidence: 'MEDIUM',
    evidenceRequirements: opp.evidenceNeeded,
    culturalContext: opp.domains,
    humorOpportunity: null,
    humorDecision: 'NONE',
    seriousnessRequirement: null,
    audienceRelationship: 'Somebody in the room',
    desiredAudienceReaction: 'Recognition',
    artifactImplications: [],
    resolutionState: opp.investigationPotential >= 0.7 ? 'INVESTIGATION_IN_PROGRESS' : 'REACTION_ONLY',
    status: 'FORMULATED',
    evaluation: null,
    opportunityId: opp.id,
    researchDepth,
    claimRecords: [],
  };
}

export function topicAloneInsufficientForCharacterEvent(topicOnly: string): boolean {
  return /^create a post about/i.test(topicOnly) || topicOnly.length < 15;
}

export function characterEventPrecedesPackage(event: CharacterEventFromOpportunity | null): boolean {
  return event !== null && Boolean(event.whatNdxSaw);
}
