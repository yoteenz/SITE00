import { buildPageConceptGenerationPlan } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import type {
  PageConceptGenerationRunResult,
  PageConceptGenerationState,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PAGE_CONCEPT_TARGET_TYPE } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/constants.js';
import { validateIncomingPageConceptCaptures } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/validateIncomingPageConceptCaptures.js';
import { executePageConceptGeneration } from './executePageConceptGenerationRun.js';

export type PageGenerationCapturePayload = {
  captureId: string;
  snapshotId?: string;
  artifactBase64?: string;
  artifactUrl?: string;
  width: number;
  height: number;
};

export type RunPageConceptGenerationInput = {
  state: PageConceptGenerationState;
  mobileCapture: PageGenerationCapturePayload;
  desktopCapture: PageGenerationCapturePayload;
  founderConfirmedSpend: boolean;
  /** Re-run only failed/missing NBP jobs; preserve successful CGPT/GPT2/NBP artifacts. */
  retryFailedOnly?: boolean;
  /** Re-run CGPT on the same run after rate-limit failure; preserves captures and run id when used with resumeRunId. */
  retryCgptOnly?: boolean;
  /** Founder approved GPT2 authority — continue to NBP on same run. */
  continueNbpAfterGpt2Review?: boolean;
};

export function planPageConceptGeneration(
  projectId: string,
  pageId: string,
  options?: { trustIncomingCaptures?: boolean },
): ReturnType<typeof buildPageConceptGenerationPlan> {
  return buildPageConceptGenerationPlan(projectId, pageId, options);
}

export type PageConceptGenerationDryRunResult =
  | {
      ok: true;
      readiness: 'READY_FOR_PROVIDER_DISPATCH';
      plan: ReturnType<typeof buildPageConceptGenerationPlan>;
      mobileCaptureId: string;
      desktopCaptureId: string;
      mobileTransport: 'base64' | 'url' | 'snapshot';
      desktopTransport: 'base64' | 'url' | 'snapshot';
      serverCaptureValidation: 'PASS';
    }
  | { ok: false; code: string; message: string };

/** Auth/context/capture validation + plan compile — no CGPT/GPT2/NBP. */
export function pageConceptGenerationDryRun(input: {
  state: PageConceptGenerationState;
  mobileCapture?: PageGenerationCapturePayload;
  desktopCapture?: PageGenerationCapturePayload;
}): PageConceptGenerationDryRunResult {
  if (input.state.targetType !== PAGE_CONCEPT_TARGET_TYPE) {
    return { ok: false, code: 'PAGE_TARGET_REQUIRED', message: 'PAGE target required' };
  }
  if (
    input.state.projectId !== input.state.projectContext?.projectId ||
    input.state.pageId !== input.state.pageContext?.pageId
  ) {
    return { ok: false, code: 'PAGE_STATE_MISMATCH', message: 'state project/page mismatch' };
  }

  const captureValidation = validateIncomingPageConceptCaptures({
    projectId: input.state.projectId,
    pageId: input.state.pageId,
    mobileCapture: input.mobileCapture,
    desktopCapture: input.desktopCapture,
  });
  if (!captureValidation.ok) {
    return { ok: false, code: captureValidation.code, message: captureValidation.message };
  }

  try {
    const plan = buildPageConceptGenerationPlan(input.state.projectId, input.state.pageId, {
      trustIncomingCaptures: true,
    });
    return {
      ok: true,
      readiness: 'READY_FOR_PROVIDER_DISPATCH',
      plan,
      mobileCaptureId: input.mobileCapture!.captureId,
      desktopCaptureId: input.desktopCapture!.captureId,
      mobileTransport: captureValidation.mobileTransport,
      desktopTransport: captureValidation.desktopTransport,
      serverCaptureValidation: 'PASS',
    };
  } catch (err) {
    const code = err instanceof Error ? err.message : 'PLAN_FAILED';
    return { ok: false, code, message: code };
  }
}

export async function runPageConceptGeneration(
  input: RunPageConceptGenerationInput,
): Promise<PageConceptGenerationRunResult> {
  if (!input.founderConfirmedSpend) throw new Error('SPEND_GUARD: founder confirmation required');
  if (input.state.targetType !== PAGE_CONCEPT_TARGET_TYPE) {
    throw new Error('PAGE_TARGET_REQUIRED');
  }
  if (
    input.state.projectId !== input.state.projectContext?.projectId ||
    input.state.pageId !== input.state.pageContext?.pageId
  ) {
    throw new Error('PAGE_STATE_MISMATCH');
  }

  const captureValidation = validateIncomingPageConceptCaptures({
    projectId: input.state.projectId,
    pageId: input.state.pageId,
    mobileCapture: input.mobileCapture,
    desktopCapture: input.desktopCapture,
  });
  if (!captureValidation.ok) {
    throw new Error(captureValidation.code);
  }

  return executePageConceptGeneration(input, {
    retryCgptOnly: input.retryCgptOnly === true,
  });
}
