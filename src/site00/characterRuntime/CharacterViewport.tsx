import { useEffect, useMemo, useState } from 'react';
import {
  type CharacterAssemblyManifest,
  type CharacterRuntimeAdapter,
  type CharacterViewportProviderKind,
  type CharacterViewportState,
  MockCharacterRuntimeAdapter,
  UnrealCharacterRuntimeAdapter,
  LOCAL_RUNTIME_HOST_ID,
  manifestFingerprint,
} from '../../../shared/studio-world-live-character-runtime/index.js';
import { SubjectFigure } from '../components/characterFabrication/chamber';
import { liveCharacterRuntimeRequested, mockCharacterRuntimeRequested } from './flags';

type Props = {
  box: { x: number; y: number; w: number; h: number };
  manifest: CharacterAssemblyManifest | null;
};

function resolveProvider(): { kind: CharacterViewportProviderKind; adapter: CharacterRuntimeAdapter | null } {
  if (!liveCharacterRuntimeRequested()) {
    return { kind: 'STATIC_AUTHORITY', adapter: null };
  }
  if (mockCharacterRuntimeRequested()) {
    return { kind: 'LIVE_UNREAL', adapter: new MockCharacterRuntimeAdapter() };
  }
  return { kind: 'LIVE_UNREAL', adapter: new UnrealCharacterRuntimeAdapter() };
}

function stateLabel(state: CharacterViewportState, provider: CharacterViewportProviderKind, mock: boolean): string {
  if (provider === 'STATIC_AUTHORITY') return '';
  if (mock) return `MOCK · ${state}`;
  if (state === 'OFFLINE' || state === 'ERROR') return 'RUNTIME OFFLINE';
  if (state === 'SYNCING') return 'SYNCING…';
  if (state === 'LIVE') return 'LIVE';
  if (state === 'CONNECTING') return 'CONNECTING…';
  if (state === 'CAPTURING') return 'CAPTURING…';
  if (state === 'FALLBACK') return 'FALLBACK';
  return state;
}

/** Replaceable viewport: static figure by default; live Unreal when explicitly enabled. */
export function CharacterViewport({ box, manifest }: Props) {
  const { kind, adapter } = useMemo(() => resolveProvider(), []);
  const [viewportState, setViewportState] = useState<CharacterViewportState>(kind === 'STATIC_AUTHORITY' ? 'FALLBACK' : 'OFFLINE');
  const [inSync, setInSync] = useState<boolean | null>(null);
  const mock = adapter?.kind === 'mock';

  useEffect(() => {
    if (!adapter || !manifest) return;
    let cancelled = false;
    const unsub = adapter.subscribe((ev) => {
      if (ev.type === 'CONNECTION') setViewportState(ev.state);
      if (ev.type === 'SYNC') setInSync(ev.snapshot.inSync);
    });
    (async () => {
      try {
        await adapter.connect({
          runtimeHostId: LOCAL_RUNTIME_HOST_ID,
          runtimeType: 'LOCAL_WINDOWS',
          engineVersion: '5.8.2',
          capabilities: { pixelStreaming: true, metahuman: true, capture: true, liveMutation: true },
          connectionState: 'BOOTING',
          lastSeen: null,
          activeCharacterId: manifest.characterId,
          activeAssemblyVersion: manifest.assemblyVersion,
          signallingUrl: (import.meta as { env?: Record<string, string> }).env?.VITE_SITE00_UNREAL_COMMAND_WS ?? null,
        });
        if (!cancelled) await adapter.loadCharacter(manifest);
      } catch {
        if (!cancelled) setViewportState('FALLBACK');
      }
    })();
    return () => {
      cancelled = true;
      unsub();
      void adapter.disconnect();
    };
  }, [adapter, manifest]);

  useEffect(() => {
    if (!adapter || !manifest || viewportState !== 'LIVE') return;
    const hash = manifestFingerprint(manifest);
    setInSync(adapter.getSyncSnapshot({ assemblyVersion: manifest.assemblyVersion, manifestHash: hash }).inSync);
  }, [adapter, manifest, viewportState]);

  const label = stateLabel(viewportState, kind, !!mock);
  const showStatic = kind === 'STATIC_AUTHORITY' || viewportState === 'FALLBACK' || viewportState === 'OFFLINE' || viewportState === 'ERROR';

  return (
    <div className="cf-character-viewport" data-testid="cf-character-viewport" data-viewport-provider={kind} data-viewport-state={viewportState}>
      {showStatic ? <SubjectFigure {...box} /> : null}
      {label ? (
        <div className="cf-character-viewport__badge" data-testid="cf-runtime-badge" data-mock={mock ? '1' : '0'}>
          {label}
          {inSync === false ? ' · OUT OF SYNC' : inSync ? ` · SYNCED ${manifest?.assemblyVersion ?? ''}` : null}
        </div>
      ) : null}
      {kind === 'LIVE_UNREAL' && !showStatic ? (
        <div className="cf-character-viewport__stream" data-testid="cf-unreal-stream-placeholder" />
      ) : null}
    </div>
  );
}
