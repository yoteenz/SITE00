import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import type { Site00AccessCredentialPublicView } from '../../config/access-credentials';
import { AccessCredentialSymbol } from './AccessCredentialSymbol';
import { useAccessRecognitionSequence } from './useAccessRecognitionSequence';

type AccessCredentialPanelProps = {
  view: Site00AccessCredentialPublicView;
  layout: 'mobile' | 'desktop';
  onEnter: () => void;
  entering?: boolean;
};

function RecognitionCopy({
  view,
  phase,
  onEnter,
  entering,
}: {
  view: Site00AccessCredentialPublicView;
  phase: ReturnType<typeof useAccessRecognitionSequence>;
  onEnter: () => void;
  entering?: boolean;
}) {
  const showCredential = phase !== 'init' && phase !== 'lines';
  const showRecognized = phase === 'recognized' || phase === 'authorized' || phase === 'ready';
  const showAuthorized = phase === 'authorized' || phase === 'ready';
  const showEnter = phase === 'ready';

  return (
    <>
      <p className={`site00-access-copy__eyebrow ${showRecognized ? 'is-visible' : ''}`.trim()}>SITE 00</p>
      <h1 className={`site00-access-copy__title ${showRecognized ? 'is-visible' : ''}`.trim()}>ACCESS RECOGNIZED</h1>

      <div className={`site00-access-copy__credential ${showCredential ? 'is-visible' : ''}`.trim()}>
        <span className="site00-access-copy__label">CREDENTIAL</span>
        <span className="site00-access-copy__code">{view.credentialCodeDisplay}</span>
      </div>

      {view.recipientName ? (
        <p className={`site00-access-copy__issued ${showAuthorized ? 'is-visible' : ''}`.trim()}>
          ACCESS ISSUED TO
          <br />
          {view.recipientName.toUpperCase()}
        </p>
      ) : null}

      <p className={`site00-access-copy__status ${showAuthorized ? 'is-visible' : ''}`.trim()}>
        <span className="site00-access-copy__label">STATUS</span>
        <span className="site00-access-copy__status-value">AUTHORIZED</span>
      </p>

      <button
        type="button"
        className={`site00-access-copy__enter ${showEnter ? 'is-visible' : ''}`.trim()}
        onClick={onEnter}
        disabled={!showEnter || entering}
      >
        ENTER SITE 00 →
      </button>
    </>
  );
}

export function AccessCredentialRecognizedPanel({ view, layout, onEnter, entering }: AccessCredentialPanelProps) {
  const phase = useAccessRecognitionSequence(true);

  return (
    <section className={`site00-access-panel site00-access-panel--recognized site00-access-panel--${layout}`.trim()}>
      <div className={`site00-access-panel__symbol ${phase !== 'init' ? 'is-visible' : ''}`.trim()}>
        <AccessCredentialSymbol />
      </div>
      <div className="site00-access-panel__copy">
        <RecognitionCopy view={view} phase={phase} onEnter={onEnter} entering={entering} />
      </div>
      <div className={`site00-access-panel__lines ${phase !== 'init' ? 'is-active' : ''}`.trim()} aria-hidden="true">
        <span className="site00-access-panel__line site00-access-panel__line--h" />
        <span className="site00-access-panel__line site00-access-panel__line--v" />
      </div>
    </section>
  );
}

export function AccessCredentialNotRecognizedPanel({ layout }: { layout: 'mobile' | 'desktop' }) {
  return (
    <section className={`site00-access-panel site00-access-panel--error site00-access-panel--${layout}`.trim()}>
      <AccessCredentialSymbol className="site00-access-symbol--muted" />
      <div className="site00-access-panel__copy">
        <p className="site00-access-copy__eyebrow is-visible">SITE 00</p>
        <h1 className="site00-access-copy__title is-visible">ACCESS NOT RECOGNIZED</h1>
        <p className="site00-access-copy__message is-visible">CREDENTIAL COULD NOT BE VERIFIED.</p>
        <Link to={SITE00_ROUTES.originAlias} className="site00-access-copy__enter is-visible">
          RETURN TO SITE 00 →
        </Link>
      </div>
    </section>
  );
}

export function AccessCredentialClosedPanel({
  layout,
  onEnterPublic,
}: {
  layout: 'mobile' | 'desktop';
  onEnterPublic: () => void;
}) {
  return (
    <section className={`site00-access-panel site00-access-panel--closed site00-access-panel--${layout}`.trim()}>
      <AccessCredentialSymbol className="site00-access-symbol--muted" />
      <div className="site00-access-panel__copy">
        <p className="site00-access-copy__eyebrow is-visible">SITE 00</p>
        <h1 className="site00-access-copy__title is-visible">ACCESS CLOSED</h1>
        <p className="site00-access-copy__message is-visible">THIS CREDENTIAL IS NO LONGER ACTIVE.</p>
        <button type="button" className="site00-access-copy__enter is-visible" onClick={onEnterPublic}>
          ENTER SITE 00 →
        </button>
      </div>
    </section>
  );
}

export function AccessCredentialInactivePanel({ layout }: { layout: 'mobile' | 'desktop' }) {
  return (
    <section className={`site00-access-panel site00-access-panel--inactive site00-access-panel--${layout}`.trim()}>
      <AccessCredentialSymbol className="site00-access-symbol--muted" />
      <div className="site00-access-panel__copy">
        <p className="site00-access-copy__eyebrow is-visible">SITE 00</p>
        <h1 className="site00-access-copy__title is-visible">ACCESS PENDING</h1>
        <p className="site00-access-copy__message is-visible">THIS CREDENTIAL HAS NOT BEEN ACTIVATED.</p>
        <Link to={SITE00_ROUTES.originAlias} className="site00-access-copy__enter is-visible">
          RETURN TO SITE 00 →
        </Link>
      </div>
    </section>
  );
}