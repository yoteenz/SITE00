/**
 * P0.5E.7A — Character-first FAL prompt sections (authority order).
 */

import type { CharacterFirstRegenerationBundle } from './types.js';
import { getPageRoleSemanticContract } from './pageRoleSemantics.js';

export function buildCharacterFirstAuthorityPromptSections(
  bundle: CharacterFirstRegenerationBundle,
  slideNumber: number,
): string[] {
  const pa = bundle.premiseAuthority;
  const hero = bundle.heroSlideAuthority;
  const arc = bundle.thoughtArcSnapshot;
  const slideEntry = bundle.pageRoleMap.entries.find((e) => e.slideNumber === slideNumber);
  const semantics = slideEntry ? getPageRoleSemanticContract(slideEntry.role) : null;
  const knowledgeForSlide =
    arc.knowledgeStateProgression.find((k) => k.slideNumber === slideNumber)?.state ?? 'LEARNS';

  const roleMapLines = bundle.pageRoleMap.entries
    .map((e) => `SLIDE ${String(e.slideNumber).padStart(2, '0')}: ${e.role.replace(/_/g, ' ')} — ${e.spokenCopyHint}`)
    .join('\n');

  return [
    'CHARACTER PREMISE AUTHORITY (PRIMARY — OUTRANKS TOPIC METADATA)',
    `THIS IS NOT A GENERAL EDUCATIONAL POST ABOUT ${pa.topicMetadata.join(' / ').toUpperCase()}.`,
    `THIS PAGE EXISTS BECAUSE NDX EXPERIENCED / NOTICED / QUESTIONED: ${pa.spokenPremise}`,
    `PRESERVE THE FIRST-PERSON CAUSAL ARC. DO NOT OPTIMIZE TOWARD GENERIC INFORMATIVE GRAPHIC.`,
    `SPOKEN PREMISE: ${pa.spokenPremise}`,
    `FIRST REACTION: ${pa.firstReaction}`,
    `INITIAL BELIEF: ${pa.initialBelief}`,
    `INVESTIGATION QUESTION: ${pa.investigationQuestion}`,
    `CURRENT VIEW: ${pa.currentView}`,
    `BEHAVIOR CHANGE: ${pa.behaviorChange}`,
    `BOOK TRACE: ${pa.bookTrace.replace(/_/g, ' ')}`,
    `EXPERIENCE MODE: ${pa.experienceMode.replace(/_/g, ' ')} — do not fabricate personal events beyond seed authority`,
    '',
    'HERO SLIDE AUTHORITY (SLIDE 01 DISTINCT NARRATIVE ANCHOR)',
    `HERO ROLE: ${hero.role.replace(/_/g, ' ')}`,
    `HERO PREMISE LOCK: ${hero.founderLocked.lockHeroPremise ? 'ACTIVE — semantic meaning must survive regeneration' : 'OFF'}`,
    `HERO SPOKEN PREMISE: ${hero.spokenPremise}`,
    `HERO EMOTIONAL FUNCTION: ${hero.emotionalFunction}`,
    `HERO INCITING INCIDENT: ${hero.incitingIncident}`,
    `PROHIBITED SLIDE 01 ROLES: ${hero.prohibitedRoles.join(', ')}`,
    hero.founderLocked.lockHeroCopy ? 'LOCK HERO COPY: preserve exact message/copy' : 'LOCK HERO COPY: off — line wrapping may adjust',
    hero.founderLocked.lockHeroPhoto ? 'LOCK HERO PHOTO: preserve reference photo' : 'LOCK HERO PHOTO: off — new art direction allowed',
    '',
    'NDX KNOWLEDGE STATE (THIS SLIDE)',
    `KNOWLEDGE STATE: ${knowledgeForSlide.replace(/_/g, ' ')}`,
    `BELIEF REVISION: ${arc.beliefRevision.replace(/_/g, ' ')}`,
    '',
    'CHARACTER BEAT',
    `CHARACTER BEAT: ${pa.characterBeat.replace(/_/g, ' ')}`,
    `Must influence reaction, margin annotation, optional NDX photography, caption — not disappear after formulation.`,
    '',
    'THOUGHT ARC SNAPSHOT',
    `BEATS: ${arc.beats.join(' → ')}`,
    `NOTICE: ${arc.notice}`,
    `FIRST REACTION: ${arc.firstReaction}`,
    `INITIAL BELIEF: ${arc.initialBelief}`,
    `QUESTION: ${arc.question}`,
    `INVESTIGATION: ${arc.investigationTrigger}`,
    `REVISION: ${arc.beliefRevision.replace(/_/g, ' ')} — ${arc.currentView}`,
    '',
    'PAGE ROLE MAP (MANDATORY NARRATIVE FUNCTION PER SLIDE)',
    roleMapLines,
    slideEntry
      ? `CURRENT SLIDE ${slideNumber} ROLE: ${slideEntry.role.replace(/_/g, ' ')} — ${slideEntry.spokenCopyHint}`
      : '',
    semantics
      ? `PAGE ROLE SEMANTICS — Purpose: ${semantics.narrativePurpose}. Prohibit: ${semantics.prohibitedBehavior.join('; ')}. Require: ${semantics.requiredBehavior.join('; ')}.`
      : '',
    '',
    'EVIDENCE ROLE',
    `EVIDENCE SUPPORTS THE THOUGHT ARC — NOT A STANDALONE LECTURE.`,
    `Evidence needed: ${arc.evidenceNeeded.join(', ') || 'as investigation requires'}`,
    '',
    'TOPIC METADATA (FACTUAL CONTEXT ONLY — NOT PRIMARY CREATIVE IDEA)',
    `FACTUAL CONTEXT: ${pa.topicMetadata.join(', ')}`,
    `SOURCE / RESEARCH CONTEXT: accuracy, retrieval, classification only — must NOT rewrite hook, premise, or slide progression.`,
    '',
    'AUTHORITY ORDER',
    'CHARACTER_TRUTH → CHARACTER_PREMISE → THOUGHT_ARC → PAGE_ROLE_MAP → EVIDENCE → NOTEBOOK_VISUAL_GRAMMAR → TOPIC_METADATA',
  ].filter(Boolean);
}

export function characterFirstSectionsPrecedeNotebookGrammar(_sections: string[], fullPrompt: string): boolean {
  const charIdx = fullPrompt.indexOf('CHARACTER PREMISE AUTHORITY');
  const notebookIdx = fullPrompt.indexOf('PHYSICAL PAGE OBJECT');
  return charIdx >= 0 && (notebookIdx < 0 || charIdx < notebookIdx);
}

export function topicMetadataCreativeWeightReduced(sections: string[]): boolean {
  const joined = sections.join('\n');
  return (
    joined.includes('TOPIC METADATA (FACTUAL CONTEXT ONLY') &&
    joined.includes('NOT PRIMARY CREATIVE IDEA')
  );
}

export function buildRegenerationAuthorityDiff(
  bundle: CharacterFirstRegenerationBundle,
): import('./types.js').RegenerationAuthorityDiff {
  const topicLabel = bundle.premiseAuthority.topicMetadata[0]?.toUpperCase() ?? '';
  const premise = bundle.premiseAuthority.spokenPremise.toUpperCase();
  return {
    premise: bundle.premiseAuthority.spokenPremise,
    heroRole: bundle.heroSlideAuthority.role,
    characterBeat: bundle.premiseAuthority.characterBeat,
    beliefRevision: bundle.premiseAuthority.beliefRevisionState,
    slideRoles: bundle.pageRoleMap.entries.map((e) => `${String(e.slideNumber).padStart(2, '0')} ${e.role}`),
    topicMetadata: bundle.premiseAuthority.topicMetadata,
    topicMoreProminentThanPremise: topicLabel.length > premise.length && premise.includes(topicLabel) === false,
  };
}
