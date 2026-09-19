/**
 * Character retention evaluations — density, sterility, compression safety, recognition.
 */

import type { AmendedFirstSlideContract } from '../culturalVisualParticipation/types.js';
import type { CharacterRetentionContract, CharacterRetentionEvaluation } from './types.js';

export function evaluateCharacterDensity(params: {
  artifactId: string;
  textDensity: string;
  contract: CharacterRetentionContract;
}): CharacterRetentionEvaluation['characterDensity'] {
  const hasBeat = Boolean(params.contract.primaryCharacterBeat.text || params.contract.primaryCharacterBeat.visualPunchline);
  const hasMisbehavior = params.contract.controlledMisbehavior.length > 0;
  let characterDensity: CharacterRetentionEvaluation['characterDensity']['characterDensity'] = 'LOW';
  if (hasBeat && hasMisbehavior) characterDensity = 'STRONG';
  else if (hasBeat) characterDensity = 'SUFFICIENT';
  else characterDensity = 'ABSENT';

  return {
    evaluationId: `cd-${params.artifactId}`,
    artifactId: params.artifactId,
    textDensity: params.textDensity,
    characterDensity,
    independent: true,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateCompressionCharacterSafety(params: {
  artifactId: string;
  contract: CharacterRetentionContract;
  v21Contract: AmendedFirstSlideContract;
}): CharacterRetentionEvaluation['compressionSafety'] {
  const lostTrace = !params.v21Contract.primaryTrace && !params.contract.primaryCharacterBeat.text;
  const failureStates: CharacterRetentionEvaluation['failureStates'] = [];
  let result: CharacterRetentionEvaluation['compressionSafety']['result'] = 'SAFE';

  if (lostTrace && params.contract.humorEligibility !== 'INAPPROPRIATE') {
    result = 'CHARACTER_REDUCED';
    failureStates.push('FAIL_CHARACTER_LOST_DURING_COMPRESSION');
  }
  if (params.contract.characterSignalsLost.length > 2) {
    result = 'CHARACTER_CRITICAL_LOSS';
    failureStates.push('FAIL_CHARACTER_LOST_DURING_COMPRESSION');
  }

  return {
    evaluationId: `ccs-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    funniestPartRemoved: params.contract.punchlineDisposition === 'REMOVE_WITH_JUSTIFICATION',
    humanPartRemoved: lostTrace,
    culturalShorthandRemoved: false,
    reactionRemoved: !params.contract.primaryCharacterBeat.text,
    judgmentRemoved: !params.contract.judgmentRequired,
    becameGeneric: result !== 'SAFE',
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluatePunchlinePreservation(params: {
  artifactId: string;
  contract: CharacterRetentionContract;
  sourcePunchline: string | null;
}): CharacterRetentionEvaluation['punchlinePreservation'] {
  const silentlyRemoved =
    Boolean(params.sourcePunchline) &&
    params.contract.punchlineDisposition === 'REMOVE_WITH_JUSTIFICATION' &&
    !params.contract.primaryCharacterBeat.text;

  return {
    evaluationId: `pp-${params.artifactId}`,
    artifactId: params.artifactId,
    sourcePunchline: params.sourcePunchline,
    disposition: params.contract.punchlineDisposition,
    justification: silentlyRemoved ? 'Requires explicit justification' : null,
    silentlyRemoved,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateHeadlineCharacter(params: {
  artifactId: string;
  headline: string;
}): CharacterRetentionEvaluation['headlineCharacter'] {
  const upper = params.headline.toUpperCase();
  const generic =
    upper.includes('THE FUTURE OF') || upper.includes('INSIGHTS') || upper.includes('LEARN HOW');
  const corporate = upper.includes('OPTIMIZE') || upper.includes('SOLUTION');
  let result: CharacterRetentionEvaluation['headlineCharacter']['result'] = 'NDX_PRESENT';
  if (generic) result = 'GENERIC_EDITORIAL';
  if (corporate) result = 'CORPORATE';
  if (params.headline.includes('?') && !generic) result = 'NDX_STRONG';

  return {
    evaluationId: `hc-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    genericEditorialRisk: generic,
    corporateRisk: corporate,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateArtifactSterility(params: {
  artifactId: string;
  contract: CharacterRetentionContract;
}): CharacterRetentionEvaluation['sterility'] {
  const failureStates: CharacterRetentionEvaluation['failureStates'] = [];
  let level: CharacterRetentionEvaluation['sterility']['level'] = 'ALIVE';

  if (!params.contract.primaryCharacterBeat.text && params.contract.controlledMisbehavior.length === 0) {
    level = 'STERILE';
    failureStates.push('FAIL_STERILE_ARTIFACT');
  } else if (params.contract.controlledMisbehavior.length === 0 && params.contract.humanTraceStrength === 'NONE') {
    level = 'COOLING';
  }

  if (params.contract.humorEligibility === 'INAPPROPRIATE' && level === 'STERILE') {
    level = 'CONTROLLED';
  }

  return {
    evaluationId: `st-${params.artifactId}`,
    artifactId: params.artifactId,
    level,
    failureStates,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateClarityVsSterility(params: {
  artifactId: string;
  sterility: CharacterRetentionEvaluation['sterility']['level'];
  hasCharacter: boolean;
}): CharacterRetentionEvaluation['clarityVsSterility'] {
  let result: CharacterRetentionEvaluation['clarityVsSterility']['result'] = 'CLEAR_AND_ALIVE';
  if (params.sterility === 'STERILE' || params.sterility === 'CORPORATE') {
    result = 'CLEAR_BUT_STERILE';
  } else if (params.sterility === 'COOLING') {
    result = 'CLEAR_BUT_COOL';
  } else if (!params.hasCharacter) {
    result = 'CLEAR_BUT_STERILE';
  }

  return {
    evaluationId: `cvs-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateLogoRemovalCharacter(params: {
  artifactId: string;
  contract: CharacterRetentionContract;
  headline: string;
}): CharacterRetentionEvaluation['logoRemovalCharacter'] {
  const strongHeadline = params.headline.includes('?') || Boolean(params.contract.primaryCharacterBeat.text);
  const result = strongHeadline ? 'STRONG' : params.contract.judgmentRequired ? 'SUFFICIENT' : 'WEAK';

  return {
    evaluationId: `lrc-${params.artifactId}`,
    artifactId: params.artifactId,
    result,
    dependsOnLime: false,
    dependsOnLogo: false,
    dependsOnBrandName: false,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateMisbehaviorBudget(contract: CharacterRetentionContract): CharacterRetentionEvaluation['misbehaviorBudget'] {
  const count = contract.controlledMisbehavior.length;
  if (count === 0 && contract.humanTraceStrength === 'STRONG') return 'TOO_CLEAN';
  if (count > 2) return 'TOO_CHAOTIC';
  if (count >= 1) return 'SUFFICIENT';
  return contract.humorEligibility === 'INAPPROPRIATE' ? 'NONE_NEEDED' : 'TOO_CLEAN';
}

export function evaluateImageCarriesCharacter(v21Contract: AmendedFirstSlideContract): CharacterRetentionEvaluation['imageCarriesCharacter'] {
  const cp = v21Contract.culturalParticipation;
  if (cp.visualSubjectMatterDecision.imageHero && cp.visualAppetiteEvaluation.overall === 'STRONG') {
    return 'YES_STRONGLY';
  }
  if (cp.visualSubjectMatterDecision.imageHero) return 'YES_PARTIALLY';
  return 'NO';
}

export function buildCharacterRetentionEvaluation(params: {
  artifactId: string;
  textDensity: string;
  contract: CharacterRetentionContract;
  v21Contract: AmendedFirstSlideContract;
  sourcePunchline: string | null;
}): CharacterRetentionEvaluation {
  const characterDensity = evaluateCharacterDensity({
    artifactId: params.artifactId,
    textDensity: params.textDensity,
    contract: params.contract,
  });
  const compressionSafety = evaluateCompressionCharacterSafety({
    artifactId: params.artifactId,
    contract: params.contract,
    v21Contract: params.v21Contract,
  });
  const punchlinePreservation = evaluatePunchlinePreservation({
    artifactId: params.artifactId,
    contract: params.contract,
    sourcePunchline: params.sourcePunchline,
  });
  const headlineCharacter = evaluateHeadlineCharacter({
    artifactId: params.artifactId,
    headline: params.v21Contract.primaryHook,
  });
  const sterility = evaluateArtifactSterility({ artifactId: params.artifactId, contract: params.contract });
  const clarityVsSterility = evaluateClarityVsSterility({
    artifactId: params.artifactId,
    sterility: sterility.level,
    hasCharacter: Boolean(params.contract.primaryCharacterBeat.text),
  });
  const logoRemovalCharacter = evaluateLogoRemovalCharacter({
    artifactId: params.artifactId,
    contract: params.contract,
    headline: params.v21Contract.primaryHook,
  });
  const misbehaviorBudget = evaluateMisbehaviorBudget(params.contract);
  const imageCarriesCharacter = evaluateImageCarriesCharacter(params.v21Contract);

  const failureStates = [
    ...compressionSafety.failureStates,
    ...sterility.failureStates,
    ...punchlinePreservation.silentlyRemoved ? (['FAIL_PUNCHLINE_REMOVED'] as const) : [],
    ...headlineCharacter.result === 'GENERIC_EDITORIAL' ? (['FAIL_GENERIC_EDITORIAL_AFTER_COMPRESSION'] as const) : [],
    ...clarityVsSterility.result === 'CLEAR_BUT_STERILE' ? (['FAIL_CLEAR_BUT_STERILE'] as const) : [],
    ...characterDensity.characterDensity === 'ABSENT' ? (['FAIL_CHARACTER_DENSITY_ABSENT'] as const) : [],
    ...misbehaviorBudget === 'TOO_CHAOTIC' ? (['FAIL_TOO_MUCH_MISBEHAVIOR'] as const) : [],
  ];

  const passesApprovalGate =
    characterDensity.characterDensity !== 'ABSENT' &&
    sterility.level !== 'STERILE' &&
    sterility.level !== 'CORPORATE' &&
    logoRemovalCharacter.result !== 'FAIL' &&
    logoRemovalCharacter.result !== 'WEAK' &&
    !punchlinePreservation.silentlyRemoved &&
    compressionSafety.result !== 'CHARACTER_CRITICAL_LOSS';

  return {
    evaluationId: `cre-${params.artifactId}`,
    artifactId: params.artifactId,
    characterDensity,
    compressionSafety,
    punchlinePreservation,
    headlineCharacter,
    sterility,
    clarityVsSterility,
    logoRemovalCharacter,
    misbehaviorBudget,
    imageCarriesCharacter,
    passesApprovalGate,
    failureStates: [...new Set(failureStates)],
    evaluatedAt: new Date().toISOString(),
  };
}

export function characterLossAfterCompressionFails(evaluation: CharacterRetentionEvaluation): boolean {
  return evaluation.compressionSafety.result === 'CHARACTER_CRITICAL_LOSS';
}

export function clearButSterileDistinctFromClearAndAlive(): boolean {
  const sterile = evaluateClarityVsSterility({
    artifactId: 'distinction-test',
    sterility: 'STERILE',
    hasCharacter: false,
  });
  const alive = evaluateClarityVsSterility({
    artifactId: 'distinction-test',
    sterility: 'ALIVE',
    hasCharacter: true,
  });
  return sterile.result === 'CLEAR_BUT_STERILE' && alive.result === 'CLEAR_AND_ALIVE';
}

export function pettinessCannotPunchDown(level: string): boolean {
  return level !== 'TOO_FAR';
}

export function genericWitInsufficient(mechanism: string | null): boolean {
  return mechanism !== 'GENERIC_SNARK';
}
