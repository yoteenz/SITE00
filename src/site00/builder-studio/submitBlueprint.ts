/**
 * Blueprint submission over the existing canonical BUILDER intake (api/site00/intakes.ts via `useIntakeSync`).
 * No new endpoint: start → guest access for the client's email → final payload → submit.
 *
 * The payload keeps the studio draft, the canonical selection and the estimator record together, using the
 * estimator's own `createEstimateRecord`, so a later coefficient change never rewrites what the client saw.
 */
import { useCallback, useState } from 'react';
import { estimateProject } from '../../studioos/estimation/engine';
import { createEstimateRecord } from '../../studioos/estimation/persistence';
import type { SavedEstimateRecord } from '../../studioos/estimation/types';
import { toEstimateConfig, type BuilderSelection } from '../builder-experience';
import * as intakesApi from '../api/intakesApi';
import { useIntakeSync } from '../hooks/useIntakeSync';
import { STUDIO_INTAKE_STORAGE_PREFIX, type StudioDraft } from './studioModel';

export const BUILDER_STUDIO_PAYLOAD_VERSION = 1 as const;

export type BuilderStudioPayload = {
  builderStudio: {
    version: typeof BUILDER_STUDIO_PAYLOAD_VERSION;
    studio: Omit<StudioDraft, 'submission'>;
    selection: BuilderSelection;
    estimateRecord: SavedEstimateRecord;
  };
};

export function blueprintEstimateRecord(selection: BuilderSelection): SavedEstimateRecord {
  const config = toEstimateConfig(selection, 'SELF_SERVE');
  const outcome = estimateProject(config);
  if (!outcome.ok) throw new Error(`BLUEPRINT ESTIMATE UNAVAILABLE: ${outcome.errors.join(' ')}`);
  return createEstimateRecord(config, outcome.result);
}

export function buildSubmissionPayload(draft: StudioDraft, selection: BuilderSelection): BuilderStudioPayload {
  const studio: Partial<StudioDraft> = { ...draft };
  delete studio.submission;
  return {
    builderStudio: {
      version: BUILDER_STUDIO_PAYLOAD_VERSION,
      studio: studio as Omit<StudioDraft, 'submission'>,
      selection,
      estimateRecord: blueprintEstimateRecord(selection),
    },
  };
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmissionState = { status: 'idle' } | { status: 'sending' } | { status: 'sent'; intakeId: string } | { status: 'error'; message: string };

export function useBlueprintSubmission() {
  const sync = useIntakeSync('BUILDER', STUDIO_INTAKE_STORAGE_PREFIX);
  const [state, setState] = useState<SubmissionState>({ status: 'idle' });

  const submit = useCallback(
    async (input: { email: string; draft: StudioDraft; selection: BuilderSelection }): Promise<string | null> => {
      if (!EMAIL_PATTERN.test(input.email.trim())) {
        setState({ status: 'error', message: 'ENTER A VALID EMAIL SO SITE 00 CAN REPLY.' });
        return null;
      }
      setState({ status: 'sending' });
      try {
        const payload = buildSubmissionPayload(input.draft, input.selection) as unknown as Record<string, unknown>;
        const id = await sync.ensureStarted({
          domainLabel: input.draft.path === 'WORLD' ? 'world' : 'site',
          sourceRoute: '/bldr/builder/blueprint',
          draftPayload: payload,
        });
        if (!id) throw new Error(sync.errorMessage ?? 'SITE 00 COULD NOT START YOUR BLUEPRINT.');
        const access = await sync.requestGuestAccess(input.email.trim());
        if (!access) throw new Error(sync.errorMessage ?? 'SITE 00 COULD NOT CONFIRM YOUR EMAIL.');
        await intakesApi.autosaveIntake({
          intakeType: 'BUILDER',
          id,
          currentStep: 'BLUEPRINT',
          totalSteps: 5,
          draftPayload: payload,
          email: input.email.trim(),
          guestToken: access.accessToken,
        });
        const intake = await sync.submit();
        if (!intake) throw new Error(sync.errorMessage ?? 'SITE 00 COULD NOT SUBMIT YOUR BLUEPRINT.');
        setState({ status: 'sent', intakeId: intake.id });
        return intake.id;
      } catch (e) {
        setState({ status: 'error', message: e instanceof Error ? e.message.toUpperCase() : 'SUBMISSION FAILED. TRY AGAIN.' });
        return null;
      }
    },
    [sync],
  );

  const resetState = useCallback(() => setState({ status: 'idle' }), []);

  return { state, submit, resetState };
}
