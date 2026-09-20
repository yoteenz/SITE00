import type { PageConceptGenerationPlan } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptGenerationStatus } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const STAGE_LABELS: { id: string; label: string }[] = [
  { id: '01', label: 'INJECTING CREATIVE CONTEXT' },
  { id: '02', label: 'CREATING GPT2 CONCEPT' },
  { id: '03', label: 'GENERATING RENDITION A · Mobile / Desktop' },
  { id: '04', label: 'GENERATING RENDITION B · Mobile / Desktop' },
  { id: '05', label: 'GENERATING RENDITION C · Mobile / Desktop' },
  { id: '06', label: 'READY FOR FOUNDER REVIEW' },
];

function activeStageIndex(status: PageConceptGenerationStatus): number {
  switch (status) {
    case 'CGPT_RUNNING':
      return 0;
    case 'GPT2_RUNNING':
      return 1;
    case 'NBP_RUNNING':
      return 2;
    case 'READY_FOR_FOUNDER_REVIEW':
      return 5;
    case 'PARTIAL_GENERATION':
      return 4;
    default:
      return -1;
  }
}

export function PageConceptGenerationOverlay({
  open,
  mode,
  plan,
  status,
  error,
  generating,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  mode: 'confirm' | 'progress';
  plan: PageConceptGenerationPlan | null;
  status: PageConceptGenerationStatus;
  error: string | null;
  generating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  const stageIdx = activeStageIndex(status);

  return (
    <div className="tod-pageGenOverlay" role="dialog" data-testid="page-concept-generation-overlay">
      <div className="tod-pageGenOverlay__panel">
        <header className="tod-pageGenOverlay__head">
          <h2>{mode === 'confirm' ? 'Generate page concepts' : 'Page concept pipeline'}</h2>
          <button type="button" onClick={onCancel} disabled={generating}>
            {mode === 'confirm' ? 'CANCEL' : 'CLOSE'}
          </button>
        </header>

        {mode === 'confirm' && !plan && error ?
          <p className="tod-pageGenOverlay__error" data-testid="page-concept-generation-blocked">
            {error}
          </p>
        : null}

        {mode === 'confirm' && plan ?
          <>
            <p>
              <strong>TARGET</strong> {plan.projectLabel} / {plan.pageLabel}
            </p>
            <p>
              <strong>PHASE 1</strong> CGPT Creative Injection — {plan.cgptCalls} call
            </p>
            <p>
              <strong>PHASE 2</strong> GPT2 Authority Concept — {plan.gpt2Calls} call
            </p>
            <p>
              <strong>PHASE 3</strong> NBP Renditions — {plan.nbpRenditions} ({plan.nbpJobs} viewport renders)
            </p>
            <p>
              <strong>OUTPUT</strong> 1 source concept · 3 renditions · Mobile + Desktop each
            </p>
            <p className="tod-pageGenOverlay__muted">{plan.estimatedCostNote}</p>
            <div className="tod-pageGenOverlay__actions">
              <button type="button" data-primary onClick={onConfirm} disabled={generating}>
                {generating ? 'PREPARING…' : 'GENERATE'}
              </button>
            </div>
          </>
        : null}

        {mode === 'progress' ?
          <ol className="tod-pageGenOverlay__stages">
            {STAGE_LABELS.map((row, idx) => (
              <li
                key={row.id}
                data-active={idx === stageIdx ? 'true' : 'false'}
                data-done={idx < stageIdx ? 'true' : 'false'}
              >
                <span>{row.id}</span> {row.label}
              </li>
            ))}
          </ol>
        : null}

        {error ? <p className="tod-pageGenOverlay__error">{error}</p> : null}
      </div>
    </div>
  );
}
