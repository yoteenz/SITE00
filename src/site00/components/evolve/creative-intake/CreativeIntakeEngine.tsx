import { Link } from 'react-router-dom';
import { useState } from 'react';
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
  const [draftSavedFlash, setDraftSavedFlash] = useState(false);

  if (!stage) return null;

  function handleAdvance() {
    if (!isLast) {
      goNext();
      return;
    }
    onComplete(form);
  }

  function handleSaveDraft() {
    setDraftSavedFlash(true);
    window.setTimeout(() => setDraftSavedFlash(false), 2000);
  }

  const stageNum = String(stageIndex + 1).padStart(2, '0');

  return (
    <CreativeIntakeShell
      experience={experience}
      serviceTitle={hideHeading ? '' : service.title}
      serviceDescription={service.tagline}
      stageIndex={stageIndex}
      progress={progress}
      artifact={renderSignatureArtifact({ experience, form, stageIndex })}
    >
      {draftRecovered ? (
        <p className="site00-creative-intake__draft-note">DRAFT RECOVERED — YOUR PROGRESS WAS RESTORED.</p>
      ) : null}
      {draftSavedFlash ? <p className="site00-creative-intake__draft-note is-flash">DRAFT SAVED.</p> : null}

      <p className="site00-creative-intake__stage-index">{stageNum} / {stage.progressLabel}</p>
      <h2 id="creative-intake-prompt" className="site00-creative-intake__prompt">{stage.prompt}</h2>
      <p className="site00-creative-intake__hint">{stage.hint}</p>

      <CreativeIntakeFields fields={stage.fields} form={form} onChange={updateField} />

      {errors.length ? (
        <ul className="site00-creative-intake__errors" role="alert">
          {errors.map((e) => (
            <li key={e}>{e.toUpperCase()}</li>
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
        <button type="button" className="site00-btn site00-btn--ghost site00-creative-intake__save-draft" onClick={handleSaveDraft} disabled={busy} aria-label="SAVE DRAFT">
          SAVE DRAFT
        </button>
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
