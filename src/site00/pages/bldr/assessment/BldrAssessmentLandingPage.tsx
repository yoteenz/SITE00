import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBldrAssessmentState,
  bldrAssessmentPath,
  bldrAssessmentFirstStepId,
  type BldrAssessmentStateId,
} from '../../../config/bldr-assessment';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { BldrAssessmentShell, BldrAssessmentActions } from '../../../components/bldr-assessment/BldrAssessmentShell';
import { IdntyProcessStripPanel } from '../../../components/idnty-assessment/IdntyAssessmentPanels';
import {
  BldrScopeFields,
  validateBldrFields,
  BldrDiscoveryProgress,
} from '../../../components/bldr-assessment/BldrScopeFields';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { SITE00_ROUTES, site00BldrAssessmentDesktopPath } from '../../../config/routes';

type BldrAssessmentLandingPageProps = {
  classSlug: BldrAssessmentStateId;
};

export default function BldrAssessmentLandingPage({ classSlug }: BldrAssessmentLandingPageProps) {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getBldrAssessmentState(classSlug)!;
  const { startClass, setStepAnswers, markStepComplete, getAnswersForClass } = useBldrAssessment();

  const existing = getAnswersForClass(classSlug);
  const [values, setValues] = useState<Record<string, string | string[]>>(() => {
    const init: Record<string, string | string[]> = {};
    for (const f of state.landingFields) {
      init[f.id] = existing[f.id] ?? (f.type === 'multi' ? [] : '');
    }
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    startClass(classSlug);
  }, [classSlug, startClass]);

  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00BldrAssessmentDesktopPath(path) : path);
  };

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleNext = () => {
    const fieldErrors = validateBldrFields(state.landingFields, values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setStepAnswers(classSlug, 'landing', values);
    for (const f of state.landingFields) {
      markStepComplete(classSlug, f.id);
    }

    const firstStep = bldrAssessmentFirstStepId(state);
    if (firstStep) {
      navigateTo(bldrAssessmentPath(classSlug, firstStep));
    } else {
      navigateTo(bldrAssessmentPath(classSlug, 'review'));
    }
  };

  const handleSaveExit = () => {
    setStepAnswers(classSlug, 'landing', values);
    navigate(SITE00_ROUTES.bldrState);
  };

  const discoveryStep = classSlug === 'not-sure' ? 1 : null;

  const panel = (
    <div className="site00-idnty-assessment-card">
      <p className="site00-bldr-context-label">{state.contextLabel}</p>
      <h2 className="site00-idnty-assessment-card__title">{state.landingTitle}</h2>
      {state.landingSubtitle ? (
        <p className="site00-idnty-assessment-card__subtitle">{state.landingSubtitle}</p>
      ) : null}

      {discoveryStep ? <BldrDiscoveryProgress current={discoveryStep} /> : null}

      <BldrScopeFields fields={state.landingFields} values={values} onChange={handleFieldChange} errors={errors} />

      <BldrAssessmentActions
        primaryLabel={state.primaryCta}
        onPrimary={handleNext}
        secondaryLabel={state.secondaryCta}
        onSecondary={handleSaveExit}
      />
    </div>
  );

  return (
    <BldrAssessmentShell
      state={state}
      panel={panel}
      processStrip={<IdntyProcessStripPanel strip={state.processStrip} />}
    />
  );
}
