type Site00LoaderStatusProps = {
  siteLabel: string;
  experienceTitle: string;
  experienceSubtitle: string;
  statusLabel: string;
  tagline: string;
  footerMark: string;
  footerLabel: string;
};

export function Site00LoaderStatus({
  siteLabel,
  experienceTitle,
  experienceSubtitle,
  statusLabel,
  tagline,
  footerMark,
  footerLabel,
}: Site00LoaderStatusProps) {
  return (
    <div className="site00-loader-status">
      <p className="site00-loader-status__site">{siteLabel}</p>
      <h1 className="site00-loader-status__title">{experienceTitle}</h1>
      <p className="site00-loader-status__subtitle">{experienceSubtitle}</p>
      <p className="site00-loader-status__stage">{statusLabel}</p>
      <p className="site00-loader-status__tagline">{tagline}</p>
      <div className="site00-loader-status__footer">
        <span className="site00-loader-status__mark">{footerMark}</span>
        <span className="site00-loader-status__footer-label">{footerLabel}</span>
      </div>
    </div>
  );
}
