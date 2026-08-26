import { clientAppPath } from '../../../../shared/site00-client-app/routes.js';
import { shouldShowWebAppCta } from '../../../../shared/site00-client-app/onboarding.js';
import type { ClientAppOnboardingState } from '../../../../shared/site00-client-app/types.js';
import { CLIENT_APP_INVITATION_COPY } from '../../../../shared/site00-client-app/routes.js';

type ClientAppWebPromotionProps = {
  projectSlug: string;
  onboarding?: ClientAppOnboardingState;
};

export function ClientAppWebPromotion({ projectSlug, onboarding = 'NOT_INVITED' }: ClientAppWebPromotionProps) {
  if (!shouldShowWebAppCta(onboarding)) return null;
  const copy = CLIENT_APP_INVITATION_COPY;
  return (
    <section className="site00-app-web-cta" aria-label="SITE 00 mobile app">
      <div className="site00-app-web-cta__headline">{copy.headline}</div>
      <div className="site00-app-web-cta__sub">{copy.subhead}</div>
      <ul>
        {copy.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <a href={clientAppPath(projectSlug)} className="site00-app-web-cta__btn">
        {copy.ctaLabel}
      </a>
    </section>
  );
}
