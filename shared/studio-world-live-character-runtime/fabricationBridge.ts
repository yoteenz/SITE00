/**
 * Map existing FabricationState → working CharacterAssemblyManifest (draft).
 */
import type { ActorRecord, CharacterRecord, FabricationState } from '../site00-character-fabrication/types.js';
import { CHARACTER_ASSEMBLY_MANIFEST_SCHEMA, type CharacterAssemblyManifest, manifestFingerprint } from './manifest.js';

export function workingAssemblyVersion(state: FabricationState, character: CharacterRecord): string {
  const v = character.version || '0.0';
  const authStation = state.authority.authority;
  const locked = authStation === 'LOCKED' || authStation === 'APPROVED' || state.finalSignedOff;
  return locked ? v : `${v}-draft`;
}

export function buildWorkingAssemblyManifest(
  state: FabricationState,
  actor: ActorRecord,
  character: CharacterRecord,
): CharacterAssemblyManifest {
  const authStation = state.authority.authority;
  const assemblyVersion = workingAssemblyVersion(state, character);
  const manifest: CharacterAssemblyManifest = {
    schema: CHARACTER_ASSEMBLY_MANIFEST_SCHEMA,
    characterId: character.characterId,
    actorId: actor.actorId,
    projectId: state.selectedProjectId,
    entryId: state.selectedEntryId,
    assemblyVersion,
    approvedAuthorityId: authStation === 'LOCKED' ? `auth-${character.characterId}-${assemblyVersion}` : null,
    identityAuthorityId: actor.authorityId,
    bodyAuthorityId: state.selectedBodyVersionId || 'body-draft',
    appearance: {
      hairAuthorityId: state.selectedHairRefId || null,
      makeupAuthorityId: state.selectedMakeupRefId || null,
      skinAuthorityId: null,
    },
    wardrobe: {
      topAuthorityId: state.fitting.L1,
      bottomAuthorityId: state.fitting.L2,
      outerwearAuthorityId: state.fitting.L3,
      footwearAuthorityId: state.fitting.L4,
      accessories: [],
    },
    performance: {
      rigAuthorityId: null,
      idleMotionId: state.selectedMotionId || null,
      walkMotionId: null,
      voiceAuthorityId: null,
      facialProfileId: null,
    },
    behavior: {
      behaviorProfileId: state.selectedBehaviorCompositionId,
    },
    runtime: {
      engine: 'unreal',
      runtimeCharacterId: `runtime-${actor.catalogueNumber.toLowerCase()}-${character.characterId}`,
      assemblyStatus: 'NOT_LOADED',
    },
    authority: {
      approvalState: authStation === 'LOCKED' ? 'LOCKED' : authStation === 'APPROVED' ? 'APPROVED' : 'DRAFT',
      approvedAt: null,
      approvedBy: null,
    },
    lineage: {
      parentAssemblyVersion: null,
      manifestRevision: 1,
    },
  };
  return manifest;
}

export { manifestFingerprint };
