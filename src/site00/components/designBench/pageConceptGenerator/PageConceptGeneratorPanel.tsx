/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 — visual shell for the GENERATE PAGE
 * CONCEPTS pop-up.
 *
 * Shell only: this component renders the wizard, the three stage cards and the
 * empty result slots. It does not call CGPT, GPT2 or NBP, does not estimate or
 * confirm spend, and holds no run state. Every handler arrives as a prop and is
 * passed straight through, so Composer can bind the real pipeline without
 * touching the composition.
 *
 * Mobile and desktop are composed, not scaled. On phones the panel is a
 * full-height editorial sheet whose stage cards scroll horizontally in a
 * snapping rail; from 900px the same cards sit in a balanced three-column
 * workbench with the progression rail spanning above them.
 */

import type { ReactNode } from 'react';

import {
  PAGE_CONCEPT_DEFAULT_STAGE_STATE,
  PAGE_CONCEPT_GENERATOR_FOOTER,
  PAGE_CONCEPT_GENERATOR_STAGES,
  PAGE_CONCEPT_GENERATOR_SUMMARY,
  PAGE_CONCEPT_GENERATOR_TITLE,
  PAGE_CONCEPT_STATE_ICON,
  PAGE_CONCEPT_STATE_LABEL,
  pageConceptGeneratorTargetLine,
  type PageConceptRenditionGroup,
  type PageConceptStageId,
  type PageConceptStageShell,
  type PageConceptStageState,
} from '../../../../../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';
import { AiConsoleIcon } from '../aiConsoles/AiConsoleIcon';
import '../../../styles/site00-page-concept-generator.css';

export type PageConceptGeneratorResultSlots = {
  /** Composer fills these; the shell only reserves and frames them. */
  cgptBrief?: ReactNode;
  authorityImage?: ReactNode;
  renditions?: Partial<Record<string, ReactNode>>;
  /** When set, replaces the static NBP groups (Composer carousel / live slots). */
  nbpStageOverride?: ReactNode;
};

export type PageConceptGeneratorPanelProps = {
  projectLabel: string;
  pageLabel: string;
  stageStates?: Partial<Record<PageConceptStageId, PageConceptStageState>>;
  results?: PageConceptGeneratorResultSlots;
  generateDisabled?: boolean;
  generateDisabledReason?: string | null;
  generateBusyLabel?: string | null;
  /** Surfaced verbatim in the footer; the shell never interprets it. */
  notice?: string | null;
  noticeTestId?: string;
  reviewBanner?: string | null;
  footSpendNote?: string | null;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    testId?: string;
  } | null;
  onGenerate?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
};

function StatusChip({ state }: { state: PageConceptStageState }) {
  return (
    <span className="s00-pcg__chip" data-state={state}>
      <span className="s00-pcg__chipGlyph" aria-hidden="true">
        <AiConsoleIcon name={PAGE_CONCEPT_STATE_ICON[state]} size={10} />
      </span>
      {PAGE_CONCEPT_STATE_LABEL[state]}
    </span>
  );
}

function ProgressionRail({
  stages,
  stageStates,
}: {
  stages: readonly PageConceptStageShell[];
  stageStates: Record<PageConceptStageId, PageConceptStageState>;
}) {
  return (
    <ol className="s00-pcg__rail" aria-label="Concept generation progression">
      {stages.map((stage, index) => {
        const state = stageStates[stage.id];
        return (
          <li
            className="s00-pcg__railItem"
            key={stage.id}
            data-stage-id={stage.id}
            data-stage-state={state}
          >
            <div className="s00-pcg__railTrack" aria-hidden="true">
              <span className="s00-pcg__railLine s00-pcg__railLine--before" data-edge={index === 0 ? 'end' : 'mid'} />
              <span className="s00-pcg__node">{stage.step}</span>
              <span
                className="s00-pcg__railLine s00-pcg__railLine--after"
                data-edge={index === stages.length - 1 ? 'end' : 'mid'}
              />
            </div>
            <span className="s00-pcg__railTitle">{stage.progressionTitle}</span>
            <span className="s00-pcg__railNote">{stage.progressionNote}</span>
            <StatusChip state={state} />
          </li>
        );
      })}
    </ol>
  );
}

function ResultFrame({
  slotId,
  ratio,
  children,
  emptyLabel,
}: {
  slotId: string;
  ratio: 'page' | 'thumb' | 'wide';
  children?: ReactNode;
  emptyLabel: string;
}) {
  return (
    <div className="s00-pcg__frame" data-result-slot={slotId} data-ratio={ratio}>
      {children ?? (
        <span className="s00-pcg__frameEmpty">
          <span className="s00-pcg__frameGlyph" aria-hidden="true">
            <AiConsoleIcon name="empty-concept" size={18} />
          </span>
          {emptyLabel ? <span>{emptyLabel}</span> : null}
        </span>
      )}
    </div>
  );
}

function RenditionGroup({
  group,
  slots,
}: {
  group: PageConceptRenditionGroup;
  slots: Partial<Record<string, ReactNode>>;
}) {
  return (
    <section className="s00-pcg__group" aria-label={group.label}>
      <header className="s00-pcg__groupHead">
        <span className="s00-pcg__groupGlyph" aria-hidden="true">
          <AiConsoleIcon name={group.icon} size={11} />
        </span>
        {group.label}
      </header>
      <div className="s00-pcg__groupRail">
        {group.slots.map((slot) => (
          <figure className="s00-pcg__rendition" key={slot.id}>
            {/* A desktop rendition is a landscape frame — showing it in a phone
                aspect would misrepresent what the founder is approving. */}
            {/* The caption already names the rendition — repeating it inside the
                frame reads as content that isn't there yet. */}
            <ResultFrame slotId={slot.id} ratio={group.id === 'MOBILE' ? 'thumb' : 'wide'} emptyLabel="">
              {slots[slot.id]}
            </ResultFrame>
            <figcaption className="s00-pcg__renditionCap">{slot.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function StageCard({
  stage,
  state,
  results,
}: {
  stage: PageConceptStageShell;
  state: PageConceptStageState;
  results: PageConceptGeneratorResultSlots;
}) {
  return (
    <article className="s00-pcg__card" data-stage-id={stage.id} data-stage-state={state}>
      <header className="s00-pcg__cardHead">
        <span className="s00-pcg__step">{stage.stepLabel}</span>
        <span className="s00-pcg__tag">
          <span className="s00-pcg__tagGlyph" aria-hidden="true">
            <AiConsoleIcon name={stage.icon} size={10} />
          </span>
          {stage.tag}
        </span>
      </header>
      <h3 className="s00-pcg__cardTitle">{stage.title}</h3>
      <p className="s00-pcg__cardSub">{stage.subtitle}</p>

      <div className="s00-pcg__cardBody">
        {stage.resultKind === 'BRIEF' && stage.briefRows ?
          <ul className="s00-pcg__brief" data-result-slot={stage.resultSlotId}>
            {results.cgptBrief ??
              stage.briefRows.map((row) => (
                <li className="s00-pcg__briefRow" key={row.id} data-lead={row.lead ? 'true' : undefined}>
                  <span className="s00-pcg__briefGlyph" aria-hidden="true">
                    <AiConsoleIcon name={row.icon} size={10} />
                  </span>
                  {row.label}
                </li>
              ))}
          </ul>
        : null}

        {stage.resultKind === 'AUTHORITY_IMAGE' ?
          <ResultFrame slotId={stage.resultSlotId} ratio="page" emptyLabel="AUTHORITY CONCEPT PENDING">
            {results.authorityImage}
          </ResultFrame>
        : null}

        {stage.resultKind === 'RENDITION_GROUPS' && stage.renditionGroups ?
          results.nbpStageOverride ?? (
            <div className="s00-pcg__groups" data-result-slot={stage.resultSlotId}>
              {stage.renditionGroups.map((group) => (
                <RenditionGroup key={group.id} group={group} slots={results.renditions ?? {}} />
              ))}
              <div className="s00-pcg__paging" aria-hidden="true">
                <span className="s00-pcg__pageArrow" data-dir="prev">
                  <AiConsoleIcon name="preview-prev" size={10} />
                </span>
                <span className="s00-pcg__dots">
                  {Array.from({ length: stage.pagingDots ?? 3 }).map((_, index) => (
                    <span className="s00-pcg__dot" key={index} data-active={index === 0 ? 'true' : undefined} />
                  ))}
                </span>
                <span className="s00-pcg__pageArrow" data-dir="next">
                  <AiConsoleIcon name="preview-next" size={10} />
                </span>
              </div>
            </div>
          )
        : null}
      </div>

      <footer className="s00-pcg__cardFoot">
        <span className="s00-pcg__outGlyph" aria-hidden="true">
          <AiConsoleIcon name="grok-manifest" size={12} />
        </span>
        <span className="s00-pcg__outText">
          <span className="s00-pcg__outLabel">{stage.outputLabel}</span>
          <span className="s00-pcg__outNote">{stage.outputNote}</span>
        </span>
      </footer>
    </article>
  );
}

export function PageConceptGeneratorPanel({
  projectLabel,
  pageLabel,
  stageStates,
  results = {},
  generateDisabled,
  generateDisabledReason,
  generateBusyLabel,
  notice,
  noticeTestId,
  reviewBanner,
  footSpendNote,
  secondaryAction,
  onGenerate,
  onCancel,
  onClose,
}: PageConceptGeneratorPanelProps) {
  const states: Record<PageConceptStageId, PageConceptStageState> = {
    ...PAGE_CONCEPT_DEFAULT_STAGE_STATE,
    ...stageStates,
  };
  const dismiss = onCancel ?? onClose;

  return (
    <section
      className="s00-pcg"
      role="dialog"
      aria-modal="true"
      aria-label={PAGE_CONCEPT_GENERATOR_TITLE}
      data-testid="page-concept-generator-shell"
    >
      <header className="s00-pcg__head">
        <div className="s00-pcg__headRow">
          <h2 className="s00-pcg__title">{PAGE_CONCEPT_GENERATOR_TITLE}</h2>
          <button
            type="button"
            className="s00-pcg__dismiss"
            data-interaction-id="page-concepts-dismiss"
            onClick={() => (onClose ?? onCancel)?.()}
          >
            <AiConsoleIcon name="action-close" size={11} />
            {PAGE_CONCEPT_GENERATOR_FOOTER.cancelLabel}
          </button>
        </div>
        <p className="s00-pcg__target">{pageConceptGeneratorTargetLine(projectLabel, pageLabel)}</p>
      </header>

      <div className="s00-pcg__summary" aria-label="Concept generation plan">
        <span className="s00-pcg__summaryGlyph" aria-hidden="true">
          <AiConsoleIcon name="grok-library" size={16} />
        </span>
        {PAGE_CONCEPT_GENERATOR_SUMMARY.map((metric) => (
          <span className="s00-pcg__metric" key={metric.id}>
            <strong className="s00-pcg__metricCount">{metric.count}</strong>
            <span className="s00-pcg__metricLabel">{metric.label}</span>
            {'note' in metric && metric.note ?
              <span className="s00-pcg__metricNote">{metric.note}</span>
            : null}
          </span>
        ))}
      </div>

      <div className="s00-pcg__scroll">
        <ProgressionRail stages={PAGE_CONCEPT_GENERATOR_STAGES} stageStates={states} />

        <div className="s00-pcg__cards">
          {PAGE_CONCEPT_GENERATOR_STAGES.map((stage) => (
            <StageCard key={stage.id} stage={stage} state={states[stage.id]} results={results} />
          ))}
        </div>
      </div>

      <footer className="s00-pcg__foot">
        {reviewBanner ?
          <p className="s00-pcg__reviewBanner" role="status" data-testid="page-concept-review-banner">
            {reviewBanner}
          </p>
        : null}
        {notice ?
          <p className="s00-pcg__notice" role="status" data-testid={noticeTestId}>
            <span className="s00-pcg__noticeGlyph" aria-hidden="true">
              <AiConsoleIcon name="status-error" size={11} />
            </span>
            {notice}
          </p>
        : null}
        <p className="s00-pcg__footNotes">
          <span className="s00-pcg__footNote">
            <span className="s00-pcg__footGlyph" aria-hidden="true">
              <AiConsoleIcon name="status-pending" size={11} />
            </span>
            {PAGE_CONCEPT_GENERATOR_FOOTER.progressionNote}
          </span>
          <span className="s00-pcg__footSpend">{footSpendNote ?? PAGE_CONCEPT_GENERATOR_FOOTER.spendNote}</span>
        </p>
        <div className="s00-pcg__actions">
          {secondaryAction ?
            <button
              type="button"
              className="s00-pcg__retry"
              data-interaction-id="page-concepts-retry-failed"
              data-testid={secondaryAction.testId}
              disabled={secondaryAction.disabled}
              onClick={() => secondaryAction.onClick()}
            >
              {secondaryAction.label}
            </button>
          : null}
          <button
            type="button"
            className="s00-pcg__generate"
            data-interaction-id="page-concepts-generate"
            disabled={generateDisabled}
            title={generateDisabled ? generateDisabledReason ?? undefined : undefined}
            onClick={() => onGenerate?.()}
          >
            <span className="s00-pcg__generateGlyph" aria-hidden="true">
              <AiConsoleIcon name="grok-generate" size={14} />
            </span>
            {generateBusyLabel || PAGE_CONCEPT_GENERATOR_FOOTER.generateLabel}
          </button>
          <button
            type="button"
            className="s00-pcg__cancel"
            data-interaction-id="page-concepts-cancel"
            onClick={() => dismiss?.()}
          >
            {PAGE_CONCEPT_GENERATOR_FOOTER.cancelLabel}
          </button>
        </div>
      </footer>
    </section>
  );
}
