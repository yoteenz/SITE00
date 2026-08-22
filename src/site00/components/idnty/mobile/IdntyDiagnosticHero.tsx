import { IDNTY_STATE_COPY } from '../../../config/identity';
import { IdntyDiagnosticHeroArtwork } from './IdntyDiagnosticHeroArtwork';

export function IdntyDiagnosticHero() {
  return (
    <header className="site00-idnty-diagnostic-hero">
      <div className="site00-idnty-diagnostic-hero__copy">
        <p className="site00-idnty-diagnostic-hero__kicker">
          <span className="site00-idnty-diagnostic-hero__kicker-red">IDNTY /</span>
        </p>
        <h1 className="site00-idnty-diagnostic-hero__title">IDENTITY DIAGNOSTIC</h1>
        <span className="site00-idnty-diagnostic-hero__divider" aria-hidden="true" />
        <p className="site00-idnty-diagnostic-hero__question">{IDNTY_STATE_COPY.headline}</p>
        <p className="site00-idnty-diagnostic-hero__desc">{IDNTY_STATE_COPY.subhead}</p>
      </div>
      <IdntyDiagnosticHeroArtwork />
    </header>
  );
}
