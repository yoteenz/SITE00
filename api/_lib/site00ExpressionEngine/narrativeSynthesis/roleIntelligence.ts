/**
 * C1.0 — Role intelligence for NDX, subject, world, artifact.
 */

import type {
  ArtifactNarrativeRole,
  NarrativeSynthesisInput,
  NdxNarrativeRole,
  RoleIntelligence,
  SubjectNarrativeRole,
  WorldNarrativeFunction,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export function resolveRoleIntelligence(input: NarrativeSynthesisInput): RoleIntelligence {
  const isContradictionDiscovery =
    input.thesis.toLowerCase().includes('cringe') ||
    input.thesis.toLowerCase().includes('nostalgia') ||
    Boolean(input.lockedPremise?.toLowerCase().includes('tacky'));

  const ndxRole: NdxNarrativeRole = isContradictionDiscovery ? 'INVESTIGATOR' : 'OBSERVER';
  const subjectRole: SubjectNarrativeRole = isContradictionDiscovery ? 'PROOF' : 'CASE_STUDY';
  const worldFunction: WorldNarrativeFunction =
    input.worldCandidates[0]?.narrativeFunction ?? (isContradictionDiscovery ? 'EDIT' : 'REVEAL');
  const artifactRole: ArtifactNarrativeRole =
    input.artifactCandidates[0]?.narrativeRole ?? 'EVIDENCE';
  const deviceRole: ArtifactNarrativeRole | null = input.interjectionCandidates.includes('PHONE')
    ? 'PORTAL'
    : null;

  return {
    ndxRole,
    ndxRationale: isContradictionDiscovery
      ? 'NDX investigates cultural contradiction — observer/investigator/receipt-puller, not protagonist.'
      : 'NDX observes and frames argument without becoming the evidence subject.',
    subjectRole,
    subjectRationale: isContradictionDiscovery
      ? 'Subject woman is cultural receipt — same person, same codes, opposite labels across time.'
      : 'Subject carries the case study proof for the argument.',
    worldFunction,
    worldRationale:
      worldFunction === 'EDIT'
        ? 'World edits/reframes/reconstructs cultural memory — not merely aesthetic container.'
        : 'World must reinforce argument, not decorate it.',
    artifactRole,
    artifactRationale:
      artifactRole === 'EVIDENCE' || artifactRole === 'ARCHIVE'
        ? 'Artifact holds measurable proof of the contradiction.'
        : 'Artifact must perform narrative work.',
    deviceRole,
    deviceRationale: deviceRole
      ? 'Phone is archive portal / evidence device / interjection surface — not the world itself.'
      : null,
  };
}

export function validateRoleNarrativeFunction(roles: RoleIntelligence): {
  worldValid: boolean;
  artifactValid: boolean;
  roleConfusion: boolean;
} {
  const worldValid = roles.worldFunction !== undefined && Boolean(roles.worldRationale);
  const artifactValid = roles.artifactRole !== undefined && Boolean(roles.artifactRationale);
  const roleConfusion =
    roles.ndxRole === 'PARTICIPANT' && roles.subjectRole === 'PROTAGONIST' && roles.ndxRationale.includes('investigator');

  return { worldValid, artifactValid, roleConfusion };
}
