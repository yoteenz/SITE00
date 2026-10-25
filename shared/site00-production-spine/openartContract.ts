import { z } from 'zod';
import type { ProviderPoll, ProviderRequest } from './providers.js';
import { SpineError, UNKNOWN, type SettingValue, type Unknowable } from './types.js';

/**
 * The OpenArt contract this repository has actually observed (§18). Nothing here is assumed from documentation:
 *
 *   creation records   THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json
 *                      (openart_creation_list, read-only, copied verbatim; 7 creations: completed and failed)
 *   quotes and forms   THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V2.json
 *                      (openart_model_cost and openart_account_get, read-only)
 *
 * Both were read through the founder's OpenArt connector in an agent session. The deployed API holds no OpenArt
 * credential, so this contract is what a future executor must satisfy, not proof the server can reach OpenArt.
 * Not observed, and therefore refused or reported UNKNOWN: in-progress status names, a per-creation charge, the
 * reference-image field for image2image, and the submission tool's request and response shapes.
 */

export const OPENART_EVIDENCE = {
  creations: 'THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/KAIS_NOTE_SCREEN_TEST_OPENART_V1.json',
  quotes: 'THE_EXCHANGE/SEASON_1/PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V2.json',
} as const;

/** Terminal statuses seen in creation records. */
export const OPENART_OBSERVED_STATUSES = ['completed', 'failed'] as const;
/** Input fields seen on image2video creations. */
export const OPENART_OBSERVED_INPUT_FIELDS = ['startFrame', 'middleFrames', 'endFrame'] as const;
export const OPENART_OUTPUT_HOST = 'cdn.openart.ai';

/** Form facts recorded with the quotes (kling-3-omni image2video). */
export const KLING_3_OMNI_I2V_FORM = { durationSec: { min: 3, max: 15 }, resolutions: ['std', 'pro', '4k'], generateSoundDefault: true, startFrame: 'required', endFrame: 'optional', promptMaxChars: 2500 } as const;

const creation = z.object({
  historyId: z.string().min(1),
  creationId: z.string().min(1),
  model: z.string().min(1),
  mode: z.string().min(1),
  status: z.string().min(1),
  createdAtUtc: z.string(),
  durationSec: z.number().positive().nullable(),
  resolution: z.string().nullable(),
  outputUrl: z.string(),
  inputRefs: z.array(z.object({ field: z.string(), type: z.string(), id: z.string(), url: z.string() })),
});
export type OpenArtCreation = z.infer<typeof creation>;

export type ParsedCreation = { creationId: string; poll: ProviderPoll; outputUrl: string | null; sourceHost: Unknowable<string>; durationSec: Unknowable<number>; resolution: Unknowable<string> };

/**
 * Reads one creation record. A status that was never observed is an error, not progress and not success; a completed
 * creation must point at the observed output host. Creation records carry no charge, so reportedCredits is UNKNOWN
 * and the spend gate counts the quote.
 */
export function parseOpenArtCreation(raw: unknown): ParsedCreation {
  const r = creation.safeParse(raw);
  if (!r.success) throw new SpineError('PROVIDER_RESPONSE_INVALID', r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  const c = r.data;
  const base = { creationId: c.creationId, durationSec: c.durationSec ?? UNKNOWN, resolution: c.resolution ?? UNKNOWN };
  if (c.status === 'failed') return { ...base, poll: { state: 'FAILED', error: `OpenArt creation ${c.creationId} failed`, reportedCredits: UNKNOWN }, outputUrl: null, sourceHost: UNKNOWN };
  if (c.status !== 'completed') throw new SpineError('PROVIDER_STATUS_UNRECOGNIZED', `OpenArt status "${c.status}" has not been observed; the job stays as it is until someone looks`);
  let url: URL;
  try {
    url = new URL(c.outputUrl);
  } catch {
    throw new SpineError('PROVIDER_OUTPUT_MISSING', `completed creation ${c.creationId} has no output URL`);
  }
  if (url.protocol !== 'https:' || url.hostname !== OPENART_OUTPUT_HOST) throw new SpineError('PROVIDER_OUTPUT_HOST_UNEXPECTED', `${url.hostname} is not ${OPENART_OUTPUT_HOST}`);
  // The URL is used once, to copy the bytes into private storage; only its host is ever recorded.
  return { ...base, poll: { state: 'SUCCEEDED', reportedCredits: UNKNOWN }, outputUrl: c.outputUrl, sourceHost: url.hostname };
}

type Quote = { model: string; mode: string; config: Record<string, SettingValue>; totalCredits: number };

/** The exact quoted configuration this request matches, or null. A request that matches no quote has no known price. */
export function matchingQuote(req: Pick<ProviderRequest, 'model' | 'mode' | 'settings'>, quotes: readonly Quote[]): Quote | null {
  const same = (a: Record<string, SettingValue>, b: Record<string, SettingValue>) => Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);
  return quotes.find((q) => q.model === req.model && q.mode === req.mode && same(q.config, req.settings)) ?? null;
}

/** Checks a request against the observed OpenArt forms before anything leaves the process. */
export function openArtContractProblems(req: ProviderRequest): string[] {
  const out: string[] = [];
  if (req.model === 'kling-3-omni' && req.mode === 'image2video') {
    const f = KLING_3_OMNI_I2V_FORM;
    const d = req.settings.duration;
    if (!(typeof d === 'number' && Number.isInteger(d) && d >= f.durationSec.min && d <= f.durationSec.max)) out.push(`duration must be a whole ${f.durationSec.min}–${f.durationSec.max} s`);
    if (!(f.resolutions as readonly SettingValue[]).includes(req.settings.resolution!)) out.push(`resolution must be one of ${f.resolutions.join(', ')}`);
    // Sound defaults to on: it must be sent explicitly off, or the provider adds (and charges for) it.
    if (req.settings.generateSound !== false) out.push('generateSound must be sent as false (the form defaults it to true)');
    if (req.inputs.filter((i) => i.role === 'START_FRAME').length !== 1) out.push('exactly one start frame is required');
    if (req.prompt.length > f.promptMaxChars) out.push(`prompt longer than ${f.promptMaxChars} characters`);
  }
  if (req.inputs.some((i) => i.role === 'REFERENCE')) out.push('the OpenArt field for a reference image has not been observed; refusing to guess it');
  return out;
}

/** Founder app-session credentials are never server secrets (§18). Their presence in the server environment is a fault. */
export function sessionCredentialFaults(env: Readonly<Record<string, string | undefined>>): string[] {
  return Object.keys(env).filter((k) => /OPENART/i.test(k) && /SESSION|COOKIE|TOKEN|AUTH|KEY|SECRET/i.test(k) && env[k]);
}
