import { Link } from 'react-router-dom';
import { HubArrow, HubPanel, PublicHubPage } from '../components/public-redesign/PublicHubLayouts';
import { EnterMenuIcon } from '../icons';
import { SITE00_DIRECTORY_SECTIONS, SITE00_ENTER_COPY, resolveEnterDirectoryRowHref, type DirectoryRow } from '../config/directory';
import { site00AuthLockedAriaLabel } from '../config/site00-copy';
import { useSignedInFromStorage } from '../../hooks/useSignedInFromStorage';

function EnterRow({ row, isSignedIn }: { row: DirectoryRow; isSignedIn: boolean }) {
  const href = resolveEnterDirectoryRowHref(row.href, row.requiresAuth, isSignedIn);
  const locked = Boolean(row.requiresAuth) && !isSignedIn;
  const body = (
    <>
      {row.enterIcon ? (
        <i className="s00pr-hubdir__icon">
          <EnterMenuIcon id={row.enterIcon} size={20} />
        </i>
      ) : (
        <b className="s00pr-hubdir__num">{row.number}</b>
      )}
      <span>
        <strong className="s00pr-hubdir__title">{row.title}</strong>
        <small className="s00pr-hubdir__desc">{row.description}</small>
      </span>
      <i className="s00pr-hubdir__go">
        <HubArrow size={16} />
      </i>
    </>
  );
  if (!row.enabled) {
    return (
      <div className="s00pr-hubdir__row is-disabled" aria-disabled="true">
        {body}
      </div>
    );
  }
  return (
    <Link to={href} className={`s00pr-hubdir__row${locked ? ' is-locked' : ''}`} aria-label={locked ? site00AuthLockedAriaLabel(row.title) : undefined}>
      {body}
    </Link>
  );
}

export default function EnterPage() {
  const [isSignedIn] = useSignedInFromStorage();
  return (
    <PublicHubPage
      section="origin"
      page="enter"
      envSlotId="ENV.ORIGIN.COLLAPSED"
      crumb={SITE00_ENTER_COPY.locationLabel}
      title={SITE00_ENTER_COPY.welcomeTitle}
      subtitle={SITE00_ENTER_COPY.welcomeSubtitle}
      body={SITE00_ENTER_COPY.welcomeBody}
      width="default"
    >
      <div className="s00pr-hubdirs">
        {SITE00_DIRECTORY_SECTIONS.map((section) => (
          <HubPanel key={section.id} label={section.heading}>
            <nav className="s00pr-hubdir" aria-label={section.heading}>
              {section.rows.map((row) => (
                <EnterRow key={row.id} row={row} isSignedIn={isSignedIn} />
              ))}
            </nav>
          </HubPanel>
        ))}
      </div>
      <p className="s00pr-hubstatus">{SITE00_ENTER_COPY.statusStrip}</p>
    </PublicHubPage>
  );
}
