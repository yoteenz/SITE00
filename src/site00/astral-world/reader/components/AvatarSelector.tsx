import { useEffect, useState } from 'react';
import type { CanonicalAvatarRecord } from '../../../../../shared/site00-astral-world/readerAccount/types.js';
import { listApprovedLibraryAvatars } from '../../../../../shared/site00-astral-world/readerAccount/avatarLibraryManifest.js';
import { AstralPortrait } from '../../components/immersive/AstralPortrait';

type AvatarLibraryResponse = {
  ok: boolean;
  manifest: string;
  librarySize: number;
  avatars: CanonicalAvatarRecord[];
  preloaded: boolean;
};

type AvatarSelectorProps = {
  selectedAvatarId: string | null;
  onSelect: (avatarId: string) => void;
  onConfirm: () => void;
  previewPersonId?: string;
};

/** Immersive curated avatar picker — library preloaded, no FAL on open */
export function AvatarSelector({ selectedAvatarId, onSelect, onConfirm, previewPersonId }: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<CanonicalAvatarRecord[]>(() => listApprovedLibraryAvatars());

  useEffect(() => {
    void fetch('/api/site00/astral-world-avatar-library?approved=1')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AvatarLibraryResponse | null) => {
        if (data?.avatars?.length) {
          setAvatars(data.avatars as CanonicalAvatarRecord[]);
        }
      })
      .catch(() => {
        /* local manifest fallback already loaded */
      });
  }, []);

  const selected = avatars.find((a) => a.avatarId === selectedAvatarId) ?? avatars[0];

  return (
    <div className="aw-reader-avatar-selector">
      <header className="aw-reader-avatar-selector__header">
        <p className="aw-label">Choose from the world</p>
        <h2 className="aw-display aw-display--section">Choose Your Astral Self</h2>
        <p className="aw-muted">Canonical inhabitants of Astral World — not stock photos.</p>
      </header>

      <div className="aw-reader-avatar-selector__preview">
        {selected ? (
          <>
            <AstralPortrait
              personId={previewPersonId ?? 'reader-preview'}
              avatarId={selected.avatarId}
              name={selected.displayLabel}
              size={96}
              showPresence
              variant="reader"
            />
            <p className="aw-display">{selected.displayLabel}</p>
            <p className="aw-muted aw-reader-avatar-selector__id">{selected.avatarId}</p>
          </>
        ) : null}
      </div>

      <div className="aw-reader-avatar-grid" role="listbox" aria-label="Curated avatars">
        {avatars.map((avatar) => (
          <button
            key={avatar.avatarId}
            type="button"
            role="option"
            aria-selected={selectedAvatarId === avatar.avatarId}
            className={`aw-reader-avatar-tile${selectedAvatarId === avatar.avatarId ? ' aw-reader-avatar-tile--selected' : ''}`}
            onClick={() => onSelect(avatar.avatarId)}
          >
            <AstralPortrait
              personId={avatar.avatarId}
              avatarId={avatar.avatarId}
              name={avatar.displayLabel}
              size={56}
              variant="reader"
            />
            <span className="aw-reader-avatar-tile__label">{avatar.displayLabel}</span>
          </button>
        ))}
      </div>

      <button type="button" className="aw-btn-primary aw-reader-avatar-selector__confirm" onClick={onConfirm} disabled={!selectedAvatarId}>
        Confirm Astral Self
      </button>
    </div>
  );
}
