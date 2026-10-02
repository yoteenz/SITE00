/** Canonical Production bottom navigation — Production owns its own nav (no global SITE 00 mobile bar). */
import { Link } from 'react-router-dom';
import { hubDeepLink } from '../../../../shared/site00-production-hub/model.js';
import hubIcon from './bottom-nav/01_HUB.png';
import inboxIcon from './bottom-nav/02_INBOX.png';
import designIcon from './bottom-nav/03_DESIGN.png';
import experienceIcon from './bottom-nav/04_EXPERIENCE.png';
import expressionIcon from './bottom-nav/05_EXPRESSION.png';
import libraryIcon from './bottom-nav/06_LIBRARY.png';
import activityIcon from './bottom-nav/07_ACTIVITY.png';

function NavGlyph({ src }: { src: string }) {
  return <span className="ph-nav__glyph" style={{ ['--nav-icon' as string]: `url("${src}")` }} aria-hidden />;
}

export type ProductionNavId = 'hub' | 'inbox' | 'design' | 'experience' | 'expression' | 'library' | 'activity';

export function productionNavHref(id: ProductionNavId, projectId: string): string {
  switch (id) {
    case 'hub':
      return '/production';
    case 'inbox':
      return hubDeepLink({ projectId, target: 'queue' });
    case 'design':
      return hubDeepLink({ projectId, target: 'design' }).split('?')[0]!;
    case 'experience':
      return hubDeepLink({ projectId, target: 'experience' }).split('?')[0]!;
    case 'expression':
      return `/production/${projectId}/expression`;
    case 'library':
      return hubDeepLink({ projectId, target: 'libraries' });
    case 'activity':
      return '/production/activity';
  }
}

const ITEMS: { id: ProductionNavId; label: string; icon: string }[] = [
  { id: 'hub', label: 'HUB', icon: hubIcon },
  { id: 'inbox', label: 'INBOX', icon: inboxIcon },
  { id: 'design', label: 'DESIGN', icon: designIcon },
  { id: 'experience', label: 'EXPERIENCE', icon: experienceIcon },
  { id: 'expression', label: 'EXPRESSION', icon: expressionIcon },
  { id: 'library', label: 'LIBRARY', icon: libraryIcon },
  { id: 'activity', label: 'ACTIVITY', icon: activityIcon },
];

/**
 * Tablet + desktop host nav: one full-width panel, each item is a horizontal [ICON] LABEL pair.
 * Explicit px type only — no zoom, no transform scale, no viewport/container units.
 */
export function ProductionHostNav({
  active,
  projectId,
  inboxCount,
}: {
  active: ProductionNavId | null;
  projectId: string;
  inboxCount: number;
}) {
  return (
    <nav className="pxh-nav" aria-label="Production navigation" data-testid="hub-bottom-nav" data-nav-layout="horizontal">
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        return (
          <Link
            key={it.id}
            to={productionNavHref(it.id, projectId)}
            className={`pxh-nav__item${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`nav-${it.id}`}
          >
            <span className="pxh-nav__icon">
              <span className="pxh-nav__glyph" style={{ ['--nav-icon' as string]: `url("${it.icon}")` }} aria-hidden />
              {it.id === 'inbox' && inboxCount > 0 ? <i className="pxh-nav__dot" aria-hidden /> : null}
              {it.id === 'activity' ? <i className="pxh-nav__dot" aria-hidden /> : null}
            </span>
            <span className="pxh-nav__label">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ProductionBottomNav({
  active,
  projectId,
  inboxCount,
  onActivity,
}: {
  active: ProductionNavId | null;
  projectId: string;
  inboxCount: number;
  onActivity?: () => void;
}) {
  return (
    <nav className="ph-nav" aria-label="Production navigation" data-testid="hub-bottom-nav">
      {ITEMS.map((it) => {
        const isActive = it.id === active;
        const body = (
          <>
            <span className="ph-nav__icon">
              <NavGlyph src={it.icon} />
              {it.id === 'inbox' && inboxCount > 0 ? <sup>{String(inboxCount).padStart(2, '0')}</sup> : null}
            </span>
            <span>{it.label}</span>
          </>
        );
        if (it.id === 'activity' && onActivity)
          return (
            <button key={it.id} type="button" className={`ph-nav__item${isActive ? ' is-active' : ''}`} onClick={onActivity} data-testid="nav-activity">
              {body}
            </button>
          );
        return (
          <Link key={it.id} to={productionNavHref(it.id, projectId)} className={`ph-nav__item${isActive ? ' is-active' : ''}`} aria-current={isActive ? 'page' : undefined} data-testid={`nav-${it.id}`}>
            {body}
          </Link>
        );
      })}
    </nav>
  );
}
