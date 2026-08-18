import { LoaderRegion } from './LoaderRegion';

type LoaderCopyRegionsProps = {
  siteLabel: string;
  title: string;
  subtitle: string;
  tagline: string;
  footerMark: string;
  footerLabel: string;
  progress: number;
  progressLabel: string;
};

/** Copy + progress + signature — each element in its mapped reference region. */
export function LoaderCopyRegions({
  siteLabel,
  title,
  subtitle,
  tagline,
  footerMark,
  footerLabel,
  progress,
  progressLabel,
}: LoaderCopyRegionsProps) {
  const value = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <>
      <LoaderRegion id="copy.eyebrow" className="site00-loader-copy-region site00-loader-copy-region--eyebrow">
        <p className="site00-loader-copy__eyebrow">{siteLabel}</p>
      </LoaderRegion>

      <LoaderRegion id="copy.title" className="site00-loader-copy-region site00-loader-copy-region--title">
        <h1 className="site00-loader-copy__title">{title}</h1>
      </LoaderRegion>

      <LoaderRegion id="copy.subtitle" className="site00-loader-copy-region site00-loader-copy-region--subtitle">
        <p className="site00-loader-copy__subtitle">{subtitle}</p>
      </LoaderRegion>

      <LoaderRegion id="copy.status" className="site00-loader-copy-region site00-loader-copy-region--status">
        <p className="site00-loader-copy__status">{progressLabel}</p>
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

      <LoaderRegion id="copy.tagline" className="site00-loader-copy-region site00-loader-copy-region--tagline">
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

      <LoaderRegion id="copy.signature" className="site00-loader-copy-region site00-loader-copy-region--signature">
        <div className="site00-loader-copy__signature">
          <span className="site00-loader-copy__mark" aria-hidden="true">
            {footerMark}
          </span>
          <span className="site00-loader-copy__signature-label">{footerLabel}</span>
        </div>
      </LoaderRegion>
    </>
  );
}
