/**
 * ADD SCREEN AUTHORITY — cohesive SKINS child surface (not raw admin form).
 */

import { SKINS_SCREEN_SLOTS } from '../designWorkspace/useDesignSkinsState.js';
import { SkinAuthorityFlow } from '../designWorkspace/skins/SkinAuthorityFlow.js';
import { SCREEN_SLOT_PREFILL } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/screenSlotConfig.js';
import type { StandardScreenType } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/types.js';

type Props = {
  brandFamilySkinId: string;
  packScreenType: StandardScreenType;
  projectId: string;
  brandName?: string;
  accentColor?: string | null;
  onRegistered: () => void;
  onCancel: () => void;
  mode?: 'add' | 'replace';
};

export function SkinScreenAuthorityIngestion({
  brandFamilySkinId,
  packScreenType,
  projectId,
  brandName = brandFamilySkinId,
  accentColor,
  onRegistered,
  onCancel,
  mode = 'add',
}: Props) {
  const slotMeta = SKINS_SCREEN_SLOTS.find((s) => s.packScreenType === packScreenType);
  const screenLabel = SCREEN_SLOT_PREFILL[packScreenType]?.screenLabel ?? slotMeta?.shortLabel ?? packScreenType;

  return (
    <SkinAuthorityFlow
      open
      brandFamilySkinId={brandFamilySkinId}
      packScreenType={packScreenType}
      projectId={projectId}
      brandName={brandName.toUpperCase()}
      screenNum={slotMeta?.num ?? '01'}
      screenLabel={screenLabel.toUpperCase()}
      accentColor={accentColor}
      initialStep={mode === 'replace' ? 'replace' : 'add'}
      onClose={onCancel}
      onComplete={onRegistered}
    />
  );
}
