import fs from 'node:fs';
import { EXCHANGE_PATHS, repoPath } from '../paths.js';
import { keyframeCounts } from './keyframes.js';
import { generationSeconds } from './motion.js';
import { framesToSec } from './timecode.js';
import type { ProductionPlan, ShotDesign } from './types.js';

export type QuotesV2 = {
  retrievedAtUtc: string;
  openart: { account: { plan: string; balanceCreditsAtQuote: number }; creditUsdRate: number | null; quotes: Array<{ model: string; mode: string; config: Record<string, unknown>; totalCredits: number }> };
  fal: { prices: Record<string, { unitPriceUsd: number; unit: string }> };
  elevenlabs: { directApi: string; note: string; connectorEvidence: string };
};

export const QUOTES_V2_PATH = `${EXCHANGE_PATHS.season}/PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V2.json`;
export const loadQuotesV2 = (root = process.cwd()): QuotesV2 => JSON.parse(fs.readFileSync(repoPath(QUOTES_V2_PATH, root), 'utf8')) as QuotesV2;

export const JOB_KINDS = ['REFERENCE_IMAGE', 'KEYFRAME_IMAGE', 'VIDEO_I2V', 'LIP_SYNC', 'DIALOGUE_TTS', 'SFX', 'MUSIC', 'UPSCALE', 'ASSEMBLY'] as const;
export type JobKind = (typeof JOB_KINDS)[number];

/** What this environment can actually do. A connector the founder uses elsewhere does not lend its credentials here. */
export type Access = 'EXECUTABLE_AFTER_AUTHORIZATION' | 'BLOCKED_NO_CREDENTIALS' | 'MANUAL_OUTSIDE_PIPELINE' | 'NOT_AVAILABLE';

export type ProviderRoute = {
  routeId: string;
  kind: JobKind;
  provider: string;
  model: string;
  config: Record<string, unknown>;
  access: Access;
  via: string;
  why: string;
  risks: string[];
};

export const PROVIDER_ROUTES: ProviderRoute[] = [
  { routeId: 'OA-NBP-I2I-2K', kind: 'KEYFRAME_IMAGE', provider: 'OpenArt', model: 'nano-banana-pro', config: { mode: 'image2image', resolution: '2K', aspectRatio: '9:16' }, access: 'EXECUTABLE_AFTER_AUTHORIZATION', via: 'OpenArt MCP in this environment', why: 'Takes up to 14 visual references, so a frame can bind the environment, wardrobe and lighting references at once; native 9:16.', risks: ['Faces drift without a locked reference; S1-01 inhabitants have none by design.'] },
  { routeId: 'OA-NBP-I2I-2K-REF', kind: 'REFERENCE_IMAGE', provider: 'OpenArt', model: 'nano-banana-pro', config: { mode: 'image2image', resolution: '2K', aspectRatio: '9:16' }, access: 'EXECUTABLE_AFTER_AUTHORIZATION', via: 'OpenArt MCP in this environment', why: 'Same model as keyframes so references and frames share one rendering look.', risks: ['A reference with no source image is look development; it needs the founder to choose how it is seeded.'] },
  { routeId: 'OA-K3O-I2V-PRO', kind: 'VIDEO_I2V', provider: 'OpenArt', model: 'kling-3-omni', config: { mode: 'image2video', resolution: 'pro', generateSound: false }, access: 'EXECUTABLE_AFTER_AUTHORIZATION', via: 'OpenArt MCP in this environment', why: 'Start frame required and end frame optional, integer 3–15 s, quoted linearly at 35 credits per second. Sound off: audio is designed separately.', risks: ['Hands and small props drift in fast action.', 'Architecture can bend during long moves.'] },
  { routeId: 'OA-K3O-I2V-STD', kind: 'VIDEO_I2V', provider: 'OpenArt', model: 'kling-3-omni', config: { mode: 'image2video', resolution: 'std', generateSound: false }, access: 'EXECUTABLE_AFTER_AUTHORIZATION', via: 'OpenArt MCP in this environment', why: 'Cheaper alternative at 25 credits per second; lower resolution than release footage needs.', risks: ['Not release resolution.'] },
  { routeId: 'EL-DIRECT', kind: 'DIALOGUE_TTS', provider: 'ElevenLabs', model: 'founder workspace voices', config: {}, access: 'BLOCKED_NO_CREDENTIALS', via: "Founder's ElevenLabs workspace (ChatGPT connector); no credential here", why: 'The approved character voices live in this workspace.', risks: ['Cost per character UNKNOWN from this environment.'] },
  { routeId: 'FAL-EL-SFX', kind: 'SFX', provider: 'fal', model: 'fal-ai/elevenlabs/sound-effects/v2', config: {}, access: 'EXECUTABLE_AFTER_AUTHORIZATION', via: 'fal REST with FAL_KEY in this environment', why: 'Short designed effects billed per second.', risks: ['Generated effects need a listening pass; field recordings may serve better for street beds.'] },
  { routeId: 'FAL-EL-MUSIC', kind: 'MUSIC', provider: 'fal', model: 'fal-ai/elevenlabs/music', config: {}, access: 'EXECUTABLE_AFTER_AUTHORIZATION', via: 'fal REST with FAL_KEY in this environment', why: 'Lowest-cost generated score route that this environment can reach.', risks: ['Commercial terms for generated music need founder review before release.', 'A 45-second big-band arc with exact hit points is hard to control by prompt.'] },
  { routeId: 'HUMAN-COMPOSER', kind: 'MUSIC', provider: 'Composer (to be engaged)', model: 'original score', config: {}, access: 'MANUAL_OUTSIDE_PIPELINE', via: 'Founder engagement', why: 'Hits frame-exact sync points and gives the series a theme it owns outright.', risks: ['Cost UNKNOWN.'] },
  { routeId: 'MANUAL-EDIT', kind: 'ASSEMBLY', provider: 'Editor (CapCut, Descript or Adobe)', model: 'manual conform from the multitrack manifest', config: {}, access: 'MANUAL_OUTSIDE_PIPELINE', via: 'Import of the exported multitrack and EDL', why: 'No editing API is connected here.', risks: ['Cost UNKNOWN (founder tools and time).'] },
];

export function quoteCredits(q: QuotesV2, model: string, mode: string, config: Record<string, unknown>): number | null {
  const hit = q.openart.quotes.find((x) => x.model === model && x.mode === mode && Object.entries(config).every(([k, v]) => x.config[k] === v));
  return hit ? hit.totalCredits : null;
}

/** Video cost for one shot at its requested generation length. Null when that exact configuration was not quoted. */
export function videoCredits(q: QuotesV2, shot: ShotDesign, fps: number, resolution: 'pro' | 'std' = 'pro'): { seconds: number; credits: number | null } {
  const seconds = generationSeconds(shot.frames, fps);
  return { seconds, credits: quoteCredits(q, 'kling-3-omni', 'image2video', { resolution, duration: seconds, generateSound: false }) };
}

export type BudgetLine = { lineId: string; category: string; description: string; jobs: number; routeId: string | null; credits: number | null; usd: number | null; status: 'QUOTED' | 'UNKNOWN' | 'NOT_REQUIRED'; basis: string };

const isHighRisk = (s: ShotDesign) => s.generated && (s.motionClass === 'HIGH' || s.continuityRisk.length >= 2);

/** Sprint V2 §22: estimated, authorized, actual, refunded and regeneration spend are separate figures; anything unquoted is UNKNOWN, never guessed. */
export function buildBudget(plan: ProductionPlan, q: QuotesV2) {
  const fps = plan.fps;
  const lines: BudgetLine[] = [];
  const keyCost = quoteCredits(q, 'nano-banana-pro', 'image2image', { resolution: '2K', aspectRatio: '9:16' });
  const refs = plan.keyframes.filter((k) => k.source === 'GENERATE' && k.kind !== 'START_FRAME' && k.kind !== 'END_FRAME');
  const frames = plan.keyframes.filter((k) => k.source === 'GENERATE' && (k.kind === 'START_FRAME' || k.kind === 'END_FRAME'));
  const images = (ks: typeof refs) => ks.reduce((a, k) => a + k.candidates, 0);
  lines.push({ lineId: 'B-01', category: 'NEW_REFERENCE_IMAGES', description: refs.map((k) => `${k.keyframeId} ×${k.candidates}`).join(', ') || 'none', jobs: images(refs), routeId: 'OA-NBP-I2I-2K-REF', credits: keyCost === null ? null : images(refs) * keyCost, usd: null, status: keyCost === null ? 'UNKNOWN' : 'QUOTED', basis: `nano-banana-pro image2image 2K 9:16 = ${keyCost ?? '?'} credits per image` });
  lines.push({ lineId: 'B-02', category: 'NEW_KEYFRAMES', description: frames.map((k) => `${k.keyframeId} ×${k.candidates}`).join(', ') || 'none', jobs: images(frames), routeId: 'OA-NBP-I2I-2K', credits: keyCost === null ? null : images(frames) * keyCost, usd: null, status: keyCost === null ? 'UNKNOWN' : 'QUOTED', basis: `nano-banana-pro image2image 2K 9:16 = ${keyCost ?? '?'} credits per image; extracted frames cost nothing` });
  const shots = plan.shots.filter((s) => s.generated).map((s) => ({ s, ...videoCredits(q, s, fps) }));
  const videoKnown = shots.every((x) => x.credits !== null);
  const videoCreditsTotal = videoKnown ? shots.reduce((a, x) => a + (x.credits ?? 0), 0) : null;
  lines.push({ lineId: 'B-03', category: 'VIDEO_GENERATION', description: `${shots.length} image-to-video jobs, ${shots.reduce((a, x) => a + x.seconds, 0)} s requested for ${framesToSec(shots.reduce((a, x) => a + x.s.frames, 0), fps)} s on screen`, jobs: shots.length, routeId: 'OA-K3O-I2V-PRO', credits: videoCreditsTotal, usd: null, status: videoKnown ? 'QUOTED' : 'UNKNOWN', basis: 'kling-3-omni image2video pro, sound off, exact quotes for 3, 4, 5 and 6 s (35 credits per second)' });
  const lip = plan.shots.filter((s) => s.lipSync === 'REQUIRED').length;
  lines.push({ lineId: 'B-04', category: 'LIP_SYNC', description: lip ? `${lip} lip-sync jobs` : 'No visible speaking mouth', jobs: lip, routeId: null, credits: lip ? null : 0, usd: lip ? null : 0, status: lip ? 'UNKNOWN' : 'NOT_REQUIRED', basis: lip ? 'kling-lipsync-v1 is unquoted' : 'Wordless release' });
  const chars = plan.dialogue.reduce((a, d) => a + d.text.length, 0);
  lines.push({ lineId: 'B-05', category: 'DIALOGUE_GENERATION', description: chars ? `${plan.dialogue.length} lines, ${chars} characters` : 'No dialogue', jobs: plan.dialogue.length, routeId: chars ? 'EL-DIRECT' : null, credits: null, usd: chars ? null : 0, status: chars ? 'UNKNOWN' : 'NOT_REQUIRED', basis: chars ? 'Founder ElevenLabs workspace pricing unknown here' : 'Do not invent narration' });
  const sfx = plan.sound.filter((c) => c.track === 'SFX' || c.track === 'FOLEY' || c.track === 'AMBIENCE');
  const sfxSec = framesToSec(sfx.reduce((a, c) => a + c.frames, 0), fps);
  const sfxRate = q.fal.prices['fal-ai/elevenlabs/sound-effects/v2']?.unitPriceUsd ?? null;
  lines.push({ lineId: 'B-06', category: 'SOUND_EFFECTS', description: `${sfx.length} designed or generated layers, ${sfxSec} s total, two takes each`, jobs: sfx.length * 2, routeId: 'FAL-EL-SFX', credits: null, usd: sfxRate === null ? null : Math.round(sfxSec * 2 * sfxRate * 100) / 100, status: sfxRate === null ? 'UNKNOWN' : 'QUOTED', basis: `fal ElevenLabs sound effects $${sfxRate ?? '?'} per second` });
  const music = plan.music.filter((m) => m.cueType !== 'SILENCE');
  const musicMin = framesToSec(music.reduce((a, m) => a + m.frames, 0), fps) / 60;
  const musicRate = q.fal.prices['fal-ai/elevenlabs/music']?.unitPriceUsd ?? null;
  lines.push({ lineId: 'B-07', category: 'MUSIC_GENERATION', description: `${music.length} cues, ${Math.round(musicMin * 600) / 10} s; generated route at three takes, or a commissioned score`, jobs: music.length * 3, routeId: 'FAL-EL-MUSIC', credits: null, usd: musicRate === null ? null : Math.round(musicMin * 3 * musicRate * 100) / 100, status: musicRate === null ? 'UNKNOWN' : 'QUOTED', basis: `fal ElevenLabs music $${musicRate ?? '?'} per minute. Commissioned score: UNKNOWN.` });
  lines.push({ lineId: 'B-08', category: 'UPSCALING', description: 'Not planned: pro output is delivered at 1080 × 1920', jobs: 0, routeId: null, credits: 0, usd: 0, status: 'NOT_REQUIRED', basis: 'No upscale route quoted' });
  lines.push({ lineId: 'B-09', category: 'ASSEMBLY', description: 'Conform, mix and grade from the multitrack manifest', jobs: 1, routeId: 'MANUAL-EDIT', credits: null, usd: null, status: 'UNKNOWN', basis: 'Founder tools and time' });
  const known = (f: (l: BudgetLine) => number | null) => lines.reduce((a, l) => a + (f(l) ?? 0), 0);
  const counts = keyframeCounts(plan);
  const risky = shots.filter((x) => isHighRisk(x.s));
  const riskyCredits = risky.reduce((a, x) => a + (x.credits ?? 0), 0);
  const keyRetakes = { expected: Math.ceil(counts.imagesToGenerate * 0.25), ceiling: Math.ceil(counts.imagesToGenerate * 0.5) };
  const revisions = {
    policy: 'Expected: one retake for half of the high-risk shots and a quarter of the keyframe images. Ceiling: one retake for every high-risk shot and half of the images.',
    highRiskShots: risky.map((x) => x.s.shotId),
    expectedCredits: Math.round(riskyCredits * 0.5) + keyRetakes.expected * (keyCost ?? 0),
    ceilingCredits: riskyCredits + keyRetakes.ceiling * (keyCost ?? 0),
  };
  const estimatedCredits = known((l) => l.credits);
  return {
    unitId: plan.unitId,
    quotedAtUtc: q.retrievedAtUtc,
    balanceCreditsAtQuote: q.openart.account.balanceCreditsAtQuote,
    creditUsdRate: q.openart.creditUsdRate,
    lines,
    estimated: { credits: estimatedCredits, usd: Math.round(known((l) => l.usd) * 100) / 100, unknownLines: lines.filter((l) => l.status === 'UNKNOWN').map((l) => l.lineId) },
    revisions,
    expectedTotalCredits: estimatedCredits + revisions.expectedCredits,
    ceilingCredits: estimatedCredits + revisions.ceilingCredits,
    ledger: { authorizedCredits: 0, actualCredits: 0, refundedCredits: 0, regenerationCredits: 0, authorizedUsd: 0, actualUsd: 0 },
    perShot: shots.map((x) => ({ shotId: x.s.shotId, screenSec: framesToSec(x.s.frames, fps), generationSec: x.seconds, credits: x.credits, highRisk: isHighRisk(x.s) })),
  };
}
export type ProductionBudget = ReturnType<typeof buildBudget>;
