import { Link } from 'react-router-dom';
import type { ClientProjectRoomViewModel, ClientProjectPhase, ClientActivityEvent } from '../../../../shared/site00-client-project-room/types.js';
import {
  ClientRoomActivityIcon,
  ClientRoomArrowIcon,
  ClientRoomCheckIcon,
  ClientRoomReviewsIcon,
} from '../../icons/ClientProjectRoomNavIcons';

type ClientProjectRoomOverviewProps = {
  viewModel: ClientProjectRoomViewModel;
};

function mapPhaseClass(state: string): string {
  if (state === 'COMPLETE') return 'is-complete';
  if (state === 'IN_PROGRESS' || state === 'READY_FOR_REVIEW') return 'is-active';
  return '';
}

function mapPhaseStateLabel(state: string): string {
  switch (state) {
    case 'COMPLETE':
      return 'COMPLETE';
    case 'IN_PROGRESS':
      return 'IN PROGRESS';
    case 'READY_FOR_REVIEW':
      return 'READY FOR REVIEW';
    case 'LOCKED':
      return 'LOCKED';
    case 'PAUSED':
      return 'PAUSED';
    default:
      return 'UPCOMING';
  }
}

export function ClientProjectRoomOverview({ viewModel }: ClientProjectRoomOverviewProps) {
  const { header, currentMoment, projectMap, nextForYou, latestActivity } = viewModel.overview;

  return (
    <>
      <header className="site00-cpr-header">
        <div className="site00-cpr-header__row">
          <div>
            <div className="site00-cpr-header__eyebrow">{header.roomLabel}</div>
            <h1 className="site00-cpr-header__title">{header.displayName}</h1>
            <div className="site00-cpr-header__meta">{header.servicesSummary}</div>
            <div className="site00-cpr-header__meta">{header.startDateLabel}</div>
          </div>
          <div className="site00-cpr-header__status-block">
            <div>
              <div className="site00-cpr-header__status-label">STATUS</div>
              <div className="site00-cpr-header__status-value">
                {header.statusLabel}
                <span className="site00-cpr-pulse" aria-hidden="true">
                  <ClientRoomActivityIcon size={14} />
                </span>
              </div>
            </div>
            <div>
              <div className="site00-cpr-header__phase-label">CURRENT PHASE</div>
              <div className="site00-cpr-header__phase-value">{header.currentPhaseLabel}</div>
            </div>
          </div>
        </div>
      </header>

      <section className="site00-cpr-panel" aria-labelledby="cpr-current-moment">
        <div className="site00-cpr-panel__head">
          <h2 id="cpr-current-moment" className="site00-cpr-panel__title">
            CURRENT MOMENT
          </h2>
          {currentMoment.enterReviewRoute ? (
            <Link className="site00-cpr-panel__link" to={currentMoment.enterReviewRoute}>
              ENTER REVIEW &gt;
            </Link>
          ) : null}
        </div>
        <div className="site00-cpr-panel__body site00-cpr-moment">
          <div className="site00-cpr-moment__grid">
            <div className="site00-cpr-moment__copy">
              <span className="site00-cpr-tag">{currentMoment.statusTag}</span>
              <h3 className="site00-cpr-moment__title">{currentMoment.title}</h3>
              <p className="site00-cpr-moment__summary">{currentMoment.summary}</p>
            </div>
            <div className="site00-cpr-moment__preview">
              {currentMoment.previewImageUrl ? (
                <img src={currentMoment.previewImageUrl} alt={currentMoment.previewAlt} />
              ) : (
                <div className="site00-cpr-moment__placeholder">PROJECT PREVIEW</div>
              )}
            </div>
          </div>
          {currentMoment.inlineCtaRoute && currentMoment.inlineCtaLabel ? (
            <Link className="site00-cpr-moment__cta" to={currentMoment.inlineCtaRoute}>
              <span>{currentMoment.inlineCtaLabel}</span>
              <ClientRoomArrowIcon />
            </Link>
          ) : null}
        </div>
      </section>

      <section className="site00-cpr-panel" aria-labelledby="cpr-project-map">
        <div className="site00-cpr-panel__head">
          <h2 id="cpr-project-map" className="site00-cpr-panel__title">
            PROJECT MAP
          </h2>
        </div>
        <div className="site00-cpr-panel__body">
          <div className="site00-cpr-map" role="list">
            {projectMap.map((phase: ClientProjectPhase) => (
              <div
                key={phase.id}
                className={`site00-cpr-map__step ${mapPhaseClass(phase.state)}`}
                role="listitem"
              >
                <div className="site00-cpr-map__node" aria-hidden="true">
                  {phase.state === 'COMPLETE' ? <ClientRoomCheckIcon size={12} /> : phase.index}
                </div>
                <div className="site00-cpr-map__label">{phase.label}</div>
                <div className="site00-cpr-map__state">{mapPhaseStateLabel(phase.state)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {nextForYou ? (
        <section className="site00-cpr-next" aria-labelledby="cpr-next-for-you">
          <div className="site00-cpr-next__icon" aria-hidden="true">
            <ClientRoomReviewsIcon size={20} />
          </div>
          <div className="site00-cpr-next__copy">
            <h2 id="cpr-next-for-you" className="site00-cpr-next__title">
              {nextForYou.title}
            </h2>
            <p className="site00-cpr-next__desc">{nextForYou.description}</p>
          </div>
          <Link className="site00-cpr-btn" to={nextForYou.route}>
            {nextForYou.ctaLabel}
            <ClientRoomArrowIcon size={12} />
          </Link>
        </section>
      ) : (
        <p className="site00-cpr-section-empty">Nothing needed from you right now.</p>
      )}

      <section className="site00-cpr-panel" aria-labelledby="cpr-latest">
        <div className="site00-cpr-panel__head">
          <h2 id="cpr-latest" className="site00-cpr-panel__title">
            LATEST FROM SITE 00
          </h2>
          <Link className="site00-cpr-panel__link" to={`/client/projects/${viewModel.manifest.projectSlug}/activity`}>
            VIEW ALL &gt;
          </Link>
        </div>
        <div className="site00-cpr-panel__body">
          {latestActivity.map((item: ClientActivityEvent) => (
            <div key={item.id} className="site00-cpr-activity__item">
              <div className="site00-cpr-activity__date">{item.dateLabel}</div>
              <div className="site00-cpr-activity__icon" aria-hidden="true">
                <ClientRoomActivityIcon size={14} />
              </div>
              <div className="site00-cpr-activity__text">{item.summary}</div>
              {item.isNew ? <span className="site00-cpr-activity__dot" aria-label="New" /> : null}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function ClientProjectRoomRightRail({ viewModel }: ClientProjectRoomOverviewProps) {
  const rail = viewModel.overview.rightRail;
  if (!rail) return null;

  return (
    <>
      <div className="site00-cpr-rail-card">
        <div className="site00-cpr-rail-card__title">PROJECT STATUS</div>
        <div className="site00-cpr-rail-card__value">{rail.projectStatus.label}</div>
        <div className="site00-cpr-rail-card__detail">{rail.projectStatus.detail}</div>
      </div>
      <div className="site00-cpr-rail-card">
        <div className="site00-cpr-rail-card__title">CURRENT PHASE</div>
        <div className="site00-cpr-rail-card__value">{rail.currentPhase.label}</div>
        <div className="site00-cpr-rail-card__detail">{rail.currentPhase.detail}</div>
      </div>
      <div className="site00-cpr-rail-card">
        <div className="site00-cpr-rail-card__title">DELIVERABLES INCLUDED</div>
        <ul className="site00-cpr-checklist">
          {rail.deliverablesIncluded.map((item: string) => (
            <li key={item}>
              <ClientRoomCheckIcon size={14} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="site00-cpr-rail-card">
        <div className="site00-cpr-rail-card__title">UNREAD MESSAGES</div>
        <div className="site00-cpr-rail-card__value">{rail.unreadMessages}</div>
        <Link className="site00-cpr-panel__link" to={rail.messagesRoute}>
          Go to messages &gt;
        </Link>
      </div>
    </>
  );
}
