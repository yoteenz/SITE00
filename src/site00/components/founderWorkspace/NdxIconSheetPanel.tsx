import { NDXIcon } from '../../icons/ndx';
import {
  NDX_ICON_NAMES,
  NDX_ICON_SIZE_TOKENS,
  NDX_ICON_VIEWBOX,
  getIconReferenceSample,
  evaluateIconVisualMatch,
  getReferenceTracedRegistryEntry,
  NDX_ICON_VISUAL_REFERENCE_AUTHORITY,
} from '../../../../shared/site00-studio-world-ui/icons/index.js';

function cropUrl(iconName: string): string {
  return `/visual-references/founder/ndxbook/icon-crops/${iconName}.png`;
}

export function NdxIconSheetPanel() {
  return (
    <section className="site00-fws-icon-sheet" data-visual-reconstruction="ndx-icon-sheet-p0ui3a">
      <header className="site00-fws-icon-sheet__head">
        <h2>NDX ICON SYSTEM · P0.UI.3A</h2>
        <p>
          Reference-traced SVG registry — authority: {NDX_ICON_VISUAL_REFERENCE_AUTHORITY.sourceReferenceId}. Compare
          reference crop vs rendered SVG at 16 / 20 / 24px.
        </p>
      </header>
      <div className="site00-fws-icon-sheet__grid">
        {NDX_ICON_NAMES.map((name) => {
          const sample = getIconReferenceSample(name);
          const entry = getReferenceTracedRegistryEntry(name);
          const evaluation = evaluateIconVisualMatch(entry.trace);
          return (
            <article key={name} className="site00-fws-icon-sheet__card">
              <h3>{name.replace(/_/g, ' ').toUpperCase()}</h3>
              <p className="site00-fws-icon-sheet__meta">
                {entry.trace.classification} · {evaluation.status} · score {(evaluation.overallScore * 100).toFixed(0)}%
              </p>
              <div className="site00-fws-icon-sheet__compare">
                <div className="site00-fws-icon-sheet__cell">
                  <span className="site00-fws-icon-sheet__meta">REFERENCE</span>
                  {sample ? (
                    <img
                      src={cropUrl(name)}
                      alt={`${name} reference crop`}
                      className="site00-fws-icon-sheet__ref"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <span className="site00-fws-icon-sheet__meta">N/A</span>
                  )}
                </div>
                <div className="site00-fws-icon-sheet__cell site00-fws-icon-sheet__cell--overlay">
                  <span className="site00-fws-icon-sheet__meta">OVERLAY · 20</span>
                  <div className="site00-fws-icon-sheet__overlay">
                    {sample ? (
                      <img src={cropUrl(name)} alt="" className="site00-fws-icon-sheet__ref site00-fws-icon-sheet__ref--ghost" />
                    ) : null}
                    <NDXIcon name={name} size={NDX_ICON_SIZE_TOKENS.md} state="inactive" decorative />
                  </div>
                </div>
              </div>
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
              <p className="site00-fws-icon-sheet__meta">
                viewBox {NDX_ICON_VIEWBOX}×{NDX_ICON_VIEWBOX} · v{entry.trace.visualVersion}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
