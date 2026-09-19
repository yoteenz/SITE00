/**
 * Post-registration authority success state.
 */

import { SkinContextHeader } from './SkinContextHeader.js';

type Props = {
  brandName: string;
  screenNum: string;
  screenLabel: string;
  moduleId?: string;
  viewport: string;
  accentColor?: string | null;
  previewUrl?: string | null;
  authorityMode: string;
  fidelityMode: string;
  status: string;
  version: string;
  onImplement: () => void;
  onViewAuthority: () => void;
  onReplace: () => void;
};

export function SkinAuthorityStatus({
  brandName,
  screenNum,
  screenLabel,
  moduleId,
  viewport,
  accentColor,
  previewUrl,
  authorityMode,
  fidelityMode,
  status,
  version,
  onImplement,
  onViewAuthority,
  onReplace,
}: Props) {
  return (
    <div className="site00-dw-skins-status">
      <SkinContextHeader
        brandName={brandName}
        screenNum={screenNum}
        screenLabel={screenLabel}
        moduleId={moduleId}
        viewport={viewport}
        accentColor={accentColor}
      />

      <div className="site00-dw-skins-status__hero">
        <div className="site00-dw-skins-status__thumb">
          {previewUrl ? <img src={previewUrl} alt="" /> : <span>REFERENCE</span>}
        </div>
        <div className="site00-dw-skins-status__badges">
          <span>{authorityMode.replace(/_/g, ' ')}</span>
          <span>{fidelityMode}</span>
          <span className="site00-dw-skins-status__approved">STATUS · {status}</span>
          <span>V{version}</span>
        </div>
      </div>

      <p className="site00-dw-skins-status__next">NEXT · IMPLEMENT SCREEN</p>

      <div className="site00-dw-skins-status__actions">
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onImplement}>
          IMPLEMENT
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewAuthority}>
          VIEW AUTHORITY
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onReplace}>
          REPLACE
        </button>
      </div>
    </div>
  );
}
