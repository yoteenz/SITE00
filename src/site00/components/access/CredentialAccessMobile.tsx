import type { Site00AccessCredentialPublicView } from '../../config/access-credentials';
import { MobileSiteNavigation } from '../mobile/MobileSiteNavigation';
import { AccessMobileHeader } from './AccessMobileHeader';
import { AccessReticle } from './AccessReticle';
import { AccessProtocolLabel } from './AccessProtocolLabel';
import { AccessProtocolClock } from './AccessProtocolClock';
import { AccessCredentialStatus } from './AccessCredentialStatus';
import { AccessCTA } from './AccessCTA';
import { useAccessRecognitionSequence } from './useAccessRecognitionSequence';

export type CredentialAccessMobileProps = {
  credentialCode: string;
  view?: Site00AccessCredentialPublicView;
  variant: 'recognized' | 'not_found' | 'closed' | 'inactive';
  onEnter?: () => void;
  entering?: boolean;
  staticAuthorized?: boolean;
};

export function CredentialAccessMobile({
  credentialCode,
  view,
  variant,
  onEnter,
  entering,
  staticAuthorized = false,
}: CredentialAccessMobileProps) {
  const sequence = useAccessRecognitionSequence(variant === 'recognized', { immediate: staticAuthorized });
  const isError = variant !== 'recognized';

  const title =
    variant === 'not_found'
      ? 'ACCESS NOT RECOGNIZED'
      : variant === 'closed'
        ? 'ACCESS CLOSED'
        : variant === 'inactive'
          ? 'ACCESS PENDING'
          : 'ACCESS RECOGNIZED';

  const message =
    variant === 'not_found'
      ? 'CREDENTIAL COULD NOT BE VERIFIED.'
      : variant === 'closed'
        ? 'THIS CREDENTIAL IS NO LONGER ACTIVE.'
        : variant === 'inactive'
          ? 'THIS CREDENTIAL HAS NOT BEEN ACTIVATED.'
          : null;

  const ctaLabel = variant === 'not_found' || variant === 'inactive' ? 'RETURN TO SITE 00 →' : 'ENTER SITE 00 →';
  const ctaHref = variant === 'not_found' || variant === 'inactive' ? '/origin' : undefined;

  return (
    <div className="site00-access-page site00-access-page--mobile">
      <AccessMobileHeader />

      <main className="site00-access-main site00-access-main--mobile">
        <AccessProtocolLabel visible={isError || sequence.showProtocol} />

        <AccessReticle
          size="mobile"
          active={isError ? false : sequence.reticleActive}
          muted={isError}
          className={sequence.reticleScanning ? 'site00-access-reticle--scanning' : ''}
        />

        {!isError ? (
          <>
            <AccessProtocolClock visible={sequence.showClock} />
            <h1
              className={`site00-access-title ${sequence.showRecognized ? 'site00-access-title--visible' : ''}`.trim()}
            >
              {title}
            </h1>
            <div
              className={`site00-access-divider ${sequence.showRecognized ? 'site00-access-divider--visible' : ''}`.trim()}
              aria-hidden="true"
            />
            <AccessCredentialStatus
              credentialDisplay={view?.credentialCodeDisplay ?? credentialCode}
              visible={sequence.showCredential}
            />
            <AccessCTA
              label={ctaLabel}
              onClick={onEnter}
              visible={sequence.showEnter}
              disabled={entering}
            />
            <div
              className={`site00-access-detection site00-access-detection--mobile ${sequence.showEnter ? 'site00-access-detection--visible' : ''}`.trim()}
            >
              <span>PHYSICAL CREDENTIAL DETECTED.</span>
              <span>WELCOME TO SITE 00.</span>
            </div>
          </>
        ) : (
          <>
            <h1 className="site00-access-title site00-access-title--visible">{title}</h1>
            {message ? <p className="site00-access-message site00-access-message--visible">{message}</p> : null}
            <AccessCTA
              label={ctaLabel}
              href={variant === 'closed' ? undefined : ctaHref}
              onClick={variant === 'closed' ? onEnter : undefined}
              visible
            />
          </>
        )}
      </main>

      <MobileSiteNavigation active={null} />
    </div>
  );
}
