import { LoaderRegion } from './LoaderRegion';
import { LoaderAssemblingStatus } from './LoaderAssemblingStatus';
import { resolveSite00LoaderFooterMarkUrl } from './site00LoaderMedia';

const LOADER_FOOTER_MARK_URL = resolveSite00LoaderFooterMarkUrl();

type LoaderCopyRegionsProps = {
  siteLabel: string;
  title: string;
  subtitle: string;
  tagline: string;
  footerLabel: string;
  progress: number;
  progressLabel: string;
  assemblingActive?: boolean;
};

/** Copy + progress + signature — each element in its mapped reference region. */
export function LoaderCopyRegions({
  siteLabel,
  title,
  subtitle,
  tagline,
  footerLabel,
  progress,
  progressLabel,
  assemblingActive = false,
}: LoaderCopyRegionsProps) {
  const value = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <>
      <LoaderRegion id="copy.eyebrow" className="site00-loader-copy-region site00-loader-copy-region--eyebrow" allowOverflow>
        <p className="site00-loader-copy__eyebrow">{siteLabel}</p>
      </LoaderRegion>

      <LoaderRegion id="copy.title" className="site00-loader-copy-region site00-loader-copy-region--title" allowOverflow>
        <h1 className="site00-loader-copy__title">{title}</h1>
      </LoaderRegion>

      <LoaderRegion id="copy.subtitle" className="site00-loader-copy-region site00-loader-copy-region--subtitle" allowOverflow>
        <p className="site00-loader-copy__subtitle">{subtitle}</p>
      </LoaderRegion>

      <LoaderRegion id="copy.status" className="site00-loader-copy-region site00-loader-copy-region--status" allowOverflow>
        <LoaderAssemblingStatus active={assemblingActive} label={progressLabel} />
      </LoaderRegion>

      <LoaderRegion id="copy.progressTrack" className="site00-loader-copy-region site00-loader-copy-region--progress-track">
        <div
          className="site00-loader-copy__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-label={`${value}% complete`}
        >
          <div className="site00-loader-copy__fill" style={{ width: `${value}%` }} />
        </div>
      </LoaderRegion>

      <LoaderRegion id="copy.progressPct" className="site00-loader-copy-region site00-loader-copy-region--progress-pct">
        <span className="site00-loader-copy__pct">{value}%</span>
      </LoaderRegion>

      <LoaderRegion id="copy.tagline" className="site00-loader-copy-region site00-loader-copy-region--tagline" allowOverflow>
        <div className="site00-loader-copy__tagline-group">
          <span className="site00-loader-copy__tagline-plus" aria-hidden="true">
            +
          </span>
          <p className="site00-loader-copy__tagline">{tagline}</p>
          <span className="site00-loader-copy__tagline-plus" aria-hidden="true">
            +
          </span>
        </div>
      </LoaderRegion>

      <LoaderRegion id="copy.signature" className="site00-loader-copy-region site00-loader-copy-region--signature" allowOverflow>
        <div className="site00-loader-copy__signature">
          <img
            src={LOADER_FOOTER_MARK_URL}
            alt=""
            className="site00-loader-copy__mark-img"
            aria-hidden="true"
            decoding="async"
          />
          <span className="site00-loader-copy__signature-label">{footerLabel}</span>
        </div>
      </LoaderRegion>
    </>
  );
}
