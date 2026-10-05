/**
 * Visual version history for screen authorities.
 */

export type AuthorityVersion = {
  version: string;
  viewport: string;
  status: string;
  date: string;
  thumbnailUrl?: string | null;
  isCurrent?: boolean;
  onView?: () => void;
  onRestore?: () => void;
};

type Props = {
  versions: AuthorityVersion[];
};

export function SkinVersionTimeline({ versions }: Props) {
  return (
    <div className="site00-dw-skins-versions">
      <strong>VERSION HISTORY</strong>
      <ol className="site00-dw-skins-versions__list">
        {versions.map((v) => (
          <li key={v.version} className={v.isCurrent ? 'is-current' : ''}>
            <div className="site00-dw-skins-versions__thumb">
              {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" /> : <span>V{v.version}</span>}
            </div>
            <div className="site00-dw-skins-versions__meta">
              <strong>V{v.version}</strong>
              <span>{v.viewport}</span>
              <span>{v.status}</span>
              <time>{v.date}</time>
            </div>
            <div className="site00-dw-skins-versions__actions">
              {v.onView ? (
                <button type="button" onClick={v.onView}>
                  VIEW
                </button>
              ) : null}
              {v.onRestore ? (
                <button type="button" onClick={v.onRestore}>
                  RESTORE
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
