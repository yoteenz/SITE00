import { NDXIcon } from '../../icons/ndx';
import {
  NDX_ICON_NAMES,
  NDX_ICON_SIZE_TOKENS,
  NDX_ICON_VIEWBOX,
} from '../../../../shared/site00-studio-world-ui/icons/index.js';

export function NdxIconSheetPanel() {
  return (
    <section className="site00-fws-icon-sheet" data-visual-reconstruction="ndx-icon-sheet">
      <header className="site00-fws-icon-sheet__head">
        <h2>NDX ICON SYSTEM · P0.UI.3</h2>
        <p>Canonical SVG registry — inactive graphite / active project lime via CSS tokens.</p>
      </header>
      <div className="site00-fws-icon-sheet__grid">
        {NDX_ICON_NAMES.map((name) => (
          <article key={name} className="site00-fws-icon-sheet__card">
            <h3>{name.replace(/_/g, ' ').toUpperCase()}</h3>
            <div className="site00-fws-icon-sheet__row">
              <div className="site00-fws-icon-sheet__cell">
                <span className="site00-fws-icon-sheet__meta">INACTIVE · 16</span>
                <NDXIcon name={name} size={NDX_ICON_SIZE_TOKENS.sm} state="inactive" decorative />
              </div>
              <div className="site00-fws-icon-sheet__cell site00-fws-icon-sheet__cell--active">
                <span className="site00-fws-icon-sheet__meta">ACTIVE · 20</span>
                <NDXIcon name={name} size={NDX_ICON_SIZE_TOKENS.md} state="active" decorative />
              </div>
              <div className="site00-fws-icon-sheet__cell">
                <span className="site00-fws-icon-sheet__meta">24</span>
                <NDXIcon name={name} size={NDX_ICON_SIZE_TOKENS.lg} state="inactive" decorative />
              </div>
            </div>
            <p className="site00-fws-icon-sheet__meta">viewBox {NDX_ICON_VIEWBOX}×{NDX_ICON_VIEWBOX}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
