/**
 * P0.VR.DESIGN-PIPELINE-READINESS2 — compact PIPELINE / READINESS controller.
 */

import type { PagePipelineControllerModel, PagePipelineStageRow } from '../../../../../shared/site00-design-workspace-production/designPagePipelineController.js';
import type { TwinOpusDirectWorkspaceActions } from './twinOpusDirectWorkspace';

function stageGlyph(row: PagePipelineStageRow): string {
  if (row.status === 'COMPLETE' || row.status === 'NOT_REQUIRED') return '✓';
  if (row.status === 'ACTIVE' || row.status === 'BLOCKED') return '●';
  return '○';
}

export function DesignPipelineReadinessPanel({
  title,
  model,
  readinessDash,
  actions,
}: {
  title: string;
  model: PagePipelineControllerModel;
  readinessDash: { circumference: number; offset: number };
  actions: TwinOpusDirectWorkspaceActions;
}) {
  const ladder = model.stages.filter((s) => s.id !== 'page_ready').slice(0, 8);

  return (
    <section className="tod-pipe" aria-label={title}>
      <header className="tod-pipe__head">
        <h2 className="tod-pipe__title">{title}</h2>
      </header>
      <div className="tod-pipe__cols">
        <div className="tod-pipe__col tod-pipe__col--readiness">
          <span className="tod-pipe__label">READINESS</span>
          <div className="tod-pipe__gauge">
            <svg viewBox="0 0 68 68" className="tod-pipe__ring" aria-hidden="true">
              <circle cx="34" cy="34" r="30" className="tod-pipe__ringTrack" />
              <circle
                cx="34"
                cy="34"
                r="30"
                className="tod-pipe__ringValue"
                strokeDasharray={readinessDash.circumference}
                strokeDashoffset={readinessDash.offset}
              />
            </svg>
            <span className="tod-pipe__gaugeValue">{model.readinessPercent}%</span>
            <span className="tod-pipe__gaugeState">{model.readyLabel}</span>
          </div>
          <p className="tod-pipe__stageLine">
            CURRENT STAGE: <strong>{model.currentStageLabel}</strong>
          </p>
        </div>

        <div className="tod-pipe__col tod-pipe__col--checks">
          <span className="tod-pipe__label">PIPELINE</span>
          <ul className="tod-pipe__checks tod-pipe__ladder">
            {ladder.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="tod-pipe__stageBtn"
                  data-interaction-id={`pipeline-stage-${row.id}`}
                  onClick={() => actions.openPipelineStage(row.id)}
                >
                  <span className="tod-pipe__stageGlyph">{stageGlyph(row)}</span>
                  <span>{row.shortLabel}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="tod-pipe__details"
            data-interaction-id="pipeline-view-pipeline"
            onClick={() => actions.openViewPipeline()}
          >
            VIEW PIPELINE
          </button>
        </div>

        <div className="tod-pipe__col tod-pipe__col--status">
          <span className="tod-pipe__label">STATUS</span>
          <ul className="tod-pipe__status">
            <li>
              <span>CURRENT</span>
              <span className="tod-pipe__statusValue">{model.currentStageLabel}</span>
            </li>
            <li>
              <span>COMPLETED</span>
              <span className="tod-pipe__statusValue">
                {model.passedGateCount} / {model.applicableGateCount}
              </span>
            </li>
            <li>
              <span>BLOCKERS</span>
              <span className="tod-pipe__statusValue">{model.blockerCount}</span>
            </li>
            <li>
              <span>OPTIONAL</span>
              <span className="tod-pipe__statusValue">{model.optionalCount}</span>
            </li>
            <li>
              <span>WARNINGS</span>
              <span className="tod-pipe__statusValue">{model.warningCount}</span>
            </li>
          </ul>
          <button
            type="button"
            className="tod-pipe__details"
            data-interaction-id="pipeline-view-readiness"
            onClick={() => actions.openViewReadiness()}
          >
            VIEW READINESS
          </button>
        </div>

        <div className="tod-pipe__col tod-pipe__col--next">
          <span className="tod-pipe__label">{model.nextAction.label}</span>
          <p className="tod-pipe__nextCopy">
            {model.nextAction.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          {model.primaryBlocker ?
            <p className="tod-pipe__blocker">
              PRIMARY BLOCKER: {model.primaryBlocker.message}
            </p>
          : null}
          <button
            type="button"
            className="tod-pipe__primary"
            data-interaction-id="pipeline-next-primary"
            disabled={Boolean(model.nextAction.disabledReason)}
            title={model.nextAction.disabledReason ?? undefined}
            onClick={() => actions.runPipelineHandler(model.nextAction.handler)}
          >
            {model.nextAction.buttonLabel}
          </button>
          <button
            type="button"
            className="tod-pipe__secondary"
            data-interaction-id="pipeline-resolve-blocker"
            disabled={!model.primaryBlocker}
            onClick={() => actions.openResolveBlocker()}
          >
            RESOLVE BLOCKER
          </button>
          <button
            type="button"
            className="tod-pipe__secondary"
            data-interaction-id="pipeline-technical-details"
            onClick={() => actions.openTechnicalDetails()}
          >
            VIEW TECHNICAL DETAILS
          </button>
        </div>
      </div>
    </section>
  );
}
