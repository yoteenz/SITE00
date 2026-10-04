import { describe, expect, it } from 'vitest';
import { initialFabricationState } from '../shared/site00-character-fabrication/reducer.js';
import { findFabricationActor, buildFabricationCharacter } from '../shared/site00-character-fabrication/actors.js';
import {
  assertWorkingDraft,
  buildWorkingAssemblyManifest,
  manifestFingerprint,
  validateCharacterAssemblyManifest,
  MockCharacterRuntimeAdapter,
  RUNTIME_PROTOCOL_VERSION,
  serializeRuntimeCommand,
  parseRuntimeResponse,
  LOCAL_RUNTIME_HOST_ID,
} from '../shared/studio-world-live-character-runtime/index.js';

describe('P0 live character runtime architecture', () => {
  it('separates actor SW-017 from character subject woman in manifest', () => {
    const state = initialFabricationState();
    const actor = findFabricationActor(state.selectedActorId)!;
    const character = buildFabricationCharacter(state.selectedCharacterId)!;
    const m = buildWorkingAssemblyManifest(state, actor, character);
    expect(m.actorId).toBe(actor.actorId);
    expect(m.characterId).toBe(character.characterId);
    expect(actor.catalogueNumber).toBe('SW-017');
    expect(m.runtime.runtimeCharacterId).toContain('sw-017');
  });

  it('validates manifest schema', () => {
    const state = initialFabricationState();
    const actor = findFabricationActor(state.selectedActorId)!;
    const character = buildFabricationCharacter(state.selectedCharacterId)!;
    const m = buildWorkingAssemblyManifest(state, actor, character);
    const v = validateCharacterAssemblyManifest(m);
    expect(v.ok).toBe(true);
    expect(manifestFingerprint(m)).toMatch(/^mf-[0-9a-f]{8}$/);
  });

  it('mock adapter responses are labeled mock', async () => {
    const adapter = new MockCharacterRuntimeAdapter();
    await adapter.connect({
      runtimeHostId: LOCAL_RUNTIME_HOST_ID,
      runtimeType: 'LOCAL_WINDOWS',
      engineVersion: '5.8.2',
      capabilities: { pixelStreaming: true, metahuman: true, capture: true, liveMutation: true },
      connectionState: 'READY',
      lastSeen: null,
      activeCharacterId: null,
      activeAssemblyVersion: null,
      signallingUrl: null,
    });
    const state = initialFabricationState();
    const actor = findFabricationActor(state.selectedActorId)!;
    const character = buildFabricationCharacter(state.selectedCharacterId)!;
    const m = buildWorkingAssemblyManifest(state, actor, character);
    const res = await adapter.loadCharacter(m);
    expect(res.mock).toBe(true);
    expect(adapter.kind).toBe('mock');
  });

  it('protocol round-trip preserves mock flag', () => {
    const cmd = {
      protocolVersion: RUNTIME_PROTOCOL_VERSION,
      requestId: 'r1',
      characterId: 'char-subject-woman',
      assemblyVersion: '1.0-draft',
      manifestHash: 'mf-00000000',
      command: 'SET_HAIR' as const,
      payload: { variant: 'B' },
      timestamp: new Date().toISOString(),
    };
    const raw = serializeRuntimeCommand(cmd);
    const parsed = parseRuntimeResponse(
      JSON.stringify({
        protocolVersion: RUNTIME_PROTOCOL_VERSION,
        requestId: 'r1',
        status: 'APPLIED',
        runtimeCharacterId: 'runtime-sw-017',
        appliedAssemblyVersion: '1.0-draft',
        runtimeStateHash: 'mf-00000000',
        message: null,
        payload: { variant: 'B' },
        mock: true,
        timestamp: new Date().toISOString(),
      }),
    );
    expect(JSON.parse(raw).command).toBe('SET_HAIR');
    expect(parsed?.mock).toBe(true);
  });

  it('approved assembly cannot mutate in place', () => {
    const state = initialFabricationState();
    const actor = findFabricationActor(state.selectedActorId)!;
    const character = buildFabricationCharacter(state.selectedCharacterId)!;
    const m = buildWorkingAssemblyManifest(state, actor, character);
    m.authority.approvalState = 'APPROVED';
    expect(() => assertWorkingDraft(m)).toThrow(/immutable/);
  });

  it('mock hair mutation keeps same runtime character id', async () => {
    const adapter = new MockCharacterRuntimeAdapter();
    await adapter.connect({
      runtimeHostId: LOCAL_RUNTIME_HOST_ID,
      runtimeType: 'LOCAL_WINDOWS',
      engineVersion: '5.8.2',
      capabilities: { pixelStreaming: true, metahuman: true, capture: true, liveMutation: true },
      connectionState: 'READY',
      lastSeen: null,
      activeCharacterId: null,
      activeAssemblyVersion: null,
      signallingUrl: null,
    });
    const state = initialFabricationState();
    const actor = findFabricationActor(state.selectedActorId)!;
    const character = buildFabricationCharacter(state.selectedCharacterId)!;
    const m = buildWorkingAssemblyManifest(state, actor, character);
    await adapter.loadCharacter(m);
    const idBefore = m.runtime.runtimeCharacterId;
    const hash = manifestFingerprint(m);
    await adapter.sendCommand({
      protocolVersion: RUNTIME_PROTOCOL_VERSION,
      requestId: 'hair-1',
      characterId: m.characterId,
      assemblyVersion: m.assemblyVersion,
      manifestHash: hash,
      command: 'SET_HAIR',
      payload: { variant: 'B' },
      timestamp: new Date().toISOString(),
    });
    expect(m.runtime.runtimeCharacterId).toBe(idBefore);
    expect(m.characterId).toBe(character.characterId);
    expect(m.actorId).toBe(actor.actorId);
  });
});
