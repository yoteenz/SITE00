/**
 * Authority card — post-registration status using SKINS child-surface design.
 */

import { implementScreenAuthority } from './brandFamilySkinApi.js';
import { SkinAuthorityStatus } from '../designWorkspace/skins/SkinAuthorityStatus.js';

type AuthorityCard = {
  screenType: string;
  moduleId: string;
  viewport: string;
  version: string;
  authorityMode: string;
  fidelityMode: string;
  status: string;
  implementationStatus: string;
  visualMatchStatus: string;
  referenceAssetId: string | null;
};

type Props = {
  brandFamilySkinId: string;
  projectId: string;
  brandName?: string;
  screenNum?: string;
  screenLabel?: string;
  accentColor?: string | null;
  card: AuthorityCard;
  onImplement: () => void;
  onReplace: () => void;
  onViewAuthority?: () => void;
};

export function SkinScreenAuthorityCard({
  brandFamilySkinId,
  projectId,
  brandName = brandFamilySkinId,
  screenNum = '01',
  screenLabel,
  accentColor,
  card,
  onImplement,
  onReplace,
  onViewAuthority,
}: Props) {
  async function handleImplement() {
    await implementScreenAuthority({
      brandFamilySkinId,
      moduleId: card.moduleId,
      screenType: card.screenType,
      viewport: card.viewport as 'MOBILE' | 'DESKTOP' | 'TABLET',
      projectId,
    });
    onImplement();
  }

  const label = screenLabel ?? card.screenType.replace(/_/g, ' ');

  return (
    <div className="site00-dw-skins-card-wrap" data-panel="screen-authority-card">
      <SkinAuthorityStatus
        brandName={brandName.toUpperCase()}
        screenNum={screenNum}
        screenLabel={label.toUpperCase()}
        moduleId={card.moduleId}
        viewport={card.viewport}
        accentColor={accentColor}
        authorityMode={card.authorityMode}
        fidelityMode={card.fidelityMode}
        status={card.status}
        version={card.version}
        onImplement={() => void handleImplement()}
        onViewAuthority={onViewAuthority ?? (() => undefined)}
        onReplace={onReplace}
      />
    </div>
  );
}
