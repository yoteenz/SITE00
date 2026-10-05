import type { ReactNode } from 'react';
import type { IdntyAssessmentOption, IdntyAssessmentStateConfig } from '../../config/idnty-assessment';
import {
  CONDITION_SEGMENTS,
  identityStepPresentation,
  type IdentityOptionIconId,
} from '../../config/idnty-public-redesign';
import type { IdntyStepAnswers } from '../../hooks/useIdntyAssessment';
import { PublicLineIcon } from './PublicLineIcon';

type ReviewSummaryProps = {
  state: IdntyAssessmentStateConfig;
  answers: IdntyStepAnswers;
  onEdit: (stepId: string) => void;
};

function asArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function labelFor(options: IdntyAssessmentOption[] | undefined, id: string): string {
  return options?.find((o) => o.id === id)?.label ?? id;
}

function stepOptions(state: IdntyAssessmentStateConfig, stepId: string) {
  return state.steps.find((s) => s.id === stepId)?.options;
}

function labels(state: IdntyAssessmentStateConfig, stepId: string, value: string | string[] | undefined): string[] {
  return asArray(value).map((id) => labelFor(stepOptions(state, stepId), id));
}

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="s00pr-review__edit" onClick={onClick} aria-label={`EDIT ${label}`}>
      EDIT
    </button>
  );
}

function Row({
  icon,
  heading,
  children,
  onEdit,
  editLabel,
}: {
  icon: IdentityOptionIconId;
  heading: string;
  children: ReactNode;
  onEdit: () => void;
  editLabel: string;
}) {
  return (
    <div className="s00pr-review__row">
      <PublicLineIcon id={icon} size={34} className="s00pr-review__icon" />
      <span className="s00pr-review__vr" aria-hidden="true" />
      <div className="s00pr-review__content">
        <p className="s00pr-review__heading">{heading}</p>
        {children}
      </div>
      <EditButton onClick={onEdit} label={editLabel} />
    </div>
  );
}

const textOrDash = (value: string | string[] | undefined) => {
  const text = Array.isArray(value) ? value.join(', ') : (value ?? '');
  return text.trim() || '—';
};

function FoundationReview({ state, answers, onEdit }: ReviewSummaryProps) {
  const goal = labels(state, 'goal', answers.goal)[0] ?? '—';
  const other = textOrDash(answers['goal-other']);
  const goalIsOther = asArray(answers.goal)[0] === 'other';
  return (
    <>
      <Row icon="target" heading="PRIMARY GOAL" onEdit={() => onEdit('goal')} editLabel="PRIMARY GOAL">
        <p className="s00pr-review__value s00pr-review__value--strong">{goalIsOther && other !== '—' ? `${goal}: ${other}` : goal}</p>
      </Row>
      <Row icon="people" heading="AUDIENCE" onEdit={() => onEdit('audience')} editLabel="AUDIENCE">
        <p className="s00pr-review__value s00pr-review__value--user">{textOrDash(answers.audience)}</p>
      </Row>
      <Row icon="cube" heading="PROJECT PARAMETERS" onEdit={() => onEdit('timeline')} editLabel="PROJECT PARAMETERS">
        <div className="s00pr-review__pair">
          <div>
            <p className="s00pr-review__mini">TIMELINE</p>
            <p className="s00pr-review__value s00pr-review__value--strong">{labels(state, 'timeline', answers.timeline)[0] ?? '—'}</p>
          </div>
          <div>
            <p className="s00pr-review__mini">BUDGET</p>
            <p className="s00pr-review__value s00pr-review__value--strong">{labels(state, 'budget', answers.budget)[0] ?? '—'}</p>
          </div>
        </div>
      </Row>
    </>
  );
}

function RefineReview({ state, answers, onEdit }: ReviewSummaryProps) {
  const assetIcons = identityStepPresentation('some-pieces-exist', 'assets')?.icons;
  const existing = asArray(answers.assets);
  const condition = asArray(answers['cohesion-diagnostic'])[0] ?? '';
  const segments = CONDITION_SEGMENTS[condition] ?? 0;
  const gaps = labels(state, 'gaps', answers.gaps);
  const otherText = (Array.isArray(answers['other-specify']) ? answers['other-specify'][0] : answers['other-specify']) ?? '';
  return (
    <div className="s00pr-review__split">
      <div className="s00pr-review__col">
        <div className="s00pr-review__colhead">
          <p className="s00pr-review__heading">EXISTING</p>
          <EditButton onClick={() => onEdit('assets')} label="EXISTING" />
        </div>
        <ul className="s00pr-review__iconlist">
          {existing.length === 0 ? <li className="s00pr-review__value">—</li> : null}
          {existing.map((id) => (
            <li key={id}>
              <PublicLineIcon id={assetIcons?.[id] ?? 'dots'} size={26} />
              <span>{id === 'other' && otherText.trim() ? `OTHER: ${otherText.trim()}` : labelFor(stepOptions(state, 'assets'), id)}</span>
            </li>
          ))}
        </ul>
      </div>
      <span className="s00pr-review__vr s00pr-review__vr--tall" aria-hidden="true" />
      <div className="s00pr-review__col">
        <div className="s00pr-review__colhead">
          <p className="s00pr-review__heading">CURRENT CONDITION</p>
          <EditButton onClick={() => onEdit('cohesion-diagnostic')} label="CURRENT CONDITION" />
        </div>
        <p className="s00pr-review__value">{labels(state, 'cohesion-diagnostic', condition)[0] ?? '—'}</p>
        <span className="s00pr-review__meter" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < segments ? 's00pr-review__meter-seg s00pr-review__meter-seg--on' : 's00pr-review__meter-seg'} />
          ))}
        </span>
        <div className="s00pr-review__colhead s00pr-review__colhead--gaps">
          <p className="s00pr-review__heading">GAPS</p>
          <EditButton onClick={() => onEdit('gaps')} label="GAPS" />
        </div>
        <ul className="s00pr-review__pluslist">
          {gaps.length === 0 ? <li>—</li> : null}
          {gaps.map((gap) => (
            <li key={gap}>
              <span className="s00pr-review__plus" aria-hidden="true">
                +
              </span>
              {gap}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EvolutionReview({ state, answers, onEdit }: ReviewSummaryProps) {
  const areas = labels(state, 'pathways', answers.pathways);
  return (
    <>
      <Row icon="wave" heading="AREAS TO EVOLVE" onEdit={() => onEdit('pathways')} editLabel="AREAS TO EVOLVE">
        <ul className="s00pr-review__pluslist">
          {areas.length === 0 ? <li>—</li> : null}
          {areas.map((area) => (
            <li key={area}>
              <span className="s00pr-review__plus" aria-hidden="true">
                +
              </span>
              {area}
            </li>
          ))}
        </ul>
      </Row>
      <Row icon="target" heading="EVOLUTION GOAL" onEdit={() => onEdit('goals')} editLabel="EVOLUTION GOAL">
        <p className="s00pr-review__value s00pr-review__value--user">{textOrDash(answers.goals)}</p>
      </Row>
      <Row icon="cube" heading="PROJECT PARAMETER" onEdit={() => onEdit('timeline')} editLabel="PROJECT PARAMETER">
        <p className="s00pr-review__value">TIMELINE — {labels(state, 'timeline', answers.timeline)[0] ?? '—'}</p>
      </Row>
    </>
  );
}

/** Review MODE of the lower panel for the three assessment branches. (Build Ready has its own.) */
export function IdentityReviewSummary(props: ReviewSummaryProps) {
  return (
    <div className="s00pr-review" data-review-state={props.state.id}>
      <p className="s00pr-review__intro">REVIEW YOUR RESPONSES BEFORE SUBMITTING.</p>
      {props.state.id === 'starting-at-zero' ? <FoundationReview {...props} /> : null}
      {props.state.id === 'some-pieces-exist' ? <RefineReview {...props} /> : null}
      {props.state.id === 'ready-for-evolution' ? <EvolutionReview {...props} /> : null}
    </div>
  );
}
