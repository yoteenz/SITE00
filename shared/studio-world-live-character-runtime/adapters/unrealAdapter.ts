import type { CharacterRuntimeAdapter, CharacterViewportState, RuntimeEvent, RuntimeSyncSnapshot } from '../adapter.js';
import type { CharacterAssemblyManifest } from '../manifest.js';
import { manifestFingerprint } from '../manifest.js';
import type { CharacterCaptureRecord, CharacterCaptureRequest } from '../capture.js';
import type { CaptureCameraPreset } from '../captureRig.js';
import { parseRuntimeResponse, type RuntimeCommand, type RuntimeResponse } from '../protocol.js';
import type { RuntimeHostRegistration } from '../runtimeHost.js';

/**
 * Production-direction Unreal adapter — WebSocket command channel + Pixel Streaming UI hook.
 * Does not simulate success when the host is unreachable.
 */
export class UnrealCharacterRuntimeAdapter implements CharacterRuntimeAdapter {
  readonly kind = 'unreal' as const;
  readonly label = 'Unreal Character Runtime';

  private viewportState: CharacterViewportState = 'OFFLINE';
  private ws: WebSocket | null = null;
  private manifest: CharacterAssemblyManifest | null = null;
  private appliedHash: string | null = null;
  private listeners = new Set<(ev: RuntimeEvent) => void>();
  private commandUrl: string | null = null;

  subscribe(listener: (ev: RuntimeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(ev: RuntimeEvent) {
    for (const l of this.listeners) l(ev);
  }

  async connect(host: RuntimeHostRegistration): Promise<void> {
    this.viewportState = 'CONNECTING';
    this.emit({ type: 'CONNECTION', state: this.viewportState });
    this.commandUrl = host.signallingUrl;
    if (!this.commandUrl || typeof WebSocket === 'undefined') {
      this.viewportState = 'OFFLINE';
      this.emit({ type: 'CONNECTION', state: this.viewportState });
      throw new Error('Unreal runtime host unreachable (no signalling URL or WebSocket)');
    }
    await new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.commandUrl!);
        const t = setTimeout(() => {
          reject(new Error('Unreal command WebSocket timeout'));
        }, 8000);
        this.ws.onopen = () => {
          clearTimeout(t);
          this.viewportState = 'LIVE';
          this.emit({ type: 'CONNECTION', state: this.viewportState });
          resolve();
        };
        this.ws.onerror = () => {
          clearTimeout(t);
          this.viewportState = 'OFFLINE';
          this.emit({ type: 'CONNECTION', state: this.viewportState });
          reject(new Error('Unreal command WebSocket error'));
        };
        this.ws.onclose = () => {
          this.viewportState = 'OFFLINE';
          this.emit({ type: 'CONNECTION', state: this.viewportState });
        };
        this.ws.onmessage = (ev) => {
          const parsed = parseRuntimeResponse(String(ev.data));
          if (parsed && !parsed.mock) this.emit({ type: 'RESPONSE', response: parsed });
        };
      } catch (e) {
        this.viewportState = 'OFFLINE';
        reject(e);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.ws?.close();
    this.ws = null;
    this.viewportState = 'OFFLINE';
    this.emit({ type: 'CONNECTION', state: this.viewportState });
  }

  getViewportState(): CharacterViewportState {
    return this.viewportState;
  }

  private async send(cmd: RuntimeCommand): Promise<RuntimeResponse> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return {
        protocolVersion: 1,
        requestId: cmd.requestId,
        status: 'ERROR',
        runtimeCharacterId: null,
        appliedAssemblyVersion: null,
        runtimeStateHash: null,
        message: 'Unreal runtime offline',
        payload: null,
        mock: false,
        timestamp: new Date().toISOString(),
      };
    }
    this.viewportState = 'SYNCING';
    this.emit({ type: 'CONNECTION', state: this.viewportState });
    return new Promise((resolve) => {
      const handler = (ev: MessageEvent) => {
        const parsed = parseRuntimeResponse(String(ev.data));
        if (parsed && parsed.requestId === cmd.requestId) {
          this.ws?.removeEventListener('message', handler);
          if (parsed.status === 'APPLIED' || parsed.status === 'ACK') {
            this.appliedHash = cmd.manifestHash;
            this.viewportState = 'LIVE';
          } else {
            this.viewportState = 'ERROR';
          }
          this.emit({ type: 'CONNECTION', state: this.viewportState });
          this.emit({ type: 'RESPONSE', response: parsed });
          resolve(parsed);
        }
      };
      this.ws!.addEventListener('message', handler);
      this.ws!.send(JSON.stringify(cmd));
    });
  }

  async loadCharacter(manifest: CharacterAssemblyManifest): Promise<RuntimeResponse> {
    this.manifest = manifest;
    const hash = manifestFingerprint(manifest);
    return this.send({
      protocolVersion: 1,
      requestId: `load-${Date.now()}`,
      characterId: manifest.characterId,
      assemblyVersion: manifest.assemblyVersion,
      manifestHash: hash,
      command: 'LOAD_CHARACTER',
      payload: { manifest },
      timestamp: new Date().toISOString(),
    });
  }

  async applyAssembly(manifest: CharacterAssemblyManifest): Promise<RuntimeResponse> {
    this.manifest = manifest;
    const hash = manifestFingerprint(manifest);
    return this.send({
      protocolVersion: 1,
      requestId: `apply-${Date.now()}`,
      characterId: manifest.characterId,
      assemblyVersion: manifest.assemblyVersion,
      manifestHash: hash,
      command: 'APPLY_ASSEMBLY',
      payload: { manifest },
      timestamp: new Date().toISOString(),
    });
  }

  async setCamera(preset: CaptureCameraPreset): Promise<RuntimeResponse> {
    const m = this.manifest;
    if (!m) throw new Error('No character loaded');
    const hash = manifestFingerprint(m);
    return this.send({
      protocolVersion: 1,
      requestId: `cam-${Date.now()}`,
      characterId: m.characterId,
      assemblyVersion: m.assemblyVersion,
      manifestHash: hash,
      command: 'SET_CAMERA',
      payload: { preset },
      timestamp: new Date().toISOString(),
    });
  }

  async captureFrame(req: CharacterCaptureRequest): Promise<CharacterCaptureRecord> {
    const m = this.manifest;
    if (!m) throw new Error('No character loaded');
    const res = await this.send({
      protocolVersion: 1,
      requestId: req.captureId,
      characterId: m.characterId,
      assemblyVersion: m.assemblyVersion,
      manifestHash: req.manifestHash,
      command: 'CAPTURE_FRAME',
      payload: { ...req },
      timestamp: new Date().toISOString(),
    });
    if (res.status !== 'CAPTURE_READY' && res.status !== 'APPLIED') {
      throw new Error(res.message ?? 'Capture failed');
    }
    const record: CharacterCaptureRecord = {
      ...req,
      imageUrl: typeof res.payload?.imageUrl === 'string' ? res.payload.imageUrl : null,
      imageBytesBase64: typeof res.payload?.imageBytesBase64 === 'string' ? res.payload.imageBytesBase64 : null,
      runtimeVersion: typeof res.payload?.runtimeVersion === 'string' ? res.payload.runtimeVersion : 'unreal-unknown',
      capturedAt: new Date().toISOString(),
      source: 'UNREAL',
      lineage: { projectId: m.projectId, entryId: m.entryId, approvedAuthorityId: m.approvedAuthorityId },
    };
    this.emit({ type: 'CAPTURE', record });
    return record;
  }

  async sendCommand(cmd: RuntimeCommand): Promise<RuntimeResponse> {
    return this.send(cmd);
  }

  getSyncSnapshot(expected: { assemblyVersion: string; manifestHash: string }): RuntimeSyncSnapshot {
    const inSync = !!this.manifest && this.manifest.assemblyVersion === expected.assemblyVersion && this.appliedHash === expected.manifestHash;
    return {
      characterId: this.manifest?.characterId ?? '',
      assemblyVersion: this.manifest?.assemblyVersion ?? '',
      manifestHash: this.appliedHash ?? '',
      runtimeCharacterId: this.manifest?.runtime.runtimeCharacterId ?? null,
      runtimeStateHash: this.appliedHash,
      inSync,
    };
  }
}
