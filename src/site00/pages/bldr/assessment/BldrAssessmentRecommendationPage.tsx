import { Link, useNavigate } from 'react-router-dom';
import { getBldrAssessmentState, bldrAssessmentPath } from '../../../config/bldr-assessment';
import { useBldrAssessment } from '../../../hooks/useBldrAssessment';
import { BldrAssessmentShell } from '../../../components/bldr-assessment/BldrAssessmentShell';
import { computeBldrRecommendation } from '../../../config/bldr-assessment-recommendation';
import { SITE00_ROUTES, site00BldrAssessmentDesktopPath } from '../../../config/routes';
import { useSite00DesktopArtboardPreview } from '../../../components/shell/Site00DesktopArtboardContext';
import { useEffect } from 'react';

export default function BldrAssessmentRecommendationPage() {
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const state = getBldrAssessmentState('not-sure')!;
  const { getAnswersForClass, completeAssessment } = useBldrAssessment();
  const answers = getAnswersForClass('not-sure');
  const result = computeBldrRecommendation(answers);

  useEffect(() => {
    completeAssessment('not-sure');
  }, [completeAssessment]);

  const recommendedState = getBldrAssessmentState(result.recommended)!;
  const navigateTo = (path: string) => {
    navigate(isDesktop ? site00BldrAssessmentDesktopPath(path) : path);
  };

  const panel = (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--complete">
      <p className="site00-bldr-context-label">{state.contextLabel}</p>
      <p className="site00-idnty-assessment__marker">RECOMMENDATION</p>
      <h2 className="site00-idnty-assessment-card__title">WE RECOMMEND: {recommendedState.title}</h2>

      <div className="site00-idnty-complete-summary">
        <h3 className="site00-idnty-complete-summary__heading">WHY THIS FITS</h3>
        <ul className="site00-bldr-recommendation-reasons">
          {result.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="site00-idnty-complete-actions">
        <button
          type="button"
          className="site00-idnty-assessment__btn-primary"
          onClick={() => navigateTo(bldrAssessmentPath(result.recommended))}
        >
          CONTINUE WITH {recommendedState.title} →
        </button>
        <Link to={bldrAssessmentPath('site')} className="site00-idnty-assessment__btn-secondary">
          VIEW SITE
        </Link>
        <Link to={bldrAssessmentPath('enterprise')} className="site00-idnty-assessment__btn-secondary">
          VIEW ENTERPRISE
        </Link>
        <Link to={SITE00_ROUTES.support} className="site00-idnty-assessment__btn-secondary">
          BOOK DISCOVERY →
        </Link>
      </div>
    </div>
  );

  return <BldrAssessmentShell state={state} panel={panel} showProcessStrip={false} />;
}
