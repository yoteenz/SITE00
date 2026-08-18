type Site00LoaderCopyProps = {
  siteLabel: string;
  title: string;
  subtitle: string;
  tagline: string;
  footerMark: string;
  footerLabel: string;
  progress: number;
  progressLabel: string;
};

/** Centered vertical loader copy — reference-locked composition beneath hero platform. */
export function Site00LoaderCopy({
  siteLabel,
  title,
  subtitle,
  tagline,
  footerMark,
  footerLabel,
  progress,
  progressLabel,
}: Site00LoaderCopyProps) {
  const value = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="site00-loader-copy">
      <div className="site00-loader-copy__head">
        <p className="site00-loader-copy__eyebrow">{siteLabel}</p>
        <h1 className="site00-loader-copy__title">{title}</h1>
        <p className="site00-loader-copy__subtitle">{subtitle}</p>
      </div>

      <div className="site00-loader-copy__progress-group">
        <p className="site00-loader-copy__status">{progressLabel}</p>
        <div className="site00-loader-copy__progress-row">
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
          <span className="site00-loader-copy__pct">{value}%</span>
        </div>
      </div>

      <p className="site00-loader-copy__tagline">{tagline}</p>

      <div className="site00-loader-copy__signature">
        <span className="site00-loader-copy__mark" aria-hidden="true">
          {footerMark}
        </span>
        <span className="site00-loader-copy__signature-label">{footerLabel}</span>
      </div>
    </div>
  );
}
