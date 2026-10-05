import { useState } from 'react';
import { useReaderAccount } from '../../hooks/useReaderAccount';
import { AvatarSelector } from '../components/AvatarSelector';
import { CustomAvatarPremiumPanel } from '../components/CustomAvatarPremiumPanel';

export default function ReaderAvatarPage() {
  const { profile, saveProfile } = useReaderAccount();
  const [selected, setSelected] = useState(profile.avatarId);

  return (
    <div className="aw-reader-page">
      <AvatarSelector
        selectedAvatarId={selected}
        onSelect={setSelected}
        onConfirm={() => saveProfile({ avatarId: selected })}
        previewPersonId={profile.readerId}
      />
      <CustomAvatarPremiumPanel
        entitlement={profile.customAvatarEntitlement}
        onPurchase={() => saveProfile({ customAvatarEntitlement: 'PURCHASED' })}
      />
    </div>
  );
}
