import { Link } from 'react-router-dom';
import type { ActiveBuild, AttentionItem, NowItem, QuickLaunchItem, SignalItem, UpNextItem } from '../../config/seed/site00-ecosystem-seed';

type CtrlRoomCommandCenterProps = {
  now: NowItem[];
  activeBuilds: ActiveBuild[];
  attention: AttentionItem[];
  recentSignals: SignalItem[];
  upNext: UpNextItem[];
  quickLaunch: QuickLaunchItem[];
  allClear: boolean;
};

export function CtrlRoomCommandCenter({
  now,
  activeBuilds,
  attention,
  recentSignals,
  upNext,
  quickLaunch,
  allClear,
}: CtrlRoomCommandCenterProps) {
  return (
    <div className="site00-ctrl-command">
      <div className="site00-ctrl-command__grid">
        <section className="site00-eco-panel site00-eco-panel--now" aria-labelledby="ctrl-now-heading">
          <h2 id="ctrl-now-heading" className="site00-eco-panel__title">
            NOW
          </h2>
          {allClear ? (
            <p className="site00-eco-panel__quiet">ALL CLEAR. No actions currently require your attention.</p>
          ) : (
            <ul className="site00-eco-list site00-eco-list--now">
              {now.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <Link to={item.href} className="site00-eco-list__link">
                      + {item.label}
                    </Link>
                  ) : (
                    <span>+ {item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="site00-eco-panel" aria-labelledby="ctrl-builds-heading">
          <h2 id="ctrl-builds-heading" className="site00-eco-panel__title">
            ACTIVE BUILDS
          </h2>
          {activeBuilds.length === 0 ? (
            <p className="site00-eco-panel__quiet">No active builds.</p>
          ) : (
            <ul className="site00-eco-builds">
              {activeBuilds.map((build) => (
                <li key={build.id}>
                  <Link to={build.href} className="site00-eco-builds__row">
                    <div className="site00-eco-builds__meta">
                      <span className="site00-eco-builds__name">{build.name}</span>
                      <span className="site00-eco-builds__stage">{build.stage}</span>
                    </div>
                    <div className="site00-eco-builds__progress" aria-label={`${build.progress}% complete`}>
                      <div className="site00-eco-builds__bar" style={{ width: `${build.progress}%` }} />
                      <span className="site00-eco-builds__pct">{build.progress}%</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="site00-eco-panel site00-eco-panel--attention" aria-labelledby="ctrl-attention-heading">
          <h2 id="ctrl-attention-heading" className="site00-eco-panel__title">
            NEEDS YOUR ATTENTION
          </h2>
          {attention.length === 0 ? (
            <p className="site00-eco-panel__quiet">Nothing urgent right now.</p>
          ) : (
            <ul className="site00-eco-attention">
              {attention.map((item) => (
                <li key={item.id}>
                  <Link to={item.href} className="site00-eco-attention__row">
                    {item.urgent ? <span className="site00-eco-attention__dot" aria-hidden="true" /> : null}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="site00-eco-panel" aria-labelledby="ctrl-signals-heading">
          <h2 id="ctrl-signals-heading" className="site00-eco-panel__title">
            RECENT SIGNALS
          </h2>
          {recentSignals.length === 0 ? (
            <p className="site00-eco-panel__quiet">No recent activity.</p>
          ) : (
            <ul className="site00-eco-signals">
              {recentSignals.map((signal) => (
                <li key={signal.id} className="site00-eco-signals__row">
                  <span className="site00-eco-signals__msg">{signal.message}</span>
                  <span className="site00-eco-signals__time">{signal.timeAgo}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="site00-eco-panel" aria-labelledby="ctrl-upnext-heading">
          <h2 id="ctrl-upnext-heading" className="site00-eco-panel__title">
            UP NEXT
          </h2>
          <ul className="site00-eco-timeline">
            {upNext.map((item) => (
              <li key={item.id} className="site00-eco-timeline__row">
                <span className="site00-eco-timeline__dot" aria-hidden="true" />
                <div>
                  <p className="site00-eco-timeline__label">{item.label}</p>
                  <p className="site00-eco-timeline__date">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="site00-eco-panel site00-eco-panel--launch" aria-labelledby="ctrl-launch-heading">
          <h2 id="ctrl-launch-heading" className="site00-eco-panel__title">
            QUICK LAUNCH
          </h2>
          <div className="site00-eco-quick-launch">
            {quickLaunch.map((item) => (
              <Link key={item.id} to={item.href} className="site00-eco-quick-launch__btn">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
