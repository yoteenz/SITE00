import type { IdntyAssessmentStateConfig, IdntyAssessmentStateId } from '../../../config/idnty-assessment';
import { getIdentityStateProgress } from '../../../config/identity-state-v2';
import { IdntyBrandStateIcon } from '../IdntyBrandStateIcon';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';

type IdentityStateProgressProps = {
  stateId: IdntyAssessmentStateId;
};

export function IdentityStateProgress({ stateId }: IdentityStateProgressProps) {
  const meta = getIdentityStateProgress(stateId);

  return (
    <nav className="site00-idnty-state-v2__progress" aria-label="IDENTITY STATE PROGRESSION">
      <p className="site00-idnty-state-v2__progress-kicker">IDENTITY STATE</p>
      <p className="site00-idnty-state-v2__progress-fraction">[ {meta.positionLabel} ]</p>
      <ol className="site00-idnty-state-v2__progress-rail">
        {['00', '01', '02', '03'].map((code) => {
          const active = code === meta.code;
          return (
            <li
              key={code}
              className={`site00-idnty-state-v2__progress-step ${active ? 'site00-idnty-state-v2__progress-step--active' : ''}`.trim()}
            >
              <span className="site00-idnty-state-v2__progress-node" aria-current={active ? 'step' : undefined}>
                {code}
              </span>
              {code !== '03' ? <span className="site00-idnty-state-v2__progress-line" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type IdentityStateHeroProps = {
  state: IdntyAssessmentStateConfig;
};

export function IdentityStateHero({ state }: IdentityStateHeroProps) {
  const meta = getIdentityStateProgress(state.id);
  const iconId = state.iconId ?? meta.brandStateId;

  return (
    <header className="site00-idnty-state-v2__hero">
      <div className="site00-idnty-state-v2__hero-copy">
        <p className="site00-idnty-state-v2__hero-kicker">
          IDENTITY / {state.title} / {meta.code}
        </p>
        <p className="site00-idnty-state-v2__hero-code">STATE {meta.code}</p>
        <h1 className="site00-idnty-state-v2__hero-title">{state.title}</h1>
        <p className="site00-idnty-state-v2__hero-declaration">{state.declaration}</p>
        <p className="site00-idnty-state-v2__hero-body">{state.editorialBody}</p>
        <p className="site00-idnty-state-v2__hero-cta">{state.editorialCta}</p>
      </div>
      <div className="site00-idnty-state-v2__hero-art" aria-hidden="true">
        <svg className="site00-idnty-state-v2__hero-geometry" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="62" stroke="rgba(196,30,58,0.1)" strokeWidth="0.75" />
          <circle cx="80" cy="80" r="42" stroke="rgba(196,30,58,0.14)" strokeWidth="0.75" />
          <line x1="80" y1="18" x2="80" y2="142" stroke="rgba(0,0,0,0.06)" strokeWidth="0.75" />
          <line x1="18" y1="80" x2="142" y2="80" stroke="rgba(0,0,0,0.06)" strokeWidth="0.75" />
        </svg>
        <IdntyBrandStateIcon id={iconId} title={state.title} className="site00-idnty-state-v2__hero-icon" />
        <Site00ThreeCornerMark className="site00-idnty-state-v2__hero-mark" />
      </div>
    </header>
  );
}
