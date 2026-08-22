import { IDNTY_CONTROL_CENTER_STATUS_RAIL } from '../../../config/idnty-control-center';
import type { IdntySystemStatusItem } from '../../../hooks/useIdntyControlCenterMeta';

type IdntySystemStatusRailProps = {
  items: IdntySystemStatusItem[];
};

export function IdntySystemStatusRail({ items }: IdntySystemStatusRailProps) {
  return (
    <section className="site00-idnty-control-status" aria-label={IDNTY_CONTROL_CENTER_STATUS_RAIL.label}>
      <p className="site00-idnty-control-status__label">{IDNTY_CONTROL_CENTER_STATUS_RAIL.label}</p>
      <div className="site00-idnty-control-status__rail" role="list">
        {items.map((item, index) => (
          <div key={item.label} className="site00-idnty-control-status__cell" role="listitem">
            {index > 0 ? <span className="site00-idnty-control-status__divider" aria-hidden="true" /> : null}
            <span
              className={`site00-idnty-control-status__node site00-idnty-control-status__node--${item.state}`.trim()}
              aria-hidden="true"
            />
            <span className="site00-idnty-control-status__name">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
