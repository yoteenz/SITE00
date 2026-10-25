import { redeemDispatchTicket, type DispatchTicket } from './gate.js';
import { SpineError, type GenerationJobRecord, type SettingValue, type Unknowable } from './types.js';

/**
 * Provider transports (§22). A transport is the only code that talks to a provider, and it acts only on a request
 * the spend gate ticketed. Two exist:
 *   FakeProviderTransport         deterministic test double; records what it was sent; spends nothing.
 *   OpenArtAgentSessionTransport  the pilot route (D-02): an OpenArt call made from an agent session that holds the
 *                                 OpenArt connector. The deployed app holds no such connector, so the transport is
 *                                 DISABLED unless the runtime flag is set AND an agent-session executor is injected.
 *                                 Nothing in this repository injects one.
 */

export type ProviderInput = { role: 'START_FRAME' | 'END_FRAME' | 'REFERENCE'; referenceId: string; storageRef: string; sha256: string };

export type ProviderRequest = {
  projectId: string;
  jobId: string;
  inputHash: string;
  idempotencyKey: string;
  routeId: string;
  provider: string;
  model: string;
  mode: string;
  settings: Record<string, SettingValue>;
  prompt: string;
  inputs: ProviderInput[];
};

export type ProviderPoll =
  | { state: 'RUNNING' }
  | { state: 'SUCCEEDED'; reportedCredits: Unknowable<number> }
  | { state: 'FAILED'; error: string; reportedCredits: Unknowable<number> };

export type ProviderOutput = { bytes: Uint8Array; mimeType: string; sourceHost: Unknowable<string> };

export interface ProviderTransport {
  readonly transportId: string;
  readonly provider: string;
  readonly kind: 'FAKE_TEST' | 'REAL';
  status(): { enabled: boolean; reason: string };
  submit(req: ProviderRequest, ticket: DispatchTicket, now: string): Promise<{ operationId: string }>;
  poll(operationId: string): Promise<ProviderPoll>;
  fetchOutput(operationId: string): Promise<ProviderOutput>;
}

export function buildProviderRequest(job: GenerationJobRecord, inputs: ProviderInput[]): ProviderRequest {
  return {
    projectId: job.projectId,
    jobId: job.id,
    inputHash: job.inputHash,
    idempotencyKey: job.idempotencyKey,
    routeId: job.routeId,
    provider: job.provider,
    model: job.model,
    mode: job.mode,
    settings: job.settings,
    prompt: job.prompt.text,
    inputs,
  };
}

/** Shape rules the OpenArt routes enforce, checked before anything leaves the process. */
export function requestProblems(req: ProviderRequest): string[] {
  const out: string[] = [];
  if (req.mode === 'image2video') {
    if (!req.inputs.some((i) => i.role === 'START_FRAME')) out.push('image2video needs a start frame');
    const d = req.settings.duration;
    if (!(typeof d === 'number' && Number.isInteger(d) && d >= 3 && d <= 15)) out.push(`duration must be a whole 3–15 s, got ${String(d)}`);
    if (req.settings.generateSound !== false) out.push('sound must be off: audio is designed separately');
  }
  if (req.mode === 'image2image' && req.settings.aspectRatio !== '9:16') out.push('frames are 9:16');
  if (!req.prompt.trim()) out.push('empty prompt');
  return out;
}

/* ── fake ──────────────────────────────────────────────────────────────────────────────────────────── */

export class FakeProviderTransport implements ProviderTransport {
  readonly transportId = 'FAKE-PROVIDER-TEST';
  readonly kind = 'FAKE_TEST' as const;
  readonly received: ProviderRequest[] = [];
  private readonly ops = new Map<string, ProviderRequest>();
  constructor(
    readonly provider: string,
    private readonly output: { bytes: Uint8Array; mimeType: string },
    private readonly behaviour: { failSubmit?: string; failRun?: string } = {},
  ) {}

  status() {
    return { enabled: true, reason: 'test double: no network, no credits' };
  }

  async submit(req: ProviderRequest, ticket: DispatchTicket, now: string) {
    redeemDispatchTicket(ticket, req, now);
    const problems = requestProblems(req);
    if (problems.length) throw new SpineError('PROVIDER_REQUEST_INVALID', problems.join('; '));
    this.received.push(req);
    if (this.behaviour.failSubmit) throw new SpineError('PROVIDER_SUBMIT_FAILED', this.behaviour.failSubmit);
    const operationId = `FAKE-OP-${String(this.received.length).padStart(3, '0')}`;
    this.ops.set(operationId, req);
    return { operationId };
  }

  async poll(operationId: string): Promise<ProviderPoll> {
    if (!this.ops.has(operationId)) throw new SpineError('PROVIDER_UNKNOWN_OPERATION', operationId);
    // A failure reports no charge (as a provider that does not say would); the gate then counts the quote.
    return this.behaviour.failRun ? { state: 'FAILED', error: this.behaviour.failRun, reportedCredits: 'UNKNOWN' } : { state: 'SUCCEEDED', reportedCredits: 0 };
  }

  async fetchOutput(operationId: string): Promise<ProviderOutput> {
    if (!this.ops.has(operationId)) throw new SpineError('PROVIDER_UNKNOWN_OPERATION', operationId);
    return { bytes: new Uint8Array(this.output.bytes), mimeType: this.output.mimeType, sourceHost: 'fake-provider.test' };
  }
}

/* ── OpenArt, agent-session route (guarded, disabled) ──────────────────────────────────────────────── */

/** What an agent session holding the OpenArt connector would execute. Not available to the deployed app. */
export interface AgentSessionOpenArtExecutor {
  submit(payload: OpenArtPayload): Promise<{ operationId: string }>;
  poll(operationId: string): Promise<ProviderPoll>;
  fetchOutput(operationId: string): Promise<ProviderOutput>;
}

/**
 * The request as OpenArt's quotes describe it (model, mode, config). The connector's tool names and response fields
 * have not been verified from this environment, so they are not modelled here.
 */
export type OpenArtPayload = { model: string; mode: string; config: Record<string, SettingValue>; prompt: string; inputs: Array<{ field: 'startFrame' | 'endFrame' | 'reference'; storageRef: string; sha256: string }> };

export const PROVIDER_EXECUTION_FLAG = 'SITE00_PROVIDER_EXECUTION';

export function openArtPayload(req: ProviderRequest): OpenArtPayload {
  const field = { START_FRAME: 'startFrame', END_FRAME: 'endFrame', REFERENCE: 'reference' } as const;
  return { model: req.model, mode: req.mode, config: req.settings, prompt: req.prompt, inputs: req.inputs.map((i) => ({ field: field[i.role], storageRef: i.storageRef, sha256: i.sha256 })) };
}

export class OpenArtAgentSessionTransport implements ProviderTransport {
  readonly transportId = 'OPENART-AGENT-SESSION';
  readonly provider = 'OpenArt';
  readonly kind = 'REAL' as const;
  constructor(
    private readonly env: Readonly<Record<string, string | undefined>>,
    private readonly executor: AgentSessionOpenArtExecutor | null = null,
  ) {}

  status() {
    if (this.env[PROVIDER_EXECUTION_FLAG] !== 'ENABLED') return { enabled: false, reason: `${PROVIDER_EXECUTION_FLAG} is not ENABLED` };
    if (!this.executor) return { enabled: false, reason: 'no agent-session OpenArt executor in this runtime (the deployed app has no OpenArt connector)' };
    return { enabled: true, reason: 'agent-session OpenArt executor attached and execution flag set' };
  }

  private executorOrThrow(): AgentSessionOpenArtExecutor {
    const s = this.status();
    if (!s.enabled || !this.executor) throw new SpineError('PROVIDER_EXECUTION_DISABLED', s.reason);
    return this.executor;
  }

  async submit(req: ProviderRequest, ticket: DispatchTicket, now: string) {
    const executor = this.executorOrThrow();
    redeemDispatchTicket(ticket, req, now);
    const problems = requestProblems(req);
    if (problems.length) throw new SpineError('PROVIDER_REQUEST_INVALID', problems.join('; '));
    return executor.submit(openArtPayload(req));
  }

  async poll(operationId: string) {
    return this.executorOrThrow().poll(operationId);
  }

  async fetchOutput(operationId: string) {
    return this.executorOrThrow().fetchOutput(operationId);
  }
}
