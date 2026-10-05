import { Link } from 'react-router-dom';
import { BldrAssessmentActions } from '../../bldr-assessment/BldrAssessmentShell';
import { BldrProgressHeader } from './BldrProgressHeader';
import { BldrIntakeFields, BldrDiscoveryProgressRail } from './BldrIntakeFields';
import type { BldrAssessmentStateConfig, BldrAssessmentStep } from '../../../config/bldr-assessment';
import { getBldrIntakePhase } from '../../../config/bldr-intake-phases';
import { SITE00_ROUTES } from '../../../config/routes';

type BldrIntakeLandingPanelProps = {
  state: BldrAssessmentStateConfig;
  values: Record<string, string | string[]>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: string | string[]) => void;
  onPrimary: () => void;
  onSecondary: () => void;
};

export function BldrIntakeLandingPanel({
  state,
  values,
  errors,
  onChange,
  onPrimary,
  onSecondary,
}: BldrIntakeLandingPanelProps) {
  const phase = getBldrIntakePhase(state.id, 'landing');
  const isDiscovery = state.id === 'not-sure';

  return (
    <div className="site00-bldr-intake-v2">
      <BldrProgressHeader state={state} phase={phase} mode={isDiscovery ? 'discovery' : 'classification'} />
      {isDiscovery ? <BldrDiscoveryProgressRail current={1} /> : null}
      <div className="site00-bldr-intake-v2__panel">
        <BldrIntakeFields
          fields={state.landingFields}
          values={values}
          onChange={onChange}
          errors={errors}
          sectionPrefix={phase.sectionTitle}
        />
        <BldrAssessmentActions
          primaryLabel={state.primaryCta}
          onPrimary={onPrimary}
          secondaryLabel={isDiscovery ? (state.secondaryCta ?? 'SAVE & EXIT') : 'BACK'}
          onSecondary={isDiscovery ? onSecondary : undefined}
          secondaryHref={!isDiscovery ? SITE00_ROUTES.bldrState : undefined}
        />
      </div>
    </div>
  );
}

type BldrIntakeStepPanelProps = {
  state: BldrAssessmentStateConfig;
  stepId: string;
  stepTitle: string;
  stepSubtitle?: string;
  stepIndex: number;
  stepTotal: number;
  value: string | string[];
  error?: string;
  options?: { id: string; label: string; description?: string }[];
  stepType: 'single' | 'multi' | 'textarea';
  onChange: (value: string | string[]) => void;
  onPrimary: () => void;
  onBack: () => void;
  primaryLabel?: string;
};

export function BldrIntakeStepPanel({
  state,
  stepId,
  stepTitle,
  stepSubtitle,
  stepIndex,
  stepTotal,
  value,
  error,
  options = [],
  stepType,
  onChange,
  onPrimary,
  onBack,
  primaryLabel,
}: BldrIntakeStepPanelProps) {
  const phase = getBldrIntakePhase(state.id, stepId);
  const isDiscovery = state.id === 'not-sure';

  const fieldValues = { [stepId]: value };
  const fields: BldrAssessmentStep[] = [
    {
      id: stepId,
      title: stepTitle,
      subtitle: stepSubtitle,
      type: stepType,
      options,
      required: true,
    },
  ];

  return (
    <div className="site00-bldr-intake-v2">
      <BldrProgressHeader state={state} phase={phase} mode={isDiscovery ? 'discovery' : 'classification'} />
      {isDiscovery ? <BldrDiscoveryProgressRail current={stepIndex} /> : null}
      <div className="site00-bldr-intake-v2__panel">
        <p className="site00-bldr-intake-v2__progress">
          STEP {stepIndex} OF {stepTotal}
        </p>
        <BldrIntakeFields
          fields={fields}
          values={fieldValues}
          onChange={(_, v) => onChange(v)}
          errors={error ? { [stepId]: error } : {}}
          sectionPrefix={phase.sectionTitle}
        />
        <BldrAssessmentActions
          primaryLabel={primaryLabel ?? (isDiscovery ? 'NEXT QUESTION →' : 'NEXT STEP →')}
          onPrimary={onPrimary}
          secondaryLabel="BACK"
          onSecondary={onBack}
        />
      </div>
    </div>
  );
}

type BldrClassificationResultPanelProps = {
  recommendedTitle: string;
  recommendedDescriptor: string;
  reasons: string[];
  onContinue: () => void;
  reviewHref: string;
};

export function BldrClassificationResultPanel({
  recommendedTitle,
  recommendedDescriptor,
  reasons,
  onContinue,
  reviewHref,
}: BldrClassificationResultPanelProps) {
  return (
    <div className="site00-bldr-intake-v2">
      <BldrProgressHeader mode="result" resultTitle={recommendedTitle} />
      <div className="site00-bldr-intake-v2__panel site00-bldr-intake-v2__panel--result">
        <p className="site00-bldr-intake-header__descriptor">{recommendedDescriptor}</p>
        <div className="site00-bldr-intake-result">
          <h2 className="site00-bldr-intake-result__heading">WHY THIS FITS</h2>
          <ul className="site00-bldr-intake-result__reasons">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <div className="site00-bldr-intake-v2__actions">
          <button type="button" className="site00-bldr-class-card__cta site00-bldr-class-card__cta--filled" onClick={onContinue}>
            CONTINUE WITH {recommendedTitle} →
          </button>
          <Link to={reviewHref} className="site00-bldr-intake-v2__secondary-link">
            REVIEW ANSWERS
          </Link>
          <Link to={SITE00_ROUTES.support} className="site00-bldr-intake-v2__secondary-link">
            TALK TO SITE 00 →
          </Link>
        </div>
      </div>
    </div>
  );
}
