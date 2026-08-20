import { Link } from 'react-router-dom';
import type { MarketingServiceDefinition } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import type { MarketingIntakeRecord } from '../../../../../shared/site00-marketing/types';
import { formStateToIntakeRecord } from '../../../../../shared/site00-marketing/creativeIntake/fieldMapping';
import { useCreativeIntake } from '../../../hooks/useCreativeIntake.js';
import { CreativeIntakeShell } from './CreativeIntakeShell.js';
import { CreativeIntakeFields } from './CreativeIntakeFields.js';
import { renderSignatureArtifact } from './SignatureArtifacts.js';
import { SITE00_ROUTES } from '../../../config/routes.js';
import type { MarketingServiceCategory } from '../../../../../shared/site00-marketing/types';

type Props = {
  service: MarketingServiceDefinition;
  busy?: boolean;
  onComplete: (form: Record<string, string | string[]>) => void;
  /** Debug: hide discipline heading for headline-removal QA */
  hideHeading?: boolean;
};

export function CreativeIntakeEngine({ service, busy, onComplete, hideHeading }: Props) {
  const intake = useCreativeIntake(service.id as MarketingServiceCategory);
  const { experience, stage, stageIndex, form, errors, draftRecovered, isLast, progress, updateField, goNext, goBack } = intake;

  if (!stage) return null;

  function handleAdvance() {
    if (!isLast) {
      goNext();
      return;
    }
    onComplete(form);
  }

  return (
    <CreativeIntakeShell
      experience={experience}
      serviceTitle={hideHeading ? '' : service.title}
      stageIndex={stageIndex}
      progress={progress}
      artifact={renderSignatureArtifact({ experience, form, stageIndex })}
    >
      {draftRecovered ? <p className="site00-creative-intake__draft-note">Draft recovered — your progress was restored.</p> : null}

      <p className="site00-creative-intake__stage-label">{stage.progressLabel}</p>
      <h2 id="creative-intake-prompt" className="site00-creative-intake__prompt">{stage.prompt}</h2>
      <p className="site00-creative-intake__hint">{stage.hint}</p>

      <CreativeIntakeFields fields={stage.fields} form={form} onChange={updateField} />

      {errors.length ? (
        <ul className="site00-creative-intake__errors" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      <div className="site00-creative-intake__actions">
        {stageIndex > 0 ? (
          <button type="button" className="site00-btn site00-btn--ghost" onClick={goBack} disabled={busy}>
            ← BACK
          </button>
        ) : (
          <Link className="site00-btn site00-btn--ghost" to={SITE00_ROUTES.evolveMarketingServices}>
            ← SERVICES
          </Link>
        )}
        <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={handleAdvance}>
          {busy ? 'SAVING…' : isLast ? `${experience.completionLanguage} →` : 'CONTINUE →'}
        </button>
      </div>
    </CreativeIntakeShell>
  );
}

/** Standalone completion helper for tests */
export function completeIntakeFromForm(form: Record<string, string | string[]>): MarketingIntakeRecord {
  return formStateToIntakeRecord(form);
}
