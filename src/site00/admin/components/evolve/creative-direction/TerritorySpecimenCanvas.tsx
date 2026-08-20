/** SVG visual proof renderer for Creative Direction specimens */

type SpecimenProps = {
  specimenType: string;
  palette: Record<string, string>;
  displayFont: string;
  territoryName: string;
  index: number;
};

export function TerritorySpecimenCanvas({ specimenType, palette, displayFont, territoryName, index }: SpecimenProps) {
  const primary = palette.primary ?? '#0A0A0B';
  const secondary = palette.secondary ?? '#F4F4F5';
  const accent = palette.accent ?? '#C41E3A';

  if (specimenType === 'social_916') {
    return (
      <svg viewBox="0 0 108 192" className="site00-cd-specimen__svg" aria-label={`${territoryName} social specimen`}>
        <rect width="108" height="192" fill={primary} />
        <rect x="8" y="8" width="4" height="176" fill={accent} opacity="0.8" />
        <text x="18" y="28" fill={secondary} fontSize="6" fontFamily="monospace">PAGE 001</text>
        <text x="18" y="48" fill={secondary} fontSize="8" fontWeight="700">{displayFont.slice(0, 12)}</text>
        <text x="18" y="62" fill={secondary} fontSize="5" opacity="0.8">CREDIT SCORE / DEBT</text>
        <rect x="18" y="140" width="72" height="20" fill={accent} opacity="0.25" />
        <text x="22" y="153" fill={accent} fontSize="5">ndxbook</text>
      </svg>
    );
  }

  if (specimenType === 'wordmark') {
    return (
      <svg viewBox="0 0 200 60" className="site00-cd-specimen__svg" aria-label={`${territoryName} wordmark`}>
        <rect width="200" height="60" fill={secondary} />
        <text x="16" y="38" fill={primary} fontSize="22" fontWeight="800" letterSpacing="4">NDXBOOK</text>
        <text x="16" y="52" fill={accent} fontSize="6" letterSpacing="2">DIRECTION 0{index}</text>
      </svg>
    );
  }

  if (specimenType === 'color_material') {
    return (
      <svg viewBox="0 0 200 80" className="site00-cd-specimen__svg" aria-label={`${territoryName} color specimen`}>
        <rect x="0" y="10" width="60" height="60" fill={primary} />
        <rect x="70" y="10" width="60" height="60" fill={secondary} stroke={primary} strokeWidth="0.5" />
        <rect x="140" y="10" width="50" height="60" fill={accent} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 100" className="site00-cd-specimen__svg" aria-label={`${territoryName} ${specimenType}`}>
      <rect width="200" height="100" fill={secondary} />
      <rect x="12" y="12" width="176" height="76" fill="none" stroke={primary} strokeWidth="0.75" />
      <text x="20" y="32" fill={primary} fontSize="7" fontWeight="700">{specimenType.replace(/_/g, ' ').toUpperCase()}</text>
      <text x="20" y="48" fill={primary} fontSize="5" opacity="0.7">{territoryName}</text>
      <circle cx="170" cy="30" r="8" fill={accent} opacity="0.6" />
    </svg>
  );
}
