import { Link } from 'react-router-dom';
import {
  buildAccessCredentialCanonicalAuditUrl,
  buildAccessCredentialDebugUrl,
  type AccessCredentialDebugState,
} from '../../config/access-debug';
import { buildAccessCredentialPublicPath } from '../../config/access-credentials';

type AccessCredentialDebugToolbarProps = {
  state: AccessCredentialDebugState;
  code: string;
  staticAuthorized: boolean;
  layout: 'desktop' | 'mobile';
};

const STATE_OPTIONS: { id: AccessCredentialDebugState; label: string }[] = [
  { id: 'recognized', label: 'RECOGNIZED' },
  { id: 'not_found', label: 'NOT FOUND' },
  { id: 'closed', label: 'CLOSED' },
  { id: 'inactive', label: 'INACTIVE' },
  { id: 'loading', label: 'LOADING' },
];

/** Fixed audit controls — design QA for Founder Card access landing. */
export function AccessCredentialDebugToolbar({
  state,
  code,
  staticAuthorized,
  layout,
}: AccessCredentialDebugToolbarProps) {
  const canonicalUrl = buildAccessCredentialCanonicalAuditUrl(code);
  const productionPath = buildAccessCredentialPublicPath(code);

  return (
    <aside className="site00-access-debug" aria-label="ACCESS PAGE DEBUG AUDIT">
      <div className="site00-access-debug__bar">
        <span className="site00-access-debug__badge">DEBUG</span>
        <span className="site00-access-debug__label">STATE</span>
        <nav className="site00-access-debug__states" aria-label="Credential state preview">
          {STATE_OPTIONS.map((option) => (
            <Link
              key={option.id}
              to={buildAccessCredentialDebugUrl({
                state: option.id,
                code,
                staticAuthorized,
                layout,
              })}
              className={`site00-access-debug__chip ${state === option.id ? 'site00-access-debug__chip--active' : ''}`.trim()}
              aria-current={state === option.id ? 'true' : undefined}
            >
              {option.label}
            </Link>
          ))}
        </nav>

        <span className="site00-access-debug__label">LAYOUT</span>
        <nav className="site00-access-debug__states" aria-label="Layout preview">
          <Link
            to={buildAccessCredentialDebugUrl({ state, code, staticAuthorized, layout: 'desktop' })}
            className={`site00-access-debug__chip ${layout === 'desktop' ? 'site00-access-debug__chip--active' : ''}`.trim()}
          >
            DESKTOP
          </Link>
          <Link
            to={buildAccessCredentialDebugUrl({ state, code, staticAuthorized, layout: 'mobile' })}
            className={`site00-access-debug__chip ${layout === 'mobile' ? 'site00-access-debug__chip--active' : ''}`.trim()}
          >
            MOBILE
          </Link>
        </nav>

        <Link
          to={buildAccessCredentialDebugUrl({
            state,
            code,
            staticAuthorized: !staticAuthorized,
            layout,
          })}
          className={`site00-access-debug__chip ${staticAuthorized ? 'site00-access-debug__chip--active' : ''}`.trim()}
        >
          STATIC
        </Link>

        <Link to={productionPath} className="site00-access-debug__link">
          LIVE ROUTE →
        </Link>
      </div>

      <p className="site00-access-debug__canonical">
        <span className="site00-access-debug__label">CANONICAL URL</span>
        <code>{canonicalUrl}</code>
      </p>
    </aside>
  );
}
