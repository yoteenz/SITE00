import type { ShotRecord } from './types.js';

export const PROVIDER_ROLES = ['SCREENWRITING', 'VOICE', 'IMAGE', 'VIDEO', 'LIP_SYNC', 'EDITING'] as const;
export type ProviderRole = (typeof PROVIDER_ROLES)[number];

export type IntegrationStatus = 'VERIFIED' | 'READ_ONLY_VERIFIED' | 'NOT_VERIFIED' | 'BLOCKED_NO_CREDENTIALS' | 'MANIFEST_EXPORT_ONLY';

export type ProviderCapability = {
  role: ProviderRole;
  provider: string;
  route: string;
  integration: IntegrationStatus;
  generationVerified: boolean;
  adapterMode: 'IN_SESSION' | 'MANIFEST_EXPORT';
  evidence: string[];
  checkedAtUtc: string;
  nextStep: string;
};

/** Audit of 2026-10-24 (UTC). Read-only checks only; no paid job was submitted. */
export const PROVIDER_CAPABILITY_AUDIT: ProviderCapability[] = [
  {
    role: 'SCREENWRITING',
    provider: 'Claude Opus (Cursor cloud agent)',
    route: 'Repository files: SCREENPLAYS/*.fountain',
    integration: 'VERIFIED',
    generationVerified: true,
    adapterMode: 'IN_SESSION',
    evidence: ['S1-01 to S1-05 drafted in this sprint and parsed by fountain.ts; tests read the files from disk.'],
    checkedAtUtc: '2026-10-24',
    nextStep: 'Founder screenplay review of S1-01 to S1-05.',
  },
  {
    role: 'VOICE',
    provider: 'ElevenLabs',
    route: 'Direct API: no credential on this VM. Through fal: fal-ai/elevenlabs/tts/eleven-v3 (FAL_KEY present).',
    integration: 'NOT_VERIFIED',
    generationVerified: false,
    adapterMode: 'MANIFEST_EXPORT',
    evidence: [
      'No ELEVENLABS_* variable in the environment.',
      'fal pricing API (read-only, 2026-10-24T02:52Z): fal-ai/elevenlabs/tts/eleven-v3 $0.10 per 1,000 characters.',
      'No approved character voice exists; registries hold voiceId null.',
    ],
    checkedAtUtc: '2026-10-24T02:52Z',
    nextStep: 'Founder approves a voice per character (CHARACTER_VOICE), then a spend authorization for recordings.',
  },
  {
    role: 'IMAGE',
    provider: 'OpenArt',
    route: 'OpenArt MCP: gpt-image-2-5-sunburst / nano-banana-pro image2image',
    integration: 'READ_ONLY_VERIFIED',
    generationVerified: false,
    adapterMode: 'MANIFEST_EXPORT',
    evidence: ['openart_model_cost quotes: 42 credits (gpt-image-2-5-sunburst 2k medium), 40 credits (nano-banana-pro 1K).', 'Balance read: 10,154 credits.'],
    checkedAtUtc: '2026-10-24T02:24Z',
    nextStep: 'Approved set, wardrobe and face references, then a keyframe spend authorization.',
  },
  {
    role: 'VIDEO',
    provider: 'OpenArt (Kling)',
    route: 'OpenArt MCP: kling-3-omni / kling-v3 image2video. Kling 4 Omni has no OpenArt quote.',
    integration: 'READ_ONLY_VERIFIED',
    generationVerified: false,
    adapterMode: 'MANIFEST_EXPORT',
    evidence: [
      'openart_model_cost: kling-3-omni std 5 s with sound = 175 credits.',
      "Kai's Note screen-test creations read back from OpenArt project JDK0WveKdptpT6L3pLzB (PRODUCTION_TEST_ONLY).",
      'fal pricing: fal-ai/kling-video/v2.1/master/image-to-video $0.28 per second.',
    ],
    checkedAtUtc: '2026-10-24T02:24Z',
    nextStep: 'Approved keyframes and a per-release spend authorization.',
  },
  {
    role: 'LIP_SYNC',
    provider: 'Kling lip-sync (OpenArt) or sync-lipsync (fal)',
    route: 'OpenArt kling-lipsync-v1 (unquoted); fal-ai/sync-lipsync/v2; fal-ai/kling-video/lipsync/audio-to-video',
    integration: 'READ_ONLY_VERIFIED',
    generationVerified: false,
    adapterMode: 'MANIFEST_EXPORT',
    evidence: ["Kai's Note test contains lip-sync creations (read only).", 'fal pricing: sync-lipsync v2 $3 per minute; kling lipsync $0.014 per unit.'],
    checkedAtUtc: '2026-10-24T02:24Z',
    nextStep: 'Approved recordings; multi-speaker lip-sync still untested (stress test T28).',
  },
  {
    role: 'EDITING',
    provider: 'CapCut',
    route: 'Edit decision list exported in PRODUCTION_MANIFESTS; no CapCut API.',
    integration: 'MANIFEST_EXPORT_ONLY',
    generationVerified: false,
    adapterMode: 'MANIFEST_EXPORT',
    evidence: ['No CapCut credential or API in the repository or environment.'],
    checkedAtUtc: '2026-10-24',
    nextStep: 'Editor imports the manifest by hand.',
  },
];

/** Providers allowed to receive a paid job. Empty until a generation route is verified and approved. */
export function verifiedGenerationProviders(audit = PROVIDER_CAPABILITY_AUDIT): string[] {
  return audit.filter((p) => p.generationVerified && p.role !== 'SCREENWRITING').map((p) => p.provider);
}

export type DialogueExportRow = { lineId: string; cue: string; voiceId: string | null; text: string; direction: string | null; characters: number };

export const voiceAdapter = {
  role: 'VOICE' as const,
  exportRows(lines: Array<{ lineId: string; character: string; text: string; parenthetical: string | null }>, voiceOf: (cue: string) => string | null): DialogueExportRow[] {
    return lines.map((l) => ({ lineId: l.lineId, cue: l.character, voiceId: voiceOf(l.character), text: l.text, direction: l.parenthetical, characters: l.text.length }));
  },
};

export const imageAdapter = {
  role: 'IMAGE' as const,
  exportRows(shots: ShotRecord[]) {
    return shots
      .filter((s) => s.generationProvider.startsWith('OPENART'))
      .map((s) => ({ shotId: s.shotId, frame: s.startFrameRef, setRef: s.setRef, onScreen: s.onScreen, wardrobe: s.wardrobeState, props: s.propState, framing: s.framing, blocking: s.blocking }));
  },
};

export const videoAdapter = {
  role: 'VIDEO' as const,
  exportRows(shots: ShotRecord[]) {
    return shots
      .filter((s) => s.generationProvider.startsWith('OPENART'))
      .map((s) => ({ shotId: s.shotId, provider: s.generationProvider, durationSec: s.durationSec, startFrameRef: s.startFrameRef, endFrameRef: s.endFrameRef, movement: s.movement, constraints: s.movementConstraints }));
  },
};

export const lipSyncAdapter = {
  role: 'LIP_SYNC' as const,
  exportRows(shots: ShotRecord[]) {
    return shots.filter((s) => s.generationProvider.includes('LIPSYNC')).map((s) => ({ shotId: s.shotId, lineIds: s.dialogueRefs, onScreen: s.onScreen }));
  },
};

export const editingAdapter = {
  role: 'EDITING' as const,
  /** A flat edit decision list: one event per shot, in order, with record in/out in seconds. */
  exportEdl(shots: ShotRecord[], cues: Array<{ sceneId: string; tag: string; value: string }>) {
    let t = 0;
    const events = shots.map((s) => {
      const event = { event: s.order, shotId: s.shotId, sceneId: s.sceneId, type: s.type, recordIn: Math.round(t * 10) / 10, recordOut: Math.round((t + s.durationSec) * 10) / 10, dialogue: s.dialogueRefs };
      t += s.durationSec;
      return event;
    });
    return { format: 'EXCHANGE_EDL_V1', totalSec: Math.round(t * 10) / 10, events, audioCues: cues.filter((c) => c.tag === 'MUSIC' || c.tag === 'SFX') };
  },
};
