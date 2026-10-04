/**
 * Runtime host registration — StudioWorldRuntimeHost-LOCAL first, cloud later.
 */

export type RuntimeHostType = 'LOCAL_WINDOWS' | 'LAN' | 'CLOUD_GPU';

export type RuntimeHostCapabilities = {
  pixelStreaming: boolean;
  metahuman: boolean;
  capture: boolean;
  liveMutation: boolean;
};

export type RuntimeHostRegistration = {
  runtimeHostId: string;
  runtimeType: RuntimeHostType;
  engineVersion: string;
  capabilities: RuntimeHostCapabilities;
  connectionState: 'OFFLINE' | 'BOOTING' | 'READY' | 'BUSY' | 'STREAMING' | 'CAPTURING' | 'IDLE' | 'SHUTTING_DOWN' | 'ERROR';
  lastSeen: string | null;
  activeCharacterId: string | null;
  activeAssemblyVersion: string | null;
  signallingUrl: string | null;
};

export const LOCAL_RUNTIME_HOST_ID = 'StudioWorldRuntimeHost-LOCAL';
