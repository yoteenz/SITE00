/**
 * Compact context strip for SKINS child surfaces.
 */

type Props = {
  brandName: string;
  screenNum: string;
  screenLabel: string;
  moduleId?: string;
  viewport: string;
  accentColor?: string | null;
};

export function SkinContextHeader({ brandName, screenNum, screenLabel, moduleId, viewport, accentColor }: Props) {
  return (
    <div className="site00-dw-skins-ctx" style={accentColor ? { ['--skins-ctx-accent' as string]: accentColor } : undefined}>
      <div className="site00-dw-skins-ctx__brand">
        <span className="site00-dw-skins-ctx__dot" aria-hidden />
        <strong>{brandName}</strong>
      </div>
      <div className="site00-dw-skins-ctx__chips">
        {moduleId ? <span className="site00-dw-skins-ctx__chip">{moduleId}</span> : null}
        <span className="site00-dw-skins-ctx__chip">
          {screenNum} {screenLabel}
        </span>
        <span className="site00-dw-skins-ctx__chip site00-dw-skins-ctx__chip--accent">{viewport}</span>
      </div>
    </div>
  );
}
