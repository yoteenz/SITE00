/**
 * P0.CJ.2 — Real brand case profile (grounding source visible).
 */

import type { BrandCaseProfile } from '../../../../../../shared/site00-expression-engine/creative-judgment-presentation/types.js';

type Props = {
  profile: BrandCaseProfile;
};

export function BrandCaseProfilePanel({ profile }: Props) {
  return (
    <section className="site00-cj-brand-case">
      <header>
        <h3>{profile.brandName.toUpperCase()}</h3>
        <span className={`site00-cj-brand-case__grounding is-${profile.groundingMode.replace(/_/g, '-')}`}>
          {profile.groundingLabel}
        </span>
      </header>
      <dl>
        <div><dt>CATEGORY</dt><dd>{profile.category}</dd></div>
        <div><dt>WEBSITE</dt><dd>{profile.websiteUrl ?? '—'}</dd></div>
        <div><dt>LIVE FETCH</dt><dd>{profile.liveFetchAvailable ? 'AVAILABLE' : 'NOT ENABLED — USE UPLOADS OR PROFILE'}</dd></div>
        <div><dt>ESSENCE</dt><dd>{profile.brandEssence}</dd></div>
        <div><dt>AUDIENCE</dt><dd>{profile.targetAudience}</dd></div>
        <div><dt>PRODUCT LINE</dt><dd>{profile.productLineSummary}</dd></div>
        <div><dt>VISUAL LANGUAGE</dt><dd>{profile.visualLanguageNotes}</dd></div>
        <div><dt>PACKAGING</dt><dd>{profile.packagingCues}</dd></div>
        <div><dt>POSITIONING</dt><dd>{profile.positioningNotes}</dd></div>
      </dl>
      {profile.founderReferences.length ? (
        <ul className="site00-cj-brand-case__refs">
          {profile.founderReferences.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
