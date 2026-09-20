/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 — the GENERATE PAGE CONCEPTS pop-up.
 *
 * The pipeline (plan, spend confirmation, provider calls, run status) is
 * unchanged and still owned by `usePageConceptGeneration`. This file is the
 * presentation of that pipeline: it maps the run status onto the shell's stage
 * states and hands the existing handlers to the shell's actions. It decides
 * nothing about generation itself.
 */

import { useEffect } from 'react';

import {
  pageConceptStageStatesForRun,
  type PageConceptStageId,
  type PageConceptStageState,
} from '../../../../../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
import type {
  PageConceptGenerationPlan,
  PageConceptGenerationStatus,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PageConceptGeneratorPanel } from '../pageConceptGenerator/PageConceptGeneratorPanel';

export function PageConceptGenerationOverlay({
  open,
  mode,
  plan,
  status,
  error,
  generating,
  confirmReady,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  mode: 'confirm' | 'progress';
  plan: PageConceptGenerationPlan | null;
  status: PageConceptGenerationStatus;
  error: string | null;
  generating: boolean;
  confirmReady: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !generating) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [generating, onCancel, open]);

  if (!open) return null;

  const stageStates: Record<PageConceptStageId, PageConceptStageState> =
    mode === 'progress' || status !== 'IDLE' ?
      pageConceptStageStatesForRun({ status, failed: Boolean(error) && mode === 'progress' })
    : pageConceptStageStatesForRun({ status: 'IDLE' });

  return (
    <div className="s00-pcg-layer" role="dialog" data-testid="page-concept-generation-overlay">
      <button
        type="button"
        className="s00-pcg__scrim"
        aria-label="Close generate page concepts"
        onClick={() => !generating && onCancel()}
      />
      <div className="s00-pcg-layer__box">
        <PageConceptGeneratorPanel
          projectLabel={plan?.projectLabel ?? '—'}
          pageLabel={plan?.pageLabel ?? '—'}
          stageStates={stageStates}
          notice={error}
          noticeTestId={mode === 'confirm' && !plan && error ? 'page-concept-generation-blocked' : undefined}
          generateDisabled={generating || !confirmReady}
          generateDisabledReason={error}
          generateBusyLabel={generating ? 'PREPARING…' : null}
          onGenerate={onConfirm}
          onCancel={onCancel}
          onClose={onCancel}
        />
      </div>
    </div>
  );
}
