type Site00LoaderConstructionProps = {
  size?: 'sm' | 'md' | 'lg';
  reducedMotion?: boolean;
};

/** Red geometric assembly — builds upward from foundation (SITE 00 loader mark). */
export function Site00LoaderConstruction({ size = 'md', reducedMotion = false }: Site00LoaderConstructionProps) {
  const dim = size === 'sm' ? 48 : size === 'lg' ? 96 : 72;
  const cls = [
    'site00-loader-construction',
    reducedMotion ? 'site00-loader-construction--static' : '',
    size !== 'md' ? `site00-loader-construction--${size}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      className={cls}
      width={dim}
      height={Math.round(dim * 1.2)}
      viewBox="0 0 80 96"
      fill="none"
      aria-hidden="true"
    >
      <line className="site00-loader-construction__foundation" x1="10" y1="86" x2="70" y2="86" stroke="currentColor" strokeWidth="1.5" />
      <line className="site00-loader-construction__v site00-loader-construction__v--1" x1="22" y1="86" x2="22" y2="54" stroke="currentColor" strokeWidth="1.25" />
      <line className="site00-loader-construction__v site00-loader-construction__v--2" x1="40" y1="86" x2="40" y2="38" stroke="currentColor" strokeWidth="1.25" />
      <line className="site00-loader-construction__v site00-loader-construction__v--3" x1="58" y1="86" x2="58" y2="54" stroke="currentColor" strokeWidth="1.25" />
      <line className="site00-loader-construction__h site00-loader-construction__h--1" x1="22" y1="54" x2="58" y2="54" stroke="currentColor" strokeWidth="1" />
      <line className="site00-loader-construction__h site00-loader-construction__h--2" x1="30" y1="38" x2="50" y2="38" stroke="currentColor" strokeWidth="1" />
      <line className="site00-loader-construction__cap" x1="30" y1="24" x2="50" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <circle className="site00-loader-construction__node site00-loader-construction__node--1" cx="22" cy="54" r="2.5" fill="currentColor" />
      <circle className="site00-loader-construction__node site00-loader-construction__node--2" cx="40" cy="38" r="2.5" fill="currentColor" />
      <circle className="site00-loader-construction__node site00-loader-construction__node--3" cx="58" cy="54" r="2.5" fill="currentColor" />
      <circle className="site00-loader-construction__node site00-loader-construction__node--4" cx="40" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}
