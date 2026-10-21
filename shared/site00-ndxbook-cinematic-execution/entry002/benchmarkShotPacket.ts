import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  CINEMATIC_EXECUTION_CONTRACT_VERSION,
  REFERENCE_BINDING_MANIFEST_VERSION,
  type ReferenceBindingEntry,
  type ReferenceBindingManifest,
  type ShotExecutionContract,
} from '../types/schemas.js';
import { compileStoryboardKeyframesToProvider } from '../compiler/keyframeCompiler.js';
import { artlistKling4Adapter } from '../provider/artlistKling4Adapter.js';
import { validateReferenceReadiness } from '../validation/referenceReadiness.js';
import { buildPaidGenerationPreflightReport } from '../validation/paidGenerationGate.js';
import {
  ENTRY_002_CHARACTER_SUBJECT_WOMAN,
  ENTRY_002_ID,
  entry002FinalStoryboardPanelPublicPath,
  entry002PreStoryboardPublicPath,
} from './assetCatalog.js';

/** Benchmark: Panel 08 RECOGNITION — tests NDX hand continuity, 2016 subject on phone, subtle motion. */
export const ENTRY_002_BENCHMARK_SHOT_ID = 'NDX-ENTRY-002-BENCHMARK-SHOT-P08-RECOGNITION-V001' as const;
export const ENTRY_002_BENCHMARK_SCENE_ID = 'cultural_glitch-familiar' as const;

function publicStoragePath(publicPath: string): string {
  return `public${publicPath}`;
}

function refEntry(partial: Omit<ReferenceBindingEntry, 'providerUploadStatus' | 'providerReferenceId' | 'validatedDeliveryStatus' | 'contentHash' | 'width' | 'height'> & { contentHash?: string | null }): ReferenceBindingEntry {
  return {
    providerUploadStatus: 'PENDING',
    providerReferenceId: null,
    validatedDeliveryStatus: 'PENDING',
    contentHash: partial.contentHash ?? null,
    width: null,
    height: null,
    ...partial,
  };
}

export function buildEntry002BenchmarkReferenceManifest(_repoRoot?: string): ReferenceBindingManifest {
  const refs: ReferenceBindingEntry[] = [
    refEntry({
      assetId: 'NDX-ENTRY-002-PRE-SBA-NDX-HANDS-001',
      fileLocation: publicStoragePath(entry002PreStoryboardPublicPath(3)),
      mediaType: 'image/jpeg',
      referenceRole: 'CHARACTER_IDENTITY',
      approvalVersion: 'B4.7',
      approvalStatus: 'FOUNDER_APPROVED',
      creativeRole: 'NDX lime nail hand authority',
      entryId: ENTRY_002_ID,
      sceneId: ENTRY_002_BENCHMARK_SCENE_ID,
      shotId: ENTRY_002_BENCHMARK_SHOT_ID,
      characterId: 'ndx-presence',
    }),
    refEntry({
      assetId: 'NDX-ENTRY-002-PRE-SBA-PHONE-GLITCH-001',
      fileLocation: publicStoragePath(entry002PreStoryboardPublicPath(5)),
      mediaType: 'image/jpeg',
      referenceRole: 'SCENE',
      approvalVersion: 'B4.7',
      approvalStatus: 'FOUNDER_APPROVED',
      creativeRole: 'Phone / cultural glitch language',
      entryId: ENTRY_002_ID,
      sceneId: ENTRY_002_BENCHMARK_SCENE_ID,
      shotId: ENTRY_002_BENCHMARK_SHOT_ID,
      characterId: null,
    }),
    refEntry({
      assetId: 'NDX-ENTRY-002-PRE-SBA-SUBJECT-DUAL-ERA-001',
      fileLocation: publicStoragePath(entry002PreStoryboardPublicPath(2)),
      mediaType: 'image/jpeg',
      referenceRole: 'CHARACTER_IDENTITY',
      approvalVersion: 'B4.7',
      approvalStatus: 'FOUNDER_APPROVED',
      creativeRole: 'Subject woman dual-era identity',
      entryId: ENTRY_002_ID,
      sceneId: ENTRY_002_BENCHMARK_SCENE_ID,
      shotId: ENTRY_002_BENCHMARK_SHOT_ID,
      characterId: ENTRY_002_CHARACTER_SUBJECT_WOMAN,
    }),
    refEntry({
      assetId: 'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-002-PANEL-08-ASSET-001',
      fileLocation: publicStoragePath(entry002FinalStoryboardPanelPublicPath(8)),
      mediaType: 'image/jpeg',
      referenceRole: 'START_FRAME',
      approvalVersion: 'B4.9R',
      approvalStatus: 'FOUNDER_APPROVED',
      creativeRole: 'Approved storyboard panel 8 — recognition hover',
      entryId: ENTRY_002_ID,
      sceneId: ENTRY_002_BENCHMARK_SCENE_ID,
      shotId: ENTRY_002_BENCHMARK_SHOT_ID,
      characterId: ENTRY_002_CHARACTER_SUBJECT_WOMAN,
    }),
    refEntry({
      assetId: 'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-002-PANEL-09-ASSET-001',
      fileLocation: publicStoragePath(entry002FinalStoryboardPanelPublicPath(9)),
      mediaType: 'image/jpeg',
      referenceRole: 'END_FRAME',
      approvalVersion: 'B4.9R',
      approvalStatus: 'FOUNDER_APPROVED',
      creativeRole: 'Approved storyboard panel 9 — tap fracture onset',
      entryId: ENTRY_002_ID,
      sceneId: ENTRY_002_BENCHMARK_SCENE_ID,
      shotId: ENTRY_002_BENCHMARK_SHOT_ID,
      characterId: ENTRY_002_CHARACTER_SUBJECT_WOMAN,
    }),
  ];

  const manifest: ReferenceBindingManifest = {
    manifestVersion: REFERENCE_BINDING_MANIFEST_VERSION,
    manifestHash: null,
    entryId: ENTRY_002_ID,
    shotId: ENTRY_002_BENCHMARK_SHOT_ID,
    references: refs,
  };
  return manifest;
}

export function buildEntry002BenchmarkShotContract(repoRoot: string): ShotExecutionContract {
  const referenceManifest = buildEntry002BenchmarkReferenceManifest(repoRoot);
  return {
    contractVersion: CINEMATIC_EXECUTION_CONTRACT_VERSION,
    campaignId: 'ndxbook-chapter-01',
    entryId: ENTRY_002_ID,
    sceneId: ENTRY_002_BENCHMARK_SCENE_ID,
    shotId: ENTRY_002_BENCHMARK_SHOT_ID,
    shotVersion: '001',
    storyboardVersion: '002-panel-v001',
    approvalStatus: 'FOUNDER_APPROVED',
    narrativeBeat: 'RECOGNITION',
    shotObjective: 'Quiet recognition beat — lime fingertip hovers over frozen 2016 full-body post before tap fracture.',
    requiredCharacterIds: [ENTRY_002_CHARACTER_SUBJECT_WOMAN, 'ndx-presence'],
    requiredVisualAssetIds: referenceManifest.references.map((r) => r.assetId),
    optionalReferenceIds: [],
    identityContinuity: [
      {
        characterId: 'ndx-presence',
        faceIdentity: 'NDX partial observer — bun silhouette when visible; no full face hero',
        hairstyle: 'NDX bun per pre-storyboard authority',
        hairLength: 'updo',
        hairTexture: 'natural',
        makeup: 'minimal editorial',
        wardrobe: 'dark neutral observer wardrobe',
        accessories: 'phone only',
        nailShape: 'short',
        nailColor: 'lime green — locked',
        shoes: 'not visible in macro framing',
        periodStyling: 'present-day observer',
        shotLevelOverridesAllowed: [],
        restrictions: ['Do not swap NDX nails to French tips', 'Do not replace lime with neon random green'],
      },
      {
        characterId: ENTRY_002_CHARACTER_SUBJECT_WOMAN,
        faceIdentity: 'Same woman as dual-era authority — not recast',
        hairstyle: '2016 IG baddie glam — locked when 2016 post visible',
        hairLength: 'era-appropriate',
        hairTexture: 'styled',
        makeup: 'overlined lips era-accurate when visible',
        wardrobe: '2016 bodycon / IG baddie outfit family from fashion continuity board',
        accessories: 'era-appropriate minimal',
        nailShape: 'French tips on subject — not lime',
        nailColor: 'neutral/French — not NDX lime',
        shoes: 'as visible in mirror selfie framing',
        periodStyling: '2016 Instagram capture quality',
        shotLevelOverridesAllowed: [],
        restrictions: ['Subject nails must not become lime NDX nails', 'No costume parody exaggeration'],
      },
    ],
    lockedWardrobeDetails: ['2016 outfit family from PRE-SBA-FASHION-CONTINUITY-001'],
    lockedSceneDetails: ['Old IG UI framing on phone — PHONE-GLITCH authority'],
    lockedPropDetails: ['Phone device continuity'],
    periodAuthority: '2016 IG BADDIE FASHION — present-day observer scroll',
    keyframes: [
      { role: 'START', assetId: 'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-002-PANEL-08-ASSET-001', timestampSec: 0, aspectRatio: '9:16' },
      { role: 'END', assetId: 'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-002-PANEL-09-ASSET-001', timestampSec: 4, aspectRatio: '9:16' },
    ],
    actionDescription:
      'Macro shallow depth. Lime fingertip hovers over selected 2016 full-body mirror selfie post. Subject frozen on screen. Minimal motion — breath-like hover, no dramatic swipe.',
    cameraDirection: 'Macro hover, close shallow depth on phone glass',
    cameraMovement: 'Nearly static — micro push-in optional, no orbit',
    performanceDirection: 'Recognition stillness before tap fracture',
    lightingDirection: 'Low-key phone glow + controlled ambient — match storyboard panels',
    audioRequirements: null,
    expectedDurationSec: 4,
    expectedAspectRatio: '9:16',
    outputResolution: '1080p',
    provider: 'artlist-kling-4',
    modelVersion: 'kling-4.0',
    providerParameterMapping: { artlistModel: 'kling-4-0', mode: 'image_to_video_with_start_end' },
    negativeConstraints: [
      'No generic cyberpunk portal glitch',
      'No character recast',
      'No comment-wall UI',
      'No silent fallback to text-only video',
      'No decorative camera whip',
    ],
    validationCriteria: [
      'NDX lime nails visible and stable',
      'Subject reads as same woman as dual-era authority',
      '2016 IG language preserved',
      'Motion serves recognition beat only',
    ],
    founderReviewStatus: 'PENDING_REVIEW',
    referenceManifest,
    motionAuthority: {
      subjectMovement: 'Frozen 2016 post on screen; micro finger hover only',
      cameraPath: 'Static macro with optional 2–3% push-in',
      actionTiming: 'Hover holds 2s, pre-tap tension 2s',
      focalEmphasis: 'Lime nail + 2016 full-body post',
      temporalContinuity: 'Match panels 8→9 storyboard transition',
      wardrobeBehavior: 'No wardrobe morphing on frozen post',
      hairMovement: 'None on screen subject; NDX hand stable',
      handFingerIntegrity: 'Five fingers, lime nail shape locked',
      facialConsistency: 'Subject face stable if visible on post',
      propInteraction: 'Finger hover only — no tap until end frame',
      backgroundContinuity: 'Phone bezel + UI consistent with glitch authority',
      dialogueOrAudio: null,
    },
  };
}

export type BenchmarkExecutionPacket = {
  shotId: typeof ENTRY_002_BENCHMARK_SHOT_ID;
  contract: ShotExecutionContract;
  referenceReadiness: ReturnType<typeof validateReferenceReadiness>;
  keyframeCompile: ReturnType<typeof compileStoryboardKeyframesToProvider>;
  providerRequest: ReturnType<typeof artlistKling4Adapter.compileRequest>;
  preflight: Record<string, unknown>;
  promptHash: string;
};

export function buildEntry002BenchmarkExecutionPacket(repoRoot: string): BenchmarkExecutionPacket {
  const contract = buildEntry002BenchmarkShotContract(repoRoot);
  const readiness = validateReferenceReadiness(contract.referenceManifest, { repoRoot });
  const keyframes = compileStoryboardKeyframesToProvider(contract);
  const providerRequest = artlistKling4Adapter.compileRequest(
    contract,
    keyframes.ok ? { keyframes: keyframes.providerKeyframes } : { error: keyframes },
  );
  const preflight = buildPaidGenerationPreflightReport(
    {
      projectId: 'ndxbook',
      provider: 'artlist-kling-4',
      model: 'kling-4.0',
      shotId: contract.shotId,
      durationSec: contract.expectedDurationSec,
      aspectRatio: contract.expectedAspectRatio,
      resolution: contract.outputResolution,
      referenceCount: contract.referenceManifest.references.length,
      estimatedCostCredits: null,
      generationCount: 1,
      outputLocation: 'site00/assts/expression-engine/ndxbook/entry-002/motion-benchmark/',
    },
    contract.referenceManifest,
  );
  const promptHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(providerRequest.payload))
    .digest('hex');

  if (readiness.ok) {
    contract.referenceManifest.manifestHash = readiness.manifestHash;
  }

  return {
    shotId: ENTRY_002_BENCHMARK_SHOT_ID,
    contract,
    referenceReadiness: readiness,
    keyframeCompile: keyframes,
    providerRequest,
    preflight,
    promptHash,
  };
}

/** Write machine-readable packet for founder manual submission. */
export function writeBenchmarkPacketJson(repoRoot: string, outPath: string): BenchmarkExecutionPacket {
  const packet = buildEntry002BenchmarkExecutionPacket(repoRoot);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(packet, null, 2));
  return packet;
}
